import { WORLDS, type World } from '../data/curriculum'
import type { Kid } from '../data/demo'
import { ALLES_OFFEN } from './testmodus'
import { GAMES, type GameMeta } from '../games/registry'
import { getPlacement, tierFor, tierRank } from '../games/engine'
import type { Progress } from './progress'
import { load, save } from './storage'

// Der Lernweg auf der Karte: alle Welten nacheinander, nach jeder Rechen-Einheit ein Denkspiel.
// Der Weg ist linear – die erste noch offene Station ist „current“, alles danach ist gesperrt.

export type StopState = 'done' | 'current' | 'locked'
export type MapStop =
  | { kind: 'world'; id: string; world: World; state: StopState }
  | { kind: 'start'; id: string; state: StopState }
  | { kind: 'unit'; id: string; world: World; unit: number; name: string; state: StopState }
  | { kind: 'game'; id: string; game: GameMeta; state: StopState }

type Raw = MapStop extends infer T ? T extends MapStop ? Omit<T, 'state'> : never : never

const key = (kidId: string) => `bfk.mapstops.${kidId}`
const ACTIVE = 'bfk.mapstop'

export const doneStops = (kidId: string) => load<string[]>(key(kidId), [])

/** Merkt sich, dass ein Denkspiel von der Karte aus gestartet wurde. */
export function startStop(stopId: string) {
  try { sessionStorage.setItem(ACTIVE, stopId) } catch { /* nur Komfort */ }
}

/** Nach einem Denkspiel: die Station der Karte als erledigt markieren. Liefert true, wenn das Spiel von der Karte kam. */
export function finishActiveStop(kidId: string) {
  let id: string | null = null
  try { id = sessionStorage.getItem(ACTIVE); sessionStorage.removeItem(ACTIVE) } catch { /* egal */ }
  if (!id) return false
  const done = doneStops(kidId)
  if (!done.includes(id)) save(key(kidId), [...done, id])
  return true
}

export const cameFromMap = () => {
  try { return sessionStorage.getItem(ACTIVE) !== null } catch { return false }
}

export function buildPath(kid: Kid, progress: Progress): MapStop[] {
  const tier = tierFor(kid.birthYear)
  const games = GAMES.filter((g) => g.ready && tierRank(tier) >= tierRank(g.minTier))
  const done = new Set(doneStops(kid.id))
  const raw: Raw[] = []
  // Der Weg beginnt direkt mit Lektion 1; Perli kennenlernen bleibt bei den Denkspielen erreichbar.
  let g = 0
  for (const w of WORLDS) {
    raw.push({ kind: 'world', id: `welt-${w.n}`, world: w })
    w.units.forEach((name, i) => {
      raw.push({ kind: 'unit', id: `w${w.n}-e${i + 1}`, world: w, unit: i + 1, name })
      if (games.length) raw.push({ kind: 'game', id: `w${w.n}-e${i + 1}-spiel`, game: games[g++ % games.length] })
    })
  }
  const isDone = (s: Raw) => {
    if (s.kind === 'start') return getPlacement(kid.id) !== null
    if (s.kind === 'world') return s.world.n < progress.world
    if (s.kind === 'unit') return s.world.n < progress.world || (s.world.n === progress.world && s.unit < progress.unit)
    return done.has(s.id)
  }
  let found = false
  return raw.map((s) => {
    if (s.kind === 'world') return { ...s, state: s.world.n <= progress.world ? 'done' : 'locked' } as MapStop
    if (isDone(s)) return { ...s, state: 'done' } as MapStop
    if (!found) { found = true; return { ...s, state: 'current' } as MapStop }
    return { ...s, state: ALLES_OFFEN ? 'done' : 'locked' } as MapStop
  })
}

/** Spiel abgebrochen: die Karte zählt es nicht. */
export function clearActiveStop() {
  try { sessionStorage.removeItem(ACTIVE) } catch { /* egal */ }
}

/** Nächster Schritt auf dem Lernweg: Titel und Ziel für den großen „Los geht’s“-Knopf. */
export function nextStop(kid: Kid, progress: Progress) {
  const current = buildPath(kid, progress).find((s) => s.state === 'current' && s.kind !== 'world')
  if (!current || current.kind === 'world') return { title: 'Alles geschafft!', href: '#/inseln', go: () => {} }
  if (current.kind === 'unit') return { title: current.name, href: '#/einheit', go: () => {} }
  if (current.kind === 'game') return { title: current.game.name, href: `#/spiel/${current.game.id}`, go: () => startStop(current.id) }
  return { title: 'Perli kennenlernen', href: '#/einstufung', go: () => {} }
}
