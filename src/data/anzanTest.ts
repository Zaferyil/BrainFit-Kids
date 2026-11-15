// Am Ende jeder Welt gibt es zwei Anzan-Tests (Zahlen blitzen auf, das Kind rechnet).
// Nur einstellige Zahlen. Test 1: mit dem eigenen Abakus (wer keinen hat: im Kopf), Test 2: nur im Kopf und schneller.
// Tempo: Welt 4 = 3,0 s / 2,6 s je Zahl, jede weitere Welt 0,3 s schneller (Welt 5: 2,7 / 2,3 · Welt 6: 2,4 / 2,0).

export const ANZAN_TEST_SAGEN: Record<number, string> = {
  1: 'Anzan-Test! Rechne mit deinem Abakus. Wenn du keinen hast, rechne im Kopf.',
  2: 'Anzan-Test zwei! Jetzt rechnest du nur im Kopf. Die Zahlen kommen schneller.',
}

export const PRUEFUNG_SAGEN = 'Super! Jetzt kannst du die Gürtel-Prüfung machen.'
export const FINALE_SAGEN = 'Herzlichen Glückwunsch! Du hast alle Welten geschafft. Du darfst jetzt an der Mental-Arithmetik-Ausbildung für Fortgeschrittene teilnehmen: Multiplikation und Division. Sag es gleich deinen Eltern!'

/** Zeit je Zahl in ms */
export function anzanTestTempo(welt: number, nr: number) {
  const basis = Math.max(1200, 3000 - 300 * Math.max(0, welt - 4))
  return nr === 1 ? basis : basis - 400
}

/** Schritte (mit Vorzeichen), die bei Stand v genau die Formel der Welt brauchen */
function formelSchritte(welt: number, v: number): number[] {
  const e = v % 10, erd = e % 5, oben = e >= 5
  const out: number[] = []
  for (let k = 1; k <= 9; k++) {
    const f = 10 - k
    // Welt 1 Big Friend +k: 10 dazu, (10−k) bei den Einern direkt weg
    if (welt === 1 && e + k >= 10 && v + k <= 49 && e >= f && (f < 5 ? erd >= f : oben && erd >= f - 5)) out.push(k)
    // Welt 2 Little Friend +k: 5 dazu, (5−k) weg
    if (welt === 2 && k <= 4 && !oben && erd + k >= 5 && erd >= 5 - k) out.push(k)
    // Welt 3 Best Friend +k (6…9): (k−5) dazu, 5 weg, 10 dazu
    if (welt === 3 && k >= 6 && oben && e + k >= 10 && v + k <= 49 && erd + (k - 5) <= 4) out.push(k)
    // Welt 4 Big Friend −k: 10 weg, (10−k) bei den Einern direkt dazu
    if (welt === 4 && v >= 10 && e < k && e + f <= 9 && (e >= 5 || e + f < 5 || f >= 5)) out.push(-k)
    // Welt 5 Little Friend −k: 5 weg, (5−k) dazu
    if (welt === 5 && k <= 4 && oben && erd < k) out.push(-k)
    // Welt 6 Best Friend −k (6…9): 10 weg, 5 dazu, (k−5) weg
    if (welt >= 6 && k >= 6 && v >= 10 && !oben && e >= k - 5) out.push(-k)
  }
  return out
}

const zufall = (n: number) => Math.floor(Math.random() * n)

/** 5 Aufgaben mit einstelligen Zahlen; jede Aufgabe hat mindestens zwei Schritte mit der Formel der Welt */
export function anzanTestAufgaben(welt: number, nr: number): { numbers: number[]; answer: number }[] {
  const laenge = nr === 1 ? 5 : 6
  const plusWelt = welt <= 3
  const out: { numbers: number[]; answer: number }[] = []
  for (let versuch = 0; out.length < 5 && versuch < 8000; versuch++) {
    const z = [1 + zufall(9)]
    let v = z[0], formel = 0
    for (let i = 1; i < laenge; i++) {
      // abwechselnd: ein Schritt mit der Formel der Welt, dann ein Schritt in die andere Richtung
      const s = formelSchritte(welt, v)
      if (s.length && (i % 2 === 0 || formel === 0)) { const k = s[zufall(s.length)]; z.push(k); v += k; formel++; continue }
      const f = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => (plusWelt ? v - d >= 0 : v + d <= 29))
      if (!f.length) break
      const d = f[zufall(f.length)] * (plusWelt ? -1 : 1); z.push(d); v += d
    }
    if (z.length === laenge && formel >= 2 && v >= 0 && !out.some((o) => o.numbers.join() === z.join())) out.push({ numbers: z, answer: v })
  }
  return out
}
