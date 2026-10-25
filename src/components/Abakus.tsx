import { useState, type CSSProperties } from 'react'

type Props = {
  /** Anzahl der Stangen (1–8), Standard 4 */
  columns?: number
  /** Startwert bzw. angezeigter Wert */
  value?: number
  /** Breite einer Stange in px */
  colWidth?: number
  interactive?: boolean
  showValue?: boolean
  /** Stange hervorheben (0 = Einer), -1 = keine */
  mark?: number
  faded?: boolean
  frame?: string
  onChange?: (value: number) => void
}

function digitsOf(value: number, cols: number) {
  const s = String(Math.max(0, Math.floor(value))).padStart(cols, '0').slice(-cols)
  return s.split('').map(Number)
}

const GRADIENTS = {
  green: 'linear-gradient(180deg,#8BE79C 0%,#3DBE5B 50%,#25913F 100%)',
  yellow: 'linear-gradient(180deg,#FFE58F 0%,#FFC531 50%,#DE9800 100%)',
}

export function Abakus({
  columns = 4, value = 0, colWidth = 64, interactive = true, showValue = false,
  mark = -1, faded = false, frame = '#FF8A1F', onChange,
}: Props) {
  const cols = Math.min(8, Math.max(1, Math.round(columns)))
  const sync = `${value}/${cols}`
  const [state, setState] = useState(() => ({ digits: digitsOf(value, cols), sync }))
  // Wert oder Spaltenzahl von außen geändert -> Perlen neu setzen
  if (state.sync !== sync) setState({ digits: digitsOf(value, cols), sync })
  const { digits } = state

  const u = colWidth / 64
  const pad = Math.round(16 * u)
  const bh = Math.round(colWidth * 0.4)
  const bw = Math.round(colWidth * 0.84)
  const heavenH = Math.round(bh * 2.3)
  const barH = Math.max(4, Math.round(10 * u))
  const earthH = Math.round(bh * 5.3)
  const W = pad * 2 + cols * colWidth
  const H = pad * 2 + heavenH + barH + earthH
  const barTop = pad + heavenH
  const earthTop = barTop + barH
  const inset = Math.round(8 * u)

  const setDigit = (ci: number, d: number) => {
    if (!interactive) return
    const next = digits.slice()
    next[ci] = d
    setState({ digits: next, sync })
    onChange?.(Number(next.join('')))
  }

  const bead = (left: number, top: number, color: keyof typeof GRADIENTS): CSSProperties => ({
    position: 'absolute', left, top, width: bw, height: bh, padding: 0, border: 0, margin: 0,
    background: GRADIENTS[color],
    clipPath: 'polygon(0 50%,20% 0,80% 0,100% 50%,80% 100%,20% 100%)',
    transition: 'top .25s ease', cursor: interactive ? 'pointer' : 'default',
  })

  const shown = Number(digits.join(''))
  const rw = Math.max(3, Math.round(6 * u))

  return (
    <div
      className="abakus"
      style={{
        position: 'relative', width: W, height: H, borderRadius: Math.round(22 * u), background: frame,
        opacity: faded ? 0.28 : 1, boxShadow: `0 ${Math.round(8 * u)}px 0 rgba(0,0,0,.25)`, flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', inset, borderRadius: Math.round(16 * u), background: '#2A2066' }} />
      {digits.map((_, ci) => {
        const left = pad + ci * colWidth
        const fromRight = cols - 1 - ci
        return (
          <div key={`rod${ci}`}>
            {fromRight === mark && (
              <div
                style={{
                  position: 'absolute', left: left + 3, top: pad - 4, width: colWidth - 6, height: H - pad * 2 + 8,
                  borderRadius: Math.round(14 * u), background: 'rgba(255,255,255,.14)', boxShadow: '0 0 0 3px #FFFFFF inset',
                }}
              />
            )}
            <div
              style={{
                position: 'absolute', left: left + colWidth / 2 - rw / 2, top: pad, width: rw, height: H - pad * 2,
                background: '#FFB15E', borderRadius: 3,
              }}
            />
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: inset, right: inset, top: barTop, height: barH, background: frame, zIndex: 1 }} />
      {digits.map((d, ci) => {
        const fromRight = cols - 1 - ci
        const left = pad + ci * colWidth
        const bl = left + Math.round((colWidth - bw) / 2)
        const heavenOn = d >= 5
        const n = d % 5
        return (
          <div key={`col${ci}`}>
            {fromRight % 3 === 0 && (
              <div
                style={{
                  position: 'absolute', left: left + colWidth / 2 - barH * 0.6, top: barTop + barH * 0.2,
                  width: barH * 1.2, height: barH * 0.6 + 1, borderRadius: '50%', background: '#FFFFFF', zIndex: 2,
                }}
              />
            )}
            <button
              type="button" aria-label={`Himmelsperle, Stange ${fromRight + 1}`}
              onClick={() => setDigit(ci, heavenOn ? d - 5 : d + 5)}
              style={bead(bl, heavenOn ? barTop - bh : pad, 'green')}
            />
            {[0, 1, 2, 3].map((i) => {
              const on = i < n
              const top = on ? earthTop + i * bh : earthTop + earthH - (4 - i) * bh
              return (
                <button
                  key={i} type="button" aria-label={`Erdperle ${i + 1}, Stange ${fromRight + 1}`}
                  onClick={() => setDigit(ci, (heavenOn ? 5 : 0) + (on ? i : i + 1))}
                  style={bead(bl, top, 'yellow')}
                />
              )
            })}
          </div>
        )
      })}
      {showValue && (
        <div
          className="display"
          style={{
            position: 'absolute', left: '50%', top: -Math.round(26 * u), transform: 'translateX(-50%)',
            padding: `${Math.round(4 * u)}px ${Math.round(16 * u)}px`, borderRadius: 999, background: '#FFC531',
            color: '#231A4F', fontWeight: 800, fontSize: Math.round(26 * u), boxShadow: '0 4px 0 #DE9800',
          }}
        >
          {shown}
        </div>
      )}
    </div>
  )
}
