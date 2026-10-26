import { useEffect, useMemo, useRef, useState } from 'react'
import insel from '../assets/karte/insel.webp'
import { Avatar } from '../components/Avatar'
import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { TopBar } from '../components/TopBar'
import type { Kid } from '../data/demo'
import type { Progress } from '../lib/progress'
import { getDaily } from '../lib/daily'
import { buildPath, startStop, type MapStop } from '../lib/mapPath'

type Props = { kid: Kid; progress: Progress; onLogout: () => void }

// Jede Welt ist eine Insel (Bild ohne Stationen, siehe scripts/karte-bild.py). Die Stationen liegen
// auf den 12 Plätzen des Wegs, von unten (Start) nach oben (Burg); freie Plätze bekommen eine Münze.
const IMG_W = 941
const IMG_H = 1403
const SLOTS: [number, number][] = [
  [555, 1173], [325, 1046], [157, 923], [262, 713], [449, 793], [700, 871],
  [766, 668], [559, 538], [329, 471], [319, 298], [565, 263], [700, 163],
]

type Island = { banner: Extract<MapStop, { kind: 'world' }>; stops: Exclude<MapStop, { kind: 'world' }>[] }

export function Weltkarte({ kid, progress, onLogout }: Props) {
  const path = useMemo(() => buildPath(kid, progress), [kid, progress])
  const current = path.find((s) => s.state === 'current')
  const [say, setSay] = useState(() => greeting(current))
  const [questsOpen, setQuestsOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  const islands = useMemo(() => groupByWorld(path), [path])

  // Beim Öffnen zur aktuellen Station scrollen
  useEffect(() => {
    scroller.current?.querySelector('.path-node.current')?.scrollIntoView({ block: 'center' })
  }, [])

  const daily = getDaily(kid.id)
  const quests = [
    { icon: 'target' as IconName, text: 'Löse 20 Aufgaben', done: Math.min(daily.tasks, 20), goal: 20, reward: 20 },
    { icon: 'brain' as IconName, text: 'Spiele 2 Denkspiele', done: Math.min(daily.games, 2), goal: 2, reward: 20 },
    { icon: 'clock' as IconName, text: 'Lerne 10 Minuten', done: Math.min(daily.minutes, 10), goal: 10, reward: 30 },
  ]
  const questsDone = quests.filter((q) => q.done >= q.goal).length

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

      <div className="path-screen">
        <div className="path-tools">
          <button type="button" className={questsOpen ? 'quest-chip open' : 'quest-chip'} onClick={() => setQuestsOpen(!questsOpen)} aria-expanded={questsOpen}>
            <Icon name="target" color="#231A4F" size={20} strokeWidth={2.6} />
            Tagesaufgaben <b>{questsDone}/{quests.length}</b>
          </button>
          {questsOpen && (
            <section className="quests popover">
              {quests.map((q) => (
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
          )}
        </div>

        <div className="inseln" ref={scroller}>
          {islands.map((isl) => (
            <section key={isl.banner.id} className={isl.banner.state === 'locked' ? 'insel locked' : 'insel'} aria-label={`Welt ${isl.banner.world.n}`}>
              <img className="insel-bg" src={insel} alt="" draggable={false} />
              <div className="insel-banner"><WorldBanner stop={isl.banner} /></div>
              {SLOTS.map(([x, y], i) => {
                const s = isl.stops[i]
                const pos = { left: `${(x / IMG_W) * 100}%`, top: `${(y / IMG_H) * 100}%` }
                if (!s) return <span key={i} className="insel-coin" style={pos} aria-hidden="true"><Icon name="star" color="#FFFFFF" size={18} strokeWidth={2.6} /></span>
                return (
                  <div key={s.id} className="insel-stop" style={pos}>
                    <Node stop={s} kid={kid} onLocked={(text) => setSay(text)} />
                  </div>
                )
              })}
              {isl.stops.some((s) => s.state === 'current') && (
                <div className="insel-perli">
                  <div className="map-bubble" role="status">{say}</div>
                  <Perli mood="happy" size={96} />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="nav-dock"><NavBar active="karte" /></div>
    </Stage>
  )
}

/** Stationen nach Welten gruppieren (die Einstufung gehört zu Welt 1); oben die letzte Welt, unten die erste. */
function groupByWorld(path: MapStop[]): Island[] {
  const islands: Island[] = []
  const before: Island['stops'] = []
  for (const s of path) {
    if (s.kind === 'world') islands.push({ banner: s, stops: islands.length ? [] : before })
    else (islands.at(-1)?.stops ?? before).push(s)
  }
  return islands.reverse()
}

function greeting(s?: MapStop) {
  if (!s) return 'Du hast alles geschafft!'
  if (s.kind === 'start') return 'Lass uns starten! Ich will dich kennenlernen.'
  if (s.kind === 'game') return 'Zeit für ein Denkspiel!'
  if (s.kind === 'unit') return `Weiter geht’s: ${s.name}!`
  return ''
}

function WorldBanner({ stop }: { stop: Extract<MapStop, { kind: 'world' }> }) {
  const w = stop.world
  return (
    <div className={stop.state === 'locked' ? 'world-banner locked' : 'world-banner'} style={{ background: stop.state === 'locked' ? undefined : w.color, color: stop.state === 'locked' ? undefined : w.ink }}>
      <span className="world-banner-n">{stop.state === 'locked' ? <Icon name="lock" color="#8F85D6" size={22} /> : w.n}</span>
      <span className="world-banner-text">
        <strong>Welt {w.n} · {w.name}</strong>
        <span>{w.topic} · {w.belt} Gürtel</span>
      </span>
    </div>
  )
}

function Node({ stop, kid, onLocked }: { stop: Exclude<MapStop, { kind: 'world' }>; kid: Kid; onLocked: (text: string) => void }) {
  const current = stop.state === 'current'
  const cls = `path-node ${stop.kind} ${stop.state}`
  const label = stop.kind === 'unit' ? stop.name : stop.kind === 'game' ? stop.game.name : 'Perli kennenlernen'
  const href = stop.kind === 'unit' ? '#/einheit' : stop.kind === 'game' ? `#/spiel/${stop.game.id}` : '#/einstufung'
  const inner = stop.state === 'locked' && stop.kind !== 'unit'
    ? <Icon name="lock" color="#FFFFFF" size={26} strokeWidth={2.6} />
    : stop.kind === 'unit'
      ? <span className="path-num">{stop.unit}</span>
      : <Icon name={stop.kind === 'game' ? 'brain' : 'sparkle'} color="#FFFFFF" size={34} strokeWidth={2.4} />

  return (
    <div className="path-stop">
      {current && <div className="path-start">{stop.kind === 'game' ? 'Spielen' : 'Start'}</div>}
      {current && stop.kind === 'unit' && <div className="path-me"><Avatar size={40} {...kid.avatar} /></div>}
      {stop.state === 'locked' ? (
        <button type="button" className={cls} aria-label={`${label} (gesperrt)`} onClick={() => onLocked(stop.kind === 'game' ? 'Dieses Denkspiel kommt nach der Einheit davor.' : 'Das kommt später – Schritt für Schritt!')}>
          {inner}
        </button>
      ) : (
        <a href={href} className={cls} aria-label={label} onClick={() => { if (stop.kind === 'game' && current) startStop(stop.id) }}>
          {inner}
        </a>
      )}
      <div className={stop.state === 'done' ? 'path-stars done' : 'path-stars'} aria-hidden="true">
        {[0, 1, 2].map((i) => <Icon key={i} name="star" color="#FFFFFF" size={16} strokeWidth={1.5} />)}
      </div>
      {current && (
        <div className="path-label">
          {stop.kind === 'game' && <span className="path-kind">Denkspiel</span>}
          {label}
        </div>
      )}
    </div>
  )
}
