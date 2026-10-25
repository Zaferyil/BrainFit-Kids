import { useState } from 'react'
import { ParentLayout } from '../components/ParentLayout'
import { Icon } from '../components/Icon'
import { Avatar } from '../components/Avatar'

const periods = ['Woche', 'Monat', 'Gesamt']

const rows: [string, string[], number[]][] = [
  ['Big Friends +', ['+9', '+8', '+7', '+6', '+5', '+4', '+3', '+2', '+1'], [96, 94, 72, 81]],
  ['Little Friends +', ['+4', '+3', '+2', '+1'], []],
  ['Best Friends +', ['+6', '+7', '+8', '+9'], []],
  ['Big Friends −', ['−9', '−8', '−7', '−6', '−5', '−4', '−3', '−2', '−1'], []],
]

const legend: [string, string][] = [['#BFEBC9', 'ab 90 %'], ['#FFE59A', '75–89 %'], ['#FFC7A3', 'unter 75 %'], ['#F1EFF8', 'noch nicht geübt']]

function tone(v: number | undefined): [string, string] {
  if (v === undefined) return ['#F1EFF8', '#8F85D6']
  if (v >= 90) return ['#BFEBC9', '#10351B']
  if (v >= 75) return ['#FFE59A', '#4A3300']
  return ['#FFC7A3', '#5A2400']
}

const tempo = [7.2, 6.4, 5.9, 5.1, 4.8, 4.3, 4.2, 3.8].map((v, i) => ({ x: 70 + i * 66, y: 190 - v * 20, v, w: `W${i + 1}` }))

export function Lernbericht() {
  const [period, setPeriod] = useState(2)
  return (
    <ParentLayout active="bericht">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
        <Avatar size={56} hat="cap" hatColor="#FF4D6D" shirt="#3BA7FF" />
        <div>
          <h1 className="display" style={{ fontSize: 34, lineHeight: 1.1 }}>Lernbericht · Lena</h1>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink-soft)' }}>Seit Kursbeginn am 1. September 2026</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <div role="tablist" aria-label="Zeitraum" className="tabs">
            {periods.map((p, i) => (
              <button key={p} type="button" role="tab" aria-selected={i === period} onClick={() => setPeriod(i)}>{p}</button>
            ))}
          </div>
          <button type="button" className="btn-outline">
            <Icon name="download" size={18} />
            Als PDF
          </button>
        </div>
      </div>

      <section className="panel">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
          <h2>Genauigkeit nach Regel</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontWeight: 800, fontSize: 13, color: 'var(--ink-soft)' }}>
            {legend.map(([c, t]) => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: c }} />
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto', marginTop: 14 }}>
          <div style={{ minWidth: 760, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map(([name, rules, vals]) => (
              <div key={name} style={{ display: 'grid', gridTemplateColumns: '170px repeat(9, minmax(0, 1fr))', gap: 8, alignItems: 'center' }}>
                <span style={{ fontWeight: 900, fontSize: 15 }}>{name}</span>
                {Array.from({ length: 9 }, (_, i) => {
                  if (i >= rules.length) return <div key={i} style={{ height: 54 }} />
                  const [bg, fg] = tone(vals[i])
                  return (
                    <div key={i} style={{ height: 54, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, color: fg }}>
                      <span style={{ fontWeight: 900, fontSize: 14 }}>{rules[i]}</span>
                      <span style={{ fontWeight: 800, fontSize: 12 }}>{vals[i] === undefined ? '–' : `${vals[i]} %`}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        <section className="panel" style={{ flex: '999 1 520px' }}>
          <h2>Tempo: Sekunden pro Aufgabe</h2>
          <p style={{ marginTop: 2, fontWeight: 700, fontSize: 14, color: 'var(--ink-soft)' }}>Lena rechnet heute fast doppelt so schnell wie in Woche 1.</p>
          <svg viewBox="0 0 560 220" width="100%" height="220" role="img" aria-label="Tempo sinkt von 7,2 auf 3,8 Sekunden in 8 Wochen">
            <line x1="40" y1="190" x2="545" y2="190" stroke="#E4DFFF" strokeWidth="2" />
            <line x1="40" y1="130" x2="545" y2="130" stroke="#F1EFF8" strokeWidth="2" />
            <line x1="40" y1="70" x2="545" y2="70" stroke="#F1EFF8" strokeWidth="2" />
            {[['0', 194], ['3 s', 134], ['6 s', 74]].map(([t, y]) => (
              <text key={t} x="30" y={y} textAnchor="end" fontFamily="Nunito" fontWeight="800" fontSize="12" fill="#5A5094">{t}</text>
            ))}
            <polyline points={tempo.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#5B47D6" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            {tempo.map((p) => (
              <g key={p.w}>
                <circle cx={p.x} cy={p.y} r="6" fill="#FFFFFF" stroke="#5B47D6" strokeWidth="3" />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fontFamily="Nunito" fontWeight="900" fontSize="12" fill="#231A4F">{String(p.v).replace('.', ',')}</text>
                <text x={p.x} y="210" textAnchor="middle" fontFamily="Nunito" fontWeight="800" fontSize="12" fill="#5A5094">{p.w}</text>
              </g>
            ))}
          </svg>
        </section>
        <section style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel">
            <h2 style={{ marginBottom: 12 }}>Mit Abakus und im Kopf</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Mit Abakus', 94, 'var(--purple)'], ['Im Kopf', 78, 'var(--muted)']].map(([t, v, c]) => (
                <div key={t}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14 }}><span>{t}</span><span>{v} %</span></div>
                  <div className="track" style={{ height: 14, marginTop: 4 }}><div style={{ width: `${v}%`, background: String(c) }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel" style={{ background: 'var(--bg)', border: 0, color: '#fff' }}>
            <h2 style={{ marginBottom: 10 }}>So können Sie helfen</h2>
            <ol style={{ margin: 0, paddingLeft: 20, fontWeight: 700, fontSize: 15, lineHeight: 1.55 }}>
              <li>2× pro Woche Blitz-Training zu +7 (5 Minuten)</li>
              <li>Lena laut erklären lassen: „7 dazu heißt 3 weg, 1 Zehner dazu"</li>
              <li>Kurze, tägliche Einheiten statt langer am Wochenende</li>
            </ol>
          </div>
        </section>
      </div>
    </ParentLayout>
  )
}
