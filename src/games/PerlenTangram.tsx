import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, shuffle, type GameProps } from './types'

// Perlen-Tangram (Raumdenken): Eine graue Form soll ganz mit Teilen gefüllt werden.
// Teil antippen, ggf. drehen, dann das Feld antippen, wo die markierte Perle des Teils hin soll.
// Später: größere Formen, mehr Teile und Teile, die gedreht werden müssen.

type Zelle = [number, number]
const FARBEN = ['#FF4D6D', '#3BA7FF', '#FFC531', '#3DBE5B', '#A66BFF', '#FF8A3D']
const RUNDEN = 4

function stufe(level: number) {
  if (level <= 3) return { n: 4, groesse: 8, teile: 2, drehen: false }
  if (level <= 7) return { n: 4, groesse: 10, teile: 3, drehen: false }
  if (level <= 11) return { n: 5, groesse: 13, teile: 4, drehen: true }
  if (level <= 15) return { n: 5, groesse: 16, teile: 5, drehen: true }
  return { n: 6, groesse: 20, teile: 6, drehen: true }
}

const key = (r: number, c: number) => `${r},${c}`
const NB: Zelle[] = [[0, 1], [1, 0], [0, -1], [-1, 0]]

/** Teil auf (0,0) schieben und sortieren – die erste Zelle ist der „Anker" */
function norm(z: Zelle[]): Zelle[] {
  const r0 = Math.min(...z.map((x) => x[0])), c0 = Math.min(...z.map((x) => x[1]))
  return z.map(([r, c]) => [r - r0, c - c0] as Zelle).sort((a, b) => a[0] - b[0] || a[1] - b[1])
}
const drehe = (z: Zelle[]) => norm(z.map(([r, c]) => [c, -r] as Zelle))

function neueAufgabe(level: number) {
  const s = stufe(level)
  for (;;) {
    // zusammenhängende Form wachsen lassen
    const form = new Set<string>([key(randInt(1, s.n - 2), randInt(1, s.n - 2))])
    while (form.size < s.groesse) {
      const [r, c] = [...form][randInt(0, form.size - 1)].split(',').map(Number)
      const [dr, dc] = NB[randInt(0, 3)]
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nc >= 0 && nr < s.n && nc < s.n) form.add(key(nr, nc))
    }
    // in Teile zerlegen (gleichzeitiges Wachsen von Startzellen)
    const zellen = shuffle([...form])
    const besitz = new Map<string, number>()
    zellen.slice(0, s.teile).forEach((k, i) => besitz.set(k, i))
    let wuchs = true
    while (wuchs) {
      wuchs = false
      for (const k of shuffle([...besitz.keys()])) {
        const [r, c] = k.split(',').map(Number)
        for (const [dr, dc] of shuffle(NB)) {
          const nk = key(r + dr, c + dc)
          if (form.has(nk) && !besitz.has(nk)) { besitz.set(nk, besitz.get(k)!); wuchs = true; break }
        }
      }
    }
    const teile: Zelle[][] = Array.from({ length: s.teile }, () => [])
    besitz.forEach((i, k) => teile[i].push(k.split(',').map(Number) as Zelle))
    if (teile.some((t) => t.length < 2 || t.length > 6)) continue
    return {
      n: s.n, form, drehen: s.drehen,
      teile: teile.map((t) => { let z = norm(t); if (s.drehen) for (let i = randInt(0, 3); i > 0; i--) z = drehe(z); return z }),
    }
  }
}

function Mini({ z, farbe, gr }: { z: Zelle[]; farbe: string; gr: number }) {
  const h = Math.max(...z.map((x) => x[0])) + 1, w = Math.max(...z.map((x) => x[1])) + 1
  return (
    <span className="tg-mini" style={{ gridTemplateColumns: `repeat(${w}, ${gr}px)`, gridTemplateRows: `repeat(${h}, ${gr}px)` }}>
      {z.map(([r, c], i) => <i key={i} style={{ gridRow: r + 1, gridColumn: c + 1, background: farbe }} className={i === 0 ? 'anker' : ''} />)}
    </span>
  )
}

export function PerlenTangram({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [a, setA] = useState(() => neueAufgabe(level))
  const [formen, setFormen] = useState(() => a.teile)
  const [lage, setLage] = useState<Map<number, string[]>>(new Map()) // Teil -> belegte Felder
  const [wahl, setWahl] = useState<number | null>(0)
  const [zuege, setZuege] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const [fertig, setFertig] = useState(false)
  const [wackel, setWackel] = useState(false)
  const gr = a.n === 4 ? 70 : a.n === 5 ? 58 : 50

  const belegt = new Map<string, number>()
  lage.forEach((ks, t) => ks.forEach((k) => belegt.set(k, t)))

  const neueRunde = (r: number) => {
    if (runde + 1 >= rounds) { onFinish(r / rounds, `${r} von ${rounds} Formen ohne Fehler gelegt`); return }
    const n = neueAufgabe(level)
    setRunde(runde + 1); setA(n); setFormen(n.teile); setLage(new Map()); setWahl(0); setZuege(0); setFertig(false)
  }

  const tippeFeld = (r: number, c: number) => {
    if (fertig) return
    const k = key(r, c)
    if (belegt.has(k)) { const t = belegt.get(k)!; const m = new Map(lage); m.delete(t); setLage(m); setWahl(t); return }
    if (wahl === null || !a.form.has(k)) return
    const [ar, ac] = formen[wahl][0]
    const ziel = formen[wahl].map(([pr, pc]) => key(r + pr - ar, c + pc - ac))
    if (ziel.some((x) => !a.form.has(x) || belegt.has(x))) {
      tonFalsch(); setZuege(zuege + 1); setWackel(true); window.setTimeout(() => setWackel(false), 400); return
    }
    const m = new Map(lage); m.set(wahl, ziel); setLage(m)
    const frei = formen.map((_, i) => i).filter((i) => !m.has(i))
    setWahl(frei[0] ?? null)
    if (!frei.length) {
      const ok = zuege === 0
      const neu = richtig + (ok ? 1 : 0)
      setRichtig(neu); setFertig(true); tonRichtig(neu)
      window.setTimeout(() => neueRunde(neu), 1300)
    }
  }
  const drehen = () => { if (wahl === null) return; const f = formen.slice(); f[wahl] = drehe(f[wahl]); setFormen(f) }

  return (
    <div className="game-tangram">
      <div className="game-hint">Form {runde + 1} von {rounds} · Fülle die graue Form!</div>
      <div className={`tg-feld${fertig ? ' ok' : ''}${wackel ? ' falsch' : ''}`} style={{ gridTemplateColumns: `repeat(${a.n}, ${gr}px)` }}>
        {Array.from({ length: a.n * a.n }, (_, i) => {
          const r = Math.floor(i / a.n), c = i % a.n, k = key(r, c)
          const t = belegt.get(k)
          return <button key={k} type="button" aria-label="Feld" className={a.form.has(k) ? 'tg-zelle form' : 'tg-zelle'} style={{ width: gr, height: gr, background: t !== undefined ? FARBEN[t] : undefined }} onClick={() => tippeFeld(r, c)} />
        })}
      </div>
      <div className="tg-teile">
        {formen.map((z, i) => !lage.has(i) && (
          <button key={i} type="button" className={wahl === i ? 'tg-teil an' : 'tg-teil'} onClick={() => setWahl(i)} aria-label={`Teil ${i + 1}`}>
            <Mini z={z} farbe={FARBEN[i]} gr={a.n === 4 ? 26 : 22} />
          </button>
        ))}
      </div>
      <div className="tg-unten">
        {a.drehen && <button type="button" className="btn-primary small" disabled={wahl === null || fertig} onClick={drehen}>⟳ Drehen</button>}
        <span className="tg-tipp">Die Perle mit Punkt kommt auf das Feld, das du antippst.</span>
      </div>
    </div>
  )
}
