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
import pirat from '../assets/seza/pirat.webp'
import ritter from '../assets/seza/ritter.webp'
import feuerwehr from '../assets/seza/feuerwehr.webp'
import brille from '../assets/seza/a-brille.webp'
import hund from '../assets/seza/a-hund.webp'
import goldAbakus from '../assets/seza/a-abakus.webp'

// SeZa: die Figur des Kindes. Ein Kostüm ist ein ganzes, freigestelltes Bild von SeZa;
// Accessoires liegen als eigene Ebenen darüber. Ankerpunkte (Anteile von Breite/Höhe des Kostümbilds)
// sagen, wo Augen, die Hand mit dem Abakus und der Begleiter sitzen.

export type Slot = 'outfit' | 'brille' | 'hand' | 'begleiter'
export type Waehrung = 'sterne' | 'diamanten'

/** Ebenen von hinten nach vorn */
export const EBENEN: Slot[] = ['outfit', 'brille', 'hand', 'begleiter']

export const SLOT_NAME: Record<Slot, string> = { outfit: 'Kostüm', brille: 'Brille', hand: 'Abakus', begleiter: 'Begleiter' }

type Punkt = { x: number; y: number; b: number }
/** Anker eines Kostüms; ohne „augen“ hat das Kostüm schon Brille, Maske oder Augenklappe */
export type Anker = { augen?: Punkt; hand: Punkt & { r?: number }; begleiter: { x: number; y: number } }

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

const k = (id: string, name: string, preis: number, bild: string, anker: Anker, kopf: string, start = false): Artikel =>
  ({ id, name, slot: 'outfit', preis, waehrung: 'sterne', bild, anker, kopfAusschnitt: kopf, start })

const KOSTUEME: Artikel[] = [
  k('original', 'SeZa Original', 0, original, { augen: { x: .53, y: .4, b: .42 }, hand: { x: .83, y: .55, b: .3, r: 15 }, begleiter: { x: .14, y: .88 } }, '50% 22%', true),
  k('sportler', 'Sportler', 0, sportler, { augen: { x: .5, y: .38, b: .46 }, hand: { x: .76, y: .5, b: .3, r: 15 }, begleiter: { x: .14, y: .88 } }, '45% 22%', true),
  k('entdecker', 'Entdecker', 0, entdecker, { augen: { x: .65, y: .37, b: .44 }, hand: { x: .84, y: .38, b: .24, r: 15 }, begleiter: { x: .14, y: .88 } }, '62% 22%', true),
  k('astronaut', 'Astronaut', 450, astronaut, { augen: { x: .55, y: .32, b: .44 }, hand: { x: .93, y: .55, b: .2, r: 15 }, begleiter: { x: .12, y: .9 } }, '55% 14%'),
  k('superheld', 'Superheld', 400, superheld, { hand: { x: .82, y: .64, b: .28, r: 15 }, begleiter: { x: .14, y: .9 } }, '58% 22%'),
  k('zauberer', 'Zauberer', 400, zauberer, { augen: { x: .57, y: .45, b: .4 }, hand: { x: .84, y: .44, b: .25, r: 15 }, begleiter: { x: .14, y: .9 } }, '57% 35%'),
  k('wissenschaftler', 'Wissenschaftler', 350, wissenschaftler, { hand: { x: .17, y: .47, b: .25, r: -15 }, begleiter: { x: .88, y: .9 } }, '55% 16%'),
  k('winterheld', 'Winterheld', 350, winterheld, { augen: { x: .45, y: .43, b: .44 }, hand: { x: .17, y: .6, b: .28, r: -15 }, begleiter: { x: .88, y: .9 } }, '45% 32%'),
  k('genie', 'Genie', 450, genie, { hand: { x: .8, y: .52, b: .25, r: 15 }, begleiter: { x: .12, y: .9 } }, '50% 30%'),
  k('ninja', 'Ninja', 400, ninja, { augen: { x: .52, y: .32, b: .4 }, hand: { x: .84, y: .28, b: .25, r: 15 }, begleiter: { x: .14, y: .9 } }, '52% 18%'),
  k('pirat', 'Pirat', 400, pirat, { hand: { x: .75, y: .47, b: .25, r: 15 }, begleiter: { x: .12, y: .9 } }, '48% 30%'),
  k('ritter', 'Ritter', 450, ritter, { augen: { x: .48, y: .43, b: .4 }, hand: { x: .81, y: .47, b: .25, r: 15 }, begleiter: { x: .14, y: .9 } }, '48% 32%'),
  k('feuerwehr', 'Feuerwehr', 350, feuerwehr, { augen: { x: .53, y: .39, b: .42 }, hand: { x: .83, y: .44, b: .25, r: 15 }, begleiter: { x: .14, y: .9 } }, '53% 26%'),
]

const ACCESSOIRES: Artikel[] = [
  { id: 'gold-abakus', name: 'Goldener Abakus', slot: 'hand', preis: 500, waehrung: 'sterne', bild: goldAbakus },
  { id: 'brille', name: 'Brille', slot: 'brille', preis: 150, waehrung: 'sterne', bild: brille },
  { id: 'hund', name: 'Hunde-Begleiter', slot: 'begleiter', preis: 400, waehrung: 'sterne', bild: hund },
]

export const STANDARD_ARTIKEL: Artikel[] = [...KOSTUEME, ...ACCESSOIRES]
export const START_KOSTUEM = 'original'
export const START_KOSTUEME = KOSTUEME.filter((a) => a.start)

/** Passt ein Accessoire zum Kostüm? Brille nur, wenn die Augen frei sind */
export function passt(kostuem: Artikel | undefined, a: Artikel) {
  if (a.slot === 'brille') return !!kostuem?.anker?.augen
  return true
}

export const WARUM_NICHT: Partial<Record<Slot, string>> = {
  brille: 'Passt nicht zu diesem Kostüm – es hat schon eine Brille, Maske oder Augenklappe.',
}
