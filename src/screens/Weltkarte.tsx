import { useEffect, useMemo, useRef, useState } from 'react'
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

// Abstände auf dem Weg (px) und seitliche Schlangenlinie
const GAP: Record<MapStop['kind'], number> = { world: 160, start: 180, unit: 185, game: 175 }
const SWING = 92

export function Weltkarte({ kid, progress, onLogout }: Props) {
  const path = useMemo(() => buildPath(kid, progress), [kid, progress])
  const current = path.find((s) => s.state === 'current')
  const [say, setSay] = useState(() => greeting(current))
  const [questsOpen, setQuestsOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  const { placed, height } = useMemo(() => layout(path), [path])
  const line = placed.filter((p) => p.s.kind !== 'world').map((p) => ({ x: p.x, y: p.top + 50, done: p.s.state === 'done' }))
  const doneUntil = line.findIndex((p) => !p.done)

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

        <div className="path-scroll" ref={scroller}>
          <div className="path" style={{ height }}>
            <svg className="path-line" width="400" height={height} viewBox={`-200 0 400 ${height}`} aria-hidden="true">
              <polyline points={line.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#3A2F80" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 24" />
              {doneUntil !== 0 && (
                <polyline points={line.slice(0, doneUntil === -1 ? line.length : doneUntil + 1).map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#FFC531" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>

            {placed.map(({ s, top, x }) => (
              <div key={s.id} className={`path-item ${s.kind}`} style={{ top, transform: `translateX(${x}px)` }}>
                {s.kind === 'world'
                  ? <WorldBanner stop={s} />
                  : <Node stop={s} kid={kid} onLocked={(text) => setSay(text)} />}
                {s.state === 'current' && s.kind !== 'world' && (
                  <div className={x > 0 ? 'path-perli left' : 'path-perli'}>
                    <Perli mood="happy" size={86} />
                    <div className="map-bubble" role="status">{say}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nav-dock"><NavBar active="karte" /></div>
    </Stage>
  )
}

/** Position jeder Station: senkrecht untereinander, Knoten schwingen nach links und rechts. */
function layout(path: MapStop[]) {
  let y = 40
  let n = 0
  const placed = path.map((s) => {
    const top = y
    y += GAP[s.kind]
    const x = s.kind === 'world' ? 0 : Math.round(Math.sin(n++ * 0.85) * SWING)
    return { s, top, x }
  })
  return { placed, height: y + 60 }
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
  const inner = stop.state === 'locked'
    ? <Icon name="lock" color="#8F85D6" size={30} />
    : stop.kind === 'unit'
      ? <span className="path-num">{stop.unit}</span>
      : <Icon name={stop.kind === 'game' ? 'brain' : 'sparkle'} color="#FFFFFF" size={stop.kind === 'game' ? 40 : 44} strokeWidth={2.4} />
  const style = stop.kind === 'unit' && stop.state !== 'locked' ? { background: stop.world.color, color: stop.world.ink } : undefined

  return (
    <div className="path-stop">
      {current && <div className="path-start">{stop.kind === 'game' ? 'Spielen' : 'Start'}</div>}
      {current && stop.kind === 'unit' && <div className="path-me"><Avatar size={40} {...kid.avatar} /></div>}
      {stop.state === 'locked' ? (
        <button type="button" className={cls} aria-label={`${label} (gesperrt)`} onClick={() => onLocked(stop.kind === 'game' ? 'Dieses Denkspiel kommt nach der Einheit davor.' : 'Das kommt später – Schritt für Schritt!')}>
          {inner}
        </button>
      ) : (
        <a href={href} className={cls} style={style} aria-label={label} onClick={() => { if (stop.kind === 'game' && current) startStop(stop.id) }}>
          {inner}
          {stop.state === 'done' && <span className="path-check"><Icon name="check" color="#10351B" size={16} strokeWidth={3.4} /></span>}
        </a>
      )}
      <div className={stop.state === 'locked' ? 'path-label locked' : 'path-label'}>
        {stop.kind === 'game' && <span className="path-kind">Denkspiel</span>}
        {label}
      </div>
    </div>
  )
}
