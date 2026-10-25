import { Avatar } from './Avatar'
import { Icon } from './Icon'

const chip = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 8px 10px', borderRadius: 999, background: 'var(--panel)',
  fontWeight: 900, fontSize: 20,
} as const

type Props = { name?: string; level?: number; xp?: number; perlen?: string; gems?: string; streak?: string }

export function TopBar({ name = 'Lena', level = 7, xp = 64, perlen = '1.240', gems = '18', streak = '9' }: Props) {
  return (
    <div style={{ position: 'relative', height: 96, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ padding: 3, borderRadius: '50%', background: 'var(--yellow)' }}>
          <Avatar size={56} hat="cap" hatColor="#FF4D6D" shirt="#3BA7FF" belt="#F2F0FF" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="display" style={{ fontSize: 24, lineHeight: 1 }}>{name}</span>
            <span style={{ padding: '2px 10px', borderRadius: 999, background: 'var(--purple)', fontWeight: 900, fontSize: 14 }}>Level {level}</span>
          </div>
          <div style={{ width: 180, height: 10, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
            <div style={{ width: `${xp}%`, height: '100%', borderRadius: 999, background: 'var(--green)' }} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={chip}><Icon name="flame" size={26} color="#FF8A1F" fill="#FF8A1F" />{streak}</div>
        <div style={chip}><Icon name="pearl" size={26} color="#DE9800" fill="#FFC531" />{perlen}</div>
        <div style={chip}><Icon name="gem" size={26} color="#3BA7FF" fill="#9BD3FF" />{gems}</div>
        <button type="button" aria-label="Einstellungen" className="round-btn" style={{ width: 52, height: 52 }}>
          <Icon name="settings" size={26} color="#C9C0FF" />
        </button>
      </div>
    </div>
  )
}
