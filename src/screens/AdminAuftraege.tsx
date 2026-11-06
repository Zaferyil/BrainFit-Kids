import { useEffect, useMemo, useState } from 'react'
import { WORLDS } from '../data/curriculum'
import { GAMES } from '../games/registry'
import type { KidZeile } from '../lib/admin'
import { auftragAnlegen, auftraegeLaden, auftragLoeschen, auftragStand, dateiHochladen, fuerKind, type Auftrag, type AuftragArt } from '../lib/auftraege'
import { arbeitsblattDrucken, type BlattArt } from '../lib/arbeitsblatt'
import { istCloudKind } from '../lib/serverRpc'
import { supabase } from '../lib/supabase'

// Lehrkraft: Aufträge an eine Klasse geben und sehen, wer sie erledigt hat. Dazu druckbare Arbeitsblätter.

/** Klassen aus der Datenbank: Admin alle, Lehrkraft nur die eigenen (null = noch nicht geladen) */
export function useKlassenDB(rolle: 'admin' | 'lehrkraft') {
  const [k, setK] = useState<string[] | null>(null)
  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      let q = supabase.from('klassen').select('code')
      if (rolle === 'lehrkraft') q = q.eq('lehrkraft', user?.id ?? '')
      const { data } = await q
      setK((data ?? []).map((x: { code: string }) => x.code))
    })().catch(() => setK([]))
  }, [rolle])
  return k
}

export function AdminAuftraege({ zeilen, rolle = 'admin' }: { zeilen: KidZeile[]; rolle?: 'admin' | 'lehrkraft' }) {
  const db = useKlassenDB(rolle)
  const klassen = useMemo(() => {
    const ausKindern = zeilen.map((z) => z.klassenCode)
    return [...new Set(rolle === 'admin' ? [...ausKindern, ...(db ?? [])] : db ?? [])].sort()
  }, [zeilen, db, rolle])
  const [klasse, setKlasse] = useState('')
  useEffect(() => { if (!klassen.includes(klasse)) setKlasse(klassen[0] ?? '') }, [klassen, klasse])
  const [art, setArt] = useState<AuftragArt>('anzan')
  const [anzahl, setAnzahl] = useState(3)
  const [level, setLevel] = useState(1)
  const [spiel, setSpiel] = useState(GAMES.find((g) => g.ready)?.id ?? '')
  const [welt, setWelt] = useState(1)
  const [faellig, setFaellig] = useState('')
  const [liste, setListe] = useState<Auftrag[]>([])
  const [meldung, setMeldung] = useState('')
  const [auswahl, setAuswahl] = useState<string[]>([]) // leer = ganze Klasse
  const [quelle, setQuelle] = useState<'lektion' | 'datei'>('lektion')
  const [datei, setDatei] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  useEffect(() => setAuswahl([]), [klasse])
  const kinder = zeilen.filter((z) => z.klassenCode === klasse)
  const cloud = kinder.some((z) => istCloudKind(z.kid.id))
  const neuLaden = () => { if (klasse) void auftraegeLaden(klasse).then(setListe) }
  useEffect(neuLaden, [klasse])

  const anlegen = async () => {
    setMeldung('')
    if (art === 'blatt') {
      if (quelle === 'datei' && !datei) { setMeldung('Bitte zuerst eine Datei wählen.'); return }
      setLaeuft(true)
      try {
        const z = quelle === 'datei'
          ? { anzahl: 1, text: text || datei!.name, datei: await dateiHochladen(datei!, cloud) }
          : { anzahl: 1, text: text || `Arbeitsblatt: ${WORLDS[bWelt - 1].units[bEinheit - 1]}`, blatt: { art: bArt, welt: bWelt, einheit: bEinheit, anzahl: bAnzahl, stellen: bStellen, laenge: bLaenge } }
        await auftragAnlegen({ klasse, art, ziel: auswahl.length ? { ...z, kinder: auswahl } : z, faellig: faellig || null }, cloud)
        setMeldung('✓ Hausaufgabe gespeichert'); setDatei(null); setText(''); neuLaden()
      } catch (e) { setMeldung(`Fehler: ${(e as Error).message}`) }
      setLaeuft(false); return
    }
    const basis = art === 'anzan' ? { anzahl, level } : art === 'spiel' ? { anzahl, spiel } : art === 'pruefung' ? { welt, anzahl: 1 } : { anzahl }
    const ziel = auswahl.length ? { ...basis, kinder: auswahl } : basis
    try { await auftragAnlegen({ klasse, art, ziel, faellig: faellig || null }, cloud); setMeldung('✓ Hausaufgabe gespeichert'); neuLaden() }
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
        <div className="adm-card-head"><h2>Neue Hausaufgabe</h2><span className="adm-muted">Wird automatisch abgehakt, sobald das Kind es gespielt hat.</span></div>
        <div className="adm-form-reihe">
          <label>Klasse<select value={klasse} onChange={(e) => setKlasse(e.target.value)}>{klassen.map((k) => <option key={k}>{k}</option>)}</select></label>
          <label>Art<select value={art} onChange={(e) => setArt(e.target.value as AuftragArt)}>
            <option value="anzan">Anzan (Flash-Rechnen)</option><option value="spiel">Denkspiel</option><option value="wiederholen">Wiederholung</option><option value="pruefung">Gürtel-Prüfung</option><option value="blatt">📄 Arbeitsblatt / eigene Datei</option>
          </select></label>
          {art === 'anzan' && <label>ab Level<input type="number" min={1} max={96} value={level} onChange={(e) => setLevel(Number(e.target.value))} /></label>}
          {art === 'spiel' && <label>Spiel<select value={spiel} onChange={(e) => setSpiel(e.target.value)}>{GAMES.filter((g) => g.ready).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>}
          {art === 'pruefung' && <label>Gürtel<select value={welt} onChange={(e) => setWelt(Number(e.target.value))}>{WORLDS.map((w) => <option key={w.n} value={w.n}>{w.belt.replace(/en$/, '')}</option>)}</select></label>}
          {art === 'blatt' && <label>Woher<select value={quelle} onChange={(e) => setQuelle(e.target.value as 'lektion' | 'datei')}><option value="lektion">Aus einer Lektion</option><option value="datei">Eigene Datei (PDF, JPG, PNG)</option></select></label>}
          {art === 'blatt' && <label>Titel (optional)<input value={text} onChange={(e) => setText(e.target.value)} placeholder="z. B. Übungsblatt Woche 3" /></label>}
          {art === 'blatt' && quelle === 'datei' && <label>Datei<input type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => setDatei(e.target.files?.[0] ?? null)} /></label>}
          {art !== 'pruefung' && art !== 'blatt' && <label>Wie oft<input type="number" min={1} max={20} value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))} /></label>}
          <label>Bis (optional)<input type="date" value={faellig} onChange={(e) => setFaellig(e.target.value)} /></label>
          <button type="button" className="adm-btn primary" disabled={!klasse || laeuft} onClick={() => void anlegen()}>{laeuft ? 'Wird gespeichert …' : 'Hausaufgabe geben'}</button>
        </div>
        {art === 'blatt' && quelle === 'lektion' && <p className="adm-muted">Welches Blatt? Unten bei „Arbeitsblatt drucken“ Art, Welt, Lektion und Anzahl wählen – genau dieses Blatt bekommt das Kind (ohne Lösungsseite).</p>}
        {kinder.length > 0 && (
          <div className="adm-fuer">
            <span>Für:</span>
            <label className={!auswahl.length ? 'an' : ''}><input type="checkbox" checked={!auswahl.length} onChange={() => setAuswahl([])} /> Ganze Klasse</label>
            {kinder.map((z) => (
              <label key={z.kid.id} className={auswahl.includes(z.kid.id) ? 'an' : ''}>
                <input type="checkbox" checked={auswahl.includes(z.kid.id)} onChange={(e) => setAuswahl(e.target.checked ? [...auswahl, z.kid.id] : auswahl.filter((x) => x !== z.kid.id))} /> {z.kid.name}
              </label>
            ))}
          </div>
        )}
        {rolle === 'lehrkraft' && db?.length === 0 && <p className="adm-muted">Dir ist noch keine Klasse zugeteilt. Bitte beim Admin melden.</p>}
        {meldung && <p className="adm-muted">{meldung}</p>}
      </section>

      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Hausaufgaben der Klasse {klasse}</h2><span className="adm-muted">{liste.length} Hausaufgaben · {kinder.length} Kinder</span></div>
        {!liste.length && <p className="adm-muted">Noch keine Hausaufgaben.</p>}
        {liste.map((a) => {
          const n = a.ziel.anzahl ?? 1
          const fuer = kinder.filter((z) => fuerKind(a, z.kid.id))
          const fertig = fuer.filter((z) => (auftragStand(z.kid.id)[a.id] ?? 0) >= n)
          return (
            <div key={a.id} className="adm-auftrag">
              <div className="adm-auftrag-kopf">
                <strong>{a.titel}</strong>
                <span className="adm-muted">{a.faellig ? `bis ${new Date(a.faellig).toLocaleDateString('de-AT')} · ` : ''}{a.ziel.kinder?.length ? `nur für ${fuer.map((z) => z.kid.name).join(', ')} · ` : 'ganze Klasse · '}{fertig.length} von {fuer.length} erledigt</span>
                <button type="button" className="adm-btn klein" onClick={() => void auftragLoeschen(a).then(neuLaden)}>Löschen</button>
              </div>
              <div className="adm-auftrag-kinder">{fuer.map((z) => {
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
