import { useEffect, useState } from 'react'
import { speak } from '../lib/speak'
import { Keypad } from '../screens/stations/StationShell'
import { randInt, type GameProps } from './types'

// „Zahlen merken“ (aus Anzan Meister): Ziffern ansehen, merken und danach eintippen.
// Mehr Ziffern mit steigender Stufe; ab Stufe 13 rückwärts eintippen.

const ROUNDS = 6

function setup(level: number) {
  const anzahl = Math.min(8, 2 + Math.floor((level + 1) / 3))
  const rueckwaerts = level >= 13
  return { anzahl, rueckwaerts, sekunden: 1.2 + anzahl * 0.8 }
}

const reihe = (n: number) => Array.from({ length: n }, () => randInt(1, 9))

export function ZahlenMerken({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const { anzahl, rueckwaerts, sekunden } = setup(level)
  const [round, setRound] = useState(0)
  const [ziffern, setZiffern] = useState(() => reihe(anzahl))
  const [phase, setPhase] = useState<'zeigen' | 'tippen' | 'fertig'>('zeigen')
  const [input, setInput] = useState('')
  const [correct, setCorrect] = useState(0)
  const ziel = (rueckwaerts ? [...ziffern].reverse() : ziffern).join('')

  useEffect(() => {
    if (phase !== 'zeigen') return
    const t = window.setTimeout(() => {
      setPhase('tippen')
      speak(rueckwaerts ? 'Tippe die Zahlen rückwärts.' : 'Tippe die Zahlen der Reihe nach.')
    }, sekunden * 1000)
    return () => window.clearTimeout(t)
  }, [phase, sekunden, rueckwaerts])

  const onKey = (k: string) => {
    if (phase !== 'tippen') return
    const next = k === 'C' ? '' : k === 'del' ? input.slice(0, -1) : (input + k).slice(0, anzahl)
    setInput(next)
    if (next.length < anzahl) return
    const ok = next === ziel
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    setPhase('fertig')
    speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
    window.setTimeout(() => {
      if (round + 1 >= rounds) onFinish(c / rounds, `${c} von ${rounds} Reihen richtig gemerkt`)
      else { setRound(round + 1); setZiffern(reihe(anzahl)); setInput(''); setPhase('zeigen') }
    }, ok ? 900 : 2000)
  }

  return (
    <div className="zm">
      <div className="game-hint">Reihe {round + 1} von {rounds} · {phase === 'zeigen' ? 'Merk dir die Zahlen!' : rueckwaerts ? 'Jetzt rückwärts eintippen' : 'Jetzt der Reihe nach eintippen'}</div>
      <div className="zm-reihe">
        {ziffern.map((z, i) => {
          const zeig = phase === 'zeigen' ? String(z) : phase === 'fertig' ? ziel[i] : input[i] ?? ''
          const cls = phase === 'fertig' ? (input[i] === ziel[i] ? 'zm-feld right' : 'zm-feld wrong') : phase === 'zeigen' ? 'zm-feld zeigen' : 'zm-feld'
          return <span key={i} className={cls}>{zeig}</span>
        })}
      </div>
      {phase === 'zeigen' && <div className="zm-uhr"><span style={{ animationDuration: `${sekunden}s` }} /></div>}
      <div className="zm-tasten"><Keypad onKey={onKey} disabled={phase !== 'tippen'} /></div>
    </div>
  )
}
