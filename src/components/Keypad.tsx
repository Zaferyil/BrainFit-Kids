import { Icon } from './Icon'

type Props = {
  onDigit: (d: string) => void
  onDelete: () => void
  onClear: () => void
}

/** Zahlen-Tasten wie im „Üben“-Bildschirm (3 Spalten). */
export function Keypad({ onDigit, onDelete, onClear }: Props) {
  const labels = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', 'del']
  return (
    <section aria-label="Zahlen-Tasten" style={{ width: 300, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, alignContent: 'start' }}>
      {labels.map((l) => {
        const alt = l === 'C' || l === 'del'
        return (
          <button
            key={l} type="button" className={`key${alt ? ' alt' : ''}`}
            aria-label={l === 'del' ? 'Löschen' : l === 'C' ? 'Alles löschen' : `Zahl ${l}`}
            onClick={() => (l === 'del' ? onDelete() : l === 'C' ? onClear() : onDigit(l))}
            style={{ height: 100, borderRadius: 26, fontSize: 44 }}
          >
            {l === 'del' ? <Icon name="del" size={34} /> : l}
          </button>
        )
      })}
    </section>
  )
}
