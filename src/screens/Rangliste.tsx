import { useState } from 'react'
import { Stage } from '../components/Stage'
import { Icon } from '../components/Icon'
import { Avatar, type AvatarLook } from '../components/Avatar'
import { TopBar } from '../components/TopBar'
import { NavBar } from '../components/NavBar'

type Person = AvatarLook & { name: string; pts: number; me?: boolean }

const people: Person[] = [
  { name: 'MathePanda', pts: 980, hat: 'crown', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' },
  { name: 'Blitzfuchs', pts: 910, hat: 'phones', hatColor: '#FF4D6D', shirt: '#FF8A1F', hair: '#C2410C', skin: '#F6C9A6' },
  { name: 'SternEule', pts: 875, hat: 'wizard', hatColor: '#5B47D6', shirt: '#FFC531', hair: '#E9B949', skin: '#F6C9A6' },
  { name: 'PerlenKönig', pts: 720, hat: 'cap', hatColor: '#3BA7FF', shirt: '#A06BFF', hair: '#6B3E1F', skin: '#B9774E' },
  { name: 'Rechenrakete', pts: 690, hat: 'band', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#231A4F', skin: '#F6C9A6' },
  { name: 'Lena (du)', pts: 655, hat: 'cap', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#F6C9A6', me: true },
  { name: 'ZahlenNinja', pts: 610, hat: 'band', hatColor: '#231A4F', shirt: '#231A4F', hair: '#231A4F', skin: '#7A4A2E' },
  { name: 'Abakusbär', pts: 540, hat: 'none', shirt: '#FF8A1F', hair: '#6B3E1F', skin: '#E0A47A' },
  { name: 'TurboTiger', pts: 505, hat: 'cap', hatColor: '#FF8A1F', shirt: '#FFC531', hair: '#E9B949', skin: '#F6C9A6' },
  { name: 'KopfrechenKatze', pts: 470, hat: 'phones', hatColor: '#A06BFF', shirt: '#FF5C8A', hair: '#231A4F', skin: '#F6C9A6' },
]

const podium = [1, 0, 2]
const heights = [150, 110, 84]
const medal = ['#FFC531', '#C9D3E6', '#E8A36B']
const tabs = ['Diese Woche', 'Meine Klasse', 'Allzeit']

const pts = (n: number, size: number, color?: string) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: size > 16 ? 6 : 4, fontWeight: 900, fontSize: size > 16 ? 18 : 15, color }}>
    <Icon name="pearl" size={size} color="#DE9800" fill="#FFC531" />
    {n}
  </span>
)

export function Rangliste() {
  const [tab, setTab] = useState(0)
  return (
    <Stage>
      <TopBar />
      <div style={{ position: 'absolute', left: 40, right: 40, top: 100, display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 className="display" style={{ fontSize: 40, lineHeight: 1 }}>Rangliste</h1>
        <div role="tablist" aria-label="Ranglisten" style={{ display: 'flex', gap: 6, padding: 5, borderRadius: 999, background: 'var(--panel)' }}>
          {tabs.map((t, i) => (
            <button
              key={t} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}
              style={{ padding: '9px 20px', borderRadius: 999, border: 0, cursor: 'pointer', fontWeight: 900, fontSize: 16, background: i === tab ? 'var(--yellow)' : 'transparent', color: i === tab ? 'var(--ink)' : 'var(--lilac)' }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 8px 8px', borderRadius: 999, background: 'var(--cream)', color: 'var(--ink)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="crown" size={24} />
          </div>
          <div>
            <div className="display" style={{ fontSize: 20, lineHeight: 1 }}>Gold-Liga</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#8a5a00' }}>endet in 2 Tagen</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 40, top: 170, width: 430, height: 540, borderRadius: 32, background: 'var(--panel-2)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, paddingBottom: 30 }}>
        {podium.map((idx) => {
          const p = people[idx]
          return (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 124 }}>
              {idx === 0 && <Icon name="crown" size={40} color="#DE9800" fill="#FFC531" />}
              <div style={{ padding: 4, borderRadius: '50%', background: medal[idx] }}>
                <Avatar size={idx === 0 ? 100 : 84} {...p} bg="#3A2F80" />
              </div>
              <div style={{ fontWeight: 900, fontSize: 16, textAlign: 'center' }}>{p.name}</div>
              {pts(p.pts, 16, 'var(--yellow)')}
              <div
                className="display"
                style={{ width: '100%', height: heights[idx], borderRadius: '20px 20px 8px 8px', background: medal[idx], color: 'var(--ink)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10, fontSize: 40 }}
              >
                {idx + 1}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'absolute', left: 494, right: 40, top: 170, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {people.slice(3).map((p, i) => {
          const rank = i + 4
          return (
            <div key={p.name} style={{ display: 'contents' }}>
              {rank === 6 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, fontSize: 13, color: 'var(--green)', letterSpacing: '0.04em' }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--green)' }} />
                  AUFSTIEG IN DIE DIAMANT-LIGA
                  <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--green)' }} />
                </div>
              )}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '5px 18px 5px 12px', borderRadius: 20,
                  ...(p.me ? { background: 'var(--yellow)', color: 'var(--ink)', boxShadow: '0 5px 0 var(--yellow-d)' } : { background: rank <= 5 ? '#1f3a3a' : 'var(--panel)' }),
                }}
              >
                <span className="display" style={{ width: 34, textAlign: 'center', fontSize: 24, color: p.me ? 'var(--ink)' : 'var(--lilac)' }}>{rank}</span>
                <Avatar size={44} {...p} bg="#3A2F80" />
                <span style={{ flex: 1, fontWeight: 900, fontSize: 18 }}>{p.name}</span>
                {pts(p.pts, 20)}
              </div>
            </div>
          )
        })}
        <div style={{ marginTop: 6, padding: '12px 16px', borderRadius: 18, background: 'var(--panel)', fontWeight: 800, fontSize: 15, color: 'var(--lilac)' }}>
          Noch 36 Perlen bis Platz 5 – dann steigst du am Sonntag auf! Plätze 18–20 steigen ab.
        </div>
      </div>
      <NavBar active="rangliste" />
    </Stage>
  )
}
