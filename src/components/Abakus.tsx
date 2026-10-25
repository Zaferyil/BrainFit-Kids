import { useEffect, useState, type CSSProperties } from 'react'

type Props = {
  value?: number
  cols?: number
  /** Spaltenbreite in px – alle Maße skalieren mit. */
  colw?: number
  interactive?: boolean
  showValue?: boolean
  /** Hervorgehobene Stange, von rechts gezählt (0 = Einer); -1 = keine. */
  mark?: number
  faded?: boolean
  frame?: string
  onChange?: (value: number) => void
}

const GRAD_GREEN = 'linear-gradient(180deg,#8BE79C 0%,#3DBE5B 50%,#25913F 100%)'
const GRAD_YELLOW = 'linear-gradient(180deg,#FFE58F 0%,#FFC531 50%,#DE9800 100%)'

function digitsFor(value: number, cols: number) {
  return String(Math.max(0, Math.floor(value))).padStart(cols, '0').slice(-cols).split('').map(Number)
}

export function Abakus({
  value = 0, cols = 3, colw = 64, interactive = true, showValue = false,
  mark = -1, faded = false, frame = 'var(--orange)', onChange,
}: Props) {
  const n = Math.min(8, Math.max(1, Math.round(cols)))
  const [digits, setDigits] = useState(() => digitsFor(value, n))
  useEffect(() => setDigits(digitsFor(value, n)), [value, n])

  const u = colw / 64
  const pad = Math.round(16 * u)
  const bh = Math.round(colw * 0.4)
  const bw = Math.round(colw * 0.84)
  const heavenH = Math.round(bh * 2.3)
  const barH = Math.max(4, Math.round(10 * u))
  const earthH = Math.round(bh * 5.3)
  const W = pad * 2 + n * colw
  const H = pad * 2 + heavenH + barH + earthH
  const barTop = pad + heavenH
  const earthTop = barTop + barH
  const inset = Math.round(8 * u)
  const rw = Math.max(3, Math.round(6 * u))

  const setDigit = (ci: number, d: number) => {
    if (!interactive) return
    const next = digits.slice()
    next[ci] = d
    setDigits(next)
    onChange?.(Number(next.join('')))
  }

  const bead = (left: number, top: number, grad: string): CSSProperties => ({
    position: 'absolute', left, top, width: bw, height: bh, padding: 0, border: 0, margin: 0,
    background: grad, clipPath: 'polygon(0 50%,20% 0,80% 0,100% 50%,80% 100%,20% 100%)',
    transition: 'top .25s ease', cursor: interactive ? 'pointer' : 'default', zIndex: 3,
  })

  return (
    <div
      role="group"
      aria-label="Abakus"
      style={{
        position: 'relative', width: W, height: H, borderRadius: Math.round(22 * u), background: frame,
        opacity: faded ? 0.28 : 1, boxShadow: `0 ${Math.round(8 * u)}px 0 rgba(0,0,0,.25)`, flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', inset, borderRadius: Math.round(16 * u), background: 'var(--board)' }} />
      {digits.map((_, ci) => {
        const left = pad + ci * colw
        const fromRight = n - 1 - ci
        return (
          <div key={'rod' + ci}>
            {fromRight === mark && (
              <div style={{
                position: 'absolute', left: left + 3, top: pad - 4, width: colw - 6, height: H - pad * 2 + 8,
                borderRadius: Math.round(14 * u), background: 'rgba(255,255,255,.14)', boxShadow: '0 0 0 3px #FFFFFF inset',
              }} />
            )}
            <div style={{
              position: 'absolute', left: left + colw / 2 - rw / 2, top: pad, width: rw, height: H - pad * 2,
              background: '#FFB15E', borderRadius: 3,
            }} />
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: inset, right: inset, top: barTop, height: barH, background: frame, zIndex: 1 }} />
      {digits.map((d, ci) => {
        const left = pad + ci * colw
        const bl = left + Math.round((colw - bw) / 2)
        const fromRight = n - 1 - ci
        const heavenOn = d >= 5
        const lower = d % 5
        return (
          <div key={'beads' + ci}>
            {fromRight % 3 === 0 && (
              <div style={{
                position: 'absolute', left: left + colw / 2 - barH * 0.6, top: barTop + barH * 0.2,
                width: barH * 1.2, height: barH * 0.6 + 1, borderRadius: '50%', background: '#FFFFFF', zIndex: 2,
              }} />
            )}
            <button
              type="button"
              aria-label={`Himmelsperle, Stange ${fromRight + 1}`}
              style={bead(bl, heavenOn ? barTop - bh : pad, GRAD_GREEN)}
              onClick={() => setDigit(ci, heavenOn ? d - 5 : d + 5)}
            />
            {[0, 1, 2, 3].map((i) => {
              const on = i < lower
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Erdperle ${i + 1}, Stange ${fromRight + 1}`}
                  style={bead(bl, on ? earthTop + i * bh : earthTop + earthH - (4 - i) * bh, GRAD_YELLOW)}
                  onClick={() => setDigit(ci, (heavenOn ? 5 : 0) + (on ? i : i + 1))}
                />
              )
            })}
          </div>
        )
      })}
      {showValue && (
        <div style={{
          position: 'absolute', left: '50%', top: -Math.round(26 * u), transform: 'translateX(-50%)',
          padding: `${Math.round(4 * u)}px ${Math.round(16 * u)}px`, borderRadius: 999, background: 'var(--yellow)',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: Math.round(26 * u), color: 'var(--ink)',
          boxShadow: '0 4px 0 #DE9800', zIndex: 4,
        }}>
          {Number(digits.join(''))}
        </div>
      )}
    </div>
  )
}
