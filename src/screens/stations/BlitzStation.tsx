import { useEffect, useRef, useState } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus3D } from '../../components/Abakus3D'
import { Icon } from '../../components/Icon'
import { describeNumber, randomIn, type UnitContent } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { klasseVon } from '../../lib/klasse'
import { speak } from '../../lib/speak'
import { SAY, STATION_INTRO } from '../../data/sprache'
import { Keypad, StationDone, StationShell } from './StationShell'
import { typeDigit } from '../../lib/typeDigit'

/** Anzeigedauer des Abakus in ms – für alle Kinder gleich */

type Phase = 'ready' | 'flash' | 'answer' | 'right' | 'wrong'

const randomNumbers = (range: [number, number], COUNT: number) => {
  const out: number[] = []
  while (out.length < COUNT) out.push(randomIn(range, out[out.length - 1]))
  return out
}

const starsFor = (errors: number) => (errors === 0 ? 3 : errors <= 2 ? 2 : 1)

export function BlitzStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  // Klasse bestimmt Anzahl und Blitzdauer
  const [{ aufgaben: COUNT, blitzMs: FLASH_MS }] = useState(() => klasseVon(kidId))
  const [numbers] = useState(() => randomNumbers(content.range, COUNT))
  const [input, setInput] = useState('')
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  const [results, setResults] = useState<('right' | 'wrong')[]>([])
  const [streak, setStreak] = useState(0)
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const [started, setStarted] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  // Rechen-Einheit: der Abakus blitzt die Startzahl, gefragt ist Startzahl + add
  const shown = numbers[index]
  const n = content.add ? shown + content.add : shown

  // Ablauf je Aufgabe: kurz „Achtung“, dann blitzt der Abakus auf.
  useEffect(() => {
    if (!started) return
    if (phase === 'ready') {
      void speak(SAY.achtung)
      timer.current = window.setTimeout(() => setPhase('flash'), 1100)
    }
    if (phase === 'answer') void speak(content.add ? [SAY.rechne, String(shown), SAY.plus, String(content.add), SAY.wievielIst] : SAY.welcheZahlWar)
    if (phase === 'flash') timer.current = window.setTimeout(() => setPhase('answer'), FLASH_MS)
    return () => window.clearTimeout(timer.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, started, FLASH_MS])

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
    if (phase !== 'answer') return
    const t = typeDigit(input, k, n)
    setInput(t.input)
    if (!t.done) return
    const ok = Number(t.input) === n
    const res = [...results, ok ? 'right' as const : 'wrong' as const]
    setResults(res)
    setStreak(ok ? streak + 1 : 0)
    setPhase(ok ? 'right' : 'wrong')
    void speak(ok ? SAY.richtig : [SAY.esWar, String(n)])
    window.setTimeout(() => { setInput(''); next(res) }, ok ? 900 : 2200)
  }

  const dots = numbers.map((_, i) => results[i] ?? (i === index ? 'current' : 'open'))
  const showAbakus = phase === 'flash' || phase === 'wrong'

  return (
    <StationShell station="blitz" title={content.add ? `Blitz-Abakus: +${content.add}` : 'Blitz-Abakus: Welche Zahl war es?'} dots={dots} perlen={results.filter((r) => r === 'right').length} intro={STATION_INTRO.blitz} started={started} onStart={() => setStarted(true)} say={phase === 'answer' ? SAY.welcheZahlWar : undefined}>
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
            {showAbakus && <Abakus3D key={index} value={phase === 'wrong' ? n : shown} cols={content.cols} colw={content.cols > 1 ? 100 : 120} />}
            {(phase === 'answer' || phase === 'right') && (
              <div className={phase === 'right' ? 'blitz-cover right' : 'blitz-cover'}>
                {phase === 'right' ? n : input || '?'}
              </div>
            )}
          </div>
          </Fit>
          <div className={`blitz-say ${phase}`} role="status">
            {phase === 'ready' && 'Gleich blitzt der Abakus auf. Schau genau hin!'}
            {phase === 'flash' && (content.add ? `Merk dir die Zahl – gleich rechnest du +${content.add}!` : 'Merk dir die Perlen!')}
            {phase === 'answer' && (content.add ? `Es war die ${shown}. Rechne ${shown} + ${content.add}!` : 'Welche Zahl war es? Tippe sie ein.')}
            {phase === 'right' && 'Richtig! Blitzschnell.'}
            {phase === 'wrong' && (content.add ? `${shown} + ${content.add} = ${n}` : `Es war die ${n}: ${describeNumber(n)}.`)}
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
