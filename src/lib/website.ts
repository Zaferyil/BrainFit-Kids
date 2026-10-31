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

// ───────────── Bestellungen (nur Admins dürfen lesen) ─────────────
export type Bestellung = {
  session: string; datum: string; mail: string; elternName: string; paket: string; takt: 'monat' | 'jahr'
  betrag: number; kindVorname: string; kindBenutzer: string; kindStufe: number | null; kindSeit: string | null; status: string; test: boolean
}

// Gründerpreise wie auf der Website (Stripe-Preise)
const PREIS: Record<string, { monat: number; jahr: number }> = { basic: { monat: 49, jahr: 490 }, plus: { monat: 79, jahr: 790 }, premium: { monat: 99, jahr: 990 } }

export async function bestellungenLaden(): Promise<Bestellung[]> {
  const { data: b, error } = await supabase.from('bestellungen').select('*').order('erstellt', { ascending: false })
  if (error) throw error
  const kindIds = (b ?? []).map((x) => x.kind).filter(Boolean)
  const { data: k } = kindIds.length ? await supabase.from('kinder').select('id, vorname, benutzer, stufe, eltern, erstellt').in('id', kindIds) : { data: [] }
  const elternIds = (k ?? []).map((x) => x.eltern).filter(Boolean)
  const { data: p } = elternIds.length ? await supabase.from('personen').select('id, name').in('id', elternIds) : { data: [] }
  const kinder = new Map((k ?? []).map((x) => [x.id, x]))
  const namen = new Map((p ?? []).map((x) => [x.id, x.name as string]))
  return (b ?? []).map((x) => {
    const kind = x.kind ? kinder.get(x.kind) : undefined
    const takt = x.takt === 'jahr' ? 'jahr' : 'monat'
    return {
      session: x.stripe_session, datum: x.erstellt, mail: x.eltern_mail, elternName: (kind?.eltern && namen.get(kind.eltern)) || '',
      paket: x.paket, takt, betrag: PREIS[x.paket]?.[takt] ?? 0,
      kindVorname: kind?.vorname ?? x.kind_vorname ?? '', kindBenutzer: kind?.benutzer ?? x.kind_benutzer ?? '', kindStufe: kind?.stufe ?? x.kind_stufe ?? null,
      kindSeit: kind?.erstellt ?? null, status: x.status, test: String(x.stripe_session).startsWith('cs_test_'),
    }
  })
}
