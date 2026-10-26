// Legt die Tafel-Inhalte aus dem Video-Studio über das HeyGen-Video von Lisa.
// Das Studio zeichnet im Modus ?overlay nur die Tafel (Hintergrund durchsichtig); jedes Bild wird als PNG
// mit Alphakanal aufgenommen und mit ffmpeg über das HeyGen-Video gelegt. Der Ton kommt aus dem HeyGen-Video.
// Aufruf: node scripts/studio-heygen.cjs <url-basis> <lektion-id> <heygen.mp4> <ausgabe.mp4> [ab-sekunde] [dauer]
//   ab-sekunde: Studiozeit, die dem Anfang des HeyGen-Videos entspricht (Standard 0 = ganze Lektion)
const { chromium } = require('playwright')
const { spawn, execFileSync } = require('child_process')

;(async () => {
  const [base, id, heygen, out, fromArg, durArg] = process.argv.slice(2)
  const fps = 25
  const from = Number(fromArg || 0)
  const hgDur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', heygen]).toString())
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.goto(`${base}/#/studio/${id}?export&overlay`)
  await page.waitForFunction(() => window.__studio)
  await page.addStyleTag({ content: 'html, body, #root, .studio { background: transparent !important; }' })
  await page.evaluate(() => document.fonts.ready)
  const total = await page.evaluate(() => window.__studio.duration)
  const dur = Math.min(Number(durArg || total - from), hgDur)
  const frames = Math.ceil(dur * fps)
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-i', heygen,
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-filter_complex', `[0:v]fps=${fps},trim=duration=${dur.toFixed(3)},setpts=PTS-STARTPTS[bg];[bg][1:v]overlay=0:0:format=auto,format=yuv420p[v]`,
    '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-c:a', 'aac', '-b:a', '160k', '-t', dur.toFixed(3), '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.__studio.seek(t), from + i / fps)
    const img = await page.screenshot({ type: 'png', omitBackground: true })
    if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r))
    if (i % (fps * 10) === 0) console.log(`${Math.round((i / frames) * 100)} %`)
  }
  ff.stdin.end()
  await new Promise((r) => ff.on('close', r))
  await browser.close()
  console.log('fertig', out, dur.toFixed(1), 's')
})()
