import { useId, useState } from 'react'
import { Bead, type BeadColor } from './Bead'

type Props = {
  value?: number
  cols?: number
  /** Abstand der Stangen in px – alle Maße skalieren mit. */
  colw?: number
  interactive?: boolean
  showValue?: boolean
  /** Hervorgehobene Stange, von rechts gezählt (0 = Einer); -1 = keine. */
  mark?: number
  faded?: boolean
  frame?: string
  /** Orange Markierungsperle oben auf der Einer-Stange. */
  marker?: boolean
  onChange?: (value: number) => void
}

const INK = '#111111'

function digitsFor(value: number, cols: number) {
  return String(Math.max(0, Math.floor(value))).padStart(cols, '0').slice(-cols).split('').map(Number)
}

// Nachbau des Abakus aus dem Spiel: blauer Rahmen, schwarze Kontur,
// grüne Himmelsperle, gelbe Erdperlen.
export function Abakus({
  value = 0, cols = 3, colw = 64, interactive = true, showValue = false,
  mark = -1, faded = false, frame = '#1E86F0', marker = true, onChange,
}: Props) {
  const n = Math.min(8, Math.max(1, Math.round(cols)))
  const [digits, setDigits] = useState(() => digitsFor(value, n))
  // Neue value/cols von außen setzen den Abakus zurück.
  const [source, setSource] = useState(`${value}/${n}`)
  if (source !== `${value}/${n}`) {
    setSource(`${value}/${n}`)
    setDigits(digitsFor(value, n))
  }
  const gid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const u = colw / 100
  const ft = 20 * u
  const padX = 10 * u
  const bw = 70 * u
  const bh = bw * 0.52
  const rodW = 20 * u
  const beamH = 17 * u
  const sw = Math.max(1.5, 1.4 * u)
  const innerW = n * colw + 2 * padX
  const innerH = 7 * bh + beamH
  const W = innerW + 2 * ft
  const H = innerH + 2 * ft
  const top = ft
  const bottom = ft + innerH
  const beamTop = ft + 2 * bh
  const beamBottom = beamTop + beamH
  const rodX = (ci: number) => ft + padX + ci * colw + colw / 2

  const setDigit = (ci: number, d: number) => {
    if (!interactive) return
    const next = digits.slice()
    next[ci] = d
    setDigits(next)
    onChange?.(Number(next.join('')))
  }

  // Waagerechte Konturlinien des Balkens, an den Stangen unterbrochen.
  const beamEdges: number[][] = []
  let x = ft
  digits.forEach((_, ci) => {
    beamEdges.push([x, rodX(ci) - rodW / 2])
    x = rodX(ci) + rodW / 2
  })
  beamEdges.push([x, ft + innerW])

  const beadButton = (key: string, label: string, left: number, y: number, color: BeadColor, onClick: () => void) => (
    <button
      key={key}
      type="button"
      aria-label={label}
      className="abakus-bead"
      disabled={!interactive}
      style={{ left, top: y, width: bw, height: bh, cursor: interactive ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Bead color={color} width={bw} />
    </button>
  )

  return (
    <div role="group" aria-label="Abakus" data-value={Number(digits.join(''))} className="abakus" style={{ width: W, height: H, opacity: faded ? 0.28 : 1 }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`${gid}board`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE3B3" />
            <stop offset="1" stopColor="#F6B48E" />
          </linearGradient>
          <linearGradient id={`${gid}rod`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={sw / 2} y={sw / 2} width={W - sw} height={H - sw} rx={34 * u} fill={frame} stroke={INK} strokeWidth={sw} />
        <rect x={ft / 2} y={ft / 2} width={W - ft} height={H - ft} rx={26 * u} fill="none" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth={ft * 0.3} />
        <rect x={ft} y={ft} width={innerW} height={innerH} rx={14 * u} fill={`url(#${gid}board)`} stroke={INK} strokeWidth={sw} />
        {digits.map((_, ci) => {
          const cx = rodX(ci)
          const fromRight = n - 1 - ci
          return (
            <g key={ci}>
              {fromRight === mark && (
                <rect x={cx - colw / 2 + 3 * u} y={top + 3 * u} width={colw - 6 * u} height={innerH - 6 * u} rx={14 * u}
                  fill="#FFFFFF" fillOpacity="0.3" stroke="#FFFFFF" strokeWidth={4 * u} />
              )}
              <rect x={cx - rodW / 2} y={top - sw / 2} width={rodW} height={innerH + sw} fill={frame} />
              <rect x={cx - rodW / 2} y={top - sw / 2} width={rodW} height={innerH + sw} fill={`url(#${gid}rod)`} />
              {[[top, beamTop], [beamBottom, bottom]].map(([y1, y2], k) => (
                <g key={k} stroke={INK} strokeWidth={sw}>
                  <line x1={cx - rodW / 2} x2={cx - rodW / 2} y1={y1} y2={y2} />
                  <line x1={cx + rodW / 2} x2={cx + rodW / 2} y1={y1} y2={y2} />
                </g>
              ))}
            </g>
          )
        })}
        <rect x={ft - sw / 2} y={beamTop} width={innerW + sw} height={beamH} fill={frame} />
        <rect x={ft - sw / 2} y={beamTop + beamH * 0.15} width={innerW + sw} height={beamH * 0.35} fill="#FFFFFF" fillOpacity="0.18" />
        {beamEdges.map(([x1, x2], i) => (
          <g key={i} stroke={INK} strokeWidth={sw}>
            <line x1={x1} x2={x2} y1={beamTop} y2={beamTop} />
            <line x1={x1} x2={x2} y1={beamBottom} y2={beamBottom} />
          </g>
        ))}
      </svg>

      {digits.flatMap((d, ci) => {
        const bl = rodX(ci) - bw / 2
        const fromRight = n - 1 - ci
        const heavenOn = d >= 5
        const lower = d % 5
        return [
          beadButton(`h${ci}`, `Himmelsperle, Stange ${fromRight + 1}`, bl, heavenOn ? beamTop - bh : top, 'green',
            () => setDigit(ci, heavenOn ? d - 5 : d + 5)),
          ...[0, 1, 2, 3].map((i) => {
            const on = i < lower
            const color: BeadColor = marker && fromRight === 0 && i === 0 ? 'orange' : 'yellow'
            return beadButton(`e${ci}-${i}`, `Erdperle ${i + 1}, Stange ${fromRight + 1}`, bl,
              on ? beamBottom + i * bh : bottom - (4 - i) * bh, color,
              () => setDigit(ci, (heavenOn ? 5 : 0) + (on ? i : i + 1)))
          }),
        ]
      })}

      {showValue && (
        <div className="abakus-value" style={{
          top: -26 * u, padding: `${4 * u}px ${16 * u}px`, fontSize: Math.max(16, 30 * u),
        }}>
          {Number(digits.join(''))}
        </div>
      )}
    </div>
  )
}
