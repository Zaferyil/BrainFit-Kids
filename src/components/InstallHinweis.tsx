import { useEffect, useState } from 'react'
import { load, save } from '../lib/storage'

// Hinweis „Als App installieren“ für Handy und Tablet.
// Nicht zeigen, wenn die App schon installiert ist (läuft im App-Modus) oder der Hinweis geschlossen wurde.
// Android/Chrome: echter „Installieren“-Knopf über beforeinstallprompt. iPhone/iPad: Anleitung „Teilen → Zum Home-Bildschirm“.

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
const KEY = 'bfk.install-hinweis'

const istInstalliert = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const istMobil = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const istIos = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function InstallHinweis() {
  const [ereignis, setEreignis] = useState<InstallEvent | null>(null)
  const [zeigen, setZeigen] = useState(false)

  useEffect(() => {
    if (istInstalliert() || load(KEY, false)) return
    // Handy/Tablet: immer (mit Anleitung); Computer: nur wenn der Browser installieren kann (Chrome, Edge)
    const t = istMobil() ? window.setTimeout(() => setZeigen(true), 2500) : undefined
    const fang = (e: Event) => { e.preventDefault(); setEreignis(e as InstallEvent); if (!istMobil()) window.setTimeout(() => setZeigen(true), 2500) }
    const fertig = () => { save(KEY, true); setZeigen(false) }
    window.addEventListener('beforeinstallprompt', fang)
    window.addEventListener('appinstalled', fertig)
    return () => { window.clearTimeout(t); window.removeEventListener('beforeinstallprompt', fang); window.removeEventListener('appinstalled', fertig) }
  }, [])

  if (!zeigen) return null
  const schliessen = () => { save(KEY, true); setZeigen(false) }
  const installieren = async () => {
    if (!ereignis) return
    await ereignis.prompt()
    const { outcome } = await ereignis.userChoice
    if (outcome === 'accepted') schliessen()
  }

  return (
    <div className="install" role="dialog" aria-label="BrainFit Kids als App installieren">
      <div className="install-karte popin">
        <button type="button" className="install-zu" aria-label="Schließen" onClick={schliessen}>✕</button>
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" width={64} height={64} />
        <h2>BrainFit Kids als App</h2>
        <p>{istMobil() ? 'Installiere die App auf deinem Startbildschirm – dann geht’s mit einem Tipp los, ganz ohne Browser.' : 'Installiere die App auf deinem Computer – sie öffnet sich dann in einem eigenen Fenster.'}</p>
        {ereignis ? (
          <button type="button" className="nk-btn yellow" onClick={() => void installieren()}>Installieren</button>
        ) : istIos() ? (
          <ol className="install-schritte">
            <li>Unten (iPad: oben) auf <b>Teilen</b> <span aria-hidden="true">⬆️</span> tippen</li>
            <li><b>Zum Home-Bildschirm</b> wählen</li>
            <li>Oben rechts <b>Hinzufügen</b> tippen</li>
          </ol>
        ) : (
          <ol className="install-schritte">
            <li>Oben rechts auf <b>⋮</b> (Menü) tippen</li>
            <li><b>App installieren</b> oder <b>Zum Startbildschirm hinzufügen</b> wählen</li>
          </ol>
        )}
        <button type="button" className="install-spaeter" onClick={schliessen}>Nicht mehr anzeigen</button>
      </div>
    </div>
  )
}
