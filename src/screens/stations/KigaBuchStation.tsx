import { useEffect, useState } from 'react'
import { SAY, STATION_INTRO } from '../../data/sprache'
import { KIGA_BUCH, kigaAuftrag } from '../../data/kigaBuch'
import { finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { StationDone, StationShell } from './StationShell'

// Arbeitsbuch für Kindergartenkinder: welche Seiten im Kiga-Buch dran sind, mit Bildern der Seiten.
// Die Seiten sind zum Schreiben, Malen und Verbinden – deshalb kein Wissenscheck, das Kind hakt selbst ab.

const bild = (s: number) => `${import.meta.env.BASE_URL}kiga-buch/s${s}.webp`

export function KigaBuchStation({ kidId, lektion }: { kidId: string; lektion: number }) {
  const a = kigaAuftrag(lektion)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const sagen = a ? [SAY.seite, String(a.von), SAY.bis, String(a.bis)] : ['Dein Buch ist fertig. Super!']
  useEffect(() => { if (started) void speak(sagen) }, [started]) // eslint-disable-line react-hooks/exhaustive-deps
  const seiten = a ? Array.from({ length: a.bis - a.von + 1 }, (_, i) => a.von + i) : []

  return (
    <StationShell station="buch" title="Mein Arbeitsbuch" intro={STATION_INTRO.buch} started={started} onStart={() => setStarted(true)} say={sagen}>
      <div className="buch kiga-buch">
        <div className="buch-karte">
          <div className="buch-titel">
            <img src={bild(1)} alt="" />
            <div><span>Dein Buch</span><b>Mein erstes Abakus-Buch</b></div>
          </div>
          {a ? <>
            <div className="buch-zeile"><span>Seiten</span><b>{a.von} – {a.bis}</b></div>
            <p className="kiga-thema">{a.thema}</p>
            <div className="kiga-seiten">{seiten.map((s) => <figure key={s}><img src={bild(s)} alt={`Seite ${s}`} loading="lazy" /><figcaption>{s}</figcaption></figure>)}</div>
            <p>Mach diese Seiten in deinem Buch. Nimm deinen Abakus dazu!</p>
          </> : <p>🎉 Dein Kiga-Buch ist fertig – alle {KIGA_BUCH.length} Teile geschafft!</p>}
        </div>
        <button type="button" className="btn-primary ha-start" onClick={() => setDone({ stars: 3, perlen: finishStation(kidId, 'buch', 3, a ? seiten.length : 0) })}>
          ✓ Ich bin fertig
        </button>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={a ? 'Toll gemacht! Deine Buchseiten sind fertig.' : 'Super!'} />}
    </StationShell>
  )
}
