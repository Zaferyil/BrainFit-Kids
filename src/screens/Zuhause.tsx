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
// Perlen darunter den Fortschritt in der aktuellen Welt. Der Planet führt zur Inselkarte (#/inseln).

type Props = { kid: Kid; progress: Progress; onLogout: () => void }
type Stop = Exclude<MapStop, { kind: 'world' }>

export function Zuhause({ kid, progress, onLogout }: Props) {
  const [menu, setMenu] = useState(false)
  const path = useMemo(() => buildPath(kid, progress), [kid, progress])
  const stops = path.filter((s): s is Stop => s.kind !== 'world')
  const current = stops.find((s) => s.state === 'current')
  const world = WORLDS[progress.world - 1] ?? WORLDS[0]


  const title = !current ? 'Alles geschafft!' : current.kind === 'unit' ? current.name : current.kind === 'game' ? current.game.name : 'Perli kennenlernen'
  const href = !current ? '#/inseln' : current.kind === 'unit' ? '#/einheit' : current.kind === 'game' ? `#/spiel/${current.game.id}` : '#/einstufung'

  return (
    <Stage className="nk" background="linear-gradient(180deg, #4B2FC2 0%, #7B5CFF 38%, #FF9AC8 78%, #FFD27A 100%)">
      <Funkeln />
      <div className="nk-home">
        <header className="nk-hello">
          <button type="button" className="nk-zurueck" aria-label="Zurück zur Startseite" onClick={onLogout}>
            <Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} />
          </button>
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

        <div className="zh-buehne" aria-hidden="true">
          <span className="zh-op plus">+</span><span className="zh-op minus">−</span>
          <span className="zh-op mal">×</span><span className="zh-op geteilt">÷</span>
          <span className="zh-ring" />
          <span className="zh-perli"><Perli mood="happy" size={170} /></span>
          <span className="zh-podest" />
        </div>

        {current && (
          <a href="#/inseln" className="zh-wolke" aria-label="Zur Karte">
            <small>{current.kind === 'game' ? 'Denkspiel' : current.kind === 'start' ? 'Einstufung' : `Welt ${world.n} · ${world.name}`}</small>
            <strong>{title}</strong>
          </a>
        )}

        <a href={href} className="zh-los" onClick={() => { if (current?.kind === 'game') startStop(current.id) }}>
          <Icon name="play" color="#2B1A7A" fill="#2B1A7A" size={58} />
          <span>Los geht’s</span>
        </a>
      </div>
      <NavBar active="karte" />
    </Stage>
  )
}
