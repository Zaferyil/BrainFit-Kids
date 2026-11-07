import { buchAufgaben } from './buch'

// Aufgaben der Anzan-Tests am Ende einer Welt (Karte Platz 23 und 24): je 5 Aufgaben aus den
// Wiederholungsseiten des Basic Books, Test 1 kürzere (A), Test 2 längere Ketten (B).
const SEITEN: Record<number, [number, number]> = { 4: [59, 60] }

export function anzanTestAufgaben(welt: number, nr: number): { numbers: number[]; answer: number }[] {
  const [s1, s2] = SEITEN[welt] ?? [59, 60]
  const pool = nr === 1 ? [...buchAufgaben(s1, 'A'), ...buchAufgaben(s1, 'B')].filter((z) => z.length <= 5)
    : [...buchAufgaben(s2, 'A'), ...buchAufgaben(s2, 'B')].filter((z) => z.length >= 5)
  const gemischt = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)
  return gemischt.map((numbers) => ({ numbers, answer: numbers.reduce((a, b) => a + b, 0) }))
}
