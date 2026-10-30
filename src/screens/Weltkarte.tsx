import { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { setReplay, type Progress } from '../lib/progress'
import { getDaily } from '../lib/daily'
import { etappen } from '../data/karten'
import { WORLDS } from '../data/curriculum'
import burgBild from '../assets/karte/erfolgsburg.webp'
import burgWelt2 from '../assets/karte/erfolgsburg-welt2.webp'
import { buildPath, startStop, type MapStop } from '../lib/mapPath'

type Props = { kid: Kid; progress: Progress; onLogout: () => void }

type Stop = Exclude<MapStop, { kind: 'world' }>
/** Erfolgsburg am Ende jeder Welt */
type Burg = { kind: 'burg'; id: string; welt: number; geschafft: boolean }
type Platz = Stop | Burg

export function Weltkarte({ kid, progress, onLogout }: Props) {
  const path = useMemo(() => buildPath(kid, progress), [kid, progress])
  const current = path.find((s) => s.state === 'current')
  const [say, setSay] = useState(() => greeting(current))
  const [questsOpen, setQuestsOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  // Nur die Welten bis zur aktuellen zeigen: die nächste Welt erscheint erst, wenn die jetzige geschafft ist
  const stops = useMemo(() => {
    const alle = path.filter((s): s is Stop => s.kind !== 'world')
    const ende = alle.findIndex((s) => s.kind === 'unit' && s.world.n > progress.world)
    return ende < 0 ? alle : alle.slice(0, ende)
  }, [path, progress.world])
  // Nach der letzten Station jeder Welt steht eine Burg: „Diese Welt ist geschafft“
  const plaetze = useMemo(() => {
    const out: Platz[] = []
    const burg = (n: number) => out.push({ kind: 'burg', id: `burg-${n}`, welt: n, geschafft: progress.world > n })
    let welt = 0
    for (const s of stops) {
      if (s.kind === 'unit' && s.world.n !== welt) { if (welt) burg(welt); welt = s.world.n }
      out.push(s)
    }
    if (welt) burg(welt)
    return out
  }, [stops, progress.world])
  // Liegt nur noch die Schluss-Burg auf einer neuen Insel, kommt sie stattdessen oben auf die vorige Insel
  const teile = useMemo(() => {
    const t = etappen(plaetze.length)
    const z = t[t.length - 1]
    return t.length > 1 && plaetze.slice(z.start).every((p) => p.kind === 'burg') ? t.slice(0, -1) : t
  }, [plaetze])
  const schlussBurg = plaetze[plaetze.length - 1]?.kind === 'burg' ? plaetze[plaetze.length - 1] as Burg : null
  // Laufende Nummer nur für Lektionen und Spiele (Burgen zählen nicht mit)
  const nummer = useMemo(() => { const m = new Map<string, number>(); let n = 0; for (const p of plaetze) if (p.kind !== 'burg') m.set(p.id, ++n); return m }, [plaetze])

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
    <Stage background="linear-gradient(180deg, #4FC3F2, #2E9FDB)">
      <header className="nk-hello nk-map-head">
        <a href="#/karte" className="nk-zurueck" aria-label="Zurück zur Startseite">
          <Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} />
        </a>
        <button type="button" className="nk-me" aria-label="Mein Menü" aria-expanded={menu} onClick={() => setMenu(!menu)}>
          <Avatar size={48} {...kid.avatar} />
        </button>
        <div className="nk-hello-text">
          <strong>Hallo {kid.name}!</strong>
          <span>Welt {progress.world} · {WORLDS[progress.world - 1]?.name.replace(/-/g, ' ')}</span>
        </div>
        <span className="nk-chip"><Icon name="star" color="#E0A100" fill="#FFC531" size={20} />{progress.perlen}</span>
        <div className="path-tools">
          <button type="button" className={questsOpen ? 'quest-chip open' : 'quest-chip'} onClick={() => setQuestsOpen(!questsOpen)} aria-expanded={questsOpen}>
            <Icon name="target" color="#231A4F" size={20} strokeWidth={2.6} />
            <span className="quest-wort">Aufgaben</span> <b>{questsDone}/{quests.length}</b>
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

        {menu && (
          <div className="nk-menu popin">
            <button type="button" onClick={onLogout}><Icon name="logout" color="#2B2257" size={20} />Abmelden</button>
          </div>
        )}
      </header>

      <div className="path-screen">
        <div className="inseln" ref={scroller}>
          {[...teile].reverse().map(({ karte, start, anzahl }, k) => {
            // Oberste Insel endet kurz über der Burg – der Rest des Bildes gehört zur nächsten, noch gesperrten Welt
            const letzte = k === 0
            // Burg-Platz nicht mitzählen: die Burg sitzt mittig über der letzten Station
            const stopsY = karte.plaetze.slice(0, anzahl).filter((_, i) => plaetze[start + i] && plaetze[start + i].kind !== 'burg').map(([, y]) => y)
            const oben = stopsY.length ? Math.min(...stopsY) : karte.h
            // genau so viel Platz lassen, dass die Burg (78 % breit, Seitenverhältnis 600:429) ganz hineinpasst
            // Burg: 58 % breit (600:429), ihre Treppe endet kurz über der letzten Station, wo der Weg im Bild hinführt
            const burgUnten = oben - karte.w * 0.055
            const platz = burgUnten - karte.w * 0.44
            // reicht das Bild nach oben nicht, bekommt die Insel oben Wasser dazu (negativer Schnitt)
            const schnitt = letzte ? (schlussBurg ? platz : Math.max(0, platz)) : 0
            const hoehe = karte.h - schnitt
            return (
            <section key={start} className={letzte && schnitt > 0 ? 'insel ende' : letzte && schnitt < 0 ? 'insel ende-wasser' : 'insel'} style={{ zIndex: teile.length - k, aspectRatio: `${karte.w} / ${hoehe}` }}>
              <img className="insel-bg" src={karte.bild} alt="" draggable={false} style={{ marginTop: `${(-schnitt / karte.w) * 100}cqw` }} />
              {karte.plaetze.map(([x, y], i) => {
                const s = plaetze[start + i]
                const pos = { left: `${(x / karte.w) * 100}%`, top: `${((y - schnitt) / hoehe) * 100}%` }
                if (!s) return null
                if (s.kind === 'burg' && letzte && s === schlussBurg) return null
                if (s.kind === 'burg') return (
                  <div key={s.id} className="insel-stop insel-burg-platz" style={pos}><ErfolgsBurg burg={s} /></div>
                )
                return (
                  <div key={s.id} className={`insel-stop ${edge(x / karte.w)}`} style={pos}>
                    <Node stop={s} n={nummer.get(s.id) ?? 0} kid={kid} onLocked={(text) => setSay(text)} />
                  </div>
                )
              })}
              {start === 0 && (
                <div className="insel-perli">
                  <div className="map-bubble" role="status">{say}</div>
                  <Perli mood="happy" size={96} />
                </div>
              )}
              {letzte && schlussBurg && (
                <div className="insel-stop insel-burg-platz schluss" style={{ left: '71%', top: `${((burgUnten - schnitt) / hoehe) * 100}%` }}><ErfolgsBurg burg={schlussBurg} /></div>
              )}
            </section>
            )
          })}
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

function Node({ stop, n, kid, onLocked }: { stop: Stop; n: number; kid: Kid; onLocked: (text: string) => void }) {
  const current = stop.state === 'current'
  const cls = `path-node ${stop.kind} ${stop.state}`
  const label = stop.kind === 'unit' ? stop.name : stop.kind === 'game' ? stop.game.name : 'Perli kennenlernen'
  const href = stop.kind === 'unit' ? '#/einheit' : stop.kind === 'game' ? `#/spiel/${stop.game.id}` : '#/einstufung'
  // Denkspiele (nicht Mental-Arithmetik) tragen ein kleines Gehirn auf der Nummer
  const inner = (
    <>
      <span className="path-num">{n}</span>
      {stop.kind === 'game' && <span className="path-gehirn" aria-hidden="true"><Icon name="brain" color="#FFFFFF" size={14} strokeWidth={2.6} /></span>}
    </>
  )

  return (
    <div className="path-stop">
      {current && <div className="path-start">Du bist da</div>}
      {current && stop.kind === 'unit' && <div className="path-me"><Avatar size={40} {...kid.avatar} /></div>}
      {stop.state === 'locked' ? (
        <button type="button" className={cls} aria-label={`${label} (gesperrt)`} onClick={() => onLocked(stop.kind === 'game' ? 'Dieses Denkspiel kommt nach der Einheit davor.' : 'Das kommt später – Schritt für Schritt!')}>
          {inner}
        </button>
      ) : (
        <a href={href} className={cls} aria-label={label} onClick={() => { if (stop.kind === 'game' && current) startStop(stop.id); if (stop.kind === 'unit') setReplay(kid.id, current ? null : { world: stop.world.n, unit: stop.unit }) }}>
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

/** Erfolgsburg am Ende einer Welt: das Tor zur nächsten Welt; nach dem Abschluss leuchtet sie. */
function ErfolgsBurg({ burg }: { burg: Burg }) {
  return (
    <div className={burg.geschafft ? 'erfolgsburg geschafft' : 'erfolgsburg'} role="img" aria-label={`Tor zu Welt ${burg.welt + 1}${burg.geschafft ? ' (geöffnet)' : ''}`}>
      <img src={burg.welt === 1 ? burgWelt2 : burgBild} alt="" draggable={false} />
    </div>
  )
}
