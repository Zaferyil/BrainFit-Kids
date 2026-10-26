import { Icon, type IconName } from './Icon'

export type NavId = 'karte' | 'denkpark' | 'shop' | 'garderobe' | 'pokale'

const items: { id: NavId; label: string; icon: IconName }[] = [
  { id: 'karte', label: 'Karte', icon: 'map' },
  { id: 'denkpark', label: 'Denk-Park', icon: 'brain' },
  { id: 'shop', label: 'Shop', icon: 'bag' },
  { id: 'garderobe', label: 'Garderobe', icon: 'shirt' },
  { id: 'pokale', label: 'Pokale', icon: 'trophy' },
]

export function NavBar({ active = 'karte' }: { active?: NavId }) {
  return (
    <nav aria-label="Hauptnavigation" className="navbar">
      {items.map((it) => {
        const on = it.id === active
        return (
          <a key={it.id} href={`#/${it.id}`} className={on ? 'navbar-item active' : 'navbar-item'} aria-current={on ? 'page' : undefined}>
            <Icon name={it.icon} size={30} color={on ? '#231A4F' : '#6B61A8'} strokeWidth={on ? 2.6 : 2.2} />
            <span>{it.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
