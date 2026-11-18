import { useEffect, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { shuffle, type GameProps } from './types'
import { SpielKopf, useEinmal } from './spielTeile'

// „Zahlen-Rennen“ (Zahlentafel): Tippe die Zahlen so schnell wie möglich der Reihe nach an – 1, 2, 3 …
// Stufe 1–3: 3×3 (1–9) · 4–8: 4×4 (1–16) · 9–13: 5×5 (1–25) · ab 14: 5×5 und die Zahlen tauschen nach jedem Treffer die Plätze,
// ab 17 rückwärts (25 → 1). Bewertet wird die Zeit pro Tafel. Kiga/1. Klasse: immer 3×3 (1–9).

const TAFELN = 3

function tafel(stufe: number, einstellig: boolean) {
  const n = einstellig || stufe <= 3 ? 3 : stufe <= 8 ? 4 : 5
  const zahlen = shuffle(Array.from({ length: n * n }, (_, i) => i + 1))
  return { n, zahlen, mischen: !einstellig && stufe >= 14, rueckwaerts: !einstellig && stufe >= 17 }
}

export function ZahlenRennen({ level, onFinish, rounds, einstellig = false }: GameProps) {
  const ziel = rounds ? Math.min(rounds, 2) : TAFELN
  const [nr, setNr] = useState(0)
  const stufe = level + nr
  const [t, setT] = useState(() => tafel(level, einstellig))
  const [naechste, setNaechste] = useState(() => (t.rueckwaerts ? t.n * t.n : 1))
  const [falsch, setFalsch] = useState<number | null>(null)
  const [fehler, setFehler] = useState(0)
  const [start, setStart] = useState(() => Date.now())
  const [zeiten, setZeiten] = useState<number[]>([])
  const [jetzt, setJetzt] = useState(() => Date.now())
  const ende = useEinmal(onFinish)

  useEffect(() => { const i = window.setInterval(() => setJetzt(Date.now()), 200); return () => window.clearInterval(i) }, [])

  const tippe = (z: number) => {
    if (z !== naechste) { setFalsch(z); setFehler((f) => f + 1); tonFalsch(); window.setTimeout(() => setFalsch(null), 350); return }
    tonRichtig(Math.abs(z - (t.rueckwaerts ? t.n * t.n : 0)))
    const letzte = t.rueckwaerts ? z === 1 : z === t.n * t.n
    if (!letzte) {
      setNaechste(t.rueckwaerts ? z - 1 : z + 1)
      if (t.mischen) setT({ ...t, zahlen: shuffle(t.zahlen) })
      return
    }
    const sek = (Date.now() - start) / 1000
    const neu = [...zeiten, sek / (t.n * t.n)]
    setZeiten(neu); void speak('Super!')
    const g = nr + 1
    if (g >= ziel) {
      // ~1 s pro Zahl ist sehr gut, ~3 s pro Zahl noch ok
      const schnitt = neu.reduce((a, b) => a + b, 0) / neu.length
      window.setTimeout(() => ende(1.25 - schnitt * 0.3 - fehler * 0.03, `${g} Tafeln · ${schnitt.toFixed(1).replace('.', ',')} s pro Zahl`), 600)
      return
    }
    window.setTimeout(() => {
      const nt = tafel(level + g, einstellig)
      setNr(g); setT(nt); setNaechste(nt.rueckwaerts ? nt.n * nt.n : 1); setStart(Date.now())
    }, 900)
  }

  const sek = Math.max(0, (jetzt - start) / 1000)
  return (
    <div className="sp">
      <SpielKopf punkte={zeiten.length * 50 + (t.rueckwaerts ? t.n * t.n - naechste : naechste - 1) * 5} />
      <div className="sp-auftrag">{t.rueckwaerts ? 'Rückwärts!' : 'Der Reihe nach!'} Tippe: <b className="zr-naechste">{naechste}</b> <span className="zr-uhr">⏱ {sek.toFixed(1).replace('.', ',')} s</span></div>
      <div className="zr-feld" style={{ gridTemplateColumns: `repeat(${t.n}, 1fr)` }}>
        {t.zahlen.map((z) => {
          const erledigt = t.rueckwaerts ? z > naechste : z < naechste
          return <button key={t.mischen ? `${z}-${naechste}` : z} type="button" onClick={() => tippe(z)} disabled={erledigt}
            className={'zr-zelle' + (erledigt ? ' weg' : '') + (falsch === z ? ' falsch' : '')}>{z}</button>
        })}
      </div>
      <div className="game-hint">Tafel {nr + 1} von {ziel} · Stufe {stufe}{t.mischen ? ' · Achtung: die Zahlen springen!' : ''}</div>
    </div>
  )
}
