import { WORLDS } from '../data/curriculum'
import { load, save } from './storage'
import { viewProgress } from './progress'

// Lernspur: jede Antwort (richtig/falsch, Antwortzeit) für Fehleranalyse, verteilte Wiederholung und die Tempo-Kurve im Bericht.

type Tag = { n: number; ok: number; ms: number; mitZeit: number }
export type Regel = { name: string; n: number; f: number; stufe: number; faellig: string | null }
type Spur = { tage: Record<string, Tag>; regeln: Record<string, Regel> }
const key = (kid: string) => `bfk.lernspur.${kid}`
const leer = (): Spur => ({ tage: {}, regeln: {} })
export const lernspur = (kid: string) => load<Spur>(key(kid), leer())

/** Abstände der Wiederholung in Tagen; nach der letzten Stufe gilt die Regel als sicher */
const ABSTAND = [1, 3, 7, 14]
const heute = () => new Date().toISOString().slice(0, 10)
const inTagen = (d: number) => new Date(Date.now() + d * 864e5).toISOString()

// Antwortzeit: die Zahlen-Tasten melden, wann eine Frage beantwortbar wurde
let frageSeit = 0
export const frageBereit = () => { frageSeit = Date.now() }

/** Eine Antwort merken. regel: Einheit „Welt-Einheit“ (z. B. „1-2“) oder null (z. B. Anzan) */
export function merkeAntwort(kid: string, ok: boolean, opt: { regel?: string | null; zeit?: boolean; wiederholung?: boolean } = {}) {
  const s = lernspur(kid)
  const t = (s.tage[heute()] ??= { n: 0, ok: 0, ms: 0, mitZeit: 0 })
  t.n++; if (ok) t.ok++
  const ms = Date.now() - frageSeit
  if (opt.zeit !== false && frageSeit && ms > 200 && ms < 60000) { t.ms += ms; t.mitZeit++ }
  // nur die letzten 90 Tage behalten
  const tage = Object.keys(s.tage).sort(); while (tage.length > 90) delete s.tage[tage.shift()!]

  const p = viewProgress(kid)
  const rk = opt.regel === undefined ? `${p.world}-${p.unit}` : opt.regel
  if (rk) {
    const [w, u] = rk.split('-').map(Number)
    const r = (s.regeln[rk] ??= { name: WORLDS[w - 1]?.units[u - 1] ?? rk, n: 0, f: 0, stufe: 0, faellig: null })
    r.n++
    if (!ok) { r.f++; r.stufe = 0; r.faellig = inTagen(ABSTAND[0]) }
    else if (opt.wiederholung && r.faellig) {
      r.stufe++
      r.faellig = r.stufe >= ABSTAND.length ? null : inTagen(ABSTAND[r.stufe])
    }
  }
  save(key(kid), s)
}

/** Regeln, die heute wiederholt werden sollen (meiste Fehler zuerst) */
export function faelligeRegeln(kid: string) {
  const jetzt = Date.now()
  return Object.entries(lernspur(kid).regeln)
    .filter(([, r]) => r.faellig && new Date(r.faellig).getTime() <= jetzt)
    .sort((a, b) => b[1].f / b[1].n - a[1].f / a[1].n)
    .map(([k, r]) => ({ key: k, ...r }))
}

/** Schwierigste Regeln (Fehlerquote), für den Bericht */
export function schwierigeRegeln(kid: string, max = 4) {
  return Object.entries(lernspur(kid).regeln)
    .filter(([, r]) => r.n >= 4 && r.f > 0)
    .map(([k, r]) => ({ key: k, ...r, quote: r.f / r.n }))
    .sort((a, b) => b.quote - a.quote)
    .slice(0, max)
}

/** Verlauf je Tag: Genauigkeit (%) und Ø Antwortzeit (s) */
export function verlauf(kid: string, tage = 14) {
  return Object.entries(lernspur(kid).tage).sort(([a], [b]) => a.localeCompare(b)).slice(-tage)
    .map(([d, t]) => ({ tag: d, prozent: Math.round((t.ok / t.n) * 100), sek: t.mitZeit ? t.ms / t.mitZeit / 1000 : null, n: t.n }))
}
