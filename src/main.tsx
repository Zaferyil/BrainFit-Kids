import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles.css'

// Einmalig: Lenas Test-Fortschritt zurücksetzen (Weg, Karte, Tagesaufgaben); Klasse und Einstufung bleiben
try {
  if (!localStorage.getItem('bfk.reset.lena.1')) {
    for (const k of ['progress', 'mapstops', 'ansicht', 'levels', 'daily']) localStorage.removeItem(`bfk.${k}.lena`)
    localStorage.setItem('bfk.reset.lena.1', '1')
  }
} catch { /* Speicher nicht verfügbar */ }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
