import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Admin: Anmeldungen zum Vor-Ort-Kurs (Voranmeldung, Schnupperstunde, Kursanmeldung) ansehen und abarbeiten.
type A = {
  id: string; art: 'voranmeldung' | 'schnupper' | 'anmeldung'; eltern_vorname: string; eltern_nachname: string; mail: string; telefon: string | null
  strasse: string | null; plz: string | null; ort: string | null; kind_vorname: string; kind_nachname: string | null; kind_geburt: string | null; kind_stufe: number | null
  wunschzeiten: string | null; nachricht: string | null; takt: 'monat' | 'jahr' | null; wo: 'vorort' | 'online' | null; betrag: number | null; status: string; notiz: string | null; erstellt: string
}
const SITE = 'https://brainfitkids.mentalmath.at'
const ART: Record<A['art'], string> = { voranmeldung: '💌 Voranmeldung', schnupper: '🧮 Schnupperstunde', anmeldung: '🎓 Anmeldung' }
const STATUS = ['neu', 'kontaktiert', 'bezahlt', 'aktiv', 'abgesagt']
const STUFEN = ['Kiga', '1. Kl.', '2. Kl.', '3. Kl.', '4. Kl.', '5. Kl.', '6. Kl.']
const datum = (d: string) => new Date(d).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function AdminVorOrt() {
  const [liste, setListe] = useState<A[]>([])
  const [filter, setFilter] = useState<'' | A['art']>('')
  const [offen, setOffen] = useState<string | null>(null)
  const [meldung, setMeldung] = useState('')
  const laden = async () => {
    const { data, error } = await supabase.from('vorort_anmeldungen').select('*').order('erstellt', { ascending: false })
    if (error) setMeldung('Tabelle fehlt? Bitte supabase/update-23-vorort.sql in Supabase ausführen.')
    setListe((data ?? []) as A[])
  }
  useEffect(() => { void laden() }, [])
  const aendern = async (a: A, d: Partial<A>) => { await supabase.from('vorort_anmeldungen').update(d).eq('id', a.id); void laden() }
  const kopieren = (t: string) => { void navigator.clipboard?.writeText(t); setMeldung('Link kopiert: ' + t) }
  const csv = () => {
    const kopf = ['Datum', 'Art', 'Status', 'Eltern', 'E-Mail', 'Telefon', 'Adresse', 'Kind', 'Geburtsdatum', 'Stufe', 'Zahlung', 'Wunschzeiten', 'Nachricht']
    const z = gezeigt.map((a) => [datum(a.erstellt), a.art, a.status, `${a.eltern_vorname} ${a.eltern_nachname}`, a.mail, a.telefon ?? '', a.strasse ? `${a.strasse}, ${a.plz} ${a.ort}` : '',
      `${a.kind_vorname} ${a.kind_nachname ?? ''}`.trim(), a.kind_geburt ?? '', a.kind_stufe !== null ? STUFEN[a.kind_stufe] : '', a.takt ? `${a.betrag ?? ''} € / ${a.takt === 'jahr' ? 'Jahr' : 'Monat'}` : a.betrag ? `${a.betrag} €` : '', a.wunschzeiten ?? '', a.nachricht ?? ''])
    const text = [kopf, ...z].map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv' }))
    const l = document.createElement('a'); l.href = url; l.download = 'vor-ort-anmeldungen.csv'; l.click()
  }
  const gezeigt = liste.filter((a) => !filter || a.art === filter)
  return (
    <>
      <section className="adm-card">
        <h2>📍 Vor-Ort-Kurs Linz</h2>
        <p className="adm-muted">Links für Eltern (zum Teilen per WhatsApp, E-Mail, Flyer):</p>
        <p>
          <button type="button" className="adm-link" onClick={() => kopieren(`${SITE}/vorort`)}>Alle drei Formulare</button>{' · '}
          <button type="button" className="adm-link" onClick={() => kopieren(`${SITE}/vorort?art=voranmeldung`)}>Voranmeldung</button>{' · '}
          <button type="button" className="adm-link" onClick={() => kopieren(`${SITE}/vorort?art=schnupper`)}>Schnupperstunde</button>{' · '}
          <button type="button" className="adm-link" onClick={() => kopieren(`${SITE}/vorort?art=anmeldung`)}>Anmeldung</button>
        </p>
        <p className="adm-muted">Preise und Stripe-Zahlungslinks: Tab „Website“ → „Vor-Ort-Kurs“. Ob eine Zahlung eingegangen ist, sehen Sie in Stripe (Referenz beginnt mit „vorort-“).</p>
        {meldung && <p className="adm-muted">{meldung}</p>}
      </section>
      <section className="adm-card">
        <div className="adm-web-kopf">
          <h2>Anmeldungen ({gezeigt.length})</h2>
          <span>
            <select value={filter} onChange={(e) => setFilter(e.target.value as '' | A['art'])}>
              <option value="">Alle</option><option value="voranmeldung">Voranmeldungen</option><option value="schnupper">Schnupperstunden</option><option value="anmeldung">Anmeldungen</option>
            </select>{' '}
            <button type="button" className="adm-btn" onClick={csv} disabled={!gezeigt.length}>CSV</button>
          </span>
        </div>
        {!gezeigt.length ? <p className="adm-muted">Noch keine Anmeldungen.</p> : (
          <table className="adm-tabelle">
            <thead><tr><th>Datum</th><th>Art</th><th>Kind</th><th>Eltern</th><th>Zahlung</th><th>Status</th></tr></thead>
            <tbody>{gezeigt.map((a) => [
              <tr key={a.id}>
                <td><button type="button" className="adm-link" onClick={() => setOffen(offen === a.id ? null : a.id)}>{datum(a.erstellt)} {offen === a.id ? '▲' : '▼'}</button></td>
                <td>{ART[a.art]}{a.wo ? (a.wo === 'online' ? ' · 💻 online' : ' · 📍 vor Ort') : ''}</td>
                <td><b>{a.kind_vorname} {a.kind_nachname ?? ''}</b>{a.kind_stufe !== null ? ` · ${STUFEN[a.kind_stufe]}` : ''}</td>
                <td>{a.eltern_vorname} {a.eltern_nachname}<br /><a href={`mailto:${a.mail}`}>{a.mail}</a>{a.telefon ? <> · <a href={`tel:${a.telefon}`}>{a.telefon}</a></> : null}</td>
                <td>{a.takt ? `${a.betrag ?? '–'} € / ${a.takt === 'jahr' ? 'Jahr' : 'Monat'}` : a.betrag ? `${a.betrag} €` : '–'}</td>
                <td><select value={a.status} onChange={(e) => void aendern(a, { status: e.target.value })}>{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
              </tr>,
              offen === a.id && <tr key={a.id + '-d'}><td colSpan={6}>
                {a.strasse && <p>📮 {a.strasse}, {a.plz} {a.ort}</p>}
                {a.kind_geburt && <p>🎂 {new Date(a.kind_geburt).toLocaleDateString('de-AT')}</p>}
                {a.wunschzeiten && <p>🕒 {a.wunschzeiten}</p>}
                {a.nachricht && <p>💬 {a.nachricht}</p>}
                <label>Notiz<textarea rows={2} defaultValue={a.notiz ?? ''} onBlur={(e) => e.target.value !== (a.notiz ?? '') && void aendern(a, { notiz: e.target.value })} /></label>
              </td></tr>,
            ])}</tbody>
          </table>
        )}
      </section>
    </>
  )
}
