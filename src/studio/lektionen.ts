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
export type HandIcon = 'daumen-hoch' | 'zeige-runter' | 'zeige-hoch' | 'zeigefinger' | 'winken' | 'daumen-seite' | 'zeige-seite'

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
    { id: 'hallo', say: 'Hallo! Heute lernst du den Abakus kennen. Am Ende kannst du alle Zahlen von 0 bis 9 zeigen!' },
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
    { id: 'ende', kind: 'ende', min: 6, say: 'Super gemacht! Jetzt kennst du die Perlen. Drück unten auf Weiter und zeig, was du gelernt hast. Los geht’s, das Abenteuer beginnt!' },
  ],
}


// Lektion 2: kurz (höchstens 1:30) und ganz einfach – der Trick „+9 = +10 − 1“
const LEKTION_2: Lesson = {
  id: 'lektion-2',
  number: 2,
  title: 'Big Friend +9',
  world: 1,
  sections: [
    { title: 'Big Friends', start: 'titel' },
    { title: 'Der Trick', start: 'trick' },
    { title: 'Üben', start: 'beispiel-2' },
  ],
  scenes: [
    { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
    { id: 'hallo', say: 'Hallo! Heute lernst du einen tollen Trick. Wir rechnen plus 9.' },
    {
      id: 'freunde', kind: 'karte', min: 6,
      card: { title: 'Big Friends', lines: [{ text: '9 und 1 sind 10' }, { icon: 'daumen-hoch', text: 'Der Big Friend von 9 ist 1' }] },
      say: 'Big Friends sind zwei Zahlen, die zusammen 10 ergeben. 9 und 1 sind 10. Also ist 1 der Big Friend von 9.',
    },
    { id: 'aufgabe-zeigen', cols: 2, value: 3, badge: '3 + 9', say: 'Wir haben 3. Jetzt rechnen wir plus 9. Aber unten sind nicht genug Perlen frei!' },
    {
      id: 'trick', kind: 'karte', min: 5,
      card: { title: 'Der Trick', lines: [{ icon: 'daumen-hoch', text: '10 dazu' }, { icon: 'zeige-runter', text: '1 weg' }] },
      say: 'Der Trick: Plus 9 heißt: 10 dazu und 1 weg.',
    },
    { id: 'zehn-dazu', cols: 2, value: 3, badge: '+ 10', moves: [{ at: 'bei den Zehnern', to: 13 }], say: 'Zuerst eine Perle bei den Zehnern hoch. Das sind 10.' },
    { id: 'eins-weg', badge: '− 1', moves: [{ at: 'bei den Einern', to: 12 }], say: 'Dann eine Perle bei den Einern runter. Das ist 1 weg.' },
    { id: 'ergebnis', badge: '3 + 9 = 12', min: 3.5, say: 'Fertig! 3 plus 9 ist 12.' },
    {
      id: 'beispiel-2', cols: 2, value: 6, badge: '6 + 9 = 15', moves: [{ at: 'Zehnern hoch', to: 16 }, { at: 'Einern runter', to: 15 }],
      say: 'Noch einmal: 6 plus 9. Eine Perle bei den Zehnern hoch, eine Perle bei den Einern runter. Das ist 15!',
    },
    { id: 'aufgabe-13', kind: 'aufgabe', cols: 2, value: 4, task: 13, say: 'Jetzt du! Rechne 4 plus 9. Zehn dazu, 1 weg.' },
    {
      id: 'merksatz', kind: 'karte', min: 5,
      card: { title: 'Das merkst du dir', lines: [{ text: 'Plus 9 = 10 dazu, 1 weg' }] },
      say: 'Merk dir: Plus 9 ist 10 dazu und 1 weg.',
    },
    { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
  ],
}

// Lektion 3: wie Lektion 2, kurz und einfach – der Trick „+8 = +10 − 2“
const LEKTION_3: Lesson = {
  id: 'lektion-3',
  number: 3,
  title: 'Big Friend +8',
  world: 1,
  sections: [
    { title: 'Big Friends', start: 'titel' },
    { title: 'Der Trick', start: 'trick' },
    { title: 'Üben', start: 'beispiel-2' },
  ],
  scenes: [
    { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
    { id: 'hallo', say: 'Hallo! Heute rechnen wir plus 8. Mit einem neuen Big Friend.' },
    {
      id: 'freunde', kind: 'karte', min: 6,
      card: { title: 'Big Friends', lines: [{ text: '8 und 2 sind 10' }, { icon: 'daumen-hoch', text: 'Der Big Friend von 8 ist 2' }] },
      say: '8 und 2 sind zusammen 10. Also ist 2 der Big Friend von 8.',
    },
    { id: 'aufgabe-zeigen', cols: 2, value: 3, badge: '3 + 8', say: 'Wir haben 3. Jetzt rechnen wir plus 8. Unten sind nicht genug Perlen frei!' },
    {
      id: 'trick', kind: 'karte', min: 5,
      card: { title: 'Der Trick', lines: [{ icon: 'daumen-hoch', text: '10 dazu' }, { icon: 'zeige-runter', text: '2 weg' }] },
      say: 'Der Trick: Plus 8 heißt: 10 dazu und 2 weg.',
    },
    { id: 'zehn-dazu', cols: 2, value: 3, badge: '+ 10', moves: [{ at: 'bei den Zehnern', to: 13 }], say: 'Zuerst eine Perle bei den Zehnern hoch. Das sind 10.' },
    { id: 'zwei-weg', badge: '− 2', moves: [{ at: 'bei den Einern', to: 11 }], say: 'Dann zwei Perlen bei den Einern runter. Das sind 2 weg.' },
    { id: 'ergebnis', badge: '3 + 8 = 11', min: 3.5, say: 'Fertig! 3 plus 8 ist 11.' },
    {
      id: 'beispiel-2', cols: 2, value: 7, badge: '7 + 8 = 15', moves: [{ at: 'Zehnern hoch', to: 17 }, { at: 'Einern runter', to: 15 }],
      say: 'Noch einmal: 7 plus 8. Eine Perle bei den Zehnern hoch, zwei Perlen bei den Einern runter. Das ist 15!',
    },
    { id: 'aufgabe-12', kind: 'aufgabe', cols: 2, value: 4, task: 12, say: 'Jetzt du! Rechne 4 plus 8. Zehn dazu, 2 weg.' },
    {
      id: 'merksatz', kind: 'karte', min: 5,
      card: { title: 'Das merkst du dir', lines: [{ text: 'Plus 8 = 10 dazu, 2 weg' }] },
      say: 'Merk dir: Plus 8 ist 10 dazu und 2 weg.',
    },
    { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
  ],
}

// Lektion 4: wie Lektion 2 und 3 – der Trick „+7 = +10 − 3“. Beispiele mit Einern, bei denen −3 direkt geht (4, 8, 9).
const LEKTION_4: Lesson = {
  id: 'lektion-4',
  number: 4,
  title: 'Big Friend +7',
  world: 1,
  sections: [
    { title: 'Big Friends', start: 'titel' },
    { title: 'Der Trick', start: 'trick' },
    { title: 'Üben', start: 'beispiel-2' },
  ],
  scenes: [
    { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
    { id: 'hallo', say: 'Hallo! Heute rechnen wir plus 7. Mit einem neuen Big Friend.' },
    {
      id: 'freunde', kind: 'karte', min: 6,
      card: { title: 'Big Friends', lines: [{ text: '7 und 3 sind 10' }, { icon: 'daumen-hoch', text: 'Der Big Friend von 7 ist 3' }] },
      say: '7 und 3 sind zusammen 10. Also ist 3 der Big Friend von 7.',
    },
    { id: 'aufgabe-zeigen', cols: 2, value: 4, badge: '4 + 7', say: 'Wir haben 4. Jetzt rechnen wir plus 7. Unten sind nicht genug Perlen frei!' },
    {
      id: 'trick', kind: 'karte', min: 5,
      card: { title: 'Der Trick', lines: [{ icon: 'daumen-hoch', text: '10 dazu' }, { icon: 'zeige-runter', text: '3 weg' }] },
      say: 'Der Trick: Plus 7 heißt: 10 dazu und 3 weg.',
    },
    { id: 'zehn-dazu', cols: 2, value: 4, badge: '+ 10', moves: [{ at: 'bei den Zehnern', to: 14 }], say: 'Zuerst eine Perle bei den Zehnern hoch. Das sind 10.' },
    { id: 'drei-weg', badge: '− 3', moves: [{ at: 'bei den Einern', to: 11 }], say: 'Dann drei Perlen bei den Einern runter. Das sind 3 weg.' },
    { id: 'ergebnis', badge: '4 + 7 = 11', min: 3.5, say: 'Fertig! 4 plus 7 ist 11.' },
    {
      id: 'beispiel-2', cols: 2, value: 8, badge: '8 + 7 = 15', moves: [{ at: 'Zehnern hoch', to: 18 }, { at: 'Einern runter', to: 15 }],
      say: 'Noch einmal: 8 plus 7. Eine Perle bei den Zehnern hoch, drei Perlen bei den Einern runter. Das ist 15!',
    },
    { id: 'aufgabe-16', kind: 'aufgabe', cols: 2, value: 9, task: 16, say: 'Jetzt du! Rechne 9 plus 7. Zehn dazu, 3 weg.' },
    {
      id: 'merksatz', kind: 'karte', min: 5,
      card: { title: 'Das merkst du dir', lines: [{ text: 'Plus 7 = 10 dazu, 3 weg' }] },
      say: 'Merk dir: Plus 7 ist 10 dazu und 3 weg.',
    },
    { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
  ],
}

// Lektion 5–10: gleicher Aufbau wie Lektion 2–4 – „+k = +10 − f“ (f = Big Friend). Beispiele mit Einern, bei denen „− f“ direkt geht.
const WORT = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
function bigFriendLektion(number: number, k: number, a: number, b: number, c: number): Lesson {
  const f = 10 - k
  const weg = f === 1 ? '1 Perle' : `${f}`
  return {
    id: `lektion-${number}`,
    number,
    title: `Big Friend +${k}`,
    world: 1,
    sections: [
      { title: 'Big Friends', start: 'titel' },
      { title: 'Der Trick', start: 'trick' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: `Hallo! Heute rechnen wir plus ${k}. Mit einem neuen Big Friend.` },
      {
        id: 'freunde', kind: 'karte', min: 6,
        card: { title: 'Big Friends', lines: [{ text: `${k} und ${f} sind 10` }, { icon: 'daumen-hoch', text: `Der Big Friend von ${k} ist ${f}` }] },
        say: `${k} und ${f} sind zusammen 10. Also ist ${f} der Big Friend von ${k}.`,
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a, badge: `${a} + ${k}`, say: `Wir haben ${a}. Jetzt rechnen wir plus ${k}. Unten sind nicht genug Perlen frei!` },
      {
        id: 'trick', kind: 'karte', min: 5,
        card: { title: 'Der Trick', lines: [{ icon: 'daumen-hoch', text: '10 dazu' }, { icon: 'zeige-runter', text: `${f} weg` }] },
        say: `Der Trick: Plus ${k} heißt: 10 dazu und ${f} weg.`,
      },
      { id: 'zehn-dazu', cols: 2, value: a, badge: '+ 10', moves: [{ at: 'bei den Zehnern', to: a + 10 }], say: 'Zuerst eine Perle bei den Zehnern hoch. Das sind 10.' },
      { id: 'weg', badge: `− ${f}`, moves: [{ at: 'bei den Einern', to: a + k }], say: `Dann nimmst du ${weg} bei den Einern weg. Das sind ${f} weg.` },
      { id: 'ergebnis', badge: `${a} + ${k} = ${a + k}`, min: 3.5, say: `Fertig! ${a} plus ${k} ist ${a + k}.` },
      {
        id: 'beispiel-2', cols: 2, value: b, badge: `${b} + ${k} = ${b + k}`, moves: [{ at: 'Zehnern hoch', to: b + 10 }, { at: 'Einern weg', to: b + k }],
        say: `Noch einmal: ${b} plus ${k}. Eine Perle bei den Zehnern hoch, ${f} bei den Einern weg. Das ist ${b + k}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c, task: c + k, say: `Jetzt du! Rechne ${c} plus ${k}. Zehn dazu, ${WORT[f] ?? f} weg.` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: `Plus ${k} = 10 dazu, ${f} weg` }] },
        say: `Merk dir: Plus ${k} ist 10 dazu und ${f} weg.`,
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

const LEKTION_5 = bigFriendLektion(5, 6, 9, 4, 19)
const LEKTION_6 = bigFriendLektion(6, 5, 7, 9, 8)
const LEKTION_7 = bigFriendLektion(7, 4, 7, 9, 8)
const LEKTION_8 = bigFriendLektion(8, 3, 8, 9, 7)
const LEKTION_9 = bigFriendLektion(9, 2, 9, 8, 18)
const LEKTION_10 = bigFriendLektion(10, 1, 9, 19, 29)

// Lektion 11–12: Wiederholung aller Big Friends – gleicher Aufbau, aber gemischte Aufgaben
function wiederholungLektion(number: number, title: string, hallo: string, b1: [number, number], b2: [number, number], c: [number, number]): Lesson {
  const [a1, k1] = b1
  const [a2, k2] = b2
  return {
    id: `lektion-${number}`,
    number,
    title,
    world: 1,
    sections: [
      { title: 'Alle Big Friends', start: 'titel' },
      { title: 'Gemischt', start: 'aufgabe-zeigen' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: hallo },
      {
        id: 'freunde', kind: 'karte', min: 7,
        card: { title: 'Alle Big Friends', lines: [{ text: '9 + 1 · 8 + 2 · 7 + 3' }, { text: '6 + 4 · 5 + 5' }, { icon: 'daumen-hoch', text: 'Immer: 10 dazu, Big Friend weg' }] },
        say: 'Neun und eins, acht und zwei, sieben und drei, sechs und vier, fünf und fünf. Das sind alle Big Friends!',
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a1, badge: `${a1} + ${k1}`, say: `Wir haben ${a1}. Jetzt kommt plus ${k1}. Welcher Big Friend hilft? Die ${10 - k1}!` },
      { id: 'zehn-dazu', cols: 2, value: a1, badge: '+ 10', moves: [{ at: 'bei den Zehnern', to: a1 + 10 }], say: 'Zuerst eine Perle bei den Zehnern hoch. Das sind 10.' },
      { id: 'weg', badge: `− ${10 - k1}`, moves: [{ at: 'bei den Einern', to: a1 + k1 }], say: `Dann ${10 - k1} bei den Einern weg. ${a1} plus ${k1} ist ${a1 + k1}.` },
      {
        id: 'beispiel-2', cols: 2, value: a2, badge: `${a2} + ${k2} = ${a2 + k2}`, moves: [{ at: 'Zehnern hoch', to: a2 + 10 }, { at: 'Einern weg', to: a2 + k2 }],
        say: `Und jetzt ${a2} plus ${k2}. Der Big Friend ist ${10 - k2}. Zehn dazu, ${10 - k2} weg. Das ist ${a2 + k2}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c[0], task: c[0] + c[1], say: `Jetzt du! Rechne ${c[0]} plus ${c[1]}. Denk an den Big Friend!` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: 'Erst den Big Friend finden' }, { text: 'Dann: 10 dazu, Big Friend weg' }] },
        say: 'Merk dir: Erst den Big Friend finden. Dann zehn dazu und den Big Friend weg.',
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

const LEKTION_11 = wiederholungLektion(11, 'Alle Big Friends', 'Hallo! Du hast alle Big Friends gelernt. Jetzt ist es Zeit, alle gemischt zu wiederholen!', [8, 3], [9, 6], [7, 4])
const LEKTION_12 = wiederholungLektion(12, 'Big Friends Training', 'Hallo! Heute ist Training. Alle Big Friends kommen gemischt. Bist du bereit?', [9, 2], [8, 5], [4, 7])

// Welt 2, Lektion 13–16: Little Friends – „+k = +5 − f“ (f = Little Friend, k + f = 5). Die Himmelsperle hilft.
function littleFriendLektion(number: number, k: number, a: number, b: number, c: number): Lesson {
  const f = 5 - k
  const perlen = `${f} Erdperlen`
  return {
    id: `lektion-${number}`,
    number,
    title: `Little Friend +${k}`,
    world: 2,
    sections: [
      { title: 'Little Friends', start: 'titel' },
      { title: 'Der Trick', start: 'trick' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: `Hallo! Willkommen im Little Friends Wald. Heute rechnen wir plus ${k}.` },
      {
        id: 'freunde', kind: 'karte', min: 6,
        card: { title: 'Little Friends', lines: [{ text: `${k} und ${f} sind 5` }, { icon: 'daumen-hoch', text: `Der Little Friend von ${k} ist ${f}` }] },
        say: `${k} und ${f} sind zusammen 5. Also ist ${f} der Little Friend von ${k}.`,
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a, badge: `${a} + ${k}`, say: `Wir haben ${a}. Jetzt rechnen wir plus ${k}. Unten sind nicht genug Erdperlen frei!` },
      {
        id: 'trick', kind: 'karte', min: 5,
        card: { title: 'Der Trick', lines: [{ icon: 'zeige-runter', text: '5 dazu' }, { icon: 'zeige-runter', text: `${f} weg` }] },
        say: `Der Trick: Plus ${k} heißt: 5 dazu und ${f} weg.`,
      },
      { id: 'fuenf-dazu', cols: 2, value: a, badge: '+ 5', moves: [{ at: 'Himmelsperle', to: a + 5 }], say: 'Zuerst die Himmelsperle runter. Das sind 5.' },
      { id: 'weg', badge: `− ${f}`, moves: [{ at: 'Erdperle', to: a + k }], say: f === 1 ? 'Dann eine Erdperle runter. Eine weg.' : `Dann ${perlen} runter. ${f} weg.` },
      { id: 'ergebnis', badge: `${a} + ${k} = ${a + k}`, min: 3.5, say: `Fertig! ${a} plus ${k} ist ${a + k}.` },
      {
        id: 'beispiel-2', cols: 2, value: b, badge: `${b} + ${k} = ${b + k}`, moves: [{ at: 'Himmelsperle', to: b + 5 }, { at: 'weg', to: b + k }],
        say: `Noch einmal: ${b} plus ${k}. Die Himmelsperle runter, ${f} weg. Das ist ${b + k}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c, task: c + k, say: `Jetzt du! Rechne ${c} plus ${k}. Fünf dazu, ${WORT[f]} weg.` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: `Plus ${k} = 5 dazu, ${f} weg` }] },
        say: `Merk dir: Plus ${k} ist 5 dazu und ${f} weg.`,
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

// Lektion 17–18: alle Little Friends gemischt
function littleWiederholung(number: number, title: string, hallo: string, b1: [number, number], b2: [number, number], c: [number, number]): Lesson {
  const [a1, k1] = b1
  const [a2, k2] = b2
  return {
    id: `lektion-${number}`,
    number,
    title,
    world: 2,
    sections: [
      { title: 'Alle Little Friends', start: 'titel' },
      { title: 'Gemischt', start: 'aufgabe-zeigen' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: hallo },
      {
        id: 'freunde', kind: 'karte', min: 6,
        card: { title: 'Alle Little Friends', lines: [{ text: '4 + 1 · 3 + 2' }, { icon: 'daumen-hoch', text: 'Immer: 5 dazu, Little Friend weg' }] },
        say: 'Vier und eins, drei und zwei. Das sind alle Little Friends!',
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a1, badge: `${a1} + ${k1}`, say: `Wir haben ${a1}. Jetzt kommt plus ${k1}. Welcher Little Friend hilft? Die ${5 - k1}!` },
      { id: 'fuenf-dazu', cols: 2, value: a1, badge: '+ 5', moves: [{ at: 'Himmelsperle', to: a1 + 5 }], say: 'Zuerst die Himmelsperle runter. Das sind 5.' },
      { id: 'weg', badge: `− ${5 - k1}`, moves: [{ at: 'Erdperle', to: a1 + k1 }], say: `Dann ${5 - k1} weg. ${a1} plus ${k1} ist ${a1 + k1}.` },
      {
        id: 'beispiel-2', cols: 2, value: a2, badge: `${a2} + ${k2} = ${a2 + k2}`, moves: [{ at: 'Himmelsperle', to: a2 + 5 }, { at: 'weg', to: a2 + k2 }],
        say: `Und jetzt ${a2} plus ${k2}. Der Little Friend ist ${5 - k2}. Fünf dazu, ${5 - k2} weg. Das ist ${a2 + k2}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c[0], task: c[0] + c[1], say: `Jetzt du! Rechne ${c[0]} plus ${c[1]}. Denk an den Little Friend!` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: 'Erst den Little Friend finden' }, { text: 'Dann: 5 dazu, Little Friend weg' }] },
        say: 'Merk dir: Erst den Little Friend finden. Dann fünf dazu und den Little Friend weg.',
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

const LEKTION_13 = littleFriendLektion(13, 4, 3, 1, 4)
const LEKTION_14 = littleFriendLektion(14, 3, 3, 4, 2)
const LEKTION_15 = littleFriendLektion(15, 2, 3, 4, 13)
const LEKTION_16 = littleFriendLektion(16, 1, 4, 14, 24)
const LEKTION_17 = littleWiederholung(17, 'Alle Little Friends', 'Hallo! Du kennst jetzt alle Little Friends. Jetzt wiederholen wir sie gemischt!', [3, 4], [2, 3], [4, 3])
const LEKTION_18 = littleWiederholung(18, 'Little Friends Training', 'Hallo! Heute ist Training im Little Friends Wald. Alle Little Friends kommen gemischt!', [4, 2], [1, 4], [3, 2])

// Welt 3: Best Friends +6 … +9 = Erdperlen dazu, Himmelsperle weg, 10 dazu
function bestFriendLektion(number: number, k: number, a: number, b: number, c: number): Lesson {
  const e = k - 5
  const f = 10 - k
  const ePerlen = e === 1 ? 'eine Erdperle' : `${e} Erdperlen`
  return {
    id: `lektion-${number}`,
    number,
    title: `Best Friend +${k}`,
    world: 3,
    sections: [
      { title: 'Best Friends', start: 'titel' },
      { title: 'Der Trick', start: 'trick' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: `Hallo! Willkommen am Best Friends Berg. Heute rechnen wir plus ${k}.` },
      { id: 'aufgabe-zeigen', cols: 2, value: a, badge: `${a} + ${k}`, say: `Wir haben ${a}. Plus ${k} heißt: 10 dazu und ${f} weg. Aber ${f} weg geht hier nicht direkt!` },
      {
        id: 'freunde', kind: 'karte', min: 6,
        card: { title: 'Best Friends', lines: [{ text: `Big Friend: ${k} und ${f} sind 10` }, { text: `Little Friend hilft beim ${f} weg` }] },
        say: 'Jetzt helfen Big Friend und Little Friend zusammen. Das sind die Best Friends!',
      },
      {
        id: 'trick', kind: 'karte', min: 6,
        card: { title: 'Der Trick', lines: [{ icon: 'daumen-hoch', text: `${e} dazu` }, { icon: 'zeige-hoch', text: '5 weg' }, { icon: 'zeige-hoch', text: '10 dazu' }] },
        say: `Der Trick: Plus ${k} heißt: ${e} dazu, 5 weg und 10 dazu.`,
      },
      { id: 'erd-dazu', cols: 2, value: a, badge: `+ ${e}`, moves: [{ at: 'Erdperle', to: a + e }], say: `Zuerst ${ePerlen} hoch. Das ist plus ${e}.` },
      { id: 'fuenf-weg', badge: '− 5', moves: [{ at: 'Himmelsperle', to: a + e - 5 }], say: 'Dann die Himmelsperle hoch. Fünf weg.' },
      { id: 'zehn-dazu', badge: '+ 10', moves: [{ at: 'Zehner', to: a + k }], say: 'Und jetzt eine Perle bei den Zehnern hoch. Zehn dazu.' },
      { id: 'ergebnis', badge: `${a} + ${k} = ${a + k}`, min: 3.5, say: `Fertig! ${a} plus ${k} ist ${a + k}.` },
      {
        id: 'beispiel-2', cols: 2, value: b, badge: `${b} + ${k} = ${b + k}`, moves: [{ at: 'dazu', to: b + e }, { at: 'Himmelsperle', to: b + e - 5 }, { at: 'Zehner', to: b + k }],
        say: `Noch einmal: ${b} plus ${k}. Erst ${e} dazu, die Himmelsperle hoch, und bei den Zehnern eine Perle hoch. Das ist ${b + k}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c, task: c + k, say: `Jetzt du! Rechne ${c} plus ${k}. ${WORT[e][0].toUpperCase()}${WORT[e].slice(1)} dazu, fünf weg, zehn dazu.` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: `Plus ${k} = ${e} dazu, 5 weg, 10 dazu` }] },
        say: `Merk dir: Plus ${k} ist ${e} dazu, 5 weg und 10 dazu.`,
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

// Lektion 23–24: alle Best Friends gemischt
function bestWiederholung(number: number, title: string, hallo: string, b1: [number, number], b2: [number, number], c: [number, number]): Lesson {
  const [a1, k1] = b1
  const [a2, k2] = b2
  return {
    id: `lektion-${number}`,
    number,
    title,
    world: 3,
    sections: [
      { title: 'Alle Best Friends', start: 'titel' },
      { title: 'Gemischt', start: 'aufgabe-zeigen' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: hallo },
      {
        id: 'freunde', kind: 'karte', min: 6,
        card: { title: 'Alle Best Friends', lines: [{ text: '+6 · +7 · +8 · +9' }, { icon: 'daumen-hoch', text: 'Erdperlen dazu, 5 weg, 10 dazu' }] },
        say: 'Plus sechs, sieben, acht und neun. Immer: Erdperlen dazu, fünf weg, zehn dazu!',
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a1, badge: `${a1} + ${k1}`, say: `Wir haben ${a1}. Jetzt kommt plus ${k1}. Das ist ${k1 - 5} dazu, 5 weg und 10 dazu.` },
      { id: 'erd-dazu', cols: 2, value: a1, badge: `+ ${k1 - 5}`, moves: [{ at: 'hoch', to: a1 + k1 - 5 }], say: `Zuerst ${k1 - 5} hoch.` },
      { id: 'fuenf-weg', badge: '− 5', moves: [{ at: 'Himmelsperle', to: a1 + k1 - 10 }], say: 'Dann die Himmelsperle hoch. Fünf weg.' },
      { id: 'zehn-dazu', badge: '+ 10', moves: [{ at: 'Zehner', to: a1 + k1 }], say: `Und zehn dazu bei den Zehnern. ${a1} plus ${k1} ist ${a1 + k1}.` },
      {
        id: 'beispiel-2', cols: 2, value: a2, badge: `${a2} + ${k2} = ${a2 + k2}`, moves: [{ at: 'dazu', to: a2 + k2 - 5 }, { at: 'Himmelsperle', to: a2 + k2 - 10 }, { at: 'Zehner', to: a2 + k2 }],
        say: `Und jetzt ${a2} plus ${k2}. Erst ${k2 - 5} dazu, die Himmelsperle hoch, und bei den Zehnern eine Perle hoch. Das ist ${a2 + k2}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c[0], task: c[0] + c[1], say: `Jetzt du! Rechne ${c[0]} plus ${c[1]}. Denk an die Best Friends!` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: 'Plus 6 bis 9:' }, { text: 'Erdperlen dazu, 5 weg, 10 dazu' }] },
        say: 'Merk dir: Erdperlen dazu, fünf weg und zehn dazu.',
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

const LEKTION_19 = bestFriendLektion(19, 6, 7, 5, 8)
const LEKTION_20 = bestFriendLektion(20, 7, 6, 5, 7)
const LEKTION_21 = bestFriendLektion(21, 8, 5, 6, 15)
const LEKTION_22 = bestFriendLektion(22, 9, 5, 15, 25)
const LEKTION_23 = bestWiederholung(23, 'Alle Best Friends', 'Hallo! Du kennst jetzt alle Best Friends. Jetzt wiederholen wir sie gemischt!', [7, 6], [5, 9], [6, 7])
const LEKTION_24 = bestWiederholung(24, 'Best Friends Training', 'Hallo! Heute ist Training am Best Friends Berg. Alle Best Friends kommen gemischt!', [6, 8], [8, 6], [5, 8])

// Welt 4, Lektion 25–33: Big Friends Minus – „−k = −10 + f“ (f = Big Friend, k + f = 10).
// Startzahlen so gewählt, dass „+ f“ bei den Einern direkt geht.
function bigFriendMinusLektion(number: number, k: number, a: number, b: number, c: number): Lesson {
  const f = 10 - k
  const dazu = f === 1 ? 'eine Perle' : `${f}`
  return {
    id: `lektion-${number}`,
    number,
    title: `Big Friend −${k}`,
    world: 4,
    sections: [
      { title: 'Big Friends', start: 'titel' },
      { title: 'Der Trick', start: 'trick' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: `Hallo! Willkommen bei den magischen Pyramiden. Heute rechnen wir minus ${k}.` },
      {
        id: 'freunde', kind: 'karte', min: 6,
        card: { title: 'Big Friends', lines: [{ text: `${k} und ${f} sind 10` }, { icon: 'daumen-hoch', text: `Der Big Friend von ${k} ist ${f}` }] },
        say: `${k} und ${f} sind zusammen 10. Also ist ${f} der Big Friend von ${k}.`,
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a, badge: `${a} − ${k}`, say: `Wir haben ${a}. Jetzt rechnen wir minus ${k}. Bei den Einern sind nicht genug Perlen da!` },
      {
        id: 'trick', kind: 'karte', min: 5,
        card: { title: 'Der Trick', lines: [{ icon: 'zeige-runter', text: '10 weg' }, { icon: 'daumen-hoch', text: `${f} dazu` }] },
        say: `Der Trick: Minus ${k} heißt: 10 weg und ${f} dazu.`,
      },
      { id: 'zehn-weg', cols: 2, value: a, badge: '− 10', moves: [{ at: 'bei den Zehnern', to: a - 10 }], say: 'Zuerst eine Perle bei den Zehnern runter. Das sind 10 weg.' },
      { id: 'dazu', badge: `+ ${f}`, moves: [{ at: 'bei den Einern', to: a - k }], say: `Dann gibst du ${dazu} bei den Einern dazu. ${f === 1 ? 'Das ist' : 'Das sind'} ${f} dazu.` },
      { id: 'ergebnis', badge: `${a} − ${k} = ${a - k}`, min: 3.5, say: `Fertig! ${a} minus ${k} ist ${a - k}.` },
      {
        id: 'beispiel-2', cols: 2, value: b, badge: `${b} − ${k} = ${b - k}`, moves: [{ at: 'Zehnern runter', to: b - 10 }, { at: 'Einern dazu', to: b - k }],
        say: `Noch einmal: ${b} minus ${k}. Eine Perle bei den Zehnern runter, ${f} bei den Einern dazu. Das ist ${b - k}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c, task: c - k, say: `Jetzt du! Rechne ${c} minus ${k}. Zehn weg, ${WORT[f] ?? f} dazu.` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: `Minus ${k} = 10 weg, ${f} dazu` }] },
        say: `Merk dir: Minus ${k} ist 10 weg und ${f} dazu.`,
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

// Lektion 34–35: alle Big Friends minus gemischt
function minusWiederholung(number: number, title: string, hallo: string, b1: [number, number], b2: [number, number], c: [number, number]): Lesson {
  const [a1, k1] = b1
  const [a2, k2] = b2
  return {
    id: `lektion-${number}`,
    number,
    title,
    world: 4,
    sections: [
      { title: 'Alle Big Friends', start: 'titel' },
      { title: 'Gemischt', start: 'aufgabe-zeigen' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: hallo },
      {
        id: 'freunde', kind: 'karte', min: 7,
        card: { title: 'Alle Big Friends', lines: [{ text: '9 + 1 · 8 + 2 · 7 + 3' }, { text: '6 + 4 · 5 + 5' }, { icon: 'zeige-runter', text: 'Minus: 10 weg, Big Friend dazu' }] },
        say: 'Neun und eins, acht und zwei, sieben und drei, sechs und vier, fünf und fünf. Beim Minus heißt es: zehn weg und den Big Friend dazu!',
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a1, badge: `${a1} − ${k1}`, say: `Wir haben ${a1}. Jetzt kommt minus ${k1}. Welcher Big Friend hilft? Die ${10 - k1}!` },
      { id: 'zehn-weg', cols: 2, value: a1, badge: '− 10', moves: [{ at: 'bei den Zehnern', to: a1 - 10 }], say: 'Zuerst eine Perle bei den Zehnern runter. Das sind 10 weg.' },
      { id: 'dazu', badge: `+ ${10 - k1}`, moves: [{ at: 'bei den Einern', to: a1 - k1 }], say: `Dann ${10 - k1} bei den Einern dazu. ${a1} minus ${k1} ist ${a1 - k1}.` },
      {
        id: 'beispiel-2', cols: 2, value: a2, badge: `${a2} − ${k2} = ${a2 - k2}`, moves: [{ at: 'Zehn weg', to: a2 - 10 }, { at: 'dazu.', to: a2 - k2 }],
        say: `Und jetzt ${a2} minus ${k2}. Der Big Friend ist ${10 - k2}. Zehn weg, ${10 - k2} dazu. Das ist ${a2 - k2}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c[0], task: c[0] - c[1], say: `Jetzt du! Rechne ${c[0]} minus ${c[1]}. Denk an den Big Friend!` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: 'Erst den Big Friend finden' }, { text: 'Dann: 10 weg, Big Friend dazu' }] },
        say: 'Merk dir: Erst den Big Friend finden. Dann zehn weg und den Big Friend dazu.',
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

const LEKTION_25 = bigFriendMinusLektion(25, 9, 12, 13, 17)
const LEKTION_26 = bigFriendMinusLektion(26, 8, 12, 15, 11)
const LEKTION_27 = bigFriendMinusLektion(27, 7, 11, 16, 10)
const LEKTION_28 = bigFriendMinusLektion(28, 6, 10, 15, 25)
const LEKTION_29 = bigFriendMinusLektion(29, 5, 11, 13, 14)
const LEKTION_30 = bigFriendMinusLektion(30, 4, 12, 13, 21)
const LEKTION_31 = bigFriendMinusLektion(31, 3, 11, 12, 20)
const LEKTION_32 = bigFriendMinusLektion(32, 2, 11, 10, 21)
const LEKTION_33 = bigFriendMinusLektion(33, 1, 10, 20, 30)
const LEKTION_34 = minusWiederholung(34, 'Alle Big Friends Minus', 'Hallo! Du kennst jetzt alle Big Friends beim Minus. Jetzt mischen wir sie!', [12, 9], [11, 7], [14, 5])
const LEKTION_35 = minusWiederholung(35, 'Big Friends Minus Training', 'Hallo! Heute ist Training bei den Pyramiden. Alle Big Friends minus kommen gemischt!', [12, 8], [11, 3], [20, 6])

// Welt 5, Lektion 36–39: Little Friends Minus – „−k = −5 + f“ (f = Little Friend, k + f = 5). Die Himmelsperle hilft.
function littleFriendMinusLektion(number: number, k: number, a: number, b: number, c: number): Lesson {
  const f = 5 - k
  const perlen = f === 1 ? 'eine Erdperle' : `${f} Erdperlen`
  return {
    id: `lektion-${number}`,
    number,
    title: `Little Friend −${k}`,
    world: 5,
    sections: [
      { title: 'Little Friends', start: 'titel' },
      { title: 'Der Trick', start: 'trick' },
      { title: 'Üben', start: 'beispiel-2' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: `Hallo! Willkommen im Weltraum. Heute rechnen wir minus ${k}.` },
      {
        id: 'freunde', kind: 'karte', min: 6,
        card: { title: 'Little Friends', lines: [{ text: `${k} und ${f} sind 5` }, { icon: 'daumen-hoch', text: `Der Little Friend von ${k} ist ${f}` }] },
        say: `${k} und ${f} sind zusammen 5. Also ist ${f} der Little Friend von ${k}.`,
      },
      { id: 'aufgabe-zeigen', cols: 2, value: a, badge: `${a} − ${k}`, say: `Wir haben ${a}. Jetzt rechnen wir minus ${k}. Unten sind nicht genug Erdperlen!` },
      {
        id: 'trick', kind: 'karte', min: 5,
        card: { title: 'Der Trick', lines: [{ icon: 'zeige-hoch', text: '5 weg' }, { icon: 'daumen-hoch', text: `${f} dazu` }] },
        say: `Der Trick: Minus ${k} heißt: 5 weg und ${f} dazu.`,
      },
      { id: 'fuenf-weg', cols: 2, value: a, badge: '− 5', moves: [{ at: 'Himmelsperle', to: a - 5 }], say: 'Zuerst die Himmelsperle hoch. Das sind 5 weg.' },
      { id: 'dazu', badge: `+ ${f}`, moves: [{ at: 'hoch.', to: a - k }], say: `Dann schiebst du ${perlen} hoch. Das ${f === 1 ? 'ist' : 'sind'} ${f} dazu.` },
      { id: 'ergebnis', badge: `${a} − ${k} = ${a - k}`, min: 3.5, say: `Fertig! ${a} minus ${k} ist ${a - k}.` },
      {
        id: 'beispiel-2', cols: 2, value: b, badge: `${b} − ${k} = ${b - k}`, moves: [{ at: 'Himmelsperle', to: b - 5 }, { at: 'dazu.', to: b - k }],
        say: `Noch einmal: ${b} minus ${k}. Die Himmelsperle hoch, ${f} dazu. Das ist ${b - k}!`,
      },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c, task: c - k, say: `Jetzt du! Rechne ${c} minus ${k}. Fünf weg, ${WORT[f]} dazu.` },
      {
        id: 'merksatz', kind: 'karte', min: 5,
        card: { title: 'Das merkst du dir', lines: [{ text: `Minus ${k} = 5 weg, ${f} dazu` }] },
        say: `Merk dir: Minus ${k} ist 5 weg und ${f} dazu.`,
      },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

// Welt 5, Lektion 40–46: gemischte Wiederholungen – zwei Beispiele, dann eine Aufgabe zum Mitmachen
function mischLektion(number: number, title: string, hallo: string, karte: string[], b1: [number, number], b2: [number, number], c: [number, number], merk: string): Lesson {
  const rech = (a: number, k: number) => `${a} ${k < 0 ? 'minus' : 'plus'} ${Math.abs(k)}`
  const zeichen = (a: number, k: number) => `${a} ${k < 0 ? '−' : '+'} ${Math.abs(k)}`
  // Welcher Weg auf dem Abakus? e = Einer, erd = Erdperlen oben, himmel = Himmelsperle unten
  const hilfe = (a: number, k: number) => {
    const n = Math.abs(k), e = a % 10, erd = e % 5, himmel = e >= 5
    if (k < 0) {
      if (e >= n && (n < 5 ? erd >= n : himmel && erd >= n - 5)) return 'Das geht direkt.'
      if (e >= n && n < 5) return `Little Friend: 5 weg und ${5 - n} dazu.`
      return `Big Friend: 10 weg und ${10 - n} dazu.`
    }
    if (e + n <= 9 && (n < 5 ? erd + n <= 4 : !himmel && erd + n - 5 <= 4)) return 'Das geht direkt.'
    if (e + n <= 9 && n < 5) return `Little Friend: 5 dazu und ${5 - n} weg.`
    return `Big Friend: 10 dazu und ${10 - n} weg.`
  }
  return {
    id: `lektion-${number}`,
    number,
    title,
    world: 5,
    sections: [
      { title: 'Wiederholung', start: 'titel' },
      { title: 'Beispiele', start: 'beispiel-1' },
      { title: 'Üben', start: 'aufgabe' },
    ],
    scenes: [
      { id: 'titel', kind: 'titel', min: 4, cols: 2, value: 0 },
      { id: 'hallo', say: hallo },
      { id: 'freunde', kind: 'karte', min: 6, card: { title: 'Welcher Freund hilft?', lines: karte.map((text) => ({ text })) }, say: 'Schau immer zuerst: Geht es direkt? Sonst hilft ein Little Friend oder ein Big Friend.' },
      { id: 'beispiel-1', cols: 2, value: b1[0], badge: `${zeichen(...b1)} = ${b1[0] + b1[1]}`, moves: [{ at: 0.75, to: b1[0] + b1[1], dur: 1.2 }], say: `Wir rechnen ${rech(...b1)}. ${hilfe(...b1)} Das ist ${b1[0] + b1[1]}.` },
      { id: 'beispiel-2', cols: 2, value: b2[0], badge: `${zeichen(...b2)} = ${b2[0] + b2[1]}`, moves: [{ at: 0.75, to: b2[0] + b2[1], dur: 1.2 }], say: `Und jetzt ${rech(...b2)}. ${hilfe(...b2)} Das ist ${b2[0] + b2[1]}.` },
      { id: 'aufgabe', kind: 'aufgabe', cols: 2, value: c[0], task: c[0] + c[1], say: `Jetzt du! Rechne ${rech(...c)}. Welcher Freund hilft?` },
      { id: 'merksatz', kind: 'karte', min: 5, card: { title: 'Das merkst du dir', lines: [{ text: merk }] }, say: `Merk dir: ${merk}.` },
      { id: 'ende', kind: 'ende', min: 5, say: 'Super! Drück jetzt unten auf Weiter und übe den Trick. Los geht’s!' },
    ],
  }
}

const LEKTION_36 = littleFriendMinusLektion(36, 4, 6, 8, 7)
const LEKTION_37 = littleFriendMinusLektion(37, 3, 7, 5, 16)
const LEKTION_38 = littleFriendMinusLektion(38, 2, 6, 5, 16)
const LEKTION_39 = littleFriendMinusLektion(39, 1, 5, 15, 25)
const LITTLE = ['−4 = −5 + 1 · −3 = −5 + 2', '−2 = −5 + 3 · −1 = −5 + 4']
const LEKTION_40 = mischLektion(40, 'Little Friends Minus alle', 'Hallo! Du kennst jetzt alle Little Friends beim Minus. Jetzt mischen wir sie!', LITTLE, [6, -4], [7, -3], [8, -4], 'Minus mit Little Friend: 5 weg, Freund dazu')
const LEKTION_41 = mischLektion(41, 'Little Friends Minus Training', 'Hallo! Heute ist Training im Weltraum. Alle Little Friends minus kommen gemischt!', LITTLE, [5, -2], [16, -3], [7, -4], 'Minus mit Little Friend: 5 weg, Freund dazu')
const MIX = ['Little Friend: −5 + Freund', 'Big Friend: −10 + Freund']
const LEKTION_42 = mischLektion(42, 'Big & Little Friends Minus', 'Hallo! Jetzt mischen wir Big und Little Friends beim Minus.', MIX, [12, -9], [6, -3], [11, -7], 'Erst schauen, dann den passenden Freund nehmen')
const LEKTION_43 = mischLektion(43, 'Big Friends Plus & Minus', 'Hallo! Heute kommen Big Friends plus und minus gemischt.', ['Plus: 10 dazu, Freund weg', 'Minus: 10 weg, Freund dazu'], [7, 8], [13, -8], [6, 9], 'Plus: 10 dazu, Freund weg. Minus: 10 weg, Freund dazu')
const LEKTION_44 = mischLektion(44, 'Little Friends Plus & Minus', 'Hallo! Heute kommen Little Friends plus und minus gemischt.', ['Plus: 5 dazu, Freund weg', 'Minus: 5 weg, Freund dazu'], [3, 4], [7, -4], [6, -3], 'Plus: 5 dazu, Freund weg. Minus: 5 weg, Freund dazu')
const LEKTION_45 = mischLektion(45, 'Große Wiederholung', 'Hallo! Große Wiederholung im Weltraum. Alle Freunde kommen gemischt, plus und minus.', ['Direkt · Little Friend · Big Friend', 'Immer zuerst schauen!'], [8, 7], [6, -4], [12, -9], 'Immer zuerst den passenden Freund finden')
const LEKTION_46 = mischLektion(46, 'Weltraum-Training', 'Hallo! Weltraum-Training! Zeig, was du kannst!', ['Direkt · Little Friend · Big Friend', 'Immer zuerst schauen!'], [9, 6], [13, -6], [7, -3], 'Immer zuerst den passenden Freund finden')

export const LESSONS: Lesson[] = [LEKTION_1, LEKTION_2, LEKTION_3, LEKTION_4, LEKTION_5, LEKTION_6, LEKTION_7, LEKTION_8, LEKTION_9, LEKTION_10, LEKTION_11, LEKTION_12, LEKTION_13, LEKTION_14, LEKTION_15, LEKTION_16, LEKTION_17, LEKTION_18, LEKTION_19, LEKTION_20, LEKTION_21, LEKTION_22, LEKTION_23, LEKTION_24, LEKTION_25, LEKTION_26, LEKTION_27, LEKTION_28, LEKTION_29, LEKTION_30, LEKTION_31, LEKTION_32, LEKTION_33, LEKTION_34, LEKTION_35, LEKTION_36, LEKTION_37, LEKTION_38, LEKTION_39, LEKTION_40, LEKTION_41, LEKTION_42, LEKTION_43, LEKTION_44, LEKTION_45, LEKTION_46]

const WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
/** Sprechtext: Ziffern als Wörter, damit die Stimme „Die 1“ nicht als „die Erste“ liest. Gleich lang wie
 *  nötig für die Zeitmarken – Stellen im Text werden über diese Funktion auf den Sprechtext abgebildet. */
export const spokenText = (t: string) => t
  .replace(/\b(Die|die) (\d)\b/g, (_, d: string, n: string) => `${d} ${WORDS[+n][0].toUpperCase()}${WORDS[+n].slice(1)}`)
  .replace(/\b(\d)\b/g, (_, n: string) => WORDS[+n])
export const findLesson = (id: string) => LESSONS.find((l) => l.id === id) ?? null
