import { Avatar } from './Avatar'
import { Icon, type IconName } from './Icon'

type Props = {
  name?: string
  level?: number
  xp?: number
  perlen?: string
  gems?: string
  streak?: string
}

function Chip({ icon, color, fill, children }: { icon: IconName; color: string; fill: string; children: string }) {
  return (
    <div className="chip">
      <Icon name={icon} color={color} fill={fill} size={26} />
      <span>{children}</span>
    </div>
  )
}

export function TopBar({ name = 'Lena', level = 7, xp = 64, perlen = '1.240', gems = '18', streak = '9' }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-player">
        <div className="topbar-avatar">
          <Avatar size={56} hat="cap" hatColor="#FF4D6D" shirt="#3BA7FF" belt="#F2F0FF" />
        </div>
        <div className="topbar-info">
          <div className="topbar-name">
            <span>{name}</span>
            <span className="topbar-level">Level {level}</span>
          </div>
          <div className="xp-track"><div className="xp-fill" style={{ width: `${xp}%` }} /></div>
        </div>
      </div>
      <div className="topbar-chips">
        <Chip icon="flame" color="#FF8A1F" fill="#FF8A1F">{streak}</Chip>
        <Chip icon="pearl" color="#DE9800" fill="#FFC531">{perlen}</Chip>
        <Chip icon="gem" color="#3BA7FF" fill="#9BD3FF">{gems}</Chip>
        <button type="button" className="round-btn" aria-label="Einstellungen">
          <Icon name="settings" color="#C9C0FF" size={26} />
        </button>
      </div>
    </header>
  )
}
