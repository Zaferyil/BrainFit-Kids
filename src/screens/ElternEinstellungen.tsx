import { useState } from 'react'
import { ParentLayout } from '../components/ParentLayout'
import { Switch } from '../components/Switch'
import { Icon, type IconName } from '../components/Icon'

const goals = [10, 15, 20, 30]

const group = { padding: '8px 22px' } as const
const heading = { margin: '12px 0 4px', fontSize: 21 } as const
const row = { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: '2px solid #f1eff8' } as const

function Row({ title, desc, checked, onChange, value }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void; value?: string }) {
  return (
    <div style={row}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{title}</div>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-soft)' }}>{desc}</div>
      </div>
      {value && <span style={{ padding: '8px 12px', borderRadius: 10, background: 'var(--page)', fontWeight: 900, fontSize: 14 }}>{value}</span>}
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  )
}

const actions: { icon: IconName; label: string; danger?: boolean }[] = [
  { icon: 'image', label: 'Bild-Passwort zurücksetzen' },
  { icon: 'download', label: 'Alle Daten herunterladen' },
  { icon: 'alert', label: 'Konto löschen', danger: true },
]

export function ElternEinstellungen() {
  const [goal, setGoal] = useState(20)
  const [on, setOn] = useState({ limit: true, quiet: true, ranking: true, weekly: true, teacher: true, reminder: false })
  const set = (k: keyof typeof on) => (v: boolean) => setOn({ ...on, [k]: v })

  return (
    <ParentLayout active="einstellungen" maxWidth={860}>
      <div>
        <h1 className="display" style={{ fontSize: 34, lineHeight: 1.1 }}>Einstellungen für Lena</h1>
        <p style={{ marginTop: 4, fontWeight: 600, fontSize: 15, color: 'var(--ink-soft)' }}>Änderungen gelten sofort auf allen Geräten Ihres Kindes.</p>
      </div>

      <section className="panel">
        <h2 style={{ fontSize: 21 }}>Tägliches Lernziel</h2>
        <p style={{ margin: '2px 0 12px', fontWeight: 600, fontSize: 14, color: 'var(--ink-soft)' }}>Empfohlen für 6–8 Jahre: 15–20 Minuten am Tag.</p>
        <div role="radiogroup" aria-label="Lernziel" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
          {goals.map((g) => (
            <button
              key={g} type="button" role="radio" aria-checked={g === goal} onClick={() => setGoal(g)}
              style={{ padding: 12, borderRadius: 14, fontWeight: 900, fontSize: 16, cursor: 'pointer', border: `2px solid ${g === goal ? 'var(--purple)' : 'var(--border)'}`, background: g === goal ? '#efedff' : '#fff', color: g === goal ? 'var(--ink)' : 'var(--ink-soft)' }}
            >
              {g} Min.
            </button>
          ))}
        </div>
      </section>

      <section className="panel" style={group}>
        <h2 style={heading}>Bildschirmzeit</h2>
        <Row title="Tägliches Zeitlimit" desc="Danach macht Perli eine Pause bis morgen." value="45 Min." checked={on.limit} onChange={set('limit')} />
        <Row title="Ruhezeit" desc="In dieser Zeit lässt sich die App nicht öffnen." value="19:30–07:00" checked={on.quiet} onChange={set('quiet')} />
      </section>

      <section className="panel" style={{ ...group, paddingBottom: 18 }}>
        <h2 style={heading}>Rangliste und Privatsphäre</h2>
        <Row title="Rangliste anzeigen" desc="Andere Kinder sehen nur Spitzname und Avatar – nie den echten Namen." checked={on.ranking} onChange={set('ranking')} />
        <label className="field-label" style={{ fontWeight: 900, fontSize: 15 }}>
          Spitzname in der Rangliste
          <input className="field" type="text" defaultValue="SternLena" style={{ maxWidth: 320 }} />
        </label>
      </section>

      <section className="panel" style={group}>
        <h2 style={heading}>Benachrichtigungen</h2>
        <Row title="Wöchentlicher Lernbericht per E-Mail" desc="Jeden Sonntag um 18 Uhr." checked={on.weekly} onChange={set('weekly')} />
        <Row title="Nachrichten der Lehrkraft" desc="Sofort per E-Mail benachrichtigen." checked={on.teacher} onChange={set('teacher')} />
        <Row title="Erinnerung nach 2 Tagen Pause" desc="Eine freundliche Nachricht an Sie, nicht an das Kind." checked={on.reminder} onChange={set('reminder')} />
      </section>

      <section className="panel">
        <h2 style={{ marginBottom: 12, fontSize: 21 }}>Kinderkonto und Daten</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {actions.map((a) => (
            <button
              key={a.label} type="button" className="btn-outline"
              style={{ padding: '12px 16px', fontSize: 15, ...(a.danger ? { borderColor: '#f5b5c5', background: '#fff5f7', color: '#a3123a' } : {}) }}
            >
              <Icon name={a.icon} size={18} color={a.danger ? '#A3123A' : '#231A4F'} />
              {a.label}
            </button>
          ))}
        </div>
      </section>
    </ParentLayout>
  )
}
