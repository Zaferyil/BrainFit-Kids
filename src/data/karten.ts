import insel1 from '../assets/karte/insel.webp'
import insel2 from '../assets/karte/insel-2.webp'
import insel3 from '../assets/karte/insel-3.webp'
import insel4 from '../assets/karte/insel-4.webp'
import insel5 from '../assets/karte/insel-5.webp'

// Die Karte besteht aus Etappen: je ein Inselbild ohne Stationen (siehe scripts/karte-bild.py)
// mit ihren Plätzen auf dem Weg, von unten (Start) nach oben. Gibt es mehr Etappen als Bilder,
// beginnen die Bilder wieder von vorn.

/** oben: hier endet das Bild, wenn die Burg darauf folgt (darüber liegt eine kleine Burg im Bild);
 *  weg: dort verlässt der Weg das Bild – von da führt ein gezeichneter Weg zur Burgtreppe */
export type Karte = { bild: string; w: number; h: number; plaetze: [number, number][]; oben?: number; weg?: [number, number] }

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
    plaetze: [[366, 1220], [558, 1060], [297, 817], [535, 682], [701, 912], [663, 542], [331, 422], [292, 305], [430, 262], [575, 330], [748, 228], [0, 0]],
    oben: 225, weg: [752, 262],
  },
  {
    bild: insel4, w: 941, h: 1397,
    plaetze: [[366, 1240], [498, 1100], [595, 915], [263, 805], [478, 634], [664, 592], [357, 433], [260, 291], [546, 235], [732, 338], [770, 172]],
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
