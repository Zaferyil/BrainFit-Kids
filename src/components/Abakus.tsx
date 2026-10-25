import { useState } from 'react'
import { BEAD_IMAGES, type BeadColor } from './beadImages'
import klick from '../assets/abakus/klick.mp3'
import punktOrange from '../assets/abakus/punkt-orange.png'
import punktBlau from '../assets/abakus/punkt-blau.png'

// Originalrahmen von abacus.mentalmath.at, je Stangenzahl ein Bild (1 Stange aus dem 2er-Rahmen geschnitten)
const FRAMES = import.meta.glob('../assets/abakus/rahmen-*.png', { eager: true, import: 'default' }) as Record<string, string>
const frameSrc = (color: FrameColor, n: number) => FRAMES[`../assets/abakus/rahmen-${color}-${n}.png`]

export type FrameColor = 'orange' | 'blau'

type Props = {
  value?: number
  cols?: number
  /** Abstand der Stangen in px (Original: 135) – alle Maße skalieren mit. */
  colw?: number
  interactive?: boolean
  showValue?: boolean
  /** Hervorgehobene Stange, von rechts gezählt (0 = Einer); -1 = keine. */
  mark?: number
  faded?: boolean
  frame?: FrameColor
  /** Rote Markierungsperle und Punkt auf jeder dritten Stange (Einer, Tausender, …). */
  marker?: boolean
  sound?: boolean
  onChange?: (value: number) => void
}

// Maße des Originals in px (bei 135 px Stangenabstand)
const PITCH = 135
const H = 443
const COL_LEFT = [50, 186, 320, 456, 590, 726, 860, 996]
const BEAD_W = 116
const BEAD_H = 55
const PAD = 24
const HEAVEN_TOP = PAD + 2
const HEAVEN_DOWN = 50
const EARTH_BOTTOM = H - PAD
const EARTH_UP = 44
const DOT = 20
const DOT_TOP = PAD + 110

const frameWidth = (n: number) => (n === 1 ? 218 : 353 + PITCH * (n - 2))

function digitsFor(value: number, cols: number) {
  return String(Math.max(0, Math.floor(value))).padStart(cols, '0').slice(-cols).split('').map(Number)
}

let audio: HTMLAudioElement | null = null
function playClick() {
  try {
    audio ??= new Audio(klick)
    audio.currentTime = 0
    audio.volume = 0.5
    void audio.play().catch(() => {})
  } catch {
    // Ton ist ein Extra
  }
}

export function Abakus({
  value = 0, cols = 3, colw = PITCH, interactive = true, showValue = false,
  mark = -1, faded = false, frame = 'orange', marker = true, sound = true, onChange,
}: Props) {
  const n = Math.min(8, Math.max(1, Math.round(cols)))
  const [digits, setDigits] = useState(() => digitsFor(value, n))
  // Neue value/cols von außen setzen den Abakus zurück.
  const [source, setSource] = useState(`${value}/${n}`)
  if (source !== `${value}/${n}`) {
    setSource(`${value}/${n}`)
    setDigits(digitsFor(value, n))
  }

  const s = colw / PITCH
  const W = frameWidth(n)
  const px = (v: number) => v * s

  const setDigit = (ci: number, d: number) => {
    if (!interactive) return
    if (sound) playClick()
    const next = digits.slice()
    next[ci] = d
    setDigits(next)
    onChange?.(Number(next.join('')))
  }

  const bead = (key: string, label: string, left: number, top: number, color: BeadColor, onClick: () => void) => (
    <button
      key={key}
      type="button"
      aria-label={label}
      className="abakus-bead"
      disabled={!interactive}
      style={{ left: px(left), top: px(top), width: px(BEAD_W), height: px(BEAD_H), cursor: interactive ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <img src={BEAD_IMAGES[color]} alt="" draggable={false} data-color={color} />
    </button>
  )

  return (
    <div
      role="group"
      aria-label="Abakus"
      data-value={Number(digits.join(''))}
      className="abakus"
      style={{ width: px(W), height: px(H), opacity: faded ? 0.28 : 1, backgroundImage: `url(${frameSrc(frame, n)})` }}
    >
      {digits.map((d, ci) => {
        const left = COL_LEFT[ci]
        const fromRight = n - 1 - ci
        const marked = marker && fromRight % 3 === 0
        const heavenOn = d >= 5
        const lower = d % 5
        return (
          <div key={ci}>
            {fromRight === mark && (
              <div className="abakus-mark" style={{ left: px(left - 6), top: px(PAD - 8), width: px(BEAD_W + 12), height: px(H - 2 * PAD + 16), borderRadius: px(22) }} />
            )}
            {bead(`h${ci}`, `Himmelsperle, Stange ${fromRight + 1}`, left, heavenOn ? HEAVEN_TOP + HEAVEN_DOWN : HEAVEN_TOP, 'green',
              () => setDigit(ci, heavenOn ? d - 5 : d + 5))}
            {marked && (
              <img className="abakus-dot" src={frame === 'blau' ? punktBlau : punktOrange} alt="" aria-hidden="true"
                style={{ left: px(left + BEAD_W / 2 - DOT / 2), top: px(DOT_TOP), width: px(DOT), height: px(DOT) }} />
            )}
            {[0, 1, 2, 3].map((i) => {
              const on = i < lower
              const rest = EARTH_BOTTOM - (4 - i) * BEAD_H
              return bead(`e${ci}-${i}`, `Erdperle ${i + 1}, Stange ${fromRight + 1}`, left, on ? rest - EARTH_UP : rest,
                marked && i === 0 ? 'orange' : 'yellow',
                () => setDigit(ci, (heavenOn ? 5 : 0) + (on ? i : i + 1)))
            })}
          </div>
        )
      })}
      {showValue && (
        <div className="abakus-value" style={{ top: -px(34), padding: `${px(4)}px ${px(18)}px`, fontSize: Math.max(16, px(40)) }}>
          {Number(digits.join(''))}
        </div>
      )}
    </div>
  )
}
