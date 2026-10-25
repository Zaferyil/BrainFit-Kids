import { useEffect, useState, type ReactNode } from 'react'

export const STAGE_W = 1194
export const STAGE_H = 834

// Kinder-Bildschirme sind für ein Tablet im Querformat (1194×834) gestaltet
// und werden passend in das Fenster skaliert.
export function Stage({ children, background = 'var(--night)' }: { children: ReactNode; background?: string }) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return (
    <div className="stage-viewport" style={{ background }}>
      <div className="stage" style={{ width: STAGE_W, height: STAGE_H, background, transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}
