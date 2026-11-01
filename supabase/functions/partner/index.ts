// Supabase Edge Function „partner“: Partner-Programm.
// • Admin:   { aktion: 'partner-anlegen', mail, name, firma, telefon, region }  → Partner-Konto mit Startpasswort
// • Partner: { aktion: 'kind-anlegen', vorname, stufe, paket, eltern_mail, eltern_name } → 1 Kredit wird verbraucht
// • Partner: { aktion: 'zugang-neu', kind } → neues Passwort für ein eigenes Kind
// SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY stellt Supabase bereit; RESEND_API_KEY (optional) für E-Mails.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const WOERTER = ['stern', 'sonne', 'mond', 'blitz', 'perle', 'krone', 'tiger', 'adler', 'welle', 'rakete']
const passwort = () => WOERTER[Math.floor(Math.random() * WOERTER.length)] + (10 + Math.floor(Math.random() * 90))
const langesPasswort = () => crypto.randomUUID().replace(/-/g, '').slice(0, 14)
const basis = (n: string) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '') || 'kind'
const PAKET_NAME: Record<string, string> = { basic: 'Basic', plus: 'Plus', premium: 'Premium' }
const APP = Deno.env.get('APP_URL') ?? 'https://brainfitkids.mentalmath.at'

// deno-lint-ignore no-explicit-any
type DB = any
const db: DB = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

async function nutzerMitMail(mail: string) {
  for (let seite = 1; seite <= 20; seite++) {
    const { data: l } = await db.auth.admin.listUsers({ page: seite, perPage: 200 })
    const u = l?.users.find((x: { email?: string }) => x.email?.toLowerCase() === mail.toLowerCase())
    if (u) return u.id as string
    if (!l || l.users.length < 200) break
  }
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const { data: { user } } = await db.auth.getUser(token)
    if (!user) return antwort({ fehler: 'Bitte anmelden.' }, 401)
    const { data: ich } = await db.from('personen').select('rolle').eq('id', user.id).maybeSingle()
    const body = await req.json()

    if (body.aktion === 'partner-anlegen') {
      if (ich?.rolle !== 'admin') return antwort({ fehler: 'Nur für Admins' }, 403)
      return antwort(await partnerAnlegen(body))
    }
    if (ich?.rolle !== 'partner') return antwort({ fehler: 'Nur für Partner' }, 403)
    const { data: p } = await db.from('partner').select('aktiv, firma, name').eq('id', user.id).maybeSingle()
    if (!p?.aktiv) return antwort({ fehler: 'Ihr Partner-Konto ist nicht aktiv. Bitte melden Sie sich bei info@mentalmath.at.' }, 403)
    if (body.aktion === 'kind-anlegen') return antwort(await kindAnlegen(user.id, p.firma || p.name, body))
    if (body.aktion === 'zugang-neu') return antwort(await zugangNeu(user.id, body.kind))
    return antwort({ fehler: 'Unbekannte Aktion' }, 400)
  } catch (e) {
    return antwort({ fehler: String((e as Error).message ?? e) }, 500)
  }
})

async function partnerAnlegen(b: Record<string, string>) {
  const mail = String(b.mail ?? '').trim().toLowerCase()
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return { fehler: 'Bitte eine gültige E-Mail eingeben.' }
  const pw = langesPasswort()
  let id = await nutzerMitMail(mail)
  if (id) {
    const { data: schon } = await db.from('partner').select('id').eq('id', id).maybeSingle()
    if (schon) return { fehler: 'Diesen Partner gibt es schon.' }
    const { data: rolle } = await db.from('personen').select('rolle').eq('id', id).maybeSingle()
    if (rolle && rolle.rolle !== 'eltern') return { fehler: `Diese E-Mail gehört schon zu einem Konto (${rolle.rolle}).` }
    await db.auth.admin.updateUserById(id, { password: pw })
    await db.from('personen').upsert({ id, rolle: 'partner', name: b.name ?? '' })
  } else {
    const { data: neu, error } = await db.auth.admin.createUser({ email: mail, password: pw, email_confirm: true })
    if (error) throw error
    id = neu.user.id as string
    await db.from('personen').insert({ id, rolle: 'partner', name: b.name ?? '' })
  }
  await db.from('partner').insert({ id, mail, name: b.name ?? '', firma: b.firma ?? '', telefon: b.telefon ?? '', region: b.region ?? '' })
  return { id, mail, passwort: pw }
}

async function kindAnlegen(partnerId: string, partnerName: string, b: Record<string, unknown>) {
  const vorname = String(b.vorname ?? '').trim()
  const paket = String(b.paket ?? '')
  const elternMail = String(b.eltern_mail ?? '').trim().toLowerCase()
  const stufe = b.stufe === null || b.stufe === '' || b.stufe === undefined ? null : Number(b.stufe)
  if (!vorname) return { fehler: 'Vorname fehlt.' }
  if (!PAKET_NAME[paket]) return { fehler: 'Bitte ein Paket wählen.' }
  if (elternMail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(elternMail)) return { fehler: 'Die E-Mail der Eltern ist ungültig.' }

  // passendes Kontingent: gültig, noch frei, das am frühesten ablaufende zuerst
  const { data: lose } = await db.from('partner_kredite').select('id, anzahl, gueltig_bis').eq('partner', partnerId).eq('paket', paket)
    .gt('gueltig_bis', new Date().toISOString()).order('gueltig_bis')
  let los: number | null = null
  for (const l of lose ?? []) {
    const { count } = await db.from('kinder').select('id', { count: 'exact', head: true }).eq('kredit', l.id)
    if ((count ?? 0) < l.anzahl) { los = l.id; break }
  }
  if (!los) return { fehler: `Keine freien ${PAKET_NAME[paket]}-Kredite mehr. Bitte neue Kredite bestellen.` }

  // freier Benutzername: lena, lena2 …
  const b0 = basis(vorname)
  const { data: belegt } = await db.from('kinder').select('benutzer').like('benutzer', `${b0}%`)
  const vorhanden = new Set((belegt ?? []).map((x: { benutzer: string }) => x.benutzer))
  let benutzer = b0, i = 2
  while (vorhanden.has(benutzer)) benutzer = `${b0}${i++}`
  const pw = passwort()

  const { data: neu, error } = await db.auth.admin.createUser({ email: `${benutzer}@kinder.brainfit-kids.at`, password: pw, email_confirm: true })
  if (error) throw error
  const id = neu.user.id as string
  const bis = new Date(Date.now() + 365 * 864e5).toISOString()
  await db.from('personen').insert({ id, rolle: 'kind', name: vorname })
  await db.from('kinder').insert({ id, benutzer, vorname, stufe, paket, gueltig_bis: bis, partner: partnerId, kredit: los, eltern_mail: elternMail || null })
  await db.from('konten').insert({ kind: id })
  const { data: start } = await db.from('shop_artikel').select('id').eq('start', true)
  if (start?.length) await db.from('besitz').insert(start.map((a: { id: string }) => ({ kind: id, artikel: a.id })))

  // Sicherheitsnetz: zwei gleichzeitige Anlagen könnten dasselbe letzte Kontingent nehmen
  const { count: jetzt } = await db.from('kinder').select('id', { count: 'exact', head: true }).eq('kredit', los)
  const { data: lo } = await db.from('partner_kredite').select('anzahl').eq('id', los).single()
  if ((jetzt ?? 0) > lo.anzahl) {
    await db.auth.admin.deleteUser(id)
    return { fehler: 'Das Kontingent war gerade aufgebraucht. Bitte noch einmal versuchen.' }
  }

  // Eltern-Konto: vorhandenes Konto verknüpfen oder neu anlegen; Passwort legen die Eltern über einen Link selbst fest
  let elternLink = ''
  if (elternMail) {
    let elternId = await nutzerMitMail(elternMail)
    const neuesKonto = !elternId
    if (!elternId) {
      const { data: e } = await db.auth.admin.createUser({ email: elternMail, password: langesPasswort(), email_confirm: true })
      elternId = e?.user?.id ?? null
    }
    if (elternId) {
      await db.from('personen').upsert({ id: elternId, rolle: 'eltern', name: String(b.eltern_name ?? '').trim() }, { onConflict: 'id', ignoreDuplicates: true })
      await db.from('kinder').update({ eltern: elternId }).eq('id', id)
      const { data: l } = !neuesKonto ? { data: null } : await db.auth.admin.generateLink({ type: 'recovery', email: elternMail, options: { redirectTo: `${APP}/app/` } })
      elternLink = l?.properties?.action_link ?? ''
    }
  }
  let mail = false
  if (elternMail && Deno.env.get('RESEND_API_KEY')) {
    mail = await zugangsMail(elternMail, String(b.eltern_name ?? '').trim(), vorname, benutzer, pw, PAKET_NAME[paket], partnerName, elternLink).then(() => true).catch((e) => { console.error('Mail:', e); return false })
  }
  return { id, benutzer, passwort: pw, bis, mail }
}

async function zugangNeu(partnerId: string, kind: string) {
  const { data: k } = await db.from('kinder').select('id, benutzer, vorname').eq('id', kind).eq('partner', partnerId).maybeSingle()
  if (!k) return { fehler: 'Kind nicht gefunden.' }
  const pw = passwort()
  await db.auth.admin.updateUserById(k.id, { password: pw })
  return { benutzer: k.benutzer, passwort: pw }
}

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

async function zugangsMail(an: string, eltern: string, kind: string, benutzer: string, pw: string, paket: string, partner: string, link: string) {
  const von = Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>'
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#231A4F">
    <p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="240" style="max-width:240px;height:auto"></p>
    <h1 style="color:#5B47D6">Willkommen bei BrainFit Kids!</h1>
    <p>Hallo ${esc(eltern || 'liebe Eltern')},</p>
    <p>${esc(partner)} hat für <b>${esc(kind)}</b> einen Zugang zu BrainFit Kids (${esc(paket)}, 12 Monate) eingerichtet. Hier sind die Zugangsdaten:</p>
    <table style="border-collapse:collapse;margin:16px 0"><tr><td style="padding:8px 16px;background:#F2F0FF;border-radius:8px">Benutzername</td><td style="padding:8px 16px"><b style="font-size:20px">${esc(benutzer)}</b></td></tr>
    <tr><td style="padding:8px 16px;background:#F2F0FF;border-radius:8px">Passwort</td><td style="padding:8px 16px"><b style="font-size:20px">${esc(pw)}</b></td></tr></table>
    <p><a href="${APP}/app/" style="display:inline-block;padding:12px 22px;background:#FFC531;color:#231A4F;border-radius:999px;text-decoration:none;font-weight:bold">Zur Lernplattform</a></p>
    ${link ? `<p><b>Eltern-Bereich:</b> Den Lernstand sehen Sie im Eltern-Bereich. <a href="${link}">Hier legen Sie Ihr Passwort fest</a> (Link gilt 24 Stunden; danach unter „Passwort vergessen?“ neu anfordern).</p>` : ''}
    <p>Fragen? Schreiben Sie an <a href="mailto:info@mentalmath.at">info@mentalmath.at</a>.</p>
    <p>Viel Spaß beim Lernen!<br>Ihr BrainFit-Kids-Team</p></div>`
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: von, reply_to: 'info@mentalmath.at', to: [an], subject: `Willkommen bei BrainFit Kids – so startet ${kind}`, html }),
  })
  if (!r.ok) throw new Error(await r.text())
}
