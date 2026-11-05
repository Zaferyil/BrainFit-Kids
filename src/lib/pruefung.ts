import { load, save } from './storage'

// Gürtel-Prüfung: pro Welt eine offizielle Prüfung. Bestanden = Urkunde.
export type Bestanden = { datum: string; richtig: number; von: number; sekunden: number }
export const PRUEFUNG = { aufgaben: 10, bestehen: 8, sekunden: 240 }
const key = (kid: string) => `bfk.pruefung.${kid}`
export const pruefungen = (kid: string) => load<Record<number, Bestanden>>(key(kid), {})
export function pruefungBestanden(kid: string, welt: number, b: Bestanden) {
  const alle = pruefungen(kid)
  const alt = alle[welt]
  if (!alt || b.richtig > alt.richtig || (b.richtig === alt.richtig && b.sekunden < alt.sekunden)) { alle[welt] = b; save(key(kid), alle) }
}
