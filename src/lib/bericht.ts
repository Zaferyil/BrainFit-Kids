import { load, save } from './storage'
import { BEREICHE, echteWerte, stufeVon, type Bereich } from './rangliste'
import { istCloudKind } from './serverRpc'
import { supabase } from './supabase'
import type { Monat } from './daily'
import type { Kid } from '../data/demo'

// Lernbericht: Fähigkeiten des Kindes, Verlauf über die Monate und Vergleich mit Kindern derselben Schulstufe.
// Der Vergleich kommt vom Server (Funktion „vergleich“): nur Mittelwerte und Verteilung, nie Namen anderer Kinder,
// und erst ab MIN_VERGLEICH Kindern.

export const FAEHIGKEITEN = BEREICHE.filter((b) => b.id !== 'gesamt') as { id: Exclude<Bereich, 'gesamt'>; name: string; text: string }[]
export type Werte = Record<Exclude<Bereich, 'gesamt'>, number>
export const MIN_VERGLEICH = 5

const monatJetzt = () => new Date().toISOString().slice(0, 7)

/** Aktuelle Fähigkeiten speichern (für den Monatsverlauf und den Vergleich auf dem Server) */
export function berichtAktualisieren(kid: Kid): Werte {
  const alle = echteWerte(kid)
  const w = Object.fromEntries(FAEHIGKEITEN.map((f) => [f.id, alle[f.id]])) as Werte
  save(`bfk.werte.${kid.id}`, { ...w, stufe: stufeVon(kid), stand: new Date().toISOString().slice(0, 10) })
  const vk = `bfk.verlauf.${kid.id}`, v = load<Record<string, Monat>>(vk, {}), m = monatJetzt()
  const leer: Monat = { minuten: 0, aufgaben: 0, stationen: 0, spiele: 0, tage: [] }
  save(vk, { ...v, [m]: { ...(v[m] ?? leer), werte: w } })
  return w
}

export function verlauf(kidId: string): [string, Monat][] {
  return Object.entries(load<Record<string, Monat>>(`bfk.verlauf.${kidId}`, {})).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
}

export type Vergleich = { n: number; mittel?: Werte; werte?: Record<string, number[]> }

/** Vergleichsgruppe derselben Schulstufe vom Server (nur für angemeldete Cloud-Kinder) */
export async function vergleichLaden(kid: Kid): Promise<Vergleich | null> {
  if (!istCloudKind(kid.id)) return null
  const { data, error } = await supabase.rpc('vergleich', { p_kind: kid.id })
  if (error) return null
  return data as Vergleich
}

/** Anteil der Vergleichskinder, die weniger erreicht haben (0–100) */
export function perzentil(wert: number, alle: number[] = []) {
  if (!alle.length) return 0
  const unter = alle.filter((x) => x < wert).length + alle.filter((x) => x === wert).length / 2
  return Math.round((unter / alle.length) * 100)
}

/** Pädagogische Einschätzung in Elternsprache aus den Werten */
export function einschaetzung(w: Werte, name: string, mittel?: Werte) {
  const sortiert = [...FAEHIGKEITEN].sort((a, b) => w[b.id] - w[a.id])
  const geuebt = sortiert.filter((f) => w[f.id] > 0)
  if (!geuebt.length) return { staerke: null, foerdern: null, text: `${name} startet gerade. Nach den ersten Lektionen und Denkspielen zeigt dieser Bericht Stärken und Fortschritte.` }
  const staerke = geuebt[0], foerdern = sortiert[sortiert.length - 1]
  const tipps: Record<string, string> = {
    rechnen: 'Rechnen Sie im Alltag kleine Aufgaben gemeinsam im Kopf – beim Einkaufen oder im Auto.',
    tempo: 'Kurze, schnelle Runden (z. B. Blitz-Abakus) 2–3 Minuten am Tag steigern das Tempo spielerisch.',
    konzentration: 'Feste Lernzeit ohne Ablenkung (Handy weg, ruhiger Platz) hilft der Konzentration am meisten.',
    aufmerksamkeit: 'Spiele wie „Muster“ und „Zahlen vergleichen“ trainieren genaues Hinsehen.',
    gedaechtnis: 'Zahlen merken und Perlen-Kette regelmäßig üben – das Arbeitsgedächtnis wächst mit.',
  }
  const vergl = mittel ? (w[staerke.id] >= mittel[staerke.id] ? ' – über dem Durchschnitt der Schulstufe' : '') : ''
  return {
    staerke, foerdern,
    text: `${name}s Stärke ist ${staerke.name}${vergl}. Am meisten Potenzial gibt es bei ${foerdern.name}. ${tipps[foerdern.id] ?? ''}`,
  }
}
