import { useEffect, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, shuffle, type GameProps } from './types'
import { SpielKopf, useEinmal, useSpielzeit } from './spielTeile'

// „Symbol-Blitz“: Oben steht ein Zeichen – finde es so schnell wie möglich unten im Feld.
// Stufe 1–3: 4 Felder, ganz verschiedene Zeichen · 4–7: 6 Felder · 8–12: 9 Felder mit ähnlichen Zeichen (z. B. ◐ ◑ ◒)
// · ab 13: 12 Felder, nur ähnliche Zeichen, und ab 16 ist das Vorbild nach 1 s verdeckt (aus dem Gedächtnis suchen).

const SPIELZEIT = 45
const GRUPPEN = [
  ['★', '☆', '✦', '✧'], ['◐', '◑', '◒', '◓'], ['▲', '△', '▼', '▽'], ['●', '○', '◉', '◎'],
  ['■', '□', '▣', '▢'], ['♥', '♡', '♦', '♢'], ['➜', '➔', '➙', '➛'], ['☀', '☁', '☂', '☃'],
]

function runde(stufe: number) {
  const felder = stufe <= 3 ? 4 : stufe <= 7 ? 6 : stufe <= 12 ? 9 : 12
  const gruppe = GRUPPEN[randInt(0, GRUPPEN.length - 1)]
  const ziel = gruppe[randInt(0, gruppe.length - 1)]
  let andere: string[]
  if (stufe <= 7) andere = shuffle(GRUPPEN.filter((g) => g !== gruppe).flat())
  else if (stufe <= 12) andere = shuffle([...gruppe.filter((z) => z !== ziel), ...shuffle(GRUPPEN.filter((g) => g !== gruppe).flat()).slice(0, 4)])
  else { const nah = gruppe.filter((z) => z !== ziel); andere = shuffle([...nah, ...nah, ...nah, ...shuffle(GRUPPEN.filter((g) => g !== gruppe).flat()).slice(0, 3)]) }
  const feld = shuffle([ziel, ...Array.from({ length: felder - 1 }, (_, i) => andere[i % andere.length])])
  return { ziel, feld, verdeckt: stufe >= 16 }
}

export function SymbolBlitz({ level, onFinish, rounds }: GameProps) {
  const [richtig, setRichtig] = useState(0)
  const [fehler, setFehler] = useState(0)
  const [punkte, setPunkte] = useState(0)
  const stufe = level + Math.floor(richtig / 4)
  const [r, setR] = useState(() => runde(level))
  const [nr, setNr] = useState(0)
  const [seit, setSeit] = useState(() => Date.now())
  const [falsch, setFalsch] = useState<number | null>(null)
  const [treffer, setTreffer] = useState<number | null>(null)
  const ende = useEinmal(onFinish)
  const fertig = (rr = richtig, ff = fehler) => ende(Math.min(1, rr / (rounds ?? 18)) - ff * 0.03, `${rr} Zeichen gefunden · ${ff} Fehler`)
  const rest = useSpielzeit(SPIELZEIT, !rounds, () => fertig())
  const [versteckt, setVersteckt] = useState(false)
  useEffect(() => { setVersteckt(false); if (!r.verdeckt) return; const t = window.setTimeout(() => setVersteckt(true), 1000); return () => window.clearTimeout(t) }, [r])
  const zeigeVorbild = !versteckt

  const tippe = (z: string, i: number) => {
    if (treffer !== null) return
    if (z !== r.ziel) { setFalsch(i); setFehler((f) => f + 1); tonFalsch(); window.setTimeout(() => setFalsch(null), 350); return }
    const rr = richtig + 1
    setTreffer(i); setRichtig(rr); setPunkte((p) => p + 10 + (Date.now() - seit < 1500 ? 5 : 0)); tonRichtig(rr)
    window.setTimeout(() => {
      if (rounds && rr >= rounds * 2) { fertig(rr); return }
      setR(runde(level + Math.floor(rr / 4))); setNr(nr + 1); setSeit(Date.now()); setTreffer(null)
    }, 350)
  }

  const spalten = r.feld.length <= 4 ? 2 : r.feld.length <= 9 ? 3 : 4
  return (
    <div className="sp">
      <SpielKopf rest={rounds ? undefined : rest} gesamt={SPIELZEIT} punkte={punkte} />
      <div className="sy-vorbild" key={nr}>
        <span>Finde:</span><b className={zeigeVorbild ? '' : 'weg'}>{zeigeVorbild ? r.ziel : '?'}</b>
        {r.verdeckt && <small>Merk es dir – es verschwindet!</small>}
      </div>
      <div className="sy-feld" style={{ gridTemplateColumns: `repeat(${spalten}, 1fr)` }}>
        {r.feld.map((z, i) => (
          <button key={`${nr}-${i}`} type="button" onClick={() => tippe(z, i)} className={'sy-zelle' + (falsch === i ? ' falsch' : '') + (treffer === i ? ' richtig' : '')}>{z}</button>
        ))}
      </div>
      <div className="game-hint">Stufe {stufe} · {richtig} gefunden</div>
    </div>
  )
}
