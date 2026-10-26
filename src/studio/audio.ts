import type { SceneAudio } from './timeline'

// Aufnahmen von Lisa je Lektion: Zeitmarken (scripts/lisa-stimme.mjs) und die ganze Tonspur für die App.
const TIMINGS = import.meta.glob('../../content/lektionen/*/timing.json', { eager: true, import: 'default' }) as Record<string, Record<string, SceneAudio>>
const TRACKS = import.meta.glob('../assets/lektionen/*-ton.mp3', { eager: true, import: 'default' }) as Record<string, string>

export const lessonAudio = (id: string): Record<string, SceneAudio> =>
  Object.entries(TIMINGS).find(([k]) => k.split('/').slice(-2)[0] === id)?.[1] ?? {}

export const lessonTrack = (id: string): string | undefined => TRACKS[`../assets/lektionen/${id}-ton.mp3`]
