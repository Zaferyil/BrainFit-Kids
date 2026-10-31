// Testmodus: alle Lektionen, Stationen und Denkspiele auf der Karte sind offen.
// Umschalten im Admin-Bereich (Einstellungen); ohne Einstellung ist er aus (Kinder lernen der Reihe nach).
export const TESTMODUS_KEY = 'bfk.testmodus'

export const ALLES_OFFEN = (() => {
  try {
    const v = localStorage.getItem(TESTMODUS_KEY)
    return v === '1'
  } catch {
    return false
  }
})()

export function setTestmodus(an: boolean) {
  try { localStorage.setItem(TESTMODUS_KEY, an ? '1' : '0') } catch { /* Speicher nicht verfügbar */ }
}
