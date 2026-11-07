import { buchAufgaben } from './buch'

// Regel ab Welt 4: die letzten zwei Plätze jeder Welt sind Anzan-Tests (Zahlen blitzen auf, Kopfrechnen).
// Je 5 Aufgaben aus den Wiederholungsseiten des Basic Books zum Thema der Welt:
// Test 1 kürzere Ketten im Tempo „Normal“, Test 2 längere Ketten im Tempo „Schnell“ – das Kind wird zum Ende hin schneller.
const SEITEN: Record<number, [number, number]> = { 4: [59, 60], 5: [69, 70] }
export const ANZAN_TEST_TEMPO: Record<number, number> = { 1: 1100, 2: 800 }

export function anzanTestAufgaben(welt: number, nr: number): { numbers: number[]; answer: number }[] {
  const [s1, s2] = SEITEN[welt] ?? [59, 60]
  const pool = nr === 1 ? [...buchAufgaben(s1, 'A'), ...buchAufgaben(s1, 'B')].filter((z) => z.length <= 5)
    : [...buchAufgaben(s2, 'A'), ...buchAufgaben(s2, 'B')].filter((z) => z.length >= 5)
  const gemischt = [...pool].sort(() => Math.random() - 0.5).slice(0, 5)
  return gemischt.map((numbers) => ({ numbers, answer: numbers.reduce((a, b) => a + b, 0) }))
}
