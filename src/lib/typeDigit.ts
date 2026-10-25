/** Tastatur-Eingabe für mehrstellige Antworten: fertig, sobald so viele Ziffern wie die Lösung da sind. */
export function typeDigit(input: string, key: string, answer: number) {
  if (key === 'C') return { input: '', done: false }
  if (key === 'del') return { input: input.slice(0, -1), done: false }
  const next = (input + key).slice(0, 3)
  return { input: next, done: next.length >= String(answer).length }
}
