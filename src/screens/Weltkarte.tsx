import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Bead } from '../components/Bead'
import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { TopBar } from '../components/TopBar'
import { WORLDS } from '../data/curriculum'
import type { Kid } from '../data/demo'
import type { Progress } from '../lib/progress'
import { getDaily } from '../lib/daily'
import { getLevel, tierFor, tierRank } from '../games/engine'
import { GAMES } from '../games/registry'

type Props = { kid: Kid; progress: Progress; onLogout: () => void }

type PlanStep = { icon: IconName | 'bead'; color: string; title: string; text: string; minutes: number; href: string }

export function Weltkarte({ kid, progress, onLogout }: Props) {
  const current = WORLDS[progress.world - 1]
  const unitName = current.units[progress.unit - 1]
  const unitsLeft = current.units.length - progress.unit + 1
  const [say, setSay] = useState(`Noch ${unitsLeft} ${unitsLeft === 1 ? 'Einheit' : 'Einheiten'} bis zum ${current.belt} Gürtel!`)

  const daily = getDaily(kid.id)
  // Aufwärmen: das Denkspiel mit der niedrigsten Stufe
  const tier = tierFor(kid.birthYear)
  const warmup = GAMES.filter((g) => g.ready && tierRank(tier) >= tierRank(g.minTier))
    .sort((a, b) => getLevel(kid.id, a.id, tier) - getLevel(kid.id, b.id, tier))[0]
  const plan: PlanStep[] = [
    { icon: 'brain', color: '#A06BFF', title: 'Aufwärmen', text: warmup ? warmup.name : 'Ein Denkspiel', minutes: 3, href: warmup ? `#/spiel/${warmup.id}` : '#/denkpark' },
    { icon: 'bead', color: '#FFF4D1', title: 'Rechnen', text: `Welt ${current.n} · ${unitName}`, minutes: 10, href: '#/einheit' },
    { icon: 'sparkle', color: '#3BA7FF', title: 'Denk-Pause', text: 'Zwei kurze Denkspiele', minutes: 5, href: '#/denkpark' },
  ]
  const doneSteps = [daily.games >= 1, daily.stations >= 1, daily.games >= 3]
  const planDone = doneSteps.filter(Boolean).length
  const nextStep = doneSteps.findIndex((d) => !d)
  const pts = WORLDS.map((w) => `${w.x},${w.y}`)

  return (
    <Stage>
      <TopBar
        name={kid.name}
        level={progress.level}
        xp={progress.xp}
        perlen={progress.perlen}
        gems={progress.gems}
        streak={progress.streak}
        avatar={{ ...kid.avatar, belt: progress.world > 1 ? '#F2F0FF' : undefined }}
        onLogout={onLogout}
      />

      <div className="map">
        {WORLDS.map((w) => (
          <div key={'i' + w.n} className="island" style={{ left: w.x - 78, top: w.y - 70 }} />
        ))}
        <div className="island park" style={{ left: 740 - 84, top: 505 - 74 }} />
        <svg width="830" height="620" viewBox="0 0 830 620" aria-hidden="true" className="map-path">
          <polyline points={pts.join(' ')} fill="none" stroke="#3A2F80" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 22" />
          <polyline points={pts.slice(0, progress.world).join(' ')} fill="none" stroke="#FFC531" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {WORLDS.map((w) => {
          const state = w.n < progress.world ? 'done' : w.n === progress.world ? 'current' : 'locked'
          const size = state === 'current' ? 116 : 88
          const label = `Welt ${w.n}: ${w.name}${state === 'locked' ? ' (gesperrt)' : ''}`
          return (
            <div key={w.n} className="world" style={{ left: w.x - 80, top: w.y - size / 2 }}>
              {state === 'current' && (
                <div className="world-me"><Avatar size={44} {...kid.avatar} /></div>
              )}
              {state === 'locked' ? (
                <button
                  type="button"
                  className="world-node locked"
                  style={{ width: size, height: size }}
                  aria-label={label}
                  onClick={() => setSay(`${w.name} öffnet sich, wenn du Welt ${w.n - 1} geschafft hast.`)}
                >
                  <Icon name="lock" color="#8F85D6" size={34} />
                </button>
              ) : (
                <a
                  href="#/einheit"
                  className={`world-node ${state}`}
                  style={{ width: size, height: size, background: w.color, color: w.ink }}
                  aria-label={label}
                >
                  <span style={{ fontSize: state === 'current' ? 52 : 40 }}>{w.n}</span>
                </a>
              )}
              <div className={state === 'locked' ? 'world-label locked' : 'world-label'}>{w.name}</div>
              {state === 'done' && (
                <div className="world-stars" aria-label={`${progress.worldStars[w.n] ?? 3} Sterne`}>
                  {[0, 1, 2].map((i) => (
                    <Icon key={i} name="star" size={20} color="#DE9800" fill={i < (progress.worldStars[w.n] ?? 3) ? '#FFC531' : 'none'} />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="world" style={{ left: 740 - 80, top: 505 - 50 }}>
          <a href="#/denkpark" className="world-node park" style={{ width: 100, height: 100 }} aria-label="Denk-Park: Denkspiele">
            <Icon name="brain" color="#FFFFFF" size={52} strokeWidth={2.4} />
          </a>
          <div className="world-label">Denk-Park</div>
        </div>

        <div className="map-perli">
          <Perli mood="happy" size={96} />
          <div className="map-bubble" role="status">{say}</div>
        </div>
      </div>

      <aside className="map-side">
        <section className="plan-card">
          <div className="plan-head">
            <span className="eyebrow">DEIN TAGESPLAN</span>
            <span className="plan-count">{planDone} von {plan.length}</span>
          </div>
          <ol className="plan-list">
            {plan.map((s, i) => (
              <li key={s.title} className={doneSteps[i] ? 'plan-step done' : i === nextStep ? 'plan-step current' : 'plan-step'}>
                <span className="plan-icon" style={{ background: s.color }}>
                  {s.icon === 'bead' ? <Bead color="yellow" width={30} /> : <Icon name={s.icon} color="#231A4F" size={22} strokeWidth={2.4} />}
                </span>
                <span className="plan-text">
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </span>
                {doneSteps[i]
                  ? <span className="plan-check"><Icon name="check" color="#10351B" size={18} strokeWidth={3} /></span>
                  : <span className="plan-min">{s.minutes} Min.</span>}
              </li>
            ))}
          </ol>
          {nextStep === -1 ? (
            <div className="plan-finished"><Icon name="star" color="#DE9800" fill="#FFC531" size={24} /> Tagesplan geschafft!</div>
          ) : (
            <a href={plan[nextStep].href} className="btn-primary plan-go">
              <Icon name="play" color="#231A4F" fill="#231A4F" size={22} />
              {planDone === 0 ? 'Los geht’s' : 'Weiter'}
            </a>
          )}
        </section>

        <section className="quests">
          <div className="quests-head">
            <h2>Tagesaufgaben</h2>
            <span>bis Mitternacht</span>
          </div>
          {[
            { icon: 'target' as IconName, text: 'Löse 20 Aufgaben', done: Math.min(daily.tasks, 20), goal: 20, reward: 20 },
            { icon: 'brain' as IconName, text: 'Spiele 2 Denkspiele', done: Math.min(daily.games, 2), goal: 2, reward: 20 },
            { icon: 'clock' as IconName, text: 'Lerne 10 Minuten', done: Math.min(daily.minutes, 10), goal: 10, reward: 30 },
          ].map((q) => (
            <div key={q.text} className="quest">
              <span className={q.done >= q.goal ? 'quest-icon done' : 'quest-icon'}><Icon name={q.icon} color="#FFFFFF" size={22} strokeWidth={2.6} /></span>
              <div className="quest-body">
                <div className="quest-text">{q.text}</div>
                <div className="quest-track" role="progressbar" aria-label={q.text} aria-valuenow={q.done} aria-valuemin={0} aria-valuemax={q.goal}>
                  <div className={q.done >= q.goal ? 'full' : ''} style={{ width: `${(q.done / q.goal) * 100}%` }} />
                </div>
              </div>
              <span className="quest-reward">+{q.reward}</span>
            </div>
          ))}
        </section>
      </aside>

      <div className="test-nav"><NavBar active="karte" /></div>
    </Stage>
  )
}
