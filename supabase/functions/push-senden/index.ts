// Supabase Edge Function „push-senden“: wird alle 15 Minuten aufgerufen (pg_cron, siehe update-11-push.sql)
// und schickt fällige Push-Benachrichtigungen: Erinnerung + Serien-Warnung fürs Kind, Wochenbericht + Pause-Hinweis für Eltern.
// Secrets (Supabase → Edge Functions → Secrets): VAPID_PUBLIC, VAPID_PRIVATE, CRON_GEHEIM
// SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY stellt Supabase selbst bereit.
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
webpush.setVapidDetails('mailto:info@mentalmath.at', Deno.env.get('VAPID_PUBLIC')!, Deno.env.get('VAPID_PRIVATE')!)

const MAX_PRO_TAG = 2
const TAG_MS = 86_400_000

/** Uhrzeit, Wochentag und Datum in Österreich */
function wien(d = new Date()) {
  const t = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false })
    .formatToParts(d).map((p) => [p.type, p.value]))
  return { datum: `${t.year}-${t.month}-${t.day}`, minuten: (+t.hour % 24) * 60 + +t.minute, sonntag: t.weekday === 'Sun' }
}
const utcTag = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const hhmm = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }

type Abo = { id: number; endpoint: string; kind: string; rolle: 'kind' | 'eltern'; p256dh: string; auth: string }
type Nachricht = { art: string; title: string; body: string; url: string }

Deno.serve(async (req) => {
  if (req.headers.get('x-cron') !== Deno.env.get('CRON_GEHEIM')) return new Response('nein', { status: 401 })
  const jetzt = wien()
  // Nachtruhe: zwischen 20:00 und 08:00 nichts
  if (jetzt.minuten < 8 * 60 || jetzt.minuten >= 20 * 60) return Response.json({ ruhe: true })

  const { data: abos } = await db.from('push_abos').select('id, endpoint, kind, rolle, p256dh, auth')
  if (!abos?.length) return Response.json({ gesendet: 0 })
  const ids = [...new Set(abos.map((a) => a.kind))]
  const [{ data: kinder }, { data: einst }, { data: fort }, { data: log }] = await Promise.all([
    db.from('kinder').select('id, vorname').in('id', ids),
    db.from('push_einstellungen').select('*').in('kind', ids),
    db.from('fortschritt').select('kind, daten').in('kind', ids),
    db.from('push_log').select('kind, rolle, art, tag').in('kind', ids).gte('tag', utcTag(Date.now() - 8 * TAG_MS)),
  ])

  const heuteUtc = utcTag(Date.now())
  let gesendet = 0
  for (const id of ids) {
    const e = einst?.find((x) => x.kind === id)
    if (!e) continue
    const name = kinder?.find((k) => k.id === id)?.vorname ?? 'Dein Kind'
    const daten = (fort?.find((f) => f.kind === id)?.daten ?? {}) as Record<string, any>
    // Lerntage aus dem Verlauf (Monatssummen mit Liste der Tage)
    const tage = new Set<string>(Object.values((daten[`bfk.verlauf.${id}`] ?? {}) as Record<string, { tage?: string[] }>).flatMap((m) => m.tage ?? []))
    const d = daten[`bfk.daily.${id}`]
    const heuteGeuebt = tage.has(heuteUtc) || (d?.date === heuteUtc && (d.minutes > 0 || d.tasks > 0 || d.stations > 0 || d.games > 0))
    let serie = 0
    for (let i = 1; tage.has(utcTag(Date.now() - i * TAG_MS)); i++) serie++
    const woche = [...Array(7)].filter((_, i) => tage.has(utcTag(Date.now() - i * TAG_MS))).length
    const letzter = [...tage].sort().pop()
    const pauseTage = letzter ? Math.floor((Date.parse(heuteUtc) - Date.parse(letzter)) / TAG_MS) : 0

    const schonHeute = (rolle: string) => (log ?? []).filter((l) => l.kind === id && l.rolle === rolle && l.tag === jetzt.datum)
    const fuer: Record<'kind' | 'eltern', Nachricht[]> = { kind: [], eltern: [] }
    if (e.kind_an && !heuteGeuebt) {
      if (!jetzt.sonntag && jetzt.minuten >= hhmm(e.erinnerung))
        fuer.kind.push({ art: 'erinnerung', title: `Hallo ${name}! 🧠`, body: 'Zeit für deine 15 Minuten – SeZa wartet schon auf dich!', url: '/app/?push=1#/inseln' })
      if (e.serie_an && serie >= 2 && jetzt.minuten >= 19 * 60 + 30)
        fuer.kind.push({ art: 'serie', title: `🔥 Deine Serie ist in Gefahr!`, body: `${serie} Tage am Stück – nur eine Runde heute rettet sie!`, url: '/app/?push=1#/inseln' })
    }
    if (jetzt.minuten >= 18 * 60) {
      if (e.eltern_woche && jetzt.sonntag)
        fuer.eltern.push({ art: 'woche', title: '📊 Wochenbericht', body: `${name} hat diese Woche an ${woche} von 7 Tagen geübt.${serie >= 2 ? ` Aktuelle Serie: ${serie} Tage.` : ''} ${woche >= 4 ? 'Super!' : 'Jeder Tag zählt!'}`, url: '/app/#/eltern' })
      const pauseSchon = (log ?? []).some((l) => l.kind === id && l.rolle === 'eltern' && l.art === 'pause')
      if (e.eltern_pause && pauseTage >= 3 && !pauseSchon)
        fuer.eltern.push({ art: 'pause', title: '💡 Kleiner Anstoß', body: `${name} hat seit ${pauseTage} Tagen nicht geübt. Ein kurzer Anstoß hilft oft!`, url: '/app/#/eltern' })
    }

    for (const rolle of ['kind', 'eltern'] as const) {
      const heute = schonHeute(rolle)
      const ziel = abos.filter((a) => a.kind === id && a.rolle === rolle) as Abo[]
      if (!ziel.length) continue
      let anzahl = heute.length
      for (const n of fuer[rolle]) {
        if (anzahl >= MAX_PRO_TAG || heute.some((l) => l.art === n.art)) continue
        anzahl++
        await db.from('push_log').insert({ kind: id, rolle, art: n.art, tag: jetzt.datum })
        for (const a of ziel) {
          try {
            await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, JSON.stringify({ ...n, tag: `${rolle}-${n.art}` }), { TTL: 3600 })
            gesendet++
          } catch (err: any) {
            // Gerät abgemeldet oder App gelöscht → Abo entfernen
            if (err?.statusCode === 404 || err?.statusCode === 410) await db.from('push_abos').delete().eq('id', a.id)
            else console.warn('Push fehlgeschlagen', err?.statusCode, err?.body)
          }
        }
      }
    }
  }
  return Response.json({ gesendet })
})
