import { supabase } from './supabase'
import { lektionNr } from './admin'

// Partner-Programm: Kontingente (Kredite) und die Kinder eines Partners.

export type Paket = 'basic' | 'plus' | 'premium'
export const PAKETE: { id: Paket; name: string; farbe: string }[] = [
  { id: 'basic', name: 'Basic', farbe: '#3BA7FF' },
  { id: 'plus', name: 'Plus', farbe: '#7B5CFF' },
  { id: 'premium', name: 'Premium', farbe: '#FF8A1F' },
]
export const paketName = (p: string | null) => PAKETE.find((x) => x.id === p)?.name ?? p ?? '—'

export type Stand = { paket: Paket; gekauft: number; verbraucht: number; frei: number; naechster_ablauf: string | null }
export type PartnerInfo = { id: string; firma: string; name: string; mail: string; telefon: string; region: string; aktiv: boolean; notiz: string; erstellt: string }
export type PartnerKind = { id: string; benutzer: string; vorname: string; stufe: number | null; paket: string | null; gueltig_bis: string | null; erstellt: string; eltern_mail: string | null; lektion: number | null; zuletzt: string | null }
export type Kredit = { id: number; partner: string; paket: Paket; anzahl: number; gueltig_bis: string; notiz: string; erstellt: string }

export async function partnerAnmelden(mail: string, pw: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: mail.trim(), password: pw })
  if (error || !data.user) return 'falsch'
  return (await partnerLaden()) ? 'ok' : 'kein-partner'
}

export async function partnerLaden(): Promise<PartnerInfo | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('partner').select('*').eq('id', user.id).maybeSingle()
  return (data as PartnerInfo) ?? null
}

export async function standLaden(partner?: string): Promise<Stand[]> {
  const { data } = await supabase.rpc('partner_stand', partner ? { p: partner } : {})
  return ((data ?? []) as Stand[]).map((s) => ({ ...s, gekauft: Number(s.gekauft), verbraucht: Number(s.verbraucht), frei: Number(s.frei) }))
}

/** Kinder eines Partners mit Lernstand (Lektion aus dem Fortschritt, letzte Aktivität) */
export async function kinderLaden(partner: string): Promise<PartnerKind[]> {
  const { data: k } = await supabase.from('kinder').select('id, benutzer, vorname, stufe, paket, gueltig_bis, erstellt, eltern_mail').eq('partner', partner).order('erstellt', { ascending: false })
  const ids = (k ?? []).map((x) => x.id)
  const { data: f } = ids.length ? await supabase.from('fortschritt').select('kind, daten, geaendert').in('kind', ids) : { data: [] }
  return (k ?? []).map((x) => {
    const fo = f?.find((y) => y.kind === x.id)
    const p = (fo?.daten as Record<string, { world?: number; unit?: number }> | undefined)?.[`bfk.progress.${x.id}`]
    return { ...x, lektion: p?.world && p?.unit ? lektionNr(p.world, p.unit) : null, zuletzt: fo?.geaendert ?? null }
  })
}

async function aufruf<T>(body: Record<string, unknown>): Promise<T & { fehler?: string }> {
  const { data, error } = await supabase.functions.invoke('partner', { body })
  if (data?.fehler) return data
  if (error) {
    // Fehlertext aus der Antwort der Funktion holen
    try { const j = await (error as { context?: Response }).context?.json(); if (j?.fehler) return j } catch { /* egal */ }
    return { fehler: 'Verbindung fehlgeschlagen. Bitte erneut versuchen.' } as T & { fehler?: string }
  }
  return data
}

export type NeuerZugang = { id: string; benutzer: string; passwort: string; bis: string; mail: boolean }
export const kindAnlegen = (d: { vorname: string; stufe: number | null; paket: Paket; eltern_mail: string; eltern_name: string }) =>
  aufruf<NeuerZugang>({ aktion: 'kind-anlegen', ...d })
export const zugangNeu = (kind: string) => aufruf<{ benutzer: string; passwort: string }>({ aktion: 'zugang-neu', kind })
export const partnerAnlegen = (d: { mail: string; name: string; firma: string; telefon: string; region: string }) =>
  aufruf<{ id: string; mail: string; passwort: string }>({ aktion: 'partner-anlegen', ...d })

export const datum = (s: string | null) => (s ? new Date(s).toLocaleDateString('de-AT') : '—')
