import { useState, type InputHTMLAttributes } from 'react'

/** Passwort-Eingabe mit Auge: antippen zeigt bzw. versteckt das Passwort */
export function PasswortFeld(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [sehen, setSehen] = useState(false)
  return (
    <span className="pw-feld">
      <input {...props} type={sehen ? 'text' : 'password'} />
      <button type="button" className="pw-auge" onClick={() => setSehen(!sehen)} aria-label={sehen ? 'Passwort verstecken' : 'Passwort anzeigen'} aria-pressed={sehen} tabIndex={-1}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
          {sehen && <line x1="3" y1="3" x2="21" y2="21" />}
        </svg>
      </button>
    </span>
  )
}
