import { load, save } from './storage'
import { klasseVon } from './klasse'

// Lernzeit: zählt, wie lange das Kind heute aktiv lernt (nur wenn die App sichtbar ist).
// Daraus: Pausen-Vorschlag nach einer Weile am Stück und ein Tageslimit, das die Eltern einstellen.

type Zeit = { tag: string; sek: number; amStueck: number; pauseBis?: number; extraMin?: number }
const key = (kid: string) => `bfk.lernzeit.${kid}`
const heute = () => new Date().toISOString().slice(0, 10)

export function lernzeit(kid: string): Zeit {
  const z = load<Zeit>(key(kid), { tag: heute(), sek: 0, amStueck: 0 })
  return z.tag === heute() ? z : { tag: heute(), sek: 0, amStueck: 0 }
}
export function zaehle(kid: string, sek: number) {
  const z = lernzeit(kid); z.sek += sek; z.amStueck += sek; save(key(kid), z); return z
}
/** nach einer Pause wieder bei 0 anfangen */
export function pauseGemacht(kid: string) { const z = lernzeit(kid); z.amStueck = 0; save(key(kid), z) }
/** Eltern geben heute noch etwas Zeit dazu */
export function mehrZeit(kid: string, min: number) { const z = lernzeit(kid); z.extraMin = (z.extraMin ?? 0) + min; save(key(kid), z) }

/** Pause nach so vielen Minuten am Stück: Kiga/1. Klasse 10, sonst 15 */
export const pauseNachMin = (kid: string) => (['Kiga', '1. Klasse'].includes(klasseVon(kid).name) ? 10 : 15)
