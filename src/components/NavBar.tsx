import { Icon, type IconName } from './Icon'

export type NavId = 'karte' | 'denkpark' | 'anzan' | 'pokale' | 'garderobe'

// Schwebende Menüleiste unten (neuer Look): fünf runde Knöpfe, der aktive ist violett.
const items: { id: NavId; label: string; icon: IconName }[] = [
  { id: 'karte', label: 'Abenteuer', icon: 'home' },
  { id: 'denkpark', label: 'Denkspiele', icon: 'bolt' },
  { id: 'anzan', label: 'Anzan', icon: 'brain' },
  { id: 'pokale', label: 'Pokale', icon: 'trophy' },
  { id: 'garderobe', label: 'Ich', icon: 'user' },
]

export function NavBar({ active = 'karte' }: { active?: NavId }) {
  return (
    <nav aria-label="Hauptnavigation" className="nk-nav">
      {items.map((it) => {
        const on = it.id === active
        return (
          <a key={it.id} href={`#/${it.id}`} className={on ? 'active' : ''} aria-current={on ? 'page' : undefined} aria-label={it.label}>
            <Icon name={it.icon} size={26} color={on ? '#FFFFFF' : '#8A82B5'} strokeWidth={2.4} />
            <span>{it.label}</span>
          </a>
        )
      })}
    </nav>
  )
}
