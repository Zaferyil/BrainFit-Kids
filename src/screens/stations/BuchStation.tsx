import { useEffect, useState } from 'react'
import { Icon } from '../../components/Icon'
import type { BuchAuftrag } from '../../data/buch'
import { SAY, STATION_INTRO } from '../../data/sprache'
import { finishStation, setOhneBuch } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { StationDone, StationShell } from './StationShell'

// Arbeitsbuch-Station: Die App sagt, welche Seite, Spalte und Aufgaben im Buch dran sind.
// Das Kind rechnet im Buch mit dem Abakus und hakt danach „Erledigt“ ab – Ergebnisse werden nicht eingetippt.

export function BuchStation({ kidId, auftrag }: { kidId: string; auftrag: BuchAuftrag }) {
  const [done, setDone] = useState<number | null>(null)
  const [started, setStarted] = useState(false)
  const spalte = auftrag.spalte === 'A' ? SAY.spalteA : SAY.spalteB
  const auftragSagen = [SAY.seite, String(auftrag.seite), spalte, SAY.aufgabe, String(auftrag.von), SAY.bis, String(auftrag.bis)]

  useEffect(() => { if (started) void speak(auftragSagen) }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  const erledigt = () => setDone(finishStation(kidId, 'buch', 3, auftrag.aufgaben.length))
  const ohneBuch = () => { setOhneBuch(kidId, true); window.location.hash = '#/einheit' }

  return (
    <StationShell station="buch" title="Mein Arbeitsbuch" intro={STATION_INTRO.buch} started={started} onStart={() => setStarted(true)} say={auftragSagen}>
      <div className="buch">
        <div className="buch-karte">
          <Icon name="book" color="#3BA7FF" size={64} strokeWidth={2} />
          <div className="buch-zeile"><span>Seite</span><b>{auftrag.seite}</b></div>
          <div className="buch-zeile"><span>Spalte</span><b>{auftrag.spalte}</b></div>
          <div className="buch-zeile"><span>Aufgaben</span><b>{auftrag.von} – {auftrag.bis}</b></div>
          <p>Rechne mit dem Abakus und schreib die Ergebnisse ins Buch.</p>
        </div>
        <button type="button" className="btn-primary" onClick={erledigt}><Icon name="check" color="#231A4F" size={26} strokeWidth={3} /> Erledigt!</button>
        <button type="button" className="buch-ohne" onClick={ohneBuch}>Ich habe kein Buch</button>
      </div>
      {done !== null && <StationDone stars={3} perlen={done} text="Super, dein Buch ist fertig!" />}
    </StationShell>
  )
}
