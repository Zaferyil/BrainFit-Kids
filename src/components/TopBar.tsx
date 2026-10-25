import { useState, type ComponentProps } from 'react'
import { Avatar } from './Avatar'
import { Bead } from './Bead'
import { Icon } from './Icon'

type Props = {
  name?: string
  level?: number
  /** Fortschritt bis zum nächsten Level, 0–100 */
  xp?: number
  perlen?: number
  gems?: number
  streak?: number
  avatar?: Omit<ComponentProps<typeof Avatar>, 'size'>
  onLogout?: () => void
}

const fmt = (n: number) => n.toLocaleString('de-DE')

export function TopBar({
  name = 'Lena', level = 7, xp = 64, perlen = 1240, gems = 18, streak = 9,
  avatar = { hat: 'cap', hatColor: '#FF4D6D', shirt: '#3BA7FF' }, onLogout,
}: Props) {
  const [menu, setMenu] = useState(false)
  return (
    <header className="topbar">
      <div className="topbar-player">
        <div className="topbar-avatar">
          <Avatar size={56} {...avatar} />
        </div>
        <div className="topbar-info">
          <div className="topbar-name">
            <span>{name}</span>
            <span className="topbar-level">Level {level}</span>
          </div>
          <div className="xp-track" role="progressbar" aria-label="Fortschritt bis zum nächsten Level" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={100}>
            <div className="xp-fill" style={{ width: `${xp}%` }} />
          </div>
        </div>
      </div>
      <div className="topbar-chips">
        <div className="chip" aria-label={`Tagesserie: ${streak} Tage`}>
          <Icon name="flame" color="#FF8A1F" fill="#FF8A1F" size={26} />
          <span>{fmt(streak)}</span>
        </div>
        <div className="chip" aria-label={`${perlen} Perlen`}>
          <Bead color="yellow" width={30} />
          <span>{fmt(perlen)}</span>
        </div>
        <div className="chip" aria-label={`${gems} Diamanten`}>
          <Icon name="gem" color="#3BA7FF" fill="#9BD3FF" size={26} />
          <span>{fmt(gems)}</span>
        </div>
        <div className="topbar-menu">
          <button type="button" className="round-btn" aria-label="Einstellungen" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <Icon name="settings" color="#C9C0FF" size={26} />
          </button>
          {menu && (
            <div className="menu-pop">
              <button type="button" onClick={() => { setMenu(false); onLogout?.() }}>
                <Icon name="logout" color="#231A4F" size={22} />
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
