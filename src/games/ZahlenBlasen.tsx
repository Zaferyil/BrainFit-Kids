import { useEffect, useMemo, useRef, useState } from 'react'
import { speak } from '../lib/speak'
import { usePortrait } from '../lib/usePortrait'
import { randInt, shuffle, type GameProps } from './types'

// Zahlen-Blasen (Mathe): Tippe zwei Blasen an, die zusammen die Zielzahl ergeben – dann platzen sie,
// und die Blasen darüber rutschen nach. Das Feld besteht nur aus passenden Paaren, ist also immer lösbar.

type Blase = { id: number; n: number }
const SPALTEN = 5

/** Stufe → Zielzahl und Anzahl Paare (Freunde der 5, der 10, der 20, Zehner zur 100) */
function aufgabe(level: number): { ziel: number; paare: number; zehner: boolean } {
  if (level <= 3) return { ziel: 5, paare: 6, zehner: false }
  if (level <= 9) return { ziel: 10, paare: 9, zehner: false }
  if (level <= 13) return { ziel: 20, paare: 10, zehner: false }
  if (level <= 16) return { ziel: 100, paare: 10, zehner: true }
  return { ziel: randInt(0, 1) ? 15 : 12, paare: 12, zehner: false }
}

function neuesFeld(ziel: number, paare: number, zehner: boolean): Blase[][] {
  const zahlen: number[] = []
  for (let i = 0; i < paare; i++) {
    const a = zehner ? randInt(1, 9) * 10 : randInt(1, ziel - 1)
    zahlen.push(a, ziel - a)
  }
  let id = 0
  const alle = shuffle(zahlen).map((n) => ({ id: id++, n }))
  const spalten: Blase[][] = Array.from({ length: SPALTEN }, () => [])
  alle.forEach((b, i) => spalten[i % SPALTEN].push(b))
  return spalten
}

// Farbe je Zahl (gleiche Zahl = gleiche Farbe hilft beim Suchen)
const FARBEN = ['#FF4D6D', '#FF8A1F', '#FFC531', '#3DBE5B', '#2CC5E8', '#3BA7FF', '#7B5CFF', '#C24DFF', '#FF5CB8', '#8D6E63']
const farbe = (n: number) => FARBEN[(n % 100 >= 10 && n % 10 === 0 ? n / 10 : n) % FARBEN.length]

const ZEIT = 90

export function ZahlenBlasen({ level, onFinish }: GameProps) {
  const { ziel, paare, zehner } = useMemo(() => aufgabe(level), [level])
  const [spalten, setSpalten] = useState(() => neuesFeld(ziel, paare, zehner))
  const [wahl, setWahl] = useState<number | null>(null)
  const [platzt, setPlatzt] = useState<number[]>([])
  const [falsch, setFalsch] = useState<number[]>([])
  const [fehler, setFehler] = useState(0)
  const [geschafft, setGeschafft] = useState(0)
  const [gleichung, setGleichung] = useState<string | null>(null)
  const [rest, setRest] = useState(ZEIT)
  const vorbei = useRef(false)
  const hoch = usePortrait()

  const ende = (gefunden: number, f: number) => {
    if (vorbei.current) return
    vorbei.current = true
    const score = Math.max(0, Math.min(1, gefunden / paare - f * 0.05))
    onFinish(score, `${gefunden} von ${paare} Paaren gefunden${f ? ` · ${f} × daneben` : ''}`)
  }
  useEffect(() => {
    const t = window.setInterval(() => setRest((r) => r - 1), 1000)
    return () => window.clearInterval(t)
  }, [])
  useEffect(() => { if (rest <= 0) ende(geschafft, fehler) })

  const finde = (id: number) => spalten.flat().find((b) => b.id === id)!
  const tippe = (b: Blase) => {
    if (vorbei.current || platzt.includes(b.id)) return
    if (wahl === null) { setWahl(b.id); return }
    if (wahl === b.id) { setWahl(null); return }
    const a = finde(wahl)
    if (a.n + b.n === ziel) {
      const ids = [a.id, b.id]
      setPlatzt(ids); setWahl(null); setGleichung(`${a.n} + ${b.n} = ${ziel}`)
      window.setTimeout(() => {
        setSpalten((s) => s.map((sp) => sp.filter((x) => !ids.includes(x.id))))
        setPlatzt([])
        const g = geschafft + 1
        setGeschafft(g)
        if (g >= paare) { speak('Super gemacht!'); window.setTimeout(() => ende(g, fehler), 700) }
      }, 380)
      window.setTimeout(() => setGleichung(null), 1100)
    } else {
      setFalsch([a.id, b.id]); setFehler(fehler + 1); setWahl(null)
      window.setTimeout(() => setFalsch([]), 450)
    }
  }

  const groesse = hoch ? 62 : 76
  return (
    <div className="game-blasen">
      <div className="blasen-kopf">
        <span className="blasen-ziel">Ziel <b>{ziel}</b></span>
        <span className="blasen-zeit"><i style={{ width: `${(Math.max(0, rest) / ZEIT) * 100}%` }} /></span>
        <span className="blasen-zaehler">{geschafft}/{paare}</span>
      </div>
      <div className="game-hint">Tippe zwei Blasen an, die zusammen {ziel} ergeben!</div>
      <div className="blasen-feld" style={{ height: groesse * Math.ceil((paare * 2) / SPALTEN) + 24 }}>
        {spalten.map((sp, si) => (
          <div key={si} className="blasen-spalte">
            {sp.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`blase${wahl === b.id ? ' gewaehlt' : ''}${platzt.includes(b.id) ? ' platzt' : ''}${falsch.includes(b.id) ? ' falsch' : ''}`}
                style={{ width: groesse, height: groesse, background: `radial-gradient(circle at 32% 28%, #FFFFFFcc 0 12%, ${farbe(b.n)} 45%, ${farbe(b.n)}dd 70%, #00000055 100%)`, fontSize: groesse * (b.n >= 10 ? 0.4 : 0.5) }}
                onClick={() => tippe(b)}
                aria-label={`Zahl ${b.n}`}
              >{b.n}</button>
            ))}
          </div>
        ))}
        {gleichung && <div className="blasen-gleichung">{gleichung} ✓</div>}
      </div>
    </div>
  )
}
