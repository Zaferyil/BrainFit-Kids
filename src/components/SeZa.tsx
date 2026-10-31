import { artikel, konto, type Ausstattung } from '../lib/wirtschaft'

// SeZa: fertiges Kostümbild, dahinter der gewählte Hintergrund, außen der gewählte Rahmen.

type Props = { kidId?: string; an?: Ausstattung; groesse?: number | string; jubel?: boolean; className?: string }

export function SeZa({ kidId, an, groesse = 220, jubel, className = '' }: Props) {
  const aus = an ?? (kidId ? konto(kidId).an : { outfit: 'original' })
  const kostuem = artikel(aus.outfit) ?? artikel('original')!
  const hgA = artikel(aus.hg)
  const hg = hgA ? (hgA.css ?? 'hg-bild') : ''
  const rahmen = artikel(aus.rahmen)?.css ?? ''
  return (
    <div className={`seza ${hg} ${rahmen} ${jubel ? 'jubel' : ''} ${className}`} style={{ width: groesse, backgroundImage: hgA?.bild ? `url(${hgA.bild})` : undefined }} role="img" aria-label={`SeZa als ${kostuem.name}`}>
      <img className="seza-kostuem" src={kostuem.bild} alt="" draggable={false} />
    </div>
  )
}

/** Runder Kopf-Ausschnitt von SeZa im aktuellen Kostüm (für Avatar, Rangliste, Admin) */
export function SeZaKopf({ kidId, size, ring }: { kidId: string; size: number; ring?: string }) {
  const an = konto(kidId).an
  const k = artikel(an.outfit) ?? artikel('original')!
  const r = artikel(an.rahmen)?.css
  return (
    <span className={`seza-kopf ${r ?? ''}`} role="img" aria-label="SeZa"
      style={{ width: size, height: size, minWidth: size, backgroundImage: `url(${k.bild})`, backgroundPosition: k.kopfAusschnitt ?? '55% 22%', boxShadow: ring ? `0 0 0 ${Math.max(2, size / 20)}px ${ring}` : undefined }} />
  )
}
