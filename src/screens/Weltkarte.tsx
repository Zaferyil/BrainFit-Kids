import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import type { Progress } from '../lib/progress'
import { getDaily } from '../lib/daily'
import { etappen } from '../data/karten'
import { buildPath, startStop, type MapStop } from '../lib/mapPath'

type Props = { kid: Kid; progress: Progress; onLogout: () => void }

type Stop = Exclude<MapStop, { kind: 'world' }>

export function Weltkarte({ kid, progress, onLogout }: Props) {
  const path = useMemo(() => buildPath(kid, progress), [kid, progress])
  const current = path.find((s) => s.state === 'current')
  const [say, setSay] = useState(() => greeting(current))
  const [questsOpen, setQuestsOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  const stops = useMemo(() => path.filter((s): s is Stop => s.kind !== 'world'), [path])
  const teile = useMemo(() => etappen(stops.length), [stops.length])

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
    <Stage background="linear-gradient(180deg, #4B2FC2 0%, #7B5CFF 40%, #FF9AC8 100%)">
      <header className="nk-hello nk-map-head">
        <a href="#/karte" className="nk-zurueck" aria-label="Zurück zur Startseite">
          <Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} />
        </a>
        <button type="button" className="nk-me" aria-label="Mein Menü" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          <Avatar size={48} {...kid.avatar} />
        </button>
        <div className="nk-hello-text">
          <strong>Hallo {kid.name}!</strong>
          <span>Level {progress.level}</span>
        </div>
        <span className="nk-chip"><Icon name="star" color="#E0A100" fill="#FFC531" size={20} />{progress.perlen}</span>
        {menu && (
          <div className="nk-menu popin">
            <button type="button" onClick={onLogout}><Icon name="logout" color="#2B2257" size={20} />Abmelden</button>
          </div>
        )}
      </header>

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
          {[...teile].reverse().map(({ karte, start }, k) => (
            <section key={start} className="insel" style={{ zIndex: teile.length - k }}>
              <img className="insel-bg" src={karte.bild} alt="" draggable={false} />
              {karte.plaetze.map(([x, y], i) => {
                const s = stops[start + i]
                const pos = { left: `${(x / karte.w) * 100}%`, top: `${(y / karte.h) * 100}%` }
                if (!s) return <span key={i} className="insel-coin" style={pos} aria-hidden="true"><Icon name="star" color="#FFFFFF" size={18} strokeWidth={2.6} /></span>
                return (
                  <div key={s.id} className={`insel-stop ${edge(x / karte.w)}`} style={pos}>
                    <Node stop={s} n={start + i + 1} kid={kid} links={x / karte.w > 0.5} onLocked={(text) => setSay(text)} />
                  </div>
                )
              })}
              {start === 0 && (
                <div className="insel-perli">
                  <div className="map-bubble" role="status">{say}</div>
                  <Perli mood="happy" size={96} />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      <NavBar active="karte" />
    </Stage>
  )
}

/** Stationen am Rand: Beschriftung nach innen schieben, damit sie nicht aus dem Bild ragt. */
const edge = (fx: number) => (fx < 0.25 ? 'rand-l' : fx > 0.75 ? 'rand-r' : '')

function greeting(s?: MapStop) {
  if (!s) return 'Du hast alles geschafft!'
  if (s.kind === 'start') return 'Lass uns starten! Ich will dich kennenlernen.'
  if (s.kind === 'game') return 'Zeit für ein Denkspiel!'
  if (s.kind === 'unit') return `Weiter geht’s: ${s.name}!`
  return ''
}

function Node({ stop, n, kid, links, onLocked }: { stop: Stop; n: number; kid: Kid; links: boolean; onLocked: (text: string) => void }) {
  const current = stop.state === 'current'
  const cls = `path-node ${stop.kind} ${stop.state}`
  const label = stop.kind === 'unit' ? stop.name : stop.kind === 'game' ? stop.game.name : 'Perli kennenlernen'
  const href = stop.kind === 'unit' ? '#/einheit' : stop.kind === 'game' ? `#/spiel/${stop.game.id}` : '#/einstufung'
  const inner = <span className="path-num">{n}</span>

  return (
    <div className="path-stop">
      {stop.kind === 'unit' && stop.unit === 1 && (
        <div className={`welt-schild welt-${stop.world.n} ${links ? 'links' : 'rechts'}`}><small>Welt {stop.world.n}</small>{stop.world.name.replace(/-/g, ' ')}</div>
      )}
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
        {[0, 1, 2].map((i) => <Star3D key={i} on={stop.state === 'done'} />)}
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

/** Dicker, glänzender Stern unter den Stationen (gold = geschafft, grau = offen). */
function Star3D({ on }: { on: boolean }) {
  const id = on ? 'st-gold' : 'st-grau'
  const [hi, lo, edge] = on ? ['#FFE58A', '#FFB21E', '#D07A00'] : ['#F1F3F8', '#C4CAD8', '#8A93A8']
  const d = 'M12 2.6c.5 0 .9.3 1.1.7l2.3 4.7 5.2.8c1 .1 1.4 1.3.7 2l-3.8 3.7.9 5.2c.2 1-.9 1.7-1.7 1.3L12 18.5l-4.7 2.5c-.9.5-1.9-.3-1.7-1.3l.9-5.2-3.8-3.7c-.7-.7-.3-1.9.7-2l5.2-.8 2.3-4.7c.2-.4.6-.7 1.1-.7z'
  return (
    <svg className="star3d" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
      </defs>
      <path d={d} transform="translate(0 1.4)" fill={edge} />
      <path d={d} fill={`url(#${id})`} stroke={edge} strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M9.3 9.2l1.7-3.4M8 10.2l-2.6.4" stroke="#FFFFFF" strokeOpacity=".75" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  )
}
