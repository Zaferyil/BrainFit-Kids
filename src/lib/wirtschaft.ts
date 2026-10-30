import { START_KOSTUEM, START_KOSTUEME, STANDARD_ARTIKEL, passt, type Artikel, type Slot } from '../data/seza'
import { getProgress, saveProgress } from './progress'
import { load, save } from './storage'

// Belohnungs-Wirtschaft für SeZa: XP (Level, nicht ausgebbar), Sterne (Shop-Währung), Diamanten (selten).
// Diamanten sind das bestehende „gems“-Guthaben im Fortschritt, XP bleibt wie bisher. Sterne sind neu.
// Perlen bleiben Punkte für Rangliste und Erfolge und werden nicht ausgegeben.
//
// Jede Änderung läuft über diese Funktionen und wird als Buchung gespeichert. Bis Supabase angebunden ist,
// liegt alles auf diesem Gerät; dort werden dieselben Funktionen zu Server-Aufrufen (RPC), damit
// Guthaben nur der Server ändert und alles auf jedem Gerät gleich ist.

export type Buchung = { id: string; zeit: string; art: 'belohnung' | 'kauf' | 'korrektur'; grund: string; sterne: number; diamanten: number; artikel?: string; von?: string }
export type Ausstattung = Partial<Record<Slot, string>>
type Konto = { sterne: number; besitz: string[]; an: Ausstattung; buchungen: Buchung[] }

/** Belohnungen, von der Lehrkraft änderbar */
export type BelohnungsArt = 'uebung' | 'lektion' | 'test' | 'buch' | 'tagesziel' | 'spiel' | 'testPerfekt' | 'welt'
export const BELOHNUNG_NAME: Record<BelohnungsArt, string> = {
  uebung: 'Übung geschafft', lektion: 'Lektion geschafft', test: 'Test bestanden', buch: 'Wissenscheck Buch', tagesziel: 'Tagesziel erreicht',
  spiel: 'Denkspiel oder Anzan geschafft (1 × am Tag je Spiel)', testPerfekt: 'Test mit 3 Sternen', welt: 'Welt geschafft',
}
export const STANDARD_BELOHNUNG: Record<BelohnungsArt, { sterne: number; diamanten: number }> = {
  uebung: { sterne: 10, diamanten: 0 }, lektion: { sterne: 25, diamanten: 0 }, test: { sterne: 30, diamanten: 0 }, buch: { sterne: 15, diamanten: 0 },
  tagesziel: { sterne: 10, diamanten: 0 }, spiel: { sterne: 5, diamanten: 0 }, testPerfekt: { sterne: 0, diamanten: 1 }, welt: { sterne: 50, diamanten: 3 },
}

type Einstellungen = { artikel: Record<string, { preis?: number; aktiv?: boolean }>; eigene: Artikel[]; belohnungen: Partial<Record<BelohnungsArt, { sterne: number; diamanten: number }>> }
const CFG_KEY = 'bfk.seza-shop'
export const shopEinstellungen = () => load<Einstellungen>(CFG_KEY, { artikel: {}, eigene: [], belohnungen: {} })
export const speichereShopEinstellungen = (e: Einstellungen) => save(CFG_KEY, e)

export function alleArtikel(mitInaktiven = false): Artikel[] {
  const e = shopEinstellungen()
  const liste = [...STANDARD_ARTIKEL, ...e.eigene].map((a) => ({ ...a, ...(e.artikel[a.id] ?? {}) }))
  return mitInaktiven ? liste : liste.filter((a) => a.aktiv !== false)
}
export const artikel = (id?: string) => (id ? [...STANDARD_ARTIKEL, ...shopEinstellungen().eigene].find((a) => a.id === id) : undefined)
export const belohnungsWert = (art: BelohnungsArt) => ({ ...STANDARD_BELOHNUNG[art], ...(shopEinstellungen().belohnungen[art] ?? {}) })

const key = (kidId: string) => `bfk.konto.${kidId}`
const leer = (): Konto => ({ sterne: 0, besitz: START_KOSTUEME.map((a) => a.id), an: { outfit: START_KOSTUEM }, buchungen: [] })
export function konto(kidId: string): Konto {
  const k = { ...leer(), ...load<Partial<Konto>>(key(kidId), {}) }
  // Demo-Konto „lena“: einmalig Startguthaben zum Ausprobieren des Shops
  if (kidId === 'lena' && !k.buchungen.some((b) => b.id === 'demo:start')) {
    k.sterne += 6000
    k.buchungen = [...k.buchungen, { id: 'demo:start', zeit: new Date().toISOString(), art: 'korrektur', grund: 'Demo-Guthaben', sterne: 6000, diamanten: 20, von: 'Demo' }]
    speichere(kidId, k)
    const p = getProgress(kidId); saveProgress(kidId, { ...p, gems: p.gems + 20 })
  }
  // die drei Start-Kostüme gehören jedem Kind; nicht mehr vorhandene Artikel fallen weg
  const besitz = [...new Set([...START_KOSTUEME.map((a) => a.id), ...k.besitz])].filter((id) => artikel(id))
  const an = Object.fromEntries(Object.entries(k.an).filter(([, id]) => artikel(id))) as Ausstattung
  return { ...k, besitz, an: an.outfit ? an : { ...an, outfit: START_KOSTUEM } }
}
/** Erster Login: hat das Kind sein Start-Kostüm schon gewählt? */
export const startGewaehlt = (kidId: string) => load<boolean>(`bfk.seza-start.${kidId}`, false)
export function startWaehlen(kidId: string, id: string) {
  const k = konto(kidId)
  if (START_KOSTUEME.some((a) => a.id === id)) speichere(kidId, { ...k, an: { ...k.an, outfit: id } })
  save(`bfk.seza-start.${kidId}`, true)
}
const speichere = (kidId: string, k: Konto) => save(key(kidId), k)

export const diamanten = (kidId: string) => getProgress(kidId).gems

/** Wer hört zu? Die Belohnungs-Anzeige (Sterne fliegen, SeZa freut sich) */
export type BelohnungsEreignis = { sterne: number; diamanten: number; text: string; level?: number }
const melden = (e: BelohnungsEreignis) => { try { window.dispatchEvent(new CustomEvent('bfk-belohnung', { detail: e })) } catch { /* ohne Fenster egal */ } }

/**
 * Belohnung gutschreiben – genau einmal je id (z. B. „lektion:1-3“).
 * Gibt die Gutschrift zurück oder null, wenn es sie schon gab.
 */
export function belohnen(kidId: string, art: BelohnungsArt, id: string, text?: string): BelohnungsEreignis | null {
  const k = konto(kidId)
  const bid = `${art}:${id}`
  if (k.buchungen.some((b) => b.id === bid)) return null
  const { sterne, diamanten: dia } = belohnungsWert(art)
  if (!sterne && !dia) return null
  const b: Buchung = { id: bid, zeit: new Date().toISOString(), art: 'belohnung', grund: BELOHNUNG_NAME[art], sterne, diamanten: dia }
  speichere(kidId, { ...k, sterne: k.sterne + sterne, buchungen: [...k.buchungen, b] })
  if (dia) { const p = getProgress(kidId); saveProgress(kidId, { ...p, gems: p.gems + dia }) }
  const e = { sterne, diamanten: dia, text: text ?? (sterne ? `Super gemacht! Du hast ${sterne} Sterne verdient!` : `Wow! Du hast ${dia} ${dia === 1 ? 'Diamant' : 'Diamanten'} bekommen!`) }
  melden(e)
  return e
}

export type KaufErgebnis = { ok: true } | { ok: false; grund: 'besitz' | 'sterne' | 'diamanten' | 'unbekannt'; fehlt?: number }

/** Kaufen: prüfen und abbuchen in einem Schritt; nie doppelt, nie ins Minus */
export function kaufen(kidId: string, id: string): KaufErgebnis {
  const a = alleArtikel().find((x) => x.id === id)
  if (!a) return { ok: false, grund: 'unbekannt' }
  const k = konto(kidId)
  if (k.besitz.includes(id)) return { ok: false, grund: 'besitz' }
  const preis = Math.max(0, Math.round(a.preis))
  if (a.waehrung === 'sterne') {
    if (k.sterne < preis) return { ok: false, grund: 'sterne', fehlt: preis - k.sterne }
  } else {
    const p = getProgress(kidId)
    if (p.gems < preis) return { ok: false, grund: 'diamanten', fehlt: preis - p.gems }
    saveProgress(kidId, { ...p, gems: p.gems - preis })
  }
  const b: Buchung = { id: `kauf:${id}`, zeit: new Date().toISOString(), art: 'kauf', grund: a.name, artikel: id,
    sterne: a.waehrung === 'sterne' ? -preis : 0, diamanten: a.waehrung === 'diamanten' ? -preis : 0 }
  speichere(kidId, { ...k, sterne: a.waehrung === 'sterne' ? k.sterne - preis : k.sterne, besitz: [...k.besitz, id], buchungen: [...k.buchungen, b] })
  return { ok: true }
}

/** Anziehen (nur, was dem Kind gehört und zum Kostüm passt) oder ausziehen */
export function anziehen(kidId: string, id: string): boolean {
  const k = konto(kidId)
  const a = artikel(id)
  if (!a || !k.besitz.includes(id)) return false
  let an: Ausstattung = { ...k.an, [a.slot]: id }
  // neues Kostüm: unpassende Accessoires ablegen
  if (a.slot === 'outfit') for (const s of Object.keys(an) as Slot[]) { const x = artikel(an[s]); if (s !== 'outfit' && x && !passt(a, x)) delete an[s] }
  else if (!passt(artikel(k.an.outfit), a)) return false
  speichere(kidId, { ...k, an })
  return true
}
export function ausziehen(kidId: string, slot: Slot) {
  if (slot === 'outfit') return
  const k = konto(kidId)
  const an = { ...k.an }
  delete an[slot]
  speichere(kidId, { ...k, an })
}

/** Lehrkraft: Guthaben nachvollziehbar korrigieren (mit Grund, wird gebucht) */
export function korrigieren(kidId: string, sterne: number, dia: number, grund: string) {
  const k = konto(kidId)
  const neuSterne = Math.max(0, k.sterne + sterne)
  const p = getProgress(kidId)
  const neuDia = Math.max(0, p.gems + dia)
  const b: Buchung = { id: `korrektur:${Date.now()}`, zeit: new Date().toISOString(), art: 'korrektur', grund: grund || 'Korrektur', sterne: neuSterne - k.sterne, diamanten: neuDia - p.gems, von: 'Lehrkraft' }
  speichere(kidId, { ...k, sterne: neuSterne, buchungen: [...k.buchungen, b] })
  saveProgress(kidId, { ...p, gems: neuDia })
}

/** Einstellungen des Kindes: Ton und Animationen */
export type KindEinstellungen = { ton: boolean; animation: boolean }
export const kindEinstellungen = (kidId: string) => load<KindEinstellungen>(`bfk.einstellungen.${kidId}`, { ton: true, animation: true })
export const speichereKindEinstellungen = (kidId: string, e: KindEinstellungen) => { save(`bfk.einstellungen.${kidId}`, e); einstellungenAnwenden(e) }
export function einstellungenAnwenden(e: KindEinstellungen) {
  try { document.documentElement.classList.toggle('ohne-animation', !e.animation); document.documentElement.classList.toggle('ohne-ton', !e.ton) } catch { /* egal */ }
}

/** Neues Level: SeZa freut sich */
export const levelAufstieg = (level: number) => melden({ sterne: 0, diamanten: 0, level, text: `Fantastisch! Du hast Level ${level} erreicht!` })
const heute = () => new Date().toISOString().slice(0, 10)
export const spielBelohnung = (kidId: string, spiel: string) => belohnen(kidId, 'spiel', `${spiel}:${heute()}`)
export const tageszielBelohnung = (kidId: string) => belohnen(kidId, 'tagesziel', heute())
