// Gibt alle Sprach-Bausteine als JSON aus (Schlüssel → Sprechtext).
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { alleBausteine } = await server.ssrLoadModule('/src/data/sprache.ts')
  process.stdout.write(JSON.stringify(alleBausteine(), null, 2))
} finally {
  await server.close()
}
