import { useMemo, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'
import { FARBEN, SpielKopf, useEinmal } from './spielTeile'

// „Waage-Rätsel“: Auf jeder Seite der Waage liegen Perlen. Welche Seite ist schwerer – oder sind beide gleich?
// Stufe 1–4: nur eine Farbe, Perlen zählen · 5–9: zwei Farben, eine Regel („1 Rot wiegt so viel wie 2 Blau“)
// · 10–14: Regel mit 3 · ab 15: drei Farben mit zwei Regeln (Rot = 2 Blau, Blau = 2 Gelb). Ab 8 auch „gleich schwer“.

const RUNDEN = 8
type Seite = number[] // Anzahl je Farbe
type Aufgabe = { gewicht: number[]; regeln: [number, number, number][]; links: Seite; rechts: Seite; loesung: 'links' | 'rechts' | 'gleich' }

const summe = (s: Seite, g: number[]) => s.reduce((a, n, i) => a + n * g[i], 0)

function aufgabe(stufe: number): Aufgabe {
  for (;;) {
    let gewicht: number[], regeln: [number, number, number][]
    if (stufe <= 4) { gewicht = [1]; regeln = [] }
    else if (stufe <= 14) { const k = stufe <= 9 ? 2 : 3; gewicht = [k, 1]; regeln = [[0, k, 1]] }
    else { gewicht = [4, 2, 1]; regeln = [[0, 2, 1], [1, 2, 2]] }
    const farben = gewicht.length
    const max = stufe <= 4 ? 7 : 4
    const zieh = (): Seite => Array.from({ length: farben }, () => randInt(0, max))
    const links = zieh(), rechts = zieh()
    if (summe(links, gewicht) === 0 || summe(rechts, gewicht) === 0) continue
    const l = summe(links, gewicht), r = summe(rechts, gewicht)
    const gleichErlaubt = stufe >= 8
    if (l === r && !gleichErlaubt) continue
    // bei mehreren Farben soll die reine Perlen-Anzahl nicht schon die Antwort verraten
    const anzahlL = links.reduce((a, b) => a + b, 0), anzahlR = rechts.reduce((a, b) => a + b, 0)
    if (farben > 1 && l !== r && (anzahlL > anzahlR) === (l > r) && Math.random() < 0.6) continue
    if (anzahlL > 9 || anzahlR > 9) continue
    return { gewicht, regeln, links, rechts, loesung: l === r ? 'gleich' : l > r ? 'links' : 'rechts' }
  }
}

function Schale({ seite, kippe }: { seite: Seite; kippe: number }) {
  const perlen = useMemo(() => shuffle(seite.flatMap((n, i) => Array.from({ length: n }, () => i))), [seite])
  return (
    <div className="wa-schale" style={{ transform: `translateY(${kippe}px)` }}>
      <div className="wa-perlen">{perlen.map((f, k) => <span key={k} className="sp-perle" style={{ ['--f' as string]: FARBEN[f].hex, width: 30, height: 30 }} />)}</div>
      <div className="wa-teller" />
    </div>
  )
}

export function WaageRaetsel({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const stufe = level + Math.floor(richtig / 3)
  const [a, setA] = useState(() => aufgabe(level))
  const [wahl, setWahl] = useState<string | null>(null)
  const ende = useEinmal(onFinish)

  const antworte = (w: Aufgabe['loesung']) => {
    if (wahl) return
    const ok = w === a.loesung
    setWahl(w)
    const r = richtig + (ok ? 1 : 0)
    setRichtig(r)
    if (ok) { tonRichtig(r); void speak('Richtig!') } else tonFalsch()
    window.setTimeout(() => {
      if (runde + 1 >= rounds) { ende(r / rounds, `${r} von ${rounds} Waagen richtig`); return }
      setRunde(runde + 1); setA(aufgabe(level + Math.floor(r / 3))); setWahl(null)
    }, ok ? 1100 : 2000)
  }

  // nach der Antwort kippt die Waage zur schwereren Seite
  const neig = wahl ? (a.loesung === 'links' ? -1 : a.loesung === 'rechts' ? 1 : 0) : 0
  return (
    <div className="sp">
      <SpielKopf punkte={richtig * 10} />
      {a.regeln.length > 0 && (
        <div className="wa-regeln">
          {a.regeln.map(([g, k, l], i) => (
            <span key={i} className="wa-regel"><span className="sp-perle" style={{ ['--f' as string]: FARBEN[g].hex, width: 26, height: 26 }} /> wiegt so viel wie
              {Array.from({ length: k }, (_, j) => <span key={j} className="sp-perle" style={{ ['--f' as string]: FARBEN[l].hex, width: 26, height: 26 }} />)}</span>
          ))}
        </div>
      )}
      <div className="sp-buehne wa-buehne">
        <div className="wa-balken" style={{ transform: `rotate(${neig * 8}deg)` }}>
          <Schale seite={a.links} kippe={0} />
          <Schale seite={a.rechts} kippe={0} />
        </div>
        <div className="wa-fuss" />
      </div>
      <div className="sp-optionen drei">
        {([['links', '⬅️ Links'], ['gleich', '⚖️ Gleich'], ['rechts', 'Rechts ➡️']] as const).filter(([w]) => w !== 'gleich' || stufe >= 8).map(([w, t]) => (
          <button key={w} type="button" disabled={!!wahl} onClick={() => antworte(w)}
            className={'sp-option klein' + (wahl && w === a.loesung ? ' richtig' : wahl === w ? ' falsch' : '')}>{t}</button>
        ))}
      </div>
      <div className="game-hint">Runde {runde + 1} von {rounds} · Welche Seite ist schwerer? · Stufe {stufe}</div>
    </div>
  )
}
