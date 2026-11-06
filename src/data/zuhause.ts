import { unitContent } from './units'
import { WORLDS } from './curriculum'

// „Zuhause üben – 5 Minuten“: Wochentipp für Eltern passend zur aktuellen Lektion des Kindes.

export type ZuhauseTipp = { thema: string; regel: string | null; ideen: string[] }

export function zuhauseTipp(welt: number, einheit: number): ZuhauseTipp {
  const c = unitContent(welt, einheit)
  const thema = WORLDS[welt - 1]?.units[einheit - 1] ?? 'Abakus'
  const k = c?.add
  const regel = c?.rule?.[0] ?? null
  const ideen: string[] = []
  if (!c || (!c.add && !c.adds)) {
    ideen.push('Zeigen Sie eine Zahl mit den Fingern – Ihr Kind stellt sie am Abakus ein (oder malt die Perlen).')
    ideen.push('Zählen Sie gemeinsam Dinge im Haushalt (Löffel, Äpfel, Schuhe) und sagen Sie die Zahl in Perlen: „7 ist eine Himmelsperle und 2 Erdperlen“.')
    ideen.push('Hausnummern oder Autokennzeichen beim Spaziergang: Ihr Kind sagt, wie die Zahl am Abakus aussieht.')
  } else if (c.freunde === 'little' || (k && k <= 4 && /5/.test(regel ?? ''))) {
    ideen.push(`Fragen Sie beim Kochen oder Tischdecken: „Wir haben 3 Teller, es kommen ${k ?? 2} dazu – wie viele?“ Ihr Kind denkt an die Regel ${regel ?? ''}.`)
    ideen.push('Spielen Sie „Freunde der 5“: Sie sagen eine Zahl von 1–4, Ihr Kind sagt blitzschnell den Partner zur 5 (1↔4, 2↔3).')
    ideen.push('Würfelspiel: Zwei Würfel werfen und im Kopf addieren – wer zuerst richtig ruft, bekommt einen Punkt.')
  } else {
    ideen.push(`Rechnen Sie beim Einkaufen kleine Aufgaben mit +${k ?? 9}: „Das kostet 23 €, dazu ${k ?? 9} € – wie viel?“ Ihr Kind denkt an ${regel ?? 'die Regel'}.`)
    ideen.push('Spielen Sie „Freunde der 10“: Sie sagen eine Zahl von 1–9, Ihr Kind sagt blitzschnell den Partner zur 10 (3↔7, 6↔4).')
    ideen.push('Autokennzeichen-Spiel: Nehmen Sie die letzten zwei Ziffern und zählen Sie gemeinsam die Zahl der Woche dazu.')
  }
  return { thema, regel, ideen }
}
