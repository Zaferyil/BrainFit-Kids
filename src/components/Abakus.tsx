import { useState } from 'react'

// Platzhalter-Perlen (einfarbig) – werden durch die Originalbilder aus assets/abakus ersetzt.
const COL_W = 64
const BEAD_W = 46
const BEAD_H = 26
const PAD = 16
const TOP_H = 70
const BEAM_H = 12
const BOTTOM_H = 150
const HEIGHT = PAD * 2 + TOP_H + BEAM_H + BOTTOM_H

type Props = {
  columns?: number
  onChange?: (value: number) => void
}

export function Abakus({ columns = 4, onChange }: Props) {
  const cols = Math.min(8, Math.max(2, Math.round(columns)))
  const [digits, setDigits] = useState<number[]>(() => Array(8).fill(0))
  const shown = digits.slice(0, cols)

  const update = (col: number, digit: number) => {
    const next = [...digits]
    next[col] = digit
    setDigits(next)
    onChange?.(Number(next.slice(0, cols).join('')))
  }

  const width = PAD * 2 + cols * COL_W
  const beamY = PAD + TOP_H

  return (
    <svg
      className="abakus"
      viewBox={`0 0 ${width} ${HEIGHT}`}
      style={{ width: '100%', maxWidth: width * 1.4 }}
      role="img"
      aria-label="Abakus"
    >
      <rect x={2} y={2} width={width - 4} height={HEIGHT - 4} rx={14} fill="#eaf3ff" stroke="#1e6fd9" strokeWidth={5} />
      <rect x={2} y={beamY} width={width - 4} height={BEAM_H} fill="#f28c28" />
      {Array.from({ length: cols }, (_, i) => {
        // Spalte 0 = höchste Stelle, letzte Spalte = Einer
        const col = i
        const d = shown[col]
        const five = d >= 5
        const lower = d % 5
        const cx = PAD + col * COL_W + COL_W / 2
        const isOnes = col === cols - 1
        const topY = five ? beamY - BEAD_H - 2 : PAD + 4
        return (
          <g key={col}>
            <line x1={cx} x2={cx} y1={PAD} y2={HEIGHT - PAD} stroke="#6b7a90" strokeWidth={3} />
            <rect
              x={cx - BEAD_W / 2} y={topY} width={BEAD_W} height={BEAD_H} rx={12}
              fill="#3fb950" stroke="#237a33" strokeWidth={2}
              style={{ cursor: 'pointer', transition: 'y 0.18s' }}
              onClick={() => update(col, five ? lower : lower + 5)}
            />
            {Array.from({ length: 4 }, (_, k) => {
              const active = k < lower
              const y = active
                ? beamY + BEAM_H + 2 + k * (BEAD_H + 2)
                : HEIGHT - PAD - 4 - (4 - k) * (BEAD_H + 2) + 2
              return (
                <rect
                  key={k}
                  x={cx - BEAD_W / 2} y={y} width={BEAD_W} height={BEAD_H} rx={12}
                  fill="#f6c91c" stroke="#b8920a" strokeWidth={2}
                  style={{ cursor: 'pointer', transition: 'y 0.18s' }}
                  onClick={() => update(col, (five ? 5 : 0) + (active ? k : k + 1))}
                />
              )
            })}
            {isOnes && <circle cx={cx} cy={beamY + BEAM_H / 2} r={9} fill="#f28c28" stroke="#b85f0a" strokeWidth={2} pointerEvents="none" />}
          </g>
        )
      })}
    </svg>
  )
}
