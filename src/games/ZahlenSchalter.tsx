import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, type GameProps } from './types'
import { SpielKopf, useEinmal, useSpielzeit } from './spielTeile'

// „Zahlen-Schalter“: Die Farbe des Rahmens sagt die Frage. Blau: gerade oder ungerade? Orange: kleiner oder größer als 5?
// Stufe 1–3: lange Blöcke mit derselben Frage · 4–7: Frage wechselt alle 3 Zahlen · 8–11: Wechsel zufällig
// · ab 12: dritte Frage (lila: mit oder ohne Himmelsperle? = ab 5 mit Himmelsperle) und Zahlen bis 99 (Einer zählt). Kiga/1. Klasse: nur 1–9.

const SPIELZEIT = 50
type Frage = 'gerade' | 'groesse' | 'himmel'
const FRAGEN: Record<Frage, { farbe: string; text: string; a: string; b: string; pruef: (n: number) => 'a' | 'b' }> = {
  gerade: { farbe: '#3BA7FF', text: 'Gerade oder ungerade?', a: 'gerade', b: 'ungerade', pruef: (n) => (n % 2 === 0 ? 'a' : 'b') },
  groesse: { farbe: '#FF8A1F', text: 'Kleiner als 5 oder ab 5?', a: 'kleiner als 5', b: '5 und mehr', pruef: (n) => (n % 10 < 5 && n < 10 ? 'a' : n < 5 ? 'a' : 'b') },
  himmel: { farbe: '#7B5CFF', text: 'Einer mit Himmelsperle?', a: 'ohne', b: 'mit Himmelsperle', pruef: (n) => (n % 10 >= 5 ? 'b' : 'a') },
}

function frageFuer(stufe: number, nr: number, vorher: Frage): Frage {
  const pool: Frage[] = stufe >= 12 ? ['gerade', 'groesse', 'himmel'] : ['gerade', 'groesse']
  if (stufe <= 3) return pool[Math.floor(nr / 8) % pool.length]
  if (stufe <= 7) return pool[Math.floor(nr / 3) % pool.length]
  return Math.random() < 0.5 ? vorher : pool[randInt(0, pool.length - 1)]
}

export function ZahlenSchalter({ level, onFinish, rounds, einstellig = false }: GameProps) {
  const [richtig, setRichtig] = useState(0)
  const [fehler, setFehler] = useState(0)
  const stufe = level + Math.floor(richtig / 8)
  const [nr, setNr] = useState(0)
  const [frage, setFrage] = useState<Frage>(() => frageFuer(level, 0, 'gerade'))
  const zahl = (s: number) => randInt(1, einstellig || s < 12 ? 9 : 99)
  const [n, setN] = useState(() => zahl(level))
  const [rueck, setRueck] = useState<'a' | 'b' | null>(null)
  const ende = useEinmal(onFinish)
  const fertig = (rr = richtig, ff = fehler) => ende(Math.min(1, rr / (rounds ? rounds * 3 : 28)) * (rr / Math.max(1, rr + ff)), `${rr} richtig · ${ff} Fehler`)
  const rest = useSpielzeit(SPIELZEIT, !rounds, () => fertig())
  const F = FRAGEN[frage]
  // „kleiner als 5“ bei zweistelligen Zahlen: dann geht es um die ganze Zahl (immer ≥ 5) – deshalb Frage nur bei einstelligen
  const loesung = frage === 'groesse' ? (n < 5 ? 'a' : 'b') : F.pruef(n)

  const tippe = (x: 'a' | 'b') => {
    if (rueck) return
    const ok = x === loesung
    setRueck(x)
    const rr = richtig + (ok ? 1 : 0), ff = fehler + (ok ? 0 : 1)
    if (ok) { setRichtig(rr); tonRichtig(rr) } else { setFehler(ff); tonFalsch() }
    window.setTimeout(() => {
      if (rounds && nr + 1 >= rounds * 3) { fertig(rr, ff); return }
      const s = level + Math.floor(rr / 8), nf = frageFuer(s, nr + 1, frage)
      setNr(nr + 1); setFrage(nf); setN(nf === 'groesse' ? randInt(1, 9) : zahl(s)); setRueck(null)
    }, ok ? 300 : 800)
  }

  return (
    <div className="sp">
      <SpielKopf rest={rounds ? undefined : rest} gesamt={SPIELZEIT} punkte={richtig * 10} />
      <div className="sp-auftrag" style={{ boxShadow: `0 0 0 4px ${F.farbe}, 0 4px 0 rgba(35,26,79,.18)` }}><b style={{ color: F.farbe }}>{F.text}</b></div>
      <div className="sp-buehne zs-buehne" key={nr}>
        <span className="zs-zahl" style={{ borderColor: F.farbe, boxShadow: `0 8px 0 ${F.farbe}` }}>{n}</span>
      </div>
      <div className="so-koerbe">
        {(['a', 'b'] as const).map((x) => (
          <button key={x} type="button" onClick={() => tippe(x)} className={'so-korb' + (rueck === x ? (x === loesung ? ' richtig' : ' falsch') : '')} style={{ color: F.farbe }}>{F[x]}</button>
        ))}
      </div>
      <div className="game-hint">Die <b>Farbe</b> sagt dir die Frage · Stufe {stufe} · {richtig} richtig</div>
    </div>
  )
}
