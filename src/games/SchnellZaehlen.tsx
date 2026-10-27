import { useEffect, useState } from 'react'
import { Bead, type BeadColor } from '../components/Bead'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// „Speed Zählen“ (aus Anzan Meister): Ein Feld mit Perlen blitzt kurz auf – wie viele Perlen hatten die gesuchte Farbe?
// Mehr Perlen und kürzere Zeit mit steigender Stufe.

const ROUNDS = 6
const FARBEN: { id: BeadColor; name: string }[] = [
  { id: 'yellow', name: 'gelbe' }, { id: 'green', name: 'grüne' }, { id: 'blue', name: 'blaue' }, { id: 'pink', name: 'rosa' }, { id: 'orange', name: 'orange' },
]

function setup(level: number) {
  const felder = Math.min(20, 6 + level)
  const farben = level <= 5 ? 2 : level <= 12 ? 3 : 4
  const sekunden = Math.max(1.5, 4.5 - level * 0.15)
  return { felder, farben, sekunden }
}

function aufgabe(level: number) {
  const { felder, farben } = setup(level)
  const palette = shuffle(FARBEN).slice(0, farben)
  const ziel = palette[0]
  const perlen = Array.from({ length: felder }, () => palette[randInt(0, farben - 1)].id)
  const anzahl = perlen.filter((p) => p === ziel.id).length
  const optionen = new Set([anzahl])
  for (const d of shuffle([-2, -1, 1, 2, 3])) if (optionen.size < 4 && anzahl + d >= 0) optionen.add(anzahl + d)
  return { perlen, ziel, anzahl, optionen: [...optionen].sort((a, b) => a - b) }
}

export function SchnellZaehlen({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const { sekunden } = setup(level)
  const [round, setRound] = useState(0)
  const [task, setTask] = useState(() => aufgabe(level))
  const [phase, setPhase] = useState<'zeigen' | 'antworten'>('zeigen')
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  useEffect(() => {
    if (phase !== 'zeigen') return
    const t = window.setTimeout(() => setPhase('antworten'), sekunden * 1000)
    return () => window.clearTimeout(t)
  }, [phase, sekunden, round])

  const pick = (n: number) => {
    if (picked !== null) return
    setPicked(n)
    const ok = n === task.anzahl
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
    window.setTimeout(() => {
      setPicked(null)
      if (round + 1 >= rounds) onFinish(c / rounds, `${c} von ${rounds} richtig gezählt`)
      else { setRound(round + 1); setTask(aufgabe(level)); setPhase('zeigen') }
    }, ok ? 900 : 2200)
  }

  return (
    <div className="sz">
      <div className="game-hint">Runde {round + 1} von {rounds} · Zähle die <b className={`sz-farbe ${task.ziel.id}`}>{task.ziel.name}</b> Perlen!</div>
      <div className={phase === 'zeigen' || picked !== null ? 'sz-feld' : 'sz-feld zu'}>
        {task.perlen.map((p, i) => (
          <span key={i} className={picked !== null && p !== task.ziel.id ? 'sz-perle dim' : 'sz-perle'}><Bead color={p} width={58} /></span>
        ))}
        {phase === 'antworten' && picked === null && <div className="sz-deckel">Wie viele?</div>}
      </div>
      {phase === 'zeigen' && <div className="zm-uhr"><span style={{ animationDuration: `${sekunden}s` }} /></div>}
      {phase === 'antworten' && (
        <div className="sz-optionen">
          {task.optionen.map((n) => (
            <button key={n} type="button" disabled={picked !== null} onClick={() => pick(n)}
              className={picked === null ? 'sz-opt' : n === task.anzahl ? 'sz-opt right' : n === picked ? 'sz-opt wrong' : 'sz-opt dim'}>{n}</button>
          ))}
        </div>
      )}
    </div>
  )
}
