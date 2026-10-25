import { load, save } from '../lib/storage'

// Zorluk motoru – nur für Denkspiele. Rechnen ist für alle Kinder gleich.

export type Tier = 'A' | 'B' | 'C' | 'D'

export const TIERS: Record<Tier, { name: string; ages: string; start: number }> = {
  A: { name: 'Perlen-Küken', ages: '5–6', start: 2 },
  B: { name: 'Perlen-Entdecker', ages: '7–8', start: 4 },
  C: { name: 'Perlen-Profi', ages: '9–10', start: 8 },
  D: { name: 'Perlen-Meister', ages: '11–12', start: 11 },
}

const ORDER: Tier[] = ['A', 'B', 'C', 'D']
export const tierRank = (t: Tier) => ORDER.indexOf(t)

/** Alterskademe aus dem Geburtsjahr (nur das Jahr wird gespeichert). */
export function tierFor(birthYear: number, today = new Date()) {
  const age = today.getFullYear() - birthYear
  if (age <= 6) return 'A'
  if (age <= 8) return 'B'
  if (age <= 10) return 'C'
  return 'D'
}

export const MIN_LEVEL = 1
export const MAX_LEVEL = 20
/** In einer Sitzung steigt ein Spiel höchstens um so viele Stufen. */
const MAX_UPS_PER_SESSION = 2

const levelKey = (kidId: string) => `bfk.levels.${kidId}`
const sessionUps: Record<string, number> = {}

export function getLevel(kidId: string, gameId: string, tier: Tier) {
  const levels = load<Record<string, number>>(levelKey(kidId), {})
  return levels[gameId] ?? TIERS[tier].start
}

export function setLevel(kidId: string, gameId: string, level: number) {
  const levels = load<Record<string, number>>(levelKey(kidId), {})
  save(levelKey(kidId), { ...levels, [gameId]: level })
}

export type Adjustment = { from: number; to: number; change: 'up' | 'down' | 'same' }

/**
 * Nach jeder Runde: Leistung 0–1 → nächste Stufe.
 * Ziel sind etwa 75–85 % richtig: über 90 % eine Stufe schwerer, unter 60 % eine leichter.
 */
export function adjustLevel(kidId: string, gameId: string, tier: Tier, score: number): Adjustment {
  const from = getLevel(kidId, gameId, tier)
  const key = `${kidId}:${gameId}`
  let to = from
  if (score >= 0.9 && (sessionUps[key] ?? 0) < MAX_UPS_PER_SESSION) {
    to = Math.min(MAX_LEVEL, from + 1)
    sessionUps[key] = (sessionUps[key] ?? 0) + 1
  } else if (score < 0.6) {
    to = Math.max(MIN_LEVEL, from - 1)
  }
  setLevel(kidId, gameId, to)
  return { from, to, change: to > from ? 'up' : to < from ? 'down' : 'same' }
}

/** Perlen für eine Runde: 5 bis 15 je nach Leistung. */
export const perlenFor = (score: number) => 5 + Math.round(score * 10)

// Einstufung („Perli kennenlernen“): einmal pro Kind, kann übersprungen werden.
export type Placement = { status: 'done' | 'skipped'; date: string }
const placementKey = (kidId: string) => `bfk.placement.${kidId}`
export const getPlacement = (kidId: string) => load<Placement | null>(placementKey(kidId), null)
export const savePlacement = (kidId: string, status: Placement['status']) =>
  save(placementKey(kidId), { status, date: new Date().toISOString().slice(0, 10) })

/** Ergebnis der Einstufung → Verschiebung der Startstufe für einen ganzen Bereich. */
export function placementShift(score: number) {
  if (score >= 0.9) return 2
  if (score >= 0.75) return 1
  if (score < 0.5) return -1
  return 0
}
