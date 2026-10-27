import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { getLevel, getPlacement, tierFor, tierRank, TIERS } from '../games/engine'
import { GAMES } from '../games/registry'
import { getDaily } from '../lib/daily'
import type { Progress } from '../lib/progress'
import { Funkeln } from './Anmelden'

// Denkspiele im neuen Look: oben das Spiel des Tages, darunter die spielbaren Spiele als bunte Kacheln.

const SYMBOL: Record<string, IconName> = { memory: 'brain', kette: 'pearl', jagd: 'search', muster: 'bulb' }

const KACHEL: { bg: string; rand: string; ink: string; icon: IconName }[] = [
  { bg: 'radial-gradient(circle at 30% 20%, #FFE58A, #FFC531 60%, #F2A900)', rand: '#C98A00', ink: '#2B2257', icon: 'brain' },
  { bg: 'radial-gradient(circle at 30% 20%, #A8F0B8, #2ECC8F 60%, #1F9E6C)', rand: '#167A53', ink: '#0E3D28', icon: 'search' },
  { bg: 'radial-gradient(circle at 30% 20%, #CDE8FF, #3BA7FF 60%, #1C7FD6)', rand: '#145FA3', ink: '#08294A', icon: 'bulb' },
  { bg: 'radial-gradient(circle at 30% 20%, #FFD0E4, #FF4F9A 60%, #C21F6A)', rand: '#8E1450', ink: '#FFFFFF', icon: 'target' },
]

export function DenkPark({ kid }: { kid: Kid; progress: Progress; onLogout: () => void }) {
  const tier = tierFor(kid.birthYear)
  const playable = GAMES.filter((g) => g.ready && tierRank(tier) >= tierRank(g.minTier))
  const soon = GAMES.length - playable.length
  const daily = getDaily(kid.id)
  // jeden Tag ein anderes Spiel des Tages
  const heute = playable[[...daily.date].reduce((n, c) => n + c.charCodeAt(0), 0) % Math.max(1, playable.length)]

  return (
    <Stage background="linear-gradient(180deg, #4B2FC2 0%, #7B5CFF 50%, #FF9AC8 100%)">
      <Funkeln />
      <div className="dp">
        <header className="dp-head">
          <h1>Denkspiele</h1>
          <p>Heute schon {Math.min(daily.games, 2)} von 2 gespielt · {TIERS[tier].name}</p>
        </header>

        {heute && (
          <a href={`#/spiel/${heute.id}`} className="dp-heute">
            <svg className="dp-heute-deko" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="40" r="30" fill="#FFC531" /><circle cx="95" cy="80" r="22" fill="#2ECC8F" />
              <circle cx="30" cy="92" r="20" fill="#FF8FB1" /><circle cx="98" cy="22" r="13" fill="#3BA7FF" />
            </svg>
            <span className="dp-tag">SPIEL DES TAGES</span>
            <strong>{heute.name}</strong>
            <span className="dp-text">{heute.text}</span>
            <span className="dp-play"><Icon name="play" color="#2B2257" fill="#2B2257" size={16} />Spielen</span>
          </a>
        )}

        <div className="dp-grid">
          {playable.map((g, i) => {
            const k = KACHEL[i % KACHEL.length]
            return (
              <a key={g.id} href={`#/spiel/${g.id}`} className="dp-kachel" style={{ background: k.bg, color: k.ink, boxShadow: `0 7px 0 ${k.rand}`, rotate: `${i % 2 ? 2 : -2}deg` }}>
                <Icon name={SYMBOL[g.id] ?? k.icon} color={k.ink} size={52} strokeWidth={2.2} />
                <strong>{g.name}</strong>
                <span>Stufe {getLevel(kid.id, g.id, tier)}</span>
              </a>
            )
          })}
          {soon > 0 && (
            <div className="dp-kachel bald">
              <Icon name="lock" color="#FFFFFF" size={38} strokeWidth={2.4} />
              <strong>{soon} weitere</strong>
              <span>kommen bald</span>
            </div>
          )}
        </div>

        {getPlacement(kid.id)?.status !== 'done' && (
          <a href="#/einstufung" className="nk-btn yellow dp-invite"><Icon name="sparkle" color="#2B2257" size={20} /> Perli kennenlernen</a>
        )}
      </div>
      <NavBar active="denkpark" />
    </Stage>
  )
}
