// Maße des Original-Abakus (abacus.mentalmath.at) in px bei 135 px Stangenabstand.
// Abakus und Video-Studio rechnen mit denselben Werten.

export const PITCH = 135
export const H = 443
export const COL_LEFT = [50, 186, 320, 456, 590, 726, 860, 996]
export const BEAD_W = 116
export const BEAD_H = 55
export const PAD = 24
export const HEAVEN_TOP = PAD + 2
export const HEAVEN_DOWN = 50
export const EARTH_BOTTOM = H - PAD
export const EARTH_UP = 44
export const DOT = 20
export const DOT_TOP = PAD + 110

export const frameWidth = (n: number) => (n === 1 ? 218 : 353 + PITCH * (n - 2))

export function digitsFor(value: number, cols: number) {
  return String(Math.max(0, Math.floor(value))).padStart(cols, '0').slice(-cols).split('').map(Number)
}

/** Oberkante der Himmelsperle für eine Ziffer (unskaliert). */
export const heavenTop = (d: number) => (d >= 5 ? HEAVEN_TOP + HEAVEN_DOWN : HEAVEN_TOP)

/** Oberkante der Erdperle i (0 = oberste) für eine Ziffer (unskaliert). */
export function earthTop(d: number, i: number) {
  const rest = EARTH_BOTTOM - (4 - i) * BEAD_H
  return i < d % 5 ? rest - EARTH_UP : rest
}
