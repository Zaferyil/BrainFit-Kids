import { useState, type FormEvent } from 'react'
import { Icon } from '../components/Icon'
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
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) return setMeldung('Das hat nicht geklappt. Bitte fordern Sie einen neuen Link an.')
    setOk(true)
  }
  return (
    <div className="adm adm-login">
      <form className="adm-card adm-login-card" onSubmit={(e) => void speichern(e)}>
        <div className="adm-logo"><Icon name="lock" size={30} color="#5B47D6" /></div>
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
