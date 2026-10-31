import { useState } from 'react'
import { Abakus3D } from '../components/Abakus3D'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// „Soroban-Blitzkarten“: Zahl auf dem Soroban ablesen oder den passenden Soroban zur Zahl finden.
// Vor dem Start wählt das Kind 1, 2 oder 3 Stellen. Ab Stufe 8 blitzt die Karte nur kurz auf (Anzan-Training).

const ROUNDS = 10

/** Ähnliche Ablenker: eine Perle mehr/weniger, Himmelsperle vertauscht, Stelle vertauscht */
function ablenker(z: number, stellen: number) {
  const max = 10 ** stellen - 1, min = stellen === 1 ? 0 : 10 ** (stellen - 1)
  const kandidaten = [z + 1, z - 1, z + 5, z - 5, z + 10, z - 10, z + 4, z - 4, Number(String(z).split('').reverse().join(''))]
    .filter((x) => x !== z && x >= min && x <= max)
  const set = new Set<number>()
  for (const x of shuffle(kandidaten)) { if (set.size < 2) set.add(x) }
  while (set.size < 2) { const x = randInt(min, max); if (x !== z) set.add(x) }
  return shuffle([z, ...set])
}

function aufgabe(stellen: number) {
  const z = randInt(stellen === 1 ? 0 : 10 ** (stellen - 1), 10 ** stellen - 1)
  return { z, optionen: ablenker(z, stellen), umgekehrt: Math.random() < 0.5 }
}

export function SorobanKarten({ level, onFinish, rounds = ROUNDS }: GameProps) {
  const [stellen, setStellen] = useState<number | null>(null)
  const [round, setRound] = useState(0)
  const [task, setTask] = useState(() => aufgabe(1))
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [versteckt, setVersteckt] = useState(false)
  const blitz = level >= 8
  const blitzMs = Math.max(700, 2200 - (level - 8) * 120)

  const neu = (s: number) => {
    const t = aufgabe(s)
    setTask(t); setVersteckt(false)
    if (blitz) window.setTimeout(() => setVersteckt(true), blitzMs)
  }
  const starten = (s: number) => { setStellen(s); neu(s) }

  if (stellen === null) return (
    <div className="sk-wahl">
      <div className="game-hint">Wie viele Stellen möchtest du üben?</div>
      <div className="sk-wahl-reihe">
        {[1, 2, 3].map((s) => (
          <button key={s} type="button" className="sk-wahl-knopf" onClick={() => starten(s)}>
            <b>{s}</b><span>{s === 1 ? 'Stelle' : 'Stellen'}</span><small>{s === 1 ? '0 – 9' : s === 2 ? '10 – 99' : '100 – 999'}</small>
          </button>
        ))}
      </div>
    </div>
  )

  const colw = stellen === 1 ? 70 : stellen === 2 ? 56 : 42
  const pick = (v: number) => {
    if (picked !== null) return
    setPicked(v); setVersteckt(false)
    const ok = v === task.z
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
    window.setTimeout(() => {
      setPicked(null)
      if (round + 1 >= rounds) onFinish(c / rounds, `${c} von ${rounds} Karten richtig`)
      else { setRound(round + 1); neu(stellen) }
    }, ok ? 900 : 1900)
  }
  const kl = (v: number) => picked === null ? 'sk-option' : v === task.z ? 'sk-option right' : v === picked ? 'sk-option wrong' : 'sk-option dim'

  return (
    <div className="sk">
      <div className="game-hint">Karte {round + 1} von {rounds} · {task.umgekehrt ? 'Welcher Soroban zeigt die Zahl?' : 'Welche Zahl zeigt der Soroban?'}</div>
      <div className={`sk-karte ${versteckt ? 'zu' : ''}`}>
        {versteckt ? <span className="sk-frage">?</span>
          : task.umgekehrt ? <span className="sk-zahl">{task.z}</span>
          : <Abakus3D value={task.z} cols={stellen} colw={colw + 14} />}
      </div>
      <div className="sk-optionen">
        {task.optionen.map((v) => (
          <button key={v} type="button" className={kl(v)} disabled={picked !== null} onClick={() => pick(v)} aria-label={task.umgekehrt ? 'Soroban' : String(v)}>
            {task.umgekehrt ? <Abakus3D value={v} cols={stellen} colw={Math.round(colw * .55)} /> : <span>{v}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
