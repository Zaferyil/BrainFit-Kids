import { lessonTrack } from '../studio/audio'
// Lernvideos je Einheit, aus MathKids („Watch Video“-Knopf je Level), siehe content/videos.json.
export type Video = { id: string; title: string; source: 'youtube' | 'drive' | 'lektion'; seconds?: number }

const v = (id: string, title: string): Video => ({ id, title, source: 'youtube' })
// MP4 aus dem Drive-Ordner „Bitmis-Video Dersler-Youtube icin“ (siehe content/videos.json)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const drive = (id: string, title: string, seconds: number): Video => ({ id, title, source: 'drive', seconds })
// Eigene Lernvideos mit Lisa, in der App abgespielt (src/studio, Lektion-ID aus lektionen.ts)
const lektion = (id: string, title: string): Video => ({ id, title, source: 'lektion' })

export const UNIT_VIDEOS: Record<string, Video[]> = {
  '1-1': [lektion('lektion-1', 'Lektion 1: Der Abakus')],
  '1-2': [lektion('lektion-2', 'Lektion 2: Big Friend +9')],
  '1-3': [lektion('lektion-3', 'Lektion 3: Big Friend +8')],
  '1-4': [lektion('lektion-4', 'Lektion 4: Big Friend +7')],
  '1-5': [lektion('lektion-5', 'Lektion 5: Big Friend +6')],
  '1-6': [lektion('lektion-6', 'Lektion 6: Big Friend +5')],
  '1-7': [lektion('lektion-7', 'Lektion 7: Big Friend +4')],
  '1-8': [lektion('lektion-8', 'Lektion 8: Big Friend +3')],
  '1-9': [lektion('lektion-9', 'Lektion 9: Big Friend +2')],
  '1-10': [lektion('lektion-10', 'Lektion 10: Big Friend +1')],
  '1-11': [lektion('lektion-11', 'Lektion 11: Alle Big Friends')],
  '1-12': [lektion('lektion-12', 'Lektion 12: Big Friends Training')],
  '2-1': [lektion('lektion-13', 'Lektion 13: Little Friend +4')],
  '2-2': [lektion('lektion-14', 'Lektion 14: Little Friend +3')],
  '2-3': [lektion('lektion-15', 'Lektion 15: Little Friend +2')],
  '2-4': [lektion('lektion-16', 'Lektion 16: Little Friend +1')],
  '2-5': [lektion('lektion-17', 'Lektion 17: Alle Little Friends')],
  '2-6': [lektion('lektion-18', 'Lektion 18: Little Friends Training')],
  '3-1': [lektion('lektion-19', 'Lektion 19: Best Friend +6')],
  '3-2': [lektion('lektion-20', 'Lektion 20: Best Friend +7')],
  '3-3': [lektion('lektion-21', 'Lektion 21: Best Friend +8')],
  '3-4': [lektion('lektion-22', 'Lektion 22: Best Friend +9')],
  '3-5': [lektion('lektion-23', 'Lektion 23: Alle Best Friends')],
  '3-6': [lektion('lektion-24', 'Lektion 24: Best Friends Training')],
  '4-1': [lektion('lektion-25', 'Lektion 25: Big Friend −9')],
  '4-2': [lektion('lektion-26', 'Lektion 26: Big Friend −8')],
  '4-3': [lektion('lektion-27', 'Lektion 27: Big Friend −7')],
  '4-4': [lektion('lektion-28', 'Lektion 28: Big Friend −6')],
  '4-5': [lektion('lektion-29', 'Lektion 29: Big Friend −5')],
  '4-6': [lektion('lektion-30', 'Lektion 30: Big Friend −4')],
  '4-7': [lektion('lektion-31', 'Lektion 31: Big Friend −3')],
  '4-8': [lektion('lektion-32', 'Lektion 32: Big Friend −2')],
  '4-9': [lektion('lektion-33', 'Lektion 33: Big Friend −1')],
  '4-10': [lektion('lektion-34', 'Lektion 34: Alle Big Friends Minus')],
  '4-11': [lektion('lektion-35', 'Lektion 35: Big Friends Minus Training')],
  '5-1': [lektion('lektion-36', 'Lektion 36: Little Friend −4')],
  '5-2': [lektion('lektion-37', 'Lektion 37: Little Friend −3')],
  '5-3': [lektion('lektion-38', 'Lektion 38: Little Friend −2')],
  '5-4': [lektion('lektion-39', 'Lektion 39: Little Friend −1')],
  '5-5': [lektion('lektion-40', 'Lektion 40: Little Friends Minus alle')],
  '5-6': [lektion('lektion-41', 'Lektion 41: Little Friends Minus Training')],
  '5-7': [lektion('lektion-42', 'Lektion 42: Big & Little Friends Minus')],
  '5-8': [lektion('lektion-43', 'Lektion 43: Big Friends Plus & Minus')],
  '5-9': [lektion('lektion-44', 'Lektion 44: Little Friends Plus & Minus')],
  '5-10': [lektion('lektion-45', 'Lektion 45: Große Wiederholung')],
  '5-11': [lektion('lektion-46', 'Lektion 46: Weltraum-Training')],
  '6-1': [v('syFqaVtK-Gw', 'Little Friends −4'), v('6S_lKdcnDEQ', 'Little Friends −3')],
  '6-2': [v('Y7nQ-6mkqxc', 'Little Friends −2'), v('_bv5Uj6xUag', 'Little Friends −1')],
  '6-3': [v('Lr_n3cnTJ2k', 'Alle Little Friends (minus)')],
  '7-1': [v('8vkSeNju3_A', 'Best Friends −6'), v('IhBJ4mupleo', 'Best Friends −7')],
  '7-2': [v('-RtPC5feHRo', 'Best Friends −8'), v('uwatUNukPCQ', 'Best Friends −9')],
  '7-3': [v('cIX4tJwVcE8', 'Alle Best Friends (minus)')],
}

// Lisa-Lektionen nur, wenn die Tonspur schon aufgenommen ist (sonst wird die Video-Station übersprungen)
export const unitVideos = (world: number, unit: number) => (UNIT_VIDEOS[`${world}-${unit}`] ?? []).filter((v) => v.source !== 'lektion' || !!lessonTrack(v.id))

export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
/** Eingebetteter Drive-Player; direkte MP4-Links blockiert der Browser (ORB). */
export const drivePreviewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`
export const driveViewUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`
