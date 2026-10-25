import { useState } from 'react'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import { describeDigit, type UnitContent } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { Keypad, StationDone, StationShell } from './StationShell'

type Task = { kind: 'set' | 'read'; n: number; id: number; retry?: boolean }
type Feedback = { type: 'right' | 'wrong' | 'hint'; text: string; sub?: string } | null

const COUNT = 10

function makeTasks(): Task[] {
  const tasks: Task[] = []
  let prev = 0
  for (let i = 0; i < COUNT; i++) {
    let n = prev
    while (n === prev) n = 1 + Math.floor(Math.random() * 9)
    prev = n
    tasks.push({ kind: i % 2 === 0 ? 'set' : 'read', n, id: i })
  }
  return tasks
}

const starsFor = (errors: number) => (errors === 0 ? 3 : errors <= 2 ? 2 : 1)

export function UebenStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  const [queue, setQueue] = useState(makeTasks)
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [results, setResults] = useState<Record<number, 'right' | 'wrong'>>({})
  const [errors, setErrors] = useState(0)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const task = queue[index]

  const next = (q: Task[], errs: number) => {
    setFeedback(null)
    setInput('')
    if (index + 1 >= q.length) {
      const stars = starsFor(errs)
      setDone({ stars, perlen: finishStation(kidId, 'ueben', stars, COUNT) })
    } else setIndex(index + 1)
  }

  const right = () => {
    setFeedback({ type: 'right', text: 'Richtig! +1 Perle', sub: 'Die nächste Aufgabe kommt gleich …' })
    setEarned(earned + 1)
    if (!task.retry) setResults({ ...results, [task.id]: 'right' })
    speak('Richtig!')
    setTimeout(() => next(queue, errors), 1100)
  }

  const wrong = () => {
    const q = task.retry ? queue : [...queue, { ...task, retry: true }]
    setQueue(q)
    setErrors(errors + 1)
    setResults({ ...results, [task.id]: 'wrong' })
    const text = `Fast! Das ist die ${task.n}.`
    setFeedback({ type: 'wrong', text, sub: `${task.n} = ${describeDigit(task.n)}. Die Aufgabe kommt später noch einmal.` })
    speak(`${text} ${task.n} ist ${describeDigit(task.n)}.`)
    setTimeout(() => next(q, errors + 1), 2600)
  }

  const onKey = (k: string) => {
    if (feedback || task.kind !== 'read') return
    if (k === 'del' || k === 'C') { setInput(''); return }
    setInput(k)
    if (Number(k) === task.n) right()
    else wrong()
  }

  const onAbakus = (v: number) => {
    if (!feedback && task.kind === 'set' && v === task.n) right()
  }

  const hint = () => {
    setErrors(errors + 1)
    setFeedback({ type: 'hint', text: `Tipp: ${task.n} = ${describeDigit(task.n)}` })
    speak(`${task.n} ist ${describeDigit(task.n)}.`)
    setTimeout(() => setFeedback(null), 2600)
  }

  const dots = queue.slice(0, COUNT).map((t) => results[t.id] ?? (t.id === task.id ? 'current' : 'open'))

  return (
    <StationShell station="ueben" title="Perlen einstellen und ablesen" dots={dots} perlen={earned}>
      <div className="practice">
        <section className="task-card">
          <div className="eyebrow">{task.retry ? 'NOCH EINMAL' : `AUFGABE ${Math.min(index + 1, COUNT)} VON ${COUNT}`}</div>
          {task.kind === 'set' ? (
            <>
              <div className="task-ask">Stelle ein:</div>
              <div className="task-number">{task.n}</div>
            </>
          ) : (
            <>
              <div className="task-ask">Welche Zahl zeigt der Abakus?</div>
              <div className={`task-answer ${feedback?.type ?? ''} ${input ? 'filled' : ''}`}>{input || '?'}</div>
            </>
          )}
          {task.kind === 'set' && (
            <button type="button" className="btn-outline hint-btn" disabled={!!feedback} onClick={hint}>
              <Icon name="bulb" color="#5A5094" size={22} /> Tipp
            </button>
          )}
        </section>

        <div className="practice-board">
          <div className="board-hint">{task.kind === 'set' ? 'Tippe auf die Perlen' : 'Schau genau hin'}</div>
          <Abakus
            key={`${index}-${task.id}`}
            value={task.kind === 'read' ? task.n : 0}
            cols={content.cols}
            colw={130}
            interactive={task.kind === 'set' && !feedback}
            onChange={onAbakus}
          />
          {feedback && (
            <div className={`feedback ${feedback.type}`} role="status">
              {feedback.type === 'right'
                ? <span className="feedback-icon"><Icon name="check" color="#25913F" size={30} strokeWidth={3.2} /></span>
                : <Perli mood="think" size={56} />}
              <div>
                <div className="feedback-text">{feedback.text}</div>
                {feedback.sub && <div className="feedback-sub">{feedback.sub}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="practice-side">
          {task.kind === 'read' ? (
            <Keypad onKey={onKey} disabled={!!feedback} />
          ) : (
            <div className="perli-say column">
              <div className="say-bubble">Schiebe die Perlen, bis der Abakus {task.n} zeigt. Du musst nichts drücken – ich schaue mit!</div>
              <Perli mood="happy" size={150} />
            </div>
          )}
        </div>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Alles richtig – wow!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}
