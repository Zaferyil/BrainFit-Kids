import { useEffect, useState, type ReactNode } from 'react'

const W = 1194
const H = 834

const fit = () => Math.min(window.innerWidth / W, window.innerHeight / H)

type Props = { children: ReactNode; bg?: string }

/** Kinder-Bildschirme sind für 1194 × 834 gezeichnet und werden auf das Fenster skaliert. */
export function Stage({ children, bg = 'var(--bg)' }: Props) {
  const [scale, setScale] = useState(fit)
  useEffect(() => {
    const onResize = () => setScale(fit())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return (
    <div className="stage" style={{ background: bg }}>
      <div className="stage-frame" style={{ width: W * scale, height: H * scale }}>
        <div className="screen" style={{ background: bg, transform: `scale(${scale})` }}>{children}</div>
      </div>
    </div>
  )
}
