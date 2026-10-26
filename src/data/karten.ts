import insel1 from '../assets/karte/insel.webp'
import insel2 from '../assets/karte/insel-2.webp'

// Die Karte besteht aus Etappen: je ein Inselbild ohne Stationen (siehe scripts/karte-bild.py)
// mit 12 Plätzen auf dem Weg, von unten (Start) nach oben. Gibt es mehr Etappen als Bilder,
// beginnen die Bilder wieder von vorn.

export type Karte = { bild: string; w: number; h: number; plaetze: [number, number][] }

export const KARTEN: Karte[] = [
  {
    bild: insel1, w: 941, h: 1403,
    plaetze: [[555, 1173], [325, 1046], [157, 923], [262, 713], [449, 793], [700, 871], [766, 668], [559, 538], [329, 471], [319, 298], [565, 263], [700, 163]],
  },
  {
    bild: insel2, w: 941, h: 1407,
    plaetze: [[307, 1210], [402, 1085], [645, 959], [297, 857], [524, 692], [702, 572], [513, 502], [281, 452], [357, 339], [568, 350], [744, 297], [715, 192]],
  },
]

export const PRO_ETAPPE = 12
export const karteFuer = (etappe: number) => KARTEN[etappe % KARTEN.length]
