import { useState } from 'react'
import { ParentLayout } from '../components/ParentLayout'
import { Link } from '../components/Link'
import { Icon, type IconName } from '../components/Icon'
import { Avatar } from '../components/Avatar'

const kpis: { label: string; value: string; sub: string; icon: IconName; ic: string; good?: boolean }[] = [
  { label: 'Lernzeit', value: '1 h 48 min', sub: 'Ziel 2 h 20 min · 77 %', icon: 'clock', ic: '#5B47D6' },
  { label: 'Gelöste Aufgaben', value: '312', sub: '+64 zur Vorwoche', icon: 'target', ic: '#25913F', good: true },
  { label: 'Genauigkeit', value: '91 %', sub: '+3 Prozentpunkte', icon: 'check', ic: '#25913F', good: true },
  { label: 'Lernserie', value: '9 Tage', sub: 'Rekord: 12 Tage', icon: 'flame', ic: '#A64400' },
]

const days: [string, number][] = [['Mo', 22], ['Di', 18], ['Mi', 0], ['Do', 25], ['Fr', 14], ['Sa', 29], ['So', 0]]

export function ElternDashboard() {
  const [child, setChild] = useState(0)
  const kids = [
    { name: 'Lena, 8 J.', look: { hat: 'cap', hatColor: '#FF4D6D', shirt: '#3BA7FF' } as const },
    { name: 'Tim, 6 J.', look: { hat: 'phones', hatColor: '#3DBE5B', shirt: '#FF8A1F', hair: '#E9B949' } as const },
  ]

  return (
    <ParentLayout active="uebersicht" bell>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="display" style={{ fontSize: 36, lineHeight: 1.1 }}>Guten Abend, Frau Huber</h1>
          <p style={{ marginTop: 4, fontSize: 16, fontWeight: 600, color: 'var(--ink-soft)' }}>Woche vom 19. bis 25. Oktober 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {kids.map((k, i) => (
            <button
              key={k.name} type="button" aria-pressed={i === child} onClick={() => setChild(i)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 6px 6px', borderRadius: 999, cursor: 'pointer', background: '#fff', fontSize: 15, color: i === child ? 'var(--ink)' : 'var(--ink-soft)', fontWeight: i === child ? 900 : 800, border: `2px solid ${i === child ? 'var(--purple)' : 'var(--border)'}` }}
            >
              <Avatar size={38} {...k.look} />
              {k.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {kpis.map((k) => (
          <div key={k.label} className="panel" style={{ borderRadius: 20, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'var(--ink-soft)' }}>
              <Icon name={k.icon} size={20} color={k.ic} />
              {k.label}
            </div>
            <div className="display" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 6 }}>{k.value}</div>
            <div style={{ fontWeight: 800, fontSize: 13, marginTop: 2, color: k.good ? 'var(--green-d)' : 'var(--ink-soft)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <section className="panel" style={{ flex: '999 1 560px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <h2>Lernzeit pro Tag</h2>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)' }}>Tagesziel 20 Min.</span>
          </div>
          <div style={{ position: 'relative', height: 200, marginTop: 18, display: 'flex', alignItems: 'flex-end', gap: 14, borderBottom: '2px solid var(--border)' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 120, borderTop: '2px dashed var(--orange)' }} />
            <span style={{ position: 'absolute', right: 0, bottom: 124, fontWeight: 800, fontSize: 12, color: '#a64400' }}>Ziel</span>
            {days.map(([d, m]) => (
              <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: '100%' }}>
                <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--ink-soft)' }}>{m ? `${m} min` : '–'}</span>
                <div style={{ width: '100%', maxWidth: 56, height: Math.max(4, m * 6), borderRadius: '10px 10px 4px 4px', background: m >= 20 ? 'var(--purple)' : m === 0 ? 'var(--border)' : 'var(--muted)' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {days.map(([d]) => <span key={d} style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)' }}>{d}</span>)}
          </div>
        </section>

        <section className="panel" style={{ flex: '1 1 300px', background: 'var(--bg)', border: 0, color: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2>Aktueller Stand</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="display" style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--yellow)', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: 'var(--ink)' }}>2</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>Big-Friends-Insel</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--lilac)' }}>Einheit 2 von 5 · Big Friends +7 und +6</div>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}><span>Gürtel: Weiß</span><span style={{ color: 'var(--yellow)' }}>nächster: Gelb</span></div>
            <div style={{ height: 12, borderRadius: 999, background: 'var(--line)', marginTop: 6, overflow: 'hidden' }}><div style={{ width: '20%', height: '100%', background: 'var(--yellow)', borderRadius: 999 }} /></div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
            {['7 Abzeichen', '4 Pokale', 'Gold-Liga, Platz 6'].map((t) => (
              <span key={t} style={{ padding: '6px 12px', borderRadius: 999, background: 'var(--panel)', fontWeight: 800, fontSize: 13 }}>{t}</span>
            ))}
          </div>
        </section>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <section className="panel" style={{ flex: '1 1 420px' }}>
          <h2 style={{ marginBottom: 12 }}>Diese Woche</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            <div style={{ flex: '1 1 180px' }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--green-d)' }}>KANN LENA SCHON GUT</div>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontWeight: 700, fontSize: 15, lineHeight: 1.6 }}>
                <li>Big Friends +9 und +8 (96 %)</li>
                <li>Zahlen bis 99 ablesen</li>
                <li>Tempo: 3,8 s pro Aufgabe</li>
              </ul>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: '#a64400' }}>BRAUCHT NOCH ÜBUNG</div>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontWeight: 700, fontSize: 15, lineHeight: 1.6 }}>
                <li>Big Friends +7 (72 %)</li>
                <li>Kopfrechnen ohne Abakus</li>
              </ul>
            </div>
          </div>
          <Link to="/eltern/bericht" style={{ display: 'inline-block', marginTop: 12, fontWeight: 900, fontSize: 15 }}>Zum ausführlichen Lernbericht</Link>
        </section>
        <section className="panel" style={{ flex: '1 1 360px', background: 'var(--cream)', borderColor: '#f2d98c' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="mail" size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16 }}>Nachricht von Frau Berger</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#8a5a00' }}>Lehrerin · Do., 23. Okt.</div>
            </div>
          </div>
          <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.55, fontWeight: 600 }}>
            Lena hat diese Woche toll mitgemacht. Bitte zuhause 2–3 Mal das Blitz-Training zu +7 wiederholen, dann klappt der nächste Boss sicher.
          </p>
        </section>
      </div>
    </ParentLayout>
  )
}
