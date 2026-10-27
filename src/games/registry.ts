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

export type GameMeta = { id: string; name: string; area: Area; minTier: Tier; text: string; ready: boolean }

export const GAMES: GameMeta[] = [
  { id: 'memory', name: 'Perlen-Memory', area: 'gedaechtnis', minTier: 'A', text: 'Finde die Paare', ready: true },
  { id: 'kette', name: 'Perlen-Kette', area: 'gedaechtnis', minTier: 'A', text: 'Merk dir die Reihenfolge', ready: true },
  { id: 'zahlenmerken', name: 'Zahlen merken', area: 'gedaechtnis', minTier: 'A', text: 'Merk dir die Ziffern', ready: true },
  { id: 'blitzabakus', name: 'Blitz-Abakus', area: 'gedaechtnis', minTier: 'B', text: 'Welche Zahl hat geblitzt?', ready: false },
  { id: 'jagd', name: 'Perlen-Jagd', area: 'konzentration', minTier: 'A', text: 'Finde alle Zielperlen', ready: true },
  { id: 'detektiv', name: 'Fehler-Detektiv', area: 'konzentration', minTier: 'A', text: 'Finde die Unterschiede', ready: false },
  { id: 'stopp', name: 'Stopp-Perle', area: 'konzentration', minTier: 'B', text: 'Grün tippen, Rot nicht', ready: false },
  { id: 'muster', name: 'Muster-Meister', area: 'logik', minTier: 'A', text: 'Was kommt als Nächstes?', ready: true },
  { id: 'sudoku', name: 'Perlen-Sudoku', area: 'logik', minTier: 'B', text: 'Jede Perle einmal', ready: false },
  { id: 'waage', name: 'Waage-Rätsel', area: 'logik', minTier: 'C', text: 'Was ist schwerer?', ready: false },
  { id: 'vergleich', name: 'Zahlen vergleichen', area: 'logik', minTier: 'A', text: 'Welcher Abakus zeigt mehr?', ready: true },
  { id: 'tangram', name: 'Perlen-Tangram', area: 'raum', minTier: 'A', text: 'Lege die Form', ready: false },
  { id: 'spiegel', name: 'Spiegel-Perlen', area: 'raum', minTier: 'B', text: 'Spiegle das Muster', ready: false },
  { id: 'wuerfel', name: 'Würfel-Welt', area: 'raum', minTier: 'C', text: 'Wie viele Würfel?', ready: false },
  { id: 'sortierer', name: 'Schnell-Sortierer', area: 'tempo', minTier: 'A', text: 'Sortiere blitzschnell', ready: false },
  { id: 'symbol', name: 'Symbol-Blitz', area: 'tempo', minTier: 'B', text: 'Finde das gleiche Zeichen', ready: false },
  { id: 'rennen', name: 'Zahlen-Rennen', area: 'tempo', minTier: 'B', text: 'Tippe der Reihe nach', ready: false },
  { id: 'schnellzaehlen', name: 'Schnell zählen', area: 'tempo', minTier: 'A', text: 'Zähle die Perlen im Blitz', ready: true },
  { id: 'regel', name: 'Regel-Wechsel', area: 'flex', minTier: 'B', text: 'Farbe oder Form?', ready: false },
  { id: 'farbwort', name: 'Farb-Wort', area: 'flex', minTier: 'B', text: 'Tippe die Farbe, nicht das Wort', ready: true },
  { id: 'labyrinth', name: 'Labyrinth-Planer', area: 'flex', minTier: 'A', text: 'Plane den Weg', ready: false },
]

export const findGame = (id: string) => GAMES.find((g) => g.id === id)
