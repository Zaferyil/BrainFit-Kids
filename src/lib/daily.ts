import { load, save } from './storage'

// Tageszähler für Tagesplan und Tagesaufgaben (vorerst auf dem Gerät).
export type Daily = { date: string; games: number; tasks: number; stations: number; minutes: number }

const today = () => new Date().toISOString().slice(0, 10)
const key = (kidId: string) => `bfk.daily.${kidId}`

export function getDaily(kidId: string): Daily {
  const d = load<Daily | null>(key(kidId), null)
  return d && d.date === today() ? d : { date: today(), games: 0, tasks: 0, stations: 0, minutes: 0 }
}

export function addDaily(kidId: string, add: Partial<Omit<Daily, 'date'>>) {
  const d = getDaily(kidId)
  save(key(kidId), {
    ...d,
    games: d.games + (add.games ?? 0),
    tasks: d.tasks + (add.tasks ?? 0),
    stations: d.stations + (add.stations ?? 0),
    minutes: d.minutes + (add.minutes ?? 0),
  })
  // Tagesziel: 20 Aufgaben am Tag
  if (d.tasks < 20 && d.tasks + (add.tasks ?? 0) >= 20) void import('./wirtschaft').then((w) => w.tageszielBelohnung(kidId))
}
