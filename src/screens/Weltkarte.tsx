import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon, type IconName } from '../components/Icon'
import { Avatar } from '../components/Avatar'
import { Perli } from '../components/Perli'
import { TopBar } from '../components/TopBar'
import { NavBar } from '../components/NavBar'

type State = 'done' | 'current' | 'locked'

const worlds: { n: number; name: string; x: number; y: number; color: string; ink?: string; st: State }[] = [
  { n: 1, name: 'Perlenland', x: 90, y: 520, color: '#F2F0FF', ink: '#231A4F', st: 'done' },
  { n: 2, name: 'Big-Friends-Insel', x: 250, y: 455, color: '#FFC531', ink: '#231A4F', st: 'current' },
  { n: 3, name: 'Little-Friends-Wald', x: 150, y: 320, color: '#FF8A1F', st: 'locked' },
  { n: 4, name: 'Best-Friends-Berg', x: 320, y: 230, color: '#3DBE5B', st: 'locked' },
  { n: 5, name: 'Big-Friends-Höhle', x: 500, y: 300, color: '#3BA7FF', st: 'locked' },
  { n: 6, name: 'Little-Friends-See', x: 690, y: 260, color: '#A06BFF', st: 'locked' },
  { n: 7, name: 'Best-Friends-Vulkan', x: 640, y: 120, color: '#FF4D6D', st: 'locked' },
  { n: 8, name: 'Turbo-Stadt', x: 450, y: 90, color: '#A8673A', st: 'locked' },
  { n: 9, name: 'Anzan-Galaxie', x: 230, y: 70, color: '#111111', st: 'locked' },
]

const quests: { text: string; pct: number; reward: number; icon: IconName; done: boolean }[] = [
  { text: 'Löse 20 Aufgaben', pct: 70, reward: 20, icon: 'target', done: false },
  { text: '5 Blitz-Aufgaben ohne Fehler', pct: 100, reward: 30, icon: 'check', done: true },
  { text: 'Lerne 10 Minuten', pct: 60, reward: 30, icon: 'clock', done: false },
]

const points = worlds.map((w) => `${w.x},${w.y}`)

export function Weltkarte() {
  return (
    <Stage>
      <TopBar />

      <div style={{ position: 'absolute', left: 24, top: 100, width: 830, height: 620 }}>
        {worlds.map((w) => (
          <div key={w.n} style={{ position: 'absolute', left: w.x - 78, top: w.y - 70, width: 156, height: 140, borderRadius: '50%', background: '#231a58' }} />
        ))}
        <svg width="830" height="620" viewBox="0 0 830 620" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0 }}>
          <polyline points={points.join(' ')} fill="none" stroke="#3a2f80" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 22" />
          <polyline points={points.slice(0, 2).join(' ')} fill="none" stroke="#ffc531" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {worlds.map((w) => {
          const locked = w.st === 'locked'
          const current = w.st === 'current'
          const size = current ? 116 : 88
          return (
            <div key={w.n} style={{ position: 'absolute', left: w.x - 80, top: w.y - size / 2, width: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {current && (
                <div style={{ position: 'absolute', left: '50%', top: -58, transform: 'translateX(-50%)', padding: 3, borderRadius: '50%', background: '#fff' }}>
                  <Avatar size={44} hat="cap" hatColor="#FF4D6D" shirt="#3BA7FF" />
                </div>
              )}
              <Link
                to={current ? '/einheit' : '/karte'}
                aria-label={`Welt ${w.n}: ${w.name}${locked ? ' (gesperrt)' : ''}`}
                style={{
                  width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...(locked
                    ? { background: 'var(--panel)', border: '5px solid var(--line)' }
                    : { background: w.color, border: '6px solid #fff', boxShadow: current ? '0 8px 0 rgba(0,0,0,.3), 0 0 0 10px rgba(255,197,49,.25)' : '0 8px 0 rgba(0,0,0,.3)' }),
                }}
              >
                {locked ? (
                  <Icon name="lock" size={34} color="#8f85d6" />
                ) : (
                  <span className="display" style={{ fontSize: current ? 52 : 40, color: w.ink ?? '#fff', lineHeight: 1 }}>{w.n}</span>
                )}
              </Link>
              <div
                style={{
                  marginTop: 8, padding: '3px 10px', borderRadius: 999, fontWeight: 900, fontSize: 14, whiteSpace: 'nowrap',
                  ...(locked ? { color: '#8f85d6' } : { background: '#fff', color: 'var(--ink)' }),
                }}
              >
                {w.name}
              </div>
              {w.st === 'done' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                  {[0, 1, 2].map((i) => <Icon key={i} name="star" size={20} color="#DE9800" fill="#FFC531" />)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <aside style={{ position: 'absolute', right: 24, top: 104, width: 316, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="card-white" style={{ borderRadius: 28, padding: '20px 22px', boxShadow: '0 6px 0 var(--shadow-soft)' }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#6b61a8', letterSpacing: '0.04em' }}>WEITERLERNEN</div>
          <div className="display" style={{ fontSize: 26, lineHeight: 1.1, marginTop: 6 }}>Big Friends +7 und +6</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-soft)', marginTop: 4 }}>Welt 2 · Einheit 2 von 5</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {['#3DBE5B', '#3DBE5B', '#FFC531', '#E4DFFF', '#E4DFFF', '#E4DFFF'].map((c, i) => (
              <div key={i} style={{ flex: 1, height: 10, borderRadius: 999, background: c }} />
            ))}
          </div>
          <Link to="/einheit" className="cta" style={{ marginTop: 16, display: 'flex', padding: 14, fontSize: 24 }}>
            <Icon name="play" size={22} fill="#231A4F" />
            Weiter
          </Link>
        </section>

        <section style={{ background: 'var(--panel)', borderRadius: 28, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="display" style={{ fontSize: 22 }}>Tagesaufgaben</h2>
            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--muted)' }}>noch 6 Std.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {quests.map((q) => (
              <div key={q.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: q.done ? 'var(--green)' : 'var(--purple)' }}>
                  <Icon name={q.icon} size={22} sw={2.6} color={q.done ? '#10351B' : '#fff'} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>{q.text}</div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--bg)', marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${q.pct}%`, height: '100%', borderRadius: 999, background: q.done ? 'var(--green)' : 'var(--yellow)' }} />
                  </div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--yellow)' }}>+{q.reward}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <Perli mood="happy" size={96} />
          <div className="bubble" style={{ flex: 1, marginBottom: 30, padding: '12px 16px', borderRadius: '20px 20px 20px 4px', fontSize: 15, lineHeight: 1.3 }}>
            Noch 4 Einheiten bis zum gelben Gürtel!
          </div>
        </div>
      </aside>

      <NavBar active="karte" />
    </Stage>
  )
}
