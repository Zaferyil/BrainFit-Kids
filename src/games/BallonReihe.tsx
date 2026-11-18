import { useEffect, useMemo, useRef, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// „Ballon-Reihe“: Ballons mit Zahlen in der richtigen Reihenfolge platzen lassen (klein → groß, später auch groß → klein).
// Wird schwerer, je weiter das Kind kommt: Startstufe aus dem Spiel-Level, dazu +1 je zwei geschaffte Runden.
// Stufe 1–2: 3 Ballons bis 9 · 3–5: 4 Ballons · 6–8: 5 Ballons bis 20 · 9–12: 6 Ballons bis 99 · ab 13: 7–8 Ballons, nah beieinander,
// ab 10 auch „groß → klein“, ab 7 schweben die Ballons stärker. Kiga/1. Klasse (einstellig): nur Zahlen 1–9.

const SPIELZEIT = 60
const FARBEN = ['#FF4D6D', '#FF8A1F', '#FFC531', '#3DBE5B', '#2CC5E8', '#3BA7FF', '#7B5CFF', '#FF5CB8']

type Ballon = { id: number; n: number; farbe: string }
type Runde = { ballons: Ballon[]; abwaerts: boolean; schweben: number }

let naechsteId = 0

function runde(stufe: number, einstellig: boolean): Runde {
  const anzahl = stufe <= 2 ? 3 : stufe <= 5 ? 4 : stufe <= 8 ? 5 : stufe <= 12 ? 6 : stufe <= 16 ? 7 : 8
  let [min, max] = stufe <= 5 ? [1, 9] : stufe <= 8 ? [1, 20] : [10, 99]
  if (einstellig) [min, max] = [1, 9]
  // ab Stufe 13: Zahlen liegen nah beieinander (z. B. 41–55), das Vergleichen wird kniffliger
  if (!einstellig && stufe >= 13) { const start = randInt(10, 99 - 18); [min, max] = [start, start + 18] }
  const zahlen = new Set<number>()
  while (zahlen.size < Math.min(anzahl, max - min + 1)) zahlen.add(randInt(min, max))
  const farben = shuffle(FARBEN)
  const ballons = shuffle([...zahlen]).map((n, i) => ({ id: naechsteId++, n, farbe: farben[i % farben.length] }))
  const abwaerts = stufe >= 10 && Math.random() < (stufe >= 14 ? 0.5 : 0.3)
  return { ballons, abwaerts, schweben: stufe >= 7 ? Math.min(3, 1 + (stufe - 7) / 4) : 1 }
}

export function BallonReihe({ level, onFinish, rounds, einstellig = false }: GameProps) {
  const [geschafft, setGeschafft] = useState(0)
  const stufe = level + Math.floor(geschafft / 2)
  const [r, setR] = useState(() => runde(level, einstellig))
  const [weg, setWeg] = useState<number[]>([])
  const [falsch, setFalsch] = useState<number | null>(null)
  const [fehler, setFehler] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const [rest, setRest] = useState(SPIELZEIT)
  const [neueRunde, setNeueRunde] = useState(false)
  const fertig = useRef(false)

  const reihenfolge = useMemo(() => [...r.ballons].map((b) => b.n).sort((a, b) => (r.abwaerts ? b - a : a - b)), [r])
  const naechste = reihenfolge[weg.length]

  const beenden = (runden: number, f: number) => {
    if (fertig.current) return
    fertig.current = true
    const ziel = rounds ?? 8
    const score = Math.max(0, Math.min(1, runden / ziel - f * 0.03))
    onFinish(score, `${runden} Runden geschafft${f ? ` · ${f} Fehler` : ' ohne Fehler'}`)
  }

  // Spielzeit (bei der Einstufung zählt stattdessen die Rundenzahl)
  useEffect(() => {
    if (rounds) return
    if (rest <= 0) { beenden(geschafft, fehler); return }
    const t = window.setTimeout(() => setRest((x) => x - 1), 1000)
    return () => window.clearTimeout(t)
  })

  const tippe = (b: Ballon) => {
    if (fertig.current || weg.includes(b.id) || neueRunde) return
    if (b.n !== naechste) {
      setFalsch(b.id); setFehler((f) => f + 1); tonFalsch()
      window.setTimeout(() => setFalsch(null), 450)
      return
    }
    const neu = [...weg, b.id]
    setWeg(neu); setPunkte((p) => p + 10)
    tonRichtig(neu.length)
    if (neu.length < r.ballons.length) return
    // Runde geschafft
    const g = geschafft + 1
    setGeschafft(g); setPunkte((p) => p + 5 * r.ballons.length)
    void speak(g % 3 === 0 ? 'Super!' : 'Richtig!')
    if (rounds && g >= rounds) { window.setTimeout(() => beenden(g, fehler), 600); return }
    setNeueRunde(true)
    window.setTimeout(() => { setR(runde(level + Math.floor(g / 2), einstellig)); setWeg([]); setNeueRunde(false) }, 700)
  }

  const spalten = r.ballons.length <= 4 ? 2 : 3
  return (
    <div className="bal">
      <div className="bal-kopf">
        {!rounds && <div className="bal-zeit" aria-label={`Noch ${rest} Sekunden`}><span>⏳</span><i style={{ width: `${(100 * rest) / SPIELZEIT}%` }} /></div>}
        <div className="bal-punkte">🎓 {punkte}</div>
      </div>
      <div className={'bal-auftrag' + (r.abwaerts ? ' ab' : '')}>
        {r.abwaerts ? <>Von <b>groß</b> nach <b>klein</b> platzen lassen! ⬇️</> : <>Von <b>klein</b> nach <b>groß</b> platzen lassen! ⬆️</>}
      </div>
      <div className="bal-himmel" style={{ gridTemplateColumns: `repeat(${spalten}, 1fr)` }}>
        <span className="bal-wolke w1" /><span className="bal-wolke w2" /><span className="bal-wolke w3" />
        {r.ballons.map((b, i) => {
          const platzt = weg.includes(b.id)
          return (
            <button key={b.id} type="button" onClick={() => tippe(b)} disabled={platzt} aria-label={`Ballon ${b.n}`}
              className={'bal-ballon' + (platzt ? ' platzt' : '') + (falsch === b.id ? ' falsch' : '')}
              style={{ ['--f' as string]: b.farbe, ['--s' as string]: r.schweben, animationDelay: `${(i * 0.37) % 1.8}s` }}>
              <span className="bal-koerper"><b>{b.n}</b></span>
              <span className="bal-knoten" />
              <span className="bal-schnur" />
              {platzt && <span className="bal-puff" aria-hidden="true">✨</span>}
            </button>
          )
        })}
      </div>
      <div className="game-hint">Stufe {stufe} · {geschafft} {geschafft === 1 ? 'Runde' : 'Runden'} geschafft</div>
    </div>
  )
}
