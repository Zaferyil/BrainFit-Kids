// Supabase Edge Function „webinar-anmeldung“: Eltern melden sich zu einem Webinar an
// und bekommen sofort eine E-Mail mit Termin und Zoom-Link. Secret: RESEND_API_KEY.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const APP = Deno.env.get('APP_URL') ?? 'https://brainfitkids.mentalmath.at'
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
const txt = (v: unknown, max = 120) => String(v ?? '').trim().slice(0, max)
const gcal = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

// Kalender-Datei (.ics) für iPhone/Outlook: GET ?ics=<webinar-id>
const icsZeit = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
async function ics(id: string) {
  const { data: w } = await db.from('webinare').select('*').eq('id', id).maybeSingle()
  if (!w) return new Response('nicht gefunden', { status: 404 })
  const b = new Date(w.beginn), e = new Date(b.getTime() + w.dauer_min * 60_000)
  const t = (x: string) => x.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n')
  const text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BrainFit Kids//Webinar//DE', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${w.id}@brainfitkids`, `DTSTAMP:${icsZeit(new Date())}`, `DTSTART:${icsZeit(b)}`, `DTEND:${icsZeit(e)}`,
    `SUMMARY:${t(w.titel)}`, `DESCRIPTION:${t('Zoom: ' + w.zoom_link)}`, `LOCATION:${t(w.zoom_link)}`, `URL:${w.zoom_link}`,
    'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Webinar beginnt in 30 Minuten', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return new Response(text, { headers: { ...CORS, 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="webinar.ics"' } })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const icsId = new URL(req.url).searchParams.get('ics')
  if (req.method === 'GET' && icsId) return ics(icsId)
  try {
    const b = await req.json()
    const a = { vorname: txt(b.vorname), nachname: txt(b.nachname), mail: txt(b.mail).toLowerCase(), telefon: txt(b.telefon, 40) }
    if (!a.vorname || !a.nachname) return antwort({ fehler: 'Bitte Vor- und Nachnamen eingeben.' }, 400)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.mail)) return antwort({ fehler: 'Bitte eine gültige E-Mail-Adresse eingeben.' }, 400)
    if (!b.zustimmung) return antwort({ fehler: 'Bitte der Datenverarbeitung zustimmen.' }, 400)
    const { data: w } = await db.from('webinare').select('*').eq('id', txt(b.webinar, 40)).eq('aktiv', true).maybeSingle()
    if (!w) return antwort({ fehler: 'Dieses Webinar wurde nicht gefunden.' }, 404)

    const { data: alt } = await db.from('webinar_anmeldungen').select('id').eq('webinar', w.id).eq('mail', a.mail).maybeSingle()
    const id = alt?.id ?? (await db.from('webinar_anmeldungen').insert({ webinar: w.id, ...a }).select('id').single()).data?.id
    if (!id) return antwort({ fehler: 'Die Anmeldung hat nicht geklappt. Bitte später erneut versuchen.' }, 500)

    const beginn = new Date(w.beginn), ende = new Date(beginn.getTime() + w.dauer_min * 60_000)
    const tag = beginn.toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const uhr = beginn.toLocaleTimeString('de-AT', { timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit' })
    const kal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(w.titel)}&dates=${gcal(beginn)}/${gcal(ende)}&details=${encodeURIComponent('Zoom: ' + w.zoom_link)}&location=${encodeURIComponent(w.zoom_link)}`
    const ical = `${Deno.env.get('SUPABASE_URL')}/functions/v1/webinar-anmeldung?ics=${w.id}`
    const z = esc(w.zoom_link)
    const knopf = (href: string, text: string, farbe: string, schrift = '#fff') => `<a href="${href}" style="background:${farbe};color:${schrift};text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:30px;display:inline-block;margin:5px 0">${text}</a>`
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#231A4F;line-height:1.55">
      <p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="220" style="max-width:220px;height:auto"></p>
      <h1 style="color:#5B47D6;margin:0 0 6px;text-align:center">🎉 Sie sind dabei!</h1>
      <p style="text-align:center;font-weight:bold;font-size:17px;margin:0 0 18px">Herzlich willkommen bei BrainFit Kids!</p>
      <p>Hallo ${esc(a.vorname)},</p>
      <p>vielen Dank für Ihre Anmeldung zu unserem kostenlosen Online-Infoabend!</p>
      <p>🧠 <b>Entdecken Sie das Potenzial Ihres Kindes!</b></p>
      <p>Erfahren Sie, wie Mental Arithmetik mit dem Soroban die Konzentration, das mathematische Denken und die Freude am Lernen fördern kann.</p>
      <div style="background:#F3F0FF;border-radius:16px;padding:16px 18px;margin:18px 0">
        <h3 style="margin:0 0 8px;color:#5B47D6">📅 Ihr Webinar-Termin</h3>
        <b style="font-size:17px">${esc(w.titel)}</b><br>
        📅 ${esc(tag)}<br>
        🕕 ${esc(uhr)} Uhr | Dauer: ca. ${w.dauer_min} Minuten<br>
        💻 Online via Zoom – <b>kostenlos</b>
      </div>
      <h3 style="margin:18px 0 8px;text-align:center">🚀 Jetzt am Webinar teilnehmen</h3>
      <p style="text-align:center;margin:0">${knopf(z, '👉 Zum Zoom-Webinar', '#5B47D6')}</p>
      <p style="text-align:center;font-size:13px;color:#6B648F;word-break:break-all;margin:6px 0 16px"><a href="${z}" style="color:#6B648F">${z}</a></p>
      <p style="text-align:center;margin:0">${knopf(ical, '📱 Zum iPhone-Kalender hinzufügen', '#FFC531', '#231A4F')}<br>${knopf(kal, '📅 Zum Google Kalender hinzufügen', '#FFC531', '#231A4F')}</p>
      <hr style="border:0;border-top:1px solid #E2DDF2;margin:24px 0">
      <p style="text-align:center"><b>Jedes Kind hat Potenzial. Gemeinsam entfalten wir es!</b> 💜</p>
      <p style="text-align:center">Wir freuen uns auf Sie!<br><b>Ihr BrainFit Kids Team</b><br><i>Wir bilden die Genies von morgen.</i></p>
      <p style="font-size:12px;color:#9A94B8;text-align:center">Sie erhalten diese E-Mail, weil Sie sich auf ${APP}/webinar angemeldet haben. Abmelden: einfach auf diese E-Mail antworten.</p></div>`
    const s = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>', reply_to: 'info@mentalmath.at', to: [a.mail], subject: `🎉 Sie sind dabei! ${w.titel}`, html }),
    })
    if (s.ok) await db.from('webinar_anmeldungen').update({ mail_gesendet: new Date().toISOString() }).eq('id', id)
    return antwort({ ok: true, mail: s.ok })
  } catch (e) {
    return antwort({ fehler: 'Fehler: ' + (e as Error).message }, 500)
  }
})
