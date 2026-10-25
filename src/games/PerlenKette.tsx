import { useEffect, useState } from 'react'
import { Bead, type BeadColor } from '../components/Bead'
import { speak } from '../lib/speak'
import { randInt, type GameProps } from './types'

const COLORS: BeadColor[] = ['yellow', 'green', 'orange', 'blue', 'purple', 'pink']
const ROUNDS = 5

/** Stufe → Kettenlänge, Anzahl Perlen, Tempo, Rückwärts */
function chainSettings(level: number) {
  return {
    length: Math.min(9, 3 + Math.floor((level - 1) / 3)),
    beads: level < 7 ? 4 : 6,
    lightMs: Math.max(350, 800 - level * 22),
    backwards: level >= 12,
  }
}

type Phase = 'show' | 'input' | 'right' | 'wrong'

export function PerlenKette({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const s = chainSettings(level)
  const [round, setRound] = useState(0)
  const [seq, setSeq] = useState(() => Array.from({ length: s.length }, () => randInt(0, s.beads - 1)))
  const [phase, setPhase] = useState<Phase>('show')
  const [lit, setLit] = useState<number | null>(null)
  const [input, setInput] = useState<number[]>([])
  const [correct, setCorrect] = useState(0)
  // ab Stufe 12 jede zweite Runde rückwärts
  const backwards = s.backwards && round % 2 === 1

  useEffect(() => {
    if (phase !== 'show') return
    const timers: number[] = []
    const start = 900
    seq.forEach((b, i) => {
      timers.push(window.setTimeout(() => setLit(b), start + i * (s.lightMs + 250)))
      timers.push(window.setTimeout(() => setLit(null), start + i * (s.lightMs + 250) + s.lightMs))
    })
    timers.push(window.setTimeout(() => setPhase('input'), start + seq.length * (s.lightMs + 250)))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [phase, seq, s.lightMs])

  const target = backwards ? seq.slice().reverse() : seq

  const tap = (b: number) => {
    if (phase !== 'input') return
    const next = [...input, b]
    setInput(next)
    setLit(b)
    window.setTimeout(() => setLit(null), 200)
    const i = next.length - 1
    if (next[i] !== target[i] || next.length === target.length) {
      const ok = next[i] === target[i]
      const c = correct + (ok ? 1 : 0)
      setCorrect(c)
      setPhase(ok ? 'right' : 'wrong')
      speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
      window.setTimeout(() => {
        if (round + 1 >= rounds) { onFinish(c / rounds, `${c} von ${rounds} Ketten richtig, ${s.length} Perlen lang`); return }
        setRound(round + 1)
        setSeq(Array.from({ length: s.length }, () => randInt(0, s.beads - 1)))
        setInput([])
        setPhase('show')
      }, 1400)
    }
  }

  const say = {
    show: 'Schau genau: Welche Perlen leuchten?',
    input: backwards ? 'Rückwärts! Tippe die Perlen von hinten nach vorne.' : 'Jetzt du! Tippe die Perlen in der gleichen Reihenfolge.',
    right: 'Richtig! Super gemerkt.',
    wrong: 'Fast! Die nächste Kette kommt gleich.',
  }[phase]

  return (
    <div className="game-chain">
      <div className="game-hint">Kette {round + 1} von {rounds} · {s.length} Perlen{backwards ? ' · rückwärts' : ''}</div>
      <div className="chain-slots" aria-label="Deine Eingabe">
        {target.map((_, i) => (
          <span key={i} className={i < input.length ? `chain-slot filled ${phase}` : 'chain-slot'}>
            {i < input.length && <Bead color={COLORS[input[i]]} width={44} />}
          </span>
        ))}
      </div>
      <div className="chain-rod">
        <div className="chain-bar" />
        {COLORS.slice(0, s.beads).map((c, b) => (
          <button
            key={c}
            type="button"
            className={lit === b ? 'chain-bead lit' : 'chain-bead'}
            disabled={phase !== 'input'}
            onClick={() => tap(b)}
            aria-label={`Perle ${b + 1}`}
          >
            <Bead color={c} width={130} />
          </button>
        ))}
      </div>
      <div className={`game-say ${phase}`} role="status">{say}</div>
    </div>
  )
}
