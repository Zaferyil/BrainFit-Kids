import { useState } from 'react'
import { AdminLayout } from '../components/AdminLayout'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Avatar, type AvatarLook } from '../components/Avatar'

const chips: [string, number][] = [['Alle', 128], ['LINZ-7K', 18], ['LINZ-3M', 16], ['ONLINE-A', 24], ['ONLINE-B', 22], ['LINZ-1S', 14]]
const beltColor: Record<string, string> = { Weiß: '#F2F0FF', Gelb: '#FFC531', Orange: '#FF8A1F' }

const kids: (AvatarLook & { name: string; belt: string; prog: string; acc: number; last: string; parent: boolean })[] = [
  { name: 'Lena Huber', belt: 'Weiß', prog: 'Welt 2 · Einheit 2', acc: 91, last: 'heute', parent: true, hat: 'cap', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#F6C9A6' },
  { name: 'Jonas Pichler', belt: 'Gelb', prog: 'Welt 3 · Einheit 1', acc: 94, last: 'heute', parent: true, hat: 'phones', hatColor: '#3DBE5B', shirt: '#FF8A1F', hair: '#E9B949', skin: '#F6C9A6' },
  { name: 'Elif Toprak', belt: 'Gelb', prog: 'Welt 3 · Einheit 2', acc: 89, last: 'gestern', parent: true, hat: 'band', hatColor: '#A06BFF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' },
  { name: 'Can Demir', belt: 'Weiß', prog: 'Welt 2 · Einheit 3', acc: 76, last: 'heute', parent: false, hat: 'cap', hatColor: '#3BA7FF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' },
  { name: 'Emma Wagner', belt: 'Orange', prog: 'Welt 4 · Einheit 1', acc: 96, last: 'vor 2 Tagen', parent: true, hat: 'wizard', hatColor: '#5B47D6', shirt: '#FFC531', hair: '#E9B949', skin: '#F6C9A6' },
  { name: 'Ben Gruber', belt: 'Weiß', prog: 'Welt 2 · Einheit 1', acc: 83, last: 'vor 3 Tagen', parent: true, hat: 'none', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#B9774E' },
  { name: 'Sara Mayr', belt: 'Weiß', prog: 'Welt 1 · Einheit 3', acc: 71, last: 'vor 6 Tagen', parent: false, hat: 'crown', shirt: '#FF5C8A', hair: '#C2410C', skin: '#F6C9A6' },
  { name: 'David Hofer', belt: 'Gelb', prog: 'Welt 3 · Einheit 1', acc: 88, last: 'heute', parent: true, hat: 'cap', hatColor: '#FF8A1F', shirt: '#A06BFF', hair: '#6B3E1F', skin: '#F6C9A6' },
]

const accTone = (v: number) => (v >= 90 ? { background: '#ddf7e3', color: '#10351b' } : v >= 80 ? { background: '#fff4d1', color: '#4a3300' } : { background: '#ffe6d6', color: '#5a2400' })

const info: [string, string][] = [['Lehrkraft', 'Frau Berger'], ['Kurs', 'Mo 15:00 · Linz'], ['Kinder', '18'], ['Eltern verbunden', '14 von 18'], ['Freigeschaltet bis', 'Welt 3']]

export function AdminSchueler() {
  const [chip, setChip] = useState('LINZ-7K')
  return (
    <AdminLayout active="Schüler & Klassen">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <h1 className="display" style={{ fontSize: 32, lineHeight: 1.1 }}>Schüler &amp; Klassen</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" className="btn-outline"><Icon name="print" size={18} />Login-Karten drucken</button>
          <button type="button" className="btn-outline"><Icon name="plus" size={18} />Neue Klasse</button>
          <button type="button" className="btn-primary"><Icon name="user" size={18} color="#fff" />Neuer Schüler</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {chips.map(([label, n]) => {
          const on = label === chip
          return (
            <button
              key={label} type="button" aria-pressed={on} onClick={() => setChip(label)}
              style={{ padding: '8px 14px', borderRadius: 999, cursor: 'pointer', fontWeight: 900, fontSize: 14, border: `2px solid ${on ? 'var(--purple)' : 'var(--border)'}`, background: on ? 'var(--purple)' : '#fff', color: on ? '#fff' : 'var(--ink-soft)' }}
            >
              {label} <span style={{ opacity: 0.75 }}>{n}</span>
            </button>
          )
        })}
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 12, background: '#fff', border: '2px solid var(--border)', minWidth: 220 }}>
          <Icon name="search" size={18} color="#5A5094" />
          <span className="sr-only">In Klasse suchen</span>
          <input type="search" placeholder="Name suchen …" style={{ border: 0, outline: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: 'var(--ink)', width: '100%', background: 'transparent' }} />
        </label>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
        <section className="panel sm" style={{ flex: '999 1 560px', padding: '6px 16px 10px' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ minWidth: 680 }}>
              <thead>
                <tr><th style={{ padding: '12px 6px' }}>Schüler</th><th>Gürtel</th><th>Fortschritt</th><th>Genauigkeit</th><th>Zuletzt aktiv</th><th>Eltern</th><th><span className="sr-only">Aktionen</span></th></tr>
              </thead>
              <tbody>
                {kids.map(({ name, belt, prog, acc, last, parent, ...look }) => (
                  <tr key={name}>
                    <td>
                      <Link to="/admin/schueler/lena" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)', textDecoration: 'none' }}>
                        <Avatar size={36} {...look} />
                        <span style={{ fontWeight: 900 }}>{name}</span>
                      </Link>
                    </td>
                    <td><span style={{ display: 'inline-block', width: 40, height: 12, borderRadius: 4, background: beltColor[belt], border: '2px solid var(--lilac)' }} /></td>
                    <td>{prog}</td>
                    <td><span style={{ padding: '4px 10px', borderRadius: 999, fontWeight: 900, ...accTone(acc) }}>{acc} %</span></td>
                    <td style={{ color: 'var(--ink-soft)' }}>{last}</td>
                    <td>
                      {parent ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, color: 'var(--green-d)' }}>
                          <Icon name="check" size={16} sw={3} color="#25913F" />verbunden
                        </span>
                      ) : (
                        <button type="button" style={{ padding: '5px 10px', borderRadius: 8, border: '2px solid var(--border)', background: '#fff', fontWeight: 900, fontSize: 13, color: 'var(--purple)', cursor: 'pointer' }}>Einladen</button>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button type="button" aria-label="Bearbeiten" style={{ width: 34, height: 34, borderRadius: 10, border: 0, background: 'var(--page)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Icon name="edit" size={16} color="#5A5094" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel sm" style={{ flex: '1 1 260px', background: 'var(--bg)', border: 0, color: '#fff' }}>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.05em', color: 'var(--muted)' }}>KLASSEN-CODE</div>
          <div className="display" style={{ fontSize: 40, lineHeight: 1.1, letterSpacing: '0.04em', color: 'var(--yellow)' }}>LINZ-7K</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--lilac)' }}>Kinder geben diesen Code beim ersten Anmelden ein.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, fontSize: 14 }}>
            {info.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--lilac)', fontWeight: 700 }}>{k}</span><span style={{ fontWeight: 900 }}>{v}</span></div>
            ))}
          </div>
          <button type="button" style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 12, border: 0, background: 'var(--yellow)', fontWeight: 900, fontSize: 15, color: 'var(--ink)', cursor: 'pointer' }}>Eltern-Einladungen senden (4)</button>
        </section>
      </div>
    </AdminLayout>
  )
}
