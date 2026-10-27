import { useState } from 'react'
import { Abakus3D } from '../components/Abakus3D'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// „Zahlen vergleichen“ (aus Anzan Meister): Zahlen auf dem Abakus ablesen und die größte oder kleinste antippen.
// Stufe 1–5: eine Stange, große Unterschiede · 6–10: ähnlich, auch „kleiner“ · 11–15: zwei Stangen · ab 16: drei Abakusse.

const ROUNDS = 8

function setup(level: number) {
  const cols = level <= 10 ? 1 : level <= 17 ? 2 : 3
  const anzahl = level >= 16 ? 3 : 2
  const kleiner = level >= 6 && Math.random() < 0.5
  const minAbstand = level <= 5 ? 3 : 1
  return { cols, anzahl, kleiner, minAbstand }
}

function aufgabe(level: number) {
  const { cols, anzahl, kleiner, minAbstand } = setup(level)
  const max = 10 ** cols - 1
  const nah = level % 5 >= 3 // knifflig: Zahlen liegen nah beieinander
  const basis = randInt(cols === 1 ? 0 : 10 ** (cols - 1), max)
  const werte = new Set<number>([basis])
  while (werte.size < anzahl) {
    const w = nah ? basis + randInt(-Math.max(minAbstand, 9), Math.max(minAbstand, 9)) : randInt(0, max)
    if (w >= 0 && w <= max && [...werte].every((v) => Math.abs(v - w) >= minAbstand)) werte.add(w)
  }
  const liste = shuffle([...werte])
  const ziel = kleiner ? Math.min(...liste) : Math.max(...liste)
  return { liste, ziel, kleiner, cols }
}

export function ZahlenVergleichen({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const [round, setRound] = useState(0)
  const [task, setTask] = useState(() => aufgabe(level))
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const frage = task.liste.length > 2 ? (task.kleiner ? 'Welche Zahl ist am kleinsten?' : 'Welche Zahl ist am größten?') : task.kleiner ? 'Welche Zahl ist kleiner?' : 'Welche Zahl ist größer?'
  const colw = task.cols === 1 ? 70 : task.cols === 2 ? 52 : 34

  const pick = (v: number) => {
    if (picked !== null) return
    setPicked(v)
    const ok = v === task.ziel
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
    window.setTimeout(() => {
      setPicked(null)
      if (round + 1 >= rounds) onFinish(c / rounds, `${c} von ${rounds} richtig verglichen`)
      else { setRound(round + 1); setTask(aufgabe(level)) }
    }, ok ? 900 : 1800)
  }

  return (
    <div className="zv">
      <div className="game-hint">Aufgabe {round + 1} von {rounds} · {frage}</div>
      <div className="zv-reihe">
        {task.liste.map((v) => (
          <button key={v} type="button" disabled={picked !== null} onClick={() => pick(v)} aria-label={`Abakus ${picked !== null ? v : ''}`}
            className={picked === null ? 'zv-karte' : v === task.ziel ? 'zv-karte right' : v === picked ? 'zv-karte wrong' : 'zv-karte dim'}>
            <Abakus3D value={v} cols={task.cols} colw={colw} />
            {picked !== null && <span className="zv-zahl">{v}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
