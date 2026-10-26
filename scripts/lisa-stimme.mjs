// Vertont alle Sätze von Lisa mit HeyGen Voice (Turbo Free, Stimme „Nele“) und legt ab:
//   content/lektionen/<id>/<szene>.mp3   – eine Aufnahme je Szene
//   content/lektionen/<id>/timing.json   – Länge und Zeichen-Zeitmarken je Szene (für das Studio)
//   content/lektionen/<id>/ton.wav       – die ganze Tonspur im Zeitplan des Videos (für HeyGen)
// Aufruf: HEYGEN_API_KEY=… node scripts/lisa-stimme.mjs lektion-1 [--nur-ton]
import { createServer } from 'vite'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'

const id = process.argv[2] ?? 'lektion-1'
const onlyTrack = process.argv.includes('--nur-ton')
const KEY = process.env.HEYGEN_API_KEY
const VOICE = '194c5c7896e849139df58b34b05b6a7c' // Nele – Friendly & Natural (Deutsch)
const dir = `content/lektionen/${id}`
mkdirSync(dir, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function tts(text) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch('https://api.heygen.com/v3/models/audio/tts', {
      method: 'POST',
      headers: { 'X-Api-Key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'heygen-voice-1-turbo-free', voice_id: VOICE, text, language: 'de', with_timestamps: true }),
    })
    if (res.status === 429 || res.status >= 500) { await sleep(Number(res.headers.get('retry-after') ?? 2 ** attempt * 2) * 1000); continue }
    const body = await res.json()
    if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body)}`)
    return body.data
  }
  throw new Error('HeyGen antwortet nicht')
}

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { findLesson, spokenText } = await server.ssrLoadModule('/src/studio/lektionen.ts')
  const { buildTimeline } = await server.ssrLoadModule('/src/studio/timeline.ts')
  const lesson = findLesson(id)
  const timingFile = `${dir}/timing.json`
  const timing = existsSync(timingFile) ? JSON.parse(readFileSync(timingFile, 'utf8')) : {}

  if (!onlyTrack) {
    if (!KEY) throw new Error('HEYGEN_API_KEY fehlt')
    for (const scene of lesson.scenes) {
      if (!scene.say) continue
      const text = spokenText(scene.say)
      if (timing[scene.id]?.text === text && existsSync(`${dir}/${scene.id}.mp3`)) continue // unverändert
      const data = await tts(text)
      const wav = `${dir}/${scene.id}.wav`
      writeFileSync(wav, Buffer.from(await (await fetch(data.audio_url)).arrayBuffer()))
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-ac', '1', '-b:a', '96k', `${dir}/${scene.id}.mp3`])
      execFileSync('rm', [wav])
      const chars = data.original_characters.map((c) => Math.round(c.start_time * 1000) / 1000)
      timing[scene.id] = { text, duration: data.duration, chars }
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
