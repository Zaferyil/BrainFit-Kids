import { useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'
import { FARBEN, SpielKopf, useEinmal, useSpielzeit } from './spielTeile'

// „Fehler-Detektiv“: Zwei Perlenbilder – im rechten sind ein paar Perlen anders. Tippe die Unterschiede an.
// Stufe 1–3: 3×3, 1 Unterschied, sehr verschiedene Farben · 4–7: 4×4, 2 Unterschiede · 8–12: 4×4, 3 Unterschiede, auch ähnliche Farben
// · ab 13: 5×5, 3–4 Unterschiede. 90 Sekunden, so viele Bilder wie möglich.

const SPIELZEIT = 90
const AEHNLICH: Record<string, string> = { rot: 'orange', orange: 'rot', blau: 'lila', lila: 'blau', gelb: 'orange', gruen: 'blau' }

function bild(stufe: number) {
  const n = stufe <= 3 ? 3 : stufe <= 12 ? 4 : 5
  const anzahl = stufe <= 3 ? 1 : stufe <= 7 ? 2 : stufe <= 12 ? 3 : randInt(3, 4)
  const farben = FARBEN.slice(0, stufe <= 3 ? 3 : stufe <= 7 ? 4 : 6)
  const links = Array.from({ length: n * n }, () => farben[randInt(0, farben.length - 1)].id)
  const rechts = [...links]
  const orte = shuffle(links.map((_, i) => i)).slice(0, anzahl)
  for (const i of orte) {
    const nah = stufe >= 8 && AEHNLICH[links[i]] && Math.random() < 0.6
    rechts[i] = nah ? AEHNLICH[links[i]] : shuffle(farben.filter((f) => f.id !== links[i]))[0].id
  }
  return { n, links, rechts, orte }
}
const hex = (id: string) => FARBEN.find((f) => f.id === id)!.hex

export function FehlerDetektiv({ level, onFinish, rounds }: GameProps) {
  const [geschafft, setGeschafft] = useState(0)
  const stufe = level + Math.floor(geschafft / 2)
  const [b, setB] = useState(() => bild(level))
  const [gefunden, setGefunden] = useState<number[]>([])
  const [falsch, setFalsch] = useState<number | null>(null)
  const [fehler, setFehler] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const ende = useEinmal(onFinish)
  const fertig = (g: number, f: number) => ende(g / (rounds ?? 6) - f * 0.04, `${g} Bilder gelöst${f ? ` · ${f} Fehlklicks` : ''}`)
  const rest = useSpielzeit(SPIELZEIT, !rounds, () => fertig(geschafft, fehler))

  const tippe = (i: number) => {
    if (gefunden.includes(i)) return
    if (!b.orte.includes(i)) { setFalsch(i); setFehler((f) => f + 1); tonFalsch(); window.setTimeout(() => setFalsch(null), 400); return }
    const neu = [...gefunden, i]
    setGefunden(neu); setPunkte((p) => p + 10); tonRichtig(neu.length)
    if (neu.length < b.orte.length) return
    const g = geschafft + 1
    setGeschafft(g); void speak('Super!')
    if (rounds && g >= rounds) { window.setTimeout(() => fertig(g, fehler), 600); return }
    window.setTimeout(() => { setB(bild(level + Math.floor(g / 2))); setGefunden([]) }, 900)
  }

  const raster = { gridTemplateColumns: `repeat(${b.n}, 1fr)` }
  return (
    <div className="sp">
      <SpielKopf rest={rounds ? undefined : rest} gesamt={SPIELZEIT} punkte={punkte} />
      <div className="sp-auftrag">Finde <b>{b.orte.length - gefunden.length}</b> {b.orte.length - gefunden.length === 1 ? 'Unterschied' : 'Unterschiede'} – tippe im <b>rechten</b> Bild!</div>
      <div className="fd-paar">
        <div className="fd-bild" style={raster}>{b.links.map((f, i) => <span key={i} className="fd-zelle"><i style={{ background: hex(f) }} /></span>)}</div>
        <div className="fd-bild rechts" style={raster}>
          {b.rechts.map((f, i) => (
            <button key={i} type="button" onClick={() => tippe(i)} aria-label={`Feld ${i + 1}`}
              className={'fd-zelle' + (gefunden.includes(i) ? ' gefunden' : '') + (falsch === i ? ' falsch' : '')}><i style={{ background: hex(f) }} /></button>
          ))}
        </div>
      </div>
      <div className="game-hint">Stufe {stufe} · {geschafft} {geschafft === 1 ? 'Bild' : 'Bilder'} gelöst</div>
    </div>
  )
}
