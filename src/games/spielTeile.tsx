import { useEffect, useRef, useState } from 'react'

// Gemeinsame Teile der neueren Denkspiele: Zeitleiste, Punktestand und ein sicheres Spielende.

/** Countdown in Sekunden; ruft onEnde genau einmal auf. Bei aktiv = false läuft die Zeit nicht. */
export function useSpielzeit(sek: number, aktiv: boolean, onEnde: () => void) {
  const [rest, setRest] = useState(sek)
  const ende = useRef(onEnde)
  ende.current = onEnde
  useEffect(() => {
    if (!aktiv) return
    if (rest <= 0) { ende.current(); return }
    const t = window.setTimeout(() => setRest((r) => r - 1), 1000)
    return () => window.clearTimeout(t)
  }, [rest, aktiv])
  return rest
}

/** onFinish nur einmal auslösen */
export function useEinmal(fn: (score: number, text: string) => void) {
  const fertig = useRef(false)
  return (score: number, text: string) => {
    if (fertig.current) return
    fertig.current = true
    fn(Math.max(0, Math.min(1, score)), text)
  }
}

export function SpielKopf({ rest, gesamt, punkte }: { rest?: number; gesamt?: number; punkte: number }) {
  return (
    <div className="bal-kopf">
      {rest !== undefined && gesamt ? <div className="bal-zeit" aria-label={`Noch ${rest} Sekunden`}><span>⏳</span><i style={{ width: `${(100 * rest) / gesamt}%` }} /></div> : <span style={{ flex: 1 }} />}
      <div className="bal-punkte">🎓 {punkte}</div>
    </div>
  )
}

export const FARBEN = [
  { id: 'rot', hex: '#FF4D6D', name: 'Rot' }, { id: 'blau', hex: '#3BA7FF', name: 'Blau' }, { id: 'gelb', hex: '#FFC531', name: 'Gelb' },
  { id: 'gruen', hex: '#3DBE5B', name: 'Grün' }, { id: 'lila', hex: '#7B5CFF', name: 'Lila' }, { id: 'orange', hex: '#FF8A1F', name: 'Orange' },
]

/** runde Perle in einer Farbe */
export function Perle({ farbe, groesse = 44 }: { farbe: string; groesse?: number }) {
  return <span className="sp-perle" style={{ width: groesse, height: groesse, ['--f' as string]: farbe }} />
}
