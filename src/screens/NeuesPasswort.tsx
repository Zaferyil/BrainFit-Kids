import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

// Link aus der E-Mail „Passwort zurücksetzen“: Supabase meldet die Person an, hier setzt sie ein neues Passwort.
export function NeuesPasswort({ onFertig }: { onFertig: () => void }) {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [meldung, setMeldung] = useState('')
  const [ok, setOk] = useState(false)
  const speichern = async (e: FormEvent) => {
    e.preventDefault()
    if (pw.length < 8) return setMeldung('Bitte mindestens 8 Zeichen.')
    if (pw !== pw2) return setMeldung('Die beiden Passwörter sind nicht gleich.')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return setMeldung('Der Link ist abgelaufen oder wurde schon benutzt. Bitte fordern Sie einen neuen Link an.')
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) {
      const t = /different from the old/i.test(error.message) ? 'Das neue Passwort muss anders sein als das alte.'
        : /weak|characters/i.test(error.message) ? 'Das Passwort ist zu schwach. Bitte länger oder mit Zahlen.'
        : `Das hat nicht geklappt (${error.message}). Bitte fordern Sie einen neuen Link an.`
      return setMeldung(t)
    }
    setOk(true)
  }
  return (
    <div className="adm adm-login">
      <form className="adm-card adm-login-card" onSubmit={(e) => void speichern(e)}>
        <img className="app-logo" src={`${import.meta.env.BASE_URL}logo.webp`} alt="BrainFit Kids" />
        <h1>Neues Passwort</h1>
        {ok ? (
          <>
            <p>Ihr Passwort ist geändert.</p>
            <button type="button" className="adm-btn primary" onClick={onFertig}>Zum Eltern-Bereich</button>
          </>
        ) : (
          <>
            <p>Bitte wählen Sie ein neues Passwort (mindestens 8 Zeichen).</p>
            <input type="password" autoFocus value={pw} onChange={(e) => { setPw(e.target.value); setMeldung('') }} placeholder="Neues Passwort" aria-label="Neues Passwort" autoComplete="new-password" />
            <input type="password" value={pw2} onChange={(e) => { setPw2(e.target.value); setMeldung('') }} placeholder="Nochmal eingeben" aria-label="Passwort wiederholen" autoComplete="new-password" />
            {meldung && <div className="adm-fehler">{meldung}</div>}
            <button type="submit" className="adm-btn primary">Speichern</button>
          </>
        )}
      </form>
    </div>
  )
}
