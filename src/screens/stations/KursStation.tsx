import { useEffect, useState } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import type { KursAufgabe } from '../../data/kurs'
import { describeNumber } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { SAY, STATION_INTRO } from '../../data/sprache'
import { Keypad, StationDone, StationShell } from './StationShell'
import { typeDigit } from '../../lib/typeDigit'

// Üben mit den Aufgaben aus der Abakus-App (src/data/kurs.ts):
// einstellen (Perlen schieben), lesen (Abakus ablesen), kette (Zahlen kommen alle 3 Sekunden nacheinander,
// das Kind rechnet mit dem Abakus mit und tippt am Ende das Ergebnis) und rechnung (Aufgabe als Text).

const TAKT_MS = 3000
const COLS = 2
type Feedback = { type: 'right' | 'wrong' | 'hint'; text: string; sub?: string } | null

const ziel = (a: KursAufgabe) => (a.art === 'einstellen' || a.art === 'lesen' ? a.zahl : a.antwort)
const starsFor = (errors: number) => (errors === 0 ? 3 : errors <= 2 ? 2 : 1)
/** Vorzeichen-Text einer Kettenzahl: erste Zahl ohne, danach + oder − */
const zeichen = (n: number, i: number) => (i === 0 ? String(n) : n < 0 ? `− ${-n}` : `+ ${n}`)
const sprich = (n: number, i: number) => (i === 0 ? [String(n)] : n < 0 ? [SAY.minus, String(-n)] : [SAY.plus, String(n)])

export function KursStation({ kidId, aufgaben }: { kidId: string; aufgaben: KursAufgabe[] }) {
  const [index, setIndex] = useState(0)
  const [schritt, setSchritt] = useState(0) // bei Ketten: wie viele Zahlen schon gezeigt
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [results, setResults] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const [started, setStarted] = useState(false)
  const a = aufgaben[index]
  const n = ziel(a)
  const kette = a.art === 'kette'
  const ketteFertig = kette && schritt >= a.zahlen.length
  const tippen = a.art === 'lesen' || a.art === 'rechnung' || ketteFertig

  // Vorlesen und Ketten-Takt
  useEffect(() => {
    if (!started || done) return
    if (a.art === 'einstellen') { void speak([SAY.stelleEin, String(a.zahl)]); return }
    if (a.art === 'lesen') { void speak(SAY.welcheZahlAbakus); return }
    if (a.art === 'rechnung') { void speak(SAY.wievielIst); return }
    if (schritt < a.zahlen.length) {
      void speak(sprich(a.zahlen[schritt], schritt))
      const t = window.setTimeout(() => setSchritt(schritt + 1), TAKT_MS)
      return () => window.clearTimeout(t)
    }
    void speak(SAY.wievielIst)
  }, [started, index, schritt, a, done])

  const weiter = (ok: boolean) => {
    const res = [...results, ok ? 'right' as const : 'wrong' as const]
    setResults(res)
    window.setTimeout(() => {
      setFeedback(null)
      setInput('')
      setSchritt(0)
      if (index + 1 >= aufgaben.length) {
        const errors = res.filter((r) => r === 'wrong').length
        const stars = starsFor(errors)
        setDone({ stars, perlen: finishStation(kidId, 'ueben', stars, aufgaben.length - errors) })
      } else setIndex(index + 1)
    }, ok ? 1100 : 3000)
  }

  const pruefen = (wert: number) => {
    const ok = wert === n
    const loesung = kette ? `${a.zahlen.map(zeichen).join(' ')} = ${n}` : a.art === 'rechnung' ? `${a.text} = ${n}` : `${n} = ${describeNumber(n)}`
    setFeedback(ok ? { type: 'right', text: 'Richtig! +1 Perle' } : { type: 'wrong', text: `Fast! Richtig ist ${n}.`, sub: loesung })
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(n)])
    weiter(ok)
  }

  const onKey = (k: string) => {
    if (feedback || !tippen) return
    const t = typeDigit(input, k, n)
    setInput(t.input)
    if (t.done) pruefen(Number(t.input))
  }

  const onAbakus = (v: number) => {
    if (!feedback && a.art === 'einstellen' && v === a.zahl) pruefen(v)
  }

  const dots = aufgaben.map((_, i) => results[i] ?? (i === index ? 'current' : 'open'))
  const sagen = a.art === 'einstellen' ? [SAY.stelleEin, String(a.zahl)] : a.art === 'lesen' ? [SAY.welcheZahlAbakus] : [SAY.wievielIst]

  return (
    <StationShell station="ueben" title="Üben wie im Kurs" dots={dots} perlen={results.filter((r) => r === 'right').length} intro={STATION_INTRO.ueben} started={started} onStart={() => setStarted(true)} say={sagen}>
      <div className="practice">
        <section className={tippen ? 'task-card lesen' : 'task-card'}>
          <div className="eyebrow">AUFGABE {index + 1} VON {aufgaben.length}</div>
          {a.art === 'einstellen' && (<><div className="task-ask">Stelle ein:</div><div className="task-number">{a.zahl}</div></>)}
          {a.art === 'lesen' && <div className="task-ask">Welche Zahl zeigt der Abakus?</div>}
          {a.art === 'rechnung' && <div className="task-number">{a.text} =</div>}
          {kette && (
            <div className="kurs-kette" aria-live="polite">
              {a.zahlen.map((z, i) => (
                <span key={i} className={i < schritt - 1 || ketteFertig ? 'kurs-zahl alt' : i === schritt - 1 ? 'kurs-zahl neu' : 'kurs-zahl leer'}>{i < schritt ? zeichen(z, i) : ''}</span>
              ))}
              {ketteFertig && <span className="kurs-zahl alt">=</span>}
            </div>
          )}
          {tippen && <div className={`task-answer ${feedback?.type ?? ''} ${input ? 'filled' : ''}`}>{input || '?'}</div>}
        </section>

        <div className="practice-board">
          <div className="board-hint">{a.art === 'lesen' ? 'Schau genau hin' : 'Rechne mit dem Abakus'}</div>
          <Fit className="board-fit">
            <Abakus key={index} value={a.art === 'lesen' ? a.zahl : 0} cols={COLS} colw={110} interactive={a.art !== 'lesen' && !feedback} onChange={onAbakus} />
          </Fit>
          {feedback && (
            <div className={`feedback ${feedback.type}`} role="status">
              {feedback.type === 'right' ? <span className="feedback-icon"><Icon name="check" color="#25913F" size={30} strokeWidth={3.2} /></span> : <Perli mood="think" size={56} />}
              <div>
                <div className="feedback-text">{feedback.text}</div>
                {feedback.sub && <div className="feedback-sub">{feedback.sub}</div>}
              </div>
            </div>
          )}
        </div>

        <div className="practice-side">
          {/* Tasten bleiben immer sichtbar, damit der Abakus nicht springt; aktiv nur, wenn getippt wird */}
          <Keypad onKey={onKey} disabled={!!feedback || !tippen} />
        </div>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Alles richtig – wow!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}
