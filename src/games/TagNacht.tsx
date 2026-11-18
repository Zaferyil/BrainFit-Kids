import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, shuffle, type GameProps } from './types'
import { SpielKopf, useEinmal, useSpielzeit } from './spielTeile'

// „Tag und Nacht“: Erscheint die Sonne, tippe den Mond – erscheint der Mond, tippe die Sonne! (Gegenteil-Spiel)
// Stufe 1–3: nur Sonne/Mond, Knöpfe fest · 4–7: Knöpfe tauschen manchmal die Plätze · 8–11: dazu Regen ↔ Regenbogen
// · ab 12: mit 🔄 auf der Karte gilt ausnahmsweise das GLEICHE Bild (Regel wechselt).

const SPIELZEIT = 45
const PAARE: [string, string][] = [['☀️', '🌙'], ['🌧️', '🌈']]

function aufgabe(stufe: number) {
  const paare = stufe >= 8 ? PAARE : PAARE.slice(0, 1)
  const paar = paare[randInt(0, paare.length - 1)]
  const bild = paar[randInt(0, 1)]
  const gegen = paar[0] === bild ? paar[1] : paar[0]
  const gleich = stufe >= 12 && Math.random() < 0.3
  const knoepfe = stufe >= 8 ? shuffle(PAARE.flat()) : stufe >= 4 && Math.random() < 0.5 ? [paar[1], paar[0]] : [...PAARE[0]]
  return { bild, ziel: gleich ? bild : gegen, gleich, knoepfe }
}

export function TagNacht({ level, onFinish, rounds }: GameProps) {
  const [richtig, setRichtig] = useState(0)
  const [fehler, setFehler] = useState(0)
  const stufe = level + Math.floor(richtig / 6)
  const [a, setA] = useState(() => aufgabe(level))
  const [nr, setNr] = useState(0)
  const [rueck, setRueck] = useState<string | null>(null)
  const ende = useEinmal(onFinish)
  const fertig = (rr = richtig, ff = fehler) => ende(Math.min(1, rr / (rounds ? rounds * 3 : 30)) * (rr / Math.max(1, rr + ff)), `${rr} richtig · ${ff} Fehler`)
  const rest = useSpielzeit(SPIELZEIT, !rounds, () => fertig())

  const tippe = (k: string) => {
    if (rueck) return
    const ok = k === a.ziel
    setRueck(k)
    const rr = richtig + (ok ? 1 : 0), ff = fehler + (ok ? 0 : 1)
    if (ok) { setRichtig(rr); tonRichtig(rr) } else { setFehler(ff); tonFalsch() }
    window.setTimeout(() => {
      if (rounds && nr + 1 >= rounds * 3) { fertig(rr, ff); return }
      setNr(nr + 1); setA(aufgabe(level + Math.floor(rr / 6))); setRueck(null)
    }, ok ? 300 : 800)
  }

  return (
    <div className="sp">
      <SpielKopf rest={rounds ? undefined : rest} gesamt={SPIELZEIT} punkte={richtig * 10} />
      <div className="sp-auftrag">Tippe das <b>Gegenteil</b>!{stufe >= 12 && <small>Bei 🔄 tippst du das gleiche Bild.</small>}</div>
      <div className={'sp-buehne tn-buehne' + (a.gleich ? ' gleich' : '')} key={nr}>
        <span className="tn-bild">{a.bild}</span>
        {a.gleich && <span className="tn-dreh">🔄</span>}
      </div>
      <div className={'tn-knoepfe' + (a.knoepfe.length === 4 ? ' vier' : '')}>
        {a.knoepfe.map((k) => (
          <button key={k} type="button" onClick={() => tippe(k)} className={'tn-knopf' + (rueck === k ? (k === a.ziel ? ' richtig' : ' falsch') : '')}>{k}</button>
        ))}
      </div>
      <div className="game-hint">Stufe {stufe} · {richtig} richtig · {fehler} Fehler</div>
    </div>
  )
}
