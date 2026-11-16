// Supabase Edge Function „wochenbericht“: jeden Sonntag eine kurze Zusammenfassung der Lernwoche an die Eltern.
// Aufruf durch den Zeitplan (pg_cron, siehe supabase/update-22-wochenbericht-zeitplan.sql) mit dem Header x-cron-key.
// Secrets: RESEND_API_KEY (vorhanden) und CRON_KEY (selbst gewähltes Passwort, auch im Zeitplan eintragen).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-key' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const esc = (t: string) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
const APP = Deno.env.get('APP_URL') ?? 'https://brainfitkids.mentalmath.at'
const TAG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

type Stand = { welt: number; weltName: string; lektion: number; lektionName: string; gesamt: number; fertig?: boolean }
type Kind = { id: string; vorname: string; eltern: string }

function kindBlock(k: Kind, daten: Record<string, unknown>, alteLektion: number | null) {
  const tage = (daten[`bfk.tage.${k.id}`] ?? {}) as Record<string, number[]>
  const stand = daten[`bfk.stand.${k.id}`] as Stand | undefined
  const progress = (daten[`bfk.progress.${k.id}`] ?? {}) as { streak?: number }
  const woche: { d: string; min: number; aktiv: boolean }[] = []
  let min = 0, aufg = 0, stat = 0, spiele = 0, aktiv = 0
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 864e5), d = dt.toISOString().slice(0, 10), t = tage[d] ?? [0, 0, 0, 0]
    const a = t[1] + t[2] + t[3] > 0
    min += t[0]; aufg += t[1]; stat += t[2]; spiele += t[3]; if (a) aktiv++
    woche.push({ d: TAG[dt.getUTCDay()], min: t[0], aktiv: a })
  }
  const neu = stand && alteLektion !== null ? Math.max(0, stand.lektion - alteLektion) : null
  const balken = woche.map((w) => `<td style="text-align:center;padding:0 3px;vertical-align:bottom">
      <div style="height:${Math.max(4, Math.min(60, w.min * 4))}px;width:22px;margin:auto;border-radius:6px;background:${w.aktiv ? '#5B47D6' : '#E2DDF2'}"></div>
      <div style="font-size:11px;color:#6B648F;margin-top:3px">${w.d}</div></td>`).join('')
  const lob = aktiv >= 5 ? `Großartig – ${esc(k.vorname)} hat an ${aktiv} Tagen geübt! 🌟` : aktiv >= 3 ? `Schön – ${aktiv} Lerntage diese Woche. Weiter so! 👍` : aktiv >= 1 ? `${aktiv} Lerntag${aktiv > 1 ? 'e' : ''} diese Woche. Schon 15 Minuten an 4–5 Tagen machen einen großen Unterschied.` : `Diese Woche wurde nicht geübt. Vielleicht klappt es nächste Woche wieder – 15 Minuten am Tag reichen!`
  return `
    <div style="border:2px solid #EEEAFB;border-radius:18px;padding:16px 18px;margin:0 0 16px">
      <h2 style="margin:0 0 4px;color:#5B47D6;font-size:22px">${esc(k.vorname)}</h2>
      ${stand ? `<div style="color:#6B648F;font-size:14px">${stand.fertig ? '🎓 Alle Welten geschafft!' : `Welt ${stand.welt} · ${esc(stand.weltName)} – Lektion ${stand.lektion} von ${stand.gesamt}: <b>${esc(stand.lektionName)}</b>`}</div>` : ''}
      <table role="presentation" style="width:100%;margin:14px 0 6px;border-collapse:collapse"><tr>
        ${[['⏱️', `${min} Min`, 'Lernzeit'], ['📅', `${aktiv} / 7`, 'Lerntage'], ['✏️', `${aufg}`, 'Aufgaben'], ['🔥', `${progress.streak ?? 0}`, 'Tage am Stück']].map(([i, w, t]) =>
          `<td style="text-align:center;background:#F3F0FF;border-radius:12px;padding:8px 2px;width:25%"><div style="font-size:18px">${i}</div><b style="font-size:18px">${w}</b><div style="font-size:11px;color:#6B648F">${t}</div></td>`).join('<td style="width:6px"></td>')}
      </tr></table>
      <table role="presentation" style="margin:10px auto 4px;border-collapse:collapse"><tr>${balken}</tr></table>
      ${neu !== null ? `<p style="margin:10px 0 0">📚 Diese Woche geschafft: <b>${neu} ${neu === 1 ? 'Lektion' : 'Lektionen'}</b> · ${stat} Stationen · ${spiele} Denkspiele</p>` : `<p style="margin:10px 0 0">${stat} Stationen · ${spiele} Denkspiele</p>`}
      <p style="margin:8px 0 0;color:#231A4F">${lob}</p>
    </div>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const cron = Deno.env.get('CRON_KEY')
  if (!cron || req.headers.get('x-cron-key') !== cron) return antwort({ fehler: 'nicht erlaubt' }, 401)
  try {
    const body = await req.json().catch(() => ({}))
    const nurAn: string | undefined = body.test_an // Testlauf: nur an diese E-Mail (erste Eltern mit Kindern als Beispiel)
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: kinder } = await db.from('kinder').select('id, vorname, eltern').not('eltern', 'is', null).eq('archiviert', false)
    const { data: aus } = await db.from('eltern_einstellungen').select('eltern').eq('wochenbericht', false)
    const abbestellt = new Set((aus ?? []).map((x: { eltern: string }) => x.eltern))
    const gruppen = new Map<string, Kind[]>()
    for (const k of (kinder ?? []) as Kind[]) if (!abbestellt.has(k.eltern)) gruppen.set(k.eltern, [...(gruppen.get(k.eltern) ?? []), k])
    let gesendet = 0
    for (const [eltern, ks] of gruppen) {
      const { data: u } = await db.auth.admin.getUserById(eltern)
      const mail = nurAn ?? u?.user?.email
      if (!mail) continue
      const ids = ks.map((k) => k.id)
      const { data: fs } = await db.from('fortschritt').select('kind, daten').in('kind', ids)
      const { data: logs } = await db.from('wochenbericht_log').select('kind, lektion').in('kind', ids)
      const daten = new Map((fs ?? []).map((f: { kind: string; daten: Record<string, unknown> }) => [f.kind, f.daten]))
      const alt = new Map((logs ?? []).map((l: { kind: string; lektion: number }) => [l.kind, l.lektion]))
      const bloecke = ks.map((k) => kindBlock(k, daten.get(k.id) ?? {}, alt.has(k.id) ? alt.get(k.id)! : null)).join('')
      const namen = ks.map((k) => k.vorname).join(' & ')
      const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#231A4F;line-height:1.5">
        <p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="200" style="max-width:200px;height:auto"></p>
        <h1 style="color:#5B47D6;text-align:center;margin:0 0 14px;font-size:24px">Die Lernwoche von ${esc(namen)}</h1>
        ${bloecke}
        <p style="text-align:center;margin:18px 0"><a href="${APP}/app/#eltern" style="background:#5B47D6;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:30px;display:inline-block">Zum Eltern-Bereich</a></p>
        <p style="font-size:14px">💡 <b>Tipp der Woche:</b> Fragen Sie Ihr Kind beim Einkaufen oder Kochen nach kleinen Rechnungen – Kopfrechnen im Alltag festigt das Gelernte.</p>
        <p>Herzliche Grüße<br><b>Ihr BrainFit Kids Team</b></p>
        <p style="font-size:12px;color:#9A94B8">Sie erhalten diesen Wochenbericht, weil Ihr Kind bei BrainFit Kids lernt. Abbestellen: im <a href="${APP}/app/#eltern" style="color:#9A94B8">Eltern-Bereich</a> unter „Wochenbericht per E-Mail“.</p></div>`
      const s = await fetch('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>', reply_to: 'info@mentalmath.at', to: [mail], subject: `📊 Die Lernwoche von ${namen}`, html }),
      })
      if (s.ok) {
        gesendet++
        if (!nurAn) await db.from('wochenbericht_log').upsert(ks.map((k) => ({ kind: k.id, gesendet: new Date().toISOString(), lektion: ((daten.get(k.id) ?? {})[`bfk.stand.${k.id}`] as Stand | undefined)?.lektion ?? 0 })))
      }
      if (nurAn) break
      await new Promise((r) => setTimeout(r, 600)) // Resend: höchstens 2 Mails pro Sekunde
    }
    return antwort({ gesendet, eltern: gruppen.size })
  } catch (e) {
    return antwort({ fehler: 'Fehler: ' + (e as Error).message }, 500)
  }
})
