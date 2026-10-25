import { useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Avatar, type Hat } from '../components/Avatar'
import { TopBar } from '../components/TopBar'
import { NavBar } from '../components/NavBar'

const hats: { label: string; hat: Hat; hc: string }[] = [
  { label: 'Ohne', hat: 'none', hc: '#FF4D6D' },
  { label: 'Kappe', hat: 'cap', hc: '#FF4D6D' },
  { label: 'Kappe', hat: 'cap', hc: '#3BA7FF' },
  { label: 'Kopfhörer', hat: 'phones', hc: '#3DBE5B' },
  { label: 'Stirnband', hat: 'band', hc: '#A06BFF' },
  { label: 'Zauberhut', hat: 'wizard', hc: '#231A4F' },
]
const shirts = [['#3BA7FF', 'Blau'], ['#FF8A1F', 'Orange'], ['#3DBE5B', 'Grün'], ['#A06BFF', 'Lila'], ['#FF5C8A', 'Pink'], ['#FFC531', 'Gelb']]
const bgs = [['#5B47D6', 'Lila'], ['#1F6FB8', 'Blau'], ['#25913F', 'Grün'], ['#C45E00', 'Orange'], ['#231A4F', 'Nacht']]

const section = { background: 'var(--panel)', borderRadius: 26, padding: '16px 20px' } as const
const heading = { fontSize: 22, marginBottom: 10 } as const

const swatch = (color: string, on: boolean, size: number) => ({
  width: size, height: size, borderRadius: '50%', cursor: 'pointer', background: color,
  border: on ? '5px solid #fff' : '5px solid var(--bg)', boxShadow: on ? '0 0 0 4px var(--yellow)' : undefined,
})

const pill = (on: boolean) => ({
  flex: 1, padding: '14px 10px', borderRadius: 18, cursor: 'pointer', fontWeight: 900, fontSize: 17, border: 0,
  background: on ? 'var(--yellow)' : 'var(--bg)', color: on ? 'var(--ink)' : 'var(--lilac)',
})

export function Garderobe() {
  const [look, setLook] = useState({ hat: 'cap' as Hat, hatColor: '#FF4D6D', shirt: '#3BA7FF', glasses: false, bg: '#5B47D6' })
  const set = (patch: Partial<typeof look>) => setLook({ ...look, ...patch })

  return (
    <Stage>
      <TopBar />
      <div style={{ position: 'absolute', left: 40, top: 104, width: 450, height: 600, borderRadius: 36, background: 'var(--panel-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <h1 className="display" style={{ fontSize: 34 }}>Meine Garderobe</h1>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: -20, right: -20, bottom: -26, height: 52, borderRadius: '50%', background: 'var(--line)' }} />
          <div style={{ position: 'relative' }}>
            <Avatar size={300} hat={look.hat} hatColor={look.hatColor} shirt={look.shirt} glasses={look.glasses} bg={look.bg} belt="#F2F0FF" />
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 999, background: 'var(--bg)' }}>
          <span style={{ fontWeight: 900, fontSize: 18 }}>Lena</span>
          <span style={{ width: 34, height: 10, borderRadius: 4, background: '#F2F0FF', border: '2px solid #8f85d6' }} />
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--lilac)' }}>Weißer Gürtel</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 514, right: 40, top: 104, height: 600, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <section style={section}>
          <h2 className="display" style={heading}>Kopf</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10 }}>
            {hats.map((h, i) => {
              const on = look.hat === h.hat && (h.hat === 'none' || look.hatColor === h.hc)
              return (
                <button
                  key={i} type="button" aria-label={h.label} aria-pressed={on} onClick={() => set({ hat: h.hat, hatColor: h.hc })}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 18, cursor: 'pointer', background: 'var(--bg)', color: 'var(--lilac-2)', border: on ? '4px solid var(--yellow)' : '4px solid transparent' }}
                >
                  <Avatar size={62} hat={h.hat} hatColor={h.hc} shirt={look.shirt} bg="#3A2F80" />
                  <span style={{ fontWeight: 800, fontSize: 12 }}>{h.label}</span>
                </button>
              )
            })}
          </div>
        </section>
        <section style={section}>
          <h2 className="display" style={heading}>Shirt-Farbe</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            {shirts.map(([c, name]) => (
              <button key={c} type="button" aria-label={`Shirt ${name}`} aria-pressed={look.shirt === c} onClick={() => set({ shirt: c })} style={swatch(c, look.shirt === c, 64)} />
            ))}
          </div>
        </section>
        <div style={{ display: 'flex', gap: 14 }}>
          <section style={{ ...section, flex: 1 }}>
            <h2 className="display" style={heading}>Brille</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" aria-pressed={!look.glasses} onClick={() => set({ glasses: false })} style={pill(!look.glasses)}>Ohne</button>
              <button type="button" aria-pressed={look.glasses} onClick={() => set({ glasses: true })} style={pill(look.glasses)}>Mit Brille</button>
            </div>
          </section>
          <section style={{ ...section, flex: 1.3 }}>
            <h2 className="display" style={heading}>Hintergrund</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              {bgs.map(([c, name]) => (
                <button key={c} type="button" aria-label={`Hintergrund ${name}`} aria-pressed={look.bg === c} onClick={() => set({ bg: c })} style={swatch(c, look.bg === c, 52)} />
              ))}
            </div>
          </section>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/shop" className="ghost" style={{ padding: '14px 22px', fontSize: 17 }}>
            <Icon name="bag" size={20} color="#DCD6FF" />
            Mehr im Shop
          </Link>
          <button type="button" className="cta" style={{ flex: 1, padding: 16, fontSize: 24, background: 'var(--green)', color: 'var(--green-ink)', boxShadow: '0 6px 0 var(--green-d)' }}>Speichern</button>
        </div>
      </div>
      <NavBar active="garderobe" />
    </Stage>
  )
}
