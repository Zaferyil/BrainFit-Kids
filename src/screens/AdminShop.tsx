import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { Switch } from '../components/Switch'
import { Icon } from '../components/Icon'
import { Avatar, type Hat } from '../components/Avatar'

const tabs = ['Artikel', 'Abzeichen', 'Events']

type Item = { name: string; cat: string; price: string; gem?: boolean; lvl: number; sold: number; on: boolean; hat: Hat; hc: string; shirt: string; glasses?: boolean }

const initial: Item[] = [
  { name: 'Kopfhörer', cat: 'Kopf', price: '250', lvl: 1, sold: 64, on: true, hat: 'phones', hc: '#FF4D6D', shirt: '#3BA7FF' },
  { name: 'Zauberhut', cat: 'Kopf', price: '300', lvl: 3, sold: 41, on: true, hat: 'wizard', hc: '#231A4F', shirt: '#FF8A1F' },
  { name: 'Krone', cat: 'Kopf', price: '12', gem: true, lvl: 5, sold: 18, on: true, hat: 'crown', hc: '#FFC531', shirt: '#3BA7FF' },
  { name: 'Coole Brille', cat: 'Gesicht', price: '180', lvl: 1, sold: 37, on: true, hat: 'none', hc: '#FF4D6D', shirt: '#3BA7FF', glasses: true },
  { name: 'Shirt Grün', cat: 'Oberteil', price: '100', lvl: 1, sold: 52, on: true, hat: 'none', hc: '#FF4D6D', shirt: '#3DBE5B' },
  { name: 'Glitzer-Shirt', cat: 'Oberteil', price: '400', lvl: 10, sold: 6, on: true, hat: 'none', hc: '#FF4D6D', shirt: '#FF5C8A' },
  { name: 'Ninja-Band', cat: 'Kopf', price: '350', lvl: 7, sold: 0, on: false, hat: 'band', hc: '#231A4F', shirt: '#231A4F' },
]

const kpis = [['Ø Perlen verdient / Kind / Woche', '410'], ['Ø Perlen ausgegeben / Woche', '290'], ['Beliebtester Artikel', 'Kopfhörer']]

export function AdminShop() {
  const [tab, setTab] = useState(0)
  const [items, setItems] = useState(initial)
  const [event, setEvent] = useState(true)

  return (
    <AdminLayout active="Shop & Belohnungen">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <h1 className="display" style={{ fontSize: 32, lineHeight: 1.1 }}>Shop &amp; Belohnungen</h1>
        <div role="tablist" aria-label="Bereiche" className="tabs">
          {tabs.map((t, i) => <button key={t} type="button" role="tab" aria-selected={i === tab} onClick={() => setTab(i)}>{t}</button>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {kpis.map(([l, v]) => (
          <div key={l} className="panel" style={{ borderRadius: 18, padding: '14px 16px' }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)' }}>{l}</div>
            <div className="display" style={{ fontSize: 28 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
        <section className="panel sm" style={{ flex: '999 1 520px', padding: '6px 16px 10px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 600 }}>
              <thead><tr><th style={{ padding: '12px 6px' }}>Artikel</th><th>Kategorie</th><th>Preis</th><th>ab Level</th><th>Gekauft</th><th>Aktiv</th></tr></thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={it.name}>
                    <td style={{ padding: '8px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar size={38} hat={it.hat} hatColor={it.hc} shirt={it.shirt} glasses={it.glasses} bg="#3A2F80" />
                        <span style={{ fontWeight: 900 }}>{it.name}</span>
                      </div>
                    </td>
                    <td>{it.cat}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 900 }}>
                        <Icon name={it.gem ? 'gem' : 'pearl'} size={16} color={it.gem ? '#1F6FB8' : '#DE9800'} fill={it.gem ? '#9BD3FF' : '#FFC531'} />
                        {it.price}
                      </span>
                    </td>
                    <td>{it.lvl}</td>
                    <td>{it.sold}×</td>
                    <td><Switch small label={`${it.name} aktiv`} checked={it.on} onChange={(v) => setItems(items.map((x, k) => (k === i ? { ...x, on: v } : x)))} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <section className="panel sm" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2>Neuer Artikel</h2>
            <div style={{ display: 'flex', justifyContent: 'center', padding: 10, borderRadius: 16, background: 'var(--bg)' }}>
              <Avatar size={110} hat="wizard" hatColor="#3DBE5B" shirt="#3BA7FF" bg="#3A2F80" />
            </div>
            <label className="field-label">
              Name
              <input className="field" type="text" defaultValue="Zauberhut Wald" style={{ padding: '10px 12px', fontSize: 15 }} />
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <label className="field-label" style={{ flex: 1 }}>
                Preis
                <input className="field" type="number" defaultValue={250} style={{ padding: '10px 12px', fontSize: 15 }} />
              </label>
              <label className="field-label" style={{ flex: 1 }}>
                Währung
                <select className="field" style={{ padding: '10px 12px', fontSize: 15 }}>
                  <option>Perlen</option>
                  <option>Diamanten</option>
                </select>
              </label>
            </div>
            <button type="button" className="btn-primary" style={{ justifyContent: 'center', padding: 12, fontSize: 15 }}>Im Shop veröffentlichen</button>
          </section>
          <section className="panel sm" style={{ background: 'var(--cream)', borderColor: '#f2d98c', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="calendar" size={22} color="#4A3300" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 900, fontSize: 16 }}>Wochenend-Turnier</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#6b4a00' }}>Sa–So doppelte Perlen im Blitz-Training</div>
              </div>
              <Switch small label="Wochenend-Turnier aktiv" checked={event} onChange={setEvent} />
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
