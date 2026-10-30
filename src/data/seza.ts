import original from '../assets/seza/original.webp'
import astronaut from '../assets/seza/astronaut.webp'
import superheld from '../assets/seza/superheld.webp'
import zauberer from '../assets/seza/zauberer.webp'
import sportler from '../assets/seza/sportler.webp'
import wissenschaftler from '../assets/seza/wissenschaftler.webp'
import entdecker from '../assets/seza/entdecker.webp'
import winterheld from '../assets/seza/winterheld.webp'
import genie from '../assets/seza/genie.webp'
import brille from '../assets/seza/a-brille.webp'
import rucksack from '../assets/seza/a-rucksack.webp'
import umhang from '../assets/seza/a-umhang.webp'
import krone from '../assets/seza/a-krone.webp'
import schuhe from '../assets/seza/a-schuhe.webp'
import roboter from '../assets/seza/a-roboter.webp'
import goldAbakus from '../assets/seza/a-abakus.webp'

// SeZa: die Figur des Kindes. Ein Kostüm ist ein ganzes Bild von SeZa (aus der SeZa-Vorlage geschnitten);
// Accessoires liegen als eigene Ebenen darüber. Ankerpunkte (Anteile von Breite/Höhe des Kostümbilds) sagen,
// wo Augen, Kopf, Hand, Rücken, Füße und der Begleiter sitzen.

export type Slot = 'outfit' | 'kopf' | 'brille' | 'hand' | 'ruecken' | 'fuesse' | 'begleiter' | 'effekt' | 'hintergrund'
export type Waehrung = 'sterne' | 'diamanten'

/** Ebenen von hinten nach vorn */
export const EBENEN: Slot[] = ['hintergrund', 'outfit', 'ruecken', 'fuesse', 'brille', 'kopf', 'hand', 'begleiter', 'effekt']

export const SLOT_NAME: Record<Slot, string> = {
  outfit: 'Kostüm', kopf: 'Kopf', brille: 'Brille', hand: 'In der Hand', ruecken: 'Rücken', fuesse: 'Füße', begleiter: 'Begleiter', effekt: 'Effekt', hintergrund: 'Hintergrund',
}

type Punkt = { x: number; y: number }
/** Anker eines Kostüms; fehlt ein Anker, passt das Accessoire nicht zu diesem Kostüm */
export type Anker = { augen?: Punkt & { b: number }; kopf?: Punkt & { b: number }; hand: Punkt & { b: number; r?: number }; ruecken: Punkt; fuesse: Punkt; begleiter: Punkt }

export type Artikel = {
  id: string
  name: string
  slot: Slot
  preis: number
  waehrung: Waehrung
  bild?: string
  /** Kostüm: Bild und Anker */
  anker?: Anker
  /** Effekte und Hintergründe werden mit CSS gezeichnet */
  css?: string
  aktiv?: boolean
  /** von der Lehrkraft angelegt */
  eigen?: boolean
}

const KOSTUEME: Artikel[] = [
  { id: 'original', name: 'SeZa Original', slot: 'outfit', preis: 0, waehrung: 'sterne', bild: original,
    anker: { augen: { x: .53, y: .41, b: .5 }, hand: { x: .9, y: .53, b: .3, r: 14 }, ruecken: { x: .14, y: .6 }, fuesse: { x: .5, y: .93 }, begleiter: { x: .86, y: .86 } } },
  { id: 'astronaut', name: 'Astronaut', slot: 'outfit', preis: 450, waehrung: 'sterne', bild: astronaut,
    anker: { augen: { x: .52, y: .57, b: .33 }, hand: { x: .87, y: .74, b: .26, r: 10 }, ruecken: { x: .16, y: .66 }, fuesse: { x: .5, y: .96 }, begleiter: { x: .14, y: .86 } } },
  { id: 'superheld', name: 'Superheld', slot: 'outfit', preis: 400, waehrung: 'sterne', bild: superheld,
    anker: { kopf: { x: .58, y: .02, b: .36 }, hand: { x: .9, y: .55, b: .25, r: 20 }, ruecken: { x: .14, y: .56 }, fuesse: { x: .5, y: .95 }, begleiter: { x: .14, y: .86 } } },
  { id: 'zauberer', name: 'Zauberer', slot: 'outfit', preis: 400, waehrung: 'sterne', bild: zauberer,
    anker: { augen: { x: .48, y: .62, b: .38 }, hand: { x: .82, y: .45, b: .24, r: 18 }, ruecken: { x: .14, y: .78 }, fuesse: { x: .5, y: .96 }, begleiter: { x: .86, y: .88 } } },
  { id: 'sportler', name: 'Sportler', slot: 'outfit', preis: 300, waehrung: 'sterne', bild: sportler,
    anker: { augen: { x: .5, y: .5, b: .34 }, hand: { x: .82, y: .6, b: .24, r: 18 }, ruecken: { x: .2, y: .72 }, fuesse: { x: .5, y: .94 }, begleiter: { x: .12, y: .86 } } },
  { id: 'wissenschaftler', name: 'Wissenschaftler', slot: 'outfit', preis: 350, waehrung: 'sterne', bild: wissenschaftler,
    anker: { kopf: { x: .5, y: .04, b: .34 }, hand: { x: .12, y: .65, b: .25, r: -14 }, ruecken: { x: .86, y: .62 }, fuesse: { x: .5, y: .96 }, begleiter: { x: .88, y: .86 } } },
  { id: 'entdecker', name: 'Entdecker', slot: 'outfit', preis: 300, waehrung: 'sterne', bild: entdecker,
    anker: { augen: { x: .52, y: .5, b: .34 }, hand: { x: .9, y: .62, b: .24, r: 18 }, ruecken: { x: .14, y: .72 }, fuesse: { x: .5, y: .96 }, begleiter: { x: .14, y: .88 } } },
  { id: 'winterheld', name: 'Winterheld', slot: 'outfit', preis: 350, waehrung: 'sterne', bild: winterheld,
    anker: { augen: { x: .53, y: .53, b: .34 }, hand: { x: .17, y: .62, b: .26, r: -16 }, ruecken: { x: .86, y: .62 }, fuesse: { x: .5, y: .94 }, begleiter: { x: .88, y: .88 } } },
  { id: 'genie', name: 'Genie', slot: 'outfit', preis: 450, waehrung: 'sterne', bild: genie,
    anker: { hand: { x: .82, y: .63, b: .24, r: 14 }, ruecken: { x: .14, y: .7 }, fuesse: { x: .5, y: .96 }, begleiter: { x: .12, y: .88 } } },
]

const ACCESSOIRES: Artikel[] = [
  { id: 'gold-abakus', name: 'Goldener Abakus', slot: 'hand', preis: 500, waehrung: 'sterne', bild: goldAbakus },
  { id: 'brille', name: 'Brille', slot: 'brille', preis: 150, waehrung: 'sterne', bild: brille },
  { id: 'rucksack', name: 'Rucksack', slot: 'ruecken', preis: 200, waehrung: 'sterne', bild: rucksack },
  { id: 'umhang', name: 'Umhang', slot: 'ruecken', preis: 150, waehrung: 'sterne', bild: umhang },
  { id: 'krone', name: 'Sternenkrone', slot: 'kopf', preis: 250, waehrung: 'sterne', bild: krone },
  { id: 'raketenschuhe', name: 'Raketenschuhe', slot: 'fuesse', preis: 300, waehrung: 'sterne', bild: schuhe },
  { id: 'roboter', name: 'Roboter-Begleiter', slot: 'begleiter', preis: 400, waehrung: 'sterne', bild: roboter },
]

const SPEZIAL: Artikel[] = [
  { id: 'glitzer', name: 'Glitzersterne', slot: 'effekt', preis: 3, waehrung: 'diamanten', css: 'glitzer' },
  { id: 'goldschein', name: 'Goldener Schein', slot: 'effekt', preis: 4, waehrung: 'diamanten', css: 'goldschein' },
  { id: 'regenbogen', name: 'Regenbogen-Hintergrund', slot: 'hintergrund', preis: 5, waehrung: 'diamanten', css: 'regenbogen' },
  { id: 'weltall', name: 'Weltall-Hintergrund', slot: 'hintergrund', preis: 5, waehrung: 'diamanten', css: 'weltall' },
]

export const STANDARD_ARTIKEL: Artikel[] = [...KOSTUEME, ...ACCESSOIRES, ...SPEZIAL]
export const START_KOSTUEM = 'original'

/** Passt ein Accessoire zum Kostüm? (Kostüme mit Hut haben keinen Platz für die Krone, Brillen-Kostüme keinen für die Brille) */
export function passt(kostuem: Artikel | undefined, a: Artikel) {
  const k = kostuem?.anker
  if (!k) return a.slot !== 'kopf' && a.slot !== 'brille'
  if (a.slot === 'kopf') return !!k.kopf
  if (a.slot === 'brille') return !!k.augen
  return true
}

export const WARUM_NICHT: Partial<Record<Slot, string>> = {
  kopf: 'Passt nicht zu diesem Kostüm – es hat schon eine Kopfbedeckung.',
  brille: 'Passt nicht zu diesem Kostüm – es hat schon eine Brille oder Maske.',
}
