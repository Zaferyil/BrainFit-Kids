// Lernweg Rechnen: 9 Welten, Reihenfolge wie in Abakuskids, MathKids und den Videos.
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
  { n: 1, name: 'Perlenland', topic: 'Abakus kennenlernen', units: ['Erd- und Himmelsperlen', '1 bis 9 einstellen', '10 bis 99 ablesen'], color: '#F2F0FF', ink: '#231A4F', belt: 'weißen', x: 90, y: 520 },
  { n: 2, name: 'Big-Friends-Insel', topic: 'Große Freunde (+)', units: ['+9 und +8', '+7 und +6', '+5 und +4', '+3, +2 und +1', 'Gemischt'], color: '#FFC531', ink: '#231A4F', belt: 'gelben', x: 250, y: 455 },
  { n: 3, name: 'Little-Friends-Wald', topic: 'Kleine Freunde (+)', units: ['+4 und +3', '+2 und +1', 'Gemischt'], color: '#FF8A1F', ink: '#231A4F', belt: 'orangen', x: 150, y: 320 },
  { n: 4, name: 'Best-Friends-Berg', topic: 'Beste Freunde (+)', units: ['+6 und +7', '+8 und +9', 'Gemischt'], color: '#3DBE5B', ink: '#10351B', belt: 'grünen', x: 320, y: 230 },
  { n: 5, name: 'Big-Friends-Höhle', topic: 'Große Freunde (−)', units: ['−9 und −8', '−7 und −6', '−5 und −4', '−3 und −2', '−1 und gemischt'], color: '#3BA7FF', ink: '#0B2E4F', belt: 'blauen', x: 500, y: 300 },
  { n: 6, name: 'Little-Friends-See', topic: 'Kleine Freunde (−)', units: ['−4 und −3', '−2 und −1', 'Gemischt'], color: '#A06BFF', ink: '#FFFFFF', belt: 'lila', x: 690, y: 260 },
  { n: 7, name: 'Best-Friends-Vulkan', topic: 'Beste Freunde (−)', units: ['−6 und −7', '−8 und −9', 'Gemischt'], color: '#FF4D6D', ink: '#FFFFFF', belt: 'roten', x: 640, y: 120 },
  { n: 8, name: 'Turbo-Stadt', topic: 'Wiederholung', units: ['Alle Regeln', 'Lange Ketten'], color: '#A8673A', ink: '#FFFFFF', belt: 'braunen', x: 450, y: 90 },
  { n: 9, name: 'Anzan-Galaxie', topic: 'Kopfrechnen', units: ['8 bis 10 Zahlen', '10 bis 12 Zahlen'], color: '#111111', ink: '#FFFFFF', belt: 'schwarzen', x: 230, y: 70 },
]
