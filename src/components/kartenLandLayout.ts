// Maße der gezeichneten Karte (gleiche Breite wie das Inselbild) und Lage der Stationen.

export const LAND_W = 941
const STEP = 195
const PAD_TOP = 150
const PAD_BOTTOM = 170

/** Höhe und Stationspunkte (von unten nach oben) für n Stationen. */
export function landLayout(n: number) {
  const height = PAD_BOTTOM + Math.max(0, n - 1) * STEP + PAD_TOP
  const stops: { x: number; y: number }[] = Array.from({ length: n }, (_, i) => ({
    x: Math.round(470 + 265 * Math.sin(i * 0.95 + 0.9)),
    y: height - PAD_BOTTOM - i * STEP,
  }))
  return { height, stops }
}
