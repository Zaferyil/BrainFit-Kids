import { useEffect, useState } from 'react'
import { Start } from './screens/Start'
import { AbakusTest } from './screens/AbakusTest'
import { Placeholder } from './screens/Placeholder'

const TITLES: Record<string, string> = {
  anmelden: 'Anmelden',
  karte: 'Weltkarte',
  shop: 'Shop',
  garderobe: 'Garderobe',
  rangliste: 'Rangliste',
  pokale: 'Pokale & Abzeichen',
  eltern: 'Eltern-Login',
  admin: 'Admin-Dashboard',
}

function useRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const onHash = () => setRoute(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  if (route === '') return <Start />
  if (route === 'abakus-test') return <AbakusTest />
  return <Placeholder title={TITLES[route] ?? 'Unbekannte Seite'} />
}
