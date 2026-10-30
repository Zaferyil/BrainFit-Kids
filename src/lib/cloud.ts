import { supabase } from './supabase'
import { CLASSES, ladeSchule, speichereSchule, type Kid } from '../data/demo'
import { beimSpeichern, load, save } from './storage'
import { istCloudKind } from './serverRpc'

// Anmeldung über Supabase und Abgleich der Lerndaten.
// • Lerndaten (Fortschritt, Tagesziel, Hausaufgaben, Stufe, Einstellungen …) liegen als JSON in „fortschritt“.
//   Jede Änderung wird nach kurzer Pause hochgeladen; bei der Anmeldung wird der Stand vom Server geladen.
// • Sterne, Diamanten, Besitz und Ausstattung gehören dem Server (Tabellen konten/besitz/buchungen);
//   die App zeigt eine Kopie, die bei der Anmeldung und nach Käufen neu geladen wird.

const KLASSE = 'ONLINE'
const KONTO = (id: string) => `bfk.konto.${id}`

/** alle Schlüssel dieses Kindes außer dem Konto (das gehört dem Server) */
function lernSchluessel(kidId: string) {
  const out: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!
    if (k.startsWith('bfk.') && k.endsWith(`.${kidId}`) && k !== KONTO(kidId)) out.push(k)
  }
  return out
}

export async function cloudLogin(benutzer: string, passwort: string) {
  const email = `${benutzer.trim().toLowerCase()}@kinder.brainfit-kids.at`
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwort.trim() })
  if (error || !data.user) return null
  const { data: k } = await supabase.from('kinder').select('id, benutzer, vorname, stufe').eq('id', data.user.id).maybeSingle()
  if (!k) return null

  kindLokal({ ...k, klasse: KLASSE, archiviert: false })
  await herunterladen(k.id)
  if (k.stufe !== null && k.stufe !== undefined && load(`bfk.stufe.${k.id}`, null) === null) save(`bfk.stufe.${k.id}`, k.stufe)
  const klasse = CLASSES.find((c) => c.code === KLASSE)
  const kid = klasse?.kids.find((x) => x.id === k.id)
  return klasse && kid ? { klasse, kid } : null
}

type CloudKind = { id: string; benutzer: string; vorname: string; stufe?: number | null; klasse?: string | null; archiviert?: boolean }
/** Kind aus der Datenbank auf diesem Gerät anlegen bzw. aktualisieren (Klasse, Archiv) */
export function kindLokal(k: CloudKind) {
  const sch = ladeSchule()
  const klasse = k.klasse || KLASSE
  const kid: Kid & { klasse: string } = {
    id: k.id, name: k.vorname, benutzer: k.benutzer, birthYear: new Date().getFullYear() - 8, klasse,
    password: ['stern', 'herz', 'blitz', 'krone'], avatar: { hat: 'none', hatColor: '#3BA7FF', shirt: '#3BA7FF', hair: '#231A4F', skin: '#F6C9A6' },
  }
  speichereSchule({
    ...sch,
    klassen: sch.klassen.includes(klasse) ? sch.klassen : [...sch.klassen, klasse],
    kinder: [...sch.kinder.filter((x) => x.id !== k.id), kid],
    archiv: k.archiviert ? [...new Set([...sch.archiv, k.id])] : sch.archiv.filter((x) => x !== k.id),
    wechsel: Object.fromEntries(Object.entries(sch.wechsel).filter(([id]) => id !== k.id)),
  })
}

let laeuft = false
/** Stand vom Server holen: Lerndaten und Konto */
export async function herunterladen(kidId: string) {
  laeuft = true
  try {
    const { data: f } = await supabase.from('fortschritt').select('daten').eq('kind', kidId).maybeSingle()
    for (const [k, v] of Object.entries((f?.daten ?? {}) as Record<string, unknown>)) save(k, v)
    await kontoLaden(kidId)
  } finally { laeuft = false }
}

/** Konto (Sterne, Diamanten, Besitz, Ausstattung, Buchungen) vom Server in die lokale Kopie */
export async function kontoLaden(kidId: string) {
  const [{ data: kt }, { data: bs }, { data: bu }] = await Promise.all([
    supabase.from('konten').select('sterne, diamanten, ausstattung, start_gewaehlt').eq('kind', kidId).maybeSingle(),
    supabase.from('besitz').select('artikel').eq('kind', kidId),
    supabase.from('buchungen').select('id, art, grund, sterne, diamanten, artikel, zeit').eq('kind', kidId).order('zeit'),
  ])
  const vorher = load<Record<string, unknown>>(KONTO(kidId), {})
  save(KONTO(kidId), {
    ...vorher,
    sterne: kt?.sterne ?? 0,
    besitz: (bs ?? []).map((b) => b.artikel),
    an: kt?.ausstattung ?? { outfit: 'original' },
    buchungen: (bu ?? []).map((b) => ({ ...b, zeit: b.zeit })),
  })
  if (kt?.start_gewaehlt) save(`bfk.seza-start.${kidId}`, true)
  const pk = `bfk.progress.${kidId}`
  const p = load<Record<string, unknown>>(pk, {})
  save(pk, { ...p, gems: kt?.diamanten ?? 0 })
}

// Hochladen: nach jeder Änderung an Lerndaten eines Datenbank-Kindes, gesammelt nach 2 Sekunden
const offen = new Set<string>()
let timer: number | undefined
beimSpeichern((key) => {
  if (laeuft) return
  const m = key.match(/\.([0-9a-f]{8}-[0-9a-f-]{27})$/)
  if (!m || !istCloudKind(m[1]) || key === KONTO(m[1])) return
  offen.add(m[1])
  window.clearTimeout(timer)
  timer = window.setTimeout(hochladen, 2000)
})

async function hochladen() {
  const ids = [...offen]; offen.clear()
  for (const id of ids) {
    const daten = Object.fromEntries(lernSchluessel(id).map((k) => [k, load(k, null)]))
    const { error } = await supabase.from('fortschritt').upsert({ kind: id, daten, geaendert: new Date().toISOString() })
    if (error) console.warn('Fortschritt nicht gespeichert:', error.message)
  }
}
// beim Schließen der Seite noch schnell speichern
window.addEventListener('pagehide', () => { if (offen.size) void hochladen() })

export const cloudLogout = () => supabase.auth.signOut()
