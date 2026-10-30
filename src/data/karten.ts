import insel1 from '../assets/karte/insel.webp'
import insel2 from '../assets/karte/insel-2.webp'
import insel3 from '../assets/karte/insel-3.webp'
import insel4 from '../assets/karte/insel-4.webp'
import insel5 from '../assets/karte/insel-5.webp'

// Die Karte besteht aus Etappen: je ein Inselbild ohne Stationen (siehe scripts/karte-bild.py)
// mit ihren Plätzen auf dem Weg, von unten (Start) nach oben. Gibt es mehr Etappen als Bilder,
// beginnen die Bilder wieder von vorn.

/** weg: dort schließt ein Burgbild mit eigenem Weg an; die letzten Plätze liegen dann auf dessen Weg */
/** burg: die Burg ersetzt genau die kleine Burg im Bild (Mitte x, Unterkante, Breite als Anteil) */
export type Karte = { bild: string; w: number; h: number; plaetze: [number, number][]; weg?: [number, number]; burg?: { x: number; unten: number; breite: number } }

export const KARTEN: Karte[] = [
  {
    bild: insel1, w: 941, h: 1393,
    plaetze: [[555, 1173], [325, 1046], [157, 923], [262, 713], [449, 793], [700, 871], [766, 668], [559, 538], [329, 471], [319, 298], [565, 263], [700, 163]],
  },
  {
    bild: insel2, w: 941, h: 1397,
    plaetze: [[307, 1210], [402, 1085], [645, 959], [297, 857], [524, 692], [705, 572], [500, 500], [255, 468], [345, 350], [515, 362], [712, 352], [628, 236]],
  },
  {
    bild: insel3, w: 941, h: 1397,
    plaetze: [[366, 1220], [558, 1060], [297, 817], [535, 682], [701, 912], [663, 542], [331, 422], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    weg: [331, 300],
  },
  {
    bild: insel4, w: 941, h: 1397,
    plaetze: [[425, 1165], [535, 1055], [595, 915], [263, 805], [478, 634], [664, 592], [357, 433], [255, 291], [465, 252], [610, 290], [748, 350], [738, 250]],
    burg: { x: 785, unten: 222, breite: 0.42 },
  },
  {
    // Ziel-Insel; 13 Plätze: in der Vorlage fehlt die 49, ihr Platz liegt auf der Brücke
    bild: insel5, w: 941, h: 1397,
    plaetze: [[392, 1197], [540, 1142], [663, 1082], [463, 949], [685, 842], [428, 770], [573, 645], [321, 552], [647, 482], [470, 387], [285, 297], [491, 237], [635, 177]],
  },
]

export type Etappe = { karte: Karte; start: number; anzahl: number }

/** Teilt n Stationen auf die Inselbilder auf (der Reihe nach, danach wieder von vorn). */
export function etappen(n: number): Etappe[] {
  const out: Etappe[] = []
  for (let start = 0, i = 0; start < n || i === 0; i++) {
    const karte = KARTEN[i % KARTEN.length]
    out.push({ karte, start, anzahl: Math.min(karte.plaetze.length, n - start) })
    start += karte.plaetze.length
  }
  return out
}
