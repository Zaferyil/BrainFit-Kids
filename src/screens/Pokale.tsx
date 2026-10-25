import { Stage } from '../components/Stage'
import { Icon, type IconName } from '../components/Icon'
import { TopBar } from '../components/TopBar'
import { NavBar } from '../components/NavBar'

const belts: [string, string][] = [['Weiß', '#F2F0FF'], ['Gelb', '#FFC531'], ['Orange', '#FF8A1F'], ['Grün', '#3DBE5B'], ['Blau', '#3BA7FF'], ['Lila', '#A06BFF'], ['Rot', '#FF4D6D'], ['Braun', '#A8673A'], ['Schwarz', '#111111']]

const cupStyle = {
  gold: ['#DE9800', '#FFC531', 84], silver: ['#7E8AA3', '#D7DEEA', 72], bronze: ['#9A5B2A', '#E8A36B', 66], empty: ['#4A3E9E', 'none', 66],
} as const

type Kind = keyof typeof cupStyle
const shelves: [string, Kind][][] = [
  [['Boss Perlenland', 'gold'], ['Wochen-Liga Silber', 'silver'], ['Blitz-Turnier', 'bronze']],
  [['7-Tage-Feuer', 'gold'], ['Boss Big-Friends', 'empty'], ['Gold-Liga', 'empty']],
]

const badges: [string, IconName, string, boolean][] = [
  ['Erste Perle', 'pearl', '#FFC531', true], ['Frühstarter', 'sparkle', '#3BA7FF', true], ['7-Tage-Feuer', 'flame', '#FF8A1F', true], ['Perlen-Schieber', 'medal', '#3DBE5B', true],
  ['Blitzrechner', 'bolt', '#A06BFF', true], ['Video-Fan', 'video', '#FF5C8A', true], ['Schatzsammler', 'gem', '#3BA7FF', true], ['Fehlerfrei', 'check', '#3DBE5B', false],
  ['Big-Friends-Profi', 'star', '#FFC531', false], ['Kopfrechen-Held', 'brain', '#A06BFF', false], ['30-Tage-Feuer', 'flame', '#FF4D6D', false], ['Abakus-Meister', 'crown', '#FFC531', false],
]

const shelfCard = { position: 'absolute', top: 254, height: 456, borderRadius: 30, background: 'var(--panel-2)', padding: '18px 22px' } as const

export function Pokale() {
  return (
    <Stage>
      <TopBar />
      <section style={{ position: 'absolute', left: 40, right: 40, top: 100, padding: '14px 20px', borderRadius: 26, background: 'var(--panel)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="display" style={{ fontSize: 22 }}>Mein Abakus-Dojo</h2>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--lilac)' }}>Nächster Gürtel: Gelb – noch 4 Einheiten</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
          {belts.map(([name, color], i) => {
            const earned = i === 0
            const next = i === 1
            return (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ position: 'relative', width: '100%', height: 30, borderRadius: 8, background: color, opacity: earned || next ? 1 : 0.3, boxShadow: next ? '0 0 0 3px #fff' : undefined }}>
                  <div style={{ position: 'absolute', left: '50%', top: -4, width: 18, height: 38, marginLeft: -9, borderRadius: 5, background: color, filter: 'brightness(.85)' }} />
                </div>
                <span style={{ fontWeight: 900, fontSize: 13, color: earned ? '#fff' : next ? 'var(--yellow)' : '#6b61a8' }}>{name}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section style={{ ...shelfCard, left: 40, width: 520 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="display" style={{ fontSize: 26 }}>Pokal-Regal</h2>
          <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--yellow)' }}>4 Pokale</span>
        </div>
        {shelves.map((cups, si) => (
          <div key={si} style={{ marginTop: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, alignItems: 'end', height: 140 }}>
              {cups.map(([name, kind]) => {
                const [stroke, fill, size] = cupStyle[kind]
                return (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Icon name="trophy" size={size} color={stroke} fill={fill} sw={1.6} />
                    <span style={{ fontWeight: 800, fontSize: 13, textAlign: 'center', lineHeight: 1.2, color: kind === 'empty' ? '#6b61a8' : 'var(--lilac-2)' }}>{name}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ height: 14, borderRadius: 6, background: '#8a5a2b', boxShadow: '0 6px 0 #5e3b1a' }} />
          </div>
        ))}
      </section>

      <section style={{ ...shelfCard, left: 584, right: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="display" style={{ fontSize: 26 }}>Abzeichen</h2>
          <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--lilac)' }}>7 von 32</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 14 }}>
          {badges.map(([name, icon, color, on]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 74, height: 74, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...(on ? { background: color, boxShadow: '0 5px 0 rgba(0,0,0,.3)' } : { background: 'var(--panel)', border: '3px dashed #4a3e9e' }),
                }}
              >
                <Icon name={on ? icon : 'lock'} size={34} color={on ? '#231A4F' : '#6B61A8'} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 13, textAlign: 'center', lineHeight: 1.2, color: on ? '#fff' : '#6b61a8' }}>{name}</span>
            </div>
          ))}
        </div>
      </section>
      <NavBar active="pokale" />
    </Stage>
  )
}
