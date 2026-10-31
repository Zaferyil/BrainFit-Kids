// Admin-Bereich „Bestellungen“: wer hat wann welches Paket gekauft, für welches Kind
import { useEffect, useMemo, useState } from 'react'
import { bestellungenLaden, type Bestellung } from '../lib/website'

const STUFE = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
const datum = (d: string | null) => (d ? new Date(d).toLocaleString('de-AT', { dateStyle: 'medium', timeStyle: 'short' }) : '–')
const euro = (n: number) => n.toLocaleString('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const paketName = (p: string) => p.charAt(0).toUpperCase() + p.slice(1)

export function AdminBestellungen() {
  const [liste, setListe] = useState<Bestellung[] | null>(null)
  const [fehler, setFehler] = useState('')
  const [tests, setTests] = useState(false)

  useEffect(() => { bestellungenLaden().then(setListe).catch((e) => setFehler(String((e as Error).message))) }, [])

  const sichtbar = useMemo(() => (liste ?? []).filter((b) => tests || !b.test), [liste, tests])
  const echt = (liste ?? []).filter((b) => !b.test)
  const monat = new Date(); monat.setDate(1); monat.setHours(0, 0, 0, 0)
  const imMonat = echt.filter((b) => new Date(b.datum) >= monat)
  // Jahresumsatz der laufenden Verträge: Monatsabo × 12 bzw. Jahresbetrag
  const vertragswert = echt.reduce((s, b) => s + (b.takt === 'jahr' ? b.betrag : b.betrag * 12), 0)

  const csv = () => {
    const kopf = ['Datum', 'Eltern', 'E-Mail', 'Paket', 'Zahlweise', 'Betrag', 'Kind', 'Benutzername', 'Schulstufe', 'Kind registriert', 'Status', 'Stripe-Session']
    const zeilen = sichtbar.map((b) => [datum(b.datum), b.elternName, b.mail, paketName(b.paket), b.takt === 'jahr' ? 'jährlich' : 'monatlich', b.betrag, b.kindVorname, b.kindBenutzer, b.kindStufe != null ? STUFE[b.kindStufe] : '', datum(b.kindSeit), b.status, b.session])
    const text = [kopf, ...zeilen].map((z) => z.map((f) => `"${String(f).replace(/"/g, '""')}"`).join(';')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }))
    a.download = `bestellungen-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  if (fehler) return <section className="adm-card"><h2>Bestellungen</h2><p>Konnte nicht geladen werden: {fehler}</p></section>
  if (!liste) return <section className="adm-card"><p className="adm-muted">Wird geladen …</p></section>

  return (
    <>
      <div className="adm-best-zahlen">
        <div className="adm-card"><small>Bestellungen gesamt</small><b>{echt.length}</b></div>
        <div className="adm-card"><small>Diesen Monat</small><b>{imMonat.length}</b></div>
        <div className="adm-card"><small>Vertragswert (12 Monate)</small><b>{euro(vertragswert)}</b></div>
        <div className="adm-card"><small>Pakete</small><b className="klein">{['basic', 'plus', 'premium'].map((p) => `${paketName(p)} ${echt.filter((b) => b.paket === p).length}`).join(' · ')}</b></div>
      </div>
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Bestellungen</h2>
          <label className="adm-beispiele"><input type="checkbox" checked={tests} onChange={(e) => setTests(e.target.checked)} /> Testkäufe zeigen</label>
          <button type="button" className="adm-btn" onClick={csv} disabled={!sichtbar.length}>CSV / Excel</button>
        </div>
        {!sichtbar.length ? <p className="adm-muted">Noch keine Bestellungen.</p> : (
          <table className="adm-tabelle">
            <thead><tr><th>Datum</th><th>Eltern</th><th>Paket</th><th>Betrag</th><th>Kind</th><th>Kind registriert</th><th>Status</th><th /></tr></thead>
            <tbody>
              {sichtbar.map((b) => (
                <tr key={b.session}>
                  <td>{datum(b.datum)}</td>
                  <td><b>{b.elternName || '–'}</b><br /><small><a href={`mailto:${b.mail}`}>{b.mail}</a></small></td>
                  <td><span className={`adm-badge paket-${b.paket}`}>{paketName(b.paket)}</span><br /><small>{b.takt === 'jahr' ? 'jährlich' : 'monatlich, 12 Monate'}</small></td>
                  <td><b>{euro(b.betrag)}</b><small>{b.takt === 'jahr' ? ' / Jahr' : ' / Monat'}</small></td>
                  <td><b>{b.kindVorname || '–'}</b><br /><small>{b.kindBenutzer}{b.kindStufe != null ? ` · ${STUFE[b.kindStufe]}` : ''}</small></td>
                  <td>{datum(b.kindSeit)}</td>
                  <td>{b.test ? <span className="adm-badge warn">Test</span> : <span className="adm-badge">{b.status}</span>}</td>
                  <td><a className="adm-btn" href={`https://dashboard.stripe.com/${b.test ? 'test/' : ''}search?query=${encodeURIComponent(b.session)}`} target="_blank" rel="noopener">Stripe</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="adm-muted">Beträge nach Preisliste (Einführungspreise). Lieferadresse, Rechnung und Rückerstattungen finden Sie über den Stripe-Knopf.</p>
      </section>
    </>
  )
}
