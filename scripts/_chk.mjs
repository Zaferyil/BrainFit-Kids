import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
const s = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const sp = await s.ssrLoadModule('/src/data/sprache.ts')
const m = JSON.parse(readFileSync('src/assets/stimme/manifest.json', 'utf8'))
const walk = (o, p) => { if (typeof o === 'string') { if (!(o.trim() in m)) console.log(p, '|', o) } else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, p + '.' + k) }
for (const [k, v] of Object.entries(sp)) if (typeof v !== 'function') walk(v, k)
await s.close()
