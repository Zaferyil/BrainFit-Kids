// Vertont alle Sätze von Lisa und legt ab:
//   content/lektionen/<id>/<szene>.mp3   – eine Aufnahme je Szene
//   content/lektionen/<id>/timing.json   – Länge und Zeichen-Zeitmarken je Szene (für das Studio)
//   content/lektionen/<id>/ton.wav       – die ganze Tonspur im Zeitplan des Videos (für HeyGen)
// Stimme: mit ELEVENLABS_API_KEY Lisas ElevenLabs-Stimme (Ehc9dVwDGENWbpsWNTfK, Standard),
//         sonst HeyGen „Gentle Greta – Friendly“ (HEYGEN_API_KEY) oder mit --frei „Nele“ (HeyGen, kostenlos)
// Aufruf: ELEVENLABS_API_KEY=… node scripts/lisa-stimme.mjs lektion-1 [--nur-ton] [--frei]
import { createServer } from 'vite'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'

const id = process.argv[2] ?? 'lektion-1'
const onlyTrack = process.argv.includes('--nur-ton')
const KEY = process.env.HEYGEN_API_KEY
const EL_KEY = process.env.ELEVENLABS_API_KEY
const FREE = process.argv.includes('--frei')
const ELEVEN = Boolean(EL_KEY) && !FREE
const VOICE = ELEVEN
  ? 'Ehc9dVwDGENWbpsWNTfK' // Lisa (ElevenLabs)
  : FREE ? '194c5c7896e849139df58b34b05b6a7c' : 'ecb08917b1f348e6a235e85eb0870b68' // Nele | Gentle Greta – Friendly
const dir = `content/lektionen/${id}`
mkdirSync(dir, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Liefert { audio: Buffer, duration, chars } – chars = Startzeit je Zeichen des Textes */
async function tts(text) {
  if (ELEVEN) return elevenlabs(text)
  const data = await heygen(text)
  const audio = Buffer.from(await (await fetch(data.audio_url)).arrayBuffer())
  const chars = data.original_characters
    ? data.original_characters.map((c) => Math.round(c.start_time * 1000) / 1000)
    : charTimes(text, data.word_timestamps)
  return { audio, duration: data.duration, chars }
}

async function elevenlabs(text) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': EL_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2', language_code: 'de' }),
    })
    if (res.status === 429 || res.status >= 500) { await sleep(2 ** attempt * 2000); continue }
    const json = await res.json()
    if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`)
    const a = json.alignment
    // Zeichen der Antwort auf den Text abbilden (gleiche Reihenfolge)
    const chars = new Array(text.length).fill(0)
    let pos = 0
    a.characters.forEach((ch, k) => {
      const i = text.indexOf(ch, pos)
      if (i < 0) return
      for (let j = pos; j <= i; j++) chars[j] = Math.round(a.character_start_times_seconds[k] * 1000) / 1000
      pos = i + 1
    })
    const duration = a.character_end_times_seconds.at(-1) + 0.15
    return { audio: Buffer.from(json.audio_base64, 'base64'), duration, chars }
  }
  throw new Error('ElevenLabs antwortet nicht')
}

async function heygen(text) {
  const [url, body] = FREE
    ? ['https://api.heygen.com/v3/models/audio/tts', { model: 'heygen-voice-1-turbo-free', voice_id: VOICE, text, language: 'de', with_timestamps: true }]
    : ['https://api.heygen.com/v3/voices/speech', { voice_id: VOICE, text, language: 'de' }]
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'X-Api-Key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 429 || res.status >= 500) { await sleep(Number(res.headers.get('retry-after') ?? 2 ** attempt * 2) * 1000); continue }
    const json = await res.json()
    if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`)
    return json.data
  }
  throw new Error('HeyGen antwortet nicht')
}

/** Wort-Zeitmarken → Startzeit je Zeichen: Zeichen eines Wortes werden über die Wortdauer verteilt,
 *  Leerzeichen und Satzzeichen dazwischen bekommen das Ende des vorigen Wortes. */
function charTimes(text, words) {
  const out = new Array(text.length).fill(0)
  let pos = 0
  let last = 0
  for (const w of words.filter((x) => !x.word.startsWith('<'))) {
    const i = text.indexOf(w.word, pos)
    if (i < 0) continue
    for (let k = pos; k < i; k++) out[k] = last
    for (let k = 0; k < w.word.length; k++) out[i + k] = Math.round((w.start + ((w.end - w.start) * k) / w.word.length) * 1000) / 1000
    pos = i + w.word.length
    last = w.end
  }
  for (let k = pos; k < text.length; k++) out[k] = last
  return out
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { findLesson, spokenText } = await server.ssrLoadModule('/src/studio/lektionen.ts')
  const { buildTimeline } = await server.ssrLoadModule('/src/studio/timeline.ts')
  const lesson = findLesson(id)
  const timingFile = `${dir}/timing.json`
  const timing = existsSync(timingFile) ? JSON.parse(readFileSync(timingFile, 'utf8')) : {}

  if (!onlyTrack) {
    if (!KEY && !ELEVEN) throw new Error('ELEVENLABS_API_KEY oder HEYGEN_API_KEY fehlt')
    for (const scene of lesson.scenes) {
      if (!scene.say) continue
      const text = spokenText(scene.say)
      if (timing[scene.id]?.text === text && timing[scene.id]?.voice === VOICE && existsSync(`${dir}/${scene.id}.mp3`)) continue // unverändert
      const data = await tts(text)
      const raw = `${dir}/${scene.id}.roh`
      writeFileSync(raw, data.audio)
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', raw, '-ac', '1', '-b:a', '96k', `${dir}/${scene.id}.mp3`])
      execFileSync('rm', [raw])
      timing[scene.id] = { text, voice: VOICE, duration: data.duration, chars: data.chars }
      console.log(`${scene.id}: ${data.duration.toFixed(2)} s`)
      await sleep(2200) // höchstens 30 Anfragen pro Minute
    }
    writeFileSync(timingFile, JSON.stringify(timing))
  }

  // Tonspur im Zeitplan: jede Aufnahme an ihrem Szenenstart
  const tl = buildTimeline(lesson, timing)
  const inputs = []
  const filters = []
  tl.scenes.filter((s) => s.scene.say).forEach((s, i) => {
    inputs.push('-i', `${dir}/${s.scene.id}.mp3`)
    const ms = Math.round((s.start + s.speech.start) * 1000)
    filters.push(`[${i}:a]adelay=${ms}|${ms}[a${i}]`)
  })
  const n = filters.length
  const mix = `${filters.join(';')};${Array.from({ length: n }, (_, i) => `[a${i}]`).join('')}amix=inputs=${n}:normalize=0,apad=whole_dur=${tl.duration.toFixed(2)}[out]`
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...inputs, '-filter_complex', mix, '-map', '[out]', '-ac', '1', '-ar', '44100', `${dir}/ton.wav`])
  console.log(`Tonspur: ${tl.duration.toFixed(1)} s → ${dir}/ton.wav`)
} finally {
  await server.close()
}
