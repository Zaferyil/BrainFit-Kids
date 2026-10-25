import { useEffect, useState } from 'react'
import { Start } from './screens/Start'
import { AbakusTest } from './screens/AbakusTest'
import { Placeholder } from './screens/Placeholder'
import { Anmelden } from './screens/Anmelden'
import { Weltkarte } from './screens/Weltkarte'
import { findKid } from './data/demo'
import { getSession, saveSession } from './lib/session'
import { getProgress } from './lib/progress'

const TITLES: Record<string, string> = {
  einheit: 'Einheit',
  denkpark: 'Denk-Park',
  shop: 'Shop',
  garderobe: 'Garderobe',
  pokale: 'Pokale & Abzeichen',
  eltern: 'Eltern-Login',
  admin: 'Admin-Dashboard',
}

// Diese Seiten brauchen ein angemeldetes Kind.
const KID_ROUTES = ['karte', 'einheit', 'denkpark', 'shop', 'garderobe', 'pokale']

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
  if (route === 'anmelden') return <Anmelden />
  if (route === 'abakus-test') return <AbakusTest />

  if (KID_ROUTES.includes(route)) {
    const session = getSession()
    const kid = session && findKid(session.classCode, session.kidId)
    if (!kid) return <Anmelden />
    if (route === 'karte') {
      const logout = () => { saveSession(null); window.location.hash = '#/anmelden' }
      return <Weltkarte kid={kid} progress={getProgress(kid.id)} onLogout={logout} />
    }
  }
  return <Placeholder title={TITLES[route] ?? 'Unbekannte Seite'} />
}
