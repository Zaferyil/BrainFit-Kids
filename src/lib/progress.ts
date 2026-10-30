import { load, save } from './storage'
import { STATIONS, type StationId } from '../data/units'
import { addDaily } from './daily'
import { unitVideos } from '../data/videos'
import { ALLES_OFFEN } from './testmodus'
import { buchAuftrag } from '../data/buch'

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
  /** Kind hat kein Arbeitsbuch: die Buch-Station wird übersprungen */
  ohneBuch?: boolean
}

const fresh = (): Progress => ({ world: 1, unit: 1, worldStars: {}, stationStars: {}, level: 1, xp: 0, perlen: 0, gems: 0, streak: 0 })

const key = (kidId: string) => `bfk.progress.${kidId}`

export const getProgress = (kidId: string): Progress => ({ ...fresh(), ...load<Partial<Progress>>(key(kidId), {}) })
export const saveProgress = (kidId: string, p: Progress) => save(key(kidId), p)

export const unitKey = (p: Progress) => `${p.world}-${p.unit}`

// Wiederholen: Auf der Karte kann ein Kind eine schon geschaffte Einheit noch einmal öffnen.
// Die Einheit und ihre Stationen zeigen dann diese Einheit; der eigentliche Fortschritt bleibt, wo er ist.
const viewKey = (kidId: string) => `bfk.ansicht.${kidId}`
const isBefore = (a: { world: number; unit: number }, b: { world: number; unit: number }) => a.world < b.world || (a.world === b.world && a.unit < b.unit)

/** Öffnet eine geschaffte Einheit zum Wiederholen; null = wieder die aktuelle Einheit. */
export function setReplay(kidId: string, unit: { world: number; unit: number } | null) {
  save(viewKey(kidId), unit)
}

/** Fortschritt so, wie Einheit und Stationen ihn sehen: bei einer Wiederholung mit deren Welt und Einheit. */
export function viewProgress(kidId: string): Progress {
  const p = getProgress(kidId)
  const v = load<{ world: number; unit: number } | null>(viewKey(kidId), null)
  return v && (isBefore(v, p) || ALLES_OFFEN) ? { ...p, world: v.world, unit: v.unit } : p
}

export const isReplay = (kidId: string) => {
  const v = viewProgress(kidId)
  const p = getProgress(kidId)
  return v.world !== p.world || v.unit !== p.unit
}

export function stationStars(p: Progress) {
  return p.stationStars[unitKey(p)] ?? STATIONS.map(() => 0)
}

/** Station ohne Inhalt in dieser Einheit (z. B. kein Video) – wird übersprungen. */
export function stationSkipped(p: Progress, index: number) {
  const id = STATIONS[index].id
  if (id === 'buch') return !!p.ohneBuch || !buchAuftrag(p.world, p.unit, 1)
  return id === 'video' && unitVideos(p.world, p.unit).length === 0
}

/** Erste Station ohne Sterne; alle davor sind offen. */
export function currentStation(p: Progress) {
  const stars = stationStars(p)
  const i = stars.findIndex((s, k) => s === 0 && !stationSkipped(p, k))
  if (ALLES_OFFEN) return STATIONS.length
  return i === -1 ? STATIONS.length : i
}

const XP_PER_STATION = 25

/** Speichert das Ergebnis einer Station und gibt die verdienten Perlen zurück. */
/** belohnen = false: nur die Sterne der Station setzen (z. B. Hausaufgabe schon einmal belohnt) */
export function finishStation(kidId: string, station: StationId, stars: number, correct: number, belohnen = true) {
  const p = getProgress(kidId)
  const v = viewProgress(kidId)
  const k = unitKey(v)
  const all = stationStars(v).slice()
  const i = STATIONS.findIndex((s) => s.id === station)
  all[i] = Math.max(all[i], stars)
  if (!belohnen) { saveProgress(kidId, { ...p, stationStars: { ...p.stationStars, [k]: all } }); return 0 }
  const perlen = correct + stars * 10
  let xp = p.xp + XP_PER_STATION
  let level = p.level
  while (xp >= 100) { xp -= 100; level += 1 }
  saveProgress(kidId, { ...p, stationStars: { ...p.stationStars, [k]: all }, perlen: p.perlen + perlen, xp, level })
  addDaily(kidId, { stations: 1, tasks: correct, minutes: 3 })
  return perlen
}

/** Boss besiegt: Einheit abschließen und zur nächsten Einheit oder Welt weitergehen. */
export function completeUnit(kidId: string, unitsInWorld: number, lastWorld: number) {
  // Wiederholung geschafft: nur zurück zur aktuellen Einheit, der Weg rückt nicht weiter
  if (isReplay(kidId)) {
    setReplay(kidId, null)
    return { worldDone: false }
  }
  const p = getProgress(kidId)
  const stars = stationStars(p).filter((_, k) => !stationSkipped(p, k))
  const avg = Math.round(stars.reduce((a, b) => a + b, 0) / stars.length)
  if (p.unit < unitsInWorld) {
    saveProgress(kidId, { ...p, unit: p.unit + 1 })
    return { worldDone: false }
  }
  const world = Math.min(p.world + 1, lastWorld)
  saveProgress(kidId, { ...p, world, unit: 1, worldStars: { ...p.worldStars, [p.world]: avg }, gems: p.gems + 1 })
  return { worldDone: true }
}

/** Perlen und XP aus einem Denkspiel gutschreiben. */
export function rewardGame(kidId: string, perlen: number) {
  const p = getProgress(kidId)
  let xp = p.xp + 10
  let level = p.level
  while (xp >= 100) { xp -= 100; level += 1 }
  saveProgress(kidId, { ...p, perlen: p.perlen + perlen, xp, level })
  addDaily(kidId, { games: 1, minutes: 2 })
}

/** „Ich habe kein Buch“: Buch-Station für dieses Kind dauerhaft überspringen (umkehrbar) */
export function setOhneBuch(kidId: string, ohne: boolean) {
  saveProgress(kidId, { ...getProgress(kidId), ohneBuch: ohne })
}
