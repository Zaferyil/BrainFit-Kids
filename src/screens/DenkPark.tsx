import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import { TopBar } from '../components/TopBar'
import type { Kid } from '../data/demo'
import { getLevel, getPlacement, tierFor, tierRank, TIERS } from '../games/engine'
import { AREAS, GAMES } from '../games/registry'
import type { Progress } from '../lib/progress'

export function DenkPark({ kid, progress, onLogout }: { kid: Kid; progress: Progress; onLogout: () => void }) {
  const tier = tierFor(kid.birthYear)
  return (
    <Stage>
      <TopBar name={kid.name} level={progress.level} xp={progress.xp} perlen={progress.perlen} gems={progress.gems} streak={progress.streak} avatar={kid.avatar} onLogout={onLogout} />
      <div className="denkpark">
        <div className="park-head">
          <h1>Denk-Park</h1>
          <span className="park-tier">{TIERS[tier].name} · {TIERS[tier].ages} Jahre</span>
          {getPlacement(kid.id)?.status === 'done'
            ? <span className="park-note">Die Spiele passen sich dir an: Je besser du wirst, desto kniffliger.</span>
            : <a href="#/einstufung" className="park-invite"><Icon name="sparkle" color="#231A4F" size={20} /> Perli kennenlernen (3 Min.)</a>}
        </div>
        <div className="park-grid">
          {AREAS.map((a) => (
            <section key={a.id} className="park-area">
              <div className="park-area-head">
                <span className="park-area-icon" style={{ background: a.color }}><Icon name={a.icon} color="#231A4F" size={24} strokeWidth={2.4} /></span>
                <div>
                  <h2>{a.name}</h2>
                  <span>{a.text}</span>
                </div>
              </div>
              <ul>
                {GAMES.filter((g) => g.area === a.id).map((g) => {
                  const open = tierRank(tier) >= tierRank(g.minTier)
                  const content = (
                    <>
                      <span className="park-game-name">{g.name}</span>
                      {!open ? (
                        <span className="park-badge lock"><Icon name="lock" color="#8F85D6" size={14} /> ab {TIERS[g.minTier].ages.split('–')[0]} J.</span>
                      ) : !g.ready ? (
                        <span className="park-badge soon">bald</span>
                      ) : (
                        <span className="park-badge level">Stufe {getLevel(kid.id, g.id, tier)}</span>
                      )}
                    </>
                  )
                  return (
                    <li key={g.id}>
                      {open && g.ready
                        ? <a href={`#/spiel/${g.id}`} className="park-game ready">{content}<Icon name="play" color="#231A4F" fill="#231A4F" size={14} /></a>
                        : <div className="park-game">{content}</div>}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
      <div className="nav-dock"><NavBar active="denkpark" /></div>
    </Stage>
  )
}
