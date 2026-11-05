import { WORLDS } from '../data/curriculum'
import { makeSum, randomIn, rechnet, unitContent } from '../data/units'

// Druckbare Arbeitsblätter: Aufgaben einer Lektion (oder Anzan-Ketten) + Lösungsseite.
// Öffnet ein Druckfenster – dort „Als PDF speichern“ oder direkt drucken.

export type BlattArt = 'lektion' | 'kette' | 'abakus'
type Aufgabe = { text: string; loesung: number; zahl?: number }

function aufgaben(art: BlattArt, welt: number, einheit: number, anzahl: number, stellen: number, laenge: number): Aufgabe[] {
  const out: Aufgabe[] = []
  if (art === 'kette') {
    const max = 10 ** stellen - 1
    while (out.length < anzahl) {
      let s = Math.floor(Math.random() * max) + 1; const z = [s]
      for (let i = 1; i < laenge; i++) {
        const plus = Math.random() < 0.6 || s < 2
        const n = plus ? 1 + Math.floor(Math.random() * Math.min(max, max - s || 1)) : 1 + Math.floor(Math.random() * (s - 1))
        if (plus && s + n > max) { i--; continue }
        z.push(plus ? n : -n); s += plus ? n : -n
      }
      out.push({ text: z.map((n, i) => (i === 0 ? String(n) : n < 0 ? `− ${-n}` : `+ ${n}`)).join('\n'), loesung: s })
    }
    return out
  }
  const c = unitContent(welt, einheit)
  if (!c) return out
  let prev: number | undefined
  while (out.length < anzahl) {
    if (art === 'lektion' && rechnet(c)) { const s = makeSum(c, prev); prev = s.a; out.push({ text: s.b ? `${s.a} + ${s.b} =` : `${s.a}`, loesung: s.a + s.b }) }
    else { const n = randomIn(c.range, prev); prev = n; out.push({ text: '', loesung: n, zahl: n }) }
  }
  return out
}

/** leerer Soroban (zum Einzeichnen) bzw. mit Zahl */
function sorobanSvg(stellen: number, zahl?: number) {
  const w = 34 * stellen + 16, h = 118
  const ziffern = zahl === undefined ? [] : String(zahl).padStart(stellen, '0').split('').map(Number)
  let s = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="8" fill="none" stroke="#333" stroke-width="3"/><line x1="2" x2="${w - 2}" y1="38" y2="38" stroke="#333" stroke-width="3"/>`
  for (let c = 0; c < stellen; c++) {
    const x = 8 + 17 + c * 34
    s += `<line x1="${x}" x2="${x}" y1="4" y2="${h - 4}" stroke="#999" stroke-width="2"/>`
    if (zahl !== undefined) {
      const d = ziffern[c], oben = d >= 5, unten = d % 5
      s += `<ellipse cx="${x}" cy="${oben ? 30 : 14}" rx="13" ry="7" fill="${oben ? '#444' : '#fff'}" stroke="#444" stroke-width="1.5"/>`
      for (let i = 0; i < 4; i++) s += `<ellipse cx="${x}" cy="${i < unten ? 48 + i * 15 : 58 + i * 15}" rx="13" ry="7" fill="${i < unten ? '#444' : '#fff'}" stroke="#444" stroke-width="1.5"/>`
    }
  }
  return s + '</svg>'
}

export function arbeitsblattDrucken(o: { art: BlattArt; welt: number; einheit: number; anzahl: number; stellen: number; laenge: number; name?: string }) {
  const liste = aufgaben(o.art, o.welt, o.einheit, o.anzahl, o.stellen, o.laenge)
  const titel = o.art === 'kette' ? `Anzan-Ketten · ${o.stellen}-stellig · ${o.laenge} Zahlen` : `${WORLDS[o.welt - 1]?.units[o.einheit - 1] ?? ''}${o.art === 'abakus' ? ' · Abakus ablesen' : ''}`
  const cols = o.art === 'kette' ? 5 : o.art === 'abakus' ? 4 : 3
  const stellenAbakus = Math.max(2, String(Math.max(...liste.map((a) => a.loesung), 9)).length)
  const zelle = (a: Aufgabe, i: number, loesung: boolean) => {
    const nr = `<span class="nr">${i + 1}</span>`
    if (o.art === 'kette') return `<div class="z kette">${nr}<pre>${a.text}</pre><div class="linie">${loesung ? a.loesung : ''}</div></div>`
    if (a.zahl !== undefined) return `<div class="z">${nr}${sorobanSvg(stellenAbakus, a.zahl)}<div class="linie">${loesung ? a.loesung : ''}</div></div>`
    return `<div class="z">${nr}<span class="auf">${a.text}</span><span class="linie kurz">${loesung ? a.loesung : ''}</span></div>`
  }
  const seite = (loesung: boolean) => `<section class="seite"><header><div><h1>${loesung ? 'Lösungen' : 'Arbeitsblatt'}</h1><p>${titel}</p></div><div class="kopf">Name: ________________<br>Datum: ____________</div></header>
<div class="raster" style="grid-template-columns:repeat(${cols},1fr)">${liste.map((a, i) => zelle(a, i, loesung)).join('')}</div>
<footer>BrainFit Kids · Mentale Arithmetik mit dem Soroban · brainfitkids.mentalmath.at</footer></section>`
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Arbeitsblatt – ${titel}</title><style>
@page { size: A4; margin: 14mm; } body { font-family: Nunito, Arial, sans-serif; color: #1B1446; margin: 0; }
.seite { page-break-after: always; } .seite:last-child { page-break-after: auto; }
header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #4B2FC2; padding-bottom: 8px; margin-bottom: 16px; }
h1 { margin: 0; font-size: 26px; color: #4B2FC2; } header p { margin: 2px 0 0; font-weight: 700; } .kopf { font-size: 14px; line-height: 1.9; text-align: right; }
.raster { display: grid; gap: 14px 18px; } .z { position: relative; border: 1.5px solid #CFC8EE; border-radius: 10px; padding: 14px 10px 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; break-inside: avoid; }
.nr { position: absolute; left: 6px; top: 4px; font-size: 11px; color: #7A6FB3; font-weight: 800; }
.auf { font-size: 24px; font-weight: 800; } .linie { min-width: 70px; border-bottom: 2px solid #1B1446; text-align: center; font-size: 22px; font-weight: 800; min-height: 28px; color: #D6336C; }
pre { font: 800 20px Nunito, Arial, sans-serif; margin: 0; text-align: right; line-height: 1.35; }
.z:not(.kette):has(.auf) { flex-direction: row; justify-content: center; } footer { margin-top: 18px; font-size: 11px; color: #7A6FB3; text-align: center; }
</style></head><body>${seite(false)}${seite(true)}<script>window.onload=()=>setTimeout(()=>print(),300)</script></body></html>`
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open(); w.document.write(html); w.document.close()
  return true
}
