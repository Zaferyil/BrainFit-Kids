import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Admin: Lehrkräfte anlegen (E-Mail + Startpasswort) und ihnen Klassen zuteilen.
// Eine Lehrkraft sieht im Admin-Bereich nur die Kinder ihrer Klassen.

type Lehrkraft = { id: string; name: string; mail: string; klassen: string[] }
async function rufe<T>(body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke('lehrkraft', { body })
  if (error || data?.fehler) throw new Error(data?.fehler ?? error?.message ?? 'Fehler')
  return data as T
}
const codes = (t: string) => t.split(/[,\s]+/).map((x) => x.trim().toUpperCase()).filter(Boolean)

export function AdminLehrkraefte() {
  const [liste, setListe] = useState<Lehrkraft[] | null>(null)
  const [fehler, setFehler] = useState('')
  const [name, setName] = useState('')
  const [mail, setMail] = useState('')
  const [klassen, setKlassen] = useState('')
  const [neu, setNeu] = useState<{ mail: string; passwort: string } | null>(null)
  const [laeuft, setLaeuft] = useState(false)

  const laden = () => rufe<{ lehrkraefte: Lehrkraft[] }>({ aktion: 'liste' }).then((d) => { setListe(d.lehrkraefte); setFehler('') })
    .catch((e) => { setListe([]); setFehler(/Failed to send|not found|404/i.test(e.message) ? 'Die Funktion „lehrkraft“ ist in Supabase noch nicht eingerichtet (supabase/functions/lehrkraft).' : e.message) })
  useEffect(() => { void laden() }, [])

  const anlegen = async () => {
    setLaeuft(true); setFehler(''); setNeu(null)
    try { const d = await rufe<{ mail: string; passwort: string }>({ aktion: 'anlegen', name, mail, klassen: codes(klassen) }); setNeu(d); setName(''); setMail(''); setKlassen(''); await laden() }
    catch (e) { setFehler((e as Error).message) }
    setLaeuft(false)
  }
  const klassenAendern = async (l: Lehrkraft) => {
    const t = window.prompt(`Klassen für ${l.name} (mit Komma trennen):`, l.klassen.join(', '))
    if (t === null) return
    try { await rufe({ aktion: 'klassen', id: l.id, klassen: codes(t) }); await laden() } catch (e) { setFehler((e as Error).message) }
  }
  const passwortNeu = async (l: Lehrkraft) => {
    if (!window.confirm(`Neues Startpasswort für ${l.name}? Das alte gilt dann nicht mehr.`)) return
    try { const d = await rufe<{ passwort: string }>({ aktion: 'passwort-neu', id: l.id }); setNeu({ mail: l.mail, passwort: d.passwort }) } catch (e) { setFehler((e as Error).message) }
  }

  return (
    <>
      <section className="adm-card">
        <div className="adm-card-head"><h2>Neue Lehrkraft</h2><span className="adm-muted">Die Lehrkraft meldet sich unter …/app/#/admin mit E-Mail und Startpasswort an.</span></div>
        <div className="adm-form-reihe">
          <label>Name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Frau Huber" /></label>
          <label>E-Mail<input type="email" value={mail} onChange={(e) => setMail(e.target.value)} placeholder="huber@schule.at" /></label>
          <label>Klassen (optional)<input value={klassen} onChange={(e) => setKlassen(e.target.value)} placeholder="LINZ-3A, LINZ-3B" /></label>
          <button type="button" className="adm-btn primary" disabled={laeuft || !name || !mail} onClick={() => void anlegen()}>{laeuft ? 'Wird angelegt …' : 'Lehrkraft anlegen'}</button>
        </div>
        {neu && <p className="adm-zugang">✓ Zugang für <b>{neu.mail}</b> · Startpasswort: <b>{neu.passwort}</b> – bitte jetzt notieren und der Lehrkraft geben.</p>}
        {fehler && <p className="adm-fehler">{fehler}</p>}
      </section>
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Lehrkräfte</h2><span className="adm-muted">{liste?.length ?? 0} Konten</span></div>
        {liste === null ? <p className="adm-muted">Wird geladen …</p> : !liste.length ? <p className="adm-muted">Noch keine Lehrkräfte.</p> : (
          <table className="adm-tabelle">
            <thead><tr><th>Name</th><th>E-Mail</th><th>Klassen</th><th /></tr></thead>
            <tbody>{liste.map((l) => (
              <tr key={l.id}><td>{l.name}</td><td>{l.mail}</td><td>{l.klassen.join(', ') || '–'}</td>
                <td><button type="button" className="adm-btn klein" onClick={() => void klassenAendern(l)}>Klassen</button> <button type="button" className="adm-btn klein" onClick={() => void passwortNeu(l)}>Neues Passwort</button></td></tr>
            ))}</tbody>
          </table>
        )}
        <p className="adm-muted">Neue Klassen entstehen automatisch, wenn du sie hier einträgst. Kinder teilst du im Tab „Kinder“ einer Klasse zu.</p>
      </section>
    </>
  )
}
