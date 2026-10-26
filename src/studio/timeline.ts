import type { Lesson, Scene } from './lektionen'

// Zeitplan eines Videos: wann jede Szene beginnt, wie lange sie dauert und wann sich
// die Perlen bewegen. Ohne Aufnahme wird die Sprechdauer aus der Textlänge geschätzt.

const LEAD = 0.35 // Pause vor dem ersten Wort
const TAIL = 0.7 // Pause nach dem letzten Wort
const SEC_PER_CHAR = 0.072
const MOVE = 0.9
const COUNTDOWN = 3.2

export type TimedMove = { start: number; dur: number; to: number; hand: boolean }

export type TimedScene = {
  scene: Scene
  start: number
  dur: number
  /** Sprechzeit innerhalb der Szene */
  speech: { start: number; end: number }
  cols: number
  value: number
  moves: TimedMove[]
}

export type Timeline = { scenes: TimedScene[]; duration: number }

export const estimateSpeech = (text?: string) => (text ? text.length * SEC_PER_CHAR : 0)

/** @param durations echte Länge der Aufnahme je Szene (Sekunden), sobald vorhanden */
export function buildTimeline(lesson: Lesson, durations: Record<string, number> = {}): Timeline {
  const scenes: TimedScene[] = []
  let t = 0
  let cols = 4
  let value = 0
  for (const scene of lesson.scenes) {
    cols = scene.cols ?? cols
    value = scene.value ?? value
    const talk = durations[scene.id] ?? estimateSpeech(scene.say)
    const speech = { start: scene.say ? LEAD : 0, end: scene.say ? LEAD + talk : 0 }
    const anchor = (at: string | number) => {
      if (typeof at === 'number') return at
      const i = scene.say?.indexOf(at) ?? -1
      return i < 0 ? speech.start : speech.start + (i / scene.say!.length) * talk
    }
    const moves: TimedMove[] = (scene.moves ?? []).map((m) => ({
      start: typeof m.at === 'number' ? m.at * Math.max(talk, 1) : anchor(m.at),
      dur: m.dur ?? MOVE,
      to: m.to,
      hand: m.hand ?? cols === 1,
    }))
    moves.sort((a, b) => a.start - b.start)
    let dur = speech.end + TAIL
    if (scene.task !== undefined) {
      const reveal = speech.end + COUNTDOWN
      moves.push({ start: reveal, dur: MOVE, to: scene.task, hand: cols === 1 })
      dur = reveal + MOVE + 2
    }
    if (scene.quiz) dur = speech.end + COUNTDOWN + 2.4
    const lastMove = Math.max(0, ...moves.map((m) => m.start + m.dur + 0.4))
    dur = Math.max(dur, lastMove, scene.min ?? 0)
    scenes.push({ scene, start: t, dur, speech, cols, value, moves })
    t += dur
    value = moves.length ? moves[moves.length - 1].to : value
  }
  return { scenes, duration: t }
}

export function sceneAt(tl: Timeline, t: number) {
  const i = tl.scenes.findIndex((s) => t < s.start + s.dur)
  return tl.scenes[i < 0 ? tl.scenes.length - 1 : i]
}

/** Abakus-Stand zur Szenenzeit: fester Wert oder Bewegung von → nach. */
export function abakusAt(s: TimedScene, local: number) {
  let cur = s.value
  for (const m of s.moves) {
    if (local >= m.start + m.dur) cur = m.to
    else if (local >= m.start) return { value: m.to, from: cur, progress: (local - m.start) / m.dur, move: m }
    else break
  }
  return { value: cur, from: cur, progress: 1, move: null as TimedMove | null }
}
