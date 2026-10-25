import type { ReactNode } from 'react'
import { Link } from './Link'
import { Icon } from './Icon'

const nav = [
  { id: 'uebersicht', label: 'Übersicht', to: '/eltern/uebersicht' },
  { id: 'bericht', label: 'Lernbericht', to: '/eltern/bericht' },
  { id: 'einstellungen', label: 'Einstellungen', to: '/eltern/einstellungen' },
]

type Props = { active: string; bell?: boolean; maxWidth?: number; children: ReactNode }

export function ParentLayout({ active, bell, maxWidth = 1180, children }: Props) {
  return (
    <div className="page">
      <header className="topnav">
        <div className="topnav-in">
          <Link to="/" className="logo">
            <div className="logo-mark"><Icon name="pearl" size={22} sw={2.4} /></div>
            <span className="display" style={{ fontSize: 21 }}>Abakus Akademie</span>
          </Link>
          <nav aria-label="Eltern-Navigation">
            {nav.map((n) => (
              <Link key={n.id} to={n.to} className={n.id === active ? 'on' : undefined}>{n.label}</Link>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {bell && (
              <button type="button" aria-label="Benachrichtigungen" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Icon name="bell" size={20} color="#5A5094" />
              </button>
            )}
            <span style={{ fontWeight: 800, fontSize: 15 }}>Sabine Huber</span>
          </div>
        </div>
      </header>
      <main style={{ maxWidth, margin: '0 auto', padding: '28px 24px 40px', display: 'flex', flexDirection: 'column', gap: maxWidth === 1180 ? 20 : 18 }}>
        {children}
      </main>
    </div>
  )
}
