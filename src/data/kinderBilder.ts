// Bilder der Kinder aus der Vorlage „Wer bist du?“ (scripts/kinder-bilder.py)
const FACES = import.meta.glob('../assets/kinder/*.webp', { eager: true, import: 'default' }) as Record<string, string>

/** Runder Kopf-Ausschnitt (Avatar) */
export const kidPhoto = (id: string): string | undefined => FACES[`../assets/kinder/${id}.webp`]
/** Karte für die Auswahl „Wer bist du?“ */
export const kidCard = (id: string): string | undefined => FACES[`../assets/kinder/${id}-karte.webp`]

/** Figuren zur Auswahl beim ersten Login */
export const FIGUREN = ['lena', 'jonas', 'elif', 'noah', 'mia', 'ben', 'emma', 'can']
const figurKey = (kidId: string) => `bfk.figur.${kidId}`
/** Gewählte Figur eines Kindes (Beispielkinder haben ihre eigene) */
export function figurVon(kidId: string): string | null {
  try { const f = localStorage.getItem(figurKey(kidId)); if (f) return JSON.parse(f) as string } catch { /* egal */ }
  return FIGUREN.includes(kidId) ? kidId : null
}
export function setFigur(kidId: string, figur: string) {
  try { localStorage.setItem(figurKey(kidId), JSON.stringify(figur)) } catch { /* egal */ }
}
