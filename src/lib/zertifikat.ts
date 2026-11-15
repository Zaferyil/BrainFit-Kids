import { supabase } from './supabase'
import { istCloudKind } from './serverRpc'
import { load, save } from './storage'
import { bildLaden, kappe } from '../screens/Pruefung'
import { WORLDS } from '../data/curriculum'

// Abschluss-Zertifikat nach der letzten Welt: als Bild gezeichnet, als PDF (A4 quer) gespeichert
// und – bei Online-Konten – automatisch an die E-Mail-Adresse der Eltern geschickt (Edge Function „zertifikat“).

const B = 1754, H = 1240 // A4 quer, 150 dpi

export async function zertifikatZeichnen(name: string, datum = new Date()): Promise<HTMLCanvasElement> {
  try { await document.fonts.ready } catch { /* egal */ }
  const c = document.createElement('canvas'); c.width = B; c.height = H
  const g = c.getContext('2d')!
  const bg = g.createLinearGradient(0, 0, B, H); bg.addColorStop(0, '#FFF8E1'); bg.addColorStop(1, '#EFE8FF')
  g.fillStyle = bg; g.fillRect(0, 0, B, H)
  g.strokeStyle = '#4B2FC2'; g.lineWidth = 20; g.strokeRect(44, 44, B - 88, H - 88)
  g.strokeStyle = '#FFC531'; g.lineWidth = 7; g.strokeRect(88, 88, B - 176, H - 176)
  g.textAlign = 'center'
  g.fillStyle = '#4B2FC2'; g.font = '900 120px "Baloo 2", "Fredoka", sans-serif'; g.fillText('ZERTIFIKAT', B / 2, 270)
  g.fillStyle = '#2B2257'; g.font = '700 46px "Nunito", sans-serif'; g.fillText('BrainFit Kids · Mentale Arithmetik mit dem Soroban', B / 2, 345)
  g.font = '600 48px "Nunito", sans-serif'; g.fillText('Hiermit wird bestätigt, dass', B / 2, 470)
  g.fillStyle = '#FF4D6D'; g.font = '900 140px "Baloo 2", "Fredoka", sans-serif'; g.fillText(name, B / 2, 625)
  g.fillStyle = '#2B2257'; g.font = '700 50px "Nunito", sans-serif'
  g.fillText(`alle ${WORLDS.length} Welten der Grundstufe erfolgreich abgeschlossen hat:`, B / 2, 725)
  g.font = '600 42px "Nunito", sans-serif'
  g.fillText('Plus und Minus mit Big Friends, Little Friends und Best Friends', B / 2, 790)
  // Band „Fortgeschrittene“
  g.fillStyle = '#FFC531'; g.beginPath(); g.roundRect(B / 2 - 600, 840, 1200, 110, 55); g.fill()
  g.fillStyle = '#231A4F'; g.font = '900 50px "Baloo 2", "Fredoka", sans-serif'
  g.fillText('Berechtigt zur Ausbildung für Fortgeschrittene', B / 2, 900)
  g.font = '700 34px "Nunito", sans-serif'; g.fillText('Multiplikation und Division', B / 2, 938)
  g.fillStyle = '#2B2257'; g.font = '600 38px "Nunito", sans-serif'
  g.fillText(datum.toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' }), B / 2, 1012)
  kappe(g, 250, 210, 1.15, -0.18)
  kappe(g, B - 250, 210, 1.15, 0.18)
  const logo = await bildLaden(`${import.meta.env.BASE_URL}logo.webp`)
  if (logo) { const w = 150, h = (logo.height / logo.width) * w; g.drawImage(logo, B / 2 - w / 2, H - 108 - h, w, h) }
  return c
}

/** Einfaches PDF (1 Seite A4 quer) mit dem Zertifikat als JPEG – ohne zusätzliche Bibliothek */
export function canvasZuPdf(c: HTMLCanvasElement): Uint8Array {
  const jpg = Uint8Array.from(atob(c.toDataURL('image/jpeg', 0.9).split(',')[1]), (x) => x.charCodeAt(0))
  const W = 842, Hh = 595
  const enc = new TextEncoder()
  const teile: Uint8Array[] = []; const offs: number[] = []; let laenge = 0
  const add = (x: string | Uint8Array) => { const b = typeof x === 'string' ? enc.encode(x) : x; teile.push(b); laenge += b.length }
  const inhalt = `q ${W} 0 0 ${Hh} 0 0 cm /Im0 Do Q`
  add('%PDF-1.4\n')
  const obj = (n: number, body: string | (() => void)) => { offs[n] = laenge; add(`${n} 0 obj\n`); if (typeof body === 'string') add(body); else body(); add('\nendobj\n') }
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${Hh}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`)
  obj(4, () => { add(`<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); add(jpg); add('\nendstream') })
  obj(5, `<< /Length ${inhalt.length} >>\nstream\n${inhalt}\nendstream`)
  const xref = laenge
  add(`xref\n0 6\n0000000000 65535 f \n${offs.slice(1).map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`)
  const out = new Uint8Array(laenge); let p = 0
  for (const t of teile) { out.set(t, p); p += t.length }
  return out
}

export function pdfSpeichern(pdf: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([pdf as BlobPart], { type: 'application/pdf' }))
  const a = document.createElement('a'); a.href = url; a.download = `Zertifikat-${name}.pdf`; a.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export type Versand = 'gesendet' | 'keine-eltern' | 'offline' | 'fehler'
const versandKey = (kid: string) => `bfk.zertifikat.${kid}`
export const zertifikatVersandt = (kid: string) => load<boolean>(versandKey(kid), false)

/** PDF an die Eltern schicken (nur Online-Konten mit verknüpften Eltern), höchstens einmal */
export async function zertifikatSenden(kidId: string, pdf: Uint8Array): Promise<Versand> {
  if (!istCloudKind(kidId)) return 'offline'
  if (zertifikatVersandt(kidId)) return 'gesendet'
  let bin = ''; for (let i = 0; i < pdf.length; i += 0x8000) bin += String.fromCharCode(...pdf.subarray(i, i + 0x8000))
  const { data, error } = await supabase.functions.invoke('zertifikat', { body: { pdf: btoa(bin) } })
  if (data?.status === 'gesendet') { save(versandKey(kidId), true); return 'gesendet' }
  if (data?.status === 'keine-eltern') return 'keine-eltern'
  console.warn('Zertifikat nicht gesendet', error ?? data)
  return 'fehler'
}
