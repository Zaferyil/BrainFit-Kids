import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Skaliert einen Inhalt mit fester Größe (Abakus, Karte, Spielfeld) so,
 * dass er in den verfügbaren Platz passt – nie größer als `max`.
 * Der äußere Kasten bekommt seine Größe vom Layout (flex, Höhe, aspect-ratio).
 */
export function Fit({ children, max = 1, className = '' }: { children: ReactNode; max?: number; className?: string }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const measure = () => {
      const iw = i.offsetWidth
      const ih = i.offsetHeight
      if (!iw || !ih) return
      setScale(Math.min(max, o.clientWidth / iw, o.clientHeight / ih))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(o)
    ro.observe(i)
    return () => ro.disconnect()
  }, [max])

  return (
    <div ref={outer} className={`fit ${className}`}>
      <div ref={inner} className="fit-inner" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}
