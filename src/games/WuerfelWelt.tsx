import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'
import { SpielKopf, useEinmal } from './spielTeile'

// „Würfel-Welt“: Wie viele Würfel sind es? Die Türme stehen auf einer Fläche (alle Würfel stehen auf dem Boden oder auf einem Würfel).
// Stufe 1–3: 2×2, höchstens 2 hoch · 4–7: 3×2, bis 3 hoch · 8–12: 3×3, bis 3 hoch · ab 13: 3×3, bis 4 hoch, mit Lücken.
// Ab Stufe 8 sind hinten auch verdeckte Würfel dabei – die muss man sich dazudenken (jeder Turm steht auf dem Boden).

const RUNDEN = 8
const FARBE = ['#FFC531', '#3BA7FF', '#FF8A1F', '#3DBE5B', '#7B5CFF']

function feld(stufe: number) {
  const [cols, rows, hoch] = stufe <= 3 ? [2, 2, 2] : stufe <= 7 ? [3, 2, 3] : stufe <= 12 ? [3, 3, 3] : [3, 3, 4]
  const h = Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(stufe >= 13 ? 0 : 1, hoch)))
  if (h.flat().every((x) => x === 0)) h[0][0] = 1
  const anzahl = h.flat().reduce((a, b) => a + b, 0)
  const opt = new Set([anzahl])
  for (const d of shuffle([1, -1, 2, -2, 3])) if (opt.size < 4 && anzahl + d > 0) opt.add(anzahl + d)
  return { h, cols, rows, anzahl, optionen: shuffle([...opt]), farbe: FARBE[randInt(0, FARBE.length - 1)] }
}

// Isometrische Würfel als SVG (hinten zuerst zeichnen)
function Stapel({ h, cols, rows, farbe }: { h: number[][]; cols: number; rows: number; farbe: string }) {
  const s = 34, dx = s * 0.866, dy = s * 0.5
  const wuerfel: { x: number; y: number; key: string; tiefe: number }[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) for (let z = 0; z < h[r][c]; z++) {
    wuerfel.push({ x: (c - r) * dx, y: (c + r) * dy - z * s, key: `${r}-${c}-${z}`, tiefe: (c + r) * 10 + z })
  }
  wuerfel.sort((p, q) => p.tiefe - q.tiefe) // hinten und unten zuerst
  const maxH = Math.max(1, ...h.flat())
  const ox = (rows - 1) * dx + 10, oy = maxH * s + dy + 10
  const breite = (cols + rows) * dx + 20, hoehe = oy + (cols + rows - 1) * dy + s + 10
  return (
    <svg viewBox={`0 0 ${breite} ${hoehe}`} className="ww-svg" aria-hidden="true">
      {wuerfel.map(({ x, y, key }) => {
        const X = ox + x, Y = oy + y
        return (
          <g key={key}>
            <path d={`M${X} ${Y} l${dx} ${-dy} l${dx} ${dy} l${-dx} ${dy} z`} fill={farbe} stroke="#231A4F" strokeWidth="1.6" strokeLinejoin="round" />
            <path d={`M${X} ${Y} l${dx} ${dy} l0 ${s} l${-dx} ${-dy} z`} fill={farbe} style={{ filter: 'brightness(.8)' }} stroke="#231A4F" strokeWidth="1.6" strokeLinejoin="round" />
            <path d={`M${X + dx} ${Y + dy} l${dx} ${-dy} l0 ${s} l${-dx} ${dy} z`} fill={farbe} style={{ filter: 'brightness(.62)' }} stroke="#231A4F" strokeWidth="1.6" strokeLinejoin="round" />
          </g>
        )
      })}
    </svg>
  )
}

export function WuerfelWelt({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const stufe = level + Math.floor(richtig / 3)
  const [f, setF] = useState(() => feld(level))
  const [wahl, setWahl] = useState<number | null>(null)
  const ende = useEinmal(onFinish)

  const tippe = (v: number) => {
    if (wahl !== null) return
    const ok = v === f.anzahl
    setWahl(v)
    const r = richtig + (ok ? 1 : 0)
    setRichtig(r)
    if (ok) { tonRichtig(r); void speak('Richtig!') } else tonFalsch()
    window.setTimeout(() => {
      if (runde + 1 >= rounds) { ende(r / rounds, `${r} von ${rounds} Würfeltürmen richtig gezählt`); return }
      setRunde(runde + 1); setF(feld(level + Math.floor(r / 3))); setWahl(null)
    }, ok ? 900 : 1800)
  }

  return (
    <div className="sp">
      <SpielKopf punkte={richtig * 10} />
      <div className="sp-auftrag">Wie viele <b>Würfel</b> sind es? {stufe >= 8 && <small>(Denk an die versteckten!)</small>}</div>
      <div className="sp-buehne ww-buehne"><Stapel h={f.h} cols={f.cols} rows={f.rows} farbe={f.farbe} /></div>
      <div className="sp-optionen">
        {f.optionen.map((v) => (
          <button key={v} type="button" disabled={wahl !== null} onClick={() => tippe(v)}
            className={'sp-option' + (wahl !== null && v === f.anzahl ? ' richtig' : wahl === v ? ' falsch' : '')}>{v}</button>
        ))}
      </div>
      <div className="game-hint">Runde {runde + 1} von {rounds} · Stufe {stufe}</div>
    </div>
  )
}
