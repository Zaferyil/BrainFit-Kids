// Prüft die Zahlengrenzen für Kindergarten und 1. Klasse: einstellig, wo es geht (Zahlen, Little Friends);
// Big/Best Friends in Welt 1–3 höchstens 29, in Welt 4–6 höchstens 99. Gratis-Check: immer einstellig.
// Aufruf: node scripts/einstellig-pruefen.mjs  → listet jede Verletzung; Exit 1, wenn es welche gibt.
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const fehler = []
const bericht = []
try {
  const units = await server.ssrLoadModule('/src/data/units.ts')
  const { kette, kettenLaenge } = await server.ssrLoadModule('/src/data/uebungen.ts')
  const { WORLDS } = await server.ssrLoadModule('/src/data/curriculum.ts')
  const { kursAufgaben } = await server.ssrLoadModule('/src/data/kurs.ts')
  const { anzanTestAufgaben } = await server.ssrLoadModule('/src/data/anzanTest.ts')
  const check = await server.ssrLoadModule('/src/lib/check.ts')
  const { KLASSEN } = await server.ssrLoadModule('/src/lib/klasse.ts')
  const N = 400
  for (const stufe of [0, 1]) {
    const name = KLASSEN[stufe].name
    const k = KLASSEN[stufe]
    for (const w of WORLDS) {
      w.units.forEach((titel, i) => {
        const roh = units.unitContent(w.n, i + 1)
        if (!roh) return
        const c = units.fuerStufe(roh, w.n, stufe)
        const grenze = units.zahlGrenze(roh, w.n, stufe)
        let maxZahl = 0, maxErg = 0, minErg = 99, beispiel = ''
        const merke = (zahlen, erg, text) => {
          const z = Math.max(...zahlen.map(Math.abs))
          if (z > maxZahl) maxZahl = z
          if (erg > maxErg) { maxErg = erg; beispiel = text }
          if (erg < minErg) minErg = erg
        }
        for (let n = 0; n < N; n++) {
          if (units.rechnet(c)) { const s = units.makeSum(c); merke([s.a, s.b], s.n, `${s.a}${s.b < 0 ? '' : '+'}${s.b}=${s.n}`) }
          else { const z = units.randomIn(c.range); merke([z], z, `Zahl ${z}`) }
          const kt = kette(c, kettenLaenge(k.aufgaben)); merke(kt.zahlen, kt.antwort, `Kette ${kt.zahlen.join(',')}=${kt.antwort}`)
        }
        const kurs = k.aufgaben <= 6 ? null : kursAufgaben(w.n, i + 1)
        if (kurs) for (const a of kurs) merke([a.zahl ?? 0], a.zahl ?? 0, 'Kurs')
        if (maxZahl > grenze || maxErg > grenze || minErg < 0) fehler.push({ stufe: name, lektion: `W${w.n}-L${i + 1} ${titel}`, grenze, maxZahl, maxErg, minErg, beispiel })
        bericht.push(`${name.padEnd(9)} W${w.n}-L${String(i + 1).padEnd(2)} ${titel.padEnd(30)} Grenze ${String(grenze).padStart(2)} · größte Zahl ${maxZahl} · größtes Ergebnis ${maxErg} · z. B. ${beispiel}`)
      })
      for (const nr of [1, 2]) {
        const g = w.n === 2 ? 9 : w.n <= 3 ? 29 : 99
        let z = 0, e = 0, zw = 0, anzahl = 99, bsp = ''
        for (let r = 0; r < 40; r++) {
          const t = anzanTestAufgaben(w.n, nr, g); anzahl = Math.min(anzahl, t.length)
          for (const a of t) { let v = 0; for (const x of a.numbers) { v += x; zw = Math.max(zw, v) } z = Math.max(z, ...a.numbers.map(Math.abs)); if (a.answer > e) { e = a.answer; bsp = `${a.numbers.join(',')}=${a.answer}` } }
        }
        bericht.push(`${name.padEnd(9)} W${w.n} Anzan-Test ${nr}                     Grenze ${String(g).padStart(2)} · größte Zahl ${z} · größter Zwischenstand ${zw} · Aufgaben ${anzahl}/5 · z. B. ${bsp}`)
        if (anzahl < 5) fehler.push({ stufe: name, lektion: `W${w.n} Anzan-Test ${nr}`, problem: `nur ${anzahl} Aufgaben` })
        if (z > g || zw > g) fehler.push({ stufe: name, lektion: `W${w.n} Anzan-Test ${nr}`, grenze: g, maxZahl: z, maxZwischen: zw, beispiel: bsp })
      }
    }
    // Gratis-Check der Website
    let m = 0, bsp = ''
    for (let n = 0; n < N; n++) { const r = check.rechenaufgabe(stufe); const z = Math.max(r.loesung, ...r.text.split(/[+−]/).map((x) => Number(x))); if (z > m) { m = z; bsp = `${r.text}=${r.loesung}` } }
    if (m > 9) fehler.push({ stufe: name, lektion: 'Kopfrechnen-Check: Rechnen', maxZahl: m, beispiel: bsp })
    if (check.abakusStellen(stufe) > 1) fehler.push({ stufe: name, lektion: 'Kopfrechnen-Check: Abakus', maxZahl: 10 ** check.abakusStellen(stufe) - 1 })
    if (check.blitzStellen(stufe) > 1) fehler.push({ stufe: name, lektion: 'Kopfrechnen-Check: Blitzzahlen', maxZahl: 10 ** check.blitzStellen(stufe) - 1 })
  }
} finally {
  await server.close()
}
if (process.argv.includes('--bericht')) for (const b of bericht) console.log(b)
for (const f of fehler) console.log(JSON.stringify(f))
console.log(fehler.length ? `${fehler.length} Verletzungen der Zahlengrenzen` : 'OK: Kindergarten und 1. Klasse halten alle Zahlengrenzen ein')
process.exit(fehler.length ? 1 : 0)
