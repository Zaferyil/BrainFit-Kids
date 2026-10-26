import type { ReactNode } from 'react'

// Bildschirm-Hülle: füllt das Fenster. Inhalte ordnen sich je nach Breite an
// (Tablet quer, Tablet hoch, Handy); feste Zeichnungen skaliert <Fit>.
// Alle Bildschirme tragen den neuen Look (.nk): Farbverlauf-Himmel und helle Glas-Flächen.
export function Stage({ children, background = 'var(--nk-sky)', className = 'nk' }: { children: ReactNode; background?: string; className?: string }) {
  return (
    <div className={`stage nk ${className}`} style={{ background }}>
      {children}
    </div>
  )
}
