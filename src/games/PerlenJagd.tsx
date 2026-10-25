import { useState } from 'react'
import { Bead, type BeadColor } from '../components/Bead'
import { speak } from '../lib/speak'
import { usePortrait } from '../lib/usePortrait'
import { randInt, shuffle, type GameProps } from './types'

const ROUNDS = 5
const NAMES: Record<BeadColor, string> = { yellow: 'gelben', green: 'grünen', orange: 'orangen', blue: 'blauen', purple: 'lila', pink: 'pinken' }
// ähnliche Farben als schwierige Ablenkung
const SIMILAR: Record<BeadColor, BeadColor> = { yellow: 'orange', orange: 'yellow', green: 'blue', blue: 'purple', purple: 'pink', pink: 'purple' }
const ALL: BeadColor[] = ['yellow', 'green', 'orange', 'blue', 'purple', 'pink']

/** Stufe → Rastergröße, Anzahl Ziele, ähnliche Farben, zwei Zielfarben */
function settings(level: number) {
  const cols = Math.min(8, 3 + Math.floor((level - 1) / 3))
  const rows = Math.min(5, 3 + Math.floor((level - 1) / 6))
  return { cols, rows, targets: Math.min(8, 2 + Math.floor(level / 3)), similar: level >= 8, twoColors: level >= 15 }
}

type Round = { cells: BeadColor[]; goal: BeadColor[] }

function makeRound(level: number): Round {
  const s = settings(level)
  const goal = shuffle(ALL).slice(0, s.twoColors ? 2 : 1)
  const others = ALL.filter((c) => !goal.includes(c))
  const cells: BeadColor[] = []
  for (let i = 0; i < s.targets; i++) cells.push(goal[i % goal.length])
  while (cells.length < s.cols * s.rows) {
    const tricky = s.similar && Math.random() < 0.45 ? SIMILAR[goal[0]] : others[randInt(0, others.length - 1)]
    cells.push(goal.includes(tricky) ? others[0] : tricky)
  }
  return { cells: shuffle(cells), goal }
}

export function PerlenJagd({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const portrait = usePortrait()
  const base = settings(level)
  // hochkant: Raster drehen (mehr Zeilen als Spalten)
  const s = portrait && base.cols > base.rows ? { ...base, cols: base.rows, rows: base.cols } : base
  const [round, setRound] = useState(0)
  const [r, setR] = useState(() => makeRound(level))
  const [found, setFound] = useState<number[]>([])
  const [miss, setMiss] = useState<number[]>([])
  const [scores, setScores] = useState<number[]>([])
  const [wrong, setWrong] = useState(0)
  const targets = r.cells.filter((c) => r.goal.includes(c)).length
  const goalText = r.goal.map((g) => NAMES[g]).join(' und ')

  const tap = (i: number) => {
    if (found.includes(i) || found.length === targets) return
    if (!r.goal.includes(r.cells[i])) {
      setMiss([...miss, i])
      window.setTimeout(() => setMiss((m) => m.filter((x) => x !== i)), 500)
      setWrong((w) => w + 1)
      return
    }
    const f = [...found, i]
    setFound(f)
    if (f.length === targets) {
      const score = targets / (targets + wrong)
      const all = [...scores, score]
      setScores(all)
      speak('Alle gefunden!')
      window.setTimeout(() => {
        if (round + 1 >= rounds) {
          const avg = all.reduce((a, b) => a + b, 0) / all.length
          onFinish(avg, `${rounds} Runden, ${Math.round(avg * 100)} % ohne Fehlgriff`)
        } else {
          setRound(round + 1)
          setR(makeRound(level))
          setFound([])
          setWrong(0)
        }
      }, 800)
    }
  }

  const size = portrait ? Math.min(104, Math.floor(700 / s.rows), Math.floor(480 / s.cols)) : Math.min(104, Math.floor(470 / s.rows), Math.floor(900 / s.cols))

  return (
    <div className="game-hunt">
      <div className="hunt-goal">
        <span>Finde alle {goalText} Perlen:</span>
        {r.goal.map((g) => <Bead key={g} color={g} width={56} />)}
        <span className="hunt-count">{found.length} / {targets}</span>
      </div>
      <div className="game-hint">Runde {round + 1} von {rounds}{wrong ? ` · ${wrong} daneben` : ''}</div>
      <div className="hunt-grid" style={{ gridTemplateColumns: `repeat(${s.cols}, ${size}px)` }}>
        {r.cells.map((c, i) => (
          <button
            key={`${round}-${i}`}
            type="button"
            className={found.includes(i) ? 'hunt-cell found' : miss.includes(i) ? 'hunt-cell miss' : 'hunt-cell'}
            style={{ width: size, height: size }}
            aria-label={`Perle ${i + 1}`}
            onClick={() => tap(i)}
          >
            <Bead color={c} width={size * 0.78} />
          </button>
        ))}
      </div>
    </div>
  )
}
