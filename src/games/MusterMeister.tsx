import { useState } from 'react'
import { Bead, type BeadColor } from '../components/Bead'
import { Icon } from '../components/Icon'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

type Item = { kind: 'bead'; color: BeadColor } | { kind: 'num'; n: number }
type Puzzle = { shown: Item[]; answer: Item; options: Item[] }

const COLORS: BeadColor[] = ['yellow', 'green', 'orange', 'blue', 'purple', 'pink']
const ROUNDS = 8
const same = (a: Item, b: Item) => (a.kind === 'bead' && b.kind === 'bead' ? a.color === b.color : a.kind === 'num' && b.kind === 'num' && a.n === b.n)

function beadPuzzle(unit: number[], length: number, optionCount: number): Puzzle {
  const colors = shuffle(COLORS)
  const seq = Array.from({ length: length + 1 }, (_, i) => colors[unit[i % unit.length]])
  const answer: Item = { kind: 'bead', color: seq[length] }
  const opts: Item[] = [answer]
  for (const c of colors) if (opts.length < optionCount && c !== seq[length]) opts.push({ kind: 'bead', color: c })
  return { shown: seq.slice(0, length).map((color) => ({ kind: 'bead', color })), answer, options: shuffle(opts) }
}

function numberPuzzle(values: number[]): Puzzle {
  const answer = values[values.length - 1]
  const opts = new Set([answer])
  const deltas = shuffle([-3, -2, -1, 1, 2, 3, 5, 10])
  for (const d of deltas) if (opts.size < 4 && answer + d >= 0) opts.add(answer + d)
  return {
    shown: values.slice(0, -1).map((n) => ({ kind: 'num', n })),
    answer: { kind: 'num', n: answer },
    options: shuffle([...opts]).map((n) => ({ kind: 'num', n })),
  }
}

/** Stufe → Art des Musters */
function makePuzzle(level: number): Puzzle {
  if (level <= 4) return beadPuzzle([0, 1], 5, level <= 2 ? 3 : 4)
  if (level <= 8) return beadPuzzle(shuffle([[0, 1, 2], [0, 0, 1], [0, 1, 1], [0, 1, 2, 1]])[0], 7, 4)
  if (level <= 12) {
    const step = shuffle([1, 2, 5])[0]
    const start = randInt(1, 10)
    return numberPuzzle(Array.from({ length: 5 }, (_, i) => start + i * step))
  }
  if (level <= 16) {
    const step = shuffle([3, 4, 10, -2, -3])[0]
    const start = step < 0 ? randInt(20, 30) : randInt(1, 12)
    return numberPuzzle(Array.from({ length: 6 }, (_, i) => start + i * step))
  }
  if (Math.random() < 0.5) {
    const start = randInt(1, 3)
    return numberPuzzle(Array.from({ length: 6 }, (_, i) => start * 2 ** i))
  }
  // zwei Regeln abwechselnd: +a, +b, +a, …
  const [a, b] = shuffle([1, 2, 3, 5]).slice(0, 2)
  const vals = [randInt(1, 9)]
  for (let i = 1; i < 6; i++) vals.push(vals[i - 1] + (i % 2 ? a : b))
  return numberPuzzle(vals)
}

function ItemView({ item, big }: { item: Item; big?: boolean }) {
  if (item.kind === 'bead') return <Bead color={item.color} width={big ? 96 : 84} />
  return <span className={big ? 'pat-num big' : 'pat-num'}>{item.n}</span>
}

export function MusterMeister({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const [round, setRound] = useState(0)
  const [puzzle, setPuzzle] = useState(() => makePuzzle(level))
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<Item | null>(null)

  const pick = (o: Item) => {
    if (picked) return
    setPicked(o)
    const ok = same(o, puzzle.answer)
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    speak(ok ? 'Richtig!' : 'Schau, das kommt als Nächstes.')
    window.setTimeout(() => {
      setPicked(null)
      if (round + 1 >= rounds) onFinish(c / rounds, `${c} von ${rounds} Mustern richtig`)
      else { setRound(round + 1); setPuzzle(makePuzzle(level)) }
    }, ok ? 900 : 1800)
  }

  return (
    <div className="game-pattern">
      <div className="game-hint">Muster {round + 1} von {rounds} · Was kommt als Nächstes?</div>
      <div className="pat-row">
        {puzzle.shown.map((it, i) => <div key={i} className="pat-cell"><ItemView item={it} /></div>)}
        <div className={picked ? (same(picked, puzzle.answer) ? 'pat-cell slot right' : 'pat-cell slot wrong') : 'pat-cell slot'}>
          {picked ? <ItemView item={puzzle.answer} /> : <Icon name="search" color="#C9C0FF" size={40} />}
        </div>
      </div>
      <div className="pat-options">
        {puzzle.options.map((o, i) => (
          <button
            key={i}
            type="button"
            className={!picked ? 'pat-opt' : same(o, puzzle.answer) ? 'pat-opt right' : same(o, picked) ? 'pat-opt wrong' : 'pat-opt dim'}
            disabled={!!picked}
            onClick={() => pick(o)}
            aria-label={o.kind === 'num' ? `Zahl ${o.n}` : `Perle ${o.color}`}
          >
            <ItemView item={o} big />
          </button>
        ))}
      </div>
    </div>
  )
}
