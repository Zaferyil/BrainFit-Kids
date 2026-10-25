import { useEffect, useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Abakus } from '../components/Abakus'
import { Perli } from '../components/Perli'
import { go } from '../router'

// jede Aufgabe: Zahl, dann (Vorzeichen, Zahl)-Schritte
const tasks: [number, ...[string, number][]][] = [
  [27, ['+', 8], ['-', 5]], [36, ['+', 9], ['-', 5]], [18, ['+', 7], ['+', 6]], [45, ['-', 7], ['+', 4]],
  [52, ['+', 9], ['-', 6]], [29, ['+', 6], ['+', 7]], [63, ['-', 8], ['+', 5]], [40, ['+', 7], ['+', 9]],
]

const solve = ([start, ...steps]: (typeof tasks)[number]) => steps.reduce((a, [op, n]) => (op === '+' ? a + n : a - n), start)
const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'C', '⌫']

export function Kopfrechnen() {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')

  const task = tasks[index]
  const answer = String(solve(task))
  const right = input === answer

  useEffect(() => {
    if (!right) return
    const t = setTimeout(() => {
      if (index === tasks.length - 1) go('/boss')
      else {
        setIndex(index + 1)
        setInput('')
      }
    }, 900)
    return () => clearTimeout(t)
  }, [right, index])

  const press = (l: string) => {
    if (l === 'C') setInput('')
    else if (l === '⌫') setInput((c) => c.slice(0, -1))
    else setInput((c) => (c.length >= answer.length ? l : c + l))
  }

  const [start, ...steps] = task
  const text = `${start} ${steps.map(([op, n]) => `${op === '+' ? '+' : '−'} ${n}`).join(' ')} =`

  return (
    <Stage>
      <div style={{ padding: '28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/einheit" aria-label="Beenden" className="round-btn">
            <Icon name="x" size={26} color="#fff" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: '#a06bff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="brain" size={28} color="#fff" />
            </div>
            <div>
              <div className="display" style={{ fontSize: 30, lineHeight: 1 }}>Kopfrechnen</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--muted)' }}>Aufgabe {index + 1} von {tasks.length}</div>
            </div>
          </div>
          <div className="pill" style={{ marginLeft: 'auto', padding: '10px 18px', background: 'var(--panel)', fontSize: 16 }}>
            <Icon name="eyeoff" size={22} color="#C9C0FF" />
            Ohne Abakus · doppelte Perlen
          </div>
        </div>

        <div style={{ display: 'flex', gap: 36, marginTop: 36 }}>
          <div style={{ width: 430, height: 600, position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', left: 40, top: 0, width: 360, height: 340, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Abakus value={start} columns={2} colWidth={72} faded interactive={false} />
            </div>
            <div style={{ position: 'absolute', left: 110, top: 330, width: 44, height: 44, borderRadius: '50%', background: '#fff' }} />
            <div style={{ position: 'absolute', left: 86, top: 380, width: 24, height: 24, borderRadius: '50%', background: '#fff' }} />
            <div style={{ position: 'absolute', left: 0, bottom: 0 }}><Perli mood={right ? 'cheer' : 'think'} size={180} /></div>
            <div style={{ position: 'absolute', left: 196, bottom: 60, width: 220, fontWeight: 800, fontSize: 17, lineHeight: 1.35, color: 'var(--lilac-2)' }}>
              {right ? 'Super! Stimmt genau.' : 'Stell dir die Perlen vor. Was macht der große Freund von 9?'}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card-white" style={{ height: 170, borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="display" style={{ fontSize: 84, letterSpacing: '0.02em' }}>{text}</span>
            </div>
            <div style={{ height: 110, borderRadius: 28, background: 'var(--panel)', border: `4px solid ${right ? 'var(--green)' : 'var(--yellow)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="display" style={{ fontSize: 72, color: right ? 'var(--green)' : 'var(--yellow)' }}>
                {input}{!right && <span style={{ color: '#6b61a8' }}>_</span>}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 12 }}>
              {labels.map((l) => {
                const alt = l === 'C' || l === '⌫'
                return (
                  <button
                    key={l} type="button" className={`key${alt ? ' alt' : ''}`} onClick={() => press(l)}
                    aria-label={l === '⌫' ? 'Löschen' : l === 'C' ? 'Alles löschen' : `Zahl ${l}`}
                    style={{ height: 96, borderRadius: 24, fontSize: 40 }}
                  >
                    {l}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </Stage>
  )
}
