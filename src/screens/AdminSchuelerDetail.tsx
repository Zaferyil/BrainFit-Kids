import { AdminLayout } from '../components/AdminLayout'
import { Link } from '../components/Link'
import { Avatar } from '../components/Avatar'

const stats = [['Level', '7'], ['Perlen', '1.240'], ['Serie', '9 Tage'], ['Genauigkeit', '91 %']]
const counts = [3, 5, 3, 3, 5, 3, 3, 2, 2]
const DONE = 4
const rules: [string, number][] = [['Big Friends +9', 96], ['Big Friends +8', 94], ['Big Friends +6', 81], ['Big Friends +7', 72], ['Kopfrechnen', 78]]
const sessions = [
  ['25.10.', 'Üben mit Abakus · +7/+6', '9 / 10', '4,2 s', '★★★'],
  ['24.10.', 'Entdecken · +7/+6', '–', '–', '★★'],
  ['23.10.', 'Video · +7/+6', '–', '–', '★★★'],
  ['22.10.', 'Boss · Big Friends +9/+8', '6 / 6', '3,6 s', '★★★'],
  ['21.10.', 'Kopfrechnen · +9/+8', '7 / 8', '5,1 s', '★★'],
]

// Lernpfad: je Welt eine Reihe Kästchen; fortlaufend gezählt
let unit = 0
const path = counts.map((c) => Array.from({ length: c }, () => unit++))

const unitColor = (i: number) => (i < DONE ? 'var(--green)' : i === DONE ? 'var(--yellow)' : 'var(--border)')

export function AdminSchuelerDetail() {
  return (
    <AdminLayout active="Schüler & Klassen" gap={18} paddingTop={22}>
      <nav aria-label="Brotkrumen" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontWeight: 800, fontSize: 14, color: 'var(--ink-soft)' }}>
        <Link to="/admin/schueler">Schüler &amp; Klassen</Link><span>›</span><Link to="/admin/schueler">LINZ-7K</Link><span>›</span><span style={{ color: 'var(--ink)' }}>Lena Huber</span>
      </nav>

      <section className="panel" style={{ padding: '18px 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
        <Avatar size={84} hat="cap" hatColor="#FF4D6D" shirt="#3BA7FF" belt="#F2F0FF" />
        <div style={{ flex: '1 1 240px' }}>
          <h1 className="display" style={{ fontSize: 32, lineHeight: 1.1 }}>Lena Huber</h1>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)' }}>8 Jahre · LINZ-7K · Spitzname „SternLena" · dabei seit 1. Sept. 2026</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--page)', fontWeight: 800, fontSize: 13 }}>Gürtel: Weiß</span>
            <span style={{ padding: '4px 10px', borderRadius: 999, background: '#ddf7e3', color: 'var(--green-ink)', fontWeight: 800, fontSize: 13 }}>Eltern verbunden: Sabine Huber</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(90px, 1fr))', gap: 10, flex: '1 1 420px' }}>
          {stats.map(([l, v]) => (
            <div key={l} style={{ padding: '10px 12px', borderRadius: 14, background: 'var(--page)' }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--ink-soft)' }}>{l}</div>
              <div className="display" style={{ fontSize: 24, lineHeight: 1.1 }}>{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel sm">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
          <h2>Lernpfad: {DONE} von {counts.reduce((a, b) => a + b, 0)} Einheiten</h2>
          <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)' }}>Grün = geschafft · Gelb = aktuell · Grau = offen</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 14 }}>
          {path.map((units, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {units.map((u) => <div key={u} style={{ width: 26, height: 26, borderRadius: 7, background: unitColor(u) }} />)}
              </div>
              <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--ink-soft)' }}>Welt {wi + 1}</span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <section className="panel sm" style={{ flex: '1 1 280px' }}>
          <h2 style={{ marginBottom: 12 }}>Genauigkeit je Regel</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rules.map(([n, v]) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: 10, alignItems: 'center' }}>
                <span style={{ fontWeight: 900, fontSize: 14 }}>{n}</span>
                <div className="track"><div style={{ width: `${v}%`, background: v >= 90 ? 'var(--green)' : v >= 75 ? 'var(--yellow)' : 'var(--orange)' }} /></div>
                <span style={{ fontWeight: 900, fontSize: 14, textAlign: 'right' }}>{v} %</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel sm" style={{ flex: '999 1 460px' }}>
          <h2 style={{ marginBottom: 6 }}>Letzte Sitzungen</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 480 }}>
              <thead><tr><th>Datum</th><th>Station</th><th>Richtig</th><th>Ø Zeit</th><th>Sterne</th></tr></thead>
              <tbody>
                {sessions.map(([d, st, r, t, s]) => (
                  <tr key={d}>
                    <td style={{ color: 'var(--ink-soft)' }}>{d}</td>
                    <td style={{ fontWeight: 800 }}>{st}</td>
                    <td>{r}</td>
                    <td>{t}</td>
                    <td style={{ fontWeight: 900, color: '#a66b00' }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="panel sm" style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        <label style={{ flex: '999 1 380px', display: 'flex', flexDirection: 'column', gap: 8, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 19 }}>
          Notiz an die Eltern
          <textarea className="field" rows={3} defaultValue="Lena hat diese Woche toll mitgemacht. Bitte zuhause 2–3 Mal das Blitz-Training zu +7 wiederholen." style={{ borderRadius: 14, fontSize: 15, fontWeight: 600, resize: 'vertical' }} />
        </label>
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 19 }}>
            Übungsset zuweisen
            <select className="field" style={{ padding: 12, fontSize: 15 }}>
              <option>Big Friends +7 – 20 Blitz-Aufgaben</option>
              <option>Big Friends +6 – 15 Abakus-Aufgaben</option>
              <option>Kopfrechnen Mix Welt 2</option>
            </select>
          </label>
          <button type="button" className="btn-primary" style={{ justifyContent: 'center', padding: 12, fontSize: 15 }}>Speichern und senden</button>
        </div>
      </section>
    </AdminLayout>
  )
}
