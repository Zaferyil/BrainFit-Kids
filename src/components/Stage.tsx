import type { ReactNode } from 'react'

// Bildschirm-Hülle: füllt das Fenster. Inhalte ordnen sich je nach Breite an
// (Tablet quer, Tablet hoch, Handy); feste Zeichnungen skaliert <Fit>.
export function Stage({ children, background = 'var(--night)', className = '' }: { children: ReactNode; background?: string; className?: string }) {
  return (
    <div className={`stage ${className}`} style={{ background }}>
      {children}
    </div>
  )
}
