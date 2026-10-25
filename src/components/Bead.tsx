import { useId } from 'react'

export type BeadColor = 'yellow' | 'green' | 'orange' | 'blue' | 'purple' | 'pink'

// Farben wie im Abakus aus dem Spiel: helle Oberseite, kräftige Unterseite.
const COLORS: Record<BeadColor, { top: [string, string]; bottom: [string, string] }> = {
  yellow: { top: ['#FFE94D', '#FFC40A'], bottom: ['#FFB300', '#FF8C00'] },
  green: { top: ['#A3E635', '#62B81C'], bottom: ['#5CA81E', '#3D8712'] },
  orange: { top: ['#FF8F45', '#FF5E0D'], bottom: ['#FF4A0A', '#E81A00'] },
  // weitere Farben für Denkspiele
  blue: { top: ['#8FD0FF', '#3BA7FF'], bottom: ['#2F8FE8', '#1C68C8'] },
  purple: { top: ['#D2B3FF', '#A06BFF'], bottom: ['#8A55E8', '#6636C2'] },
  pink: { top: ['#FFB0CB', '#FF5C8A'], bottom: ['#F0456F', '#C21F4E'] },
}

const OUTLINE = 'M2.5 26 C2.5 23.5 4 21.5 6.5 19.5 L19 9 C26 3 37 0.8 50 0.8 C63 0.8 74 3 81 9 L93.5 19.5 C96 21.5 97.5 23.5 97.5 26 C97.5 28.5 96 30.5 93.5 32.5 L77 46.5 C74 48.7 70.5 49.5 66 49.5 L34 49.5 C29.5 49.5 26 48.7 23 46.5 L6.5 32.5 C4 30.5 2.5 28.5 2.5 26 Z'
const LOWER = 'M2.5 26 C30 30.5 70 30.5 97.5 26 C97.5 28.5 96 30.5 93.5 32.5 L77 46.5 C74 48.7 70.5 49.5 66 49.5 L34 49.5 C29.5 49.5 26 48.7 23 46.5 L6.5 32.5 C4 30.5 2.5 28.5 2.5 26 Z'

/** Eine Abakus-Perle (Seitenverhältnis 100 : 52). */
export function Bead({ color = 'yellow', width = 70 }: { color?: BeadColor; width?: number }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const c = COLORS[color]
  return (
    <svg width={width} height={width * 0.52} viewBox="0 0 100 52" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.top[0]} />
          <stop offset="1" stopColor={c.top[1]} />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c.bottom[0]} />
          <stop offset="1" stopColor={c.bottom[1]} />
        </linearGradient>
      </defs>
      <path d={OUTLINE} fill={`url(#${id}t)`} />
      <path d={LOWER} fill={`url(#${id}b)`} />
      <ellipse cx="34" cy="8.5" rx="8" ry="3.4" fill="#FFFFFF" opacity="0.85" />
      <path d="M73 7 C80 10 85 14 89 19" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity="0.45" />
      <path d={OUTLINE} fill="none" stroke="#111111" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  )
}
