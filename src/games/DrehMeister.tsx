import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'
import { SpielKopf, useEinmal } from './spielTeile'

// „Dreh-Meister“: Oben eine Perlen-Form. Welche Form unten ist dieselbe – nur gedreht? (Gespiegelte zählen nicht!)
// Stufe 1–4: 3–4 Perlen, nur 90°-Drehungen, Ablenker ganz andere Formen · 5–9: 4–5 Perlen, alle Drehungen
// · ab 10: 5–6 Perlen, Ablenker sind Spiegelbilder · ab 14: zwei Farben in der Form (die Farben drehen mit).

const RUNDEN = 8
type Zelle = [number, number, number] // x, y, Farbe
const FARBEN = ['#FF4D6D', '#3BA7FF', '#FFC531']

function form(n: number, farben: number): Zelle[] {
  const z: Zelle[] = [[0, 0, 0]]
  while (z.length < n) {
    const [x, y] = z[randInt(0, z.length - 1)]
    const [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][randInt(0, 3)]
    if (!z.some(([a, b]) => a === x + dx && b === y + dy)) z.push([x + dx, y + dy, randInt(0, farben - 1)])
  }
  return norm(z)
}
const norm = (z: Zelle[]): Zelle[] => { const mx = Math.min(...z.map((c) => c[0])), my = Math.min(...z.map((c) => c[1])); return z.map(([x, y, f]) => [x - mx, y - my, f] as Zelle).sort((a, b) => a[1] - b[1] || a[0] - b[0]) }
const drehe = (z: Zelle[], mal: number): Zelle[] => { let r = z; for (let i = 0; i < mal; i++) r = r.map(([x, y, f]) => [-y, x, f] as Zelle); return norm(r) }
const spiegle = (z: Zelle[]): Zelle[] => norm(z.map(([x, y, f]) => [-x, y, f] as Zelle))
const key = (z: Zelle[]) => z.map((c) => c.join(',')).join(';')

function aufgabe(stufe: number) {
  const n = stufe <= 4 ? randInt(3, 4) : stufe <= 9 ? randInt(4, 5) : randInt(5, 6)
  const farben = stufe >= 14 ? 2 : 1
  for (;;) {
    const f = form(n, farben)
    const alleDreh = [0, 1, 2, 3].map((m) => key(drehe(f, m)))
    const spiegelDreh = [0, 1, 2, 3].map((m) => key(drehe(spiegle(f), m)))
    if (spiegelDreh.some((k) => alleDreh.includes(k))) continue // symmetrisch → Spiegelbild wäre auch „richtig“
    const richtig = drehe(f, stufe <= 4 ? randInt(1, 3) % 2 ? 1 : 3 : randInt(1, 3))
    const ablenker: Zelle[][] = []
    for (let i = 0; ablenker.length < 3 && i < 100; i++) {
      const a = stufe >= 10 || Math.random() < 0.3 ? drehe(spiegle(f), randInt(0, 3)) : form(n, farben)
      const k = key(a)
      if (alleDreh.includes(k) || ablenker.some((b) => key(b) === k)) continue
      ablenker.push(a)
    }
    if (ablenker.length < 3) continue
    return { vorbild: f, richtig, optionen: shuffle([richtig, ...ablenker]) }
  }
}

function Form({ z, gross = 22 }: { z: Zelle[]; gross?: number }) {
  const w = Math.max(...z.map((c) => c[0])) + 1, h = Math.max(...z.map((c) => c[1])) + 1
  return (
    <svg viewBox={`0 0 ${w * gross} ${h * gross}`} width={w * gross} height={h * gross} className="dm-form" aria-hidden="true">
      {z.map(([x, y, f], i) => <rect key={i} x={x * gross + 1.5} y={y * gross + 1.5} width={gross - 3} height={gross - 3} rx={gross * 0.28} fill={FARBEN[f]} stroke="#231A4F" strokeWidth="1.5" />)}
    </svg>
  )
}

export function DrehMeister({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const stufe = level + Math.floor(richtig / 3)
  const [a, setA] = useState(() => aufgabe(level))
  const [wahl, setWahl] = useState<number | null>(null)
  const ende = useEinmal(onFinish)

  const tippe = (i: number) => {
    if (wahl !== null) return
    const ok = a.optionen[i] === a.richtig
    setWahl(i)
    const r = richtig + (ok ? 1 : 0)
    setRichtig(r)
    if (ok) { tonRichtig(r); void speak('Richtig!') } else tonFalsch()
    window.setTimeout(() => {
      if (runde + 1 >= rounds) { ende(r / rounds, `${r} von ${rounds} gedrehten Formen erkannt`); return }
      setRunde(runde + 1); setA(aufgabe(level + Math.floor(r / 3))); setWahl(null)
    }, ok ? 900 : 1800)
  }

  return (
    <div className="sp">
      <SpielKopf punkte={richtig * 10} />
      <div className="sp-auftrag">Welche Form ist <b>dieselbe</b> – nur <b>gedreht</b>? {stufe >= 10 && <small>Vorsicht: Spiegelbilder zählen nicht!</small>}</div>
      <div className="sp-buehne dm-vorbild"><Form z={a.vorbild} gross={34} /></div>
      <div className="dm-optionen">
        {a.optionen.map((o, i) => (
          <button key={i} type="button" disabled={wahl !== null} onClick={() => tippe(i)}
            className={'dm-option' + (wahl !== null && o === a.richtig ? ' richtig' : wahl === i ? ' falsch' : '')}><Form z={o} /></button>
        ))}
      </div>
      <div className="game-hint">Runde {runde + 1} von {rounds} · Stufe {stufe}</div>
    </div>
  )
}
