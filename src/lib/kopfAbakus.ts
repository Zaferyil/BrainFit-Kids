import { load, save } from './storage'

// Abakus ausblenden: Schritt für Schritt vom echten zum Kopf-Abakus.
// 0 = Abakus zeigt die Startzahl, 1 = Startzahl blass, 2 = nur leerer, blasser Abakus, 3 = kein Abakus mehr.
export const KOPF_STUFEN = [
  { name: 'Sehen', text: 'Der Abakus zeigt dir die Startzahl.' },
  { name: 'Blass', text: 'Der Abakus wird blass – schau genau hin.' },
  { name: 'Leer', text: 'Der Abakus ist leer – die Perlen sind in deinem Kopf.' },
  { name: 'Kopf', text: 'Kein Abakus mehr – du rechnest ganz im Kopf!' },
]
type Stand = { stufe: number; serie: number }
const key = (kid: string) => `bfk.kopfstufe.${kid}`

export const kopfStufe = (kid: string) => load<Stand>(key(kid), { stufe: 0, serie: 0 }).stufe

/** Nach jeder Kopfrechnen-Runde: 2× ohne Fehler → nächste Stufe, 3+ Fehler → eine Stufe zurück. Gibt -1/0/+1 zurück. */
export function kopfStufeNachRunde(kid: string, fehler: number): number {
  const s = load<Stand>(key(kid), { stufe: 0, serie: 0 })
  let d = 0
  if (fehler === 0) {
    s.serie++
    if (s.serie >= 2 && s.stufe < KOPF_STUFEN.length - 1) { s.stufe++; s.serie = 0; d = 1 }
  } else {
    s.serie = 0
    if (fehler >= 3 && s.stufe > 0) { s.stufe--; d = -1 }
  }
  save(key(kid), s)
  return d
}
