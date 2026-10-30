// Supabase Edge Function „bestellung“: nach der Rückkehr von Stripe.
// Fragt Stripe, ob die Checkout-Session wirklich bezahlt ist, und legt erst dann das Kind an (genau einmal je Session).
// Benötigte Secrets (Supabase → Edge Functions → Secrets): STRIPE_SECRET_KEY (eingeschränkter Schlüssel, Lesen von Checkout Sessions).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const WOERTER = ['stern', 'sonne', 'mond', 'blitz', 'perle', 'krone', 'tiger', 'adler', 'welle', 'rakete']
const passwort = () => WOERTER[Math.floor(Math.random() * WOERTER.length)] + (10 + Math.floor(Math.random() * 90))
const basis = (n: string) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '') || 'kind'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const { session_id, vorname, stufe = null, eltern_passwort = '', eltern_name = '' } = await req.json()
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session_id ?? '')) return antwort({ fehler: 'ungültige Zahlung' }, 400)
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // schon verarbeitet? Dann dieselben Zugangsdaten zurückgeben
    const { data: alt } = await admin.from('bestellungen').select('kind_benutzer, passwort_start').eq('stripe_session', session_id).maybeSingle()
    if (alt) return antwort({ benutzer: alt.kind_benutzer, passwort: alt.passwort_start, schon: true })

    // bei Stripe nachfragen
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, { headers: { Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}` } })
    if (!r.ok) return antwort({ fehler: 'Zahlung nicht gefunden' }, 400)
    const s = await r.json()
    if (s.status !== 'complete' || !['paid', 'no_payment_required'].includes(s.payment_status)) return antwort({ fehler: 'Zahlung nicht abgeschlossen' }, 402)

    const [paketName, takt] = String(s.client_reference_id ?? 'Basic-monat').split('-')
    const paket = paketName.toLowerCase()
    const mail = s.customer_details?.email ?? s.customer_email ?? ''
    const name = String(vorname ?? '').trim() || 'Kind'

    // freier Benutzername
    const b0 = basis(name)
    const { data: belegt } = await admin.from('kinder').select('benutzer').like('benutzer', `${b0}%`)
    const vorhanden = new Set((belegt ?? []).map((x: { benutzer: string }) => x.benutzer))
    let benutzer = b0, i = 2
    while (vorhanden.has(benutzer)) benutzer = `${b0}${i++}`
    const pw = passwort()

    // zuerst die Bestellung vormerken (Primärschlüssel = Session): verhindert doppeltes Anlegen bei zwei gleichzeitigen Aufrufen
    const { error: dop } = await admin.from('bestellungen').insert({ stripe_session: session_id, eltern_mail: mail, paket, takt: takt === 'jahr' ? 'jahr' : 'monat',
      kind_vorname: name, kind_stufe: stufe, kind_benutzer: benutzer, passwort_start: pw })
    if (dop) {
      const { data: x } = await admin.from('bestellungen').select('kind_benutzer, passwort_start').eq('stripe_session', session_id).single()
      return antwort({ benutzer: x?.kind_benutzer, passwort: x?.passwort_start, schon: true })
    }

    const { data: neu, error } = await admin.auth.admin.createUser({ email: `${benutzer}@kinder.brainfit-kids.at`, password: pw, email_confirm: true })
    if (error) throw error
    const id = neu.user.id
    await admin.from('personen').insert({ id, rolle: 'kind', name })
    await admin.from('kinder').insert({ id, benutzer, vorname: name, stufe, paket: ['basic', 'plus', 'premium'].includes(paket) ? paket : null })
    await admin.from('konten').insert({ kind: id })
    const { data: start } = await admin.from('shop_artikel').select('id').eq('start', true)
    if (start?.length) await admin.from('besitz').insert(start.map((a: { id: string }) => ({ kind: id, artikel: a.id })))
    await admin.from('bestellungen').update({ kind: id }).eq('stripe_session', session_id)

    // Eltern-Konto: E-Mail aus Stripe, Passwort aus der Kasse; gibt es das Konto schon, wird nur das Kind verknüpft
    if (mail) {
      let elternId: string | null = null
      if (String(eltern_passwort).length >= 8) {
        const { data: e } = await admin.auth.admin.createUser({ email: mail, password: eltern_passwort, email_confirm: true })
        elternId = e?.user?.id ?? null
      }
      if (!elternId) {
        for (let seite = 1; seite <= 20 && !elternId; seite++) {
          const { data: l } = await admin.auth.admin.listUsers({ page: seite, perPage: 200 })
          elternId = l?.users.find((u: { email?: string }) => u.email?.toLowerCase() === mail.toLowerCase())?.id ?? null
          if (!l || l.users.length < 200) break
        }
      }
      if (elternId) {
        await admin.from('personen').upsert({ id: elternId, rolle: 'eltern', name: String(eltern_name).trim() }, { onConflict: 'id', ignoreDuplicates: true })
        await admin.from('kinder').update({ eltern: elternId }).eq('id', id)
      }
    }

    // Zugangsdaten per E-Mail an die Eltern (Resend). Ohne RESEND_API_KEY wird nichts verschickt.
    if (mail && Deno.env.get('RESEND_API_KEY')) await zugangsMail(mail, String(eltern_name).trim(), name, benutzer, pw, paketName).catch((e) => console.error('Mail:', e))

    return antwort({ benutzer, passwort: pw })
  } catch (e) {
    return antwort({ fehler: String((e as Error).message ?? e) }, 500)
  }
})

const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

async function zugangsMail(an: string, eltern: string, kind: string, benutzer: string, pw: string, paket: string) {
  const app = Deno.env.get('APP_URL') ?? 'https://brainfitkids.netlify.app'
  const von = Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <hallo@mentalmath.at>'
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#231A4F">
    <h1 style="color:#5B47D6">Willkommen bei BrainFit Kids!</h1>
    <p>Hallo ${esc(eltern || 'liebe Eltern')},</p>
    <p>danke für Ihre Bestellung (${esc(paket)}). Hier sind die Zugangsdaten für <b>${esc(kind)}</b>:</p>
    <table style="border-collapse:collapse;margin:16px 0"><tr><td style="padding:8px 16px;background:#F2F0FF;border-radius:8px">Benutzername</td><td style="padding:8px 16px"><b style="font-size:20px">${esc(benutzer)}</b></td></tr>
    <tr><td style="padding:8px 16px;background:#F2F0FF;border-radius:8px">Passwort</td><td style="padding:8px 16px"><b style="font-size:20px">${esc(pw)}</b></td></tr></table>
    <p><a href="${app}/app/" style="display:inline-block;padding:12px 22px;background:#FFC531;color:#231A4F;border-radius:999px;text-decoration:none;font-weight:bold">Zur Lernplattform</a></p>
    <p>So geht’s: Lernplattform öffnen → Benutzername und Passwort eingeben → SeZa wählen – fertig!</p>
    <p>Den Lernstand sehen Sie im <a href="${app}/app/#eltern">Eltern-Bereich</a> mit Ihrer E-Mail-Adresse und Ihrem Passwort.</p>
    <p>Viel Spaß beim Lernen!<br>Ihr BrainFit-Kids-Team</p></div>`
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: von, to: [an], subject: `Willkommen bei BrainFit Kids – so startet ${kind}`, html }),
  })
  if (!r.ok) throw new Error(await r.text())
}
