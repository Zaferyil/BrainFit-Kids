import { findGame } from '../games/registry'
import { WORLDS } from '../data/curriculum'
import { getSession } from './session'
import { istCloudKind } from './serverRpc'
import { load, save } from './storage'
import { supabase } from './supabase'

// Aufträge der Lehrkraft an eine Klasse. Erledigt wird automatisch: jedes passende Spiel zählt.
// Datenbank-Tabelle „auftraege“ (supabase/update-16-auftraege.sql); ohne Datenbank (Beispiel-Klassen) auf diesem Gerät.

export type AuftragArt = 'anzan' | 'spiel' | 'wiederholen' | 'pruefung'
export type Auftrag = { id: string; klasse: string; art: AuftragArt; ziel: { anzahl?: number; level?: number; spiel?: string; welt?: number; kinder?: string[] }; titel: string; faellig: string | null }

const lokalKey = (klasse: string) => `bfk.auftraege.${klasse}`
const standKey = (kid: string) => `bfk.auftragstand.${kid}`
const cacheKey = (kid: string) => `bfk.auftragcache.${kid}`

export function auftragTitel(a: Pick<Auftrag, 'art' | 'ziel'>) {
  const n = a.ziel.anzahl ?? 1
  if (a.art === 'anzan') return `${n}× Anzan ab Level ${a.ziel.level ?? 1} (mind. 4 von 5 richtig)`
  if (a.art === 'spiel') return `${n}× ${findGame(a.ziel.spiel ?? '')?.name ?? 'Denkspiel'} spielen`
  if (a.art === 'wiederholen') return `${n}× Wiederholung machen`
  return `Prüfung ${WORLDS[(a.ziel.welt ?? 1) - 1]?.belt.replace(/en$/, '') ?? ''}er Gürtel bestehen`
}

// ---- Lehrkraft ----
export async function auftraegeLaden(klasse?: string): Promise<Auftrag[]> {
  const lokal = klasse ? load<Auftrag[]>(lokalKey(klasse), []) : []
  try {
    let q = supabase.from('auftraege').select('id, klasse, art, ziel, titel, faellig').order('erstellt', { ascending: false })
    if (klasse) q = q.eq('klasse', klasse)
    const { data, error } = await q
    if (error) throw error
    return [...(data as Auftrag[]), ...lokal]
  } catch { return lokal }
}
export async function auftragAnlegen(a: Omit<Auftrag, 'id' | 'titel'>, cloud: boolean) {
  const titel = auftragTitel(a)
  if (cloud) {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('auftraege').insert({ ...a, titel, erstellt_von: user?.id })
    if (error) throw error
    return
  }
  const alle = load<Auftrag[]>(lokalKey(a.klasse), [])
  save(lokalKey(a.klasse), [{ ...a, titel, id: `lokal-${Date.now()}` }, ...alle])
}
export async function auftragLoeschen(a: Auftrag) {
  if (a.id.startsWith('lokal-')) { save(lokalKey(a.klasse), load<Auftrag[]>(lokalKey(a.klasse), []).filter((x) => x.id !== a.id)); return }
  const { error } = await supabase.from('auftraege').delete().eq('id', a.id)
  if (error) throw error
}

/** gilt der Auftrag für dieses Kind? (ohne Auswahl: ganze Klasse) */
export const fuerKind = (a: Auftrag, kid: string) => !a.ziel.kinder?.length || a.ziel.kinder.includes(kid)

// ---- Kind ----
/** Aufträge der eigenen Klasse (Datenbank, sonst zuletzt bekannte bzw. lokale) */
export async function meineAuftraege(kid: string): Promise<Auftrag[]> {
  const klasse = getSession()?.classCode
  if (!klasse) return []
  const lokal = load<Auftrag[]>(lokalKey(klasse), [])
  if (!istCloudKind(kid)) return lokal.filter((a) => fuerKind(a, kid))
  try {
    const { data, error } = await supabase.from('auftraege').select('id, klasse, art, ziel, titel, faellig').order('erstellt', { ascending: false })
    if (error) throw error
    save(cacheKey(kid), data)
    return [...(data as Auftrag[]), ...lokal].filter((a) => fuerKind(a, kid))
  } catch { return [...load<Auftrag[]>(cacheKey(kid), []), ...lokal].filter((a) => fuerKind(a, kid)) }
}
export const auftragStand = (kid: string) => load<Record<string, number>>(standKey(kid), {})
export const erledigt = (kid: string, a: Auftrag) => (auftragStand(kid)[a.id] ?? 0) >= (a.ziel.anzahl ?? 1)

/** von rewardGame aufgerufen: passt das gerade Gespielte zu einem Auftrag? */
export function auftragMelden(kid: string, spiel: string) {
  const klasse = getSession()?.classCode
  const alle = [...load<Auftrag[]>(cacheKey(kid), []), ...(klasse ? load<Auftrag[]>(lokalKey(klasse), []) : [])]
  if (!alle.length) return
  const st = auftragStand(kid)
  let geaendert = false
  for (const a of alle) {
    if (!fuerKind(a, kid)) continue
    const passt =
      (a.art === 'anzan' && /^anzan-(\d+)$/.test(spiel) && Number(spiel.slice(6)) >= (a.ziel.level ?? 1)) ||
      (a.art === 'spiel' && spiel === a.ziel.spiel) ||
      (a.art === 'wiederholen' && spiel === 'wiederholen') ||
      (a.art === 'pruefung' && spiel === `pruefung-${a.ziel.welt}`)
    if (passt && (st[a.id] ?? 0) < (a.ziel.anzahl ?? 1)) { st[a.id] = (st[a.id] ?? 0) + 1; geaendert = true }
  }
  if (geaendert) save(standKey(kid), st)
}
