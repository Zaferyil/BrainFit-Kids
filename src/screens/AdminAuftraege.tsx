import { useEffect, useMemo, useState } from 'react'
import { WORLDS } from '../data/curriculum'
import { GAMES } from '../games/registry'
import type { KidZeile } from '../lib/admin'
import { auftragAnlegen, auftraegeLaden, auftragLoeschen, auftragStand, type Auftrag, type AuftragArt } from '../lib/auftraege'
import { arbeitsblattDrucken, type BlattArt } from '../lib/arbeitsblatt'
import { istCloudKind } from '../lib/serverRpc'

// Lehrkraft: Aufträge an eine Klasse geben und sehen, wer sie erledigt hat. Dazu druckbare Arbeitsblätter.

export function AdminAuftraege({ zeilen }: { zeilen: KidZeile[] }) {
  const klassen = useMemo(() => [...new Set(zeilen.map((z) => z.klassenCode))].sort(), [zeilen])
  const [klasse, setKlasse] = useState(klassen[0] ?? '')
  const [art, setArt] = useState<AuftragArt>('anzan')
  const [anzahl, setAnzahl] = useState(3)
  const [level, setLevel] = useState(1)
  const [spiel, setSpiel] = useState(GAMES.find((g) => g.ready)?.id ?? '')
  const [welt, setWelt] = useState(1)
  const [faellig, setFaellig] = useState('')
  const [liste, setListe] = useState<Auftrag[]>([])
  const [meldung, setMeldung] = useState('')
  const kinder = zeilen.filter((z) => z.klassenCode === klasse)
  const cloud = kinder.some((z) => istCloudKind(z.kid.id))
  const neuLaden = () => { if (klasse) void auftraegeLaden(klasse).then(setListe) }
  useEffect(neuLaden, [klasse])

  const anlegen = async () => {
    setMeldung('')
    const ziel = art === 'anzan' ? { anzahl, level } : art === 'spiel' ? { anzahl, spiel } : art === 'pruefung' ? { welt, anzahl: 1 } : { anzahl }
    try { await auftragAnlegen({ klasse, art, ziel, faellig: faellig || null }, cloud); setMeldung('✓ Auftrag gespeichert'); neuLaden() }
    catch (e) { setMeldung(`Fehler: ${(e as Error).message}. Ist supabase/update-16-auftraege.sql schon eingespielt?`) }
  }

  // Arbeitsblatt
  const [bArt, setBArt] = useState<BlattArt>('lektion')
  const [bWelt, setBWelt] = useState(1)
  const [bEinheit, setBEinheit] = useState(2)
  const [bAnzahl, setBAnzahl] = useState(24)
  const [bStellen, setBStellen] = useState(1)
  const [bLaenge, setBLaenge] = useState(4)

  return (
    <>
      <section className="adm-card">
        <div className="adm-card-head"><h2>Neuer Auftrag</h2><span className="adm-muted">Wird automatisch abgehakt, sobald das Kind es gespielt hat.</span></div>
        <div className="adm-form-reihe">
          <label>Klasse<select value={klasse} onChange={(e) => setKlasse(e.target.value)}>{klassen.map((k) => <option key={k}>{k}</option>)}</select></label>
          <label>Art<select value={art} onChange={(e) => setArt(e.target.value as AuftragArt)}>
            <option value="anzan">Anzan (Flash-Rechnen)</option><option value="spiel">Denkspiel</option><option value="wiederholen">Wiederholung</option><option value="pruefung">Gürtel-Prüfung</option>
          </select></label>
          {art === 'anzan' && <label>ab Level<input type="number" min={1} max={96} value={level} onChange={(e) => setLevel(Number(e.target.value))} /></label>}
          {art === 'spiel' && <label>Spiel<select value={spiel} onChange={(e) => setSpiel(e.target.value)}>{GAMES.filter((g) => g.ready).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>}
          {art === 'pruefung' && <label>Gürtel<select value={welt} onChange={(e) => setWelt(Number(e.target.value))}>{WORLDS.map((w) => <option key={w.n} value={w.n}>{w.belt.replace(/en$/, '')}</option>)}</select></label>}
          {art !== 'pruefung' && <label>Wie oft<input type="number" min={1} max={20} value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))} /></label>}
          <label>Bis (optional)<input type="date" value={faellig} onChange={(e) => setFaellig(e.target.value)} /></label>
          <button type="button" className="adm-btn primary" disabled={!klasse} onClick={() => void anlegen()}>Auftrag geben</button>
        </div>
        {meldung && <p className="adm-muted">{meldung}</p>}
      </section>

      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Aufträge der Klasse {klasse}</h2><span className="adm-muted">{liste.length} Aufträge · {kinder.length} Kinder</span></div>
        {!liste.length && <p className="adm-muted">Noch keine Aufträge.</p>}
        {liste.map((a) => {
          const n = a.ziel.anzahl ?? 1
          const fertig = kinder.filter((z) => (auftragStand(z.kid.id)[a.id] ?? 0) >= n)
          return (
            <div key={a.id} className="adm-auftrag">
              <div className="adm-auftrag-kopf">
                <strong>{a.titel}</strong>
                <span className="adm-muted">{a.faellig ? `bis ${new Date(a.faellig).toLocaleDateString('de-AT')} · ` : ''}{fertig.length} von {kinder.length} erledigt</span>
                <button type="button" className="adm-btn klein" onClick={() => void auftragLoeschen(a).then(neuLaden)}>Löschen</button>
              </div>
              <div className="adm-auftrag-kinder">{kinder.map((z) => {
                const k = Math.min(n, auftragStand(z.kid.id)[a.id] ?? 0)
                return <span key={z.kid.id} className={k >= n ? 'ok' : k ? 'teil' : ''}>{z.kid.name} {k >= n ? '✓' : `${k}/${n}`}</span>
              })}</div>
            </div>
          )
        })}
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><h2>Arbeitsblatt drucken</h2><span className="adm-muted">A4 mit Lösungsseite · im Druckfenster „Als PDF speichern“ wählen</span></div>
        <div className="adm-form-reihe">
          <label>Art<select value={bArt} onChange={(e) => setBArt(e.target.value as BlattArt)}>
            <option value="lektion">Rechenaufgaben einer Lektion</option><option value="abakus">Abakus ablesen</option><option value="kette">Anzan-Ketten</option>
          </select></label>
          {bArt !== 'kette' ? <>
            <label>Welt<select value={bWelt} onChange={(e) => { setBWelt(Number(e.target.value)); setBEinheit(1) }}>{WORLDS.map((w) => <option key={w.n} value={w.n}>{w.n} · {w.name}</option>)}</select></label>
            <label>Lektion<select value={bEinheit} onChange={(e) => setBEinheit(Number(e.target.value))}>{WORLDS[bWelt - 1].units.map((u, i) => <option key={u} value={i + 1}>{i + 1} · {u}</option>)}</select></label>
          </> : <>
            <label>Stellen<select value={bStellen} onChange={(e) => setBStellen(Number(e.target.value))}>{[1, 2, 3].map((s) => <option key={s}>{s}</option>)}</select></label>
            <label>Zahlen je Kette<input type="number" min={3} max={10} value={bLaenge} onChange={(e) => setBLaenge(Number(e.target.value))} /></label>
          </>}
          <label>Aufgaben<input type="number" min={6} max={40} value={bAnzahl} onChange={(e) => setBAnzahl(Number(e.target.value))} /></label>
          <button type="button" className="adm-btn primary" onClick={() => { if (!arbeitsblattDrucken({ art: bArt, welt: bWelt, einheit: bEinheit, anzahl: bAnzahl, stellen: bStellen, laenge: bLaenge })) setMeldung('Bitte Pop-ups für diese Seite erlauben.') }}>🖨️ Arbeitsblatt erstellen</button>
        </div>
      </section>
    </>
  )
}
