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
    n: 1, name: 'Naturpark-Abenteuer', topic: 'Abakus kennenlernen und Große Freunde (+)',
    units: ['Erd- und Himmelsperlen', 'Big Friend +9', 'Big Friend +8', 'Big Friend +7', 'Big Friend +6', 'Big Friend +5', 'Big Friend +4', 'Big Friend +3', 'Big Friend +2', 'Big Friend +1', 'Big Friends alle', 'Big Friends alle – Training'],
    color: '#FFC531', ink: '#231A4F', belt: 'weißen', x: 90, y: 520,
  },
  { n: 2, name: 'Space-Abenteuer', topic: 'Kleine Freunde (+)', units: ['Little Friend 4', 'Little Friend 3', 'Little Friend 2', 'Little Friend 1', 'Little Friends alle', 'Little Friends alle – Training'], color: '#FF8A1F', ink: '#231A4F', belt: 'gelben', x: 250, y: 455 },
  { n: 3, name: 'Eiszauber-Abenteuer', topic: 'Beste Freunde (+)', units: ['Best Friend 6', 'Best Friend 7', 'Best Friend 8', 'Best Friend 9', 'Wiederholung', 'Wiederholung – Training'], color: '#3DBE5B', ink: '#10351B', belt: 'orangen', x: 150, y: 320 },
  { n: 4, name: 'Die magischen Pyramiden', topic: 'Große Freunde (−)', units: ['Big Friend −9', 'Big Friend −8', 'Big Friend −7', 'Big Friend −6', 'Big Friend −5', 'Big Friend −4', 'Big Friend −3', 'Big Friend −2', 'Big Friend −1', 'Big Friends Minus alle', 'Big Friends Minus – Training'], color: '#5FC8FF', ink: '#0B2B4A', belt: 'grünen', x: 250, y: 200 },
  { n: 5, name: 'Weltraum-Abenteuer', topic: 'Kleine Freunde (−) und gemischt', units: ['Little Friend −4', 'Little Friend −3', 'Little Friend −2', 'Little Friend −1', 'Little Friends Minus alle', 'Little Friends Minus – Training', 'Big & Little Friends Minus', 'Big Friends Plus & Minus', 'Little Friends Plus & Minus', 'Große Wiederholung', 'Weltraum-Training'], color: '#8A6BFF', ink: '#1B1446', belt: 'blauen', x: 150, y: 90 },
  { n: 6, name: 'Dino-Abenteuer', topic: 'Beste Freunde (−) und gemischt', units: ['Best Friend −6', 'Best Friend −7', 'Best Friend −8', 'Best Friend −9', 'Best Friends Minus alle', 'Best Friends Minus – Training', 'Best Friends Plus & Minus', 'Alle Freunde Minus', 'Alle Freunde Plus', 'Große Dino-Wiederholung', 'Dino-Training'], color: '#FF8A1F', ink: '#231A4F', belt: 'braunen', x: 250, y: 40 },
]
