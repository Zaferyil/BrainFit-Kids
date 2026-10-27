import { load } from './storage'

// Schwierigkeit nach Klasse (bei der Anmeldung gewählt: 0 = Kiga, 1–6 = Klasse).
// Das Thema der Lektion bleibt für alle gleich; Klasse bestimmt Tempo, Menge, Stellen und Hilfe.

export type KlassenStufe = {
  name: string
  /** Kiga: Üben nur mit einer Stange und Zahlen bis 9 */
  eineStange: boolean
  /** Sekunden zwischen den Zahlen einer Kette (Anzan) */
  takt: number
  /** Wie lange der Blitz-Abakus sichtbar ist (ms) */
  blitzMs: number
  /** Aufgaben je Station (Üben, Blitz, Kopfrechnen) und Treffer beim Boss */
  aufgaben: number
  /** Tipp-Knopf beim Üben */
  tipp: boolean
}

export const KLASSEN: KlassenStufe[] = [
  { name: 'Kiga', eineStange: true, takt: 4, blitzMs: 2500, aufgaben: 6, tipp: true },
  { name: '1. Klasse', eineStange: false, takt: 4, blitzMs: 2000, aufgaben: 6, tipp: true },
  { name: '2. Klasse', eineStange: false, takt: 3, blitzMs: 1500, aufgaben: 8, tipp: true },
  { name: '3. Klasse', eineStange: false, takt: 3, blitzMs: 1200, aufgaben: 8, tipp: true },
  { name: '4. Klasse', eineStange: false, takt: 2.5, blitzMs: 1000, aufgaben: 10, tipp: false },
  { name: '5. Klasse', eineStange: false, takt: 2, blitzMs: 800, aufgaben: 10, tipp: false },
  { name: '6. Klasse', eineStange: false, takt: 2, blitzMs: 800, aufgaben: 10, tipp: false },
]

/** Einstellungen für die Klasse des Kindes; ohne Angabe wie 2. Klasse (entspricht dem Levelplan: 3 Sekunden) */
export function klasseVon(kidId: string): KlassenStufe {
  const n = load<number | null>(`bfk.stufe.${kidId}`, null)
  return KLASSEN[n ?? 2] ?? KLASSEN[2]
}
