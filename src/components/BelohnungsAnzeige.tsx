import { useEffect, useState } from 'react'
import { SeZa } from './SeZa'
import type { BelohnungsEreignis } from '../lib/wirtschaft'

// Kurze Belohnungs-Anzeige über jedem Bildschirm: Sterne/Diamanten fliegen, SeZa freut sich.
export function BelohnungsAnzeige({ kidId }: { kidId: string | null }) {
  const [liste, setListe] = useState<(BelohnungsEreignis & { n: number })[]>([])
  useEffect(() => {
    let n = 0
    const an = (e: Event) => {
      const d = (e as CustomEvent<BelohnungsEreignis>).detail
      const x = { ...d, n: ++n }
      setListe((l) => [...l.slice(-1), x])
      window.setTimeout(() => setListe((l) => l.filter((y) => y.n !== x.n)), 3200)
    }
    window.addEventListener('bfk-belohnung', an)
    return () => window.removeEventListener('bfk-belohnung', an)
  }, [])
  if (!kidId || !liste.length) return null
  const e = liste[liste.length - 1]
  return (
    <div className="belohnung" role="status" key={e.n}>
      <div className="belohnung-flug" aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i}>{e.diamanten && !e.sterne ? '💎' : e.level ? '🎉' : '⭐'}</i>)}</div>
      <SeZa kidId={kidId} groesse={78} jubel />
      <div className="belohnung-text">
        <b>{e.text}</b>
        {(e.sterne > 0 || e.diamanten > 0) && <span>{e.sterne ? `+${e.sterne} ⭐` : ''} {e.diamanten ? `+${e.diamanten} 💎` : ''}</span>}
      </div>
    </div>
  )
}
