import { konto } from '../lib/wirtschaft'
import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { SeZa } from '../components/SeZa'
import { Stage } from '../components/Stage'
import { WORLDS } from '../data/curriculum'
import type { Kid } from '../data/demo'
import type { Progress } from '../lib/progress'
import { Funkeln } from './Anmelden'

// Startseite im neuen Look: ein leuchtender Planet zeigt die nächste Station,
// ein einziger großer Knopf führt zur Inselkarte (#/inseln).

type Props = { kid: Kid; progress: Progress; onLogout: () => void }

export function Zuhause({ kid, progress, onLogout }: Props) {
  const [menu, setMenu] = useState(false)
  const world = WORLDS[progress.world - 1] ?? WORLDS[0]



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
          <a href="#/seza" className="nk-chip" aria-label="Sterne – zu Mein SeZa"><Icon name="star" color="#E0A100" fill="#FFC531" size={20} />{konto(kid.id).sterne}</a>
          {menu && (
            <div className="nk-menu popin">
              <button type="button" onClick={onLogout}><Icon name="logout" color="#2B2257" size={20} />Abmelden</button>
            </div>
          )}
        </header>

        <div className="zh-buehne">
          <span className="zh-op plus">+</span><span className="zh-op minus">−</span>
          <span className="zh-op mal">×</span><span className="zh-op geteilt">÷</span>
          <span className="zh-ring" />
          <a href="#/seza" className="zh-perli" aria-label="Mein SeZa – anziehen"><SeZa kidId={kid.id} groesse={170} /><span className="zh-anziehen">✏️ Anziehen</span></a>
          <span className="zh-podest" />
        </div>

        <a href="#/inseln" className="zh-los" aria-label="Los geht’s – zur Karte">
          <Icon name="play" color="#2B1A7A" fill="#2B1A7A" size={58} />
          <span>Los geht’s</span>
        </a>
      </div>
      <NavBar active="karte" />
    </Stage>
  )
}
