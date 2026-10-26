// Drehbücher der Lernvideos. Jede Lektion ist eine Folge von Szenen; aus diesen Daten
// entstehen Bild (Video-Studio), Stimme (ElevenLabs, je Szene) und Untertitel.
// Alle Lektionen nutzen dieselben Szenenarten – so sehen alle Videos gleich aus.

export type Move = {
  /** Zeitpunkt: Wort/Satzteil aus „say“ (Bewegung startet, wenn Lisa es sagt) oder Anteil 0–1 der Szene */
  at: string | number
  to: number
  /** Dauer in Sekunden (Standard 0,9) */
  dur?: number
  /** Hand anzeigen (Standard: nur bei einer Stange) */
  hand?: boolean
}

export type Card = { title: string; lines: { icon?: HandIcon | 'erd' | 'himmel'; text: string }[] }
export type HandIcon = 'daumen-hoch' | 'zeige-runter' | 'zeige-hoch' | 'zeigefinger' | 'winken'

export type Scene = {
  id: string
  /** Was Lisa sagt (Stimme + Untertitel) */
  say?: string
  kind?: 'titel' | 'tafel' | 'karte' | 'aufgabe' | 'quiz' | 'ende'
  /** Stangen und Startwert; fehlt es, gilt der Stand der vorigen Szene */
  cols?: number
  value?: number
  moves?: Move[]
  highlight?: 'erd' | 'himmel' | 'leiste'
  /** Stellenwerte (Einer, Zehner …) unter den Stangen einblenden */
  labels?: boolean
  /** Großer Hinweis rechts neben dem Abakus, z. B. „6 = 5 + 1“ */
  badge?: string
  /** Überschrift über dem Abakus, z. B. „Daumen: Erdperlen hoch“ */
  caption?: { icon?: HandIcon; text: string }
  card?: Card
  /** Mitmach-Aufgabe: nach dem Satz 3-2-1, dann zeigt der Abakus die Lösung */
  task?: number
  /** Quizfrage: Lisa fragt, 3-2-1, dann leuchtet die richtige Antwort */
  quiz?: Quiz
  /** Mindestdauer in Sekunden */
  min?: number
}

export type Quiz = { question: string; options: { icons: HandIcon[]; text: string }[]; correct: number }

const DAUMEN = { icons: ['daumen-hoch' as const], text: 'Daumen' }
const ZEIGE = { icons: ['zeigefinger' as const], text: 'Zeigefinger' }
const BEIDE = { icons: ['zeigefinger' as const, 'daumen-hoch' as const], text: 'Beide gleichzeitig' }

export type Lesson = {
  id: string
  number: number
  title: string
  world: number
  /** Abschnitte für die Fortschrittsanzeige auf der Tafel; start = erste Szene des Abschnitts */
  sections: { title: string; start: string }[]
  scenes: Scene[]
}

const LEKTION_1: Lesson = {
  id: 'lektion-1',
  number: 1,
  title: 'Der Abakus',
  world: 1,
  sections: [
    { title: 'Der Abakus', start: 'titel' },
    { title: 'Finger', start: 'finger' },
    { title: 'Zahlen 1 bis 4', start: 'zahl-1' },
    { title: 'Zahlen 5 bis 9', start: 'quiz-5' },
    { title: 'Üben', start: 'aufgabe-3' },
  ],
  scenes: [
    { id: 'titel', kind: 'titel', min: 4.5, cols: 4, value: 0 },
    { id: 'hallo', say: 'Hallo! Ich bin Lisa. Heute lernst du den Abakus kennen. Am Ende kannst du alle Zahlen von 0 bis 9 zeigen!' },
    { id: 'erdperlen', highlight: 'erd', say: 'Das ist ein Abakus. Unten siehst du die gelben Erdperlen. Jede Erdperle ist 1 wert.' },
    { id: 'himmelsperle', highlight: 'himmel', say: 'Oben ist die grüne Himmelsperle. Sie ist 5 wert.' },
    { id: 'leiste', highlight: 'leiste', say: 'In der Mitte ist die Leiste. Wir zählen nur die Perlen, die die Leiste berühren.' },
    { id: 'null', badge: '0', say: 'Keine Perle berührt die Leiste. Das ist die Null – unsere Startposition.' },
    {
      id: 'aufraeumen', value: 3752, moves: [{ at: 'räumen wir', to: 0, dur: 1.4 }],
      say: 'Manchmal ist der Abakus durcheinander. Dann räumen wir ihn auf: Erdperlen nach unten, Himmelsperlen nach oben.',
    },
    { id: 'stellen', labels: true, say: 'Wir beginnen immer ganz rechts. Das sind die Einer. Daneben die Zehner, dann die Hunderter und die Tausender.' },

    // Fingertechnik
    {
      id: 'finger', kind: 'karte', min: 6,
      card: { title: 'Zwei Finger', lines: [{ icon: 'daumen-hoch', text: 'Daumen' }, { icon: 'zeigefinger', text: 'Zeigefinger' }] },
      say: 'Jetzt ganz wichtig: Wie benutzen wir unsere Finger? Wir brauchen nur zwei Finger: den Daumen und den Zeigefinger.',
    },
    {
      id: 'finger-daumen', cols: 1, value: 0, caption: { icon: 'daumen-hoch', text: 'Daumen: Erdperlen nach oben' },
      moves: [{ at: 'nach oben', to: 3 }], say: 'Mit dem Daumen schieben wir die Erdperlen nach oben.',
    },
    {
      id: 'finger-zeige', caption: { icon: 'zeige-runter', text: 'Zeigefinger: Erdperlen nach unten' },
      moves: [{ at: 'nach unten', to: 0 }], say: 'Mit dem Zeigefinger schieben wir die Erdperlen wieder nach unten.',
    },
    {
      id: 'finger-himmel', caption: { icon: 'zeigefinger', text: 'Zeigefinger: Himmelsperle' },
      moves: [{ at: 'runter zur Leiste', to: 5 }, { at: 'wieder hoch', to: 0 }],
      say: 'Die Himmelsperle bewegen wir immer mit dem Zeigefinger: runter zur Leiste – und wieder hoch.',
    },
    {
      id: 'finger-merken', kind: 'karte', min: 7,
      card: {
        title: 'So benutzt du deine Finger',
        lines: [
          { icon: 'daumen-hoch', text: 'Daumen: Erdperlen nach oben' },
          { icon: 'zeige-runter', text: 'Zeigefinger: Erdperlen nach unten' },
          { icon: 'zeigefinger', text: 'Zeigefinger: Himmelsperle hoch und runter' },
        ],
      },
      say: 'Merk dir: Der Daumen schiebt hoch. Der Zeigefinger schiebt runter. Und die Himmelsperle bewegt immer der Zeigefinger.',
    },

    // Quiz zur Fingertechnik
    {
      id: 'quiz-hoch', kind: 'quiz',
      quiz: { question: 'Welcher Finger schiebt Erdperlen nach oben?', options: [DAUMEN, ZEIGE], correct: 0 },
      say: 'Jetzt frage ich dich! Welcher Finger schiebt die Erdperlen nach oben?',
    },
    {
      id: 'quiz-hoch-loesung', cols: 1, value: 0, caption: { icon: 'daumen-hoch', text: 'Richtig: der Daumen!' },
      moves: [{ at: 'schiebt', to: 2 }], say: 'Richtig, der Daumen! Er schiebt die Erdperlen hoch.',
    },
    {
      id: 'quiz-runter', kind: 'quiz',
      quiz: { question: 'Welcher Finger schiebt Erdperlen nach unten?', options: [DAUMEN, ZEIGE], correct: 1 },
      say: 'Und welcher Finger schiebt die Erdperlen wieder nach unten?',
    },
    {
      id: 'quiz-runter-loesung', caption: { icon: 'zeige-runter', text: 'Richtig: der Zeigefinger!' },
      moves: [{ at: 'schiebt', to: 0 }], say: 'Genau, der Zeigefinger! Er schiebt die Erdperlen runter.',
    },

    // Zahlen 1 bis 4
    { id: 'zahl-1', cols: 1, value: 0, badge: '1', moves: [{ at: 'eine Erdperle', to: 1 }, { at: 'wieder runter', to: 0 }], say: 'Die 1: Der Daumen schiebt eine Erdperle nach oben. Der Zeigefinger schiebt sie wieder runter.' },
    { id: 'zahl-2', badge: '2', moves: [{ at: 'Zwei Erdperlen', to: 2 }, { at: 'wieder runter', to: 0 }], say: 'Die 2: Zwei Erdperlen gleichzeitig nach oben – und wieder runter.' },
    { id: 'zahl-3', badge: '3', moves: [{ at: 'Drei Erdperlen', to: 3 }, { at: 'wieder runter', to: 0 }], say: 'Die 3: Drei Erdperlen gleichzeitig nach oben – und wieder runter.' },
    { id: 'zahl-4', badge: '4', moves: [{ at: 'alle vier', to: 4 }, { at: 'zurück', to: 0 }], say: 'Die 4: alle vier Erdperlen gleichzeitig nach oben. Und zurück.' },

    // 5 bis 9
    {
      id: 'quiz-5', kind: 'quiz',
      quiz: { question: 'Du willst die 5 einstellen. Welcher Finger?', options: [DAUMEN, ZEIGE], correct: 1 },
      say: 'Nach der 4 kommt die 5. Für die 5 brauchen wir die Himmelsperle. Was meinst du: Welcher Finger bewegt sie?',
    },
    { id: 'zahl-5', cols: 1, value: 0, badge: '5', moves: [{ at: 'zur Leiste', to: 5 }], say: 'Richtig, der Zeigefinger! Er schiebt die Himmelsperle zur Leiste. Das ist die 5.' },
    { id: 'fuenf-steckt', badge: '5 Erdperlen', moves: [{ at: 'wieder hoch', to: 0 }], say: 'In der Himmelsperle stecken fünf Erdperlen. Darum ist sie 5 wert. Und mit dem Zeigefinger wieder hoch.' },
    {
      id: 'quiz-6', kind: 'quiz',
      quiz: { question: 'Für die 6: Welche Finger?', options: [DAUMEN, ZEIGE, BEIDE], correct: 2 },
      say: 'Die 6 ist 5 und 1. Welche Finger brauchen wir jetzt?',
    },
    { id: 'zahl-6', cols: 1, value: 0, badge: '6 = 5 + 1', moves: [{ at: 'gleichzeitig', to: 6 }], say: 'Beide! Zeigefinger und Daumen arbeiten gleichzeitig: Himmelsperle runter, eine Erdperle hoch.' },
    { id: 'zahl-6-zurueck', badge: '6 = 5 + 1', moves: [{ at: 'Himmelsperle hoch', to: 0 }], say: 'Zurück geht es mit dem Zeigefinger: Himmelsperle hoch, Erdperle runter.' },
    { id: 'zahl-7', badge: '7 = 5 + 2', moves: [{ at: 'Gleichzeitig', to: 7 }, { at: 'zurück', to: 0 }], say: 'Die 7 ist 5 und 2. Gleichzeitig zur Leiste – und zurück.' },
    { id: 'zahl-8', badge: '8 = 5 + 3', moves: [{ at: 'Gleichzeitig', to: 8 }, { at: 'zurück', to: 0 }], say: 'Die 8 ist 5 und 3. Gleichzeitig zur Leiste – und zurück.' },
    { id: 'zahl-9', badge: '9 = 5 + 4', moves: [{ at: 'Alle Perlen', to: 9 }, { at: 'zurück', to: 0 }], say: 'Die 9 ist 5 und 4. Alle Perlen berühren die Leiste! Das ist die größte Zahl auf einer Stange. Und zurück.' },

    // Mitmachen
    { id: 'aufgabe-3', kind: 'aufgabe', task: 3, say: 'Jetzt bist du dran! Stell die 3 ein. Drück auf Pause, wenn du mehr Zeit brauchst.' },
    { id: 'aufgabe-7', kind: 'aufgabe', value: 0, task: 7, say: 'Super! Und jetzt die 7.' },

    {
      id: 'merksatz', kind: 'karte', min: 8,
      card: {
        title: 'Das merkst du dir',
        lines: [
          { icon: 'erd', text: 'Erdperle = 1' },
          { icon: 'himmel', text: 'Himmelsperle = 5' },
          { icon: 'daumen-hoch', text: 'Daumen hoch, Zeigefinger runter' },
        ],
      },
      say: 'Das merkst du dir: Eine Erdperle ist 1. Die Himmelsperle ist 5. Der Daumen schiebt hoch, der Zeigefinger schiebt runter.',
    },
    { id: 'ende', kind: 'ende', min: 6, say: 'Super gemacht! Jetzt bist du dran: Öffne in der App die Station Entdecken. Bis zum nächsten Mal – tschüss!' },
  ],
}

export const LESSONS: Lesson[] = [LEKTION_1]

const WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
/** Sprechtext: Ziffern als Wörter, damit die Stimme „Die 1“ nicht als „die Erste“ liest. Gleich lang wie
 *  nötig für die Zeitmarken – Stellen im Text werden über diese Funktion auf den Sprechtext abgebildet. */
export const spokenText = (t: string) => t
  .replace(/\b(Die|die) (\d)\b/g, (_, d: string, n: string) => `${d} ${WORDS[+n][0].toUpperCase()}${WORDS[+n].slice(1)}`)
  .replace(/\b(\d)\b/g, (_, n: string) => WORDS[+n])
export const findLesson = (id: string) => LESSONS.find((l) => l.id === id) ?? null
