import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { shuffle, type GameProps } from './types'
import { FARBEN, SpielKopf, useEinmal } from './spielTeile'

// „Perlen-Sudoku“: In jeder Zeile, jeder Spalte und jedem Block kommt jede Farbe genau einmal vor.
// Stufe 1–6: 4×4 mit 4–8 leeren Feldern · 7–12: 4×4 mit bis zu 11 leeren Feldern · ab 13: 6×6 (Blöcke 2×3) mit 10–20 leeren Feldern.
// Falsche Perlen werden sofort rot markiert; jedes gelöste Rätsel macht das nächste schwerer.

const RAETSEL = 3

function loesung(n: number): number[][] {
  // Grundmuster, dann Zeilen in Bändern, Bänder, Spalten in Stapeln und Zahlen mischen → gültiges Sudoku
  const br = n === 4 ? 2 : 2, bc = n === 4 ? 2 : 3
  const basis = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (bc * (r % br) + Math.floor(r / br) + c) % n))
  const baender = shuffle(Array.from({ length: n / br }, (_, i) => i))
  const zeilen = baender.flatMap((b) => shuffle(Array.from({ length: br }, (_, i) => b * br + i)))
  const stapel = shuffle(Array.from({ length: n / bc }, (_, i) => i))
  const spalten = stapel.flatMap((s) => shuffle(Array.from({ length: bc }, (_, i) => s * bc + i)))
  const werte = shuffle(Array.from({ length: n }, (_, i) => i))
  return zeilen.map((r) => spalten.map((c) => werte[basis[r][c]]))
}

function raetsel(stufe: number) {
  const n = stufe >= 13 ? 6 : 4
  const l = loesung(n)
  const leer = n === 4 ? Math.min(11, 3 + stufe) : Math.min(20, 10 + (stufe - 13) * 2)
  const loecher = new Set(shuffle(Array.from({ length: n * n }, (_, i) => i)).slice(0, leer))
  return { n, l, loecher }
}

export function PerlenSudoku({ level, onFinish, rounds }: GameProps) {
  const ziel = rounds ? Math.min(rounds, 2) : RAETSEL
  const [geloest, setGeloest] = useState(0)
  const stufe = level + geloest
  const [r, setR] = useState(() => raetsel(level))
  const [feld, setFeld] = useState<(number | null)[]>(() => r.l.flat().map((v, i) => (r.loecher.has(i) ? null : v)))
  const [wahl, setWahl] = useState<number | null>(null)
  const [fehler, setFehler] = useState(0)
  const [falsch, setFalsch] = useState<number | null>(null)
  const ende = useEinmal(onFinish)

  const setze = (farbe: number) => {
    if (wahl === null) return
    if (r.l.flat()[wahl] !== farbe) { setFalsch(wahl); setFehler((f) => f + 1); tonFalsch(); window.setTimeout(() => setFalsch(null), 500); return }
    const neu = [...feld]; neu[wahl] = farbe
    setFeld(neu); setWahl(null); tonRichtig(neu.filter((x) => x !== null).length)
    if (neu.some((x) => x === null)) return
    const g = geloest + 1
    setGeloest(g); void speak('Super!')
    if (g >= ziel) { window.setTimeout(() => ende(g / ziel - fehler * 0.04, `${g} Sudokus gelöst${fehler ? ` · ${fehler} Fehler` : ' ohne Fehler'}`), 800); return }
    window.setTimeout(() => { const nr = raetsel(level + g); setR(nr); setFeld(nr.l.flat().map((v, i) => (nr.loecher.has(i) ? null : v))) }, 1000)
  }

  const bc = r.n === 4 ? 2 : 3, br = 2
  return (
    <div className="sp">
      <SpielKopf punkte={feld.filter((x, i) => x !== null && r.loecher.has(i)).length * 10 + geloest * 50} />
      <div className="sp-auftrag">Jede Farbe nur <b>einmal</b> in jeder Reihe, Spalte und jedem Kasten!</div>
      <div className="su-feld" style={{ gridTemplateColumns: `repeat(${r.n}, 1fr)` }}>
        {feld.map((v, i) => {
          const z = Math.floor(i / r.n), s = i % r.n
          const rand = (s % bc === bc - 1 && s < r.n - 1 ? ' re' : '') + (z % br === br - 1 && z < r.n - 1 ? ' un' : '')
          return (
            <button key={i} type="button" disabled={v !== null} onClick={() => setWahl(i)} aria-label={`Feld ${z + 1}-${s + 1}`}
              className={'su-zelle' + rand + (wahl === i ? ' wahl' : '') + (falsch === i ? ' falsch' : '') + (v !== null && r.loecher.has(i) ? ' neu' : '')}>
              {v !== null && <span className="sp-perle" style={{ ['--f' as string]: FARBEN[v].hex }} />}
            </button>
          )
        })}
      </div>
      <div className="su-farben">
        {FARBEN.slice(0, r.n).map((f, k) => (
          <button key={f.id} type="button" disabled={wahl === null} onClick={() => setze(k)} aria-label={f.name} className="su-farbe">
            <span className="sp-perle" style={{ ['--f' as string]: f.hex }} />
          </button>
        ))}
      </div>
      <div className="game-hint">{wahl === null ? 'Tippe ein leeres Feld an, dann eine Farbe.' : 'Welche Farbe gehört hierher?'} · Stufe {stufe} · Rätsel {Math.min(geloest + 1, ziel)} von {ziel}</div>
    </div>
  )
}
