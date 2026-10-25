import { useEffect, useState } from 'react'

const QUERY = '(orientation: portrait) and (max-width: 900px)'

/** true auf Handy und Tablet im Hochformat – Spiele ordnen sich dann höher als breit an. */
export function usePortrait() {
  const [portrait, setPortrait] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const on = () => setPortrait(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return portrait
}
