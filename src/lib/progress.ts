import { load, save } from './storage'
import { STATIONS, type StationId } from '../data/units'

// Fortschritt eines Kindes, bis Supabase angebunden ist: nur auf diesem Gerät.
export type Progress = {
  /** aktuelle Welt und Einheit (1-basiert) */
  world: number
  unit: number
  /** Sterne je abgeschlossener Welt */
  worldStars: Record<number, number>
  /** Sterne je Station, Schlüssel "welt-einheit" */
  stationStars: Record<string, number[]>
  level: number
  /** Fortschritt bis zum nächsten Level, 0–100 */
  xp: number
  perlen: number
  gems: number
  streak: number
}

const fresh = (): Progress => ({ world: 1, unit: 1, worldStars: {}, stationStars: {}, level: 1, xp: 0, perlen: 0, gems: 0, streak: 0 })

const key = (kidId: string) => `bfk.progress.${kidId}`

export const getProgress = (kidId: string): Progress => ({ ...fresh(), ...load<Partial<Progress>>(key(kidId), {}) })
export const saveProgress = (kidId: string, p: Progress) => save(key(kidId), p)

export const unitKey = (p: Progress) => `${p.world}-${p.unit}`

export function stationStars(p: Progress) {
  return p.stationStars[unitKey(p)] ?? STATIONS.map(() => 0)
}

/** Erste Station ohne Sterne; alle davor sind offen. */
export function currentStation(p: Progress) {
  const stars = stationStars(p)
  const i = stars.findIndex((s) => s === 0)
  return i === -1 ? STATIONS.length : i
}

const XP_PER_STATION = 25

/** Speichert das Ergebnis einer Station und gibt die verdienten Perlen zurück. */
export function finishStation(kidId: string, station: StationId, stars: number, correct: number) {
  const p = getProgress(kidId)
  const k = unitKey(p)
  const all = stationStars(p).slice()
  const i = STATIONS.findIndex((s) => s.id === station)
  all[i] = Math.max(all[i], stars)
  const perlen = correct + stars * 10
  let xp = p.xp + XP_PER_STATION
  let level = p.level
  while (xp >= 100) { xp -= 100; level += 1 }
  saveProgress(kidId, { ...p, stationStars: { ...p.stationStars, [k]: all }, perlen: p.perlen + perlen, xp, level })
  return perlen
}

/** Boss besiegt: Einheit abschließen und zur nächsten Einheit oder Welt weitergehen. */
export function completeUnit(kidId: string, unitsInWorld: number, lastWorld: number) {
  const p = getProgress(kidId)
  const stars = stationStars(p)
  const avg = Math.round(stars.reduce((a, b) => a + b, 0) / stars.length)
  if (p.unit < unitsInWorld) {
    saveProgress(kidId, { ...p, unit: p.unit + 1 })
    return { worldDone: false }
  }
  const world = Math.min(p.world + 1, lastWorld)
  saveProgress(kidId, { ...p, world, unit: 1, worldStars: { ...p.worldStars, [p.world]: avg }, gems: p.gems + 1 })
  return { worldDone: true }
}
