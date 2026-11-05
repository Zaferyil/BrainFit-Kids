import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { speak } from '../lib/speak'
import { usePortrait } from '../lib/usePortrait'
import { randInt, type GameProps } from './types'

// Zahlen-Blasen (Mathe): Von oben fallen Zahlen-Blasen in fünf Säulen (wie bei Tetris).
// Tippe zwei Blasen an, die zusammen die Zielzahl ergeben – sie platzen, und es gibt sofort ein neues Ziel.
// Erreicht eine Säule den oberen Rand, ist das Spiel vorbei. Ziel: schnell UND richtig rechnen.

type Blase = { id: number; n: number; neu?: boolean }
const SPALTEN = 5
const REIHEN = 8

/** Stufe → Zahlenraum der Ziele, Anzahl Paare bis zum Sieg und Fall-Tempo (ms zwischen zwei Blasen) */
function stufe(level: number) {
  if (level <= 3) return { min: 3, max: 6, sieg: 10, tempo: 2600 }
  if (level <= 6) return { min: 5, max: 10, sieg: 12, tempo: 2300 }
  if (level <= 9) return { min: 6, max: 10, sieg: 14, tempo: 2000 }
  if (level <= 13) return { min: 8, max: 15, sieg: 15, tempo: 1900 }
  if (level <= 16) return { min: 10, max: 20, sieg: 16, tempo: 1800 }
  return { min: 12, max: 20, sieg: 18, tempo: 1500 }
}

let naechsteId = 0
const blase = (n: number, neu = false): Blase => ({ id: naechsteId++, n, neu })

/** neues Ziel aus einem vorhandenen Paar (so ist immer eine Lösung da); sonst ein Ziel, dessen Partner als Nächstes fällt */
function neuesZiel(spalten: Blase[][], min: number, max: number, alt?: number): { ziel: number; partner: number | null } {
  const alle = spalten.flat()
  const summen: number[] = []
  for (let i = 0; i < alle.length; i++) for (let k = i + 1; k < alle.length; k++) {
    const s = alle[i].n + alle[k].n
    if (s >= min && s <= max && s !== alt) summen.push(s)
  }
  if (summen.length) return { ziel: summen[randInt(0, summen.length - 1)], partner: null }
  const x = alle.length ? alle[randInt(0, alle.length - 1)].n : randInt(1, min - 1)
  const ziel = Math.max(min, Math.min(max, x + randInt(1, Math.max(1, max - x))))
  return { ziel, partner: ziel - x > 0 ? ziel - x : null }
}

function startFeld(max: number): Blase[][] {
  return Array.from({ length: SPALTEN }, () => Array.from({ length: 3 }, () => blase(randInt(1, Math.max(2, max - 1)))))
}

const FARBEN = ['#FF4D6D', '#FF8A1F', '#FFC531', '#3DBE5B', '#2CC5E8', '#3BA7FF', '#7B5CFF', '#C24DFF', '#FF5CB8', '#8D6E63']
const farbe = (n: number) => FARBEN[n % FARBEN.length]

export function ZahlenBlasen({ level, onFinish }: GameProps) {
  const st = stufe(level)
  const [spalten, setSpalten] = useState<Blase[][]>(() => startFeld(st.max))
  const [ziel, setZiel] = useState(() => neuesZiel(spalten, st.min, st.max).ziel)
  const partner = useRef<number | null>(null)
  const [wahl, setWahl] = useState<number | null>(null)
  const [platzt, setPlatzt] = useState<number[]>([])
  const [falsch, setFalsch] = useState<number[]>([])
  const [fehler, setFehler] = useState(0)
  const [paare, setPaare] = useState(0)
  const [gleichung, setGleichung] = useState<string | null>(null)
  const [neuZiel, setNeuZiel] = useState(false)
  const [aus, setAus] = useState(false)
  const vorbei = useRef(false)
  const zustand = useRef({ paare: 0, fehler: 0 })
  zustand.current = { paare, fehler }
  const feld = useRef(spalten)
  feld.current = spalten
  const hoch = usePortrait()
  const gr = hoch ? 58 : 70

  const ende = (gewonnen: boolean, paareJetzt?: number) => {
    if (vorbei.current) return
    vorbei.current = true
    const { fehler: f } = zustand.current
    const p = paareJetzt ?? zustand.current.paare
    const score = Math.max(0, Math.min(1, (gewonnen ? 1 : p / st.sieg) - f * 0.03))
    if (!gewonnen) { setAus(true); speak('Oh, die Blasen sind oben angekommen!') }
    window.setTimeout(() => onFinish(score, gewonnen ? `Geschafft! ${p} Paare gefunden${f ? ` · ${f} × daneben` : ''}` : `${p} von ${st.sieg} Paaren – die Blasen waren oben`), gewonnen ? 600 : 1600)
  }

  // Blasen fallen: das Tempo steigt mit jedem gefundenen Paar
  useEffect(() => {
    if (aus) return
    const tempo = Math.max(700, st.tempo - paare * 60)
    const t = window.setTimeout(() => {
      if (vorbei.current) return
      const s = feld.current
      const frei = s.map((sp, i) => (sp.length <= REIHEN ? i : -1)).filter((i) => i >= 0)
      const i = frei[randInt(0, frei.length - 1)] ?? 0
      const n = partner.current ?? randInt(1, Math.max(2, st.max - 1))
      partner.current = null
      const neu = s.map((sp, k) => (k === i ? [...sp.map((b) => ({ ...b, neu: false })), blase(n, true)] : sp))
      setSpalten(neu)
      if (neu[i].length > REIHEN) ende(false)
    }, tempo)
    return () => window.clearTimeout(t)
  })

  const finde = (id: number) => spalten.flat().find((b) => b.id === id)
  const tippe = (b: Blase) => {
    if (vorbei.current || platzt.includes(b.id)) return
    if (wahl === null) { setWahl(b.id); return }
    if (wahl === b.id) { setWahl(null); return }
    const a = finde(wahl)
    if (!a) { setWahl(b.id); return }
    if (a.n + b.n === ziel) {
      const ids = [a.id, b.id]
      setPlatzt(ids); setWahl(null); setGleichung(`${a.n} + ${b.n} = ${ziel}`)
      window.setTimeout(() => {
        const rest = feld.current.map((sp) => sp.filter((x) => !ids.includes(x.id)))
        const z = neuesZiel(rest, st.min, st.max, ziel)
        setSpalten(rest); setZiel(z.ziel); partner.current = z.partner
        setNeuZiel(true); window.setTimeout(() => setNeuZiel(false), 500)
        setPlatzt([])
        const p = paare + 1
        setPaare(p)
        if (p >= st.sieg) { speak('Super gemacht!'); ende(true, p) }
      }, 340)
      window.setTimeout(() => setGleichung(null), 1000)
    } else {
      setFalsch([a.id, b.id]); setFehler(fehler + 1); setWahl(null)
      window.setTimeout(() => setFalsch([]), 450)
    }
  }

  const hoechste = Math.max(...spalten.map((s) => s.length))
  return (
    <div className="game-blasen">
      <div className="blasen-kopf">
        <span className={neuZiel ? 'blasen-ziel neu' : 'blasen-ziel'}>Ziel <b>{ziel}</b></span>
        <span className="blasen-fort"><i style={{ width: `${(paare / st.sieg) * 100}%` }} /></span>
        <span className="blasen-zaehler">{paare}/{st.sieg}</span>
      </div>
      <div className="game-hint">Tippe zwei Blasen, die zusammen {ziel} ergeben – schnell, bevor sie oben ankommen!</div>
      <div className={`blasen-feld${hoechste >= REIHEN - 1 ? ' gefahr' : ''}${aus ? ' aus' : ''}`} style={{ height: gr * REIHEN + 8, width: (gr + 6) * SPALTEN }}>
        <div className="blasen-linie" />
        {spalten.map((sp, si) => (
          <div key={si} className="blasen-spalte">
            {sp.map((b, k) => (
              <button
                key={b.id}
                type="button"
                className={`blase${wahl === b.id ? ' gewaehlt' : ''}${platzt.includes(b.id) ? ' platzt' : ''}${falsch.includes(b.id) ? ' falsch' : ''}${b.neu ? ' faellt' : ''}`}
                style={{ width: gr, height: gr, fontSize: gr * (b.n >= 10 ? 0.42 : 0.52), '--fall': `${-(REIHEN - k) * gr}px`, background: `radial-gradient(circle at 32% 28%, #FFFFFFcc 0 12%, ${farbe(b.n)} 45%, ${farbe(b.n)}dd 70%, #00000055 100%)` } as CSSProperties}
                onClick={() => tippe(b)}
                aria-label={`Zahl ${b.n}`}
              >{b.n}</button>
            ))}
          </div>
        ))}
        {gleichung && <div className="blasen-gleichung">{gleichung} ✓</div>}
        {aus && <div className="blasen-aus">Oben angekommen!</div>}
      </div>
    </div>
  )
}
