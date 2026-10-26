// Maße des 3D-Abakus aus der Video-Vorlage (docs/referenz/video-ui/abakus.webp), in Pixeln des Rahmenbilds.
// scripts/video-assets.py schneidet daraus Rahmen und Perlen.

export const PITCH3 = 217
export const H3 = 641
export const BEAD_W3 = 194
export const HEAVEN_H3 = 109
export const EARTH_H3 = 88
const HEAVEN_REST = 70
const HEAVEN_MOVE = 38
const EARTH_REST = [285, 370, 447, 524]
const EARTH_MOVE = 30
export const DOT_W3 = 37
export const DOT_H3 = 35
export const BEAM_Y3 = 239.5

export const frameWidth3 = (n: number) => 157 + PITCH3 * n
export const colCenter3 = (i: number) => 183 + PITCH3 * i
export const colLeft3 = (i: number) => colCenter3(i) - BEAD_W3 / 2

export const heavenTop3 = (d: number) => (d >= 5 ? HEAVEN_REST + HEAVEN_MOVE : HEAVEN_REST)
export const earthTop3 = (d: number, i: number) => (i < d % 5 ? EARTH_REST[i] - EARTH_MOVE : EARTH_REST[i])
