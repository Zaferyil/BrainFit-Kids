import { load, save } from './storage'

// Fortschritt eines Kindes, bis Supabase angebunden ist: nur auf diesem Gerät.
export type Progress = {
  /** aktuelle Welt und Einheit (1-basiert) */
  world: number
  unit: number
  /** Sterne je abgeschlossener Welt */
  worldStars: Record<number, number>
  level: number
  xp: number
  perlen: number
  gems: number
  streak: number
}

const fresh = (): Progress => ({ world: 1, unit: 1, worldStars: {}, level: 1, xp: 0, perlen: 0, gems: 0, streak: 0 })

const key = (kidId: string) => `bfk.progress.${kidId}`

export const getProgress = (kidId: string) => ({ ...fresh(), ...load<Partial<Progress>>(key(kidId), {}) })
export const saveProgress = (kidId: string, p: Progress) => save(key(kidId), p)
