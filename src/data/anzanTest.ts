// Regel ab Welt 4: die letzten zwei Plätze jeder Welt sind Anzan-Tests (Zahlen blitzen auf, das Kind rechnet).
// Nur einstellige Zahlen. Test 1: mit dem eigenen Abakus (wer keinen hat: im Kopf), Test 2: nur im Kopf und schneller.
// Tempo: Welt 4 = 3,0 s / 2,6 s je Zahl, jede weitere Welt 0,3 s schneller (Welt 5: 2,7 / 2,3 · Welt 6: 2,4 / 2,0).

export const ANZAN_TEST_SAGEN: Record<number, string> = {
  1: 'Anzan-Test! Rechne mit deinem Abakus. Wenn du keinen hast, rechne im Kopf.',
  2: 'Anzan-Test zwei! Jetzt rechnest du nur im Kopf. Die Zahlen kommen schneller.',
}

/** Zeit je Zahl in ms */
export function anzanTestTempo(welt: number, nr: number) {
  const basis = Math.max(1200, 3000 - 300 * Math.max(0, welt - 4))
  return nr === 1 ? basis : basis - 400
}

/** Regel der Welt: dieser Minus-Schritt braucht genau die Formel der Welt */
function regel(welt: number, v: number, k: number): boolean {
  const e = v % 10
  // Big Friend −k: 10 weg, dann (10−k) bei den Einern direkt dazu
  if (welt === 4) { const f = 10 - k; return v >= 10 && e < k && e + f <= 9 && (e >= 5 || e + f < 5 || f >= 5) }
  if (welt === 5) return k <= 4 && e >= 5 && e - 5 < k && e >= k // Little Friend −k: 5 weg, (5−k) dazu
  return v >= k
}

const zufall = (n: number) => Math.floor(Math.random() * n)

/** 5 Aufgaben mit einstelligen Zahlen; jede Aufgabe hat mindestens zwei Schritte mit der Formel der Welt */
export function anzanTestAufgaben(welt: number, nr: number): { numbers: number[]; answer: number }[] {
  const laenge = nr === 1 ? 5 : 6
  const out: { numbers: number[]; answer: number }[] = []
  for (let versuch = 0; out.length < 5 && versuch < 5000; versuch++) {
    const z = [1 + zufall(9)]
    let v = z[0], formel = 0
    for (let i = 1; i < laenge; i++) {
      // Minus mit der Formel der Welt, wenn es passt (abwechselnd), sonst plus
      const minus = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((k) => regel(welt, v, k))
      if (minus.length && (i % 2 === 0 || formel === 0)) { const k = minus[zufall(minus.length)]; z.push(-k); v -= k; formel++; continue }
      const plus = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => v + d <= 29)
      const d = plus[zufall(plus.length)]; z.push(d); v += d
    }
    if (formel >= 2 && v >= 0 && !out.some((o) => o.numbers.join() === z.join())) out.push({ numbers: z, answer: v })
  }
  return out
}
