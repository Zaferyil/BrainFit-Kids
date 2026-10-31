// Website-Einstellungen (Countdown, Kampagnen-Popup): eine Zeile in der Tabelle „website“, nur Admins dürfen ändern
import { supabase } from './supabase'

export type Countdown = { an: boolean; ende: string; titel: string; fuss: string; balken: number }
export type Popup = { an: boolean; titel: string; text: string; knopf: string; code: string; ab: string; bis: string; sekunden: number }
export type WebsiteDaten = { countdown: Countdown; popup: Popup }

export const STANDARD: WebsiteDaten = {
  countdown: { an: true, ende: '2026-11-30T23:59', titel: 'Jetzt Gründerpreis sichern – nur noch kurze Zeit!', fuss: 'Nur für die ersten 50 Familien · noch 37 Plätze', balken: 26 },
  popup: { an: false, titel: '', text: '', knopf: 'Zu den Paketen', code: '', ab: '', bis: '', sekunden: 8 },
}

export async function websiteLaden(): Promise<WebsiteDaten> {
  const { data, error } = await supabase.from('website').select('daten').eq('id', 1).maybeSingle()
  if (error) throw error
  const d = (data?.daten ?? {}) as Partial<WebsiteDaten>
  return { countdown: { ...STANDARD.countdown, ...d.countdown }, popup: { ...STANDARD.popup, ...d.popup } }
}

export async function websiteSpeichern(daten: WebsiteDaten) {
  const { error } = await supabase.from('website').upsert({ id: 1, daten, geaendert: new Date().toISOString() })
  if (error) throw error
}
