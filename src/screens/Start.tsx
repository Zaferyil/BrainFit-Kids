import { Abakus } from '../components/Abakus'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'

const STARS = [[140, 90, 4], [320, 60, 3], [520, 140, 5], [700, 40, 3], [880, 100, 4], [1050, 220, 3], [980, 420, 5], [60, 380, 3], [620, 760, 4], [400, 700, 3], [1120, 690, 4], [760, 300, 3], [260, 520, 3], [1150, 40, 5]]

export function Start() {
  return (
    <Stage>
      {STARS.map(([left, top, s], i) => (
        <div key={i} className="star" style={{ left, top, width: s, height: s }} />
      ))}
      <div className="blob" style={{ left: -120, bottom: -160, width: 620, height: 620, background: '#241B5C' }} />
      <div className="blob" style={{ right: -80, top: -120, width: 420, height: 420, background: '#221A56' }} />

      <div className="start-copy">
        <div className="brand">
          <div className="brand-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <rect x="3" y="3" width="22" height="22" rx="4" fill="none" stroke="#231A4F" strokeWidth="2.5" />
              <line x1="3" y1="11" x2="25" y2="11" stroke="#231A4F" strokeWidth="2.5" />
              <circle cx="9" cy="7" r="2.2" fill="#231A4F" />
              <circle cx="19" cy="17" r="2.2" fill="#231A4F" />
              <circle cx="14" cy="20" r="2.2" fill="#231A4F" />
            </svg>
          </div>
          <span className="brand-sub">MENTAL ARITHMETIK</span>
        </div>
        <h1 className="start-title">Brain Fit<br /><span>Kids</span></h1>
        <p className="start-lead">Rechnen wie ein Blitz – mit Perli und dem Zauber-Abakus.</p>
        <div className="start-actions">
          <a href="#/anmelden" className="btn-primary">
            Los geht's!
            <Icon name="right" size={30} color="#231A4F" strokeWidth={3} />
          </a>
          <div className="start-secondary">
            <a href="#/eltern" className="btn-ghost">Ich bin Mama / Papa</a>
            <a href="#/admin" className="btn-ghost">Lehrkraft &amp; Admin</a>
          </div>
        </div>
      </div>

      <div className="start-hero">
        <div style={{ position: 'absolute', left: 150, top: 250 }}>
          <Abakus value={2026} cols={4} colw={78} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 150 }}>
          <Perli mood="cheer" size={230} />
        </div>
        <div className="speech">Hallo! Ich bin Perli.</div>
      </div>

      <div className="start-age">Für Kinder von 5 bis 12 Jahren</div>
      <a href="#/abakus-test" className="start-dev">Abakus-Test (nur in der Entwicklung)</a>
    </Stage>
  )
}
