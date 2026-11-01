// Supabase Edge Function „check-bericht“: schickt Eltern den ausführlichen Bericht zum Gratis Kopfrechen-Check.
// Speichert die E-Mail beim anonymen Ergebnis (nur mit Zustimmung). Secret: RESEND_API_KEY.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const APP = Deno.env.get('APP_URL') ?? 'https://brainfitkids.mentalmath.at'
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

const STUFEN = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
const BEREICHE = [
  { id: 'rechnen', name: 'Rechnen & Mengen', was: 'Wie schnell und sicher Ihr Kind rechnet bzw. Mengen vergleicht.',
    tipps: ['Im Alltag rechnen: beim Einkaufen, Tischdecken oder Treppensteigen Zahlen zusammenzählen.', 'Kurze „Blitzrunden“: 3 Aufgaben vor dem Abendessen – lieber oft als lang.'] },
  { id: 'abakus', name: 'Zahlenverständnis', was: 'Ob Ihr Kind Mengen, Zahlen und Stellenwerte (Einer, Zehner, Hunderter) sicher erkennt.',
    tipps: ['Mengen bündeln: Spielsachen in Zehnergruppen ordnen und gemeinsam zählen.', 'Mit dem Abakus Zahlen legen und wieder ablesen – das macht Stellenwerte sichtbar.'] },
  { id: 'blitz', name: 'Blitz-Erfassung', was: 'Wie gut Ihr Kind Zahlen und Mengen auf einen Blick erfasst.',
    tipps: ['Würfelbilder oder Finger kurz zeigen und die Anzahl nennen lassen.', 'Autokennzeichen-Spiel: Zahl kurz ansehen, dann aus dem Gedächtnis sagen.'] },
  { id: 'merken', name: 'Arbeitsgedächtnis', was: 'Wie viele Schritte sich Ihr Kind in der richtigen Reihenfolge merken kann.',
    tipps: ['„Ich packe meinen Koffer“ spielen – trainiert Reihenfolgen spielerisch.', 'Kleine Aufträge mit 2–3 Schritten geben („Hol bitte …, dann …“).'] },
  { id: 'konzentration', name: 'Konzentration', was: 'Wie fokussiert und genau Ihr Kind unter Zeitdruck arbeitet.',
    tipps: ['Feste, ruhige Lernzeit ohne Bildschirm-Ablenkung.', 'Suchbilder und „Finde alle …“-Spiele – kurz, aber regelmäßig.'] },
] as const

// Richtwert (Normalverteilung um 55, Streuung 18), solange weniger als 30 Vergleichswerte vorliegen
const phi = (z: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const { id, mail, newsletter = false } = await req.json()
    const m = String(mail ?? '').trim().toLowerCase()
    if (!/^[0-9a-f-]{36}$/.test(String(id ?? ''))) return antwort({ fehler: 'Ergebnis nicht gefunden.' }, 400)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) return antwort({ fehler: 'Bitte eine gültige E-Mail-Adresse eingeben.' }, 400)
    const { data: r } = await db.from('check_ergebnisse').select('*').eq('id', id).maybeSingle()
    if (!r) return antwort({ fehler: 'Ergebnis nicht gefunden. Bitte den Check noch einmal machen.' }, 404)
    if (r.bericht_gesendet) return antwort({ fehler: 'Der Bericht wurde bereits verschickt.' }, 409)
    if (Date.now() - Date.parse(r.erstellt) > 24 * 3600_000) return antwort({ fehler: 'Dieses Ergebnis ist abgelaufen. Bitte den Check noch einmal machen.' }, 410)

    const w = { rechnen: r.rechnen, abakus: r.abakus, blitz: r.blitz, merken: r.merken, konzentration: r.konzentration, gesamt: r.gesamt }
    const { data: v } = await db.rpc('check_vergleich', { p_stufe: r.stufe, p_variante: r.variante, p_abakus: r.abakus_bekannt, w })
    const echt = Number(v?.anzahl ?? 0) >= 30
    const perz = (k: string, wert: number) => (echt ? Number(v?.[k] ?? 0) : Math.round(100 * phi((wert - 55) / 18)))
    const gruppe = r.stufe === 0 ? 'Kindergartenkinder' : `Kinder der ${STUFEN[r.stufe]}`
    const pg = perz('gesamt', r.gesamt)
    const sortiert = [...BEREICHE].sort((a, b) => w[b.id] - w[a.id])

    const zeile = (b: typeof BEREICHE[number]) => {
      const p = perz(b.id, w[b.id])
      return `<tr><td style="padding:12px 0;border-bottom:1px solid #EEEAFB;vertical-align:top">
        <b style="font-size:16px">${b.name}</b><br><span style="color:#6B648F;font-size:13px">${b.was}</span>
        <div style="background:#EFEBFF;border-radius:8px;height:12px;margin:8px 0 4px"><div style="background:#5B47D6;border-radius:8px;height:12px;width:${Math.max(4, p)}%"></div></div>
        <span style="font-size:13px">${p >= 10 ? `Besser als ${echt ? '' : 'etwa '}${p} % der ${gruppe}` : 'Noch am Anfang – hier lohnt sich Üben besonders'} · ${w[b.id]} von 100 Punkten</span>
        <ul style="margin:8px 0 0;padding-left:18px;color:#4A4370;font-size:14px">${b.tipps.map((t) => `<li>${t}</li>`).join('')}</ul></td></tr>`
    }
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#231A4F">
      <p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="220" style="max-width:220px;height:auto"></p>
      <h1 style="color:#5B47D6;margin:0 0 6px">Ihr ausführlicher Kopfrechen-Bericht</h1>
      <p style="color:#6B648F;margin:0 0 16px">${r.alter_jahre} Jahre · ${STUFEN[r.stufe]}</p>
      <div style="background:#5B47D6;color:#fff;border-radius:16px;padding:16px 18px;margin-bottom:16px">
        ${pg >= 10 ? `<b style="font-size:28px">${pg} %</b><br>Ihr Kind liegt insgesamt vor ${echt ? '' : 'etwa '}${pg} % der ${gruppe}.` : '<b style="font-size:20px">Ein guter Startpunkt 🌱</b><br>Ihr Kind steht noch am Anfang – genau jetzt bringt regelmäßiges Üben am meisten.'}
      </div>
      <p><b>💪 Stärke:</b> ${sortiert[0].name}<br><b>🚀 Größtes Potenzial:</b> ${sortiert[sortiert.length - 1].name}</p>
      <h2 style="font-size:20px;margin:22px 0 4px">Die 5 Bereiche im Detail</h2>
      <table style="width:100%;border-collapse:collapse">${BEREICHE.map(zeile).join('')}</table>
      <div style="background:#FFF6D6;border-radius:16px;padding:16px 18px;margin:22px 0">
        <h2 style="font-size:20px;margin:0 0 8px">Unsere Empfehlung</h2>
        <p style="margin:0 0 10px">Mit <b>BrainFit Kids</b> trainiert Ihr Kind genau diese Bereiche – mit der Abakus-Methode, Lernvideos und Denkspielen, nur <b>15 Minuten am Tag</b>. So kann Ihr Kind sicherer und schneller rechnen und im Vergleich mit Gleichaltrigen weiter nach vorne kommen.</p>
        <p style="margin:0"><a href="${APP}/#preise" style="display:inline-block;padding:12px 22px;background:#FFC531;color:#231A4F;border-radius:999px;text-decoration:none;font-weight:bold">Jetzt Paket wählen</a></p>
      </div>
      <p style="color:#8A84AD;font-size:12px">Der Check ist eine spielerische Momentaufnahme und kein standardisierter Test. ${echt ? `Vergleich mit ${v.anzahl} Kindern derselben Schulstufe.` : 'Solange noch wenige Ergebnisse vorliegen, vergleichen wir mit Richtwerten.'}
      Sie erhalten diese E-Mail, weil Sie den Bericht auf ${APP.replace('https://', '')} angefordert haben.${newsletter ? ' Lerntipps und Angebote können Sie jederzeit mit einer kurzen Antwort auf diese E-Mail abbestellen.' : ''}</p>
      <p style="font-size:13px">Fragen? <a href="mailto:info@mentalmath.at">info@mentalmath.at</a> · WhatsApp +43 676 463 44 44</p></div>`

    if (!Deno.env.get('RESEND_API_KEY')) return antwort({ fehler: 'E-Mail-Versand ist gerade nicht verfügbar.' }, 503)
    const s = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>', reply_to: 'info@mentalmath.at', to: [m], subject: 'Ihr Kopfrechen-Bericht von BrainFit Kids', html }),
    })
    if (!s.ok) { console.error('Mail:', await s.text()); return antwort({ fehler: 'Die E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen.' }, 502) }
    await db.from('check_ergebnisse').update({ mail: m, newsletter: !!newsletter, bericht_gesendet: new Date().toISOString() }).eq('id', id)
    return antwort({ ok: true })
  } catch (e) {
    return antwort({ fehler: String((e as Error).message ?? e) }, 500)
  }
})
