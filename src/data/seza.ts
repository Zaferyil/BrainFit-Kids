import original from '../assets/seza/original.webp'
import sportler from '../assets/seza/sportler.webp'
import entdecker from '../assets/seza/entdecker.webp'
import astronaut from '../assets/seza/astronaut.webp'
import superheld from '../assets/seza/superheld.webp'
import zauberer from '../assets/seza/zauberer.webp'
import wissenschaftler from '../assets/seza/wissenschaftler.webp'
import winterheld from '../assets/seza/winterheld.webp'
import genie from '../assets/seza/genie.webp'
import ninja from '../assets/seza/ninja.webp'
import ritter from '../assets/seza/ritter.webp'
import feuerwehr from '../assets/seza/feuerwehr.webp'
import ANKER from './seza-anker.json'
import brille from '../assets/seza/a-brille.webp'
import hund from '../assets/seza/a-hund.webp'
import goldAbakus from '../assets/seza/a-abakus.webp'
import umhang from '../assets/seza/a-umhang.webp'
import krone from '../assets/seza/a-krone.webp'
import zauberstab from '../assets/seza/a-zauberstab.webp'
import raketenrucksack from '../assets/seza/a-raketenrucksack.webp'

// SeZa: die Figur des Kindes. Jedes Kostüm wird aus SeZas Kopf und dem Kostüm (ohne Figur) zusammengesetzt
// (scripts/seza-kostueme.py) – ein neues Kostüm ersetzt das alte also vollständig. Accessoires liegen als eigene
// Ebenen darüber; die Ankerpunkte (Anteile von Breite/Höhe des Kostümbilds) berechnet das Skript.

export type Slot = 'outfit' | 'ruecken' | 'kopf' | 'brille' | 'hand' | 'stab' | 'begleiter'
export type Waehrung = 'sterne' | 'diamanten'

/** Ebenen von hinten nach vorn */
export const EBENEN: Slot[] = ['ruecken', 'outfit', 'kopf', 'brille', 'hand', 'stab', 'begleiter']

export const SLOT_NAME: Record<Slot, string> = { outfit: 'Kostüm', ruecken: 'Rücken', kopf: 'Kopf', brille: 'Brille', hand: 'Abakus', stab: 'Zauberstab', begleiter: 'Begleiter' }

type Punkt = { x: number; y: number; b: number }
/** Anker eines Kostüms; ohne „augen“ hat das Kostüm schon Brille, Maske oder Augenklappe */
export type Anker = { augen?: Punkt; hand: Punkt & { r?: number }; begleiter: { x: number; y: number }; kopf?: { x: number; y: number }; kopfFrei?: boolean }

export type Artikel = {
  id: string
  name: string
  slot: Slot
  preis: number
  waehrung: Waehrung
  bild?: string
  anker?: Anker
  /** Bildausschnitt fürs runde Kopfbild (CSS background-position) */
  kopfAusschnitt?: string
  /** Start-Kostüm: beim ersten Login wählbar, gratis */
  start?: boolean
  css?: string
  aktiv?: boolean
  /** von der Lehrkraft angelegt */
  eigen?: boolean
}

type AnkerDatei = Record<string, Anker & { ausschnitt: string }>
const A = ANKER as AnkerDatei
const k = (id: string, name: string, preis: number, bild: string, start = false): Artikel =>
  ({ id, name, slot: 'outfit', preis, waehrung: 'sterne', bild, anker: A[id], kopfAusschnitt: A[id].ausschnitt, start })

const KOSTUEME: Artikel[] = [
  k('original', 'SeZa Original', 0, original, true),
  k('sportler', 'Sportler', 0, sportler, true),
  k('entdecker', 'Entdecker', 0, entdecker, true),
  k('astronaut', 'Astronaut', 450, astronaut),
  k('superheld', 'Superheld', 400, superheld),
  k('zauberer', 'Zauberer', 400, zauberer),
  k('wissenschaftler', 'Doktor', 350, wissenschaftler),
  k('winterheld', 'Winterheld', 350, winterheld),
  k('genie', 'Genie', 450, genie),
  k('ninja', 'Ninja', 400, ninja),
  k('ritter', 'Ritter', 450, ritter),
  k('feuerwehr', 'Feuerwehr', 350, feuerwehr),
]

const ACCESSOIRES: Artikel[] = [
  { id: 'gold-abakus', name: 'Goldener Abakus', slot: 'hand', preis: 500, waehrung: 'sterne', bild: goldAbakus },
  { id: 'brille', name: 'Brille', slot: 'brille', preis: 150, waehrung: 'sterne', bild: brille },
  { id: 'krone', name: 'Krone', slot: 'kopf', preis: 300, waehrung: 'sterne', bild: krone },
  { id: 'umhang', name: 'Umhang', slot: 'ruecken', preis: 200, waehrung: 'sterne', bild: umhang },
  { id: 'raketenrucksack', name: 'Raketen-Rucksack', slot: 'ruecken', preis: 350, waehrung: 'sterne', bild: raketenrucksack },
  { id: 'zauberstab', name: 'Zauberstab', slot: 'stab', preis: 250, waehrung: 'sterne', bild: zauberstab },
  { id: 'hund', name: 'Hunde-Begleiter', slot: 'begleiter', preis: 400, waehrung: 'sterne', bild: hund },
]

export const STANDARD_ARTIKEL: Artikel[] = [...KOSTUEME, ...ACCESSOIRES]
export const START_KOSTUEM = 'original'
export const START_KOSTUEME = KOSTUEME.filter((a) => a.start)

/** Passt ein Accessoire zum Kostüm? Brille nur, wenn die Augen frei sind */
export function passt(kostuem: Artikel | undefined, a: Artikel) {
  if (a.slot === 'brille') return !!kostuem?.anker?.augen
  if (a.slot === 'kopf') return !!kostuem?.anker?.kopfFrei
  return true
}

export const WARUM_NICHT: Partial<Record<Slot, string>> = {
  brille: 'Passt nicht zu diesem Kostüm – es hat schon eine Brille, Maske oder Augenklappe.',
  kopf: 'Passt nicht zu diesem Kostüm – es hat schon einen Hut oder Helm.',
}
