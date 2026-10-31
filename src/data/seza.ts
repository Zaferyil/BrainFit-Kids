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
import schattenninja from '../assets/seza/schattenninja.webp'
import kapitaen from '../assets/seza/kapitaen.webp'
import dino from '../assets/seza/dino.webp'
import rennfahrer from '../assets/seza/rennfahrer.webp'
import wueste from '../assets/seza/wueste.webp'
import kristall from '../assets/seza/d-kristall.webp'
import roboter from '../assets/seza/d-roboter.webp'
import koenig from '../assets/seza/d-koenig.webp'
import pixel from '../assets/seza/d-pixel.webp'
import magier from '../assets/seza/d-magier.webp'

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
  k('dino', 'Dino-SeZa', dino, { art: 'lektionen', wert: 11 }, '52% 38%'),
  k('rennfahrer', 'Rennfahrer', rennfahrer, { art: 'serie', wert: 14 }, '52% 32%'),
  k('wueste', 'Wüsten-Reisender', wueste, { art: 'lektionen', wert: 14 }, '52% 30%'),
  k('kapitaen', 'Kapitän', kapitaen, { art: 'level', wert: 15 }, '52% 35%'),
  k('schattenninja', 'Schatten-Ninja', schattenninja, { art: 'lektionen', wert: 18 }, '55% 32%'),
]

// Diamant-Kostüme: besondere SeZas, nur mit Diamanten (selten) zu bekommen
const d = (id: string, name: string, bild: string, preis: number, kopf: string): Artikel =>
  ({ id, name, slot: 'outfit', preis, waehrung: 'diamanten', bild, kopfAusschnitt: kopf })
const DIAMANT: Artikel[] = [
  d('d-pixel', 'Pixel-SeZa', pixel, 5, '52% 22%'),
  d('d-roboter', 'Robo-SeZa', roboter, 6, '52% 25%'),
  d('d-magier', 'Sternen-Magier', magier, 8, '55% 32%'),
  d('d-koenig', 'König SeZa', koenig, 10, '52% 35%'),
  d('d-kristall', 'Kristall-Held', kristall, 12, '52% 32%'),
]

const h = (id: string, name: string, preis: number): Artikel => ({ id, name, slot: 'hg', preis, waehrung: 'sterne', css: id })
const r = (id: string, name: string, preis: number): Artikel => ({ id, name, slot: 'rahmen', preis, waehrung: 'sterne', css: id })

const SCHMUCK: Artikel[] = [
  h('hg-regenbogen', 'Regenbogen', 150), h('hg-wald', 'Zauberwald', 150), h('hg-meer', 'Unterwasser', 200),
  h('hg-sonne', 'Sonnenstrand', 200), h('hg-weltall', 'Weltall', 300), h('hg-burg', 'Abakus-Burg', 300),
  r('r-gold', 'Goldrahmen', 200), r('r-regenbogen', 'Regenbogenrahmen', 250), r('r-flamme', 'Feuerrahmen', 300), r('r-diamant', 'Diamantrahmen', 400),
]

export const STANDARD_ARTIKEL: Artikel[] = [...KOSTUEME, ...DIAMANT, ...SCHMUCK]
export const START_KOSTUEM = 'original'
export const START_KOSTUEME = KOSTUEME.filter((a) => a.start)

/** Überraschungskiste: zufälliger Hintergrund oder Rahmen, den das Kind noch nicht hat */
export const KISTE_PREIS = 180

/** Perlen: Punkte für den Rang (werden nicht ausgegeben) */
export const RAENGE = [
  { ab: 0, name: 'Perlen-Anfänger', icon: '🌱' },
  { ab: 300, name: 'Abakus-Lehrling', icon: '🧮' },
  { ab: 1000, name: 'Rechen-Entdecker', icon: '🔍' },
  { ab: 2500, name: 'Rechen-Profi', icon: '🚀' },
  { ab: 5000, name: 'Kopfrechen-Meister', icon: '🏅' },
  { ab: 10000, name: 'Abakus-Legende', icon: '👑' },
]
export function rangVon(perlen: number) {
  const i = RAENGE.findLastIndex((r) => perlen >= r.ab)
  return { ...RAENGE[i], naechster: RAENGE[i + 1] }
}

export function bedingungText(b: Bedingung) {
  switch (b.art) {
    case 'start': return 'Von Anfang an'
    case 'lektionen': return `${b.wert} Lektionen schaffen`
    case 'welt': return `Welt ${b.wert} schaffen`
    case 'serie': return `${b.wert} Tage am Stück lernen`
    case 'level': return `Level ${b.wert} erreichen`
  }
}
