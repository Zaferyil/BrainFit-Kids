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
  /** Zahlenbereich für Üben, Blitz, Kopfrechnen und Boss */
  range: [number, number]
  /** Beschriftung über dem Abakus */
  board: string
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
    range: [1, 9],
    board: 'Einer',
    discover: [
      { text: 'Das ist der Abakus. Die Stange zeigt die Einer.', say: 'Hallo! Das ist dein Abakus. Unten sind die Erdperlen, oben ist die Himmelsperle.', mood: 'happy', start: 0, goal: null },
      { text: 'Tippe eine Erdperle an. Sie wandert nach oben: 1.', say: 'Tippe auf die oberste gelbe Perle. Jede Erdperle ist 1 wert.', mood: 'happy', start: 0, goal: 1 },
      { text: 'Schiebe noch 2 Erdperlen hoch: 3.', say: 'Super! Jetzt noch zwei Erdperlen dazu. Dann sind es 3.', mood: 'happy', start: 1, goal: 3 },
      { text: 'Die Himmelsperle ist 5 wert. Schiebe sie nach unten.', say: 'Die grüne Perle oben ist die Himmelsperle. Sie ist so viel wert wie 5 Erdperlen!', mood: 'wow', start: 0, goal: 5 },
      { text: 'Stelle 7 ein: Himmelsperle und 2 Erdperlen.', say: '5 und 2 sind 7. Die Himmelsperle bleibt unten, dazu kommen 2 Erdperlen.', mood: 'think', start: 5, goal: 7 },
      { text: 'Fertig! Erdperle = 1, Himmelsperle = 5.', say: 'Toll gemacht! Jetzt kennst du alle Perlen.', mood: 'cheer', start: 7, goal: null },
    ],
  },
  '1-2': {
    title: '1 bis 9 einstellen',
    lead: 'Jetzt stellst du jede Zahl von 1 bis 9 sicher und schnell ein.',
    rule: ['bis 4: nur Erdperlen', 'ab 5: Himmelsperle dazu'],
    learn: ['Zahlen bis 4 nur mit Erdperlen', 'Ab 5 hilft die Himmelsperle', 'Jede Zahl von 1 bis 9 ohne Zählen erkennen'],
    stationText: {
      video: 'Für diese Einheit gibt es kein eigenes Video.',
      entdecken: 'Perli zeigt dir 4, 6, 8 und 9.',
      ueben: '10 Aufgaben – einstellen und ablesen.',
      blitz: 'Der Abakus blitzt auf. Welche Zahl war es?',
      kopfrechnen: 'Stell dir die Perlen im Kopf vor.',
      boss: 'Besiege Grummel und hol dir den Pokal!',
    },
    cols: 1,
    range: [1, 9],
    board: 'Einer',
    discover: [
      { text: 'Bis 4 brauchst du nur Erdperlen. Stelle 4 ein.', say: 'Schiebe vier Erdperlen nach oben. Das ist die 4.', mood: 'happy', start: 0, goal: 4 },
      { text: 'Für 5 nimmst du die Himmelsperle – die Erdperlen gehen weg.', say: 'Fünf Erdperlen gibt es nicht. Darum: Erdperlen runter, Himmelsperle runter!', mood: 'wow', start: 0, goal: 5 },
      { text: 'Stelle 6 ein: Himmelsperle und 1 Erdperle.', say: '5 und 1 sind 6.', mood: 'happy', start: 5, goal: 6 },
      { text: 'Stelle 8 ein: Himmelsperle und 3 Erdperlen.', say: '5 und 3 sind 8.', mood: 'think', start: 6, goal: 8 },
      { text: 'Stelle 9 ein: alle Perlen an der Stange.', say: '9 ist die größte Zahl auf einer Stange: Himmelsperle und 4 Erdperlen.', mood: 'happy', start: 8, goal: 9 },
      { text: 'Fertig! Du kannst jetzt 1 bis 9 einstellen.', say: 'Super! Jetzt kannst du alle Zahlen bis 9.', mood: 'cheer', start: 9, goal: null },
    ],
  },
  '1-3': {
    title: '10 bis 99 ablesen',
    lead: 'Mit zwei Stangen rechnest du bis 99: links die Zehner, rechts die Einer.',
    rule: ['rechte Stange = Einer', 'linke Stange = Zehner'],
    learn: ['Die rechte Stange zeigt die Einer', 'Die linke Stange zeigt die Zehner', 'Zahlen von 10 bis 99 einstellen und ablesen'],
    stationText: {
      video: 'Für diese Einheit gibt es kein eigenes Video.',
      entdecken: 'Perli zeigt dir die Zehner-Stange.',
      ueben: '10 Aufgaben mit zwei Stangen.',
      blitz: 'Zwei Stangen blitzen auf. Welche Zahl war es?',
      kopfrechnen: 'Zehner und Einer im Kopf.',
      boss: 'Grummel kennt jetzt große Zahlen!',
    },
    cols: 2,
    range: [10, 99],
    board: 'Zehner · Einer',
    discover: [
      { text: 'Die rechte Stange sind die Einer, die linke die Zehner.', say: 'Jetzt hat dein Abakus zwei Stangen. Rechts sind die Einer, links die Zehner.', mood: 'happy', start: 0, goal: null },
      { text: 'Eine Erdperle bei den Zehnern ist 10. Stelle 10 ein.', say: 'Tippe eine gelbe Perle auf der linken Stange an. Das ist zehn!', mood: 'wow', start: 0, goal: 10 },
      { text: 'Stelle 30 ein: 3 Erdperlen bei den Zehnern.', say: 'Drei Zehner sind dreißig.', mood: 'happy', start: 10, goal: 30 },
      { text: 'Die Himmelsperle bei den Zehnern ist 50. Stelle 50 ein.', say: 'Die grüne Perle links ist fünfzig wert!', mood: 'wow', start: 0, goal: 50 },
      { text: 'Stelle 34 ein: 3 Zehner und 4 Einer.', say: 'Erst die Zehner links, dann die Einer rechts.', mood: 'think', start: 0, goal: 34 },
      { text: 'Fertig! Links Zehner, rechts Einer.', say: 'Toll! Jetzt kannst du Zahlen bis 99 lesen.', mood: 'cheer', start: 34, goal: null },
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

/** Beschreibt 0–99 in Perlen; bei zwei Stellen getrennt nach Zehnern und Einern. */
export function describeNumber(n: number) {
  if (n < 10) return describeDigit(n)
  return `Zehner: ${describeDigit(Math.floor(n / 10))} · Einer: ${describeDigit(n % 10)}`
}

/** Zufallszahl im Bereich, nicht gleich der vorigen. */
export function randomIn([min, max]: [number, number], prev?: number) {
  let n = prev
  while (n === prev) n = min + Math.floor(Math.random() * (max - min + 1))
  return n as number
}
