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
  const teile = EBENEN.filter((s) => s !== 'outfit' && s !== 'hintergrund').map((s) => [s, artikel(aus[s])] as [Slot, Artikel | undefined])
    .filter(([, a]) => a && passt(kostuem, a)) as [Slot, Artikel][]
  const hg = artikel(aus.hintergrund)
  const pos = (x: number, y: number, b?: number) => ({ left: `${x * 100}%`, top: `${y * 100}%`, ...(b ? { width: `${b * 100}%` } : {}) })
  return (
    <div className={`seza ${jubel ? 'jubel' : ''} ${hg?.css ? `hg-${hg.css}` : ''} ${className}`} style={{ width: groesse }} role="img" aria-label={`SeZa als ${kostuem.name}`}>
      <img className="seza-kostuem" src={kostuem.bild} alt="" draggable={false} />
      {teile.map(([slot, a]) => {
        if (slot === 'effekt') return <span key={slot} className={`seza-effekt ${a.css}`} aria-hidden="true">{a.css === 'glitzer' && <><i /><i /><i /><i /><i /></>}</span>
        if (slot === 'hand' && a.id === 'gold-abakus') return (
          <div key={slot} className="seza-teil hand gold" style={{ ...pos(k.hand.x, k.hand.y, k.hand.b), rotate: `${k.hand.r ?? 0}deg` }}>
            <Fit><Abakus value={123} cols={3} colw={60} /></Fit>
          </div>
        )
        const ort = slot === 'brille' ? (k.augen && pos(k.augen.x, k.augen.y, k.augen.b))
          : slot === 'kopf' ? (k.kopf && pos(k.kopf.x, k.kopf.y, k.kopf.b))
          : slot === 'hand' ? pos(k.hand.x, k.hand.y, k.hand.b)
          : slot === 'ruecken' ? pos(k.ruecken.x, k.ruecken.y, .3)
          : slot === 'fuesse' ? pos(k.fuesse.x, k.fuesse.y, .34)
          : pos(k.begleiter.x, k.begleiter.y, .32)
        return ort ? <img key={slot} className={`seza-teil ${slot}`} style={ort} src={a.bild} alt="" draggable={false} /> : null
      })}
    </div>
  )
}
