import type { IconName } from '../components/Icon'

// Inhalte je Einheit. Bisher nur Welt 1 · Einheit 1, die übrigen folgen mit curriculum.json.

export type StationId = 'video' | 'entdecken' | 'ueben' | 'blitz' | 'kopfrechnen' | 'buch' | 'boss'

export const STATIONS: { id: StationId; title: string; icon: IconName | 'bead'; color: string }[] = [
  { id: 'video', title: 'Video ansehen', icon: 'video', color: '#3BA7FF' },
  { id: 'entdecken', title: 'Entdecken', icon: 'sparkle', color: '#A06BFF' },
  { id: 'ueben', title: 'Üben mit Abakus', icon: 'bead', color: '#FFC531' },
  { id: 'blitz', title: 'Blitz-Training', icon: 'bolt', color: '#FF8A1F' },
  { id: 'kopfrechnen', title: 'Kopfrechnen', icon: 'brain', color: '#3DBE5B' },
  { id: 'buch', title: 'Mein Arbeitsbuch', icon: 'book', color: '#3BA7FF' },
  { id: 'boss', title: 'Abschlusstest', icon: 'sword', color: '#FF4D6D' },
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
  /** Rechen-Einheit (z. B. Big Friend +9): Üben, Blitz, Kopfrechnen und Boss fragen „a + add“ statt einer Zahl */
  add?: number
  /** Gemischte Wiederholung (z. B. alle Big Friends): jede Aufgabe nimmt zufällig eines dieser „+k“ */
  adds?: number[]
}

const UNITS: Record<string, UnitContent> = {
  '1-1': {
    title: 'Erd- und Himmelsperlen',
    lead: 'Lerne die Perlen kennen: Was ist eine Perle wert?',
    rule: ['Erdperle = 1', 'Himmelsperle = 5'],
    learn: ['Unten sind 4 Erdperlen. Jede ist 1 wert.', 'Oben ist die Himmelsperle. Sie ist 5 wert.', 'Zahlen von 1 bis 9 einstellen'],
    stationText: {
      video: 'Der Video-Tutor zeigt dir den Abakus.',
      entdecken: 'Perli zeigt dir jede Perle.',
      ueben: 'Du schiebst die Perlen.',
      blitz: 'Der Abakus blitzt auf. Welche Zahl war es?',
      kopfrechnen: 'Stell dir die Perlen im Kopf vor.',
      buch: 'Rechne im Buch und hake ab.',
      boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
    },
    cols: 1,
    range: [1, 9],
    board: 'Einer',
    discover: [
      { text: 'Das ist der Abakus. Die Stange zeigt die Einer.', say: 'Hallo! Das ist dein Abakus. Unten sind die Erdperlen, oben ist die Himmelsperle.', mood: 'happy', start: 0, goal: null },
      { text: 'Tippe eine Erdperle an. Sie wandert nach oben: 1.', say: 'Tippe auf die rote Perle unter dem Balken. Jede Erdperle ist 1 wert.', mood: 'happy', start: 0, goal: 1 },
      { text: 'Schiebe noch 2 Erdperlen hoch: 3.', say: 'Super! Jetzt noch zwei Erdperlen dazu. Dann sind es 3.', mood: 'happy', start: 1, goal: 3 },
      { text: 'Die Himmelsperle ist 5 wert. Schiebe sie nach unten.', say: 'Die grüne Perle oben ist die Himmelsperle. Sie ist so viel wert wie 5 Erdperlen!', mood: 'wow', start: 0, goal: 5 },
      { text: 'Stelle 7 ein: Himmelsperle und 2 Erdperlen.', say: '5 und 2 sind 7. Die Himmelsperle bleibt unten, dazu kommen 2 Erdperlen.', mood: 'think', start: 5, goal: 7 },
      { text: 'Fertig! Erdperle = 1, Himmelsperle = 5.', say: 'Toll gemacht! Jetzt kennst du alle Perlen.', mood: 'cheer', start: 7, goal: null },
    ],
  },
}

const ZAHLWORT = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn']

/** Big-Friend-Einheit +k. Beispiel: kleinste Startzahl a, bei der der Trick nötig ist (mindestens 3). */
const bigFriend = (k: number, lead: string, say: string, a = Math.max(3, 10 - k)): UnitContent => ({
  title: `Big Friend +${k}`,
  lead,
  rule: [`+${k} = +10 − ${10 - k}`],
  learn: [`${k} und ${10 - k} sind zusammen 10`, `Plus ${k} heißt: 10 dazu, ${10 - k} weg`, 'Mit dem Abakus und im Kopf rechnen'],
  stationText: {
    video: `Der Video-Tutor zeigt dir den Trick für +${k}.`,
    entdecken: `Perli rechnet mit dir Schritt für Schritt +${k}.`,
    ueben: `Du rechnest +${k} mit dem Abakus.`,
    blitz: `Der Abakus blitzt auf. Rechne +${k} dazu!`,
    kopfrechnen: `Rechne +${k} im Kopf.`,
    buch: 'Rechne im Buch und hake ab.',
    boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
  },
  cols: 2,
  range: [10 - k, 9],
  board: 'Zehner · Einer',
  add: k,
  discover: [
    { text: `Big Friends: ${k} und ${10 - k} sind 10.`, say, mood: 'happy', start: 0, goal: null },
    { text: `Stelle zuerst die ${a} ein.`, say: a === 3 ? 'Stell zuerst die drei ein. Drei Erdperlen bei den Einern hoch.' : `Stell zuerst die ${ZAHLWORT[a]} ein.`, mood: 'happy', start: 0, goal: a },
    { text: 'Jetzt 10 dazu: eine Perle bei den Zehnern hoch.', say: 'Jetzt zehn dazu: Eine Perle bei den Zehnern hoch.', mood: 'think', start: a, goal: a + 10 },
    { text: `Und ${10 - k} weg: bei den Einern runter.`, say: `Und jetzt ${ZAHLWORT[10 - k]} weg: Bei den Einern runter.`, mood: 'think', start: a + 10, goal: a + k },
    { text: `Fertig! ${a} + ${k} = ${a + k}.`, say: `Super! ${ZAHLWORT[a][0].toUpperCase()}${ZAHLWORT[a].slice(1)} plus ${ZAHLWORT[k]} ist ${ZAHLWORT[a + k]}.`, mood: 'cheer', start: a + k, goal: null },
  ],
})

UNITS['1-4'] = bigFriend(7, 'Der Trick für +7: 10 dazu und 3 weg.', 'Sieben und drei sind zusammen zehn. Drei ist der Big Friend von sieben. Jetzt rechnen wir drei plus sieben!')
UNITS['1-5'] = bigFriend(6, 'Der Trick für +6: 10 dazu und 4 weg.', 'Sechs und vier sind zusammen zehn. Vier ist der Big Friend von sechs. Jetzt rechnen wir vier plus sechs!')
UNITS['1-6'] = bigFriend(5, 'Der Trick für +5: 10 dazu und 5 weg.', 'Fünf und fünf sind zusammen zehn. Fünf ist der Big Friend von fünf. Jetzt rechnen wir fünf plus fünf!')
UNITS['1-7'] = bigFriend(4, 'Der Trick für +4: 10 dazu und 6 weg.', 'Vier und sechs sind zusammen zehn. Sechs ist der Big Friend von vier. Jetzt rechnen wir sechs plus vier!')
UNITS['1-8'] = bigFriend(3, 'Der Trick für +3: 10 dazu und 7 weg.', 'Drei und sieben sind zusammen zehn. Sieben ist der Big Friend von drei. Jetzt rechnen wir sieben plus drei!')
UNITS['1-9'] = bigFriend(2, 'Der Trick für +2: 10 dazu und 8 weg.', 'Zwei und acht sind zusammen zehn. Acht ist der Big Friend von zwei. Jetzt rechnen wir acht plus zwei!')
UNITS['1-10'] = bigFriend(1, 'Der Trick für +1: 10 dazu und 9 weg.', 'Eins und neun sind zusammen zehn. Neun ist der Big Friend von eins. Jetzt rechnen wir neun plus eins!')
UNITS['1-3'] = bigFriend(8, 'Der Trick für +8: 10 dazu und 2 weg.', 'Acht und zwei sind zusammen zehn. Zwei ist der Big Friend von acht. Jetzt rechnen wir drei plus acht!')
UNITS['1-2'] = bigFriend(9, 'Der Trick für +9: 10 dazu und 1 weg.', 'Neun und eins sind zusammen zehn. Eins ist der Big Friend von neun. Jetzt rechnen wir drei plus neun!')

/** Wiederholung aller Big Friends (+9 … +1 gemischt) */
const alleBigFriends = (title: string, lead: string, b1: [number, number], b2: [number, number]): UnitContent => ({
  title,
  lead,
  rule: ['+k = +10 − Big Friend'],
  learn: ['Alle Big Friends: 9+1, 8+2, 7+3, 6+4, 5+5', 'Gemischt rechnen: 10 dazu, Big Friend weg', 'Mit dem Abakus und im Kopf rechnen'],
  stationText: {
    video: 'Der Video-Tutor wiederholt alle Big Friends.',
    entdecken: 'Perli rechnet mit dir zwei gemischte Aufgaben.',
    ueben: 'Du rechnest alle Big Friends gemischt.',
    blitz: 'Der Abakus blitzt auf. Rechne dazu!',
    kopfrechnen: 'Rechne alle Big Friends im Kopf.',
    buch: 'Rechne im Buch und hake ab.',
    boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
  },
  cols: 2,
  range: [1, 9],
  board: 'Zehner · Einer',
  adds: [9, 8, 7, 6, 5, 4, 3, 2, 1],
  discover: [
    { text: 'Alle Big Friends: 9+1, 8+2, 7+3, 6+4, 5+5.', say: 'Du kennst jetzt alle Big Friends. Jetzt mischen wir sie!', mood: 'happy', start: 0, goal: null },
    ...[b1, b2].flatMap(([a, k]) => [
      { text: `Stelle die ${a} ein.`, say: `Stell die ${ZAHLWORT[a]} ein.`, mood: 'happy' as const, start: 0, goal: a },
      { text: `+${k}: zuerst 10 dazu.`, say: `Plus ${ZAHLWORT[k]}: Zuerst zehn dazu, eine Perle bei den Zehnern hoch.`, mood: 'think' as const, start: a, goal: a + 10 },
      { text: `Dann ${10 - k} weg.`, say: `Dann ${ZAHLWORT[10 - k]} weg bei den Einern.`, mood: 'think' as const, start: a + 10, goal: a + k },
    ]),
    { text: `Fertig! ${b1[0]} + ${b1[1]} = ${b1[0] + b1[1]} und ${b2[0]} + ${b2[1]} = ${b2[0] + b2[1]}.`, say: 'Super! Du kannst alle Big Friends.', mood: 'cheer', start: b2[0] + b2[1], goal: null },
  ],
})
UNITS['1-11'] = alleBigFriends('Big Friends alle', 'Alle Big Friends gemischt wiederholen.', [8, 3], [9, 6])
UNITS['1-12'] = alleBigFriends('Big Friends alle – Training', 'Training: alle Big Friends gemischt.', [9, 2], [8, 5])

/** Rechenaufgabe für eine Big-Friend-Einheit: a (Einer, bei denen der Trick nötig ist) + add. */
export function makeSum(content: UnitContent, prev?: number) {
  if (content.adds?.length) {
    // gemischt: zuerst ein Big Friend, dann ein Einer, bei dem der Trick nötig ist
    const b = content.adds[Math.floor(Math.random() * content.adds.length)]
    const a = randomIn([10 - b, 9], prev)
    return { a, b, n: a + b }
  }
  const a = randomIn(content.range, prev)
  const b = content.add ?? 0
  return { a, b, n: a + b }
}

/** Rechnet die Einheit „a + b“ (ein fester Big Friend oder gemischt)? */
export const rechnet = (content: UnitContent) => !!content.add || !!content.adds?.length

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
  // nur eine Zahl im Bereich (z. B. +1: nur 9): Wiederholung erlauben, sonst Endlosschleife
  if (min >= max) return min
  let n = prev
  while (n === prev) n = min + Math.floor(Math.random() * (max - min + 1))
  return n as number
}
