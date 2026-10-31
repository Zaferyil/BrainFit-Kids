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

// SeZa: die Figur des Kindes. Kostüme sind fertige Bilder von SeZa und werden durch Lernen freigeschaltet
// (Lektionen, Welten, Serie, Level). Mit Sternen kauft das Kind Hintergründe und Rahmen oder öffnet eine Überraschungskiste.

export type Slot = 'outfit' | 'hg' | 'rahmen'
export type Waehrung = 'sterne' | 'diamanten'

export const SLOT_NAME: Record<Slot, string> = { outfit: 'Kostüm', hg: 'Hintergrund', rahmen: 'Rahmen' }

/** Wann ein Kostüm frei wird */
export type Bedingung = { art: 'start' | 'lektionen' | 'welt' | 'serie' | 'level'; wert: number }

export type Artikel = {
  id: string
  name: string
  slot: Slot
  preis: number
  waehrung: Waehrung
  bild?: string
  /** CSS-Klasse für Hintergrund/Rahmen */
  css?: string
  /** Kostüm: Bedingung zum Freischalten */
  frei?: Bedingung
  /** Bildausschnitt fürs runde Kopfbild (CSS background-position) */
  kopfAusschnitt?: string
  /** Start-Kostüm: beim ersten Login wählbar */
  start?: boolean
  aktiv?: boolean
  /** von der Lehrkraft angelegt */
  eigen?: boolean
}

const k = (id: string, name: string, bild: string, frei: Bedingung, kopf: string): Artikel =>
  ({ id, name, slot: 'outfit', preis: 0, waehrung: 'sterne', bild, frei, kopfAusschnitt: kopf, start: frei.art === 'start' })

const KOSTUEME: Artikel[] = [
  k('original', 'SeZa Original', original, { art: 'start', wert: 0 }, '52% 22%'),
  k('sportler', 'Sportler', sportler, { art: 'start', wert: 0 }, '48% 20%'),
  k('entdecker', 'Entdecker', entdecker, { art: 'start', wert: 0 }, '52% 18%'),
  k('winterheld', 'Winterheld', winterheld, { art: 'lektionen', wert: 2 }, '45% 32%'),
  k('feuerwehr', 'Feuerwehr', feuerwehr, { art: 'serie', wert: 3 }, '53% 26%'),
  k('wissenschaftler', 'Forscher', wissenschaftler, { art: 'lektionen', wert: 4 }, '58% 22%'),
  k('pirat', 'Pirat', pirat, { art: 'level', wert: 5 }, '48% 30%'),
  k('zauberer', 'Zauberer', zauberer, { art: 'lektionen', wert: 6 }, '65% 35%'),
  k('ninja', 'Ninja', ninja, { art: 'serie', wert: 7 }, '52% 18%'),
  k('superheld', 'Superheld', superheld, { art: 'lektionen', wert: 9 }, '58% 25%'),
  k('astronaut', 'Astronaut', astronaut, { art: 'welt', wert: 1 }, '50% 22%'),
  k('ritter', 'Ritter', ritter, { art: 'level', wert: 12 }, '48% 32%'),
  k('genie', 'Genie', genie, { art: 'welt', wert: 2 }, '50% 30%'),
]

const h = (id: string, name: string, preis: number): Artikel => ({ id, name, slot: 'hg', preis, waehrung: 'sterne', css: id })
const r = (id: string, name: string, preis: number): Artikel => ({ id, name, slot: 'rahmen', preis, waehrung: 'sterne', css: id })

const SCHMUCK: Artikel[] = [
  h('hg-regenbogen', 'Regenbogen', 150), h('hg-wald', 'Zauberwald', 150), h('hg-meer', 'Unterwasser', 200),
  h('hg-sonne', 'Sonnenstrand', 200), h('hg-weltall', 'Weltall', 300), h('hg-burg', 'Abakus-Burg', 300),
  r('r-gold', 'Goldrahmen', 200), r('r-regenbogen', 'Regenbogenrahmen', 250), r('r-flamme', 'Feuerrahmen', 300), r('r-diamant', 'Diamantrahmen', 400),
]

export const STANDARD_ARTIKEL: Artikel[] = [...KOSTUEME, ...SCHMUCK]
export const START_KOSTUEM = 'original'
export const START_KOSTUEME = KOSTUEME.filter((a) => a.start)

/** Überraschungskiste: zufälliger Hintergrund oder Rahmen, den das Kind noch nicht hat */
export const KISTE_PREIS = 180

export function bedingungText(b: Bedingung) {
  switch (b.art) {
    case 'start': return 'Von Anfang an'
    case 'lektionen': return `${b.wert} Lektionen schaffen`
    case 'welt': return `Welt ${b.wert} schaffen`
    case 'serie': return `${b.wert} Tage am Stück lernen`
    case 'level': return `Level ${b.wert} erreichen`
  }
}
