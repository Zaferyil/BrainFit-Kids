import { supabase } from './supabase'

// Kinder aus der Datenbank haben eine UUID als ID; Demo-Kinder (lena, jonas …) nicht.
export const istCloudKind = (kidId: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(kidId)

/** Server-Funktion aufrufen; Fehler nur protokollieren (die App läuft lokal weiter) */
export async function rpc<T = unknown>(name: string, args: Record<string, unknown>): Promise<T | null> {
  const { data, error } = await supabase.rpc(name, args)
  if (error) { console.warn('Server:', name, error.message); return null }
  return data as T
}
