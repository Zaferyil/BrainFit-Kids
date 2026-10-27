import { useEffect, useState } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import { describeNumber, makeSum, randomIn, type UnitContent } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { SAY, STATION_INTRO, sayDescribe } from '../../data/sprache'
import { Keypad, StationDone, StationShell } from './StationShell'
import { typeDigit } from '../../lib/typeDigit'

/** a: Startwert auf dem Abakus bei Rechen-Einheiten (a + add = n) */
type Task = { kind: 'set' | 'read'; n: number; id: number; retry?: boolean; a?: number }
type Feedback = { type: 'right' | 'wrong' | 'hint'; text: string; sub?: string } | null

const COUNT = 10

function makeTasks(content: UnitContent): Task[] {
  const tasks: Task[] = []
  let prev: number | undefined
  for (let i = 0; i < COUNT; i++) {
    const kind = i % 2 === 0 ? 'set' : 'read'
    if (content.add) {
      const { a, n } = makeSum(content, prev)
      prev = a
      tasks.push({ kind, n, a, id: i })
    } else {
      const n = randomIn(content.range, prev)
      prev = n
      tasks.push({ kind, n, id: i })
    }
  }
  return tasks
}

const starsFor = (errors: number) => (errors === 0 ? 3 : errors <= 2 ? 2 : 1)

export function UebenStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  const [queue, setQueue] = useState(() => makeTasks(content))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [results, setResults] = useState<Record<number, 'right' | 'wrong'>>({})
  const [errors, setErrors] = useState(0)
  const [earned, setEarned] = useState(0)
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const [started, setStarted] = useState(false)
  const task = queue[index]
  const sum = task.a !== undefined ? `${task.a} + ${content.add}` : null
  const question = sum
    ? [SAY.rechne, String(task.a), SAY.plus, String(content.add), task.kind === 'set' ? SAY.rechneAbakus : SAY.wievielIst]
    : task.kind === 'set' ? [SAY.stelleEin, String(task.n)] : [SAY.welcheZahlAbakus]
  const questionKey = question.join('|')

  // Jede Aufgabe wird vorgelesen – viele Kinder lesen noch nicht sicher.
  useEffect(() => { if (started) void speak(questionKey.split('|')) }, [started, questionKey, index])

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
    void speak(SAY.richtig)
    setTimeout(() => next(queue, errors), 1100)
  }

  const wrong = () => {
    const q = task.retry ? queue : [...queue, { ...task, retry: true }]
    setQueue(q)
    setErrors(errors + 1)
    setResults({ ...results, [task.id]: 'wrong' })
    const text = sum ? `Fast! ${sum} = ${task.n}.` : `Fast! Das ist die ${task.n}.`
    setFeedback({ type: 'wrong', text, sub: sum ? `${content.rule[0]}. Die Aufgabe kommt später noch einmal.` : `${task.n} = ${describeNumber(task.n)}. Die Aufgabe kommt später noch einmal.` })
    void speak([SAY.fastDasIst, String(task.n), ...sayDescribe(task.n)])
    setTimeout(() => next(q, errors + 1), 3600)
  }

  const onKey = (k: string) => {
    if (feedback || task.kind !== 'read') return
    const t = typeDigit(input, k, task.n)
    setInput(t.input)
    if (!t.done) return
    if (Number(t.input) === task.n) right()
    else wrong()
  }

  const onAbakus = (v: number) => {
    if (!feedback && task.kind === 'set' && v === task.n) right()
  }

  const hint = () => {
    setErrors(errors + 1)
    if (sum) {
      setFeedback({ type: 'hint', text: `Tipp: ${content.rule[0]}` })
      void speak(content.discover[0].say)
    } else {
      setFeedback({ type: 'hint', text: `Tipp: ${task.n} = ${describeNumber(task.n)}` })
      void speak([SAY.tipp, ...sayDescribe(task.n)])
    }
    setTimeout(() => setFeedback(null), 3200)
  }

  const dots = queue.slice(0, COUNT).map((t) => results[t.id] ?? (t.id === task.id ? 'current' : 'open'))

  return (
    <StationShell station="ueben" title={content.add ? `Rechnen: +${content.add}` : 'Perlen einstellen und ablesen'} dots={dots} perlen={earned} intro={STATION_INTRO.ueben} started={started} onStart={() => setStarted(true)} say={question}>
      <div className="practice">
        <section className={task.kind === 'read' ? 'task-card lesen' : 'task-card'}>
          <div className="eyebrow">{task.retry ? 'NOCH EINMAL' : `AUFGABE ${Math.min(index + 1, COUNT)} VON ${COUNT}`}</div>
          {sum ? (
            <>
              <div className="task-ask">{task.kind === 'set' ? 'Rechne mit dem Abakus:' : 'Rechne:'}</div>
              <div className="task-number">{sum}</div>
              {task.kind === 'read' && <div className={`task-answer ${feedback?.type ?? ''} ${input ? 'filled' : ''}`}>{input || '?'}</div>}
            </>
          ) : task.kind === 'set' ? (
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
          <div className="board-hint">{task.kind === 'set' ? 'Tippe auf die Perlen' : sum ? 'Rechne mit Hilfe des Abakus' : 'Schau genau hin'}</div>
          <Fit className="board-fit">
            <Abakus
              key={`${index}-${task.id}`}
              value={task.a ?? (task.kind === 'read' ? task.n : 0)}
              cols={content.cols}
              colw={content.cols > 1 ? 110 : 130}
              interactive={task.kind === 'set' && !feedback}
              onChange={onAbakus}
            />
          </Fit>
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
              <div className="say-bubble">{sum ? `${sum}: ${content.rule[0]}. Schiebe die Perlen – ich schaue mit!` : `Schiebe die Perlen, bis der Abakus ${task.n} zeigt. Du musst nichts drücken – ich schaue mit!`}</div>
              <Perli mood="happy" size={150} />
            </div>
          )}
        </div>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Alles richtig – wow!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}
