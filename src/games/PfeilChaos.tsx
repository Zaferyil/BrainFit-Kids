import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, type GameProps } from './types'
import { SpielKopf, useEinmal, useSpielzeit } from './spielTeile'

// „Pfeil-Chaos“: Grüner Pfeil → tippe in seine Richtung. Roter Pfeil → tippe in die GEGENrichtung!
// Stufe 1–3: nur grüne Pfeile, links/rechts · 4–7: grüne und rote · 8–11: auch oben/unten
// · ab 12: der mittlere Pfeil zählt, daneben stehen Ablenk-Pfeile (die oft anders zeigen).

const SPIELZEIT = 45
type Richtung = 'links' | 'rechts' | 'oben' | 'unten'
const GEGEN: Record<Richtung, Richtung> = { links: 'rechts', rechts: 'links', oben: 'unten', unten: 'oben' }
const DREH: Record<Richtung, number> = { rechts: 0, unten: 90, links: 180, oben: 270 }

function aufgabe(stufe: number) {
  const richtungen: Richtung[] = stufe >= 8 ? ['links', 'rechts', 'oben', 'unten'] : ['links', 'rechts']
  const r = richtungen[randInt(0, richtungen.length - 1)]
  const rot = stufe >= 4 && Math.random() < 0.45
  const flanke = stufe >= 12 ? (Math.random() < 0.6 ? GEGEN[r] : r) : null
  return { r, rot, flanke, ziel: rot ? GEGEN[r] : r }
}

const Pfeil = ({ r, farbe, klein }: { r: Richtung; farbe: string; klein?: boolean }) => (
  <svg viewBox="0 0 100 100" className={'pc-pfeil' + (klein ? ' klein' : '')} style={{ transform: `rotate(${DREH[r]}deg)` }} aria-hidden="true">
    <path d="M12 38 H56 V18 L90 50 L56 82 V62 H12 Z" fill={farbe} stroke="#231A4F" strokeWidth="5" strokeLinejoin="round" />
  </svg>
)

export function PfeilChaos({ level, onFinish, rounds }: GameProps) {
  const [richtig, setRichtig] = useState(0)
  const [fehler, setFehler] = useState(0)
  const stufe = level + Math.floor(richtig / 6)
  const [a, setA] = useState(() => aufgabe(level))
  const [nr, setNr] = useState(0)
  const [rueck, setRueck] = useState<Richtung | null>(null)
  const ende = useEinmal(onFinish)
  const fertig = (rr = richtig, ff = fehler) => ende(Math.min(1, rr / (rounds ? rounds * 3 : 30)) * (rr / Math.max(1, rr + ff)), `${rr} richtig · ${ff} Fehler`)
  const rest = useSpielzeit(SPIELZEIT, !rounds, () => fertig())

  const tippe = (d: Richtung) => {
    if (rueck) return
    const ok = d === a.ziel
    setRueck(d)
    const rr = richtig + (ok ? 1 : 0), ff = fehler + (ok ? 0 : 1)
    if (ok) { setRichtig(rr); tonRichtig(rr) } else { setFehler(ff); tonFalsch() }
    window.setTimeout(() => {
      if (rounds && nr + 1 >= rounds * 3) { fertig(rr, ff); return }
      setNr(nr + 1); setA(aufgabe(level + Math.floor(rr / 6))); setRueck(null)
    }, ok ? 250 : 700)
  }

  const farbe = a.rot ? '#FF4D6D' : '#2ECC8F'
  const knoepfe: Richtung[] = stufe >= 8 ? ['oben', 'links', 'rechts', 'unten'] : ['links', 'rechts']
  return (
    <div className="sp">
      <SpielKopf rest={rounds ? undefined : rest} gesamt={SPIELZEIT} punkte={richtig * 10} />
      <div className="sp-auftrag"><b style={{ color: '#2ECC8F' }}>Grün</b> → gleiche Richtung{stufe >= 4 && <> · <b style={{ color: '#FF4D6D' }}>Rot</b> → Gegenrichtung!</>}{stufe >= 12 && <small>Nur der mittlere Pfeil zählt.</small>}</div>
      <div className={'sp-buehne pc-buehne' + (rueck ? (rueck === a.ziel ? ' gut' : ' schlecht') : '')} key={nr}>
        <div className="pc-reihe">
          {a.flanke && <><Pfeil r={a.flanke} farbe={farbe} klein /><Pfeil r={a.flanke} farbe={farbe} klein /></>}
          <Pfeil r={a.r} farbe={farbe} />
          {a.flanke && <><Pfeil r={a.flanke} farbe={farbe} klein /><Pfeil r={a.flanke} farbe={farbe} klein /></>}
        </div>
      </div>
      <div className={'pc-knoepfe' + (knoepfe.length === 4 ? ' vier' : '')}>
        {knoepfe.map((d) => (
          <button key={d} type="button" onClick={() => tippe(d)} className={'pc-knopf ' + d + (rueck === d ? (d === a.ziel ? ' richtig' : ' falsch') : '')} aria-label={d}>
            <Pfeil r={d} farbe="#4B2FC2" klein />
          </button>
        ))}
      </div>
      <div className="game-hint">Stufe {stufe} · {richtig} richtig · {fehler} Fehler</div>
    </div>
  )
}
