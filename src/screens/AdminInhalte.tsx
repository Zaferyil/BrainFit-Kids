import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { Switch } from '../components/Switch'
import { Icon, type IconName } from '../components/Icon'

const worlds: [string, number, string][] = [
  ['Perlenland', 3, '#F2F0FF'], ['Big-Friends-Insel', 5, '#FFC531'], ['Little-Friends-Wald', 3, '#FF8A1F'],
  ['Best-Friends-Berg', 3, '#3DBE5B'], ['Big-Friends-Höhle', 5, '#3BA7FF'], ['Little-Friends-See', 3, '#A06BFF'],
  ['Best-Friends-Vulkan', 3, '#FF4D6D'], ['Turbo-Stadt', 2, '#A8673A'], ['Anzan-Galaxie', 2, '#111111'],
]
const units = ['+9 und +8', '+7 und +6', '+5 und +4', '+3 und +2', '+1 und gemischt']

const stations: [string, IconName, string, string, string][] = [
  ['Video', 'video', 'YouTube-Lektion „BigFriends +7"', '5:30 Min.', '#D6ECFF'],
  ['Entdecken', 'sparkle', 'Animation 4 + 7 und 3 + 6, je 5 Schritte', '2 Beispiele', '#E4DFFF'],
  ['Üben mit Abakus', 'pearl', 'Abakuskids · Level 1, Stufe 6 und 7', '20 Aufgaben', '#FFE59A'],
  ['Blitz-Training', 'bolt', 'MathKids · Stufe 4 und 5', '30 Aufgaben', '#FFC7A3'],
  ['Kopfrechnen', 'brain', 'Abakuskids Kopfrechen-Aufgaben + generiert', '8 Aufgaben', '#E8D9FF'],
  ['Boss-Kampf', 'sword', 'Gemischt aus allen Stationen, 3 Leben', '6 Aufgaben', '#FFD3DD'],
]

export function AdminInhalte() {
  const [open, setOpen] = useState(1)
  const [unlocked, setUnlocked] = useState([true, true, true, false, false, false, false, false, false])

  return (
    <AdminLayout active="Lerninhalte">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 className="display" style={{ fontSize: 32, lineHeight: 1.1 }}>Lerninhalte</h1>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)' }}>9 Welten · 29 Einheiten · 1.930 Aufgaben</div>
        </div>
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 14, color: 'var(--ink-soft)' }}>
          Freischaltung für
          <select className="field" style={{ width: 'auto', padding: '10px 12px', fontSize: 15, fontWeight: 900 }}>
            <option>LINZ-7K</option>
            <option>Alle Klassen</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 16, background: '#ddf7e3', border: '2px solid #a9e4b7', fontWeight: 800, fontSize: 14, color: 'var(--green-ink)' }}>
        <Icon name="check" size={20} sw={3} color="#25913F" />
        Alle Aufgaben automatisch geprüft: 33 falsche Lösungen und 4 nicht lösbare Ketten aus MathKids wurden korrigiert.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <section className="panel sm" style={{ flex: '1 1 320px', padding: '8px 10px' }}>
          {worlds.map(([name, count, color], i) => (
            <div key={name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 12, background: i === open ? 'var(--page)' : undefined }}>
                <button
                  type="button" onClick={() => setOpen(i)} aria-expanded={i === open}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, border: 0, background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--ink)' }}
                >
                  <span className="display" style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, background: color, color: i === 8 ? '#fff' : 'var(--ink)', border: '2px solid var(--border)' }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 900, fontSize: 15 }}>{name}</span>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 12, color: 'var(--ink-soft)' }}>{count} Einheiten</span>
                  </span>
                </button>
                <Switch small label={`${name} freischalten`} checked={unlocked[i]} onChange={(v) => setUnlocked(unlocked.map((u, k) => (k === i ? v : u)))} />
              </div>
              {i === open && i === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 8px 10px 52px' }}>
                  {units.map((u, ui) => (
                    <div key={u} style={{ padding: '8px 10px', borderRadius: 10, fontWeight: 800, fontSize: 14, ...(ui === 1 ? { background: 'var(--purple)', color: '#fff' } : { color: 'var(--ink-soft)' }) }}>Einheit {ui + 1}: Big Friends {u}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="panel" style={{ flex: '999 1 480px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--cream)', fontWeight: 900, fontSize: 13, color: '#4a3300' }}>Welt 2 · Einheit 2</span>
            <h2 style={{ fontSize: 26 }}>Big Friends +7 und +6</h2>
            <button type="button" className="btn-primary" style={{ marginLeft: 'auto', padding: '9px 14px' }}>Änderungen speichern</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <label className="field-label">
              Merksatz
              <input className="field" type="text" defaultValue="+7 = +10 − 3 · +6 = +10 − 4" style={{ padding: '11px 12px', fontSize: 15 }} />
            </label>
            <label className="field-label">
              Video-Link (YouTube, nicht gelistet)
              <input className="field" type="url" defaultValue="https://youtu.be/h5YNF3tvTx8" style={{ padding: '11px 12px', fontSize: 15, fontWeight: 700 }} />
            </label>
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, marginBottom: 8 }}>Stationen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stations.map(([name, icon, src, count, bg]) => (
                <div key={name} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: 'var(--page)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: bg }}>
                    <Icon name={icon} size={20} />
                  </div>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 15 }}>{name}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>{src}</div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, background: '#fff', fontWeight: 900, fontSize: 13 }}>{count}</span>
                  <button type="button" aria-label={`${name} bearbeiten`} style={{ width: 34, height: 34, borderRadius: 10, border: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name="edit" size={16} color="#5A5094" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <label className="field-label" style={{ flex: '1 1 220px' }}>
              Nächste Station öffnet ab
              <select className="field" style={{ padding: '10px 12px', fontSize: 15 }}>
                <option>80 % richtig</option>
                <option>70 % richtig</option>
                <option>90 % richtig</option>
              </select>
            </label>
            <label className="field-label" style={{ flex: '1 1 220px' }}>
              Belohnung für 3 Sterne
              <input className="field" type="text" defaultValue="60 Perlen + Abzeichen" style={{ padding: '10px 12px', fontSize: 15 }} />
            </label>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
