// Erzeugt den Sprechtext einer Lektion für HeyGen: alle Sätze von Lisa in Reihenfolge,
// mit Pausen dort, wo im Video gezeigt, gezählt (3-2-1) oder die Lösung aufgedeckt wird.
// Aufruf: node scripts/heygen-skript.mjs lektion-1 > docs/heygen/lektion-1.md
import { createServer } from 'vite'

const id = process.argv[2] ?? 'lektion-1'
const WORDS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
// Ziffern als Wörter, damit die Stimme „Die 1“ nicht als „die Erste“ liest
const spoken = (t) => t
  .replace(/\b(Die|die) (\d)\b/g, (_, d, n) => `${d} ${WORDS[n][0].toUpperCase()}${WORDS[n].slice(1)}`)
  .replace(/\b(\d)\b/g, (_, n) => WORDS[n])
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { findLesson } = await server.ssrLoadModule('/src/studio/lektionen.ts')
  const { buildTimeline } = await server.ssrLoadModule('/src/studio/timeline.ts')
  const lesson = findLesson(id)
  const tl = buildTimeline(lesson)
  const rows = []
  for (const s of tl.scenes) {
    if (!s.scene.say) continue
    // Zeit nach dem Satz, die das Bild noch braucht (auf halbe Sekunden gerundet)
    const rest = Math.round((s.dur - s.speech.end) * 2) / 2
    rows.push({ id: s.scene.id, say: spoken(s.scene.say), pause: Math.max(1, rest) })
  }
  const out = []
  out.push(`# HeyGen-Sprechtext · Lektion ${lesson.number}: ${lesson.title}`, '')
  out.push('Sprecherin: Lisa · Sprache: Deutsch · langsam und freundlich, für Kinder von 5 bis 12', '')
  out.push('## Einstellungen in HeyGen', '')
  out.push('- Format 16:9 (1920×1080), MP4, ohne Untertitel und ohne Musik')
  out.push('- Hintergrund: Klassenzimmer; Lisa steht links (bis etwa 500 px von links), sichtbar vom Kopf bis zum Hosenbund der Jeans')
  out.push('- Die rechte Seite bleibt frei oder darf eine Tafel zeigen – sie wird im fertigen Video von der Tafel mit dem Abakus verdeckt')
  out.push('- Das Video beginnt mit dem ersten Satz (Titel und Abschlussbild kommen aus dem Studio)', '')
  out.push('## Zum Kopieren', '')
  out.push('Jede Pause als Pause in HeyGen einfügen (gleiche Länge).', '')
  out.push('```')
  for (const r of rows) out.push(r.say, `[Pause ${String(r.pause).replace('.', ',')} s]`, '')
  out.push('```', '')
  out.push('## Szenen', '', '| # | Szene | Text | Pause danach |', '|---|---|---|---|')
  rows.forEach((r, i) => out.push(`| ${i + 1} | ${r.id} | ${r.say} | ${String(r.pause).replace('.', ',')} s |`))
  process.stdout.write(out.join('\n') + '\n')
} finally {
  await server.close()
}
