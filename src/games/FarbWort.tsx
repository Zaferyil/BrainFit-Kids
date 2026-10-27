import { useEffect, useRef, useState } from 'react'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// „Sag die richtige Farbe!“ (Stroop, aus Anzan Meister): Tippe die Farbe der Schrift, nicht das Wort.
// Wort und Schriftfarbe sind immer verschieden; richtig ist die Schriftfarbe. Mehr Farben und weniger Zeit mit steigender Stufe.

const FARBEN = [
  { wort: 'ROT', farbe: '#FF3B5C' },
  { wort: 'BLAU', farbe: '#2F7BFF' },
  { wort: 'GRÜN', farbe: '#22B35E' },
  { wort: 'GELB', farbe: '#F2B705' },
  { wort: 'LILA', farbe: '#9B5CFF' },
  { wort: 'ORANGE', farbe: '#FF8A1F' },
]
const ROUNDS = 10

function setup(level: number) {
  const anzahl = level <= 4 ? 3 : level <= 10 ? 4 : level <= 15 ? 5 : 6
  const zeit = Math.max(2.2, 6 - level * 0.18) // Sekunden pro Aufgabe
  return { anzahl, zeit }
}

function aufgabe(level: number) {
  const { anzahl } = setup(level)
  const farben = shuffle(FARBEN).slice(0, anzahl)
  const wort = farben[randInt(0, anzahl - 1)]
  const tinte = shuffle(farben.filter((f) => f !== wort))[0]
  return { farben, wort: wort.wort, tinte }
}

export function FarbWort({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const [round, setRound] = useState(0)
  const [task, setTask] = useState(() => aufgabe(level))
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [left, setLeft] = useState(1)
  const { zeit } = setup(level)
  const done = useRef(false)

  const weiter = (ok: boolean, wahl: string) => {
    if (done.current) return
    done.current = true
    setPicked(wahl)
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
    window.setTimeout(() => {
      if (round + 1 >= rounds) onFinish(c / rounds, `${c} von ${rounds} Farben richtig`)
      else { done.current = false; setPicked(null); setRound(round + 1); setTask(aufgabe(level)) }
    }, ok ? 700 : 1400)
  }

  // Zeitbalken: läuft die Zeit ab, zählt die Aufgabe als falsch
  useEffect(() => {
    if (picked) return
    const start = performance.now()
    let raf = 0
    const tick = () => {
      const rest = 1 - (performance.now() - start) / (zeit * 1000)
      setLeft(Math.max(0, rest))
      if (rest <= 0) weiter(false, '')
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, picked])

  return (
    <div className="fw">
      <div className="game-hint">Farbe {round + 1} von {rounds} · Welche Farbe hat die Schrift?</div>
      <div className="fw-zeit"><span style={{ width: `${left * 100}%` }} /></div>
      <div className={picked === null ? 'fw-wort' : picked === task.tinte.wort ? 'fw-wort right' : 'fw-wort wrong'} style={{ color: task.tinte.farbe }}>{task.wort}</div>
      <div className="fw-knoepfe">
        {task.farben.map((f) => (
          <button key={f.wort} type="button" className={picked && f === task.tinte ? 'fw-knopf richtig' : 'fw-knopf'} style={{ background: f.farbe }}
            aria-label={f.wort} disabled={!!picked} onClick={() => weiter(f === task.tinte, f.wort)} />
        ))}
      </div>
    </div>
  )
}
