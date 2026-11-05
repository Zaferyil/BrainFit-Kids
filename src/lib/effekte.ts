// Kurze Spiel-Effekttöne (Web Audio, ohne Dateien): richtig = „Plopp“ + helles Glöckchen, falsch = tiefes „Bonk“.
// Für alle Denkspiele nutzbar. Ist der Ton auf dem Gerät gesperrt, passiert einfach nichts.

let ctx: AudioContext | null = null
function audio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx ??= new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch { return null }
}

function ton(c: AudioContext, f0: number, f1: number, start: number, dauer: number, typ: OscillatorType, laut: number) {
  const o = c.createOscillator(), g = c.createGain()
  o.type = typ
  o.frequency.setValueAtTime(f0, start)
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), start + dauer)
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(laut, start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dauer)
  o.connect(g).connect(c.destination)
  o.start(start); o.stop(start + dauer + 0.02)
}

/** richtig: Blasen-Plopp und zwei helle Töne nach oben; je höher die Serie, desto höher der Ton */
export function tonRichtig(serie = 0) {
  const c = audio(); if (!c) return
  const t = c.currentTime + 0.01, hoch = Math.min(serie, 6) * 60
  ton(c, 500, 1400, t, 0.09, 'sine', 0.35)
  ton(c, 880 + hoch, 880 + hoch, t + 0.08, 0.18, 'triangle', 0.22)
  ton(c, 1320 + hoch, 1320 + hoch, t + 0.16, 0.28, 'triangle', 0.2)
}

/** falsch: kurzes, tiefes „Bonk“ (freundlich, nicht erschreckend) */
export function tonFalsch() {
  const c = audio(); if (!c) return
  const t = c.currentTime + 0.01
  ton(c, 220, 110, t, 0.22, 'square', 0.08)
  ton(c, 180, 90, t + 0.05, 0.25, 'sine', 0.25)
}

/** Spielende: kurze absteigende Tonfolge */
export function tonVorbei() {
  const c = audio(); if (!c) return
  const t = c.currentTime + 0.01;
  [523, 440, 349, 262].forEach((f, i) => ton(c, f, f * 0.98, t + i * 0.14, 0.2, 'triangle', 0.2))
}
