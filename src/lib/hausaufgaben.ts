import { buchAufgaben, type BuchAuftrag, type WorkbookAuftrag } from '../data/buch'
import { load, save } from './storage'

// Smarte Hausaufgaben-Prüfung: Das Kind rechnet im Buch und beweist es mit einem kurzen Wissenscheck.
// Gefragt werden nur Aufgaben mit sicherer Lösung: Buch 1 (Basics Book) aus dem Buch-PDF übernommen,
// Buch 2 (Work Book) nur, was die Lehrkraft eingetragen hat. Bis Supabase angebunden ist, liegt alles auf diesem Gerät.

export type HausaufgabeStatus = 'offen' | 'selbst' | 'bestanden' | 'wiederholen' | 'lehrkraft'

export const STATUS_TEXT: Record<HausaufgabeStatus, string> = {
  offen: 'Noch offen',
  selbst: 'Selbst bestätigt',
  bestanden: 'Wissenscheck bestanden',
  wiederholen: 'Wiederholen',
  lehrkraft: 'Von Lehrkraft bestätigt',
}

/** Eine Prüffrage: genau eine Aufgabe aus einem der beiden Bücher */
export type PruefFrage = { id: string; buch: 1 | 2; seite: number; spalte?: 'A' | 'B'; nr: number; antwort: number }

export type Hausaufgabe = {
  key: string
  kidId: string
  world: number
  unit: number
  runde: number
  buch1: { seite: number; spalte: 'A' | 'B'; von: number; bis: number }
  buch2?: { von: number; bis: number; freiwillig?: [number, number] }
  status: HausaufgabeStatus
  /** letzter Wissenscheck */
  geprueft: number
  richtig: number
  falsch: number
  /** Soroban-Frage im letzten Check: richtig, falsch oder keine */
  soroban?: boolean
  datum?: string
  /** freiwilliges Foto der Buchseite (verkleinert), nur für die Lehrkraft */
  foto?: string
  /** Belohnung für diese Hausaufgabe schon vergeben? (nur einmal) */
  belohnt?: boolean
  versuche: number
  /** Notiz bei „Wiederholen“ durch die Lehrkraft */
  vonLehrkraft?: string
}

const key = (kidId: string) => `bfk.hausaufgaben.${kidId}`
export const hausaufgabeKey = (world: number, unit: number, runde: number) => `${world}-${unit}-${runde}`

export const alleHausaufgaben = (kidId: string) => load<Record<string, Hausaufgabe>>(key(kidId), {})

export function hausaufgabe(kidId: string, world: number, unit: number, runde: number, b1: BuchAuftrag, b2: WorkbookAuftrag | null): Hausaufgabe {
  const k = hausaufgabeKey(world, unit, runde)
  return alleHausaufgaben(kidId)[k] ?? {
    key: k, kidId, world, unit, runde,
    buch1: { seite: b1.seite, spalte: b1.spalte, von: b1.von, bis: b1.bis },
    ...(b2 ? { buch2: { von: b2.von, bis: b2.bis, ...(b2.freiwillig ? { freiwillig: b2.freiwillig } : {}) } } : {}),
    status: 'offen', geprueft: 0, richtig: 0, falsch: 0, versuche: 0,
  }
}

export function speichereHausaufgabe(h: Hausaufgabe) {
  save(key(h.kidId), { ...alleHausaufgaben(h.kidId), [h.key]: h })
}

/** Lösungen fürs Work Book, von der Lehrkraft eingetragen: Seite → Aufgabe → Ergebnis */
const WB_KEY = 'bfk.workbook-loesungen'
export type WorkbookLoesungen = Record<string, Record<string, number>>
export const workbookLoesungen = () => load<WorkbookLoesungen>(WB_KEY, {})
export function setWorkbookLoesung(seite: number, nr: number, antwort: number | null) {
  const alle = workbookLoesungen()
  const s = { ...(alle[seite] ?? {}) }
  if (antwort === null) delete s[nr]
  else s[nr] = antwort
  save(WB_KEY, { ...alle, [seite]: s })
}

/** Alle Aufgaben dieser Hausaufgabe mit sicherer Lösung */
export function pruefbareAufgaben(h: Hausaufgabe): PruefFrage[] {
  const { seite, spalte, von, bis } = h.buch1
  const buch1 = buchAufgaben(seite, spalte).slice(von - 1, bis)
    .map((zahlen, i): PruefFrage => ({ id: `1-${seite}-${spalte}-${von + i}`, buch: 1, seite, spalte, nr: von + i, antwort: zahlen.reduce((a, b) => a + b, 0) }))
  const wb = workbookLoesungen()
  const buch2: PruefFrage[] = []
  if (h.buch2) for (let s = h.buch2.von; s <= h.buch2.bis; s++) {
    for (const [nr, antwort] of Object.entries(wb[s] ?? {})) buch2.push({ id: `2-${s}-${nr}`, buch: 2, seite: s, nr: Number(nr), antwort })
  }
  return [...buch1, ...buch2]
}

export const PRUEF_ANZAHL = 3

/** Zufällig 3 Fragen; hat die Lehrkraft Lösungen fürs Work Book eingetragen, ist eine davon aus Buch 2. */
export function pruefFragen(h: Hausaufgabe, zufall = Math.random): PruefFrage[] | null {
  const alle = pruefbareAufgaben(h)
  if (alle.length < PRUEF_ANZAHL) return null
  const mischen = <T,>(a: T[]) => a.map((x) => [zufall(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x)
  const b2 = mischen(alle.filter((f) => f.buch === 2))
  const b1 = mischen(alle.filter((f) => f.buch === 1))
  const wahl = [...b2.slice(0, 1), ...b1].slice(0, PRUEF_ANZAHL)
  return wahl.length < PRUEF_ANZAHL ? mischen(alle).slice(0, PRUEF_ANZAHL) : mischen(wahl)
}

/** Ergebnis eines Wissenschecks speichern */
export function checkErgebnis(h: Hausaufgabe, richtig: number, falsch: number, soroban: boolean | undefined): Hausaufgabe {
  const bestanden = falsch === 0 && richtig >= PRUEF_ANZAHL && soroban !== false
  const neu: Hausaufgabe = {
    ...h, geprueft: richtig + falsch, richtig, falsch, soroban, versuche: h.versuche + 1, datum: new Date().toISOString(),
    // von der Lehrkraft bestätigt bleibt bestätigt
    status: h.status === 'lehrkraft' ? 'lehrkraft' : bestanden ? 'bestanden' : 'wiederholen',
    ...(bestanden ? { vonLehrkraft: undefined } : {}),
  }
  speichereHausaufgabe(neu)
  return neu
}

/** Lehrkraft: bestätigen oder zum Wiederholen zurückgeben */
export function lehrkraftEntscheidet(kidId: string, k: string, entscheidung: 'lehrkraft' | 'wiederholen') {
  const h = alleHausaufgaben(kidId)[k]
  if (!h) return
  speichereHausaufgabe({ ...h, status: entscheidung, vonLehrkraft: entscheidung === 'wiederholen' ? 'Bitte übe die Aufgaben nochmal.' : undefined })
}

/** Foto verkleinern (längste Seite 900 px, JPEG), damit es im Speicher Platz hat */
export function fotoVerkleinern(datei: File): Promise<string> {
  return new Promise((ok, fehler) => {
    const url = URL.createObjectURL(datei)
    const bild = new Image()
    bild.onload = () => {
      const f = Math.min(1, 900 / Math.max(bild.width, bild.height))
      const c = document.createElement('canvas')
      c.width = Math.round(bild.width * f); c.height = Math.round(bild.height * f)
      c.getContext('2d')?.drawImage(bild, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      ok(c.toDataURL('image/jpeg', 0.72))
    }
    bild.onerror = () => { URL.revokeObjectURL(url); fehler(new Error('Bild nicht lesbar')) }
    bild.src = url
  })
}
