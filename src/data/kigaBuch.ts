// Kiga-Buch (Academy SeZa Einstiegsbuch, 66 Seiten): formelfreie Vorbereitung für Kindergartenkinder.
// In den ersten 10 Lektionen ab Seite 23 als Arbeitsbuch-Aufgabe; nach Lektion 10 ist das Buch fertig.
export const KIGA_BUCH: { von: number; bis: number; thema: string }[] = [
  { von: 23, bis: 26, thema: 'Zahlen am Abakus lesen' },
  { von: 27, bis: 31, thema: 'Zahlen und Perlen verbinden' },
  { von: 32, bis: 35, thema: 'Plus rechnen mit dem Abakus' },
  { von: 36, bis: 39, thema: 'Plus rechnen mit geschlossenen Augen' },
  { von: 40, bis: 43, thema: 'Plus rechnen üben' },
  { von: 44, bis: 47, thema: 'Minus rechnen mit dem Abakus' },
  { von: 48, bis: 51, thema: 'Minus rechnen mit geschlossenen Augen' },
  { von: 52, bis: 55, thema: 'Minus rechnen üben' },
  { von: 56, bis: 61, thema: 'Plus und Minus gemischt' },
  { von: 62, bis: 66, thema: 'Zahlen bis 30 und Malen' },
]
/** Aufgabe für Lektion 1–10 (über alle Welten gezählt), danach null */
export const kigaAuftrag = (lektion: number) => KIGA_BUCH[lektion - 1] ?? null
