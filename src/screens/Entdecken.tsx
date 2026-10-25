import { useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Abakus } from '../components/Abakus'
import { Perli, type Mood } from '../components/Perli'

const steps: { text: string; val: number; mark: number; say: string; mood: Mood }[] = [
  { text: 'Stelle die 4 auf der Einer-Stange ein.', val: 4, mark: 0, say: 'Schieb 4 Erdperlen nach oben. Du kannst sie auch selbst antippen!', mood: 'happy' },
  { text: '7 passt nicht mehr auf die Einer-Stange.', val: 4, mark: 0, say: 'Oh! Es sind nicht genug Perlen frei. Wir brauchen einen großen Freund.', mood: 'wow' },
  { text: 'Der große Freund von 7 ist 3. Nimm 3 Erdperlen weg.', val: 1, mark: 0, say: '7 und 3 sind zusammen 10. Also: 3 Perlen runter!', mood: 'think' },
  { text: 'Schiebe 1 Erdperle bei den Zehnern hoch (+10).', val: 11, mark: 1, say: 'Eine Zehner-Perle ist so viel wie 10 Einer-Perlen.', mood: 'happy' },
  { text: 'Fertig: 4 + 7 = 11', val: 11, mark: -1, say: 'Super! Jetzt kennst du den großen Freund von 7.', mood: 'cheer' },
]

const eq = { fontWeight: 900, fontSize: 22, color: '#8a5a00' } as const

export function Entdecken() {
  const [step, setStep] = useState(0)
  const cur = steps[step]
  const last = step === steps.length - 1

  return (
    <Stage>
      <div style={{ padding: '28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/einheit" aria-label="Zurück zur Einheit" className="round-btn">
            <Icon name="x" size={26} color="#fff" />
          </Link>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--muted)' }}>STATION 2 VON 6 · ENTDECKEN</div>
            <h1 className="display" style={{ fontSize: 36, lineHeight: 1.05 }}>So rechnet der Abakus 4 + 7</h1>
          </div>
          <button type="button" aria-label="Vorlesen" className="round-btn" style={{ marginLeft: 'auto' }}>
            <Icon name="volume" size={26} color="#fff" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 28, marginTop: 22 }}>
          <div style={{ width: 500, height: 600, borderRadius: 32, background: 'var(--panel-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 120, fontWeight: 900, fontSize: 16, color: 'var(--muted)' }}>
              <span>Zehner</span>
              <span>Einer</span>
            </div>
            <Abakus value={cur.val} columns={2} colWidth={120} mark={cur.mark} />
            <div className="display" style={{ padding: '8px 26px', borderRadius: 999, background: 'var(--yellow)', color: 'var(--ink)', fontSize: 34, lineHeight: 1.2 }}>{cur.val}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 22, background: 'var(--cream)', color: 'var(--ink)' }}>
              <span className="display" style={{ fontSize: 30 }}>4 + 7</span>
              <span style={eq}>=</span>
              <span className="display" style={{ fontSize: 30 }}>4 − 3 + 10</span>
              <span style={eq}>=</span>
              <span className="display" style={{ fontSize: 30, color: 'var(--green-d)' }}>11</span>
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {steps.map((s, i) => {
                const done = i < step
                const active = i === step
                return (
                  <li
                    key={s.text}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 20, fontWeight: 800, fontSize: 17, lineHeight: 1.3,
                      ...(active ? { background: '#fff', color: 'var(--ink)', boxShadow: '0 0 0 4px var(--yellow)' }
                        : done ? { background: 'var(--panel)', color: 'var(--lilac)' }
                        : { background: 'transparent', color: '#6b61a8', border: '2px dashed var(--line)' }),
                    }}
                  >
                    <span
                      className="display"
                      style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        ...(done ? { background: 'var(--green)' } : active ? { background: 'var(--orange)', color: 'var(--ink)' } : { background: 'var(--panel)', color: '#6b61a8' }),
                      }}
                    >
                      {done ? <Icon name="check" size={20} sw={3} color="#10351B" /> : i + 1}
                    </span>
                    <span>{s.text}</span>
                  </li>
                )
              })}
            </ol>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 'auto' }}>
              <Perli mood={cur.mood} size={104} />
              <div className="bubble" style={{ flex: 1, marginBottom: 34, padding: '14px 18px', borderRadius: '22px 22px 22px 4px', fontSize: 17, lineHeight: 1.35 }}>{cur.say}</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="ghost" onClick={() => setStep(Math.max(0, step - 1))} style={{ padding: '16px 26px', fontSize: 18 }}>Zurück</button>
              <button type="button" className="cta" onClick={() => setStep(last ? 0 : step + 1)} style={{ flex: 1, padding: '16px 26px', fontSize: 24 }}>
                {last ? 'Nochmal zeigen' : 'Nächster Schritt'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  )
}
