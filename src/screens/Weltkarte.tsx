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
import { buildPath, startStop, type MapStop } from '../lib/mapPath'

type Props = { kid: Kid; progress: Progress; onLogout: () => void }

type Stop = Exclude<MapStop, { kind: 'world' }>
/** Erfolgsburg am Ende jeder Welt */
type Burg = { kind: 'burg'; id: string; welt: number; name: string; geschafft: boolean }
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
    const burg = (n: number) => out.push({ kind: 'burg', id: `burg-${n}`, welt: n, name: WORLDS[n - 1]?.name.replace(/-/g, ' ') ?? '', geschafft: progress.world > n })
    let welt = 0
    for (const s of stops) {
      if (s.kind === 'unit' && s.world.n !== welt) { if (welt) burg(welt); welt = s.world.n }
      out.push(s)
    }
    if (welt) burg(welt)
    return out
  }, [stops, progress.world])
  const teile = useMemo(() => etappen(plaetze.length), [plaetze.length])
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
            const schnitt = letzte ? Math.max(0, Math.min(...karte.plaetze.slice(0, anzahl).map(([, y]) => y)) - karte.h * 0.21) : 0
            const hoehe = karte.h - schnitt
            return (
            <section key={start} className={letzte && schnitt > 0 ? 'insel ende' : 'insel'} style={{ zIndex: teile.length - k, aspectRatio: `${karte.w} / ${hoehe}` }}>
              <img className="insel-bg" src={karte.bild} alt="" draggable={false} style={{ marginTop: `${(-schnitt / karte.w) * 100}cqw` }} />
              {karte.plaetze.map(([x, y], i) => {
                const s = plaetze[start + i]
                const pos = { left: `${(x / karte.w) * 100}%`, top: `${((y - schnitt) / hoehe) * 100}%` }
                if (!s) return null
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

/** Erfolgsburg am Ende einer Welt: Ziel der Welt, nach dem Abschluss mit goldenen Fahnen. */
function ErfolgsBurg({ burg }: { burg: Burg }) {
  const fahne = burg.geschafft ? '#FFC531' : '#FF4D6D'
  return (
    <div className={burg.geschafft ? 'erfolgsburg geschafft' : 'erfolgsburg'} role="img" aria-label={`Welt ${burg.welt} – Ziel: ${burg.name}${burg.geschafft ? ' (geschafft)' : ''}`}>
      <svg viewBox="0 0 160 150" aria-hidden="true">
        <defs>
          <linearGradient id="bg-wand" x1="0" x2="1"><stop offset="0" stopColor="#FBF5EA" /><stop offset=".55" stopColor="#EFE5D2" /><stop offset=".56" stopColor="#D9CBB2" /><stop offset="1" stopColor="#C9B999" /></linearGradient>
          <linearGradient id="bg-dach" x1="0" x2="1"><stop offset="0" stopColor="#9B82FF" /><stop offset=".5" stopColor="#7B5CFF" /><stop offset=".51" stopColor="#5B3BD6" /><stop offset="1" stopColor="#4A2EB8" /></linearGradient>
          <radialGradient id="bg-glanz"><stop offset="0" stopColor="#FFE58A" stopOpacity=".9" /><stop offset="1" stopColor="#FFE58A" stopOpacity="0" /></radialGradient>
        </defs>
        {burg.geschafft && <circle cx="80" cy="70" r="78" fill="url(#bg-glanz)" />}
        <ellipse cx="80" cy="138" rx="74" ry="12" fill="#3E8D33" /><ellipse cx="80" cy="134" rx="70" ry="10" fill="#6CC456" />
        <ellipse cx="80" cy="140" rx="60" ry="5" fill="rgba(0,0,0,.18)" />
        <rect x="14" y="48" width="30" height="86" rx="2" fill="url(#bg-wand)" /><rect x="116" y="48" width="30" height="86" rx="2" fill="url(#bg-wand)" />
        <path d="M14 70h30M14 92h30M14 114h30M116 70h30M116 92h30M116 114h30" stroke="#BFAE90" strokeWidth="1.4" />
        <path d="M10 50 L29 8 L48 50Z" fill="url(#bg-dach)" /><path d="M112 50 L131 8 L150 50Z" fill="url(#bg-dach)" />
        <rect x="40" y="68" width="80" height="66" fill="url(#bg-wand)" />
        <path d="M40 68h10v-9h10v9h10v-9h10v9h10v-9h10v9h10v-9h10v9" fill="#EDE2CC" stroke="#CDBD9F" strokeWidth="1" />
        <path d="M40 90h80M40 112h80M60 68v22M100 68v22M50 90v22M80 90v22M110 90v22" stroke="#CDBD9F" strokeWidth="1.2" />
        <rect x="58" y="32" width="44" height="40" fill="url(#bg-wand)" />
        <path d="M52 34 L80 -6 L108 34Z" fill="url(#bg-dach)" />
        <path d="M64 134v-26a16 16 0 0132 0v26z" fill="#6E4520" /><path d="M68 134v-25a12 12 0 0124 0v25z" fill="#9A6634" /><path d="M80 98v36M70 116h20" stroke="#6E4520" strokeWidth="2" /><circle cx="86" cy="120" r="2" fill="#FFC531" />
        <rect x="23" y="62" width="12" height="18" rx="6" fill="#2B4E9E" /><rect x="125" y="62" width="12" height="18" rx="6" fill="#2B4E9E" /><rect x="74" y="42" width="12" height="20" rx="6" fill="#2B4E9E" />
        <rect x="25" y="64" width="4" height="8" rx="2" fill="#7FB2FF" /><rect x="127" y="64" width="4" height="8" rx="2" fill="#7FB2FF" /><rect x="76" y="44" width="4" height="9" rx="2" fill="#7FB2FF" />
        <path d="M29 8v-13M131 8v-13M80 -6v-16" stroke="#5A3818" strokeWidth="2.4" strokeLinecap="round" />
        <path d={`M29 -5l15 4-15 5z M131 -5l15 4-15 5z M80 -22l18 5-18 6z`} fill={fahne} />
      </svg>
      <span className="erfolgsburg-schild"><small>Welt {burg.welt} · Ziel</small>{burg.geschafft ? 'Geschafft!' : burg.name}</span>
    </div>
  )
}
