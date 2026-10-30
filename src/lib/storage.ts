// localStorage kann in privaten Fenstern fehlen oder werfen.
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** Wer bei jeder Änderung Bescheid bekommt (Abgleich mit der Datenbank) */
let beobachter: ((key: string) => void) | null = null
export const beimSpeichern = (f: (key: string) => void) => { beobachter = f }

export function save(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ohne Speicher geht es trotzdem weiter
  }
  beobachter?.(key)
}
