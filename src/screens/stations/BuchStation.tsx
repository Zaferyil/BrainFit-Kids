import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import type { BuchAuftrag } from '../../data/buch'
import { SAY, STATION_INTRO } from '../../data/sprache'
import { finishStation, setOhneBuch } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { typeDigit } from '../../lib/typeDigit'
import { Keypad, StationDone, StationShell } from './StationShell'

// Arbeitsbuch-Station: Die App sagt, welche Seite, Spalte und Aufgaben im Buch dran sind.
// Das Kind rechnet im Buch mit dem Abakus und tippt danach jedes Ergebnis ein; die App prüft.

const starsFor = (fehler: number) => (fehler === 0 ? 3 : fehler <= 2 ? 2 : 1)

export function BuchStation({ kidId, auftrag }: { kidId: string; auftrag: BuchAuftrag }) {
  const [phase, setPhase] = useState<'auftrag' | 'eingeben'>('auftrag')
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [results, setResults] = useState<('right' | 'wrong')[]>([])
  const [zeigen, setZeigen] = useState<{ ok: boolean; soll: number } | null>(null)
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const [started, setStarted] = useState(false)
  const nr = auftrag.von + index
  const soll = auftrag.aufgaben[index].reduce((a, b) => a + b, 0)
  const spalte = auftrag.spalte === 'A' ? SAY.spalteA : SAY.spalteB
  const auftragSagen = [SAY.seite, String(auftrag.seite), spalte, SAY.aufgabe, String(auftrag.von), SAY.bis, String(auftrag.bis)]

  useEffect(() => { if (started && phase === 'auftrag') void speak(auftragSagen) }, [started, phase]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (phase === 'eingeben') void speak([SAY.ergebnisAufgabe, String(nr)]) }, [phase, nr])

  const onKey = (k: string) => {
    if (zeigen || phase !== 'eingeben') return
    const t = typeDigit(input, k, soll)
    setInput(t.input)
    if (!t.done) return
    const ok = Number(t.input) === soll
    const res = [...results, ok ? 'right' as const : 'wrong' as const]
    setResults(res)
    setZeigen({ ok, soll })
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(soll)])
    window.setTimeout(() => {
      setZeigen(null)
      setInput('')
      if (index + 1 >= auftrag.aufgaben.length) {
        const fehler = res.filter((r) => r === 'wrong').length
        const stars = starsFor(fehler)
        setDone({ stars, perlen: finishStation(kidId, 'buch', stars, res.length - fehler) })
      } else setIndex(index + 1)
    }, ok ? 900 : 2600)
  }

  const ohneBuch = () => { setOhneBuch(kidId, true); window.location.hash = '#/einheit' }
  const dots = auftrag.aufgaben.map((_, i) => results[i] ?? (i === index && phase === 'eingeben' ? 'current' : 'open'))

  return (
    <StationShell station="buch" title="Mein Arbeitsbuch" dots={dots} perlen={results.filter((r) => r === 'right').length} intro={STATION_INTRO.buch} started={started} onStart={() => setStarted(true)} say={phase === 'auftrag' ? auftragSagen : [SAY.ergebnisAufgabe, String(nr)]}>
      {phase === 'auftrag' ? (
        <div className="buch">
          <div className="buch-karte">
            <Icon name="book" color="#3BA7FF" size={64} strokeWidth={2} />
            <div className="buch-zeile"><span>Seite</span><b>{auftrag.seite}</b></div>
            <div className="buch-zeile"><span>Spalte</span><b>{auftrag.spalte}</b></div>
            <div className="buch-zeile"><span>Aufgaben</span><b>{auftrag.von} – {auftrag.bis}</b></div>
            <p>Rechne mit dem Abakus und schreib die Ergebnisse ins Buch.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => setPhase('eingeben')}>Fertig gerechnet – Ergebnisse eintippen</button>
          <button type="button" className="buch-ohne" onClick={ohneBuch}>Ich habe kein Buch</button>
        </div>
      ) : (
        <div className="practice">
          <section className="task-card">
            <div className="eyebrow">SEITE {auftrag.seite} · SPALTE {auftrag.spalte}</div>
            <div className="task-ask">Ergebnis von Aufgabe</div>
            <div className="task-number">{nr}</div>
          </section>
          <div className="practice-board buch-board">
            <div className={`task-answer ${zeigen ? (zeigen.ok ? 'right' : 'wrong') : ''} ${input ? 'filled' : ''}`}>{input || '?'}</div>
            {zeigen && !zeigen.ok && (
              <div className="feedback wrong" role="status"><Perli mood="think" size={56} /><div>
                <div className="feedback-text">Richtig ist {zeigen.soll}.</div>
                <div className="feedback-sub">{auftrag.aufgaben[index].map((z, i) => (i === 0 ? z : z < 0 ? ` − ${-z}` : ` + ${z}`)).join('')} = {zeigen.soll}</div>
              </div></div>
            )}
          </div>
          <div className="practice-side"><Keypad onKey={onKey} disabled={!!zeigen} /></div>
        </div>
      )}
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Alles richtig – wow!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}
