import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon, type IconName } from '../components/Icon'
import { Perli } from '../components/Perli'

const palette = ['#FFC531', '#3DBE5B', '#3BA7FF', '#FF5C8A', '#FF8A1F', '#A06BFF']

const confetti = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 137) % 1180, y: (i * 89) % 820, r: (i * 47) % 180, w: 10 + (i % 3) * 4, h: 18 + (i % 4) * 3, c: palette[i % 6],
})).filter((c) => !(c.x > 180 && c.x < 1010 && c.y > 150 && c.y < 790))

const stats: { icon: IconName; v: string; l: string; ic: string; fill: string; bg: string }[] = [
  { icon: 'check', v: '9 / 10', l: 'richtig', ic: '#25913F', fill: 'none', bg: '#ddf7e3' },
  { icon: 'clock', v: '4,2 s', l: 'pro Aufgabe', ic: '#1F6FB8', fill: 'none', bg: '#e1f0ff' },
  { icon: 'pearl', v: '+45', l: 'Perlen', ic: '#DE9800', fill: '#FFC531', bg: '#fff4d1' },
  { icon: 'sparkle', v: '+120', l: 'XP', ic: '#5B47D6', fill: '#C9C0FF', bg: '#efedff' },
]

export function Ergebnis() {
  return (
    <Stage>
      {confetti.map((c) => (
        <div key={`${c.x}-${c.y}`} style={{ position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 3, background: c.c, transform: `rotate(${c.r}deg)` }} />
      ))}
      <div style={{ position: 'absolute', left: '50%', top: 18, transform: 'translateX(-50%)' }}><Perli mood="cheer" size={150} /></div>

      <div className="card-white" style={{ position: 'absolute', left: '50%', top: 168, transform: 'translateX(-50%)', width: 780, padding: '28px 36px 30px', borderRadius: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, boxShadow: '0 10px 0 var(--shadow-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: -84 }}>
          <Icon name="star" size={78} color="#DE9800" fill="#FFC531" sw={1.6} />
          <Icon name="star" size={104} color="#DE9800" fill="#FFC531" sw={1.6} />
          <Icon name="star" size={78} color="#DE9800" fill="#FFC531" sw={1.6} />
        </div>
        <h1 className="display" style={{ fontSize: 50, lineHeight: 1 }}>Super gemacht, Lena!</h1>
        <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink-soft)' }}>Üben mit Abakus · Big Friends +7 und +6</p>
        <div style={{ alignSelf: 'stretch', display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {stats.map((s) => (
            <div key={s.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px 8px', borderRadius: 22, background: s.bg }}>
              <Icon name={s.icon} size={30} color={s.ic} fill={s.fill} />
              <span className="display" style={{ fontSize: 32, lineHeight: 1 }}>{s.v}</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink-soft)' }}>{s.l}</span>
            </div>
          ))}
        </div>
        <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 24, background: 'var(--cream)', border: '3px solid var(--yellow)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 0 var(--yellow-d)' }}>
            <Icon name="medal" size={36} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.04em', color: '#8a5a00' }}>NEUES ABZEICHEN</div>
            <div className="display" style={{ fontSize: 26, lineHeight: 1.1 }}>Perlen-Schieber</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-soft)' }}>Erste Abakus-Übung mit 3 Sternen</div>
          </div>
          <div style={{ width: 220 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 14 }}><span>Level 7</span><span style={{ color: 'var(--ink-soft)' }}>Level 8</span></div>
            <div style={{ height: 14, borderRadius: 999, background: '#f2e6bf', marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: '82%', height: '100%', borderRadius: 999, background: 'var(--green)' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
          <Link to="/ueben" className="pill" style={{ padding: '16px 26px', border: '3px solid var(--border)', color: 'var(--ink-soft)', fontSize: 19 }}>
            <Icon name="refresh" size={22} color="#5A5094" />
            Nochmal
          </Link>
          <Link to="/blitz" className="cta" style={{ padding: '16px 34px', fontSize: 24 }}>
            Weiter: Blitz-Training
            <Icon name="right" size={24} sw={3} />
          </Link>
        </div>
      </div>
    </Stage>
  )
}
