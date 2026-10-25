export type GameProps = {
  level: number
  /** score 0–1 (Leistung), summary kurzer Satz fürs Ergebnis */
  onFinish: (score: number, summary: string) => void
}

export const shuffle = <T,>(arr: T[]) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
