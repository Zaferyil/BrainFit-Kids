// Bilder der Kinder aus der Vorlage „Wer bist du?“ (scripts/kinder-bilder.py)
const FACES = import.meta.glob('../assets/kinder/*.webp', { eager: true, import: 'default' }) as Record<string, string>

/** Runder Kopf-Ausschnitt (Avatar) */
export const kidPhoto = (id: string): string | undefined => FACES[`../assets/kinder/${id}.webp`]
/** Karte für die Auswahl „Wer bist du?“ */
export const kidCard = (id: string): string | undefined => FACES[`../assets/kinder/${id}-karte.webp`]
