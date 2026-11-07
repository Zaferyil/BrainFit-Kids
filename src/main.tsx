import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles.css'
import { pushStart } from './lib/push'

pushStart()

// Link von der Website: #lernen-KLASSENCODE öffnet direkt „Wähle deine Figur“
{
  const m = window.location.hash.match(/^#lernen-([A-Za-z0-9-]+)$/)
  if (m) {
    try { localStorage.setItem('bfk.classCode', JSON.stringify(m[1].toUpperCase())) } catch { /* egal */ }
    window.location.hash = '#/anmelden'
  }
}

// Einmalig: Lenas Test-Fortschritt zurücksetzen (Weg, Karte, Tagesaufgaben); Klasse und Einstufung bleiben
try {
  if (!localStorage.getItem('bfk.reset.lena.1')) {
    for (const k of ['progress', 'mapstops', 'ansicht', 'levels', 'daily']) localStorage.removeItem(`bfk.${k}.lena`)
    localStorage.setItem('bfk.reset.lena.1', '1')
  }
} catch { /* Speicher nicht verfügbar */ }

// Neue App-Version: der Service Worker übernimmt sofort (autoUpdate), die Seite läuft aber noch mit dem alten Code.
// Dann einmal neu laden, damit beim ersten Öffnen nicht die alte Version zu sehen ist (z. B. alle Welten auf der Karte).
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let neu = false
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!neu) { neu = true; window.location.reload() } })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
