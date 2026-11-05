import { useEffect, useState } from 'react'

/** Kleiner Hinweis, wenn das Internet weg ist – Üben geht trotzdem weiter. */
export function OfflineHinweis() {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine)
  useEffect(() => {
    const an = () => setOffline(false), aus = () => setOffline(true)
    window.addEventListener('online', an); window.addEventListener('offline', aus)
    return () => { window.removeEventListener('online', an); window.removeEventListener('offline', aus) }
  }, [])
  if (!offline) return null
  return <div className="offline-hinweis" role="status">📴 Offline – du kannst weiter üben. Dein Fortschritt wird gespeichert, sobald du wieder Internet hast.</div>
}
