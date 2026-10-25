// Lernvideos je Einheit, aus MathKids („Watch Video“-Knopf je Level), siehe content/videos.json.
export type Video = { id: string; title: string; source: 'youtube' | 'drive'; seconds?: number }

const v = (id: string, title: string): Video => ({ id, title, source: 'youtube' })
// MP4 aus dem Drive-Ordner „Bitmis-Video Dersler-Youtube icin“ (siehe content/videos.json)
const drive = (id: string, title: string, seconds: number): Video => ({ id, title, source: 'drive', seconds })

export const UNIT_VIDEOS: Record<string, Video[]> = {
  '1-1': [v('Zto6YuVKFaI', 'Erd- und Himmelsperlen')],
  '1-2': [drive('16ZbfblAYiKU_VoNMjjzbUNWAkNNHA30U', '2. Lektion: 1 bis 9', 112)],
  '1-3': [drive('1-eg7e_UsxmAHQIMnwZmxsIXvYW03rEe5', '3. Lektion: Zehner und Einer', 115)],
  '2-1': [v('UUrV0frw8aI', 'Big Friends +9'), v('fHMDL8jGRdE', 'Big Friends +8')],
  '2-2': [v('h5YNF3tvTx8', 'Big Friends +7'), v('5OeEtNZIILM', 'Big Friends +6')],
  '2-3': [v('WlkEGQAyIq4', 'Big Friends +5'), v('DCgAPgrH0J8', 'Big Friends +4')],
  '2-4': [v('U3AzocsMz0g', 'Big Friends +3'), v('C0EJfP0nIk0', 'Big Friends +2'), v('sz4KTrNUuN4', 'Big Friends +1')],
  '2-5': [v('zXHWvJ8K5BQ', 'Alle Big Friends')],
  '3-1': [v('tWghlERLe7s', 'Little Friends +4'), v('iBV2HwcNe0c', 'Little Friends +3')],
  '3-2': [v('SuMxJaEkcEo', 'Little Friends +2'), v('qHMAWRv6IrQ', 'Little Friends +1')],
  '3-3': [v('S2gVsf8EUDw', 'Alle Little Friends')],
  '4-1': [v('V5weiE0zbZI', 'Best Friends +6'), v('mKfS-0taZH0', 'Best Friends +7')],
  '4-2': [v('qmnhO7aOHBw', 'Best Friends +8'), v('YO1jrEezMzw', 'Best Friends +9')],
  '4-3': [v('RrollzMfpxY', 'Alle Best Friends')],
  '5-1': [v('WOKGEaTal_k', 'Big Friends −9'), v('47OaoX87960', 'Big Friends −8')],
  '5-2': [v('2590z9kSWB4', 'Big Friends −7'), v('5N8WOhDN2Os', 'Big Friends −6')],
  // In MathKids führt −4 zum selben Video wie −6; das richtige −4-Video kommt aus dem Drive-Ordner (30. Lektion).
  '5-3': [v('tDl6SUsTuxs', 'Big Friends −5'), drive('1QMTdjjujCH2Q3m7K7LZ-zknN1Mdb7gcR', 'Big Friends −4', 88)],
  '5-4': [v('4Vj-T_KSksM', 'Big Friends −3'), v('g2zPiY_Y8hY', 'Big Friends −2')],
  '5-5': [v('HTnjgudJE5Y', 'Big Friends −1'), v('FhNZbVVzgi0', 'Alle Minus-Big-Friends')],
  '6-1': [v('syFqaVtK-Gw', 'Little Friends −4'), v('6S_lKdcnDEQ', 'Little Friends −3')],
  '6-2': [v('Y7nQ-6mkqxc', 'Little Friends −2'), v('_bv5Uj6xUag', 'Little Friends −1')],
  '6-3': [v('Lr_n3cnTJ2k', 'Alle Little Friends (minus)')],
  '7-1': [v('8vkSeNju3_A', 'Best Friends −6'), v('IhBJ4mupleo', 'Best Friends −7')],
  '7-2': [v('-RtPC5feHRo', 'Best Friends −8'), v('uwatUNukPCQ', 'Best Friends −9')],
  '7-3': [v('cIX4tJwVcE8', 'Alle Best Friends (minus)')],
}

export const unitVideos = (world: number, unit: number) => UNIT_VIDEOS[`${world}-${unit}`] ?? []

export const youtubeUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`
/** Eingebetteter Drive-Player; direkte MP4-Links blockiert der Browser (ORB). */
export const drivePreviewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`
export const driveViewUrl = (id: string) => `https://drive.google.com/file/d/${id}/view`
