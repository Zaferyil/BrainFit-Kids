// Gestufte Hilfe: aus einer Regel wie „+9 = +10 − 1“ die Rechenschritte für eine Aufgabe machen.
// Regeln mit Platzhaltern (z. B. „+k = +10 − Big Friend“) liefern keine Schritte.

export const TIPP_SAGEN = 'Fast! Denk an die Regel und versuch es nochmal.'
export const SCHRITTE_SAGEN = 'Schau, so geht es Schritt für Schritt.'

/** z. B. a=36, Regel „+9 = +10 − 1“ → ["36 + 10 = 46", "46 − 1 = 45"] */
export function rechenSchritte(a: number, regel: string | undefined): string[] {
  if (!regel || /[a-z]/i.test(regel.split('=')[1] ?? 'x')) return []
  const ops = [...(regel.split('=')[1] ?? '').matchAll(/([+−-])\s*(\d+)/g)].map((m) => (m[1] === '+' ? 1 : -1) * Number(m[2]))
  if (ops.length < 2) return []
  let x = a
  return ops.map((o) => { const y = x + o; const s = `${x} ${o > 0 ? '+' : '−'} ${Math.abs(o)} = ${y}`; x = y; return s })
}
