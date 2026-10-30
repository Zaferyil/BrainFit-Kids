import { Abakus } from './Abakus'
import { Fit } from './Fit'
import { EBENEN, passt, type Artikel, type Slot } from '../data/seza'
import { artikel, konto, type Ausstattung } from '../lib/wirtschaft'

// SeZa mit Ebenen: Hintergrund, Kostüm, dann Accessoires an den Ankerpunkten des Kostüms, vorn die Effekte.
// Der Goldene Abakus ist der echte App-Abakus (1 Himmelsperle, 4 Erdperlen je Stange), golden eingefärbt.

type Props = { kidId?: string; an?: Ausstattung; groesse?: number | string; jubel?: boolean; className?: string }

export function SeZa({ kidId, an, groesse = 220, jubel, className = '' }: Props) {
  const aus = an ?? (kidId ? konto(kidId).an : { outfit: 'original' })
  const kostuem = artikel(aus.outfit) ?? artikel('original')!
  const k = kostuem.anker!
  const teile = EBENEN.filter((s) => s !== 'outfit').map((s) => [s, artikel(aus[s])] as [Slot, Artikel | undefined])
    .filter(([, a]) => a && passt(kostuem, a)) as [Slot, Artikel][]
  const pos = (x: number, y: number, b: number) => ({ left: `${x * 100}%`, top: `${y * 100}%`, width: `${b * 100}%` })
  return (
    <div className={`seza ${jubel ? 'jubel' : ''} ${className}`} style={{ width: groesse }} role="img" aria-label={`SeZa als ${kostuem.name}`}>
      <img className="seza-kostuem" src={kostuem.bild} alt="" draggable={false} />
      {teile.map(([slot, a]) => {
        // Goldener Abakus: der echte App-Abakus (1 Himmelsperle, 4 Erdperlen) golden, über dem Abakus in der Hand
        if (slot === 'hand') return (
          <div key={slot} className="seza-teil hand gold" style={{ ...pos(k.hand.x, k.hand.y, k.hand.b), rotate: `${k.hand.r ?? 0}deg` }}>
            <Fit><Abakus value={123} cols={3} colw={60} /></Fit>
          </div>
        )
        const ort = slot === 'brille' ? k.augen && pos(k.augen.x, k.augen.y, k.augen.b) : pos(k.begleiter.x, k.begleiter.y, .34)
        return ort ? <img key={slot} className={`seza-teil ${slot}`} style={ort} src={a.bild} alt="" draggable={false} /> : null
      })}
    </div>
  )
}

/** Runder Kopf-Ausschnitt von SeZa im aktuellen Kostüm (für Avatar, Rangliste, Admin) */
export function SeZaKopf({ kidId, size, ring }: { kidId: string; size: number; ring?: string }) {
  const k = artikel(konto(kidId).an.outfit) ?? artikel('original')!
  return (
    <span className="seza-kopf" role="img" aria-label="SeZa"
      style={{ width: size, height: size, minWidth: size, backgroundImage: `url(${k.bild})`, backgroundPosition: k.kopfAusschnitt ?? '55% 22%', boxShadow: ring ? `0 0 0 ${Math.max(2, size / 20)}px ${ring}` : undefined }} />
  )
}
