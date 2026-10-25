import type { ReactNode } from 'react'
import { Link } from './Link'
import { Icon, type IconName } from './Icon'

const nav: { label: string; icon: IconName; to: string }[] = [
  { label: 'Dashboard', icon: 'chart', to: '/admin' },
  { label: 'Schüler & Klassen', icon: 'users', to: '/admin/schueler' },
  { label: 'Lerninhalte', icon: 'book', to: '/admin/inhalte' },
  { label: 'Shop & Belohnungen', icon: 'gift', to: '/admin/shop' },
  { label: 'Berichte', icon: 'bars', to: '/admin/schueler/lena' },
  { label: 'Einstellungen', icon: 'settings', to: '/admin' },
]

type Props = { active: string; gap?: number; paddingTop?: number; children: ReactNode }

export function AdminLayout({ active, gap = 18, paddingTop = 26, children }: Props) {
  return (
    <div className="page" style={{ display: 'flex', flexWrap: 'wrap' }}>
      <aside className="sidebar">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 18px', color: '#fff', textDecoration: 'none' }}>
          <div className="logo-mark"><Icon name="pearl" size={22} sw={2.4} /></div>
          <div>
            <div className="display" style={{ fontSize: 19, lineHeight: 1 }}>Abakus Akademie</div>
            <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Admin-Bereich</div>
          </div>
        </Link>
        <nav aria-label="Admin-Navigation">
          {nav.map((n) => {
            const on = n.label === active
            return (
              <Link key={n.label} to={n.to} className={on ? 'on' : undefined}>
                <Icon name={n.icon} size={20} color={on ? '#231A4F' : '#C9C0FF'} />
                {n.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px 0', borderTop: '1px solid var(--line)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>ZY</div>
          <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>Zafer Y.<br /><span style={{ color: 'var(--muted)', fontSize: 12 }}>Administrator</span></div>
        </div>
      </aside>
      <main style={{ flex: '999 1 560px', minWidth: 0, padding: `${paddingTop}px 28px 40px`, display: 'flex', flexDirection: 'column', gap }}>
        {children}
      </main>
    </div>
  )
}
