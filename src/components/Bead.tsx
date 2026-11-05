import { BEAD_IMAGES, BEAD_RATIO, type BeadColor } from './beadImages'

export type { BeadColor }

/** Zeichen je Farbe – mit Einstellung „Farben mit Zeichen“ (Farbenblindheit) */
export const FARB_ZEICHEN: Record<BeadColor, string> = { yellow: '●', green: '▲', orange: '◆', blue: '■', purple: '✚', pink: '♥' }
const mitMuster = () => typeof document !== 'undefined' && document.documentElement.classList.contains('muster')

/** Eine Abakus-Perle. */
export function Bead({ color = 'yellow', width = 70 }: { color?: BeadColor; width?: number }) {
  const img = (
    <img
      src={BEAD_IMAGES[color]}
      width={width}
      height={Math.round(width * BEAD_RATIO)}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ display: 'block' }}
      data-color={color}
    />
  )
  if (!mitMuster()) return img
  return <span className="bead-muster" style={{ width, fontSize: width * 0.42 }}>{img}<b>{FARB_ZEICHEN[color]}</b></span>
}
