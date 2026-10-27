// Lernweg Rechnen nach dem Soroban-Levelplan: Level 1 = 3 Welten (Big, Little, Best Friends), je Übung eine Einheit.
export type World = {
  n: number
  name: string
  topic: string
  units: string[]
  color: string
  ink: string
  belt: string
  /** Position auf der Karte (Mittelpunkt) */
  x: number
  y: number
}

export const WORLDS: World[] = [
  {
    n: 1, name: 'Big-Friends-Insel', topic: 'Abakus kennenlernen und Große Freunde (+)',
    units: ['Erd- und Himmelsperlen', 'Big Friend +9', 'Big Friend +8', 'Big Friend +7', 'Big Friend +6', 'Big Friend +5', 'Big Friend +4', 'Big Friend +3', 'Big Friend +2', 'Big Friend +1', 'Big Friends alle', 'Big Friends alle – Training'],
    color: '#FFC531', ink: '#231A4F', belt: 'weißen', x: 90, y: 520,
  },
  { n: 2, name: 'Little-Friends-Wald', topic: 'Kleine Freunde (+)', units: ['Little Friend 4', 'Little Friend 3', 'Little Friend 2', 'Little Friend 1', 'Little Friends alle', 'Little Friends alle – Training'], color: '#FF8A1F', ink: '#231A4F', belt: 'gelben', x: 250, y: 455 },
  { n: 3, name: 'Best-Friends-Berg', topic: 'Beste Freunde (+)', units: ['Best Friend 6', 'Best Friend 7', 'Best Friend 8', 'Best Friend 9', 'Wiederholung', 'Wiederholung – Training'], color: '#3DBE5B', ink: '#10351B', belt: 'orangen', x: 150, y: 320 },
]
