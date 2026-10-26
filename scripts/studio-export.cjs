// Nimmt eine Lektion aus dem Video-Studio Bild für Bild auf und erzeugt ein MP4.
// Aufruf: node scripts/studio-export.cjs <url-basis> <lektion-id> <ausgabe.mp4> [fps] [audio.wav]
const { chromium } = require('playwright')
const { spawn } = require('child_process')

;(async () => {
  const [base, id, out, fpsArg, audio] = process.argv.slice(2)
  const fps = Number(fpsArg || 25)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.goto(`${base}/#/studio/${id}?export`)
  await page.waitForFunction(() => window.__studio)
  await page.evaluate(() => document.fonts.ready)
  const duration = await page.evaluate(() => window.__studio.duration)
  const frames = Math.ceil(duration * fps)
  const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-']
  if (audio) args.push('-i', audio, '-c:a', 'aac', '-b:a', '160k', '-shortest')
  args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out)
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] })
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.__studio.seek(t), i / fps)
    const img = await page.screenshot({ type: 'jpeg', quality: 92 })
    if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r))
    if (i % (fps * 10) === 0) console.log(`${Math.round((i / frames) * 100)} %`)
  }
  ff.stdin.end()
  await new Promise((r) => ff.on('close', r))
  await browser.close()
  console.log('fertig', out, duration.toFixed(1), 's')
})()
