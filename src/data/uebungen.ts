import type { IconName } from '../components/Icon'
import { WORLDS } from './curriculum'
import { makeSum, rechnet, unitContent, type UnitContent } from './units'

// Abwechslung: Die drei Übungs-Stationen einer Lektion (Plätze „ueben“, „blitz“, „kopfrechnen“)
// nehmen je Lektion andere Übungsarten – Vorbilder: Abakus-App (Unity), Math Kids, Anzan Meister.

export type UebungsArt = 'einstellen' | 'ablesen' | 'blitzAbakus' | 'zahlenBlitz' | 'hoerRechnen' | 'kopfrechnen' | 'schnell' | 'memory' | 'vergleich' | 'merken'
export type UebungsPlatz = 'ueben' | 'blitz' | 'kopfrechnen'

export const UEBUNGEN: Record<UebungsArt, { title: string; icon: IconName | 'bead'; color: string; text: string; intro: string }> = {
  einstellen: { title: 'Perlen einstellen', icon: 'bead', color: '#FFC531', text: 'Rechne und stelle das Ergebnis am Abakus ein.', intro: 'Jetzt rechnest du mit dem Abakus. Schieb die Perlen, bis das Ergebnis stimmt.' },
  ablesen: { title: 'Abakus ablesen', icon: 'bead', color: '#FFC531', text: 'Lies den Abakus und rechne weiter.', intro: 'Schau dir den Abakus genau an. Rechne die Aufgabe und tippe das Ergebnis ein.' },
  blitzAbakus: { title: 'Blitz-Abakus', icon: 'bolt', color: '#FF8A1F', text: 'Der Abakus blitzt kurz auf.', intro: 'Gleich blitzt der Abakus ganz kurz auf. Merk dir die Zahl und rechne weiter.' },
  zahlenBlitz: { title: 'Zahlen-Blitz', icon: 'bolt', color: '#FF8A1F', text: 'Zahlen kommen nacheinander – rechne mit.', intro: 'Gleich kommen Zahlen nacheinander. Rechne mit deinem Abakus mit und tippe am Ende das Ergebnis ein.' },
  hoerRechnen: { title: 'Hör-Rechnen', icon: 'volume', color: '#3BA7FF', text: 'Hör gut zu und rechne mit.', intro: 'Jetzt hörst du die Zahlen nur. Hör gut zu, rechne mit und tippe am Ende das Ergebnis ein.' },
  kopfrechnen: { title: 'Kopfrechnen', icon: 'brain', color: '#3DBE5B', text: 'Rechne ohne Abakus im Kopf.', intro: 'Jetzt geht es ohne Abakus. Stell dir die Perlen im Kopf vor und tippe das Ergebnis ein.' },
  schnell: { title: 'Schnell-Runde', icon: 'clock', color: '#FF4D6D', text: 'So viele Aufgaben wie möglich in einer Minute.', intro: 'Schnell-Runde! Du hast eine Minute. Rechne so viele Aufgaben wie möglich.' },
  memory: { title: 'Rechen-Memory', icon: 'gem', color: '#A06BFF', text: 'Finde Aufgabe und Ergebnis.', intro: 'Rechen-Memory! Dreh zwei Karten um. Finde immer die Aufgabe und ihr Ergebnis.' },
  vergleich: { title: 'Größer oder kleiner?', icon: 'target', color: '#3BA7FF', text: 'Welche Aufgabe gibt mehr?', intro: 'Hier siehst du zwei Aufgaben. Rechne beide und tippe die Aufgabe mit dem größeren Ergebnis an.' },
  merken: { title: 'Merken und rechnen', icon: 'eyeoff', color: '#3DBE5B', text: 'Merk dir die Zahlen und rechne zusammen.', intro: 'Gleich siehst du ein paar Zahlen. Merk sie dir gut! Dann rechnest du alle zusammen.' },
}

/** Abwechslungs-Plan: je Lektion drei Übungsarten (Plätze ueben · blitz · kopfrechnen) */
const DREIER: [UebungsArt, UebungsArt, UebungsArt][] = [
  ['einstellen', 'blitzAbakus', 'kopfrechnen'],
  ['ablesen', 'zahlenBlitz', 'schnell'],
  ['einstellen', 'hoerRechnen', 'memory'],
  ['ablesen', 'blitzAbakus', 'vergleich'],
  ['einstellen', 'zahlenBlitz', 'merken'],
  ['ablesen', 'hoerRechnen', 'schnell'],
  ['einstellen', 'blitzAbakus', 'memory'],
  ['ablesen', 'zahlenBlitz', 'vergleich'],
  ['einstellen', 'hoerRechnen', 'kopfrechnen'],
  ['ablesen', 'blitzAbakus', 'merken'],
]

/** Übungsart für einen Platz der Lektion; Lektion 1 (ohne Rechnen) behält die Grund-Übungen. */
export function uebungsArt(world: number, unit: number, platz: UebungsPlatz): UebungsArt | null {
  const content = unitContent(world, unit)
  if (!content || !rechnet(content)) return null
  const nr = WORLDS.slice(0, world - 1).reduce((n, w) => n + w.units.length, 0) + unit
  const dreier = DREIER[(nr - 2 + DREIER.length) % DREIER.length]
  return dreier[['ueben', 'blitz', 'kopfrechnen'].indexOf(platz)]
}

// Ketten wie bei Math Kids: Startzahl + „Trick der Lektion“, danach Zahlen, die direkt gehen (ohne Freunde)
function direkt(x: number, d: number) {
  const e = x % 10
  const himmel = e >= 5
  const erd = e % 5
  if (d > 0) return d < 5 ? erd + d <= 4 : d === 5 ? !himmel : !himmel && erd + d - 5 <= 4
  const m = -d
  return m < 5 ? erd >= m : m === 5 ? himmel : himmel && erd >= m - 5
}

export function kette(content: UnitContent, laenge: number) {
  const { a, b } = makeSum(content)
  const zahlen = [a, b]
  let wert = a + b
  while (zahlen.length < laenge) {
    const moeglich = [1, 2, 3, 4, -1, -2, -3, -4].filter((d) => wert + d >= 0 && direkt(wert, d))
    if (!moeglich.length) break
    const d = moeglich[Math.floor(Math.random() * moeglich.length)]
    zahlen.push(d)
    wert += d
  }
  return { zahlen, antwort: wert }
}

/** Kettenlänge nach Klasse (Aufgaben je Station: 6 → 2 Zahlen, 8 → 3, 10 → 4) */
export const kettenLaenge = (aufgaben: number) => (aufgaben <= 6 ? 2 : aufgaben <= 8 ? 3 : 4)
