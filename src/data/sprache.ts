import { CLASSES } from './demo'
import { describeDigit, unitContent, type StationId } from './units'

// Alles, was Perli vorliest. Sätze werden aus kurzen Bausteinen zusammengesetzt
// (z. B. „Stelle ein:“ + „47“), damit wenige Aufnahmen für alle Aufgaben reichen.
// Zu jedem Baustein gibt es eine Aufnahme in assets/stimme (scripts/stimme.mjs).

export type Say = string | string[]

/** Kurze Erklärung, bevor eine Station beginnt. */
export const STATION_INTRO: Record<Exclude<StationId, 'video'>, string> = {
  entdecken: 'Perli zeigt dir Schritt für Schritt, wie der Abakus funktioniert. Hör gut zu und mach mit!',
  ueben: 'Jetzt übst du mit dem Abakus. Manchmal schiebst du die Perlen selbst, manchmal liest du die Zahl ab und tippst sie ein.',
  blitz: 'Gleich blitzt der Abakus ganz kurz auf. Schau genau hin und merk dir die Perlen. Dann tippst du die Zahl ein.',
  buch: 'Jetzt kommt dein Arbeitsbuch! Nimm deinen Abakus und einen Stift. Rechne die Aufgaben im Buch und schreib die Ergebnisse auf. Wenn du fertig bist, drück auf Erledigt.',
  kopfrechnen: 'Jetzt geht es ohne Abakus. Ich sage dir die Perlen. Stell sie dir im Kopf vor und tippe die Zahl ein.',
  boss: 'Jetzt kommt der Abschlusstest! Grummel, der Zahlenfresser, ist da. Wenn du ihn besiegst, geht es zur nächsten Lektion. Aber Vorsicht: Du hast nur drei Herzen.',
}

export const SAY = {
  richtig: 'Richtig!',
  treffer: 'Treffer!',
  stelleEin: 'Stelle ein:',
  welcheZahlAbakus: 'Welche Zahl zeigt der Abakus? Tippe sie ein.',
  welcheZahlWar: 'Welche Zahl war es? Tippe sie ein.',
  welcheZahlIst: 'Welche Zahl ist das?',
  achtung: 'Achtung!',
  fastDasIst: 'Fast! Das ist die',
  esWar: 'Es war die',
  autsch: 'Autsch! Es war die',
  tipp: 'Tipp:',
  zehner: 'Zehner:',
  einer: 'Einer:',
  bossGewonnen: 'Du hast Grummel besiegt!',
  bossVerloren: 'Grummel hat diesmal gewonnen. Probier es nochmal, dann geht es weiter!',
  geschafft: 'Geschafft!',
  tagGeschafft: 'Du hast deine Tagesaufgabe geschafft. Du bist großartig!',
  rechne: 'Rechne:',
  plus: 'plus',
  minus: 'minus',
  wievielIst: 'Wie viel ist das? Tippe es ein.',
  rechneAbakus: 'Rechne mit dem Abakus.',
  seite: 'Seite',
  spalteA: 'Spalte A',
  spalteB: 'Spalte B',
  aufgabe: 'Aufgabe',
  bis: 'bis',
  ergebnisAufgabe: 'Tippe das Ergebnis von Aufgabe',
} as const

/** Perlen einer Zahl als Bausteine, z. B. ['Zehner:', '3 Erdperlen', 'Einer:', 'die Himmelsperle']. */
export function sayDescribe(n: number): string[] {
  if (n < 10) return [describeDigit(n)]
  return [SAY.zehner, describeDigit(Math.floor(n / 10)), SAY.einer, describeDigit(n % 10)]
}

// Texte anderer Bildschirme, die ebenfalls vorgelesen werden
export const GAME_INTRO: Record<string, string> = {
  memory: 'Decke immer zwei Karten auf. Finde alle Paare!',
  muster: 'Schau dir die Reihe an. Was kommt als Nächstes?',
  kette: 'Die Perlen leuchten nacheinander. Tippe sie danach in der gleichen Reihenfolge.',
  jagd: 'Tippe so schnell du kannst alle Perlen in der gesuchten Farbe an.',
  farbwort: 'Schau auf die Farbe der Schrift, nicht auf das Wort. Tippe die richtige Farbe!',
  zahlenmerken: 'Merk dir die Zahlen. Danach tippst du sie ein.',
  vergleich: 'Lies die Abakusse ab. Tippe auf den richtigen!',
  schnellzaehlen: 'Die Perlen blitzen kurz auf. Zähle die Perlen in der gesuchten Farbe!',
}

const ONES = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
const TEENS = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn']
const TENS = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

/** Zahlwort 1–99, damit die Aufnahme „die 1“ nicht als „erstens“ liest. */
export function zahlwort(n: number) {
  if (n < 10) return ONES[n]
  if (n < 20) return TEENS[n - 10]
  const one = n % 10
  return one === 0 ? TENS[Math.floor(n / 10)] : `${one === 1 ? 'ein' : ONES[one]}und${TENS[Math.floor(n / 10)]}`
}

/** Alle Bausteine mit dem Text, den die Stimme spricht (Schlüssel → Sprechtext). */
export function alleBausteine(): Record<string, string> {
  const out: Record<string, string> = {}
  const add = (t: string, spoken = t) => { out[t] = spoken }
  Object.values(STATION_INTRO).forEach((t) => add(t))
  Object.values(SAY).forEach((t) => add(t))
  Object.values(GAME_INTRO).forEach((t) => add(t))
  for (let d = 0; d <= 9; d++) add(describeDigit(d))
  for (let n = 1; n <= 99; n++) add(String(n), zahlwort(n))
  for (let w = 1; w <= 9; w++) {
    for (let u = 1; u <= 12; u++) unitContent(w, u)?.discover.forEach((s) => add(s.say))
  }
  ;[
    'Wie heißt deine Klasse? Tippe den Klassen-Code ein.',
    'Wer bist du? Tippe auf dein Bild.',
    'In welche Klasse gehst du?',
    'Super, dein Buch ist fertig!',
    'Tippe deine vier Bilder.',
    'Diesen Code kennen wir nicht. Schau nochmal nach.',
    'Das war nicht richtig. Probier es nochmal!',
    'Super gemacht!', 'Gut gemacht!', 'Weiter so, du schaffst das!',
    'Schau, das kommt als Nächstes.', 'Fast! Schau nochmal genau.',
    'Alle Paare gefunden!', 'Ein Paar!', 'Alle gefunden!',
    'Super!',
    'Blitzschnell und fehlerfrei!', 'Deine Augen werden immer schneller.',
    'Der Abakus ist jetzt in deinem Kopf!', 'Alles richtig – wow!', 'Gut geübt! Du wirst immer besser.',
    'Du hast das Video angesehen.',
    // Einstufung
    'Die Perlen leuchten nacheinander. Tippe sie danach in der gleichen Reihenfolge.',
    'Was kommt als Nächstes? Tippe die richtige Perle oder Zahl.',
    'Finde alle Perlen in der gesuchten Farbe.',
    'Jetzt: Muster finden.', 'Jetzt: Perlen suchen.',
    'Fertig! Jetzt kenne ich dich.',
    'Tippe die Zahlen rückwärts.', 'Tippe die Zahlen der Reihe nach.',
  ].forEach((t) => add(t))
  CLASSES.flatMap((c) => c.kids).forEach((k) => { add(`Hallo ${k.name}!`); add(`Willkommen zurück, ${k.name}!`) })
  return out
}
