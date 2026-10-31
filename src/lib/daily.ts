import { load, save } from './storage'

// Tageszähler für Tagesplan und Tagesaufgaben (vorerst auf dem Gerät).
/** Monatswerte für den Lernbericht; „werte“ = Fähigkeiten 0–100 am Monatsende (siehe lib/bericht) */
export type Monat = { minuten: number; aufgaben: number; stationen: number; spiele: number; tage: string[]; werte?: Record<string, number> }

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
  // Monatssummen für den Lernbericht (Lernzeit, Aufgaben, Stationen, Denkspiele, Lerntage)
  const monat = today().slice(0, 7), vk = `bfk.verlauf.${kidId}`
  const v = load<Record<string, Monat>>(vk, {})
  const m = v[monat] ?? { minuten: 0, aufgaben: 0, stationen: 0, spiele: 0, tage: [] }
  save(vk, { ...v, [monat]: { ...m, minuten: m.minuten + (add.minutes ?? 0), aufgaben: m.aufgaben + (add.tasks ?? 0),
    stationen: m.stationen + (add.stations ?? 0), spiele: m.spiele + (add.games ?? 0), tage: m.tage.includes(today()) ? m.tage : [...m.tage, today()] } })
  // Tagesziel: 20 Aufgaben am Tag
  if (d.tasks < 20 && d.tasks + (add.tasks ?? 0) >= 20) void import('./wirtschaft').then((w) => w.tageszielBelohnung(kidId))
}
