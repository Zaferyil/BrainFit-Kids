// Baut die Tonspur einer Lektion für die App: jede Szenen-Aufnahme (content/lektionen/<id>/<szene>.mp3)
// wird an ihren Platz im Zeitplan gelegt (Szenenstart + Pause vor dem ersten Wort).
// Aufruf: node scripts/lektion-ton.mjs lektion-2  (Sprache in 32 kbit/s mono, 22 kHz reicht und hält die App klein)
import { createServer } from 'vite'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

const id = process.argv[2]
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { findLesson } = await server.ssrLoadModule('/src/studio/lektionen.ts')
  const { buildTimeline } = await server.ssrLoadModule('/src/studio/timeline.ts')
  const dir = `content/lektionen/${id}`
  const timing = JSON.parse(readFileSync(`${dir}/timing.json`, 'utf8'))
  const tl = buildTimeline(findLesson(id), timing)
  const parts = tl.scenes.filter((s) => s.scene.say && existsSync(`${dir}/${s.scene.id}.mp3`))
  const args = ['-y', '-hide_banner', '-loglevel', 'error']
  parts.forEach((s) => args.push('-i', `${dir}/${s.scene.id}.mp3`))
  const delays = parts.map((s, i) => `[${i}]adelay=${Math.round((s.start + s.speech.start) * 1000)}:all=1[a${i}]`)
  const mix = `${parts.map((_, i) => `[a${i}]`).join('')}amix=inputs=${parts.length}:normalize=0,apad=whole_dur=${tl.duration.toFixed(2)}`
  args.push('-filter_complex', `${delays.join(';')};${mix}`, '-ac', '1', '-ar', '22050', '-b:a', '32k', `src/assets/lektionen/${id}-ton.mp3`)
  execFileSync('ffmpeg', args)
  console.log(`${id}: ${parts.length} Szenen, ${tl.duration.toFixed(1)} s`)
} finally {
  await server.close()
}
