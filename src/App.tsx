import { useEffect, useState } from 'react'
import { Start } from './screens/Start'
import { AbakusTest } from './screens/AbakusTest'
import { Placeholder } from './screens/Placeholder'
import { Anmelden } from './screens/Anmelden'
import { Weltkarte } from './screens/Weltkarte'
import { Einheit } from './screens/Einheit'
import { VideoStation } from './screens/stations/VideoStation'
import { EntdeckenStation } from './screens/stations/EntdeckenStation'
import { UebenStation } from './screens/stations/UebenStation'
import { BlitzStation } from './screens/stations/BlitzStation'
import { KopfrechnenStation } from './screens/stations/KopfrechnenStation'
import { BossStation } from './screens/stations/BossStation'
import { unitContent, STATIONS } from './data/units'
import { findKid } from './data/demo'
import { getSession, saveSession } from './lib/session'
import { currentStation, getProgress } from './lib/progress'

const TITLES: Record<string, string> = {
  einheit: 'Einheit',
  station: 'Inhalte für diese Einheit folgen',
  denkpark: 'Denk-Park',
  shop: 'Shop',
  garderobe: 'Garderobe',
  pokale: 'Pokale & Abzeichen',
  eltern: 'Eltern-Login',
  admin: 'Admin-Dashboard',
}

// Diese Seiten brauchen ein angemeldetes Kind.
const KID_ROUTES = ['karte', 'einheit', 'denkpark', 'shop', 'garderobe', 'pokale', ...STATIONS.map((s) => `station/${s.id}`)]

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
    const progress = getProgress(kid.id)
    if (route === 'einheit') return <Einheit progress={progress} />
    if (route.startsWith('station/')) {
      const id = route.slice(8)
      const content = unitContent(progress.world, progress.unit)
      const index = STATIONS.findIndex((s) => s.id === id)
      // gesperrte Stationen führen zurück zur Einheit
      if (index > currentStation(progress)) return <Einheit progress={progress} />
      if (content && id === 'video') return <VideoStation kidId={kid.id} content={content} />
      if (content && id === 'entdecken') return <EntdeckenStation kidId={kid.id} content={content} />
      if (content && id === 'ueben') return <UebenStation kidId={kid.id} content={content} />
      if (content && id === 'blitz') return <BlitzStation kidId={kid.id} content={content} />
      if (content && id === 'kopfrechnen') return <KopfrechnenStation kidId={kid.id} content={content} />
      if (content && id === 'boss') return <BossStation kidId={kid.id} content={content} world={progress.world} unit={progress.unit} />
      return <Placeholder title={content ? STATIONS[index].title : `${STATIONS[index].title}: Inhalte folgen`} />
    }
  }
  return <Placeholder title={TITLES[route] ?? 'Unbekannte Seite'} />
}
