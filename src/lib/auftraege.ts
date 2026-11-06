import { findGame } from '../games/registry'
import type { BlattOptionen } from './arbeitsblatt'
import { WORLDS } from '../data/curriculum'
import { getSession } from './session'
import { istCloudKind } from './serverRpc'
import { load, save } from './storage'
import { supabase } from './supabase'

// Aufträge der Lehrkraft an eine Klasse. Erledigt wird automatisch: jedes passende Spiel zählt.
// Datenbank-Tabelle „auftraege“ (supabase/update-16-auftraege.sql); ohne Datenbank (Beispiel-Klassen) auf diesem Gerät.

export type AuftragArt = 'anzan' | 'spiel' | 'wiederholen' | 'pruefung' | 'blatt'
export type Datei = { pfad: string; name: string; typ: string }
export type Auftrag = { id: string; klasse: string; art: AuftragArt; ziel: { anzahl?: number; level?: number; spiel?: string; welt?: number; kinder?: string[]; text?: string; blatt?: BlattOptionen; datei?: Datei }; titel: string; faellig: string | null }

const lokalKey = (klasse: string) => `bfk.auftraege.${klasse}`
const standKey = (kid: string) => `bfk.auftragstand.${kid}`
const cacheKey = (kid: string) => `bfk.auftragcache.${kid}`

export function auftragTitel(a: Pick<Auftrag, 'art' | 'ziel'>) {
  const n = a.ziel.anzahl ?? 1
  if (a.art === 'blatt') return `📄 ${a.ziel.text?.trim() || (a.ziel.datei ? a.ziel.datei.name : 'Arbeitsblatt')}`
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

// ---- Dateien (eigene Arbeitsblätter der Lehrkraft) ----
export const MAX_DATEI = 10 * 1024 * 1024
export async function dateiHochladen(f: File, cloud: boolean): Promise<Datei> {
  if (f.size > MAX_DATEI) throw new Error('Die Datei ist größer als 10 MB.')
  if (!/^(application\/pdf|image\/(png|jpeg))$/.test(f.type)) throw new Error('Bitte eine PDF-, JPG- oder PNG-Datei wählen.')
  if (!cloud) {
    // Beispiel-Klassen: Datei direkt auf diesem Gerät speichern
    const url = await new Promise<string>((ok, nein) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => nein(r.error); r.readAsDataURL(f) })
    return { pfad: url, name: f.name, typ: f.type }
  }
  const pfad = `${crypto.randomUUID()}-${f.name.replace(/[^\w.-]+/g, '_')}`
  const { error } = await supabase.storage.from('hausaufgaben').upload(pfad, f, { contentType: f.type })
  if (error) throw new Error(`${error.message}. Ist supabase/update-18-hausaufgaben-dateien.sql schon eingespielt?`)
  return { pfad, name: f.name, typ: f.type }
}
export async function dateiOeffnen(d: Datei) {
  // Fenster sofort öffnen (sonst blockt der Browser), Adresse danach setzen
  const w = window.open('', '_blank')
  let url = d.pfad
  if (!d.pfad.startsWith('data:')) {
    const { data } = await supabase.storage.from('hausaufgaben').createSignedUrl(d.pfad, 3600)
    url = data?.signedUrl ?? ''
  } else {
    url = URL.createObjectURL(await (await fetch(d.pfad)).blob())
  }
  if (w) w.location.href = url; else window.location.href = url
}
/** Kind hakt ein Arbeitsblatt selbst als erledigt ab */
export function blattErledigt(kid: string, a: Auftrag) {
  const st = auftragStand(kid); st[a.id] = a.ziel.anzahl ?? 1; save(standKey(kid), st)
}
