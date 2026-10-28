// Sprechtexte der Szenen (ohne „ende“) je Lektion für die Aufnahme: node scripts/lektion-texte.mjs <out.json> lektion-5 …
import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'
const [out, ...ids] = process.argv.slice(2)
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const { findLesson, spokenText } = await server.ssrLoadModule('/src/studio/lektionen.ts')
const all = {}
for (const id of ids) {
  const l = findLesson(id)
  all[id] = l.scenes.filter((s) => s.say && s.id !== 'ende').map((s) => [s.id, spokenText(s.say), s.say])
}
writeFileSync(out, JSON.stringify(all, null, 1))
await server.close()
