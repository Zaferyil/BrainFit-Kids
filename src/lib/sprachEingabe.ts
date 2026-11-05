// Antwort per Sprache (Web Speech API): Kind sagt die Zahl, sie wird wie getippt eingegeben.

type Erkenner = { lang: string; interimResults: boolean; maxAlternatives: number; start(): void; stop(): void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null }
const Klasse = () => (typeof window === 'undefined' ? undefined : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Erkenner) | undefined)
export const spracheMoeglich = () => !!Klasse()

const EINER: Record<string, number> = { null: 0, eins: 1, ein: 1, eine: 1, zwei: 2, zwo: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwölf: 12, dreizehn: 13, vierzehn: 14, fünfzehn: 15, sechzehn: 16, siebzehn: 17, achtzehn: 18, neunzehn: 19 }
const ZEHNER: Record<string, number> = { zwanzig: 20, dreißig: 30, dreissig: 30, vierzig: 40, fünfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90 }

/** „17", „siebzehn", „dreiundzwanzig", „hundertzwölf" → Zahl */
export function zahlAusText(t: string): number | null {
  const ziffern = t.replace(/[.\s]/g, '').match(/-?\d+/)
  if (ziffern) return Number(ziffern[0])
  let w = t.toLowerCase().replace(/[^a-zäöüß]/g, '')
  if (!w) return null
  let summe = 0
  const h = w.match(/^(.*?)hundert(.*)$/)
  if (h) { summe += (h[1] ? EINER[h[1]] ?? NaN : 1) * 100; w = h[2] }
  if (w) {
    const u = w.match(/^(.*?)und(.+)$/)
    if (u && ZEHNER[u[2]] !== undefined) summe += (EINER[u[1]] ?? NaN) + ZEHNER[u[2]]
    else summe += EINER[w] ?? ZEHNER[w] ?? NaN
  }
  return Number.isFinite(summe) ? summe : null
}

/** Hört einmal zu und liefert die erkannte Zahl (oder null) */
export function hoereZahl(): Promise<number | null> {
  const K = Klasse()
  if (!K) return Promise.resolve(null)
  return new Promise((ok) => {
    const r = new K()
    r.lang = 'de-AT'; r.interimResults = false; r.maxAlternatives = 3
    let fertig = false
    const ende = (z: number | null) => { if (!fertig) { fertig = true; ok(z) } }
    r.onresult = (e) => {
      const alt = e.results[0]
      for (let i = 0; i < alt.length; i++) { const z = zahlAusText(alt[i].transcript); if (z !== null) return ende(z) }
      ende(null)
    }
    r.onerror = () => ende(null)
    r.onend = () => ende(null)
    try { r.start() } catch { ende(null) }
    window.setTimeout(() => { try { r.stop() } catch { /* egal */ } }, 6000)
  })
}
