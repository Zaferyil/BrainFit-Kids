import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, type GameProps } from './types'
import { FARBEN, SpielKopf, useEinmal, useSpielzeit } from './spielTeile'

// „Schnell-Sortierer“: Ein Ding nach dem anderen erscheint – tippe schnell, in welchen Korb es gehört.
// Stufe 1–4: Farben (Rot links, Blau rechts) · 5–8: Zahlen „kleiner als 5“ / „5 und größer“ · 9–13: gerade / ungerade
// · ab 14: die Regel wechselt alle paar Dinge. Wer schnell und richtig ist, bekommt Bonuspunkte. Kiga/1. Klasse: Zahlen nur 1–9.

const SPIELZEIT = 45
type Regel = 'farbe' | 'groesse' | 'gerade'
type Ding = { farbe?: number; zahl?: number }

const REGEL: Record<Regel, { links: string; rechts: string; frage: string }> = {
  farbe: { links: 'Rot', rechts: 'Blau', frage: 'Rot oder Blau?' },
  groesse: { links: 'kleiner als 5', rechts: '5 und größer', frage: 'Kleiner als 5?' },
  gerade: { links: 'gerade', rechts: 'ungerade', frage: 'Gerade oder ungerade?' },
}

function regelFuer(stufe: number, nr: number): Regel {
  if (stufe >= 14) return (['farbe', 'groesse', 'gerade'] as Regel[])[Math.floor(nr / 4) % 3]
  return stufe <= 4 ? 'farbe' : stufe <= 8 ? 'groesse' : 'gerade'
}
function ding(regel: Regel, einstellig: boolean, stufe: number): Ding {
  if (regel === 'farbe') return { farbe: Math.random() < 0.5 ? 0 : 1 }
  return { zahl: randInt(1, einstellig || stufe < 11 ? 9 : 99) }
}
function korb(regel: Regel, d: Ding): 'links' | 'rechts' {
  if (regel === 'farbe') return d.farbe === 0 ? 'links' : 'rechts'
  if (regel === 'groesse') return (d.zahl ?? 0) < 5 ? 'links' : 'rechts'
  return (d.zahl ?? 0) % 2 === 0 ? 'links' : 'rechts'
}

export function SchnellSortierer({ level, onFinish, rounds, einstellig = false }: GameProps) {
  const [nr, setNr] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const [fehler, setFehler] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const stufe = level + Math.floor(richtig / 8)
  const regel = regelFuer(stufe, nr)
  const [d, setD] = useState<Ding>(() => ding(regelFuer(level, 0), einstellig, level))
  const [seit, setSeit] = useState(() => Date.now())
  const [rueck, setRueck] = useState<'links' | 'rechts' | null>(null)
  const [ok, setOk] = useState(true)
  const ende = useEinmal(onFinish)
  const fertig = () => ende(richtig / Math.max(1, richtig + fehler) * Math.min(1, richtig / (rounds ? rounds * 3 : 25)), `${richtig} richtig sortiert · ${fehler} Fehler`)
  const rest = useSpielzeit(SPIELZEIT, !rounds, fertig)

  const sortiere = (seite: 'links' | 'rechts') => {
    if (rueck) return
    const gut = korb(regel, d) === seite
    setRueck(seite); setOk(gut)
    if (gut) {
      const schnell = Date.now() - seit < 1200
      setRichtig((r) => r + 1); setPunkte((p) => p + 10 + (schnell ? 5 : 0)); tonRichtig(richtig + 1)
    } else { setFehler((f) => f + 1); tonFalsch() }
    window.setTimeout(() => {
      const n = nr + 1
      if (rounds && n >= rounds * 3) { fertig(); return }
      setNr(n); setD(ding(regelFuer(level + Math.floor((richtig + (gut ? 1 : 0)) / 8), n), einstellig, stufe)); setRueck(null); setSeit(Date.now())
    }, gut ? 250 : 650)
  }

  const R = REGEL[regel]
  const wechsel = stufe >= 14 && nr % 4 === 0
  return (
    <div className="sp">
      <SpielKopf rest={rounds ? undefined : rest} gesamt={SPIELZEIT} punkte={punkte} />
      <div className={'sp-auftrag' + (wechsel ? ' blink' : '')}>{wechsel ? '🔄 Neue Regel: ' : ''}<b>{R.frage}</b></div>
      <div className="sp-buehne so-buehne">
        <div className={'so-ding' + (rueck ? ` weg-${rueck}` : '') + (rueck && !ok ? ' falsch' : '')} key={nr}>
          {d.farbe !== undefined ? <span className="sp-perle" style={{ ['--f' as string]: FARBEN[d.farbe === 0 ? 0 : 1].hex, width: 110, height: 110 }} /> : <b>{d.zahl}</b>}
        </div>
      </div>
      <div className="so-koerbe">
        <button type="button" className="so-korb" onClick={() => sortiere('links')}>⬅️ {R.links}</button>
        <button type="button" className="so-korb" onClick={() => sortiere('rechts')}>{R.rechts} ➡️</button>
      </div>
      <div className="game-hint">Stufe {stufe} · {richtig} richtig · {fehler} Fehler</div>
    </div>
  )
}
