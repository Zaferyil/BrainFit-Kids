// Supabase Edge Function „vorort-anmeldung“: Formulare für den Vor-Ort-Kurs in Linz (Website /vorort).
// Arten: voranmeldung (Interesse), schnupper (Schnupperkurs, bezahlt), anmeldung (Kursanmeldung mit monatlicher oder jährlicher Zahlung).
// Speichert die Angaben, schickt eine Bestätigung an die Eltern und eine Benachrichtigung an den Admin,
// und gibt bei Schnupperkurs/Anmeldung den Stripe-Zahlungslink zurück (monatlich = Stripe-Abo, wird automatisch abgebucht).
// Secrets: RESEND_API_KEY (vorhanden). Optional: ADMIN_MAIL (sonst info@mentalmath.at).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const APP = Deno.env.get('APP_URL') ?? 'https://brainfitkids.mentalmath.at'
const ADMIN = Deno.env.get('ADMIN_MAIL') ?? 'info@mentalmath.at'
const esc = (t: unknown) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
const txt = (v: unknown, max = 120) => String(v ?? '').trim().slice(0, max)
const STUFEN = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
const ART: Record<string, string> = { voranmeldung: 'Voranmeldung (Interesse)', schnupper: 'Schnupperkurs', anmeldung: 'Kursanmeldung' }
const euro = (n: number) => n.toLocaleString('de-AT', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'

type VorOrt = { monat: number; jahr: number; schnupper: number; linkMonat: string; linkJahr: string; linkSchnupper: string; adresse: string; zeiten: string }

async function mail(to: string, subject: string, html: string, replyTo = 'info@mentalmath.at') {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>', reply_to: replyTo, to: [to], subject, html }),
  })
  return r.ok
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const b = await req.json()
    const art = txt(b.art, 20)
    if (!ART[art]) return antwort({ fehler: 'Bitte wählen Sie, wofür Sie sich anmelden möchten.' }, 400)
    const a = {
      art,
      eltern_vorname: txt(b.eltern_vorname), eltern_nachname: txt(b.eltern_nachname), mail: txt(b.mail).toLowerCase(), telefon: txt(b.telefon, 40),
      strasse: txt(b.strasse) || null, plz: txt(b.plz, 10) || null, ort: txt(b.ort, 60) || null,
      kind_vorname: txt(b.kind_vorname), kind_nachname: txt(b.kind_nachname) || null,
      kind_geburt: /^\d{4}-\d{2}-\d{2}$/.test(txt(b.kind_geburt, 10)) ? txt(b.kind_geburt, 10) : null,
      kind_stufe: Number.isInteger(b.kind_stufe) && b.kind_stufe >= 0 && b.kind_stufe <= 6 ? b.kind_stufe : null,
      wunschzeiten: txt(b.wunschzeiten, 300) || null, nachricht: txt(b.nachricht, 1000) || null,
      takt: art === 'anmeldung' ? (b.takt === 'jahr' ? 'jahr' : 'monat') : null,
    }
    if (!a.eltern_vorname || !a.eltern_nachname) return antwort({ fehler: 'Bitte Vor- und Nachnamen eingeben.' }, 400)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.mail)) return antwort({ fehler: 'Bitte eine gültige E-Mail-Adresse eingeben.' }, 400)
    if (!a.telefon) return antwort({ fehler: 'Bitte eine Telefonnummer eingeben.' }, 400)
    if (!a.kind_vorname) return antwort({ fehler: 'Bitte den Vornamen Ihres Kindes eingeben.' }, 400)
    if (art === 'anmeldung' && (!a.kind_nachname || !a.kind_geburt || !a.strasse || !a.plz || !a.ort)) return antwort({ fehler: 'Bitte alle Pflichtfelder für die Anmeldung ausfüllen.' }, 400)
    if (art === 'anmeldung' && !b.agb) return antwort({ fehler: 'Bitte den AGB zustimmen.' }, 400)
    if (!b.zustimmung) return antwort({ fehler: 'Bitte der Datenverarbeitung zustimmen.' }, 400)

    // Preise und Stripe-Links aus den Website-Einstellungen (Admin → Website)
    const { data: w } = await db.from('website').select('daten').eq('id', 1).maybeSingle()
    const v = { monat: 249, jahr: 0, schnupper: 0, linkMonat: '', linkJahr: '', linkSchnupper: '', adresse: 'Linz', zeiten: '', ...((w?.daten as { vorort?: Partial<VorOrt> } | null)?.vorort ?? {}) } as VorOrt
    if (a.takt === 'jahr' && !(v.jahr > 0)) a.takt = 'monat'
    const betrag = art === 'schnupper' ? v.schnupper : art === 'anmeldung' ? (a.takt === 'jahr' ? v.jahr : v.monat) : null

    const { data: neu, error } = await db.from('vorort_anmeldungen').insert({ ...a, betrag }).select('id').single()
    if (error || !neu) return antwort({ fehler: 'Die Anmeldung hat nicht geklappt. Bitte später erneut versuchen.' }, 500)

    // Zahlungslink (Stripe Payment Link) mit E-Mail und Bezug zur Anmeldung
    const roh = art === 'schnupper' ? v.linkSchnupper : art === 'anmeldung' ? (a.takt === 'jahr' ? v.linkJahr : v.linkMonat) : ''
    const zahlung = /^https:\/\/buy\.stripe\.com\//.test(roh) ? `${roh}${roh.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(a.mail)}&client_reference_id=vorort-${art}-${neu.id}` : null

    const stufe = a.kind_stufe !== null ? STUFEN[a.kind_stufe] : '–'
    const geburt = a.kind_geburt ? new Date(a.kind_geburt).toLocaleDateString('de-AT') : '–'
    const preisText = art === 'schnupper' ? (v.schnupper > 0 ? `${euro(v.schnupper)} (einmalig)` : '') : art === 'anmeldung' ? (a.takt === 'jahr' ? `${euro(v.jahr)} pro Jahr` : `${euro(v.monat)} pro Monat – wird jeden Monat automatisch abgebucht`) : ''
    const knopf = (href: string, text: string) => `<a href="${href}" style="background:#5B47D6;color:#fff;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:30px;display:inline-block">${text}</a>`
    const kopf = `<p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="200" style="max-width:200px;height:auto"></p>`
    const titel = art === 'voranmeldung' ? 'Danke für Ihr Interesse! 💜' : art === 'schnupper' ? 'Ihr Schnupperkurs ist vorgemerkt! 🎉' : 'Ihre Anmeldung ist eingegangen! 🎉'
    const text = art === 'voranmeldung'
      ? `<p>wir haben Ihre Voranmeldung für den <b>BrainFit Kids Vor-Ort-Kurs in Linz</b> erhalten. Sobald ein Kurstermin für ${esc(a.kind_vorname)} feststeht, melden wir uns persönlich bei Ihnen.</p>`
      : art === 'schnupper'
        ? `<p>wir haben Ihre Anmeldung zum <b>Schnupperkurs</b> für ${esc(a.kind_vorname)} erhalten. Wir melden uns mit dem genauen Termin bei Ihnen.</p>${zahlung ? `<p>Falls Sie den Schnupperkurs noch nicht bezahlt haben, können Sie das hier erledigen:</p><p style="text-align:center">${knopf(zahlung, '💳 Schnupperkurs bezahlen')}</p>` : ''}`
        : `<p>vielen Dank für die Anmeldung von <b>${esc(a.kind_vorname)} ${esc(a.kind_nachname)}</b> zum <b>Vor-Ort-Kurs in Linz</b>!</p><p>Gewählte Zahlungsweise: <b>${esc(preisText)}</b>.</p>${zahlung ? `<p>Falls Sie die Zahlung noch nicht abgeschlossen haben, können Sie das hier erledigen:</p><p style="text-align:center">${knopf(zahlung, '💳 Zahlung abschließen')}</p>` : '<p>Wir schicken Ihnen die Zahlungsinformationen in Kürze.</p>'}<p>Wir melden uns mit dem Kursbeginn und allen Details.</p>`
    const elternHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#231A4F;line-height:1.55">${kopf}
      <h1 style="color:#5B47D6;text-align:center;margin:0 0 14px;font-size:24px">${titel}</h1>
      <p>Hallo ${esc(a.eltern_vorname)},</p>${text}
      ${v.adresse || v.zeiten ? `<div style="background:#F3F0FF;border-radius:16px;padding:14px 18px;margin:16px 0">${v.adresse ? `📍 <b>Kursort:</b> ${esc(v.adresse)}<br>` : ''}${v.zeiten ? `🕒 <b>Kurszeiten:</b> ${esc(v.zeiten)}` : ''}</div>` : ''}
      <p>Fragen? Antworten Sie einfach auf diese E-Mail.</p>
      <p>Herzliche Grüße<br><b>Ihr BrainFit Kids Team</b></p></div>`
    const zeilen: [string, string][] = [['Art', ART[art]], ['Eltern', `${a.eltern_vorname} ${a.eltern_nachname}`], ['E-Mail', a.mail], ['Telefon', a.telefon],
      ...(a.strasse ? [['Adresse', `${a.strasse}, ${a.plz} ${a.ort}`] as [string, string]] : []),
      ['Kind', `${a.kind_vorname}${a.kind_nachname ? ' ' + a.kind_nachname : ''}`], ['Geburtsdatum', geburt], ['Schulstufe', stufe],
      ...(preisText ? [['Zahlung', preisText] as [string, string]] : []), ...(a.wunschzeiten ? [['Wunschzeiten', a.wunschzeiten] as [string, string]] : []), ...(a.nachricht ? [['Nachricht', a.nachricht] as [string, string]] : [])]
    const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;color:#231A4F;line-height:1.5"><h2 style="color:#5B47D6">📝 Neue ${esc(ART[art])} – Vor-Ort-Kurs Linz</h2>
      <table style="border-collapse:collapse">${zeilen.map(([k, x]) => `<tr><td style="padding:4px 12px 4px 0;color:#6B648F;vertical-align:top">${esc(k)}</td><td style="padding:4px 0"><b>${esc(x)}</b></td></tr>`).join('')}</table>
      <p style="color:#6B648F;font-size:13px">${zahlung ? 'Die Eltern wurden zur Stripe-Zahlung weitergeleitet – den Zahlungsstatus sehen Sie in Stripe (Referenz: vorort-' + esc(art) + '-' + esc(neu.id) + ').' : art === 'voranmeldung' ? 'Keine Zahlung (Voranmeldung).' : 'Achtung: Kein Stripe-Link hinterlegt (Admin → Website → Vor-Ort-Kurs).'}</p>
      <p><a href="${APP}/app/#admin">Zum Admin-Bereich → Vor-Ort</a></p></div>`

    const [ok] = await Promise.all([
      mail(a.mail, art === 'voranmeldung' ? 'Ihre Voranmeldung bei BrainFit Kids' : art === 'schnupper' ? 'Ihr Schnupperkurs bei BrainFit Kids' : 'Ihre Anmeldung zum Vor-Ort-Kurs bei BrainFit Kids', elternHtml),
      mail(ADMIN, `Neue ${ART[art]}: ${a.kind_vorname} (${a.eltern_vorname} ${a.eltern_nachname})`, adminHtml, a.mail),
    ])
    if (ok) await db.from('vorort_anmeldungen').update({ mail_gesendet: new Date().toISOString() }).eq('id', neu.id)
    return antwort({ ok: true, zahlung, mail: ok })
  } catch (e) {
    return antwort({ fehler: 'Fehler: ' + (e as Error).message }, 500)
  }
})
