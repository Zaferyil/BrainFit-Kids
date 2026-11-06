import { tonFalsch, tonRichtig } from '../lib/effekte'
import { useState } from 'react'
import { Abakus3D } from '../components/Abakus3D'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// „Abakus-Rechnen“: zwei Abakusse nebeneinander, dazwischen + oder −, darunter drei Antworten.
// Das Kind wählt Plus oder Minus und 1 oder 2 Stellen. Höhere Stufe: größere Zahlen innerhalb der Stellen.

const ROUNDS = 10
type Art = 'plus' | 'minus'

function aufgabe(art: Art, stellen: number, level: number) {
  const max = stellen === 1 ? Math.min(9, 4 + Math.ceil(level / 3)) : Math.min(99, 20 + level * 5)
  let a = randInt(1, max), b = randInt(1, max)
  if (art === 'plus') { while (a + b > (stellen === 1 ? 18 : 198)) b = randInt(1, max) }
  else if (b > a) [a, b] = [b, a]
  const ergebnis = art === 'plus' ? a + b : a - b
  const falsch = new Set<number>()
  for (const d of shuffle([1, -1, 2, -2, 5, -5, 10, -10])) {
    const x = ergebnis + d
    if (x >= 0 && falsch.size < 2) falsch.add(x)
  }
  return { a, b, ergebnis, optionen: shuffle([ergebnis, ...falsch]) }
}

export function AbakusRechnen({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const [art, setArt] = useState<Art | null>(null)
  const [stellen, setStellen] = useState(1)
  const [round, setRound] = useState(0)
  const [task, setTask] = useState(() => aufgabe('plus', 1, level))
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  if (art === null) return (
    <div className="sk-wahl">
      <div className="game-hint">Was möchtest du rechnen?</div>
      <div className="ar-wahl">
        <button type="button" className="sk-wahl-knopf ar-plus" onClick={() => { setArt('plus'); setTask(aufgabe('plus', stellen, level)) }}><b>+</b><span>Plus</span></button>
        <button type="button" className="sk-wahl-knopf ar-minus" onClick={() => { setArt('minus'); setTask(aufgabe('minus', stellen, level)) }}><b>−</b><span>Minus</span></button>
      </div>
      <div className="ar-stellen" role="group" aria-label="Stellen">
        {[1, 2].map((s) => <button key={s} type="button" aria-pressed={stellen === s} onClick={() => setStellen(s)}>{s === 1 ? 'Einer (1–9)' : 'Zehner (10–99)'}</button>)}
      </div>
    </div>
  )

  const cols = task.a > 9 || task.b > 9 ? 2 : 1
  const colw = cols === 1 ? 54 : 38
  const pick = (v: number) => {
    if (picked !== null) return
    setPicked(v)
    const ok = v === task.ergebnis
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    if (ok) tonRichtig(c); else tonFalsch()
    speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
    window.setTimeout(() => {
      setPicked(null)
      if (round + 1 >= rounds) onFinish(c / rounds, `${c} von ${rounds} Aufgaben richtig`)
      else { setRound(round + 1); setTask(aufgabe(art, stellen, level)) }
    }, ok ? 900 : 1900)
  }
  const kl = (v: number) => picked === null ? 'sk-option' : v === task.ergebnis ? 'sk-option right' : v === picked ? 'sk-option wrong' : 'sk-option dim'

  return (
    <div className="sk">
      <div className="game-hint">Aufgabe {round + 1} von {rounds} · Wie viel ist das?</div>
      <div className="ar-aufgabe">
        <div className="ar-karte"><Abakus3D value={task.a} cols={cols} colw={colw} /></div>
        <span className="ar-zeichen">{art === 'plus' ? '+' : '−'}</span>
        <div className="ar-karte"><Abakus3D value={task.b} cols={cols} colw={colw} /></div>
      </div>
      {picked !== null && <div className="ar-loesung">{task.a} {art === 'plus' ? '+' : '−'} {task.b} = {task.ergebnis}</div>}
      <div className="sk-optionen">
        {task.optionen.map((v) => <button key={v} type="button" className={kl(v)} disabled={picked !== null} onClick={() => pick(v)}><span>{v}</span></button>)}
      </div>
    </div>
  )
}
