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
  kind?: 'titel' | 'tafel' | 'karte' | 'aufgabe' | 'ende'
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
  /** Mindestdauer in Sekunden */
  min?: number
}

export type Lesson = { id: string; number: number; title: string; world: number; scenes: Scene[] }

const LEKTION_1: Lesson = {
  id: 'lektion-1',
  number: 1,
  title: 'Der Abakus',
  world: 1,
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

    // Zahlen 1 bis 4
    { id: 'zahl-1', cols: 1, value: 0, badge: '1', moves: [{ at: 'eine Erdperle', to: 1 }, { at: 'wieder runter', to: 0 }], say: 'Die 1: Der Daumen schiebt eine Erdperle nach oben. Der Zeigefinger schiebt sie wieder runter.' },
    { id: 'zahl-2', badge: '2', moves: [{ at: 'Zwei Erdperlen', to: 2 }, { at: 'wieder runter', to: 0 }], say: 'Die 2: Zwei Erdperlen gleichzeitig nach oben – und wieder runter.' },
    { id: 'zahl-3', badge: '3', moves: [{ at: 'Drei Erdperlen', to: 3 }, { at: 'wieder runter', to: 0 }], say: 'Die 3: Drei Erdperlen gleichzeitig nach oben – und wieder runter.' },
    { id: 'zahl-4', badge: '4', moves: [{ at: 'alle vier', to: 4 }, { at: 'zurück', to: 0 }], say: 'Die 4: alle vier Erdperlen gleichzeitig nach oben. Und zurück.' },

    // 5 bis 9
    { id: 'zahl-5', badge: '5', moves: [{ at: 'zur Leiste', to: 5 }], say: 'Nach der 4 kommt die 5. Jetzt brauchen wir die Himmelsperle: Der Zeigefinger schiebt sie zur Leiste.' },
    { id: 'fuenf-steckt', badge: '5 Erdperlen', moves: [{ at: 'wieder hoch', to: 0 }], say: 'In der Himmelsperle stecken fünf Erdperlen. Darum ist sie 5 wert. Und mit dem Zeigefinger wieder hoch.' },
    { id: 'zahl-6', badge: '6 = 5 + 1', moves: [{ at: 'gleichzeitig', to: 6 }], say: 'Die 6 ist 5 und 1. Zeigefinger und Daumen arbeiten gleichzeitig: Himmelsperle runter, eine Erdperle hoch.' },
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
export const findLesson = (id: string) => LESSONS.find((l) => l.id === id) ?? null
