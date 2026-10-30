import { supabase } from './supabase'
import { herunterladen, kindLokal, kontoLaden } from './cloud'
import { istCloudKind, rpc } from './serverRpc'

// Admin- und Lehrkraft-Bereich mit der Datenbank: Anmeldung (E-Mail + Passwort), alle Kinder laden,
// Kind anlegen (Edge Function „kind-anlegen“), Klasse/Archiv ändern, Guthaben korrigieren.

export type Rolle = 'admin' | 'lehrkraft'

async function meineRolle(): Promise<Rolle | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('personen').select('rolle').eq('id', user.id).maybeSingle()
  return data?.rolle === 'admin' || data?.rolle === 'lehrkraft' ? data.rolle : null
}

/** schon als Admin/Lehrkraft angemeldet? */
export const adminSitzung = () => meineRolle()

export async function adminAnmelden(email: string, passwort: string): Promise<Rolle | 'falsch' | 'keine-rolle'> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: passwort })
  if (error) return 'falsch'
  const r = await meineRolle()
  if (!r) { await supabase.auth.signOut(); return 'keine-rolle' }
  return r
}

export const adminAbmelden = () => supabase.auth.signOut()

/** alle Kinder aus der Datenbank auf dieses Gerät holen (mit Fortschritt und Konto) */
export async function alleKinderLaden() {
  const { data, error } = await supabase.from('kinder').select('id, benutzer, vorname, stufe, klasse, archiviert').order('erstellt')
  if (error) throw error
  for (const k of data ?? []) { kindLokal(k); await herunterladen(k.id) }
  return (data ?? []).length
}

async function klasseSichern(code: string) {
  if (!code || code === 'ONLINE') return null
  await supabase.from('klassen').upsert({ code }, { onConflict: 'code', ignoreDuplicates: true })
  return code
}

/** Kind in der Datenbank anlegen; gibt Benutzername und Startpasswort zurück */
export async function kindAnlegenCloud(vorname: string, klasse: string, stufe: number | null = null) {
  const code = await klasseSichern(klasse)
  const { data, error } = await supabase.functions.invoke('kind-anlegen', { body: { vorname, klasse: code, stufe } })
  if (error || !data?.benutzer) throw new Error(data?.fehler ?? error?.message ?? 'Fehler')
  kindLokal({ id: data.id, benutzer: data.benutzer, vorname, stufe, klasse: code })
  await herunterladen(data.id)
  return data as { id: string; benutzer: string; passwort: string }
}

export async function klasseCloud(kidId: string, klasse: string) {
  if (!istCloudKind(kidId)) return
  const code = await klasseSichern(klasse)
  await supabase.from('kinder').update({ klasse: code }).eq('id', kidId)
}
export async function archivCloud(kidId: string, archiviert: boolean) {
  if (istCloudKind(kidId)) await supabase.from('kinder').update({ archiviert }).eq('id', kidId)
}
export async function stufeCloud(kidId: string, stufe: number) {
  if (istCloudKind(kidId)) await supabase.from('kinder').update({ stufe }).eq('id', kidId)
}
export async function korrigierenCloud(kidId: string, sterne: number, diamanten: number, grund: string) {
  await rpc('korrigieren', { p_kind: kidId, p_sterne: sterne, p_diamanten: diamanten, p_grund: grund })
  await kontoLaden(kidId)
}

/** Eltern: anmelden und die eigenen Kinder laden (nur Kinder, die mit diesem Konto verknüpft sind) */
export async function elternAnmelden(email: string, passwort: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: passwort })
  if (error || !data.user) return null
  return elternKinder()
}
export async function elternKinder() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('kinder').select('id, benutzer, vorname, stufe, klasse, archiviert').eq('eltern', user.id).order('erstellt')
  for (const k of data ?? []) { kindLokal(k); await herunterladen(k.id) }
  return (data ?? []).map((k) => ({ id: k.id, name: k.vorname }))
}
export const elternPasswortVergessen = (email: string) =>
  supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/app/#eltern` })
