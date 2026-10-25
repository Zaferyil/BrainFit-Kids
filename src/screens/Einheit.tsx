import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon, type IconName } from '../components/Icon'
import { Perli } from '../components/Perli'

type State = 'done' | 'current' | 'locked'

const stations: { step: number; title: string; desc: string; icon: IconName; st: State; stars: number; to: string; color?: string }[] = [
  { step: 1, title: 'Video ansehen', desc: 'Frau Lehrerin erklärt +7 und +6.', icon: 'video', st: 'done', stars: 3, to: '/video', color: '#3BA7FF' },
  { step: 2, title: 'Entdecken', desc: 'Perli zeigt dir jeden Perlen-Schritt.', icon: 'sparkle', st: 'done', stars: 2, to: '/entdecken', color: '#A06BFF' },
  { step: 3, title: 'Üben mit Abakus', desc: '10 Aufgaben – du schiebst die Perlen.', icon: 'pearl', st: 'current', stars: 0, to: '/ueben', color: '#FFC531' },
  { step: 4, title: 'Blitz-Training', desc: 'Zahlen blitzen auf. Wie schnell bist du?', icon: 'bolt', st: 'locked', stars: 0, to: '/blitz' },
  { step: 5, title: 'Kopfrechnen', desc: 'Der Abakus ist jetzt in deinem Kopf.', icon: 'brain', st: 'locked', stars: 0, to: '/kopfrechnen' },
  { step: 6, title: 'Boss-Kampf', desc: 'Besiege Grummel und hol dir den Pokal!', icon: 'sword', st: 'locked', stars: 0, to: '/boss' },
]

const rewardPill = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'var(--bg)', fontWeight: 900, fontSize: 16 } as const

export function Einheit() {
  return (
    <Stage>
      <div style={{ padding: '28px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <Link to="/karte" aria-label="Zur Karte" className="round-btn" style={{ width: 60, height: 60 }}>
              <Icon name="map" size={28} color="#fff" />
            </Link>
            <div>
              <div className="pill" style={{ padding: '4px 12px', background: 'var(--yellow)', color: 'var(--ink)', fontSize: 14 }}>Welt 2 · Big-Friends-Insel · Einheit 2</div>
              <h1 className="display" style={{ marginTop: 8, fontSize: 54, lineHeight: 1 }}>Big Friends +7 und +6</h1>
              <p style={{ marginTop: 8, fontSize: 18, fontWeight: 700, color: 'var(--lilac)' }}>Wenn die Einer-Stange zu wenig Perlen hat, hilft der große Freund.</p>
            </div>
          </div>
          <div style={{ width: 260, flexShrink: 0, padding: '16px 20px', borderRadius: 24, background: 'var(--cream)', color: 'var(--ink)', boxShadow: '0 6px 0 #e8c96b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 13, letterSpacing: '0.04em', color: '#8a5a00' }}>
              <Icon name="bulb" size={18} color="#8A5A00" />
              MERKSATZ
            </div>
            <div className="display" style={{ fontSize: 30, lineHeight: 1.15, marginTop: 4 }}>+7 = +10 − 3<br />+6 = +10 − 4</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginTop: 30 }}>
          {stations.map((s) => {
            const locked = s.st === 'locked'
            const cur = s.st === 'current'
            return (
              <div
                key={s.step}
                style={{
                  height: 212, padding: '20px 22px', borderRadius: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  ...(cur
                    ? { background: '#fff', color: 'var(--ink)', boxShadow: '0 8px 0 var(--shadow-soft), 0 0 0 6px var(--yellow)' }
                    : locked ? { background: '#211858', border: '3px dashed var(--line)' } : { background: 'var(--panel)' }),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: locked ? 'var(--panel)' : s.color }}>
                    <Icon name={s.icon} size={32} sw={2.4} color={locked ? '#6b61a8' : '#231a4f'} />
                  </div>
                  <span className="display" style={{ fontSize: 28, color: cur ? 'var(--lilac)' : '#4a3e9e' }}>{s.step}</span>
                </div>
                <div>
                  <div className="display" style={{ fontSize: 26, lineHeight: 1.1, color: cur ? 'var(--ink)' : locked ? '#8f85d6' : '#fff' }}>{s.title}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 4, color: cur ? 'var(--ink-soft)' : locked ? '#6b61a8' : 'var(--lilac)' }}>{s.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[0, 1, 2].map((i) => {
                      const on = i < s.stars
                      return <Icon key={i} name="star" size={24} color={on ? '#DE9800' : cur ? '#C9C0FF' : '#4A3E9E'} fill={on ? '#FFC531' : 'none'} />
                    })}
                  </div>
                  {cur && (
                    <Link to={s.to} className="cta" style={{ padding: '10px 22px', fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, gap: 8, boxShadow: '0 5px 0 var(--orange-d)' }}>
                      <Icon name="play" size={16} fill="#231A4F" />
                      Start
                    </Link>
                  )}
                  {s.st === 'done' && (
                    <Link to={s.to} style={{ padding: '8px 16px', borderRadius: 999, border: '2px solid #4a3e9e', color: 'var(--lilac-2)', fontWeight: 800, fontSize: 15 }}>Nochmal</Link>
                  )}
                  {locked && <Icon name="lock" size={26} color="#6b61a8" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 48, right: 48, bottom: 28, height: 104, borderRadius: 28, background: 'var(--panel)', display: 'flex', alignItems: 'center', gap: 20, padding: '0 24px 0 8px' }}>
        <div style={{ marginTop: -30 }}><Perli mood="happy" size={110} /></div>
        <div style={{ flex: 1 }}>
          <div className="display" style={{ fontSize: 24 }}>Toll gemacht! Jetzt übst du mit dem Abakus.</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--lilac)' }}>Schaffst du 80 % richtig, öffnet sich das Blitz-Training.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--muted)' }}>Belohnung in dieser Einheit</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={rewardPill}><Icon name="pearl" size={20} color="#DE9800" fill="#FFC531" />bis 60</span>
            <span style={rewardPill}><Icon name="medal" size={20} color="#FFC531" />Abzeichen</span>
          </div>
        </div>
      </div>
    </Stage>
  )
}
