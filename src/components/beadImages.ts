import gelb from '../assets/abakus/perle-gelb.webp'
import gruen from '../assets/abakus/perle-gruen.webp'
import rot from '../assets/abakus/perle-rot.webp'
import blau from '../assets/abakus/perle-blau.webp'
import lila from '../assets/abakus/perle-lila.webp'
import pink from '../assets/abakus/perle-pink.webp'

export type BeadColor = 'yellow' | 'green' | 'orange' | 'blue' | 'purple' | 'pink'

// Originalgrafiken des Abakus von abacus.mentalmath.at (275 × 129 px)
export const BEAD_IMAGES: Record<BeadColor, string> = { yellow: gelb, green: gruen, orange: rot, blue: blau, purple: lila, pink }
export const BEAD_RATIO = 129 / 275
