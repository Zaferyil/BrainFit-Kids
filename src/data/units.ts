import type { IconName } from '../components/Icon'

// Inhalte je Einheit. Bisher nur Welt 1 · Einheit 1, die übrigen folgen mit curriculum.json.

export type StationId = 'video' | 'entdecken' | 'ueben' | 'blitz' | 'kopfrechnen' | 'boss'

export const STATIONS: { id: StationId; title: string; icon: IconName | 'bead'; color: string }[] = [
  { id: 'video', title: 'Video ansehen', icon: 'video', color: '#3BA7FF' },
  { id: 'entdecken', title: 'Entdecken', icon: 'sparkle', color: '#A06BFF' },
  { id: 'ueben', title: 'Üben mit Abakus', icon: 'bead', color: '#FFC531' },
  { id: 'blitz', title: 'Blitz-Training', icon: 'bolt', color: '#FF8A1F' },
  { id: 'kopfrechnen', title: 'Kopfrechnen', icon: 'brain', color: '#3DBE5B' },
  { id: 'boss', title: 'Boss-Kampf', icon: 'sword', color: '#FF4D6D' },
]

export type DiscoverStep = {
  text: string
  say: string
  mood: 'happy' | 'cheer' | 'think' | 'wow'
  /** Wert, mit dem der Abakus in diesem Schritt startet */
  start: number
  /** Ziel, das das Kind selbst einstellen soll; null = nur ansehen */
  goal: number | null
}

export type UnitContent = {
  title: string
  lead: string
  rule: string[]
  learn: string[]
  stationText: Record<StationId, string>
  cols: number
  discover: DiscoverStep[]
}

const UNITS: Record<string, UnitContent> = {
  '1-1': {
    title: 'Erd- und Himmelsperlen',
    lead: 'Lerne die Perlen kennen: Was ist eine Perle wert?',
    rule: ['Erdperle = 1', 'Himmelsperle = 5'],
    learn: ['Unten sind 4 Erdperlen. Jede ist 1 wert.', 'Oben ist die Himmelsperle. Sie ist 5 wert.', 'Zahlen von 1 bis 9 einstellen'],
    stationText: {
      video: 'Frau Lehrerin zeigt dir den Abakus.',
      entdecken: 'Perli zeigt dir jede Perle.',
      ueben: '10 Aufgaben – du schiebst die Perlen.',
      blitz: 'Der Abakus blitzt auf. Welche Zahl war es?',
      kopfrechnen: 'Stell dir die Perlen im Kopf vor.',
      boss: 'Besiege Grummel und hol dir den Pokal!',
    },
    cols: 1,
    discover: [
      { text: 'Das ist der Abakus. Die Stange zeigt die Einer.', say: 'Hallo! Das ist dein Abakus. Unten sind die Erdperlen, oben ist die Himmelsperle.', mood: 'happy', start: 0, goal: null },
      { text: 'Tippe eine Erdperle an. Sie wandert nach oben: 1.', say: 'Tippe auf die oberste gelbe Perle. Jede Erdperle ist 1 wert.', mood: 'happy', start: 0, goal: 1 },
      { text: 'Schiebe noch 2 Erdperlen hoch: 3.', say: 'Super! Jetzt noch zwei Erdperlen dazu. Dann sind es 3.', mood: 'happy', start: 1, goal: 3 },
      { text: 'Die Himmelsperle ist 5 wert. Schiebe sie nach unten.', say: 'Die grüne Perle oben ist die Himmelsperle. Sie ist so viel wert wie 5 Erdperlen!', mood: 'wow', start: 0, goal: 5 },
      { text: 'Stelle 7 ein: Himmelsperle und 2 Erdperlen.', say: '5 und 2 sind 7. Die Himmelsperle bleibt unten, dazu kommen 2 Erdperlen.', mood: 'think', start: 5, goal: 7 },
      { text: 'Fertig! Erdperle = 1, Himmelsperle = 5.', say: 'Toll gemacht! Jetzt kennst du alle Perlen.', mood: 'cheer', start: 7, goal: null },
    ],
  },
}

export const unitContent = (world: number, unit: number) => UNITS[`${world}-${unit}`] ?? null

/** Beschreibt eine Zahl 0–9 in Perlen, z. B. für Tipps. */
export function describeDigit(n: number) {
  const earth = n % 5
  const earthText = earth === 1 ? '1 Erdperle' : `${earth} Erdperlen`
  if (n < 5) return n === 0 ? 'keine Perle' : earthText
  return earth === 0 ? 'die Himmelsperle' : `die Himmelsperle und ${earthText}`
}
