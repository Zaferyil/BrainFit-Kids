import { useEffect, useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Abakus } from '../components/Abakus'
import { Perli } from '../components/Perli'
import { Keypad } from '../components/Keypad'
import { go } from '../router'

const tasks = [[7, 1, 7], [4, 7], [5, 6], [8, 7, 1], [3, 6, 7], [9, 7], [2, 6, 6], [6, 7, 3], [4, 6, 7], [5, 7, 6]]
const sum = (t: number[]) => t.reduce((a, b) => a + b, 0)

export function Ueben() {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [correct, setCorrect] = useState(0)

  const task = tasks[index]
  const answer = String(sum(task))
  const right = input === answer
  const wrong = input.length >= answer.length && !right

  useEffect(() => {
    if (!right) return
    const t = setTimeout(() => {
      setCorrect((c) => c + 1)
      if (index === tasks.length - 1) go('/ergebnis')
      else {
        setIndex(index + 1)
        setInput('')
      }
    }, 1200)
    return () => clearTimeout(t)
  }, [right, index])

  const press = (d: string) => setInput((cur) => (cur.length < 3 ? (wrong ? '' : cur) + d : cur))

  return (
    <Stage>
      <div style={{ padding: '28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/einheit" aria-label="Übung beenden" className="round-btn">
            <Icon name="x" size={26} color="#fff" />
          </Link>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            {tasks.map((_, i) => {
              const bg = i < index ? 'var(--green)' : i === index ? 'var(--yellow)' : 'var(--line)'
              return <div key={i} style={{ flex: 1, height: 14, borderRadius: 999, background: bg, boxShadow: i === index ? '0 0 0 3px rgba(255,197,49,.35)' : undefined }} />
            })}
          </div>
          <div className="pill" style={{ padding: '8px 16px', background: 'var(--panel)', fontSize: 20 }}>
            <Icon name="pearl" size={24} color="#DE9800" fill="#FFC531" />
            +{(correct + (right ? 1 : 0)) * 3}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, marginTop: 28, alignItems: 'stretch' }}>
          <section className="card-white" style={{ width: 250, height: 560, borderRadius: 32, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ alignSelf: 'stretch', fontWeight: 900, fontSize: 14, color: '#6b61a8' }}>AUFGABE {index + 1} VON {tasks.length}</div>
            <div className="display" style={{ marginTop: 26, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontSize: 64, lineHeight: 1.05 }}>
              {task.map((n, i) => (
                <span key={i} style={{ color: i === task.length - 1 && i > 0 ? '#E06A00' : undefined }}>{i === 0 ? n : `+${n}`}</span>
              ))}
            </div>
            <div style={{ alignSelf: 'stretch', height: 6, borderRadius: 3, background: 'var(--ink)', margin: '14px 0' }} />
            <div
              className="display"
              style={{
                alignSelf: 'stretch', height: 96, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 18px', fontSize: 64,
                ...(right ? { background: '#ddf7e3', color: 'var(--green-d)', border: '4px solid var(--green)' }
                  : wrong ? { background: '#ffe1e8', color: '#c2264e', border: '4px solid var(--pink)' }
                  : { background: '#f7f5ff', color: input ? 'var(--ink)' : 'var(--lilac)', border: '4px dashed var(--lilac)' }),
              }}
            >
              {input || '?'}
            </div>
            <button
              type="button"
              style={{ marginTop: 'auto', alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 999, border: '3px solid var(--border)', background: '#fff', color: 'var(--ink-soft)', fontWeight: 900, fontSize: 17, cursor: 'pointer' }}
            >
              <Icon name="bulb" size={22} color="#5A5094" />
              Tipp
            </button>
          </section>

          <div style={{ flex: 1, height: 560, borderRadius: 32, background: 'var(--panel-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, position: 'relative' }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--lilac)' }}>Rechne mit dem Abakus – tippe auf die Perlen</div>
            <div style={{ marginTop: 28 }}>
              <Abakus key={index} value={task[0]} columns={3} colWidth={96} showValue />
            </div>
            {right && (
              <div style={{ position: 'absolute', left: 24, right: 24, bottom: 20, padding: '16px 20px', borderRadius: 24, background: 'var(--green)', color: 'var(--green-ink)', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={30} sw={3.2} color="#25913F" />
                </div>
                <div>
                  <div className="display" style={{ fontSize: 26, lineHeight: 1 }}>Richtig! +3 Perlen</div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Die nächste Aufgabe kommt gleich …</div>
                </div>
              </div>
            )}
            {wrong && (
              <div style={{ position: 'absolute', left: 24, right: 24, bottom: 20, padding: '16px 20px', borderRadius: 24, background: '#ffe1e8', color: '#8a1235', display: 'flex', alignItems: 'center', gap: 14 }}>
                <Perli mood="think" size={56} />
                <div>
                  <div className="display" style={{ fontSize: 24, lineHeight: 1 }}>Fast! Schau noch mal auf die Einer.</div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>+7 = 3 weg, 1 Zehner dazu</div>
                </div>
              </div>
            )}
          </div>

          <Keypad onDigit={press} onDelete={() => setInput((c) => c.slice(0, -1))} onClear={() => setInput('')} />
        </div>
      </div>
    </Stage>
  )
}
