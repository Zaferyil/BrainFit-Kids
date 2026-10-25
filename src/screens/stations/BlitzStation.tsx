import { useEffect, useRef, useState } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { describeDigit, type UnitContent } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { Keypad, StationDone, StationShell } from './StationShell'

const COUNT = 10
/** Anzeigedauer des Abakus in ms – für alle Kinder gleich */
const FLASH_MS = 1500

type Phase = 'ready' | 'flash' | 'answer' | 'right' | 'wrong'

const randomDigits = () => {
  const out: number[] = []
  while (out.length < COUNT) {
    const n = 1 + Math.floor(Math.random() * 9)
    if (n !== out[out.length - 1]) out.push(n)
  }
  return out
}

const starsFor = (errors: number) => (errors === 0 ? 3 : errors <= 2 ? 2 : 1)

export function BlitzStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  const [numbers] = useState(randomDigits)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [results, setResults] = useState<('right' | 'wrong')[]>([])
  const [streak, setStreak] = useState(0)
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const n = numbers[index]

  // Ablauf je Aufgabe: kurz „Achtung“, dann blitzt der Abakus auf.
  useEffect(() => {
    if (phase === 'ready') timer.current = window.setTimeout(() => setPhase('flash'), 900)
    if (phase === 'flash') timer.current = window.setTimeout(() => setPhase('answer'), FLASH_MS)
    return () => window.clearTimeout(timer.current)
  }, [phase, index])

  const next = (res: ('right' | 'wrong')[]) => {
    if (index + 1 >= COUNT) {
      const errors = res.filter((r) => r === 'wrong').length
      const stars = starsFor(errors)
      setDone({ stars, perlen: finishStation(kidId, 'blitz', stars, COUNT - errors) })
    } else {
      setIndex(index + 1)
      setPhase('ready')
    }
  }

  const onKey = (k: string) => {
    if (phase !== 'answer' || k === 'C' || k === 'del') return
    const ok = Number(k) === n
    const res = [...results, ok ? 'right' as const : 'wrong' as const]
    setResults(res)
    setStreak(ok ? streak + 1 : 0)
    setPhase(ok ? 'right' : 'wrong')
    speak(ok ? 'Richtig!' : `Es war die ${n}.`)
    window.setTimeout(() => next(res), ok ? 900 : 2200)
  }

  const dots = numbers.map((_, i) => results[i] ?? (i === index ? 'current' : 'open'))
  const showAbakus = phase === 'flash' || phase === 'wrong'

  return (
    <StationShell station="blitz" title="Blitz-Abakus: Welche Zahl war es?" dots={dots} perlen={results.filter((r) => r === 'right').length}>
      <div className="blitz">
        <aside className="blitz-side">
          <div className="blitz-stat">
            <span className="eyebrow light">TEMPO</span>
            <strong>{(FLASH_MS / 1000).toLocaleString('de-DE')} s</strong>
          </div>
          <div className={streak >= 2 ? 'blitz-streak on' : 'blitz-streak'}>
            <Icon name="flame" color="#231A4F" fill={streak >= 2 ? '#FFC531' : 'none'} size={28} />
            <span>{streak >= 2 ? `${streak}er-Serie!` : 'Serie'}</span>
          </div>
        </aside>

        <div className="blitz-stage">
          <div className="blitz-count">Aufgabe {index + 1} von {COUNT}</div>
          <Fit className="board-fit">
          <div className="blitz-window">
            {phase === 'ready' && <div className="blitz-ready"><Icon name="bolt" color="#FFC531" fill="#FFC531" size={72} /> Achtung …</div>}
            {showAbakus && <Abakus key={index} value={n} cols={content.cols} colw={120} interactive={false} />}
            {(phase === 'answer' || phase === 'right') && (
              <div className={phase === 'right' ? 'blitz-cover right' : 'blitz-cover'}>
                {phase === 'right' ? n : '?'}
              </div>
            )}
          </div>
          </Fit>
          <div className={`blitz-say ${phase}`} role="status">
            {phase === 'ready' && 'Gleich blitzt der Abakus auf. Schau genau hin!'}
            {phase === 'flash' && 'Merk dir die Perlen!'}
            {phase === 'answer' && 'Welche Zahl war es? Tippe sie ein.'}
            {phase === 'right' && 'Richtig! Blitzschnell.'}
            {phase === 'wrong' && `Es war die ${n}: ${describeDigit(n)}.`}
          </div>
        </div>

        <div className="practice-side">
          <Keypad onKey={onKey} disabled={phase !== 'answer'} />
        </div>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Blitzschnell und fehlerfrei!' : 'Deine Augen werden immer schneller.'} />}
    </StationShell>
  )
}
