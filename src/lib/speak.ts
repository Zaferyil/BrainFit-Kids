import manifest from '../assets/stimme/manifest.json'

// Liest Anweisungen vor – für Kinder, die noch nicht gut lesen.
// Bausteine mit Aufnahme (ElevenLabs, assets/stimme) werden nacheinander abgespielt.
// Fehlt für einen Baustein die Aufnahme, liest die Browserstimme den ganzen Satz,
// damit nicht zwei Stimmen in einem Satz sprechen.

const FILES = import.meta.glob('../assets/stimme/*.mp3', { eager: true, import: 'default' }) as Record<string, string>
const CLIPS = manifest as Record<string, string>

const clipUrl = (text: string) => {
  const file = CLIPS[text.trim()]
  return file ? FILES[`../assets/stimme/${file}`] : undefined
}

let audio: HTMLAudioElement | null = null
let run = 0

/** Gibt es für diesen Satz eine Aufnahme mit unserer Stimme? */
export const hatStimme = (text: string) => text in CLIPS

export function stopSpeaking() {
  run++
  audio?.pause()
  try { window.speechSynthesis?.cancel() } catch { /* egal */ }
}

function playClip(url: string, id: number) {
  return new Promise<void>((resolve) => {
    if (id !== run) return resolve()
    audio ??= new Audio()
    const a = audio
    a.onended = () => resolve()
    a.onerror = () => resolve()
    a.onpause = () => resolve()
    a.src = url
    a.currentTime = 0
    void a.play().catch(() => resolve())
  })
}


/** Spricht einen Satz oder eine Folge von Bausteinen. Ein neuer Aufruf unterbricht den alten.
 *  Das Promise endet, wenn fertig gesprochen (oder unterbrochen) wurde. */
export async function speak(say: string | string[]) {
  stopSpeaking()
  // Ton in den Einstellungen des Kindes aus
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('ohne-ton')) return
  const id = run
  const parts = (Array.isArray(say) ? say : [say]).map((p) => p.trim()).filter(Boolean)
  const urls = parts.map(clipUrl)
  // Nur unsere Stimme (Lola): fehlt für einen Baustein die Aufnahme, wird er übersprungen – keine Browserstimme mehr
  const fehlt = parts.filter((_, i) => !urls[i])
  if (fehlt.length) { console.warn('Ohne Aufnahme:', fehlt); try { (window as unknown as { __fehlt?: string[] }).__fehlt?.push(...fehlt) } catch { /* nur Test */ } }
  for (const url of urls) {
    if (!url) continue
    if (id !== run) return
    await playClip(url, id)
  }
}
