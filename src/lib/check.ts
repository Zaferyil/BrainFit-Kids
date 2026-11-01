import { supabase } from './supabase'

// Gratis Kopfrechen-Check (Website): Aufgaben je Schulstufe, Bewertung 0–100 und Vergleich mit Gleichaltrigen.

export type Bereich = 'rechnen' | 'abakus' | 'blitz' | 'merken' | 'konzentration'
export type Werte = Record<Bereich, number>
export const BEREICHE: { id: Bereich; name: string; emoji: string; text: string }[] = [
  { id: 'rechnen', name: 'Rechnen & Mengen', emoji: '⚡', text: 'Rechnet bzw. vergleicht Mengen schnell und sicher' },
  { id: 'abakus', name: 'Zahlenverständnis', emoji: '🧮', text: 'Erkennt Mengen, Zahlen und Stellenwerte' },
  { id: 'blitz', name: 'Blitz-Erfassung', emoji: '👀', text: 'Erfasst Zahlen auf einen Blick' },
  { id: 'merken', name: 'Arbeitsgedächtnis', emoji: '🧠', text: 'Merkt sich Reihenfolgen' },
  { id: 'konzentration', name: 'Konzentration', emoji: '🎯', text: 'Bleibt fokussiert und genau' },
]
export const STUFEN = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
export const stufeVonAlter = (alter: number) => Math.max(0, Math.min(6, alter - 6))

const zufall = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))

/** Rechenaufgabe passend zur Schulstufe */
export function rechenaufgabe(stufe: number): { text: string; loesung: number } {
  const plus = Math.random() < 0.6
  let a: number, b: number
  switch (stufe) {
    case 0: a = zufall(1, 5); b = zufall(0, 10 - a); return { text: `${a} + ${b}`, loesung: a + b }
    case 1: if (plus) { a = zufall(2, 12); b = zufall(1, 20 - a); return { text: `${a} + ${b}`, loesung: a + b } }
      a = zufall(5, 20); b = zufall(1, a); return { text: `${a} − ${b}`, loesung: a - b }
    case 2: if (plus) { a = zufall(12, 89); b = zufall(2, 9); return { text: `${a} + ${b}`, loesung: a + b } }
      a = zufall(20, 99); b = zufall(2, 9); return { text: `${a} − ${b}`, loesung: a - b }
    case 3: if (plus) { a = zufall(12, 69); b = zufall(11, 99 - a); return { text: `${a} + ${b}`, loesung: a + b } }
      a = zufall(40, 99); b = zufall(11, a - 5); return { text: `${a} − ${b}`, loesung: a - b }
    case 4: if (plus) { a = zufall(110, 870); b = zufall(12, 99); return { text: `${a} + ${b}`, loesung: a + b } }
      a = zufall(150, 990); b = zufall(12, 99); return { text: `${a} − ${b}`, loesung: a - b }
    default: if (plus) { a = zufall(120, 780); b = zufall(110, 999 - a); return { text: `${a} + ${b}`, loesung: a + b } }
      a = zufall(400, 999); b = zufall(110, a - 50); return { text: `${a} − ${b}`, loesung: a - b }
  }
}

/** Stellen für Abakus und Blitzzahlen */
export const abakusStellen = (stufe: number) => (stufe === 0 ? 1 : stufe <= 2 ? 2 : 3)
export const blitzStellen = (stufe: number) => (stufe === 0 ? 1 : stufe <= 2 ? 2 : stufe <= 4 ? 3 : 4)
export const zahlMitStellen = (n: number) => (n === 1 ? zufall(1, 9) : zufall(10 ** (n - 1), 10 ** n - 1))
export const zeitLimit = (stufe: number) => (stufe === 0 ? 25 : stufe <= 2 ? 20 : 15)

/** Antwortmöglichkeiten für „Welche Zahl zeigt der Abakus?“ */
export function optionen(richtig: number, stellen: number) {
  const max = 10 ** stellen - 1
  const set = new Set([richtig])
  const tausche = () => { const s = String(richtig).padStart(stellen, '0').split(''); const i = zufall(0, s.length - 1); s[i] = String((Number(s[i]) + zufall(1, 4)) % 10); return Number(s.join('')) }
  while (set.size < 4) { const v = Math.random() < 0.7 ? tausche() : zufall(stellen === 1 ? 1 : 10 ** (stellen - 1), max); if (v > 0 && v <= max) set.add(v) }
  return [...set].sort(() => Math.random() - 0.5)
}

/** Punkte für eine Antwort: richtig 60 %, Tempo bis 40 % */
export const punkte = (richtig: boolean, sek: number, limit: number) => (richtig ? 0.6 + 0.4 * Math.max(0, 1 - sek / limit) : 0)

// Richtwerte, solange es noch wenige Ergebnisse gibt (Normalverteilung um 55, Streuung 18)
const phi = (z: number) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)); const d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p }
const richtwert = (w: number) => Math.round(100 * phi((w - 55) / 18))
export const MIN_VERGLEICH = 30

export type Vergleich = { echt: boolean; anzahl: number; perzentil: Werte & { gesamt: number } }

/** Ergebnis speichern (anonym) und mit derselben Schulstufe vergleichen */
export type Variante = 'A' | 'B' | 'C'
export async function speichernUndVergleichen(alter: number, stufe: number, variante: Variante, abakus: boolean, w: Werte, dauer: number): Promise<{ id: string; vergleich: Vergleich }> {
  const gesamt = Math.round((w.rechnen + w.abakus + w.blitz + w.merken + w.konzentration) / 5)
  const id = crypto.randomUUID()
  await supabase.from('check_ergebnisse').insert({ id, alter_jahre: alter, stufe, variante, abakus_bekannt: abakus, ...w, gesamt, dauer_sek: dauer }).then(({ error }) => { if (error) console.warn('Check:', error.message) })
  const { data } = await supabase.rpc('check_vergleich', { p_stufe: stufe, p_variante: variante, p_abakus: abakus, w: { ...w, gesamt } })
  const anzahl = Number(data?.anzahl ?? 0)
  const echt = anzahl >= MIN_VERGLEICH
  const p = (k: Bereich | 'gesamt', wert: number) => (echt ? Number(data?.[k] ?? 0) : richtwert(wert))
  return { id, vergleich: { echt, anzahl, perzentil: { rechnen: p('rechnen', w.rechnen), abakus: p('abakus', w.abakus), blitz: p('blitz', w.blitz), merken: p('merken', w.merken), konzentration: p('konzentration', w.konzentration), gesamt: p('gesamt', gesamt) } } }
}

export async function berichtAnfordern(id: string, mail: string, newsletter: boolean) {
  const { data, error } = await supabase.functions.invoke('check-bericht', { body: { id, mail, newsletter } })
  if (error || data?.fehler) return data?.fehler ?? 'Das hat leider nicht geklappt. Bitte später erneut versuchen.'
  return null
}
