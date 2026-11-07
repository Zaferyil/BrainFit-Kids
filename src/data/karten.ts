import insel1 from '../assets/karte/insel.webp'
import insel2 from '../assets/karte/insel-2.webp'
import insel3 from '../assets/karte/insel-3.webp'
import insel4 from '../assets/karte/insel-4.webp'
import insel5 from '../assets/karte/insel-5.webp'
import aeg1 from '../assets/karte/insel-aegypten-1.webp'
import aeg2 from '../assets/karte/insel-aegypten-2.webp'
import aeg3 from '../assets/karte/insel-aegypten-3.webp'
import aeg4 from '../assets/karte/insel-aegypten-4.webp'
import dino1 from '../assets/karte/insel-dino-1.webp'
import dino2 from '../assets/karte/insel-dino-2.webp'
import dino3 from '../assets/karte/insel-dino-3.webp'
import dino4 from '../assets/karte/insel-dino-4.webp'
import raum1 from '../assets/karte/insel-weltraum-1.webp'
import raum2 from '../assets/karte/insel-weltraum-2.webp'
import raum3 from '../assets/karte/insel-weltraum-3.webp'
import raum4 from '../assets/karte/insel-weltraum-4.webp'

// Nummern-Knöpfe der Ägypten-Karte (1–24, freigestellt): knoepfe[n-1] = Knopf mit Nummer n
const KNOPF_DATEIEN = import.meta.glob('../assets/karte/knopf/*.webp', { eager: true, import: 'default' }) as Record<string, string>
const RAUM_KNOEPFE = Array.from({ length: 24 }, (_, i) => KNOPF_DATEIEN[`../assets/karte/knopf/raum-${i + 1}.webp`])
const DINO_KNOEPFE = Array.from({ length: 24 }, (_, i) => KNOPF_DATEIEN[`../assets/karte/knopf/dino-${i + 1}.webp`])
const AEG_KNOEPFE = Array.from({ length: 24 }, (_, i) => KNOPF_DATEIEN[`../assets/karte/knopf/aeg-${i + 1}.webp`])

// Die Karte besteht aus Etappen: je ein Inselbild ohne Stationen (siehe scripts/karte-bild.py)
// mit ihren Plätzen auf dem Weg, von unten (Start) nach oben. Gibt es mehr Etappen als Bilder,
// beginnen die Bilder wieder von vorn.

/** weg: dort schließt ein Burgbild mit eigenem Weg an; die letzten Plätze liegen dann auf dessen Weg */
/** burg: die Burg ersetzt genau die kleine Burg im Bild (Mitte x, Unterkante, Breite als Anteil) */
export type Karte = { bild: string; w: number; h: number; plaetze: [number, number][]; weg?: [number, number]; burg?: { x: number; unten: number; breite: number }; gemalt?: boolean; knoepfe?: string[] }

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

/** Eigene Karten je Welt (Welt 4: Ägypten-Abenteuer, je 6 Plätze, von unten nach oben).
 *  gemalt: die Nummern-Knöpfe sind im Bild – die App legt nur unsichtbare Knöpfe mit Zustand darüber. */
export const WELT_KARTEN: Record<number, Karte[]> = {
  4: [
    { gemalt: true, knoepfe: AEG_KNOEPFE, bild: aeg1, w: 941, h: 1672, plaetze: [[330, 1245], [610, 1135], [370, 965], [630, 800], [370, 650], [680, 470]] },
    { gemalt: true, knoepfe: AEG_KNOEPFE, bild: aeg2, w: 941, h: 1480, plaetze: [[260, 950], [620, 830], [300, 700], [640, 550], [360, 420], [700, 300]] },
    { gemalt: true, knoepfe: AEG_KNOEPFE, bild: aeg3, w: 941, h: 1480, plaetze: [[260, 925], [570, 805], [300, 645], [600, 505], [360, 400], [720, 275]] },
    { gemalt: true, knoepfe: AEG_KNOEPFE, bild: aeg4, w: 941, h: 1480, plaetze: [[270, 960], [560, 850], [320, 720], [640, 565], [380, 445], [605, 335]] },
  ],
  5: [
    { gemalt: true, knoepfe: RAUM_KNOEPFE, bild: raum1, w: 941, h: 1427, plaetze: [[240, 995], [450, 945], [650, 840], [800, 690], [785, 515], [560, 475]] },
    { gemalt: true, knoepfe: RAUM_KNOEPFE, bild: raum2, w: 941, h: 1427, plaetze: [[240, 895], [460, 815], [640, 720], [790, 585], [745, 460], [520, 490]] },
    { gemalt: true, knoepfe: RAUM_KNOEPFE, bild: raum3, w: 941, h: 1427, plaetze: [[370, 990], [570, 930], [725, 835], [765, 660], [640, 565], [440, 490]] },
    { gemalt: true, knoepfe: RAUM_KNOEPFE, bild: raum4, w: 941, h: 1427, plaetze: [[330, 1045], [545, 950], [690, 820], [520, 715], [255, 660], [480, 470]] },
  ],
  6: [
    { gemalt: true, knoepfe: DINO_KNOEPFE, bild: dino1, w: 941, h: 1472, plaetze: [[330, 1330], [230, 1120], [450, 950], [380, 800], [600, 650], [560, 430]] },
    { gemalt: true, knoepfe: DINO_KNOEPFE, bild: dino2, w: 941, h: 1472, plaetze: [[480, 1130], [420, 640], [480, 480], [580, 320], [440, 190], [330, 110]] },
    { gemalt: true, knoepfe: DINO_KNOEPFE, bild: dino3, w: 941, h: 1472, plaetze: [[280, 1380], [600, 1150], [300, 950], [560, 700], [250, 520], [430, 330]] },
    { gemalt: true, knoepfe: DINO_KNOEPFE, bild: dino4, w: 941, h: 1472, plaetze: [[400, 1330], [290, 1120], [520, 960], [340, 760], [220, 500], [640, 350]] },
  ],
}

export type Etappe = { karte: Karte; start: number; anzahl: number }

/** Etappen für die Stationen; welten[i] = Welt der i-ten Station. Welten mit eigenen Karten bekommen ihre Bilder. */
export function etappenNachWelt(welten: number[]): Etappe[] {
  const out: Etappe[] = []
  let i = 0
  while (i < welten.length) {
    const w = welten[i], eigene = WELT_KARTEN[w]
    let j = i
    if (eigene) while (j < welten.length && welten[j] === w) j++
    else while (j < welten.length && !WELT_KARTEN[welten[j]]) j++
    if (eigene) {
      for (let start = i, k = 0; start < j; k++) {
        const karte = eigene[k % eigene.length]
        const anzahl = Math.min(karte.plaetze.length, j - start)
        out.push({ karte, start, anzahl }); start += anzahl
      }
    } else for (const e of etappen(j - i)) out.push({ ...e, start: e.start + i })
    i = j
  }
  return out.length ? out : etappen(0)
}

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
