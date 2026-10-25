import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Abakus } from '../components/Abakus'
import { Perli } from '../components/Perli'

const stars: [number, number, number][] = [
  [140, 90, 4], [320, 60, 3], [520, 140, 5], [700, 40, 3], [880, 100, 4], [1050, 220, 3], [980, 420, 5],
  [60, 380, 3], [620, 760, 4], [400, 700, 3], [1120, 690, 4], [760, 300, 3], [260, 520, 3], [1150, 40, 5],
]

const secondary = {
  padding: '12px 22px', borderRadius: 999, border: '2px solid #4a3e9e', color: 'var(--lilac-2)', fontWeight: 800, fontSize: 17,
} as const

export function Start() {
  return (
    <Stage>
      {stars.map(([x, y, s]) => (
        <div key={`${x}-${y}`} style={{ position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: '#8f85d6', opacity: 0.7 }} />
      ))}
      <div style={{ position: 'absolute', left: -120, bottom: -160, width: 620, height: 620, borderRadius: '50%', background: '#241b5c' }} />
      <div style={{ position: 'absolute', right: -80, top: -120, width: 420, height: 420, borderRadius: '50%', background: '#221a56' }} />

      <div style={{ position: 'absolute', left: 88, top: 0, bottom: 0, width: 540, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
              <rect x="3" y="3" width="22" height="22" rx="4" fill="none" stroke="#231A4F" strokeWidth="2.5" />
              <line x1="3" y1="11" x2="25" y2="11" stroke="#231A4F" strokeWidth="2.5" />
              <circle cx="9" cy="7" r="2.2" fill="#231A4F" />
              <circle cx="19" cy="17" r="2.2" fill="#231A4F" />
              <circle cx="14" cy="20" r="2.2" fill="#231A4F" />
            </svg>
          </div>
          <span className="display" style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.04em', color: 'var(--lilac)' }}>MENTALMATH</span>
        </div>
        <h1 className="display" style={{ fontSize: 84, lineHeight: 0.95 }}>
          Abakus<br /><span style={{ color: 'var(--yellow)' }}>Akademie</span>
        </h1>
        <p style={{ fontSize: 24, lineHeight: 1.4, fontWeight: 700, color: 'var(--lilac-2)', maxWidth: 460 }}>
          Rechnen wie ein Blitz – mit Perli und dem Zauber-Abakus.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', marginTop: 8 }}>
          <Link to="/anmelden" className="cta" style={{ padding: '22px 44px', fontSize: 32, gap: 14, boxShadow: '0 8px 0 var(--orange-d)' }}>
            Los geht's!
            <Icon name="right" size={30} sw={3} />
          </Link>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <Link to="/eltern" style={secondary}>Ich bin Mama / Papa</Link>
            <Link to="/admin" style={secondary}>Lehrkraft &amp; Admin</Link>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 70, top: 120, width: 500, height: 600 }}>
        <div style={{ position: 'absolute', left: 150, top: 250 }}>
          <Abakus value={2026} columns={4} colWidth={78} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 150 }}>
          <Perli mood="cheer" size={230} />
        </div>
        <div className="bubble" style={{ position: 'absolute', left: 190, top: 70, padding: '16px 22px', borderRadius: 22, fontWeight: 900, fontSize: 22, boxShadow: '0 6px 0 #d8d1ff' }}>
          Hallo! Ich bin Perli.
        </div>
      </div>

      <div style={{ position: 'absolute', right: 32, bottom: 24, fontSize: 14, fontWeight: 700, color: '#8f85d6' }}>Für Kinder von 6 bis 10 Jahren</div>
    </Stage>
  )
}
