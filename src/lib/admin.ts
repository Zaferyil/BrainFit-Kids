import { CLASSES, PICTURES, alleKinder, benutzerVon, ladeSchule, normalizeCode, speichereSchule, type Kid, type PictureId } from '../data/demo'
import { WORLDS } from '../data/curriculum'
import { STATIONS, unitContent } from '../data/units'
import { unitVideos } from '../data/videos'
import { kursAufgaben } from '../data/kurs'
import { buchAuftrag, workbookAuftrag } from '../data/buch'
import { ABSCHLUSS } from '../data/abschluss'
import { getProgress, saveProgress, type Progress } from './progress'
import { getDaily } from './daily'
import { KLASSEN, klasseVon } from './klasse'
import { load, save } from './storage'

// Admin-Bereich: liest die Daten der Kinder auf diesem Gerät (bis Supabase angebunden ist).

export type KidZeile = {
  kid: Kid
  klassenCode: string
  progress: Progress
  stufe: number | null
  stufeName: string
  lektion: number
  lektionName: string
  /** geschaffte Lektionen (alle Welten zusammen) */
  geschafft: number
  sterne: number
  heute: { minuten: number; aufgaben: number; spiele: number }
  eingestuft: boolean
}

/** Lektion fortlaufend über alle Welten (Welt 1 = 1–12, Welt 2 = 13–18 …) */
export function lektionNr(world: number, unit: number) {
  return WORLDS.slice(0, world - 1).reduce((n, w) => n + w.units.length, 0) + unit
}

export const ALLE_LEKTIONEN = WORLDS.flatMap((w) => w.units.map((name, i) => ({ world: w.n, unit: i + 1, name, nr: lektionNr(w.n, i + 1), weltName: w.name })))

export function kidZeilen(): KidZeile[] {
  return CLASSES.flatMap((c) => c.kids.map((kid) => {
    const progress = getProgress(kid.id)
    const stufe = load<number | null>(`bfk.stufe.${kid.id}`, null)
    const daily = getDaily(kid.id)
    const nr = lektionNr(progress.world, progress.unit)
    const sterne = Object.values(progress.stationStars).flat().reduce((a, b) => a + b, 0)
    return {
      kid,
      klassenCode: c.code,
      progress,
      stufe,
      stufeName: klasseVon(kid.id).name + (stufe === null ? ' (Standard)' : ''),
      lektion: nr,
      lektionName: WORLDS[progress.world - 1]?.units[progress.unit - 1] ?? '–',
      geschafft: nr - 1,
      sterne,
      heute: { minuten: daily.minutes, aufgaben: daily.tasks, spiele: daily.games },
      eingestuft: load(`bfk.placement.${kid.id}`, null) !== null,
    }
  }))
}

export function setStufe(kidId: string, stufe: number) {
  save(`bfk.stufe.${kidId}`, Math.max(0, Math.min(KLASSEN.length - 1, stufe)))
}

/** Kind auf eine Lektion setzen (Karte und Ansicht werden neu aufgebaut) */
export function setLektion(kidId: string, world: number, unit: number) {
  const p = getProgress(kidId)
  saveProgress(kidId, { ...p, world, unit })
  for (const k of ['mapstops', 'ansicht']) save(`bfk.${k}.${kidId}`, null)
}

/** Fortschritt zurücksetzen; Klasse und Einstufung bleiben */
export function resetKid(kidId: string) {
  for (const k of ['progress', 'mapstops', 'ansicht', 'levels', 'daily']) save(`bfk.${k}.${kidId}`, null)
}

export type Status = 'fertig' | 'teil' | 'fehlt'
export type LektionStatus = { nr: number; world: number; unit: number; name: string; zellen: { titel: string; status: Status; info: string }[] }

/** Was ist je Lektion fertig? Video, Übungen, Kurs-Aufgaben, Bücher, Abschlusstest */
export function inhaltStatus(): LektionStatus[] {
  return ALLE_LEKTIONEN.map(({ world, unit, name, nr }) => {
    const content = unitContent(world, unit)
    const video = unitVideos(world, unit)[0]
    const kurs = kursAufgaben(world, unit)
    const wb = workbookAuftrag(world, unit)
    const hoer = ABSCHLUSS[`${world}-${unit}`]
    return {
      nr, world, unit, name,
      zellen: [
        { titel: 'Video', status: video?.source === 'lektion' ? 'fertig' : video ? 'teil' : 'fehlt', info: video?.source === 'lektion' ? 'Eigener Video-Tutor' : video ? 'YouTube' : 'kein Video' },
        { titel: 'Übungen', status: content ? 'fertig' : 'fehlt', info: content ? 'Entdecken, Üben, Blitz, Kopfrechnen' : 'Inhalte fehlen' },
        { titel: 'Kurs', status: kurs ? 'fertig' : 'fehlt', info: kurs ? `${kurs.length} Aufgaben (Unity)` : 'keine Kurs-Aufgaben' },
        { titel: 'Buch 1', status: buchAuftrag(world, unit, 1) ? 'fertig' : 'fehlt', info: 'Basics Book' },
        { titel: 'Buch 2', status: wb ? 'fertig' : 'fehlt', info: wb ? `Work Book S. ${wb.von}${wb.bis !== wb.von ? '–' + wb.bis : ''}` : 'keine Seite' },
        { titel: 'Test', status: hoer?.length ? 'fertig' : 'fehlt', info: hoer?.length ? `${hoer.length} Hör-Aufgaben` : 'keine Hör-Aufgaben' },
      ],
    }
  })
}

export const STATION_ANZAHL = STATIONS.length

// ---- Kinder und Klassen verwalten (nur Vorname, keine weiteren Daten) ----

/** Gleicher Vorname in der Schule: Nummer anhängen („Lena 2“) */
export function freierName(name: string) {
  const basis = name.trim().replace(/\s+/g, ' ')
  const namen = new Set(alleKinder().map((k) => k.kid.name.toLowerCase()))
  if (!namen.has(basis.toLowerCase())) return basis
  let n = 2
  while (namen.has(`${basis} ${n}`.toLowerCase())) n++
  return `${basis} ${n}`
}

const FARBEN = ['#FF4D6D', '#3BA7FF', '#3DBE5B', '#FFC531', '#A06BFF', '#FF8A1F']
const HAARE = ['#6B3E1F', '#231A4F', '#E9B949', '#C2410C']
const HAUT = ['#F6C9A6', '#E0A47A', '#B9774E', '#7A4A2E']
const HUETE = ['cap', 'none', 'band', 'phones', 'crown', 'wizard'] as const
const zufall = <T,>(l: readonly T[]) => l[Math.floor(Math.random() * l.length)]

const WOERTER = ['perle', 'stern', 'sonne', 'blitz', 'krone', 'drache', 'rakete', 'tiger']
/** Einfaches Passwort für Kinder, z. B. „stern47“ */
export const neuesPasswort = () => zufall(WOERTER) + (10 + Math.floor(Math.random() * 90))
/** Benutzername aus dem Vornamen, bei Gleichheit mit Nummer („lena2“) */
export function freierBenutzer(name: string) {
  const basis = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '') || 'kind'
  const vergeben = new Set(alleKinder().map((k) => benutzerVon(k.kid)))
  if (!vergeben.has(basis)) return basis
  let n = 2
  while (vergeben.has(`${basis}${n}`)) n++
  return `${basis}${n}`
}

export function kindHinzufuegen(vorname: string, klasse: string): Kid | null {
  if (!vorname.trim()) return null
  const sch = ladeSchule()
  const name = freierName(vorname)
  const id = `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const kid: Kid = {
    id, name, birthYear: new Date().getFullYear() - 8,
    benutzer: freierBenutzer(name), passwort: neuesPasswort(),
    password: Array.from({ length: 4 }, () => zufall(PICTURES).id as PictureId),
    avatar: { hat: zufall(HUETE), hatColor: zufall(FARBEN), shirt: zufall(FARBEN), hair: zufall(HAARE), skin: zufall(HAUT) },
  }
  speichereSchule({ ...sch, kinder: [...sch.kinder, { ...kid, klasse }] })
  return kid
}

export function archivieren(kidId: string) {
  const sch = ladeSchule()
  if (!sch.archiv.includes(kidId)) speichereSchule({ ...sch, archiv: [...sch.archiv, kidId] })
}

export function wiederherstellen(kidId: string) {
  const sch = ladeSchule()
  speichereSchule({ ...sch, archiv: sch.archiv.filter((id) => id !== kidId) })
}

export function klasseWechseln(kidId: string, code: string) {
  const sch = ladeSchule()
  speichereSchule({ ...sch, wechsel: { ...sch.wechsel, [kidId]: code } })
}

/** Neue Klasse mit Klassen-Code (z. B. „WIEN-3A“); gibt den Code zurück oder null, wenn er schon existiert */
export function klasseAnlegen(code: string): string | null {
  const c = code.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '')
  if (!c || CLASSES.some((k) => normalizeCode(k.code) === normalizeCode(c))) return null
  const sch = ladeSchule()
  speichereSchule({ ...sch, klassen: [...sch.klassen, c] })
  return c
}

export const klassenCodes = () => CLASSES.map((c) => c.code)
export const archivierteKinder = () => alleKinder().filter((k) => k.archiviert)
