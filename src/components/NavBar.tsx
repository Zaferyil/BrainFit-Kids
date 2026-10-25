import { Link } from './Link'
import { Icon, type IconName } from './Icon'

const items: { id: string; label: string; icon: IconName; to: string }[] = [
  { id: 'karte', label: 'Karte', icon: 'map', to: '/karte' },
  { id: 'shop', label: 'Shop', icon: 'bag', to: '/shop' },
  { id: 'garderobe', label: 'Garderobe', icon: 'shirt', to: '/garderobe' },
  { id: 'rangliste', label: 'Rangliste', icon: 'crown', to: '/rangliste' },
  { id: 'pokale', label: 'Pokale', icon: 'trophy', to: '/pokale' },
]

type Props = { active: string }

export function NavBar({ active }: Props) {
  return (
    <nav
      aria-label="Hauptnavigation"
      style={{
        position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)', width: 640, height: 88, padding: 8,
        borderRadius: 30, background: '#fff', display: 'flex', gap: 6, boxShadow: '0 8px 0 var(--shadow-soft)',
      }}
    >
      {items.map((it) => {
        const on = it.id === active
        return (
          <Link
            key={it.id} to={it.to} aria-current={on ? 'page' : undefined}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              borderRadius: 22, fontWeight: 900, fontSize: 14,
              background: on ? 'var(--yellow)' : undefined, color: on ? 'var(--ink)' : '#5a5094',
            }}
          >
            <Icon name={it.icon} size={30} color={on ? '#231a4f' : '#6b61a8'} sw={on ? 2.6 : 2.2} />
            <span>{it.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
