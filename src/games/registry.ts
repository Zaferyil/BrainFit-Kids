import type { IconName } from '../components/Icon'
import type { Tier } from './engine'

export type Area = 'gedaechtnis' | 'konzentration' | 'logik' | 'raum' | 'tempo' | 'flex'

export const AREAS: { id: Area; name: string; text: string; icon: IconName; color: string }[] = [
  { id: 'gedaechtnis', name: 'Gedächtnis', text: 'Merken und erinnern', icon: 'brain', color: '#A06BFF' },
  { id: 'konzentration', name: 'Konzentration', text: 'Genau hinschauen', icon: 'target', color: '#FF8A1F' },
  { id: 'logik', name: 'Logik', text: 'Muster und Regeln finden', icon: 'bulb', color: '#FFC531' },
  { id: 'raum', name: 'Raumdenken', text: 'Formen drehen und legen', icon: 'image', color: '#3BA7FF' },
  { id: 'tempo', name: 'Tempo', text: 'Schnell sehen und tippen', icon: 'bolt', color: '#3DBE5B' },
  { id: 'flex', name: 'Flexibilität', text: 'Regeln wechseln', icon: 'refresh', color: '#FF5C8A' },
]

/** Kategorien im Denk-Park = Bereiche im Lernbericht und in der Rangliste (eine Quelle für beides) */
export type Kategorie = 'rechnen' | 'tempo' | 'konzentration' | 'aufmerksamkeit' | 'gedaechtnis' | 'raum' | 'flex'
export const KATEGORIEN: { id: Kategorie; name: string; text: string; icon: IconName; color: string; bericht: boolean }[] = [
  { id: 'rechnen', name: 'Mathe-Spiele', text: 'Rechnen mit dem Abakus', icon: 'bars', color: '#5B47D6', bericht: true },
  { id: 'tempo', name: 'Tempo-Spiele', text: 'Blitzschnell sehen und zählen', icon: 'bolt', color: '#3DBE5B', bericht: true },
  { id: 'gedaechtnis', name: 'Gedächtnis-Spiele', text: 'Merken und erinnern', icon: 'brain', color: '#A06BFF', bericht: true },
  { id: 'konzentration', name: 'Konzentrations-Spiele', text: 'Genau hinschauen, nicht ablenken lassen', icon: 'target', color: '#FF8A1F', bericht: true },
  { id: 'aufmerksamkeit', name: 'Logik-Spiele', text: 'Muster erkennen und vergleichen', icon: 'bulb', color: '#FFC531', bericht: true },
  { id: 'raum', name: 'Raumdenken', text: 'Formen drehen und legen', icon: 'image', color: '#3BA7FF', bericht: false },
  { id: 'flex', name: 'Flexibles Denken', text: 'Regeln wechseln', icon: 'refresh', color: '#FF5C8A', bericht: false },
]
const KATEGORIE_VON: Record<string, Kategorie> = {
  memory: 'gedaechtnis', kette: 'gedaechtnis', bildermerken: 'gedaechtnis', zahlenmerken: 'gedaechtnis', blitzabakus: 'gedaechtnis',
  jagd: 'konzentration', detektiv: 'konzentration', stopp: 'konzentration', farbwort: 'konzentration',
  muster: 'aufmerksamkeit', sudoku: 'aufmerksamkeit', waage: 'aufmerksamkeit', vergleich: 'aufmerksamkeit',
  abakusrechnen: 'rechnen',
  sorobankarten: 'tempo', schnellzaehlen: 'tempo', sortierer: 'tempo', symbol: 'tempo', rennen: 'tempo',
  tangram: 'raum', spiegel: 'raum', wuerfel: 'raum',
  regel: 'flex', labyrinth: 'flex',
}
export const kategorieVon = (spielId: string): Kategorie => KATEGORIE_VON[spielId] ?? 'aufmerksamkeit'
/** frühere Aktivitäts-Schlüssel (alte Bereiche) auf die neuen Kategorien abbilden */
export const ALTE_BEREICHE: Record<string, Kategorie> = { logik: 'aufmerksamkeit', flex: 'konzentration' }
/** spielbare Spiele einer Kategorie */
export const spieleIn = (k: Kategorie) => GAMES.filter((g) => g.ready && kategorieVon(g.id) === k).map((g) => g.id)

export type GameMeta = { id: string; name: string; area: Area; minTier: Tier; text: string; ready: boolean }

export const GAMES: GameMeta[] = [
  { id: 'memory', name: 'Perlen-Memory', area: 'gedaechtnis', minTier: 'A', text: 'Finde die Paare', ready: true },
  { id: 'kette', name: 'Perlen-Kette', area: 'gedaechtnis', minTier: 'A', text: 'Merk dir die Reihenfolge', ready: true },
  { id: 'bildermerken', name: 'Bilder merken', area: 'gedaechtnis', minTier: 'A', text: 'Welche Karte hast du gesehen?', ready: true },
  { id: 'zahlenmerken', name: 'Zahlen merken', area: 'gedaechtnis', minTier: 'A', text: 'Merk dir die Ziffern', ready: true },
  { id: 'blitzabakus', name: 'Blitz-Abakus', area: 'gedaechtnis', minTier: 'B', text: 'Welche Zahl hat geblitzt?', ready: false },
  { id: 'jagd', name: 'Perlen-Jagd', area: 'konzentration', minTier: 'A', text: 'Finde alle Zielperlen', ready: true },
  { id: 'detektiv', name: 'Fehler-Detektiv', area: 'konzentration', minTier: 'A', text: 'Finde die Unterschiede', ready: false },
  { id: 'stopp', name: 'Stopp-Perle', area: 'konzentration', minTier: 'B', text: 'Grün tippen, Rot nicht', ready: false },
  { id: 'muster', name: 'Muster-Meister', area: 'logik', minTier: 'A', text: 'Was kommt als Nächstes?', ready: true },
  { id: 'sudoku', name: 'Perlen-Sudoku', area: 'logik', minTier: 'B', text: 'Jede Perle einmal', ready: false },
  { id: 'waage', name: 'Waage-Rätsel', area: 'logik', minTier: 'C', text: 'Was ist schwerer?', ready: false },
  { id: 'abakusrechnen', name: 'Abakus-Rechnen', area: 'logik', minTier: 'A', text: 'Plus und Minus mit dem Abakus', ready: true },
  { id: 'vergleich', name: 'Zahlen vergleichen', area: 'logik', minTier: 'A', text: 'Welcher Abakus zeigt mehr?', ready: true },
  { id: 'tangram', name: 'Perlen-Tangram', area: 'raum', minTier: 'A', text: 'Lege die Form', ready: false },
  { id: 'spiegel', name: 'Spiegel-Perlen', area: 'raum', minTier: 'B', text: 'Spiegle das Muster', ready: false },
  { id: 'wuerfel', name: 'Würfel-Welt', area: 'raum', minTier: 'C', text: 'Wie viele Würfel?', ready: false },
  { id: 'sortierer', name: 'Schnell-Sortierer', area: 'tempo', minTier: 'A', text: 'Sortiere blitzschnell', ready: false },
  { id: 'symbol', name: 'Symbol-Blitz', area: 'tempo', minTier: 'B', text: 'Finde das gleiche Zeichen', ready: false },
  { id: 'rennen', name: 'Zahlen-Rennen', area: 'tempo', minTier: 'B', text: 'Tippe der Reihe nach', ready: false },
  { id: 'sorobankarten', name: 'Soroban-Blitzkarten', area: 'tempo', minTier: 'A', text: 'Lies den Soroban blitzschnell', ready: true },
  { id: 'schnellzaehlen', name: 'Schnell zählen', area: 'tempo', minTier: 'A', text: 'Zähle die Perlen im Blitz', ready: true },
  { id: 'regel', name: 'Regel-Wechsel', area: 'flex', minTier: 'B', text: 'Farbe oder Form?', ready: false },
  { id: 'farbwort', name: 'Farb-Wort', area: 'flex', minTier: 'B', text: 'Tippe die Farbe, nicht das Wort', ready: true },
  { id: 'labyrinth', name: 'Labyrinth-Planer', area: 'flex', minTier: 'A', text: 'Plane den Weg', ready: false },
]

export const findGame = (id: string) => GAMES.find((g) => g.id === id)
