// Website-Einstellungen (Countdown, Kampagnen-Popup): eine Zeile in der Tabelle „website“, nur Admins dürfen ändern
import { supabase } from './supabase'

export type Countdown = { an: boolean; ende: string; titel: string; fuss: string; balken: number }
export type Popup = { an: boolean; titel: string; text: string; knopf: string; code: string; ab: string; bis: string; sekunden: number; bildAn: boolean; bild: string; uhrAn: boolean; uhrEnde: string }
export type Preis = { monat: number; jahr: number; altMonat: number; altJahr: number; hinweis: string; linkMonat: string; linkJahr: string }
export type PaketKey = 'basic' | 'plus' | 'premium'
export type WebsiteDaten = { countdown: Countdown; popup: Popup; preise: Record<PaketKey, Preis> }

export const STANDARD: WebsiteDaten = {
  countdown: { an: true, ende: '2026-11-30T23:59', titel: 'Jetzt Gründerpreis sichern – nur noch kurze Zeit!', fuss: 'Nur für die ersten 50 Familien · noch 37 Plätze', balken: 26 },
  popup: { an: false, titel: '', text: '', knopf: 'Zu den Paketen', code: '', ab: '', bis: '', sekunden: 8, bildAn: false, bild: '', uhrAn: false, uhrEnde: '' },
  preise: {
    basic: { monat: 49, jahr: 490, altMonat: 79, altJahr: 790, hinweis: 'Mindestlaufzeit 12 Monate · Aktionspreis für die ersten 50', linkMonat: 'https://buy.stripe.com/00w7sMafb8SUa6Z9WX9oc00', linkJahr: 'https://buy.stripe.com/aFafZi873glm3IB1qr9oc01' },
    plus: { monat: 79, jahr: 790, altMonat: 109, altJahr: 1090, hinweis: 'Mindestlaufzeit 12 Monate', linkMonat: 'https://buy.stripe.com/8x2dRa1IFfhienfgll9oc02', linkJahr: 'https://buy.stripe.com/dRmcN61IF3yAfrj0mn9oc03' },
    premium: { monat: 99, jahr: 990, altMonat: 129, altJahr: 1290, hinweis: 'Mindestlaufzeit 12 Monate', linkMonat: 'https://buy.stripe.com/3cIbJ20EBglmfrj5GH9oc04', linkJahr: 'https://buy.stripe.com/fZufZi1IF1qs4MFfhh9oc05' },
  },
}

export async function websiteLaden(): Promise<WebsiteDaten> {
  const { data, error } = await supabase.from('website').select('daten').eq('id', 1).maybeSingle()
  if (error) throw error
  const d = (data?.daten ?? {}) as Partial<WebsiteDaten>
  const preise = { ...STANDARD.preise }
  for (const k of ['basic', 'plus', 'premium'] as PaketKey[]) preise[k] = { ...STANDARD.preise[k], ...d.preise?.[k] }
  return { countdown: { ...STANDARD.countdown, ...d.countdown }, popup: { ...STANDARD.popup, ...d.popup }, preise }
}

// Bild für das Popup hochladen (Supabase Storage „website“), liefert die öffentliche Adresse
export async function bildHochladen(datei: File): Promise<string> {
  if (datei.size > 3 * 1024 * 1024) throw new Error('Das Bild ist größer als 3 MB.')
  const endung = (datei.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const pfad = `popup/${Date.now()}.${endung}`
  const { error } = await supabase.storage.from('website').upload(pfad, datei, { contentType: datei.type, upsert: false })
  if (error) throw error
  return supabase.storage.from('website').getPublicUrl(pfad).data.publicUrl
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

// Preise wie auf der Website (aus den Website-Einstellungen, sonst Gründerpreise)
const PREIS: Record<string, { monat: number; jahr: number }> = { basic: { monat: 49, jahr: 490 }, plus: { monat: 79, jahr: 790 }, premium: { monat: 99, jahr: 990 } }

export async function bestellungenLaden(): Promise<Bestellung[]> {
  const { data: b, error } = await supabase.from('bestellungen').select('*').order('erstellt', { ascending: false })
  try { const w = await websiteLaden(); for (const k of Object.keys(PREIS)) PREIS[k] = { monat: w.preise[k as PaketKey].monat, jahr: w.preise[k as PaketKey].jahr } } catch { /* Standardpreise */ }
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
