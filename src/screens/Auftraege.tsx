import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { auftragStand, meineAuftraege, type Auftrag } from '../lib/auftraege'
import { Funkeln } from './Anmelden'

// Aufträge der Lehrkraft für das Kind: was zu tun ist, wie weit es ist, und ein Knopf zum Loslegen.

const link = (a: Auftrag) => (a.art === 'anzan' ? '#/anzan' : a.art === 'spiel' ? `#/spiel/${a.ziel.spiel}` : a.art === 'wiederholen' ? '#/wiederholen' : `#/pruefung/${a.ziel.welt}`)

export function Auftraege({ kid }: { kid: Kid }) {
  const [liste, setListe] = useState<Auftrag[] | null>(null)
  useEffect(() => { void meineAuftraege(kid.id).then(setListe) }, [kid.id])
  const st = auftragStand(kid.id)
  return (
    <Stage background="linear-gradient(180deg, #2A1B8C 0%, #5B47D6 50%, #FF6FB5 100%)">
      <Funkeln />
      <div className="pr">
        <a href="#/karte" className="pr-zurueck" aria-label="Zurück"><Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} /></a>
        <h1 className="af-titel">📋 Meine Hausaufgaben</h1>
        {liste === null && <p className="af-leer">Einen Moment …</p>}
        {liste?.length === 0 && <p className="af-leer">Deine Lehrkraft hat dir gerade keine Hausaufgaben gegeben. 🎉</p>}
        {liste?.map((a) => {
          const n = a.ziel.anzahl ?? 1, k = Math.min(n, st[a.id] ?? 0), fertig = k >= n
          return (
            <div key={a.id} className={fertig ? 'af-karte fertig' : 'af-karte'}>
              <div className="af-text">
                <strong>{a.titel}</strong>
                {a.faellig && <small>bis {new Date(a.faellig).toLocaleDateString('de-AT')}</small>}
                <div className="pk-track"><div style={{ width: `${(k / n) * 100}%` }} /></div>
              </div>
              {fertig ? <span className="af-ok">✓</span> : <a className="af-los" href={link(a)}>{k}/{n} ▶</a>}
            </div>
          )
        })}
      </div>
    </Stage>
  )
}
