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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
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
    const wann = beginn.toLocaleString('de-AT', { timeZone: 'Europe/Vienna', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const kal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(w.titel)}&dates=${gcal(beginn)}/${gcal(ende)}&details=${encodeURIComponent('Zoom: ' + w.zoom_link)}`
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#231A4F">
      <p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="220" style="max-width:220px;height:auto"></p>
      <h1 style="color:#5B47D6;margin:0 0 10px">Sie sind angemeldet! 🎉</h1>
      <p>Hallo ${esc(a.vorname)} ${esc(a.nachname)},</p>
      <p>vielen Dank für Ihre Anmeldung zum Online-Webinar:</p>
      <div style="background:#F3F0FF;border-radius:16px;padding:16px 18px;margin:14px 0">
        <b style="font-size:18px">${esc(w.titel)}</b><br>
        <span>📅 ${esc(wann)} Uhr · ca. ${w.dauer_min} Minuten</span>
        ${w.beschreibung ? `<p style="color:#4A4370;margin:10px 0 0">${esc(w.beschreibung)}</p>` : ''}
      </div>
      <p style="text-align:center;margin:22px 0"><a href="${esc(w.zoom_link)}" style="background:#5B47D6;color:#fff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:30px;display:inline-block">Zum Zoom-Webinar</a></p>
      <p style="font-size:14px;color:#6B648F">Zoom-Link: <a href="${esc(w.zoom_link)}">${esc(w.zoom_link)}</a></p>
      <p style="font-size:14px"><a href="${kal}">📆 In Google Kalender eintragen</a></p>
      <p>Wir freuen uns auf Sie!<br>Ihr BrainFit Kids Team</p>
      <p style="font-size:12px;color:#9A94B8">Sie erhalten diese E-Mail, weil Sie sich auf ${APP}/webinar angemeldet haben. Abmelden: einfach auf diese E-Mail antworten.</p></div>`
    const s = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>', reply_to: 'info@mentalmath.at', to: [a.mail], subject: `Ihre Anmeldung: ${w.titel}`, html }),
    })
    if (s.ok) await db.from('webinar_anmeldungen').update({ mail_gesendet: new Date().toISOString() }).eq('id', id)
    return antwort({ ok: true, mail: s.ok })
  } catch (e) {
    return antwort({ fehler: 'Fehler: ' + (e as Error).message }, 500)
  }
})
