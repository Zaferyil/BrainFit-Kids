import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STUFEN } from '../lib/check'

// Admin-Übersicht: Statistik zum Gratis Kopfrechen-Check (Anzahl je Schulstufe, E-Mail-Anfragen, Durchschnitt)
type Zeile = { stufe: number; anzahl: number; mit_mail: number; schnitt_gesamt: number }
type Test = { id: string; erstellt: string; alter_jahre: number; stufe: number; variante: string; abakus_bekannt: boolean; gesamt: number; rechnen: number; abakus: number; blitz: number; merken: number; konzentration: number; dauer_sek: number | null; mail: string | null; newsletter: boolean; bericht_gesendet: string | null }
const VARIANTE: Record<string, string> = { A: 'Vorschule', B: 'kennt Zahlen', C: 'Schulkind' }
const datum = (d: string) => new Date(d).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function AdminCheck() {
  const [z, setZ] = useState<Zeile[] | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [nurMail, setNurMail] = useState(false)
  const [offen, setOffen] = useState(false)
  useEffect(() => { void supabase.from('check_ergebnisse').select('*').order('erstellt', { ascending: false }).limit(300).then(({ data }) => setTests((data ?? []) as Test[])) }, [])
  const liste = nurMail ? tests.filter((t) => t.mail) : tests
  useEffect(() => { void supabase.rpc('check_statistik').then(({ data }) => setZ(((data ?? []) as Zeile[]).map((x) => ({ ...x, anzahl: Number(x.anzahl), mit_mail: Number(x.mit_mail) })))) }, [])
  if (!z) return null
  const summe = z.reduce((a, x) => a + x.anzahl, 0), mails = z.reduce((a, x) => a + x.mit_mail, 0)
  return (
    <section className="adm-card adm-tabelle-wrap">
      <div className="adm-card-head"><h2>🎯 Gratis Kopfrechen-Check</h2><a className="adm-btn" href="/check" target="_blank" rel="noopener">Check öffnen</a></div>
      <div className="push-stat"><span><b>{summe}</b> Tests</span><span><b>{mails}</b> Berichte angefordert{summe ? ` (${Math.round((mails / summe) * 100)} %)` : ''}</span></div>
      {z.length ? (
        <table className="adm-tabelle"><thead><tr><th>Schulstufe</th><th>Tests</th><th>Mit E-Mail</th><th>Ø Gesamt</th></tr></thead>
          <tbody>{z.map((x) => <tr key={x.stufe}><td>{STUFEN[x.stufe]}</td><td>{x.anzahl}</td><td>{x.mit_mail}</td><td>{x.schnitt_gesamt}</td></tr>)}</tbody></table>
      ) : <p className="adm-muted">Noch keine Tests. Ab 30 Tests je Schulstufe vergleicht der Check mit echten Ergebnissen statt mit Richtwerten.</p>}
      {tests.length > 0 && <>
        <div className="adm-card-head" style={{ marginTop: 16 }}>
          <h2>Alle Tests</h2>
          <label className="adm-filter"><input type="checkbox" checked={nurMail} onChange={(e) => setNurMail(e.target.checked)} /> nur mit E-Mail</label>
          <button type="button" className="adm-btn klein" onClick={() => setOffen(!offen)}>{offen ? 'Zuklappen' : `Anzeigen (${liste.length})`}</button>
        </div>
        {offen && (
          <table className="adm-tabelle">
            <thead><tr><th>Datum</th><th>Alter</th><th>Schulstufe</th><th>Test</th><th>Gesamt</th><th>Rechnen · Abakus · Blitz · Merken · Konz.</th><th>Dauer</th><th>E-Mail</th><th>Newsletter</th></tr></thead>
            <tbody>{liste.map((t) => (
              <tr key={t.id}>
                <td>{datum(t.erstellt)}</td><td>{t.alter_jahre} J.</td><td>{STUFEN[t.stufe]}</td>
                <td>{VARIANTE[t.variante] ?? t.variante}{t.abakus_bekannt ? ' · kennt Abakus' : ''}</td>
                <td><b>{t.gesamt}</b></td><td>{t.rechnen} · {t.abakus} · {t.blitz} · {t.merken} · {t.konzentration}</td>
                <td>{t.dauer_sek ? `${Math.floor(t.dauer_sek / 60)}:${String(t.dauer_sek % 60).padStart(2, '0')}` : '–'}</td>
                <td>{t.mail ? <a href={`mailto:${t.mail}`}>{t.mail}</a> : <span className="adm-muted">–</span>}{t.bericht_gesendet ? <div className="adm-muted">Bericht {datum(t.bericht_gesendet)}</div> : null}</td>
                <td>{t.mail ? (t.newsletter ? 'ja' : 'nein') : ''}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </>}
    </section>
  )
}
