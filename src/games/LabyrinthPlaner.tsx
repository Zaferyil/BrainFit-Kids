import { useEffect, useRef, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, type GameProps } from './types'

// Labyrinth-Planer (Flexibles Denken / Planen): Erst den ganzen Weg mit Pfeilen planen, dann „Los!".
// Die Perle läuft die Pfeile ab. Später: größere Labyrinthe, mehr Mauern und genau so viele Pfeile wie nötig.

type Dir = 'o' | 'u' | 'l' | 'r'
const D: Record<Dir, [number, number, number]> = { o: [-1, 0, -90], u: [1, 0, 90], l: [0, -1, 180], r: [0, 1, 0] }
const Pfeil = ({ d, gr }: { d: Dir; gr: number }) => (
  <svg width={gr} height={gr} viewBox="0 0 24 24" style={{ transform: `rotate(${D[d][2]}deg)` }} aria-hidden="true"><path d="M4 12h13M12 5l7 7-7 7" fill="none" stroke="#4B2FC2" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const RUNDEN = 5

function stufe(level: number) {
  if (level <= 3) return { n: 4, mauern: 3, extra: 3 }
  if (level <= 7) return { n: 5, mauern: 6, extra: 2 }
  if (level <= 11) return { n: 5, mauern: 8, extra: 1 }
  if (level <= 15) return { n: 6, mauern: 11, extra: 1 }
  return { n: 6, mauern: 13, extra: 0 }
}

function kuerzester(n: number, mauer: Set<number>, start: number, ziel: number) {
  const dist = new Map([[start, 0]]); const q = [start]
  while (q.length) {
    const f = q.shift()!
    if (f === ziel) return dist.get(f)!
    for (const [dr, dc] of Object.values(D)) {
      const r = Math.floor(f / n) + dr, c = (f % n) + dc, g = r * n + c
      if (r < 0 || c < 0 || r >= n || c >= n || mauer.has(g) || dist.has(g)) continue
      dist.set(g, dist.get(f)! + 1); q.push(g)
    }
  }
  return -1
}

function neueAufgabe(level: number) {
  const s = stufe(level)
  for (;;) {
    const start = randInt(0, s.n - 1) * s.n, ziel = randInt(0, s.n - 1) * s.n + s.n - 1
    const mauer = new Set<number>()
    while (mauer.size < s.mauern) { const f = randInt(0, s.n * s.n - 1); if (f !== start && f !== ziel) mauer.add(f) }
    const k = kuerzester(s.n, mauer, start, ziel)
    if (k >= s.n) return { n: s.n, start, ziel, mauer, max: k + s.extra }
  }
}

export function LabyrinthPlaner({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [a, setA] = useState(() => neueAufgabe(level))
  const [plan, setPlan] = useState<Dir[]>([])
  const [pos, setPos] = useState(a.start)
  const [spur, setSpur] = useState<number[]>([])
  const [laeuft, setLaeuft] = useState(false)
  const [ergebnis, setErgebnis] = useState<'ok' | 'falsch' | null>(null)
  const [richtig, setRichtig] = useState(0)
  const timer = useRef<number[]>([])
  useEffect(() => () => timer.current.forEach(clearTimeout), [])
  const gr = a.n === 4 ? 74 : a.n === 5 ? 62 : 52

  const los = () => {
    setLaeuft(true)
    let p = a.start; const weg: number[] = []; let crash = false
    for (const d of plan) {
      const r = Math.floor(p / a.n) + D[d][0], c = (p % a.n) + D[d][1], g = r * a.n + c
      if (r < 0 || c < 0 || r >= a.n || c >= a.n || a.mauer.has(g)) { crash = true; break }
      p = g; weg.push(p)
    }
    weg.forEach((f, i) => timer.current.push(window.setTimeout(() => { setPos(f); setSpur(weg.slice(0, i + 1)) }, 380 * (i + 1))))
    const ok = !crash && p === a.ziel
    timer.current.push(window.setTimeout(() => {
      setErgebnis(ok ? 'ok' : 'falsch')
      const neu = richtig + (ok ? 1 : 0); setRichtig(neu)
      if (ok) tonRichtig(neu); else { tonFalsch(); speak(crash ? 'Oh, da ist eine Mauer!' : 'Fast! Plane den Weg noch einmal.') }
      timer.current.push(window.setTimeout(() => {
        setErgebnis(null); setLaeuft(false); setPlan([]); setSpur([])
        if (runde + 1 >= rounds) { onFinish(neu / rounds, `${neu} von ${rounds} Wegen richtig geplant`); return }
        const n = neueAufgabe(level); setRunde(runde + 1); setA(n); setPos(n.start)
      }, ok ? 1000 : 1800))
    }, 380 * (weg.length + 1)))
  }

  return (
    <div className="game-laby">
      <div className="game-hint">Labyrinth {runde + 1} von {rounds} · Plane den Weg zum Stern!</div>
      <div className={`laby-feld${ergebnis ? ` ${ergebnis}` : ''}`} style={{ gridTemplateColumns: `repeat(${a.n}, ${gr}px)` }}>
        {Array.from({ length: a.n * a.n }, (_, f) => (
          <div key={f} className={`laby-zelle${a.mauer.has(f) ? ' mauer' : ''}${spur.includes(f) ? ' spur' : ''}`} style={{ width: gr, height: gr, fontSize: gr * 0.55 }}>
            {f === pos ? <span className="laby-perle" /> : f === a.ziel ? '⭐' : a.mauer.has(f) ? '🧱' : ''}
          </div>
        ))}
      </div>
      <div className="laby-plan">
        {Array.from({ length: a.max }, (_, i) => <span key={i} className={plan[i] ? 'voll' : ''}>{plan[i] ? <Pfeil d={plan[i]} gr={22} /> : ''}</span>)}
      </div>
      <div className="laby-tasten">
        {(['l', 'o', 'u', 'r'] as Dir[]).map((d) => (
          <button key={d} type="button" disabled={laeuft || plan.length >= a.max} onClick={() => setPlan([...plan, d])} aria-label={d}><Pfeil d={d} gr={34} /></button>
        ))}
        <button type="button" className="laby-weg" disabled={laeuft || !plan.length} onClick={() => setPlan(plan.slice(0, -1))} aria-label="Zurück">↩</button>
      </div>
      <button type="button" className="btn-primary small" disabled={laeuft || !plan.length} onClick={los}>Los! ▶</button>
    </div>
  )
}
