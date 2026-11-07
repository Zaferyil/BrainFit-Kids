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
  /** Welche Freunde: Big Friends (über 10) oder Little Friends (über 5) – bestimmt die passenden Startzahlen */
  freunde?: 'big' | 'little' | 'best' | 'mix'
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

const KLEIN = ['null', 'eins', 'zwei', 'drei', 'vier']

/** Little-Friend-Einheit +k: „+k = +5 − (5−k)“. Startzahlen 5−k … 4: unten sind zu wenige Erdperlen frei, die Himmelsperle hilft. */
const littleFriend = (k: number, a: number): UnitContent => {
  const f = 5 - k
  return {
    title: `Little Friend +${k}`,
    lead: `Der Trick für +${k}: 5 dazu und ${f} weg.`,
    rule: [`+${k} = +5 − ${f}`],
    learn: [`${k} und ${f} sind zusammen 5`, `Plus ${k} heißt: Himmelsperle dazu, ${f} Erdperle${f > 1 ? 'n' : ''} weg`, 'Mit dem Abakus und im Kopf rechnen'],
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
    range: [5 - k, 4],
    board: 'Zehner · Einer',
    add: k,
    freunde: 'little',
    discover: [
      { text: `Little Friends: ${k} und ${f} sind 5.`, say: `${ZAHLWORT[k][0].toUpperCase()}${ZAHLWORT[k].slice(1)} und ${ZAHLWORT[f]} sind zusammen fünf. ${ZAHLWORT[f][0].toUpperCase()}${ZAHLWORT[f].slice(1)} ist der Little Friend von ${ZAHLWORT[k]}.`, mood: 'happy', start: 0, goal: null },
      { text: `Stelle zuerst die ${a} ein.`, say: `Stell zuerst die ${ZAHLWORT[a]} ein.`, mood: 'happy', start: 0, goal: a },
      { text: 'Jetzt 5 dazu: die Himmelsperle runter.', say: 'Jetzt fünf dazu: Schieb die Himmelsperle runter.', mood: 'think', start: a, goal: a + 5 },
      { text: `Und ${f} weg: Erdperle${f > 1 ? 'n' : ''} runter.`, say: `Und jetzt ${KLEIN[f]} weg: Erdperle${f > 1 ? 'n' : ''} nach unten.`, mood: 'think', start: a + 5, goal: a + k },
      { text: `Fertig! ${a} + ${k} = ${a + k}.`, say: `Super! ${ZAHLWORT[a][0].toUpperCase()}${ZAHLWORT[a].slice(1)} plus ${ZAHLWORT[k]} ist ${ZAHLWORT[a + k]}.`, mood: 'cheer', start: a + k, goal: null },
    ],
  }
}
UNITS['2-1'] = littleFriend(4, 3)
UNITS['2-2'] = littleFriend(3, 3)
UNITS['2-3'] = littleFriend(2, 3)
UNITS['2-4'] = littleFriend(1, 4)

/** Wiederholung aller Little Friends (+4 … +1 gemischt) */
const alleLittleFriends = (title: string, lead: string, b1: [number, number], b2: [number, number]): UnitContent => ({
  title,
  lead,
  rule: ['+k = +5 − Little Friend'],
  learn: ['Alle Little Friends: 4+1, 3+2', 'Gemischt rechnen: 5 dazu, Little Friend weg', 'Mit dem Abakus und im Kopf rechnen'],
  stationText: {
    video: 'Der Video-Tutor wiederholt alle Little Friends.',
    entdecken: 'Perli rechnet mit dir zwei gemischte Aufgaben.',
    ueben: 'Du rechnest alle Little Friends gemischt.',
    blitz: 'Der Abakus blitzt auf. Rechne dazu!',
    kopfrechnen: 'Rechne alle Little Friends im Kopf.',
    buch: 'Rechne im Buch und hake ab.',
    boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
  },
  cols: 2,
  range: [1, 4],
  board: 'Zehner · Einer',
  adds: [4, 3, 2, 1],
  freunde: 'little',
  discover: [
    { text: 'Alle Little Friends: 4+1 und 3+2.', say: 'Du kennst jetzt alle Little Friends. Jetzt mischen wir sie!', mood: 'happy', start: 0, goal: null },
    ...[b1, b2].flatMap(([a, k]) => [
      { text: `Stelle die ${a} ein.`, say: `Stell die ${ZAHLWORT[a]} ein.`, mood: 'happy' as const, start: 0, goal: a },
      { text: `+${k}: zuerst 5 dazu.`, say: `Plus ${ZAHLWORT[k]}: Zuerst fünf dazu, die Himmelsperle runter.`, mood: 'think' as const, start: a, goal: a + 5 },
      { text: `Dann ${5 - k} weg.`, say: `Dann ${KLEIN[5 - k]} weg bei den Erdperlen.`, mood: 'think' as const, start: a + 5, goal: a + k },
    ]),
    { text: `Fertig! ${b1[0]} + ${b1[1]} = ${b1[0] + b1[1]} und ${b2[0]} + ${b2[1]} = ${b2[0] + b2[1]}.`, say: 'Super! Du kannst alle Little Friends.', mood: 'cheer', start: b2[0] + b2[1], goal: null },
  ],
})
UNITS['2-5'] = alleLittleFriends('Little Friends alle', 'Alle Little Friends gemischt wiederholen.', [3, 4], [2, 3])
UNITS['2-6'] = alleLittleFriends('Little Friends alle – Training', 'Training: alle Little Friends gemischt.', [4, 2], [1, 4])

const GROSS = (w: string) => w[0].toUpperCase() + w.slice(1)

/** Best-Friend-Einheit +k (6–9): „+k = +(k−5) − 5 + 10“. Die 5 weg geht nur über die Himmelsperle – Little und Big Friend zusammen. */
const bestFriend = (k: number, a: number): UnitContent => {
  const e = k - 5
  const ePerlen = e === 1 ? 'eine Erdperle' : `${ZAHLWORT[e]} Erdperlen`
  return {
    title: `Best Friend +${k}`,
    lead: `Der Trick für +${k}: ${e} dazu, 5 weg, 10 dazu.`,
    rule: [`+${k} = +${e} − 5 + 10`],
    learn: [`Big Friend von ${k} ist ${10 - k} – aber ${10 - k} geht nicht direkt weg`, `Plus ${k} heißt: ${e} Erdperle${e > 1 ? 'n' : ''} dazu, Himmelsperle weg, 10 dazu`, 'Mit dem Abakus und im Kopf rechnen'],
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
    range: [5, 14 - k],
    board: 'Zehner · Einer',
    add: k,
    freunde: 'best',
    discover: [
      { text: `Best Friends: Big Friend und Little Friend helfen zusammen.`, say: `Plus ${ZAHLWORT[k]} heißt: zehn dazu und ${ZAHLWORT[10 - k]} weg. Aber manchmal geht ${ZAHLWORT[10 - k]} weg nicht direkt. Dann helfen die Best Friends!`, mood: 'happy', start: 0, goal: null },
      { text: `Stelle zuerst die ${a} ein.`, say: `Stell zuerst die ${ZAHLWORT[a]} ein.`, mood: 'happy', start: 0, goal: a },
      { text: `${e} dazu: ${e === 1 ? 'eine Erdperle' : `${e} Erdperlen`} hoch.`, say: `Zuerst ${ZAHLWORT[e]} dazu: ${GROSS(ePerlen)} hoch.`, mood: 'think', start: a, goal: a + e },
      { text: '5 weg: die Himmelsperle hoch.', say: 'Dann fünf weg: Schieb die Himmelsperle hoch.', mood: 'think', start: a + e, goal: a + e - 5 },
      { text: 'Jetzt 10 dazu: eine Perle bei den Zehnern hoch.', say: 'Jetzt zehn dazu: Eine Perle bei den Zehnern hoch.', mood: 'think', start: a + e - 5, goal: a + k },
      { text: `Fertig! ${a} + ${k} = ${a + k}.`, say: `Super! ${GROSS(ZAHLWORT[a])} plus ${ZAHLWORT[k]} ist ${ZAHLWORT[a + k]}.`, mood: 'cheer', start: a + k, goal: null },
    ],
  }
}
UNITS['3-1'] = bestFriend(6, 7)
UNITS['3-2'] = bestFriend(7, 6)
UNITS['3-3'] = bestFriend(8, 6)
UNITS['3-4'] = bestFriend(9, 5)

/** Wiederholung aller Best Friends (+6 … +9 gemischt) */
const alleBestFriends = (title: string, lead: string, b1: [number, number], b2: [number, number]): UnitContent => ({
  title,
  lead,
  rule: ['+k = +(k−5) − 5 + 10'],
  learn: ['Alle Best Friends: +6, +7, +8, +9', 'Gemischt rechnen: Erdperlen dazu, Himmelsperle weg, 10 dazu', 'Mit dem Abakus und im Kopf rechnen'],
  stationText: {
    video: 'Der Video-Tutor wiederholt alle Best Friends.',
    entdecken: 'Perli rechnet mit dir zwei gemischte Aufgaben.',
    ueben: 'Du rechnest alle Best Friends gemischt.',
    blitz: 'Der Abakus blitzt auf. Rechne dazu!',
    kopfrechnen: 'Rechne alle Best Friends im Kopf.',
    buch: 'Rechne im Buch und hake ab.',
    boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
  },
  cols: 2,
  range: [5, 8],
  board: 'Zehner · Einer',
  adds: [6, 7, 8, 9],
  freunde: 'best',
  discover: [
    { text: 'Alle Best Friends: +6, +7, +8 und +9.', say: 'Du kennst jetzt alle Best Friends. Jetzt mischen wir sie!', mood: 'happy', start: 0, goal: null },
    ...[b1, b2].flatMap(([a, k]) => [
      { text: `Stelle die ${a} ein.`, say: `Stell die ${ZAHLWORT[a]} ein.`, mood: 'happy' as const, start: 0, goal: a },
      { text: `+${k}: zuerst ${k - 5} dazu, dann 5 weg.`, say: `Plus ${ZAHLWORT[k]}: Zuerst ${ZAHLWORT[k - 5]} dazu, dann die Himmelsperle hoch.`, mood: 'think' as const, start: a, goal: a + k - 10 },
      { text: 'Dann 10 dazu.', say: 'Und jetzt zehn dazu bei den Zehnern.', mood: 'think' as const, start: a + k - 10, goal: a + k },
    ]),
    { text: `Fertig! ${b1[0]} + ${b1[1]} = ${b1[0] + b1[1]} und ${b2[0]} + ${b2[1]} = ${b2[0] + b2[1]}.`, say: 'Super! Du kannst alle Best Friends.', mood: 'cheer', start: b2[0] + b2[1], goal: null },
  ],
})
UNITS['3-5'] = alleBestFriends('Best Friends alle', 'Alle Best Friends gemischt wiederholen.', [7, 6], [5, 9])
UNITS['3-6'] = alleBestFriends('Best Friends alle – Training', 'Training: alle Best Friends gemischt.', [6, 8], [8, 6])

/** Rechenaufgabe für eine Big-Friend-Einheit: a (Einer, bei denen der Trick nötig ist) + add. */
export function makeSum(content: UnitContent, prev?: number) {
  if (content.adds?.length) {
    // gemischt: zuerst ein Big Friend, dann ein Einer, bei dem der Trick nötig ist
    const b = content.adds[Math.floor(Math.random() * content.adds.length)]
    // Little Friend +b: Einer 5−b … 4 (die Himmelsperle hilft); Big Friend +b: Einer 10−b … 9; Best Friend +b: Einer 5 … 14−b
    // Little Friend −k: Einer 5 … 4+k (Himmelsperle unten, zu wenige Erdperlen); Big Friend −k: 10 … 9+k
    // „mix“: je Aufgabe zufällig Big oder Little Friend (Little nur bis 4)
    const art = content.freunde === 'mix' ? (Math.abs(b) <= 4 && Math.random() < 0.5 ? 'little' : 'big') : content.freunde
    const a = b < 0
      ? randomIn(art === 'little' ? [5, 4 - b] : [10, 9 - b], prev)
      : randomIn(art === 'little' ? [5 - b, 4] : art === 'best' ? [5, 14 - b] : [10 - b, 9], prev)
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

/** „34 + 9“ bzw. „34 − 9“ (b negativ = Minus) */
export const rechnung = (a: number, b: number) => (b < 0 ? `${a} − ${-b}` : `${a} + ${b}`)
/** „plus“/„minus“ für die Sprachausgabe */
export const opWort = (b: number) => (b < 0 ? 'minus' : 'plus')
/** „+9“ bzw. „−9“ */
export const opZahl = (b: number) => (b < 0 ? `−${-b}` : `+${b}`)

/** Big-Friend-Minus-Einheit −k: „−k = −10 + (10−k)“. Startzahlen 10 … 9+k: bei den Einern sind zu wenige Perlen. */
const bigFriendMinus = (k: number, a: number, say: string): UnitContent => ({
  title: `Big Friend −${k}`,
  lead: `Der Trick für −${k}: 10 weg und ${10 - k} dazu.`,
  rule: [`−${k} = −10 + ${10 - k}`],
  learn: [`${k} und ${10 - k} sind zusammen 10`, `Minus ${k} heißt: 10 weg, ${10 - k} dazu`, 'Mit dem Abakus und im Kopf rechnen'],
  stationText: {
    video: `Der Video-Tutor zeigt dir den Trick für −${k}.`,
    entdecken: `Perli rechnet mit dir Schritt für Schritt −${k}.`,
    ueben: `Du rechnest −${k} mit dem Abakus.`,
    blitz: `Der Abakus blitzt auf. Rechne −${k}!`,
    kopfrechnen: `Rechne −${k} im Kopf.`,
    buch: 'Rechne im Buch und hake ab.',
    boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
  },
  cols: 2,
  range: [10, 9 + k],
  board: 'Zehner · Einer',
  add: -k,
  discover: [
    { text: `Big Friends: ${k} und ${10 - k} sind 10.`, say, mood: 'happy', start: 0, goal: null },
    { text: `Stelle zuerst die ${a} ein.`, say: `Stell zuerst die ${ZAHLWORT[a]} ein.`, mood: 'happy', start: 0, goal: a },
    { text: 'Jetzt 10 weg: eine Perle bei den Zehnern runter.', say: 'Jetzt zehn weg: Eine Perle bei den Zehnern runter.', mood: 'think', start: a, goal: a - 10 },
    // bis 4 dazu: Erdperlen hoch; ab 5 dazu: Himmelsperle runter (und Erdperlen hoch)
    k > 5
      ? { text: `Und ${10 - k} dazu: bei den Einern hoch.`, say: `Und jetzt ${ZAHLWORT[10 - k]} dazu: Bei den Einern hoch.`, mood: 'think', start: a - 10, goal: a - k }
      : { text: `Und ${10 - k} dazu bei den Einern (Himmelsperle runter${10 - k > 5 ? ', Erdperlen hoch' : ''}).`, say: `Und jetzt ${ZAHLWORT[10 - k]} dazu bei den Einern.`, mood: 'think', start: a - 10, goal: a - k },
    { text: `Fertig! ${a} − ${k} = ${a - k}.`, say: `Super! ${GROSS(ZAHLWORT[a])} minus ${ZAHLWORT[k]} ist ${ZAHLWORT[a - k]}.`, mood: 'cheer', start: a - k, goal: null },
  ],
})
/** Wiederholung aller Big Friends Minus (−9 … −1 gemischt) */
const alleBigFriendsMinus = (title: string, lead: string, b1: [number, number], b2: [number, number]): UnitContent => ({
  title,
  lead,
  rule: ['−k = −10 + Big Friend'],
  learn: ['Alle Big Friends: 9+1, 8+2, 7+3, 6+4, 5+5', 'Gemischt rechnen: 10 weg, Big Friend dazu', 'Mit dem Abakus und im Kopf rechnen'],
  stationText: {
    video: 'Der Video-Tutor wiederholt alle Big Friends Minus.',
    entdecken: 'Perli rechnet mit dir zwei gemischte Aufgaben.',
    ueben: 'Du rechnest alle Big Friends Minus gemischt.',
    blitz: 'Der Abakus blitzt auf. Rechne minus!',
    kopfrechnen: 'Rechne alle Big Friends Minus im Kopf.',
    buch: 'Rechne im Buch und hake ab.',
    boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
  },
  cols: 2,
  range: [10, 18],
  board: 'Zehner · Einer',
  adds: [-9, -8, -7, -6, -5, -4, -3, -2, -1],
  discover: [
    { text: 'Alle Big Friends Minus: 10 weg, Big Friend dazu.', say: 'Du kennst jetzt alle Big Friends. Jetzt mischen wir minus!', mood: 'happy', start: 0, goal: null },
    ...[b1, b2].flatMap(([a, k]) => [
      { text: `Stelle die ${a} ein.`, say: `Stell die ${ZAHLWORT[a]} ein.`, mood: 'happy' as const, start: 0, goal: a },
      { text: `−${k}: zuerst 10 weg.`, say: `Minus ${ZAHLWORT[k]}: Zuerst zehn weg, eine Perle bei den Zehnern runter.`, mood: 'think' as const, start: a, goal: a - 10 },
      { text: `Dann ${10 - k} dazu.`, say: `Dann ${ZAHLWORT[10 - k]} dazu bei den Einern.`, mood: 'think' as const, start: a - 10, goal: a - k },
    ]),
    { text: `Fertig! ${b1[0]} − ${b1[1]} = ${b1[0] - b1[1]} und ${b2[0]} − ${b2[1]} = ${b2[0] - b2[1]}.`, say: 'Super! Du kannst alle Big Friends.', mood: 'cheer', start: b2[0] - b2[1], goal: null },
  ],
})
UNITS['4-10'] = alleBigFriendsMinus('Big Friends Minus alle', 'Alle Big Friends Minus gemischt wiederholen.', [12, 9], [11, 7])
UNITS['4-11'] = alleBigFriendsMinus('Big Friends Minus – Training', 'Training: alle Big Friends Minus gemischt.', [12, 8], [11, 3])
UNITS['4-3'] = bigFriendMinus(7, 11, 'Sieben und drei sind zusammen zehn. Jetzt rechnen wir minus sieben: zehn weg und drei dazu!')
UNITS['4-4'] = bigFriendMinus(6, 10, 'Sechs und vier sind zusammen zehn. Jetzt rechnen wir minus sechs: zehn weg und vier dazu!')
UNITS['4-5'] = bigFriendMinus(5, 11, 'Fünf und fünf sind zusammen zehn. Jetzt rechnen wir minus fünf: zehn weg und fünf dazu!')
UNITS['4-6'] = bigFriendMinus(4, 12, 'Vier und sechs sind zusammen zehn. Jetzt rechnen wir minus vier: zehn weg und sechs dazu!')
UNITS['4-7'] = bigFriendMinus(3, 11, 'Drei und sieben sind zusammen zehn. Jetzt rechnen wir minus drei: zehn weg und sieben dazu!')
UNITS['4-8'] = bigFriendMinus(2, 11, 'Zwei und acht sind zusammen zehn. Jetzt rechnen wir minus zwei: zehn weg und acht dazu!')
UNITS['4-9'] = bigFriendMinus(1, 10, 'Eins und neun sind zusammen zehn. Jetzt rechnen wir minus eins: zehn weg und neun dazu!')
UNITS['4-2'] = bigFriendMinus(8, 12, 'Acht und zwei sind zusammen zehn. Jetzt rechnen wir minus acht: zehn weg und zwei dazu!')
UNITS['4-1'] = bigFriendMinus(9, 12, 'Neun und eins sind zusammen zehn. Jetzt rechnen wir minus neun: zehn weg und eins dazu!')


// ── Welt 5: Little Friends minus (−4 … −1) und gemischte Wiederholungen ──
/** Little-Friend-Minus −k: „−k = −5 + (5−k)“. Startzahlen 5 … 4+k: die Himmelsperle ist unten, aber zu wenige Erdperlen. */
const littleFriendMinus = (k: number, a: number): UnitContent => {
  const f = 5 - k
  return {
    title: `Little Friend −${k}`,
    lead: `Der Trick für −${k}: 5 weg und ${f} dazu.`,
    rule: [`−${k} = −5 + ${f}`],
    learn: [`${k} und ${f} sind zusammen 5`, `Minus ${k} heißt: Himmelsperle hoch, ${f} Erdperle${f > 1 ? 'n' : ''} dazu`, 'Mit dem Abakus und im Kopf rechnen'],
    stationText: {
      video: `Der Video-Tutor zeigt dir den Trick für −${k}.`,
      entdecken: `Perli rechnet mit dir Schritt für Schritt −${k}.`,
      ueben: `Du rechnest −${k} mit dem Abakus.`,
      blitz: `Der Abakus blitzt auf. Rechne −${k}!`,
      kopfrechnen: `Rechne −${k} im Kopf.`,
      buch: 'Rechne im Buch und hake ab.',
      boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
    },
    cols: 2,
    range: [5, 4 + k],
    board: 'Zehner · Einer',
    add: -k,
    freunde: 'little',
    discover: [
      { text: `Little Friends: ${k} und ${f} sind 5.`, say: `${GROSS(ZAHLWORT[k])} und ${ZAHLWORT[f]} sind zusammen fünf. Jetzt rechnen wir minus ${ZAHLWORT[k]}: fünf weg und ${ZAHLWORT[f]} dazu!`, mood: 'happy', start: 0, goal: null },
      { text: `Stelle zuerst die ${a} ein.`, say: `Stell zuerst die ${ZAHLWORT[a]} ein.`, mood: 'happy', start: 0, goal: a },
      { text: 'Jetzt 5 weg: die Himmelsperle hoch.', say: 'Jetzt fünf weg: Schieb die Himmelsperle hoch.', mood: 'think', start: a, goal: a - 5 },
      { text: `Und ${f} dazu: Erdperle${f > 1 ? 'n' : ''} hoch.`, say: `Und jetzt ${KLEIN[f]} dazu: Erdperle${f > 1 ? 'n' : ''} nach oben.`, mood: 'think', start: a - 5, goal: a - k },
      { text: `Fertig! ${a} − ${k} = ${a - k}.`, say: `Super! ${GROSS(ZAHLWORT[a])} minus ${ZAHLWORT[k]} ist ${ZAHLWORT[a - k]}.`, mood: 'cheer', start: a - k, goal: null },
    ],
  }
}
UNITS['5-1'] = littleFriendMinus(4, 6)
UNITS['5-2'] = littleFriendMinus(3, 7)
UNITS['5-3'] = littleFriendMinus(2, 6)
UNITS['5-4'] = littleFriendMinus(1, 5)

/** Gemischte Wiederholung in Welt 5 (Little Friends minus, Big & Little gemischt, Plus & Minus) */
const mischung = (title: string, lead: string, adds: number[], freunde: UnitContent['freunde'], rule: string, beispiele: [number, number][], hallo: string): UnitContent => ({
  title,
  lead,
  rule: [rule],
  learn: ['Erst schauen: Welcher Freund hilft?', 'Plus und Minus mit Big und Little Friends', 'Mit dem Abakus und im Kopf rechnen'],
  stationText: {
    video: 'Der Video-Tutor wiederholt die Freunde gemischt.',
    entdecken: 'Perli rechnet mit dir zwei gemischte Aufgaben.',
    ueben: 'Du rechnest gemischt mit dem Abakus.',
    blitz: 'Der Abakus blitzt auf. Rechne weiter!',
    kopfrechnen: 'Rechne gemischt im Kopf.',
    buch: 'Rechne im Buch und hake ab.',
    boss: 'Bestehe den Test gegen Grummel – dann geht es zur nächsten Lektion!',
  },
  cols: 2,
  range: [5, 18],
  board: 'Zehner · Einer',
  adds,
  freunde,
  discover: [
    { text: lead, say: hallo, mood: 'happy', start: 0, goal: null },
    ...beispiele.flatMap(([a, b]) => [
      { text: `Stelle die ${a} ein.`, say: `Stell die ${ZAHLWORT[a]} ein.`, mood: 'happy' as const, start: 0, goal: a },
      { text: `Rechne ${rechnung(a, b)}.`, say: `Jetzt ${opWort(b)} ${ZAHLWORT[Math.abs(b)]}. Welcher Freund hilft?`, mood: 'think' as const, start: a, goal: a + b },
    ]),
    { text: beispiele.map(([a, b]) => `${rechnung(a, b)} = ${a + b}`).join(' und '), say: 'Super gemacht!', mood: 'cheer', start: beispiele[beispiele.length - 1][0] + beispiele[beispiele.length - 1][1], goal: null },
  ],
})
UNITS['5-5'] = mischung('Little Friends Minus alle', 'Alle Little Friends minus gemischt.', [-4, -3, -2, -1], 'little', '−k = −5 + Little Friend', [[6, -4], [7, -3]], 'Du kennst jetzt alle Little Friends beim Minus. Jetzt mischen wir sie!')
UNITS['5-6'] = mischung('Little Friends Minus – Training', 'Training: alle Little Friends minus.', [-4, -3, -2, -1], 'little', '−k = −5 + Little Friend', [[5, -2], [8, -4]], 'Training! Alle Little Friends minus kommen gemischt.')
UNITS['5-7'] = mischung('Big & Little Friends Minus', 'Big und Little Friends minus gemischt.', [-9, -8, -7, -6, -5, -4, -3, -2, -1], 'mix', 'Big: −10 + Freund · Little: −5 + Freund', [[12, -9], [6, -3]], 'Jetzt mischen wir Big und Little Friends beim Minus. Schau gut: Welcher Freund hilft?')
UNITS['5-8'] = mischung('Big Friends Plus & Minus', 'Big Friends plus und minus gemischt.', [9, 8, 7, 6, -9, -8, -7, -6], 'big', '+k = +10 − Freund · −k = −10 + Freund', [[7, 8], [13, -8]], 'Jetzt kommen Big Friends plus und minus gemischt!')
UNITS['5-9'] = mischung('Little Friends Plus & Minus', 'Little Friends plus und minus gemischt.', [4, 3, 2, 1, -4, -3, -2, -1], 'little', '+k = +5 − Freund · −k = −5 + Freund', [[3, 4], [7, -4]], 'Jetzt kommen Little Friends plus und minus gemischt!')
UNITS['5-10'] = mischung('Große Wiederholung', 'Alle Freunde plus und minus gemischt.', [9, 7, 4, 3, -9, -7, -4, -3, -2], 'mix', 'Immer zuerst den passenden Freund finden', [[8, 7], [6, -4]], 'Große Wiederholung! Alle Freunde kommen gemischt, plus und minus.')
UNITS['5-11'] = mischung('Weltraum-Training', 'Training: alle Freunde gemischt.', [8, 6, 3, 2, -8, -6, -3, -1], 'mix', 'Immer zuerst den passenden Freund finden', [[9, 6], [13, -6]], 'Weltraum-Training! Zeig, was du kannst!')
