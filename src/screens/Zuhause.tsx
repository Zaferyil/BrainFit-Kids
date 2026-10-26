import { useMemo, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { WORLDS } from '../data/curriculum'
import type { Kid } from '../data/demo'
import { buildPath, startStop, type MapStop } from '../lib/mapPath'
import type { Progress } from '../lib/progress'
import { Funkeln } from './Anmelden'

// Startseite im neuen Look: ein leuchtender Planet zeigt die nächste Station,
// Perlen darunter den Fortschritt in der aktuellen Welt. Der Planet führt zur Perlen-Galaxie.

type Props = { kid: Kid; progress: Progress; onLogout: () => void }
type Stop = Exclude<MapStop, { kind: 'world' }>

const PLANET = ['#FFE58A, #FF9F1C', '#A8F0B8, #2ECC8F', '#CDE8FF, #3BA7FF', '#FFD0E4, #FF4F9A']

export function Zuhause({ kid, progress, onLogout }: Props) {
  const [menu, setMenu] = useState(false)
  const path = useMemo(() => buildPath(kid, progress), [kid, progress])
  const stops = path.filter((s): s is Stop => s.kind !== 'world')
  const current = stops.find((s) => s.state === 'current')
  const world = WORLDS[progress.world - 1] ?? WORLDS[0]

  // Perlen der aktuellen Welt: die Stationen zwischen ihrem Banner und dem nächsten
  const from = path.findIndex((s) => s.kind === 'world' && s.world.n === world.n)
  const to = path.findIndex((s, i) => i > from && s.kind === 'world')
  const beads = path.slice(from + 1, to === -1 ? undefined : to).filter((s): s is Stop => s.kind !== 'world')
  const done = beads.filter((s) => s.state === 'done').length

  const title = !current ? 'Alles geschafft!' : current.kind === 'unit' ? current.name : current.kind === 'game' ? current.game.name : 'Perli kennenlernen'
  const kind = !current ? '' : current.kind === 'game' ? 'Denkspiel' : current.kind === 'start' ? 'Einstufung' : `Welt ${world.n} · ${world.name}`
  const href = !current ? '#/galaxie' : current.kind === 'unit' ? '#/einheit' : current.kind === 'game' ? `#/spiel/${current.game.id}` : '#/einstufung'
  const next = WORLDS.slice(world.n, world.n + 3)

  return (
    <Stage className="nk" background="linear-gradient(180deg, #4B2FC2 0%, #7B5CFF 38%, #FF9AC8 78%, #FFD27A 100%)">
      <Funkeln />
      <div className="nk-home">
        <header className="nk-hello">
          <button type="button" className="nk-me" aria-label="Mein Menü" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <Avatar size={52} {...kid.avatar} />
          </button>
          <div className="nk-hello-text">
            <strong>Hallo {kid.name}!</strong>
            <span>Gürtel: {world.belt.replace(/en$/, '')} · Level {progress.level}</span>
          </div>
          <span className="nk-chip"><Icon name="star" color="#E0A100" fill="#FFC531" size={20} />{progress.perlen}</span>
          {menu && (
            <div className="nk-menu popin">
              <button type="button" onClick={onLogout}><Icon name="logout" color="#2B2257" size={20} />Abmelden</button>
            </div>
          )}
        </header>

        <div className="nk-orbit" aria-hidden="true">
          {next.map((w, i) => (
            <span key={w.n} className={`nk-mini m${i}`} style={{ background: `radial-gradient(circle at 35% 30%, ${PLANET[i % PLANET.length]} 70%)` }}>
              <Icon name="lock" color="rgba(0,0,0,.45)" size={20} strokeWidth={2.6} />
            </span>
          ))}
        </div>

        <a href="#/galaxie" className="nk-planet" aria-label={`Zur Perlen-Galaxie. Nächste Station: ${title}`}>
          <Perli mood="happy" size={92} />
          <span className="nk-planet-kind">{kind}</span>
          <span className="nk-planet-title">{title}</span>
        </a>

        <ol className="nk-beads" aria-label={`${done} von ${beads.length} Stationen in dieser Welt geschafft`}>
          {beads.map((s) => <li key={s.id} className={s.state} />)}
        </ol>

        <a href={href} className="nk-btn yellow big nk-go" onClick={() => { if (current?.kind === 'game') startStop(current.id) }}>
          <Icon name="play" color="#2B2257" fill="#2B2257" size={24} />
          Los geht’s
        </a>
      </div>
      <NavBar active="karte" />
    </Stage>
  )
}
