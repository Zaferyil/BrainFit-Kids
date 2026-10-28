import { CLASSES, type Kid } from '../data/demo'
import { STATIONS } from '../data/units'
import { getProgress } from './progress'
import { load } from './storage'

// Rangliste: Kinder werden nur mit Kindern derselben Klassenstufe verglichen,
// in einer Gesamtwertung und in pädagogischen Bereichen.
// Bis Supabase angebunden ist, liegen echte Daten nur für Kinder auf diesem Gerät vor;
// fehlende Mitschüler werden mit gleichbleibenden Beispielwerten ergänzt (als „Beispiel“ markiert).

export type Bereich = 'gesamt' | 'rechnen' | 'tempo' | 'konzentration' | 'aufmerksamkeit' | 'gedaechtnis'

export const BEREICHE: { id: Bereich; name: string; text: string }[] = [
  { id: 'gesamt', name: 'Gesamt', text: 'Gesammelte Perlen' },
  { id: 'rechnen', name: 'Rechnen', text: 'Üben, Kopfrechnen und Boss' },
  { id: 'tempo', name: 'Tempo', text: 'Blitz-Abakus und Schnell zählen' },
  { id: 'konzentration', name: 'Konzentration', text: 'Perlen-Jagd und Farb-Wort' },
  { id: 'aufmerksamkeit', name: 'Aufmerksamkeit', text: 'Zahlen vergleichen und Muster' },
  { id: 'gedaechtnis', name: 'Gedächtnis', text: 'Memory, Perlen-Kette, Zahlen merken' },
]

/** Welche Denkspiele in welchen Bereich zählen */
const SPIELE: Partial<Record<Bereich, string[]>> = {
  tempo: ['schnellzaehlen'],
  konzentration: ['jagd', 'farbwort'],
  aufmerksamkeit: ['vergleich', 'muster'],
  gedaechtnis: ['memory', 'kette', 'zahlenmerken'],
}

export type Eintrag = { id: string; name: string; kid?: Kid; beispiel: boolean; werte: Record<Bereich, number> }

/** Klassenstufe eines Kindes: gewählt bei der Anmeldung, sonst aus dem Geburtsjahr geschätzt */
export function stufeVon(kid: Kid) {
  const gewaehlt = load<number | null>(`bfk.stufe.${kid.id}`, null)
  if (gewaehlt !== null) return gewaehlt
  return Math.max(0, Math.min(6, new Date().getFullYear() - kid.birthYear - 6))
}

const mittel = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

/** Werte 0–100 aus den gespeicherten Daten des Kindes */
export function echteWerte(kid: Kid): Record<Bereich, number> {
  const p = getProgress(kid.id)
  const levels = load<Record<string, number>>(`bfk.levels.${kid.id}`, {})
  const sterne = (station: string) => {
    const i = STATIONS.findIndex((s) => s.id === station)
    return Object.values(p.stationStars).map((st) => st[i]).filter((s) => s > 0)
  }
  const spiel = (ids: string[]) => mittel(ids.filter((id) => levels[id] !== undefined).map((id) => (levels[id] / 20) * 100))
  const rechnen = mittel([...sterne('ueben'), ...sterne('kopfrechnen'), ...sterne('boss')]) / 3 * 100
  const blitz = mittel(sterne('blitz')) / 3 * 100
  return {
    gesamt: p.perlen,
    rechnen: Math.round(rechnen),
    tempo: Math.round(mittel([blitz, spiel(SPIELE.tempo!)].filter((x) => x > 0))),
    konzentration: Math.round(spiel(SPIELE.konzentration!)),
    aufmerksamkeit: Math.round(spiel(SPIELE.aufmerksamkeit!)),
    gedaechtnis: Math.round(spiel(SPIELE.gedaechtnis!)),
  }
}

// Gleichbleibende Beispielwerte (aus dem Namen berechnet), damit die Rangliste schon ohne Server zeigt, wie sie aussieht
function zufall(seed: string) {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)) >>> 0) / 4294967296
}
const NAMEN = ['Anna', 'Luca', 'Emma', 'Paul', 'Sofia', 'Leon', 'Hannah', 'Elias', 'Lea', 'David']

function beispiel(name: string, stufe: number): Eintrag {
  const r = zufall(`${name}-${stufe}`)
  const w = () => Math.round(35 + r() * 60)
  return { id: `bsp-${name}`, name, beispiel: true, werte: { gesamt: Math.round(80 + r() * 520), rechnen: w(), tempo: w(), konzentration: w(), aufmerksamkeit: w(), gedaechtnis: w() } }
}

/** Alle Kinder derselben Klassenstufe (mindestens 8 Einträge, Rest mit Beispielen aufgefüllt) */
export function vergleichsgruppe(kid: Kid): Eintrag[] {
  const stufe = stufeVon(kid)
  const klasse = CLASSES.find((c) => c.kids.some((k) => k.id === kid.id))
  const echte: Eintrag[] = (klasse?.kids ?? [kid]).filter((k) => stufeVon(k) === stufe)
    .map((k) => ({ id: k.id, name: k.name, kid: k, beispiel: false, werte: echteWerte(k) }))
  const fehlen = Math.max(0, 8 - echte.length)
  return [...echte, ...NAMEN.slice(0, fehlen).map((n) => beispiel(n, stufe))]
}

export function rangliste(gruppe: Eintrag[], bereich: Bereich) {
  return [...gruppe].sort((a, b) => b.werte[bereich] - a.werte[bereich])
}
