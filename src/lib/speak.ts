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

function browserSpeak(text: string, id: number) {
  return new Promise<void>((resolve) => {
    try {
      const synth = window.speechSynthesis
      if (!synth || id !== run) return resolve()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'de-AT'
      u.rate = 0.95
      const voice = synth.getVoices().find((v) => v.lang.startsWith('de'))
      if (voice) u.voice = voice
      u.onend = () => resolve()
      u.onerror = () => resolve()
      synth.speak(u)
    } catch {
      resolve()
    }
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
  if (urls.every(Boolean)) {
    for (const url of urls) {
      if (id !== run) return
      await playClip(url!, id)
    }
    return
  }
  await browserSpeak(parts.join(' '), id)
}
