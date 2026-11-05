import { useMemo, useState } from 'react'
import { Bead, type BeadColor } from '../components/Bead'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// Spiegel-Perlen (Raumdenken): Auf einer Seite liegt ein Perlenmuster. Tippe die Felder auf der anderen Seite an,
// damit dort das Spiegelbild entsteht. Später: mehr Felder, mehr Perlen, zwei Farben und waagrechte Spiegelachse.

type Aufgabe = { n: number; waagrecht: boolean; muster: Map<number, number>; farben: BeadColor[] }
const RUNDEN = 5

function stufe(level: number) {
  if (level <= 3) return { n: 4, perlen: 3, farben: 1, waagrecht: false }
  if (level <= 7) return { n: 4, perlen: 5, farben: 1, waagrecht: false }
  if (level <= 11) return { n: 6, perlen: 6, farben: 2, waagrecht: false }
  if (level <= 15) return { n: 6, perlen: 7, farben: 2, waagrecht: true }
  return { n: 6, perlen: 9, farben: 2, waagrecht: Math.random() < 0.5 }
}

function neueAufgabe(level: number): Aufgabe {
  const s = stufe(level)
  const halb = s.n / 2
  // Felder der Vorlage-Hälfte (links bzw. oben)
  const felder: number[] = []
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) if (s.waagrecht ? r < halb : c < halb) felder.push(r * s.n + c)
  const muster = new Map<number, number>()
  shuffle(felder).slice(0, s.perlen).forEach((f) => muster.set(f, randInt(0, s.farben - 1)))
  return { n: s.n, waagrecht: s.waagrecht, muster, farben: shuffle<BeadColor>(['pink', 'blue', 'green', 'yellow']).slice(0, s.farben) }
}

const spiegel = (f: number, n: number, waagrecht: boolean) => {
  const r = Math.floor(f / n), c = f % n
  return waagrecht ? (n - 1 - r) * n + c : r * n + (n - 1 - c)
}

export function SpiegelPerlen({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [a, setA] = useState(() => neueAufgabe(level))
  const [gelegt, setGelegt] = useState<Map<number, number>>(new Map())
  const [farbe, setFarbe] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const [ergebnis, setErgebnis] = useState<'ok' | 'falsch' | null>(null)
  const ziel = useMemo(() => new Map([...a.muster].map(([f, k]) => [spiegel(f, a.n, a.waagrecht), k])), [a])
  const halb = a.n / 2
  const vorlage = (f: number) => (a.waagrecht ? Math.floor(f / a.n) < halb : f % a.n < halb)
  const gr = a.n === 4 ? 78 : 56

  const tippe = (f: number) => {
    if (ergebnis || vorlage(f)) return
    const neu = new Map(gelegt)
    if (neu.get(f) === farbe) neu.delete(f); else neu.set(f, farbe)
    setGelegt(neu)
  }
  const pruefen = () => {
    const ok = gelegt.size === ziel.size && [...ziel].every(([f, k]) => gelegt.get(f) === k)
    setErgebnis(ok ? 'ok' : 'falsch')
    const r = richtig + (ok ? 1 : 0)
    setRichtig(r)
    if (ok) tonRichtig(r); else { tonFalsch(); speak('Schau, so sieht das Spiegelbild aus.') }
    window.setTimeout(() => {
      setErgebnis(null); setGelegt(new Map()); setFarbe(0)
      if (runde + 1 >= rounds) onFinish(r / rounds, `${r} von ${rounds} Spiegelbildern richtig`)
      else { setRunde(runde + 1); setA(neueAufgabe(level)) }
    }, ok ? 1100 : 2400)
  }

  return (
    <div className="game-spiegel">
      <div className="game-hint">Bild {runde + 1} von {rounds} · Lege das Spiegelbild!</div>
      <div className={`spiegel-feld${ergebnis ? ` ${ergebnis}` : ''}`} style={{ gridTemplateColumns: `repeat(${a.n}, ${gr}px)` }}>
        {Array.from({ length: a.n * a.n }, (_, f) => {
          const v = vorlage(f)
          const k = v ? a.muster.get(f) : ergebnis === 'falsch' ? ziel.get(f) : gelegt.get(f)
          const fehlt = ergebnis === 'falsch' && !v && ziel.get(f) !== gelegt.get(f)
          return (
            <button key={f} type="button" className={`spiegel-zelle${v ? ' vorlage' : ''}${fehlt ? ' fehlt' : ''}`} style={{ width: gr, height: gr }} onClick={() => tippe(f)} aria-label={v ? 'Vorlage' : 'Feld'}>
              {k !== undefined && <Bead color={a.farben[k]} width={gr * 0.82} />}
            </button>
          )
        })}
        <i className={a.waagrecht ? 'spiegel-achse waagrecht' : 'spiegel-achse'} />
      </div>
      <div className="spiegel-unten">
        {a.farben.length > 1 && a.farben.map((c, i) => (
          <button key={c} type="button" className={farbe === i ? 'spiegel-farbe an' : 'spiegel-farbe'} onClick={() => setFarbe(i)} aria-label={`Farbe ${i + 1}`}><Bead color={c} width={52} /></button>
        ))}
        <button type="button" className="btn-primary small" disabled={!!ergebnis || !gelegt.size} onClick={pruefen}>Fertig ✓</button>
      </div>
    </div>
  )
}
