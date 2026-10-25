export type Mood = 'happy' | 'cheer' | 'think' | 'wow'

type Props = { mood?: Mood; size?: number }

const arm = { fill: 'none', stroke: '#DE9800', strokeWidth: 9, strokeLinecap: 'round' } as const
const hand = { fill: '#FFC531', stroke: '#DE9800', strokeWidth: 4 } as const
const ink = { fill: 'none', stroke: '#231A4F', strokeLinecap: 'round' } as const

export function Perli({ mood = 'happy', size = 200 }: Props) {
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 200 220" role="img" aria-label="Perli, das Abakus-Maskottchen" style={{ flexShrink: 0 }}>
      <rect x="96" y="2" width="8" height="196" rx="4" fill="#FF8A1F" />
      <ellipse cx="78" cy="204" rx="18" ry="9" fill="#FF8A1F" />
      <ellipse cx="122" cy="204" rx="18" ry="9" fill="#FF8A1F" />
      {mood === 'cheer' && (
        <>
          <path d="M34 112 Q10 92 18 62" {...arm} />
          <path d="M166 112 Q190 92 182 62" {...arm} />
          <circle cx="18" cy="58" r="9" {...hand} />
          <circle cx="182" cy="58" r="9" {...hand} />
        </>
      )}
      {mood === 'happy' && (
        <>
          <path d="M34 128 Q14 142 20 164" {...arm} />
          <path d="M166 112 Q192 96 186 68" {...arm} />
          <circle cx="186" cy="64" r="9" {...hand} />
        </>
      )}
      {mood === 'think' && (
        <>
          <path d="M34 128 Q14 142 20 164" {...arm} />
          <path d="M166 128 Q150 170 122 162" {...arm} />
        </>
      )}
      {mood === 'wow' && (
        <>
          <path d="M34 120 Q8 112 12 86" {...arm} />
          <path d="M166 120 Q192 112 188 86" {...arm} />
        </>
      )}
      <path d="M22 120 L62 64 L138 64 L178 120 L138 176 L62 176 Z" fill="#FFC531" stroke="#DE9800" strokeWidth="6" strokeLinejoin="round" />
      <path d="M42 114 L68 76 L132 76 L158 114 Z" fill="#FFE58F" />
      <path d="M64 48 L80 26 L120 26 L136 48 L120 62 L80 62 Z" fill="#3DBE5B" stroke="#25913F" strokeWidth="5" strokeLinejoin="round" />
      <path d="M82 34 L118 34 L126 44 L74 44 Z" fill="#8BE79C" />
      <ellipse cx="62" cy="136" rx="10" ry="6" fill="#FF8FA8" />
      <ellipse cx="138" cy="136" rx="10" ry="6" fill="#FF8FA8" />
      {mood === 'think' ? (
        <>
          <path d="M66 114 Q78 104 90 114" strokeWidth="5" {...ink} />
          <path d="M110 114 Q122 104 134 114" strokeWidth="5" {...ink} />
        </>
      ) : (
        <>
          <ellipse cx="78" cy="112" rx="14" ry="16" fill="#FFFFFF" />
          <ellipse cx="122" cy="112" rx="14" ry="16" fill="#FFFFFF" />
          <circle cx="81" cy="115" r="7.5" fill="#231A4F" />
          <circle cx="125" cy="115" r="7.5" fill="#231A4F" />
          <circle cx="84" cy="111" r="2.6" fill="#FFFFFF" />
          <circle cx="128" cy="111" r="2.6" fill="#FFFFFF" />
        </>
      )}
      {mood === 'happy' && <path d="M84 142 Q100 158 116 142" strokeWidth="5" {...ink} />}
      {mood === 'cheer' && <path d="M82 138 Q100 170 118 138 Z" fill="#C2264E" stroke="#231A4F" strokeWidth="4" strokeLinejoin="round" />}
      {mood === 'wow' && <ellipse cx="100" cy="148" rx="9" ry="11" fill="#C2264E" stroke="#231A4F" strokeWidth="4" />}
      {mood === 'think' && <path d="M88 148 L114 143" strokeWidth="5" {...ink} />}
    </svg>
  )
}
