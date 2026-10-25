import { useState } from 'react'
import { Abakus } from '../components/Abakus'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { TopBar } from '../components/TopBar'
import { NavBar } from '../components/NavBar'

const FRAMES = [
  { color: '#1E86F0', label: 'Blau' },
  { color: '#FF8A1F', label: 'Orange' },
  { color: '#A06BFF', label: 'Lila' },
  { color: '#3DBE5B', label: 'Grün' },
]

export function AbakusTest() {
  const [cols, setCols] = useState(4)
  const [frame, setFrame] = useState(FRAMES[0].color)
  const [value, setValue] = useState(0)
  const [reset, setReset] = useState(0)
  const colw = Math.min(96, Math.floor(700 / cols))

  return (
    <Stage>
      <TopBar />
      <div className="test-body">
        <div className="test-panel">
          <h1 className="test-title">Abakus-Test</h1>
          <div className="test-field">
            <span className="test-label">Stangen</span>
            <div className="pill-row">
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <button key={n} type="button" className={n === cols ? 'pill active' : 'pill'} onClick={() => { setCols(n); setValue(0); setReset((r) => r + 1) }}>{n}</button>
              ))}
            </div>
          </div>
          <div className="test-field">
            <span className="test-label">Rahmen</span>
            <div className="pill-row">
              {FRAMES.map((f) => (
                <button key={f.color} type="button" aria-label={f.label} className={f.color === frame ? 'swatch active' : 'swatch'} style={{ background: f.color }} onClick={() => setFrame(f.color)} />
              ))}
            </div>
          </div>
          <div className="test-value">
            <span className="test-label">Zahl</span>
            <strong>{value}</strong>
          </div>
          <button type="button" className="btn-secondary" onClick={() => { setValue(0); setReset((r) => r + 1) }}>Zurücksetzen</button>
          <div className="test-perli"><Perli mood={value ? 'happy' : 'think'} size={140} /></div>
        </div>
        <div className="test-board">
          <Abakus key={`${cols}-${reset}`} cols={cols} colw={colw} frame={frame} mark={0} showValue onChange={setValue} />
        </div>
      </div>
      <div className="test-nav"><NavBar active="karte" /></div>
    </Stage>
  )
}
