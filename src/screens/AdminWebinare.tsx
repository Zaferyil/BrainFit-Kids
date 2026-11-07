import { Fragment, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

// Admin: Online-Webinare für Eltern anlegen (mit Zoom-Link) und Anmeldungen sehen.
type W = { id: string; titel: string; beschreibung: string | null; beginn: string; dauer_min: number; zoom_link: string; aktiv: boolean }
type A = { id: string; webinar: string; vorname: string; nachname: string; mail: string; telefon: string | null; ort: string | null; kind_alter: number | null; kind_klasse: string | null; mail_gesendet: string | null; erstellt: string }
const SITE = 'https://brainfitkids.mentalmath.at'
const datum = (d: string) => new Date(d).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const lokal = (d: string) => { const x = new Date(d); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
const leer = { titel: 'Kopfrechnen mit dem Abakus – Infoabend für Eltern', beschreibung: '', beginn: '', dauer_min: 60, zoom_link: '' }

export function AdminWebinare() {
  const [liste, setListe] = useState<W[]>([])
  const [anm, setAnm] = useState<A[]>([])
  const [form, setForm] = useState<typeof leer & { id?: string }>(leer)
  const [offen, setOffen] = useState<string | null>(null)
  const [meldung, setMeldung] = useState('')
  const laden = async () => {
    const [w, a] = await Promise.all([
      supabase.from('webinare').select('*').order('beginn', { ascending: false }),
      supabase.from('webinar_anmeldungen').select('*').order('erstellt', { ascending: false }),
    ])
    if (w.error) setMeldung('Tabelle fehlt? Bitte supabase/update-20-webinare.sql in Supabase ausführen.')
    setListe((w.data ?? []) as W[]); setAnm((a.data ?? []) as A[])
  }
  useEffect(() => { void laden() }, [])
  const speichern = async (e: FormEvent) => {
    e.preventDefault()
    const d = { titel: form.titel.trim(), beschreibung: form.beschreibung.trim() || null, beginn: new Date(form.beginn).toISOString(), dauer_min: Number(form.dauer_min) || 60, zoom_link: form.zoom_link.trim() }
    const { error } = form.id ? await supabase.from('webinare').update(d).eq('id', form.id) : await supabase.from('webinare').insert(d)
    setMeldung(error ? 'Fehler: ' + error.message : 'Gespeichert ✓'); if (!error) { setForm(leer); void laden() }
  }
  const aktiv = async (w: W) => { await supabase.from('webinare').update({ aktiv: !w.aktiv }).eq('id', w.id); void laden() }
  const loeschen = async (w: W) => { if (confirm(`„${w.titel}“ mit allen Anmeldungen löschen?`)) { await supabase.from('webinare').delete().eq('id', w.id); void laden() } }
  const link = (w: W) => `${SITE}/webinar?w=${w.id}`
  const kopieren = (t: string) => { void navigator.clipboard?.writeText(t); setMeldung('Link kopiert ✓') }
  const csv = (w: W) => {
    const z = anm.filter((a) => a.webinar === w.id)
    const zeilen = [['Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Angemeldet'], ...z.map((a) => [a.vorname, a.nachname, a.mail, a.telefon ?? '', datum(a.erstellt)])]
    const text = '﻿' + zeilen.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n')
    const u = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); const l = document.createElement('a'); l.href = u; l.download = `webinar-${w.beginn.slice(0, 10)}.csv`; l.click(); URL.revokeObjectURL(u)
  }
  return (
    <>
      <section className="adm-card">
        <div className="adm-card-head"><h2>{form.id ? 'Webinar bearbeiten' : '🎓 Neues Webinar'}</h2></div>
        <p className="adm-muted">Eltern melden sich über den Link an und bekommen sofort eine E-Mail mit dem Zoom-Link. Allgemeiner Link (zeigt alle kommenden Webinare): <a href={`${SITE}/webinar`} target="_blank" rel="noopener">{SITE}/webinar</a></p>
        <form className="adm-form" onSubmit={speichern} style={{ display: 'grid', gap: 10, maxWidth: 560 }}>
          <label>Titel<input required value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} /></label>
          <label>Beschreibung (optional)<textarea rows={3} value={form.beschreibung} onChange={(e) => setForm({ ...form, beschreibung: e.target.value })} /></label>
          <label>Datum und Uhrzeit<input required type="datetime-local" value={form.beginn} onChange={(e) => setForm({ ...form, beginn: e.target.value })} /></label>
          <label>Dauer (Minuten)<input type="number" min={15} max={240} value={form.dauer_min} onChange={(e) => setForm({ ...form, dauer_min: Number(e.target.value) })} /></label>
          <label>Zoom-Link<input required type="url" placeholder="https://zoom.us/j/…" value={form.zoom_link} onChange={(e) => setForm({ ...form, zoom_link: e.target.value })} /></label>
          <div style={{ display: 'flex', gap: 8 }}><button className="adm-btn" type="submit">Speichern</button>{form.id && <button type="button" className="adm-link" onClick={() => setForm(leer)}>Abbrechen</button>}</div>
        </form>
        {meldung && <p className="adm-muted"><b>{meldung}</b></p>}
      </section>
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Webinare</h2><span className="adm-muted">{anm.length} Anmeldungen</span></div>
        {!liste.length ? <p className="adm-muted">Noch kein Webinar angelegt.</p> : (
          <table className="adm-tabelle">
            <thead><tr><th>Termin</th><th>Titel</th><th>Anmeldungen</th><th>Status</th><th /></tr></thead>
            <tbody>{liste.map((w) => {
              const z = anm.filter((a) => a.webinar === w.id)
              return (
                <Fragment key={w.id}>
                  <tr>
                    <td>{datum(w.beginn)}</td>
                    <td><b>{w.titel}</b></td>
                    <td><button type="button" className="adm-link" onClick={() => setOffen(offen === w.id ? null : w.id)}>{z.length} {offen === w.id ? '▲' : '▼'}</button></td>
                    <td><button type="button" className="adm-link" onClick={() => aktiv(w)}>{w.aktiv ? '🟢 offen' : '⚪ geschlossen'}</button></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button type="button" className="adm-link" onClick={() => kopieren(link(w))}>Link kopieren</button>{' · '}
                      <button type="button" className="adm-link" onClick={() => setForm({ id: w.id, titel: w.titel, beschreibung: w.beschreibung ?? '', beginn: lokal(w.beginn), dauer_min: w.dauer_min, zoom_link: w.zoom_link })}>Bearbeiten</button>{' · '}
                      <button type="button" className="adm-link" onClick={() => csv(w)}>CSV</button>{' · '}
                      <button type="button" className="adm-link" onClick={() => loeschen(w)}>Löschen</button>
                    </td>
                  </tr>
                  {offen === w.id && <tr><td colSpan={5}>
                    {!z.length ? <p className="adm-muted">Noch keine Anmeldungen.</p> : (
                      <table className="adm-tabelle"><thead><tr><th>Name</th><th>E-Mail</th><th>Telefon</th><th>E-Mail gesendet</th><th>Angemeldet</th></tr></thead>
                        <tbody>{z.map((a) => <tr key={a.id}><td>{a.vorname} {a.nachname}</td><td><a href={`mailto:${a.mail}`}>{a.mail}</a></td><td>{a.telefon}</td><td>{a.mail_gesendet ? '✓' : '–'}</td><td>{datum(a.erstellt)}</td></tr>)}</tbody></table>
                    )}
                  </td></tr>}
                </Fragment>
              )
            })}</tbody>
          </table>
        )}
      </section>
    </>
  )
}
