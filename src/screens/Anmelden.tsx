import { useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon, type IconName } from '../components/Icon'
import { Avatar, type AvatarLook } from '../components/Avatar'

const kids: (AvatarLook & { name: string; on?: boolean })[] = [
  { name: 'Lena', hat: 'cap', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#F6C9A6', on: true },
  { name: 'Jonas', hat: 'phones', hatColor: '#3DBE5B', shirt: '#FF8A1F', hair: '#E9B949', skin: '#F6C9A6' },
  { name: 'Elif', hat: 'band', hatColor: '#A06BFF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' },
  { name: 'Noah', hat: 'none', shirt: '#A06BFF', hair: '#231A4F', skin: '#7A4A2E' },
  { name: 'Mia', hat: 'crown', shirt: '#FF4D6D', hair: '#C2410C', skin: '#F6C9A6' },
  { name: 'Ben', hat: 'none', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#B9774E', glasses: true },
  { name: 'Emma', hat: 'wizard', hatColor: '#5B47D6', shirt: '#FFC531', hair: '#E9B949', skin: '#F6C9A6' },
  { name: 'Can', hat: 'cap', hatColor: '#3BA7FF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' },
]

type Pic = { icon: IconName; label: string; color: string; fill: string }

const pics: Pic[] = [
  { icon: 'star', label: 'Stern', color: '#DE9800', fill: '#FFC531' },
  { icon: 'heart', label: 'Herz', color: '#C2264E', fill: '#FF5C8A' },
  { icon: 'bolt', label: 'Blitz', color: '#5B47D6', fill: '#C9C0FF' },
  { icon: 'crown', label: 'Krone', color: '#DE9800', fill: '#FFE58F' },
  { icon: 'gem', label: 'Diamant', color: '#1F7FD1', fill: '#9BD3FF' },
  { icon: 'gift', label: 'Geschenk', color: '#25913F', fill: '#B6EFC2' },
  { icon: 'paw', label: 'Pfote', color: '#8A4B20', fill: '#E8B48A' },
  { icon: 'flame', label: 'Feuer', color: '#E06A00', fill: '#FFB15E' },
  { icon: 'book', label: 'Buch', color: '#5B47D6', fill: '#E4DFFF' },
]

const step = { padding: '8px 16px', borderRadius: 999, fontWeight: 800, fontSize: 16 } as const

export function Anmelden() {
  const [picks, setPicks] = useState<Pic[]>([])
  const done = picks.length === 4

  return (
    <Stage>
      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="pill" style={{ padding: '10px 18px', background: 'var(--panel)', color: '#fff', fontWeight: 800, fontSize: 17, gap: 10 }}>
            <Icon name="left" size={22} color="#fff" />
            Zurück
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ ...step, background: 'var(--green)', color: 'var(--green-ink)' }}>1 Klassen-Code</span>
            <span style={{ ...step, background: 'var(--green)', color: 'var(--green-ink)' }}>2 Wer bist du?</span>
            <span style={{ ...step, background: 'var(--yellow)', color: 'var(--ink)' }}>3 Bild-Passwort</span>
          </div>
          <button type="button" aria-label="Vorlesen" className="round-btn" style={{ width: 52, height: 52 }}>
            <Icon name="volume" size={26} color="#fff" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 36 }}>
          <section style={{ width: 470, background: 'var(--panel)', borderRadius: 32, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className="display" style={{ fontSize: 32 }}>Wer bist du?</h2>
              <span style={{ padding: '6px 14px', borderRadius: 12, background: 'var(--bg)', fontWeight: 900, fontSize: 15, color: 'var(--lilac)' }}>Klasse LINZ-7K</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginTop: 22 }}>
              {kids.map((k) => (
                <button
                  key={k.name} type="button"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 4px', borderRadius: 22, cursor: 'pointer', color: '#fff',
                    background: k.on ? 'var(--purple)' : 'var(--bg)', border: k.on ? '4px solid var(--yellow)' : '4px solid transparent',
                  }}
                >
                  <Avatar size={76} {...k} bg={k.on ? '#5B47D6' : '#3A2F80'} />
                  <span style={{ fontWeight: 900, fontSize: 16 }}>{k.name}</span>
                </button>
              ))}
            </div>
            <p style={{ marginTop: 20, fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}>Nicht dabei? Frag deine Lehrerin nach dem Klassen-Code.</p>
          </section>

          <section className="card-white" style={{ flex: 1, borderRadius: 32, padding: '28px 32px', position: 'relative', boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Avatar size={64} hat="cap" hatColor="#FF4D6D" shirt="#3BA7FF" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#6b61a8' }}>Hallo Lena!</div>
                <h2 className="display" style={{ fontSize: 32, lineHeight: 1.1 }}>Tippe deine 4 Bilder</h2>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 22 }}>
              {[0, 1, 2, 3].map((i) => {
                const p = picks[i]
                return (
                  <div
                    key={i}
                    style={{
                      width: 76, height: 76, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: p ? '#fff4d1' : '#f7f5ff', border: p ? '3px solid var(--yellow)' : '3px dashed var(--lilac)',
                    }}
                  >
                    {p && <Icon name={p.icon} size={40} color={p.color} fill={p.fill} sw={2} />}
                  </div>
                )
              })}
              <button
                type="button" aria-label="Löschen" onClick={() => setPicks([])}
                style={{ marginLeft: 'auto', width: 76, height: 76, borderRadius: 20, border: '3px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Icon name="del" size={34} color="#6b61a8" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginTop: 22 }}>
              {pics.map((p) => (
                <button
                  key={p.label} type="button" aria-label={p.label}
                  onClick={() => picks.length < 4 && setPicks([...picks, p])}
                  style={{
                    height: 112, borderRadius: 24, border: '3px solid var(--border)', background: '#f7f5ff', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', boxShadow: '0 5px 0 var(--border)', color: 'var(--ink)',
                  }}
                >
                  <Icon name={p.icon} size={52} color={p.color} fill={p.fill} sw={2} />
                  <span style={{ fontWeight: 900, fontSize: 15 }}>{p.label}</span>
                </button>
              ))}
            </div>
            {done && (
              <div
                style={{
                  position: 'absolute', left: 24, right: 24, bottom: 24, padding: '18px 22px', borderRadius: 24, background: 'var(--green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span className="display" style={{ fontSize: 26, color: 'var(--green-ink)' }}>Richtig! Willkommen zurück.</span>
                <Link to="/karte" style={{ padding: '12px 24px', borderRadius: 999, background: '#fff', color: 'var(--green-ink)', fontWeight: 900, fontSize: 18 }}>Zur Karte</Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </Stage>
  )
}
