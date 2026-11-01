import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { STUFEN } from '../lib/check'

// Admin-Übersicht: Statistik zum Gratis Kopfrechen-Check (Anzahl je Schulstufe, E-Mail-Anfragen, Durchschnitt)
type Zeile = { stufe: number; anzahl: number; mit_mail: number; schnitt_gesamt: number }

export function AdminCheck() {
  const [z, setZ] = useState<Zeile[] | null>(null)
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
    </section>
  )
}
