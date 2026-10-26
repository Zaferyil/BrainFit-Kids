import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { buildPath, startStop, type MapStop } from '../lib/mapPath'
import type { Progress } from '../lib/progress'
import { Funkeln } from './Anmelden'

// Perlen-Galaxie: alle Stationen als glänzende 3D-Perlen auf einem leuchtenden Weg durchs All.
// Jede Welt ist ein Planet am Rand, unten beginnt der Weg. Die Perlen sind durchnummeriert.

type Props = { kid: Kid; progress: Progress; onLogout: () => void }
type Stop = Exclude<MapStop, { kind: 'world' }>
type World = Extract<MapStop, { kind: 'world' }>

const STEP = 150
const WORLD_GAP = 220
const SWING = 30 // % der Breite um die Mitte
const BOTTOM = 150

// Farben der noch offenen Perlen, damit der Weg bunt bleibt
const LOCKED = ['blau', 'gruen', 'orange']

type Placed =
  | { kind: 'world'; s: World; y: number; side: 1 | -1 }
  | { kind: 'stop'; s: Stop; y: number; x: number; n: number }

/** Positionen von unten nach oben: y = Abstand vom unteren Rand */
function layout(path: MapStop[]) {
  let y = BOTTOM
  let n = 0
  let w = 0
  const out: Placed[] = []
  for (const s of path) {
    if (s.kind === 'world') {
      y += out.length ? WORLD_GAP - STEP : 0
      out.push({ kind: 'world', s, y, side: w++ % 2 ? 1 : -1 })
      y += 120
    } else {
      out.push({ kind: 'stop', s, y, x: 50 + Math.sin(n * 0.9) * SWING, n: ++n })
      y += STEP
    }
  }
  return { placed: out, height: y + 60 }
}

export function Weltkarte({ kid, progress }: Props) {
  const path = useMemo(() => buildPath(kid, progress), [kid, progress])
  const { placed, height } = useMemo(() => layout(path), [path])
  const [say, setSay] = useState('')
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    box.current?.querySelector('.gx-perle.current')?.scrollIntoView({ block: 'center' })
  }, [])
  useEffect(() => {
    if (!say) return
    const t = setTimeout(() => setSay(''), 2600)
    return () => clearTimeout(t)
  }, [say])

  const stops = placed.filter((p): p is Extract<Placed, { kind: 'stop' }> => p.kind === 'stop')
  const doneUntil = stops.findIndex((p) => p.s.state !== 'done')
  const pts = (list: typeof stops) => list.map((p) => `${p.x * 4},${height - p.y}`).join(' ')
  const currentN = stops.find((p) => p.s.state === 'current')?.n

  return (
    <Stage className="nk" background="linear-gradient(180deg, #2A1A7A 0%, #4B2FC2 45%, #7B5CFF 80%, #FF9AC8 100%)">
      <Funkeln />
      <div className="gx-top">
        <a href="#/karte" className="nk-round ghost" aria-label="Zur Startseite"><Icon name="left" color="#FFFFFF" size={22} strokeWidth={3} /></a>
        <span className="gx-count">{currentN ? `Station ${currentN} von ${stops.length}` : 'Alles geschafft!'}</span>
      </div>
      {say && <div className="gx-toast popin" role="status">{say}</div>}

      <div className="gx" ref={box} style={{ height }}>
        <svg className="gx-weg" viewBox={`0 0 400 ${height}`} preserveAspectRatio="none" aria-hidden="true">
          <polyline points={pts(stops)} fill="none" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 17" vectorEffect="non-scaling-stroke" />
          {doneUntil !== 0 && (
            <polyline points={pts(stops.slice(0, doneUntil === -1 ? stops.length : doneUntil + 1))} fill="none" stroke="#FFC531" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          )}
        </svg>

        {placed.map((p) => p.kind === 'world' ? (
          <div key={p.s.id} className={`gx-welt ${p.side < 0 ? 'l' : 'r'} ${p.s.state}`} style={{ bottom: p.y }}>
            <span className="gx-planet" style={{ background: `radial-gradient(circle at ${p.side < 0 ? 65 : 35}% 30%, #FFFFFF, ${p.s.world.color} 45%, ${p.s.world.color})` }} />
            <span className="gx-schild">
              <b style={{ background: p.s.world.color, color: p.s.world.ink }}>{p.s.world.n}</b>
              {p.s.world.name}
              {p.s.state === 'locked' && <Icon name="lock" color="#8A82B5" size={16} strokeWidth={2.8} />}
            </span>
          </div>
        ) : (
          <Perle key={p.s.id} stop={p.s} n={p.n} x={p.x} y={p.y} kid={kid} onLocked={setSay} />
        ))}
      </div>
      <NavBar active="karte" />
    </Stage>
  )
}

function Perle({ stop, n, x, y, kid, onLocked }: { stop: Stop; n: number; x: number; y: number; kid: Kid; onLocked: (t: string) => void }) {
  const label = stop.kind === 'unit' ? stop.name : stop.kind === 'game' ? stop.game.name : 'Perli kennenlernen'
  const href = stop.kind === 'unit' ? '#/einheit' : stop.kind === 'game' ? `#/spiel/${stop.game.id}` : '#/einstufung'
  const farbe = stop.state === 'done' ? 'gold' : stop.state === 'current' ? 'violett' : stop.kind === 'game' ? 'pink' : stop.kind === 'start' ? 'orange' : LOCKED[n % LOCKED.length]
  const cls = `gx-perle ${stop.state} ${farbe}`
  const inner = (
    <>
      <span className="gx-glanz" />
      <span className="gx-zahl">{stop.kind === 'game' ? <Icon name="bolt" color="#FFFFFF" fill="#FFFFFF" size={stop.state === 'current' ? 40 : 28} /> : n}</span>
    </>
  )
  return (
    <div className="gx-stop" style={{ left: `${x}%`, bottom: y }}>
      {stop.state === 'locked' ? (
        <button type="button" className={cls} aria-label={`${n}: ${label} (noch gesperrt)`} onClick={() => onLocked(stop.kind === 'game' ? 'Dieses Denkspiel kommt nach der Station davor.' : 'Das kommt später – Schritt für Schritt!')}>
          {inner}
        </button>
      ) : (
        <a href={href} className={cls} aria-label={`${n}: ${label}`} onClick={() => { if (stop.kind === 'game' && stop.state === 'current') startStop(stop.id) }}>
          {inner}
        </a>
      )}
      {stop.state === 'done' && (
        <span className="gx-sterne" aria-hidden="true">
          {[0, 1, 2].map((i) => <Icon key={i} name="star" color="#B87400" fill="#FFC531" size={18} strokeWidth={1.8} />)}
        </span>
      )}
      {stop.state === 'current' && (
        <>
          <span className="gx-ich"><Avatar size={44} {...kid.avatar} /></span>
          <span className="gx-los">{stop.kind === 'game' ? 'Spielen' : 'Start'}</span>
          <span className="gx-name">{label}</span>
        </>
      )}
    </div>
  )
}
