import { BEAD_IMAGES, BEAD_RATIO, type BeadColor } from './beadImages'

export type { BeadColor }

/** Eine Abakus-Perle. */
export function Bead({ color = 'yellow', width = 70 }: { color?: BeadColor; width?: number }) {
  return (
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
}
