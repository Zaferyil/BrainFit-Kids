import { digitsFor } from './abakusGeometry'
import {
  BEAD_W3, BEAM_Y3, DOT_H3, DOT_W3, EARTH_H3, H3, HEAVEN_H3, PITCH3, colCenter3, colLeft3, earthTop3, frameWidth3, heavenTop3,
} from './abakus3dGeometry'
import himmel from '../assets/video/perle-himmel.png'
import erde from '../assets/video/perle-erde.png'
import markiert from '../assets/video/perle-markiert.png'
import punkt from '../assets/video/punkt.png'

// 3D-Abakus der Lernvideos (Grafik aus der Video-Vorlage). Nur Anzeige: Die Perlen stehen zwischen
// „from“ und value, je nach progress (0–1) – das Video-Studio setzt die Zeit Bild für Bild.

const FRAMES = import.meta.glob('../assets/video/rahmen-*.png', { eager: true, import: 'default' }) as Record<string, string>

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

type Props = {
  value: number
  cols: number
  /** Stangenabstand in px auf dem Bildschirm (Original 217) */
  colw: number
  from?: number
  progress?: number
}

export function Abakus3D({ value, cols, colw, from, progress = 1 }: Props) {
  const n = Math.min(8, Math.max(1, Math.round(cols)))
  const k = colw / PITCH3
  const px = (v: number) => v * k
  const to = digitsFor(value, n)
  const start = digitsFor(from ?? value, n)
  const e = easeInOut(Math.min(1, Math.max(0, progress)))
  const lerp = (ci: number, top: (d: number) => number) => top(start[ci]) + (top(to[ci]) - top(start[ci])) * e

  return (
    <div
      className="abakus3d"
      role="img"
      aria-label={`Abakus zeigt ${value}`}
      data-value={value}
      style={{ width: px(frameWidth3(n)), height: px(H3), backgroundImage: `url(${FRAMES[`../assets/video/rahmen-${n}.png`]})` }}
    >
      {Array.from({ length: n }, (_, ci) => {
        const fromRight = n - 1 - ci
        const marked = fromRight % 3 === 0
        const left = px(colLeft3(ci))
        return (
          <div key={ci}>
            {marked && <img className="abakus3d-dot" src={punkt} alt="" style={{ left: px(colCenter3(ci) - DOT_W3 / 2), top: px(BEAM_Y3 - DOT_H3 / 2), width: px(DOT_W3), height: px(DOT_H3) }} />}
            <img className="abakus3d-bead" src={himmel} alt="" style={{ left, top: px(lerp(ci, heavenTop3)), width: px(BEAD_W3), height: px(HEAVEN_H3) }} />
            {/* von unten nach oben zeichnen, damit die obere Perle die untere überdeckt */}
            {[3, 2, 1, 0].map((i) => (
              <img
                key={i}
                className="abakus3d-bead"
                src={marked && i === 0 ? markiert : erde}
                alt=""
                style={{ left, top: px(lerp(ci, (d) => earthTop3(d, i))), width: px(BEAD_W3), height: px(EARTH_H3) }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
