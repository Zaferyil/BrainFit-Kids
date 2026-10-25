// Boss Grummel, der Zahlenfresser
export function Grummel({ size = 300, hit = false }: { size?: number; hit?: boolean }) {
  return (
    <svg width={size} height={size * 250 / 300} viewBox="0 0 300 250" role="img" aria-label="Boss Grummel" className={hit ? 'grummel hit' : 'grummel'}>
      <path d="M78 70 L60 10 L108 52 Z" fill="#FFC531" stroke="#B8860B" strokeWidth="5" strokeLinejoin="round" />
      <path d="M222 70 L240 10 L192 52 Z" fill="#FFC531" stroke="#B8860B" strokeWidth="5" strokeLinejoin="round" />
      <path d="M40 160 C40 80 90 46 150 46 C210 46 260 80 260 160 C260 210 220 236 150 236 C80 236 40 210 40 160 Z" fill="#7B3FD0" stroke="#4A1F8F" strokeWidth="6" />
      <path d="M70 150 C70 100 100 76 150 76 C200 76 230 100 230 150" fill="none" stroke="#9A63E6" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
      <path d="M90 108 L134 124" stroke="#231A4F" strokeWidth="9" strokeLinecap="round" />
      <path d="M210 108 L166 124" stroke="#231A4F" strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="114" cy="140" rx="17" ry="19" fill="#FFFFFF" />
      <ellipse cx="186" cy="140" rx="17" ry="19" fill="#FFFFFF" />
      <circle cx="118" cy="144" r="8" fill="#231A4F" />
      <circle cx="182" cy="144" r="8" fill="#231A4F" />
      <path d="M100 190 Q150 176 200 190 Q150 222 100 190 Z" fill="#2A0F3E" />
      <path d="M118 186 L124 198 L130 184 M160 183 L166 197 L172 186" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
      <text x="38" y="96" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="30" fill="#FFC531" opacity="0.7">7</text>
      <text x="248" y="120" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="26" fill="#3BA7FF" opacity="0.7">5</text>
    </svg>
  )
}
