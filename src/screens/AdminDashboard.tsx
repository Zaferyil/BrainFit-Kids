import { AdminLayout } from '../components/AdminLayout'
import { Link } from '../components/Link'
import { Icon, type IconName } from '../components/Icon'
import { Avatar, type AvatarLook } from '../components/Avatar'

const kpis = [
  ['Schüler gesamt', '128', '+6 diesen Monat'], ['Heute aktiv', '46', '36 % aller Kinder'],
  ['Ø Genauigkeit', '88 %', '+2 Pkt. zur Vorwoche'], ['Einheiten diese Woche', '412', '+58 zur Vorwoche'],
]

const classes: [string, string, number, string, number][] = [
  ['LINZ-7K', 'Frau Berger', 18, 'Welt 2', 89], ['LINZ-3M', 'Herr Aydin', 16, 'Welt 3', 81], ['ONLINE-A', 'Frau Berger', 24, 'Welt 1', 74],
  ['ONLINE-B', 'Frau Novak', 22, 'Welt 5', 68], ['LINZ-1S', 'Herr Aydin', 14, 'Welt 1', 57],
]

const help: (AvatarLook & { name: string; why: string })[] = [
  { name: 'Noah K. · LINZ-1S', why: 'Big Friends +6: 48 % · 3 Versuche', hat: 'none', shirt: '#A06BFF', hair: '#231A4F', skin: '#7A4A2E' },
  { name: 'Mia S. · ONLINE-A', why: 'Seit 9 Tagen nicht aktiv', hat: 'crown', shirt: '#FF4D6D', hair: '#C2410C', skin: '#F6C9A6' },
  { name: 'Can D. · LINZ-7K', why: 'Kopfrechnen: 52 %, mit Abakus 93 %', hat: 'cap', hatColor: '#3BA7FF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' },
]

const rules: [string, number][] = [['Best Friends −8', 61], ['Big Friends −6', 68], ['Best Friends +7', 71], ['Little Friends −3', 74], ['Big Friends +7', 78]]

const feed: [string, IconName, string, string][] = [
  ['Lena H. hat Boss „Perlenland" besiegt', 'trophy', '#FFE59A', 'vor 12 Min.'],
  ['Jonas P. erreicht den gelben Gürtel', 'medal', '#BFEBC9', 'vor 40 Min.'],
  ['Neue Klasse ONLINE-B angelegt', 'users', '#E4DFFF', 'vor 2 Std.'],
  ['Elif T. hat 7-Tage-Feuer', 'flame', '#FFC7A3', 'vor 3 Std.'],
  ['3 Eltern haben die Einladung angenommen', 'mail', '#D6ECFF', 'gestern'],
]

export function AdminDashboard() {
  return (
    <AdminLayout active="Dashboard" gap={20}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, lineHeight: 1.1 }}>Guten Tag, Zafer</h1>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)' }}>Sonntag, 25. Oktober 2026</div>
        </div>
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#fff', border: '2px solid var(--border)', minWidth: 240 }}>
          <Icon name="search" size={18} color="#5A5094" />
          <span className="sr-only">Suche</span>
          <input type="search" placeholder="Schüler suchen …" style={{ border: 0, outline: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: 'var(--ink)', width: '100%', background: 'transparent' }} />
        </label>
        <Link to="/admin/schueler" className="btn-primary" style={{ padding: '11px 16px', fontSize: 15 }}>
          <Icon name="plus" size={18} sw={2.8} color="#fff" />
          Neuer Schüler
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {kpis.map(([l, v, s]) => (
          <div key={l} className="panel" style={{ borderRadius: 18, padding: '16px 18px' }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink-soft)' }}>{l}</div>
            <div className="display" style={{ fontSize: 34, lineHeight: 1.1, marginTop: 4 }}>{v}</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--green-d)' }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <section className="panel sm" style={{ flex: '999 1 480px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Klassen</h2>
            <Link to="/admin/schueler" style={{ fontWeight: 900, fontSize: 14 }}>Alle anzeigen</Link>
          </div>
          <div style={{ overflowX: 'auto', marginTop: 10 }}>
            <table className="table" style={{ minWidth: 520 }}>
              <thead><tr><th>Klasse</th><th>Lehrkraft</th><th>Kinder</th><th>Ø Welt</th><th>Aktiv (7 Tage)</th></tr></thead>
              <tbody>
                {classes.map(([name, teacher, kids, world, active]) => (
                  <tr key={name}>
                    <td style={{ padding: '10px 6px', fontWeight: 900 }}>{name}</td>
                    <td>{teacher}</td>
                    <td>{kids}</td>
                    <td>{world}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="track" style={{ width: 90, height: 8 }}>
                          <div style={{ width: `${active}%`, background: active >= 75 ? 'var(--green)' : active >= 60 ? 'var(--yellow)' : 'var(--orange)' }} />
                        </div>
                        <span style={{ fontWeight: 800 }}>{active} %</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel sm" style={{ flex: '1 1 300px', background: '#fff5f7', borderColor: '#f5c9d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="alert" size={22} color="#A3123A" />
            <h2>Brauchen Hilfe</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {help.map(({ name, why, ...look }) => (
              <Link key={name} to="/admin/schueler/lena" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: '#fff', textDecoration: 'none', color: 'var(--ink)' }}>
                <Avatar size={40} {...look} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{name}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>{why}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <section className="panel sm" style={{ flex: '1 1 380px' }}>
          <h2>Schwierigste Regeln diese Woche</h2>
          <p style={{ margin: '2px 0 12px', fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>Genauigkeit über alle Klassen – gut für die nächste Kursstunde</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rules.map(([n, v]) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 44px', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 900, fontSize: 14 }}>{n}</span>
                <div className="track"><div style={{ width: `${v}%`, background: v < 70 ? 'var(--orange)' : 'var(--yellow)' }} /></div>
                <span style={{ fontWeight: 900, fontSize: 14, textAlign: 'right' }}>{v} %</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel sm" style={{ flex: '1 1 380px' }}>
          <h2 style={{ marginBottom: 10 }}>Neueste Aktivität</h2>
          <div>
            {feed.map(([text, icon, bg, t]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: '2px solid #f1eff8' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg }}>
                  <Icon name={icon} size={16} sw={2.6} />
                </div>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{text}</span>
                <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--ink-soft)' }}>{t}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
