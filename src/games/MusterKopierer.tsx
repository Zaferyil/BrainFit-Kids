import { useEffect, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'
import { SpielKopf, useEinmal } from './spielTeile'

// „Muster-Kopierer“: Links ein Perlen-Bauplan – baue ihn rechts genau nach (Felder antippen).
// Stufe 1–3: 3×3 mit 3 Perlen · 4–7: 4×4 mit 4–5 Perlen · 8–11: 4×4, der Bauplan verschwindet nach 4 s
// · ab 12: 5×5, Bauplan verschwindet nach 3 s · ab 15: nachbauen als SPIEGELBILD.

const RUNDEN = 6

function plan(stufe: number) {
  const n = stufe <= 3 ? 3 : stufe <= 11 ? 4 : 5
  const anzahl = stufe <= 3 ? 3 : stufe <= 7 ? randInt(4, 5) : stufe <= 11 ? 5 : randInt(6, 7)
  const felder = shuffle(Array.from({ length: n * n }, (_, i) => i)).slice(0, anzahl)
  const spiegel = stufe >= 15
  const ziel = spiegel ? felder.map((i) => Math.floor(i / n) * n + (n - 1 - (i % n))) : felder
  return { n, felder, ziel: new Set(ziel), spiegel, zeigeMs: stufe >= 12 ? 3000 : stufe >= 8 ? 4000 : 0 }
}

export function MusterKopierer({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [perfekt, setPerfekt] = useState(0)
  const [fehler, setFehler] = useState(0)
  const stufe = level + Math.floor(perfekt / 2)
  const [p, setP] = useState(() => plan(level))
  const [gesetzt, setGesetzt] = useState<number[]>([])
  const [falsch, setFalsch] = useState<number | null>(null)
  const [verdeckt, setVerdeckt] = useState(false)
  const [fehlerRunde, setFehlerRunde] = useState(0)
  const ende = useEinmal(onFinish)

  useEffect(() => {
    setVerdeckt(false)
    if (!p.zeigeMs) return
    const t = window.setTimeout(() => setVerdeckt(true), p.zeigeMs)
    return () => window.clearTimeout(t)
  }, [p])

  const tippe = (i: number) => {
    if (gesetzt.includes(i)) return
    if (!p.ziel.has(i)) { setFalsch(i); setFehler((f) => f + 1); setFehlerRunde((f) => f + 1); tonFalsch(); window.setTimeout(() => setFalsch(null), 400); return }
    const neu = [...gesetzt, i]
    setGesetzt(neu); tonRichtig(neu.length)
    if (neu.length < p.ziel.size) return
    const pf = perfekt + (fehlerRunde === 0 ? 1 : 0)
    setPerfekt(pf); void speak('Super!')
    window.setTimeout(() => {
      if (runde + 1 >= rounds) { ende(pf / rounds + 0.2 - fehler * 0.03, `${runde + 1} Baupläne nachgebaut · ${pf} ohne Fehler`); return }
      setRunde(runde + 1); setP(plan(level + Math.floor(pf / 2))); setGesetzt([]); setFehlerRunde(0)
    }, 900)
  }

  const raster = { gridTemplateColumns: `repeat(${p.n}, 1fr)` }
  return (
    <div className="sp">
      <SpielKopf punkte={perfekt * 20 + gesetzt.length * 5} />
      <div className="sp-auftrag">{p.spiegel ? <>Baue das <b>Spiegelbild</b>!</> : <>Baue den Plan <b>genau nach</b>!</>} {p.zeigeMs > 0 && <small>Merk ihn dir – er verschwindet!</small>}</div>
      <div className="fd-paar">
        <div className="fd-bild" style={raster}>
          {Array.from({ length: p.n * p.n }, (_, i) => <span key={i} className="fd-zelle">{!verdeckt && p.felder.includes(i) && <i style={{ background: '#7B5CFF' }} />}</span>)}
        </div>
        <div className="fd-bild rechts" style={raster}>
          {Array.from({ length: p.n * p.n }, (_, i) => (
            <button key={i} type="button" onClick={() => tippe(i)} aria-label={`Feld ${i + 1}`} className={'fd-zelle' + (falsch === i ? ' falsch' : '')}>
              {gesetzt.includes(i) && <i style={{ background: '#7B5CFF' }} />}
            </button>
          ))}
        </div>
      </div>
      <div className="game-hint">Bauplan {runde + 1} von {rounds} · noch {p.ziel.size - gesetzt.length} Perlen · Stufe {stufe}</div>
    </div>
  )
}
