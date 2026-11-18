import { useEffect, useRef, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { SAY } from '../data/sprache'
import { randInt, shuffle, type GameProps } from './types'

// „Raketen-Flug“: Lola sagt eine Zahl (später eine Rechnung) – das Kind tippt den passenden Planeten an
// und die Rakete fliegt hin. Trainiert Zuhören, Zahlen erkennen und Kopfrechnen.
// Wird schwerer, je weiter das Kind kommt (Startstufe aus dem Spiel-Level, +1 je zwei geschaffte Runden):
// 1–3: 2 Planeten, Zahlen bis 10 · 4–6: 3 Planeten bis 20 · 7–9: zweistellige Zahlen · 10–12: Plus-Aufgaben bis 20 ·
// 13–15: Plus und Minus bis 50, 4 Planeten, die sich bewegen · ab 16: bis 99, 5 Planeten, ähnliche Zahlen.
// Kiga/1. Klasse (einstellig): Zahlen, Aufgaben und Ergebnisse nur 1–9.

const SPIELZEIT = 60
const PLANETEN = [
  { a: '#FFB347', b: '#E8590C', ring: false }, { a: '#7FE3FF', b: '#1C7ED6', ring: true }, { a: '#B9F18C', b: '#2F9E44', ring: false },
  { a: '#FFA8D8', b: '#C2255C', ring: true }, { a: '#D0BFFF', b: '#6741D9', ring: false }, { a: '#FFE066', b: '#F08C00', ring: true },
]
// Plätze im Weltraum (Prozent): oben drei Reihen, unten bleibt Platz für die Rakete
const PLAETZE: [number, number][] = [[18, 14], [50, 10], [82, 16], [26, 38], [74, 36], [50, 56], [16, 62], [84, 60]]

type Planet = { id: number; n: number; x: number; y: number; stil: number }
type Runde = { planeten: Planet[]; ziel: number; sag: string[]; text: string; drift: number }
let naechsteId = 0

function aufgabe(stufe: number, einstellig: boolean): { ziel: number; sag: string[]; text: string } {
  const max = einstellig ? 9 : stufe <= 3 ? 10 : stufe <= 6 ? 20 : stufe <= 12 ? 99 : stufe <= 15 ? 50 : 99
  const rechnen = stufe >= 10 || (einstellig && stufe >= 7)
  if (!rechnen) {
    const n = stufe >= 7 && !einstellig ? randInt(10, 99) : randInt(1, max)
    return { ziel: n, sag: [String(n)], text: String(n) }
  }
  const grenze = einstellig ? 9 : stufe <= 12 ? 20 : max
  const minus = stufe >= 13 && Math.random() < 0.5
  if (minus) { const a = randInt(3, grenze), b = randInt(1, a - 1); return { ziel: a - b, sag: [String(a), SAY.minus, String(b)], text: `${a} − ${b}` } }
  const a = randInt(1, grenze - 1), b = randInt(1, grenze - a)
  return { ziel: a + b, sag: [String(a), SAY.plus, String(b)], text: `${a} + ${b}` }
}

function runde(stufe: number, einstellig: boolean): Runde {
  const anzahl = stufe <= 3 ? 2 : stufe <= 9 ? 3 : stufe <= 15 ? 4 : 5
  const { ziel, sag, text } = aufgabe(stufe, einstellig)
  // falsche Zahlen bleiben im Zahlenraum der Stufe (z. B. auf Stufe 1 nur bis 10)
  const oben = einstellig ? 9 : stufe <= 3 ? 10 : stufe <= 6 ? 20 : 99
  const werte = new Set([ziel])
  // ab Stufe 16 liegen die falschen Zahlen nah am Ergebnis (±1, ±2, ±10)
  const nah = stufe >= 16 ? [1, -1, 2, -2, 10, -10] : [1, -1, 2, -2, 3, -3, 5, -5, 10, -10]
  for (let i = 0; werte.size < anzahl && i < 200; i++) {
    const v = i < 40 ? ziel + nah[randInt(0, nah.length - 1)] : randInt(1, oben)
    if (v >= 1 && v <= Math.max(oben, ziel)) werte.add(v)
  }
  const plaetze = shuffle(PLAETZE).slice(0, werte.size)
  const stile = shuffle(PLANETEN.map((_, i) => i))
  const planeten = shuffle([...werte]).map((n, i) => ({ id: naechsteId++, n, x: plaetze[i][0], y: plaetze[i][1], stil: stile[i % stile.length] }))
  return { planeten, ziel, sag, text, drift: stufe >= 13 ? Math.min(3, 1 + (stufe - 13) / 3) : stufe >= 7 ? 0.6 : 0 }
}

export function RaketenFlug({ level, onFinish, rounds, einstellig = false }: GameProps) {
  const [geschafft, setGeschafft] = useState(0)
  const stufe = level + Math.floor(geschafft / 2)
  const [r, setR] = useState(() => runde(level, einstellig))
  const [flug, setFlug] = useState<{ x: number; y: number; zurueck: boolean } | null>(null)
  const [ergebnis, setErgebnis] = useState<{ id: number; ok: boolean } | null>(null)
  const [zeigen, setZeigen] = useState(false)
  const [fehler, setFehler] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const [rest, setRest] = useState(SPIELZEIT)
  const fertig = useRef(false)

  // jede neue Aufgabe vorlesen
  useEffect(() => { const t = window.setTimeout(() => void speak(r.sag), 500); return () => window.clearTimeout(t) }, [r])

  const beenden = (runden: number, f: number) => {
    if (fertig.current) return
    fertig.current = true
    const score = Math.max(0, Math.min(1, runden / (rounds ?? 10) - f * 0.03))
    onFinish(score, `${runden} Planeten erreicht${f ? ` · ${f} Fehler` : ' ohne Fehler'}`)
  }

  useEffect(() => {
    if (rounds) return
    if (rest <= 0) { beenden(geschafft, fehler); return }
    const t = window.setTimeout(() => setRest((x) => x - 1), 1000)
    return () => window.clearTimeout(t)
  })

  const tippe = (p: Planet) => {
    if (fertig.current || flug) return
    const ok = p.n === r.ziel
    setFlug({ x: p.x, y: p.y, zurueck: !ok })
    window.setTimeout(() => {
      setErgebnis({ id: p.id, ok })
      if (!ok) {
        tonFalsch(); setFehler((f) => f + 1); setZeigen(true)
        void speak(r.sag)
        window.setTimeout(() => { setFlug(null); setErgebnis(null) }, 700)
        return
      }
      const g = geschafft + 1
      tonRichtig(g); setGeschafft(g); setPunkte((x) => x + 10 + (zeigen ? 0 : 5))
      if (rounds && g >= rounds) { window.setTimeout(() => beenden(g, fehler), 700); return }
      window.setTimeout(() => { setR(runde(level + Math.floor(g / 2), einstellig)); setFlug(null); setErgebnis(null); setZeigen(false) }, 900)
    }, 650)
  }

  const raketeStil = flug ? { left: `${flug.x}%`, top: `${flug.y}%` } : { left: '50%', top: '86%' }
  return (
    <div className="rak">
      <div className="bal-kopf">
        {!rounds && <div className="bal-zeit" aria-label={`Noch ${rest} Sekunden`}><span>⏳</span><i style={{ width: `${(100 * rest) / SPIELZEIT}%` }} /></div>}
        <div className="bal-punkte">🎓 {punkte}</div>
      </div>
      <div className="rak-auftrag">
        <span>Hör gut zu und flieg zum richtigen Planeten!</span>
        <button type="button" className="rak-hoeren" onClick={() => void speak(r.sag)} aria-label="Nochmal hören">🔊</button>
        {zeigen && <b className="rak-text">{r.text}</b>}
      </div>
      <div className="rak-all">
        {r.planeten.map((p, i) => {
          const s = PLANETEN[p.stil]
          const e = ergebnis?.id === p.id ? (ergebnis.ok ? ' richtig' : ' falsch') : ''
          return (
            <button key={p.id} type="button" className={'rak-planet' + (s.ring ? ' ring' : '') + e} onClick={() => tippe(p)} aria-label={`Planet ${p.n}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`, ['--a' as string]: s.a, ['--b' as string]: s.b, ['--d' as string]: r.drift, animationDelay: `${i * 0.6}s` }}>
              <b>{p.n}</b>
            </button>
          )
        })}
        <div className={'rak-rakete' + (flug ? ' fliegt' : '') + (flug?.zurueck && ergebnis ? ' zurueck' : '')} style={raketeStil} aria-hidden="true">🚀</div>
      </div>
      <div className="game-hint">Stufe {stufe} · {geschafft} {geschafft === 1 ? 'Planet' : 'Planeten'} erreicht</div>
    </div>
  )
}
