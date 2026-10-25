export type Hat = 'none' | 'cap' | 'crown' | 'wizard' | 'phones' | 'band'

export type AvatarLook = {
  skin?: string
  hair?: string
  shirt?: string
  hat?: Hat
  hatColor?: string
  belt?: string
  glasses?: boolean
  bg?: string
}

type Props = AvatarLook & { size?: number }

export function Avatar({
  size = 160, skin = '#F6C9A6', hair = '#6B3E1F', shirt = '#3BA7FF', hat = 'none',
  hatColor = '#FF4D6D', belt = '', glasses = false, bg = '#5B47D6',
}: Props) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Avatar"
      style={{ borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}
    >
      {bg && bg !== 'none' && <circle cx="60" cy="60" r="60" fill={bg} />}
      <path d="M20 122 C20 94 38 80 60 80 C82 80 100 94 100 122 Z" fill={shirt} />
      <path d="M48 81 L60 94 L72 81" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="3" strokeLinejoin="round" />
      {belt && (
        <>
          <rect x="27" y="104" width="66" height="8" rx="3" fill={belt} stroke="#231A4F" strokeOpacity="0.25" strokeWidth="1.5" />
          <rect x="54" y="101" width="12" height="14" rx="3" fill={belt} stroke="#231A4F" strokeOpacity="0.35" strokeWidth="1.5" />
        </>
      )}
      <rect x="52" y="68" width="16" height="16" rx="5" fill={skin} />
      <circle cx="60" cy="50" r="26" fill={skin} />
      <path d="M33 50 C31 27 46 19 60 19 C75 19 89 27 87 50 C82 39 72 33 60 33 C49 33 39 39 33 50 Z" fill={hair} />
      <circle cx="50" cy="52" r="3.4" fill="#231A4F" />
      <circle cx="70" cy="52" r="3.4" fill="#231A4F" />
      <ellipse cx="44" cy="60" rx="4.5" ry="2.8" fill="#FF8FA8" opacity="0.8" />
      <ellipse cx="76" cy="60" rx="4.5" ry="2.8" fill="#FF8FA8" opacity="0.8" />
      <path d="M51 61 Q60 69 69 61" fill="none" stroke="#231A4F" strokeWidth="3" strokeLinecap="round" />
      {glasses && (
        <>
          <circle cx="50" cy="52" r="8" fill="none" stroke="#231A4F" strokeWidth="2.5" />
          <circle cx="70" cy="52" r="8" fill="none" stroke="#231A4F" strokeWidth="2.5" />
          <line x1="58" y1="52" x2="62" y2="52" stroke="#231A4F" strokeWidth="2.5" />
        </>
      )}
      {hat === 'cap' && (
        <>
          <path d="M33 40 C33 24 46 15 60 15 C74 15 87 24 87 40 Z" fill={hatColor} />
          <path d="M80 35 L104 39 C106 40 105 45 102 45 L80 42 Z" fill={hatColor} />
          <circle cx="60" cy="16" r="4" fill="#FFFFFF" opacity="0.7" />
        </>
      )}
      {hat === 'crown' && (
        <>
          <path d="M38 34 L40 12 L50 24 L60 6 L70 24 L80 12 L82 34 Z" fill="#FFC531" stroke="#DE9800" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="60" cy="24" r="3.5" fill="#FF4D6D" />
        </>
      )}
      {hat === 'wizard' && (
        <>
          <path d="M30 36 L60 -2 L90 36 Z" fill={hatColor} stroke="#231A4F" strokeOpacity="0.3" strokeWidth="2" strokeLinejoin="round" />
          <path d="M56 18 L58 22 L62 22 L59 25 L60 29 L56 27 L52 29 L53 25 L50 22 L54 22 Z" fill="#FFC531" />
        </>
      )}
      {hat === 'phones' && (
        <>
          <path d="M32 52 C32 22 88 22 88 52" fill="none" stroke={hatColor} strokeWidth="6" strokeLinecap="round" />
          <rect x="26" y="44" width="11" height="20" rx="5" fill={hatColor} />
          <rect x="83" y="44" width="11" height="20" rx="5" fill={hatColor} />
        </>
      )}
      {hat === 'band' && (
        <>
          <rect x="33" y="32" width="54" height="8" rx="4" fill={hatColor} />
          <path d="M84 36 L98 30 L96 44 Z" fill={hatColor} />
        </>
      )}
    </svg>
  )
}
