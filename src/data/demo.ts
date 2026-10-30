import type { Hat } from '../components/Avatar'
import { figurVon, kidPhoto } from './kinderBilder'
import type { IconName } from '../components/Icon'

// Beispieldaten, bis Supabase angebunden ist.

export type PictureId = 'stern' | 'herz' | 'blitz' | 'krone' | 'diamant' | 'geschenk' | 'pfote' | 'feuer' | 'buch'

export const PICTURES: { id: PictureId; label: string; icon: IconName; color: string; fill: string }[] = [
  { id: 'stern', label: 'Stern', icon: 'star', color: '#DE9800', fill: '#FFC531' },
  { id: 'herz', label: 'Herz', icon: 'heart', color: '#C2264E', fill: '#FF5C8A' },
  { id: 'blitz', label: 'Blitz', icon: 'bolt', color: '#5B47D6', fill: '#C9C0FF' },
  { id: 'krone', label: 'Krone', icon: 'crown', color: '#DE9800', fill: '#FFE58F' },
  { id: 'diamant', label: 'Diamant', icon: 'gem', color: '#1F7FD1', fill: '#9BD3FF' },
  { id: 'geschenk', label: 'Geschenk', icon: 'gift', color: '#25913F', fill: '#B6EFC2' },
  { id: 'pfote', label: 'Pfote', icon: 'paw', color: '#8A4B20', fill: '#E8B48A' },
  { id: 'feuer', label: 'Feuer', icon: 'flame', color: '#E06A00', fill: '#FFB15E' },
  { id: 'buch', label: 'Buch', icon: 'book', color: '#5B47D6', fill: '#E4DFFF' },
]

export type Kid = {
  id: string
  name: string
  birthYear: number
  password: PictureId[]
  /** Login für Kinder: Benutzername und Passwort (vom System vergeben) */
  benutzer?: string
  passwort?: string
  avatar: { hat: Hat; hatColor: string; shirt: string; hair: string; skin: string; glasses?: boolean; photo?: string }
}

export type SchoolClass = { code: string; kids: Kid[] }

/** Kinder und Klassen von Anfang an (Beispiel); Änderungen aus dem Admin-Bereich liegen in localStorage (bfk.schule). */
const BASIS: SchoolClass[] = [
  {
    code: 'LINZ-7K',
    kids: [
      { id: 'lena', name: 'Lena', birthYear: 2018, password: ['stern', 'herz', 'blitz', 'krone'], avatar: { photo: kidPhoto('lena'), hat: 'cap', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#F6C9A6' } },
      { id: 'jonas', name: 'Jonas', birthYear: 2017, password: ['pfote', 'pfote', 'stern', 'buch'], avatar: { photo: kidPhoto('jonas'), hat: 'phones', hatColor: '#3DBE5B', shirt: '#FF8A1F', hair: '#E9B949', skin: '#F6C9A6' } },
      { id: 'elif', name: 'Elif', birthYear: 2019, password: ['herz', 'geschenk', 'herz', 'diamant'], avatar: { photo: kidPhoto('elif'), hat: 'band', hatColor: '#A06BFF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' } },
      { id: 'noah', name: 'Noah', birthYear: 2016, password: ['feuer', 'blitz', 'feuer', 'blitz'], avatar: { photo: kidPhoto('noah'), hat: 'none', hatColor: '#FF4D6D', shirt: '#A06BFF', hair: '#231A4F', skin: '#7A4A2E' } },
      { id: 'mia', name: 'Mia', birthYear: 2020, password: ['krone', 'krone', 'herz', 'stern'], avatar: { photo: kidPhoto('mia'), hat: 'crown', hatColor: '#FFC531', shirt: '#FF4D6D', hair: '#C2410C', skin: '#F6C9A6' } },
      { id: 'ben', name: 'Ben', birthYear: 2015, password: ['buch', 'diamant', 'stern', 'pfote'], avatar: { photo: kidPhoto('ben'), hat: 'none', hatColor: '#FF4D6D', shirt: '#3BA7FF', hair: '#6B3E1F', skin: '#B9774E', glasses: true } },
      { id: 'emma', name: 'Emma', birthYear: 2017, password: ['geschenk', 'stern', 'geschenk', 'stern'], avatar: { photo: kidPhoto('emma'), hat: 'wizard', hatColor: '#5B47D6', shirt: '#FFC531', hair: '#E9B949', skin: '#F6C9A6' } },
      { id: 'can', name: 'Can', birthYear: 2018, password: ['blitz', 'diamant', 'feuer', 'krone'], avatar: { photo: kidPhoto('can'), hat: 'cap', hatColor: '#3BA7FF', shirt: '#3DBE5B', hair: '#231A4F', skin: '#E0A47A' } },
    ],
  },
]

/** Änderungen der Lehrkraft: neue Klassen und Kinder, Klassenwechsel, Archiv */
export type Schule = {
  klassen: string[]
  kinder: (Kid & { klasse: string })[]
  wechsel: Record<string, string>
  archiv: string[]
}
const SCHULE_KEY = 'bfk.schule'
const leer = (): Schule => ({ klassen: [], kinder: [], wechsel: {}, archiv: [] })

export function ladeSchule(): Schule {
  try { const raw = localStorage.getItem(SCHULE_KEY); return raw ? { ...leer(), ...JSON.parse(raw) } : leer() } catch { return leer() }
}

/** Alle Kinder mit ihrer Klasse, auch archivierte */
export function alleKinder(sch = ladeSchule()) {
  const basis = BASIS.flatMap((c) => c.kids.map((kid) => ({ kid, klasse: c.code })))
  return [...basis, ...sch.kinder.map(({ klasse, ...kid }) => ({ kid: kid as Kid, klasse }))]
    .map(({ kid, klasse }) => { const f = figurVon(kid.id); return { kid: f ? { ...kid, avatar: { ...kid.avatar, photo: kidPhoto(f) } } : kid, klasse: sch.wechsel[kid.id] ?? klasse, archiviert: sch.archiv.includes(kid.id) } })
}

/** Aktive Klassen mit ihren Kindern (archivierte Kinder fehlen); wird nach jeder Änderung neu gefüllt */
export const CLASSES: SchoolClass[] = []
export function klassenNeuAufbauen() {
  const sch = ladeSchule()
  const codes = [...new Set([...BASIS.map((c) => c.code), ...sch.klassen])]
  const kinder = alleKinder(sch).filter((k) => !k.archiviert)
  CLASSES.splice(0, CLASSES.length, ...codes.map((code) => ({ code, kids: kinder.filter((k) => k.klasse === code).map((k) => k.kid) })))
}
klassenNeuAufbauen()

export function speichereSchule(sch: Schule) {
  try { localStorage.setItem(SCHULE_KEY, JSON.stringify(sch)) } catch { /* ohne Speicher geht es nicht */ }
  klassenNeuAufbauen()
}

/** Benutzername eines Kindes (Beispielkinder: Vorname klein) */
export const benutzerVon = (k: Kid) => (k.benutzer ?? k.id).toLowerCase()
/** Passwort (Beispielkinder: „abakus“) */
export const passwortVon = (k: Kid) => {
  try { const eigen = localStorage.getItem(`bfk.pw.${k.id}`); if (eigen) return eigen } catch { /* ohne Speicher */ }
  return k.passwort ?? 'abakus'
}
/** Das Kind setzt selbst ein neues Passwort */
export function setzePasswort(kidId: string, pw: string) {
  try { localStorage.setItem(`bfk.pw.${kidId}`, pw.trim()) } catch { /* ohne Speicher geht es nicht */ }
}

/** Kind per Benutzername und Passwort finden (nur aktive Kinder) */
export function findeLogin(benutzer: string, passwort: string) {
  const b = benutzer.trim().toLowerCase()
  for (const c of CLASSES) for (const k of c.kids) if (benutzerVon(k) === b && passwortVon(k) === passwort.trim()) return { klasse: c, kid: k }
  return null
}

export function normalizeCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function findClass(code: string) {
  return CLASSES.find((c) => normalizeCode(c.code) === normalizeCode(code))
}

export function findKid(classCode: string, kidId: string) {
  return findClass(classCode)?.kids.find((k) => k.id === kidId)
}
