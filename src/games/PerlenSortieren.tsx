import { tonFalsch, tonRichtig } from '../lib/effekte'
import { useState } from 'react'
import { Bead, type BeadColor } from '../components/Bead'
import { Icon } from '../components/Icon'
import { speak } from '../lib/speak'
import { usePortrait } from '../lib/usePortrait'
import { shuffle, type GameProps } from './types'

// Perlen sortieren (Logik): Perlen liegen gemischt auf Abakus-Stangen. Tippe eine Stange an, dann eine andere:
// die oberste Perle wandert hinüber – aber nur auf eine leere Stange oder auf eine Perle derselben Farbe.
// Ziel: Auf jeder Stange nur noch eine Farbe. Jedes Rätsel wird vor dem Anzeigen mit einem Löser geprüft.

const FARBEN: BeadColor[] = ['yellow', 'blue', 'pink', 'green', 'orange', 'purple']
const HOEHE = 4
type Stangen = number[][] // je Stange die Farben von unten nach oben

/** Stufe → Anzahl Farben und leerer Stangen */
function groesse(level: number) {
  if (level <= 3) return { farben: 2, leer: 1 }
  if (level <= 7) return { farben: 3, leer: 2 }
  if (level <= 12) return { farben: 4, leer: 2 }
  if (level <= 16) return { farben: 5, leer: 2 }
  return { farben: 6, leer: 2 }
}

const fertig = (s: Stangen) => s.every((st) => st.length === 0 || (st.length === HOEHE && st.every((c) => c === st[0])))
const erlaubt = (s: Stangen, von: number, nach: number) => {
  if (von === nach || !s[von].length || s[nach].length >= HOEHE) return false
  const top = s[von][s[von].length - 1]
  return !s[nach].length || s[nach][s[nach].length - 1] === top
}
const ziehe = (s: Stangen, von: number, nach: number): Stangen => {
  const n = s.map((st) => [...st])
  n[nach].push(n[von].pop()!)
  return n
}

/** Tiefensuche: lösbar? Liefert die Zahl der Züge einer gefundenen Lösung (Vergleichswert fürs Ergebnis) */
function loesbar(start: Stangen): number | null {
  const gesehen = new Set<string>()
  const schluessel = (s: Stangen) => s.map((st) => st.join('')).sort().join('|')
  let schritte = 0
  const suche = (s: Stangen, tiefe: number): number | null => {
    if (fertig(s)) return tiefe
    if (++schritte > 40000 || tiefe > 80) return null
    const k = schluessel(s)
    if (gesehen.has(k)) return null
    gesehen.add(k)
    for (let a = 0; a < s.length; a++) for (let b = 0; b < s.length; b++) {
      if (!erlaubt(s, a, b)) continue
      // unnütze Züge überspringen: einfarbige Stange auf leere Stange
      if (!s[b].length && s[a].every((c) => c === s[a][0])) continue
      const r = suche(ziehe(s, a, b), tiefe + 1)
      if (r !== null) return r
    }
    return null
  }
  return suche(start, 0)
}

function neuesRaetsel(level: number): { stangen: Stangen; ziel: number } {
  const { farben, leer } = groesse(level)
  for (let versuch = 0; versuch < 60; versuch++) {
    const perlen = shuffle(Array.from({ length: farben * HOEHE }, (_, i) => Math.floor(i / HOEHE)))
    const stangen: Stangen = Array.from({ length: farben }, (_, i) => perlen.slice(i * HOEHE, (i + 1) * HOEHE))
    for (let i = 0; i < leer; i++) stangen.push([])
    if (fertig(stangen)) continue
    const z = loesbar(stangen)
    if (z !== null) return { stangen, ziel: z }
  }
  // Rückfall (praktisch nie): leicht lösbares Rätsel
  return { stangen: [[0, 1, 0, 1], [1, 0, 1, 0], []], ziel: 8 }
}

const RUNDEN = 3

export function PerlenSortieren({ level, onFinish, rounds = RUNDEN }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [raetsel, setRaetsel] = useState(() => neuesRaetsel(level))
  const [stangen, setStangen] = useState<Stangen>(raetsel.stangen)
  const [verlauf, setVerlauf] = useState<Stangen[]>([])
  const [auswahl, setAuswahl] = useState<number | null>(null)
  const [wackel, setWackel] = useState<number | null>(null)
  const [zuege, setZuege] = useState(0)
  const [punkte, setPunkte] = useState<number[]>([])
  const [geschafft, setGeschafft] = useState(false)
  const farben = FARBEN.slice(0, groesse(level).farben)
  const hoch = usePortrait()

  const tippe = (i: number) => {
    if (geschafft) return
    if (auswahl === null) { if (stangen[i].length) setAuswahl(i); return }
    if (auswahl === i) { setAuswahl(null); return }
    if (!erlaubt(stangen, auswahl, i)) {
      setWackel(i); window.setTimeout(() => setWackel(null), 400); tonFalsch()
      if (stangen[i].length) setAuswahl(i); else setAuswahl(null)
      return
    }
    const neu = ziehe(stangen, auswahl, i)
    setVerlauf([...verlauf, stangen]); setStangen(neu); setAuswahl(null); setZuege(zuege + 1)
    if (fertig(neu)) {
      setGeschafft(true)
      const p = Math.min(1, raetsel.ziel / Math.max(1, zuege + 1)) * 0.4 + 0.6
      const alle = [...punkte, p]
      setPunkte(alle)
      tonRichtig(5)
      speak('Super gemacht!')
      window.setTimeout(() => {
        if (runde + 1 >= rounds) {
          const score = alle.reduce((a, b) => a + b, 0) / rounds
          onFinish(score, `${rounds} von ${rounds} Rätseln gelöst`)
        } else {
          const r = neuesRaetsel(level)
          setRunde(runde + 1); setRaetsel(r); setStangen(r.stangen); setVerlauf([]); setZuege(0); setGeschafft(false)
        }
      }, 1300)
    }
  }
  const zurueck = () => { if (!verlauf.length || geschafft) return; setStangen(verlauf[verlauf.length - 1]); setVerlauf(verlauf.slice(0, -1)); setAuswahl(null) }
  const neustart = () => { if (geschafft) return; setStangen(raetsel.stangen); setVerlauf([]); setAuswahl(null) }

  return (
    <div className={hoch ? 'game-sort hoch' : 'game-sort'}>
      <div className="sort-hinweis"><b>Rätsel {runde + 1} von {rounds}</b><span>Jede Stange nur eine Farbe!</span><span className="sort-zuege">{zuege} Züge</span></div>
      <div className={geschafft ? 'sort-feld fertig' : 'sort-feld'}>
        {stangen.map((st, i) => (
          <button key={i} type="button" className={`sort-stange${auswahl === i ? ' aktiv' : ''}${wackel === i ? ' wackel' : ''}`} onClick={() => tippe(i)} aria-label={`Stange ${i + 1}`}>
            <span className="sort-stab" />
            <span className="sort-perlen">
              {st.map((c, k) => (
                <span key={k} className={auswahl === i && k === st.length - 1 ? 'sort-perle hoch' : 'sort-perle'}><Bead color={farben[c]} width={hoch ? 54 : 78} /></span>
              ))}
            </span>
            <span className="sort-fuss" />
          </button>
        ))}
      </div>
      <div className="sort-knoepfe">
        <button type="button" className="round-btn" onClick={zurueck} disabled={!verlauf.length || geschafft} aria-label="Zug zurück"><Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} /></button>
        <button type="button" className="round-btn" onClick={neustart} disabled={geschafft} aria-label="Neu starten"><Icon name="refresh" color="#FFFFFF" size={24} strokeWidth={2.6} /></button>
      </div>
    </div>
  )
}
