import { useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Avatar, type Hat } from '../components/Avatar'
import { TopBar } from '../components/TopBar'
import { NavBar } from '../components/NavBar'

const tabs = ['Figuren', 'Kleidung', 'Abakus-Skins', 'Hintergründe', 'Haustiere', 'Effekte']

const items: { name: string; hat: Hat; hc: string; shirt: string; glasses?: boolean; st?: 'owned' | 'locked'; price?: string; gem?: boolean; lvl?: number }[] = [
  { name: 'Kopfhörer', hat: 'phones', hc: '#FF4D6D', shirt: '#3BA7FF', st: 'owned' },
  { name: 'Krone', hat: 'crown', hc: '#FFC531', shirt: '#3BA7FF', price: '12', gem: true },
  { name: 'Stirnband', hat: 'band', hc: '#3DBE5B', shirt: '#3BA7FF', price: '120' },
  { name: 'Coole Brille', hat: 'none', hc: '#FF4D6D', shirt: '#3BA7FF', glasses: true, price: '180' },
  { name: 'Kappe Blau', hat: 'cap', hc: '#3BA7FF', shirt: '#FFFFFF', st: 'owned' },
  { name: 'Shirt Grün', hat: 'none', hc: '#FF4D6D', shirt: '#3DBE5B', price: '100' },
  { name: 'Shirt Orange', hat: 'none', hc: '#FF4D6D', shirt: '#FF8A1F', price: '100' },
  { name: 'Ninja-Band', hat: 'band', hc: '#231A4F', shirt: '#231A4F', price: '350' },
  { name: 'Glitzer-Shirt', hat: 'none', hc: '#FF4D6D', shirt: '#FF5C8A', st: 'locked', lvl: 10 },
  { name: 'Goldkrone', hat: 'crown', hc: '#FFC531', shirt: '#A06BFF', st: 'locked', lvl: 15 },
]

export function Shop() {
  const [tab, setTab] = useState(1)
  return (
    <Stage>
      <TopBar />
      <div style={{ position: 'absolute', left: 40, right: 40, top: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 className="display" style={{ fontSize: 40, lineHeight: 1 }}>Shop</h1>
          <div role="tablist" aria-label="Kategorien" style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
            {tabs.map((t, i) => (
              <button
                key={t} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}
                style={{ padding: '10px 18px', borderRadius: 999, border: 0, cursor: 'pointer', fontWeight: 900, fontSize: 16, background: i === tab ? 'var(--yellow)' : 'var(--panel)', color: i === tab ? 'var(--ink)' : 'var(--lilac)' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14, height: 96, borderRadius: 26, background: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 18, padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: '#6a57e3' }} />
          <div style={{ padding: 3, borderRadius: '50%', background: 'var(--yellow)', position: 'relative' }}>
            <Avatar size={72} hat="wizard" hatColor="#231A4F" shirt="#FF8A1F" bg="#3A2F80" />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.06em', color: '#ffe08a' }}>ANGEBOT DER WOCHE</div>
            <div className="display" style={{ fontSize: 28, lineHeight: 1.1 }}>Zauberhut „Sternennacht"</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--lilac)', textDecoration: 'line-through' }}>300</span>
            <Link to="/garderobe" className="pill" style={{ padding: '12px 22px', background: 'var(--yellow)', color: 'var(--ink)', fontSize: 20, boxShadow: '0 5px 0 var(--yellow-d)' }}>
              <Icon name="pearl" size={22} />
              210 – Kaufen
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 14, marginTop: 16 }}>
          {items.map((it) => {
            const owned = it.st === 'owned'
            const locked = it.st === 'locked'
            return (
              <div
                key={it.name}
                style={{ height: 200, borderRadius: 26, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: 'var(--panel)', border: `3px solid ${owned ? 'var(--green)' : 'var(--panel)'}` }}
              >
                <div style={{ position: 'relative', width: '100%', height: 104, borderRadius: 20, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar size={96} hat={it.hat} hatColor={it.hc} shirt={it.shirt} glasses={it.glasses} bg="#3A2F80" />
                  {locked && (
                    <div style={{ position: 'absolute', inset: 0, borderRadius: 20, background: 'rgba(27,20,70,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="lock" size={34} color="#fff" />
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 900, fontSize: 16, textAlign: 'center', lineHeight: 1.2 }}>{it.name}</div>
                <div
                  className="pill"
                  style={{ padding: '6px 14px', gap: 6, fontSize: 15, ...(owned ? { background: 'var(--green)', color: 'var(--green-ink)' } : locked ? { background: 'var(--bg)', color: 'var(--muted)' } : { background: '#fff', color: 'var(--ink)' }) }}
                >
                  {!locked && (
                    owned ? <Icon name="check" size={18} color="#10351B" />
                      : it.gem ? <Icon name="gem" size={18} color="#1F6FB8" fill="#9BD3FF" />
                      : <Icon name="pearl" size={18} color="#DE9800" fill="#FFC531" />
                  )}
                  <span>{owned ? 'Gekauft' : locked ? `ab Level ${it.lvl}` : it.price}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <NavBar active="shop" />
    </Stage>
  )
}
