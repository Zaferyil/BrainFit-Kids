import { useEffect, useState } from 'react'
import { SeZa } from './SeZa'
import { kindEinstellungen } from '../lib/wirtschaft'
import { lernzeit, mehrZeit, pauseGemacht, pauseNachMin, zaehle } from '../lib/lernzeit'
import { speak } from '../lib/speak'

// Achtet auf die Lernzeit: schlägt nach einer Weile eine Pause vor und stoppt beim Tageslimit der Eltern.

export const PAUSE_SAGEN = 'Super gelernt! Jetzt ist Zeit für eine kleine Pause. Steh auf, streck dich und trink einen Schluck Wasser!'
export const LIMIT_SAGEN = 'Für heute hast du genug gelernt. Toll gemacht! Morgen geht es weiter.'
const TAKT = 15

/** Rechenfrage für Erwachsene, damit Kinder das Limit nicht selbst aufheben */
export function ElternFrage({ onOk, onAbbruch }: { onOk: () => void; onAbbruch: () => void }) {
  const [[a, b]] = useState(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)])
  const [x, setX] = useState('')
  return (
    <div className="eltern-frage">
      <p>Nur für Eltern: Wie viel ist <b>{a} × {b}</b>?</p>
      <input inputMode="numeric" value={x} onChange={(e) => setX(e.target.value.replace(/\D/g, ''))} aria-label="Ergebnis" autoFocus />
      <div><button type="button" className="btn-primary small" disabled={Number(x) !== a * b} onClick={onOk}>OK</button> <button type="button" className="lz-link" onClick={onAbbruch}>Abbrechen</button></div>
    </div>
  )
}

export function LernzeitWaechter({ kidId }: { kidId: string }) {
  const [modus, setModus] = useState<'aus' | 'pause' | 'pauseLaeuft' | 'limit'>('aus')
  const [rest, setRest] = useState(60)
  const [eltern, setEltern] = useState(false)

  useEffect(() => {
    const t = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || modus !== 'aus') return
      const e = kindEinstellungen(kidId)
      const z = zaehle(kidId, TAKT)
      if (e.limitMin && z.sek >= (e.limitMin + (z.extraMin ?? 0)) * 60) { setModus('limit'); void speak(LIMIT_SAGEN); return }
      if (e.pausen !== false && z.amStueck >= pauseNachMin(kidId) * 60) { setModus('pause'); void speak(PAUSE_SAGEN) }
    }, TAKT * 1000)
    return () => window.clearInterval(t)
  }, [kidId, modus])

  // Beim Öffnen: Limit schon erreicht?
  useEffect(() => {
    const e = kindEinstellungen(kidId), z = lernzeit(kidId)
    if (e.limitMin && z.sek >= (e.limitMin + (z.extraMin ?? 0)) * 60) setModus('limit')
  }, [kidId])

  useEffect(() => {
    if (modus !== 'pauseLaeuft') return
    if (rest <= 0) { pauseGemacht(kidId); setModus('aus'); return }
    const t = window.setTimeout(() => setRest((r) => r - 1), 1000)
    return () => window.clearTimeout(t)
  }, [modus, rest, kidId])

  if (modus === 'aus') return null
  return (
    <div className="lz-overlay" role="dialog" aria-modal="true">
      <div className="lz-karte popin">
        <SeZa kidId={kidId} groesse={130} jubel />
        {modus === 'pause' && <>
          <h2>Zeit für eine Pause! 🧘</h2>
          <p>Steh auf, streck dich und trink einen Schluck Wasser.</p>
          <button type="button" className="btn-primary" onClick={() => { setRest(60); setModus('pauseLaeuft') }}>1 Minute Pause</button>
          <button type="button" className="lz-link" onClick={() => { pauseGemacht(kidId); setModus('aus') }}>Später</button>
        </>}
        {modus === 'pauseLaeuft' && <>
          <h2>Pause … {rest} s</h2>
          <p className="lz-uebung">{rest > 40 ? '🙆 Arme hoch und strecken!' : rest > 20 ? '🤸 Fünfmal hüpfen!' : '😌 Tief einatmen und ausatmen.'}</p>
          <button type="button" className="lz-link" onClick={() => { pauseGemacht(kidId); setModus('aus') }}>Weiter lernen</button>
        </>}
        {modus === 'limit' && <>
          <h2>Für heute geschafft! 🌙</h2>
          <p>Toll gemacht! Morgen geht es weiter.</p>
          {!eltern ? <button type="button" className="lz-link" onClick={() => setEltern(true)}>Eltern: 15 Minuten mehr</button>
            : <ElternFrage onOk={() => { mehrZeit(kidId, 15); setEltern(false); setModus('aus') }} onAbbruch={() => setEltern(false)} />}
        </>}
      </div>
    </div>
  )
}
