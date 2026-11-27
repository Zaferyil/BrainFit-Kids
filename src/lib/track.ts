// Werbe-Erfolgsmessung (Meta-Pixel). Die Einwilligungs- und Seitenprüfung macht /consent.js:
// ohne Marketing-Einwilligung oder außerhalb der öffentlichen Seiten (#/check, #/vorort) passiert nichts.
// Niemals E-Mail-Adressen, Namen oder Kinderdaten übergeben – nur grobe Bezeichnungen.
type Daten = Record<string, string | number>
type Meldung = (ereignis: string, daten?: Daten) => void

export const track: Meldung = (ereignis, daten) => {
  const f = (window as unknown as { bfkTrack?: Meldung }).bfkTrack
  if (f) f(ereignis, daten)
}
