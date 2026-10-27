import { useEffect, useState } from 'react'
import { Start } from './screens/Start'
import { AbakusTest } from './screens/AbakusTest'
import { Studio } from './studio/Studio'
import { Placeholder } from './screens/Placeholder'
import { Anmelden } from './screens/Anmelden'
import { Weltkarte } from './screens/Weltkarte'
import { Zuhause } from './screens/Zuhause'
import { Einheit } from './screens/Einheit'
import { VideoStation } from './screens/stations/VideoStation'
import { EntdeckenStation } from './screens/stations/EntdeckenStation'
import { UebenStation } from './screens/stations/UebenStation'
import { Rangliste } from './screens/Rangliste'
import { KursStation } from './screens/stations/KursStation'
import { kursAufgaben } from './data/kurs'
import { klasseVon } from './lib/klasse'
import { BlitzStation } from './screens/stations/BlitzStation'
import { KopfrechnenStation } from './screens/stations/KopfrechnenStation'
import { BossStation } from './screens/stations/BossStation'
import { unitContent, STATIONS } from './data/units'
import { unitVideos } from './data/videos'
import { WORLDS } from './data/curriculum'
import { DenkPark } from './screens/DenkPark'
import { Ich, Pokale } from './screens/Pokale'
import { Denkspiel } from './screens/Denkspiel'
import { Einstufung } from './screens/Einstufung'
import { findGame } from './games/registry'
import { tierFor, tierRank } from './games/engine'
import { findKid } from './data/demo'
import { getSession, saveSession } from './lib/session'
import { currentStation, getProgress, viewProgress } from './lib/progress'

const TITLES: Record<string, string> = {
  einheit: 'Einheit',
  station: 'Inhalte für diese Einheit folgen',
  shop: 'Shop',
  garderobe: 'Garderobe',
  pokale: 'Pokale & Abzeichen',
  rangliste: 'Rangliste',
  eltern: 'Eltern-Login',
  admin: 'Admin-Dashboard',
}

// Diese Seiten brauchen ein angemeldetes Kind.
const KID_ROUTES = ['karte', 'inseln', 'einheit', 'denkpark', 'einstufung', 'shop', 'garderobe', 'pokale', 'rangliste', ...STATIONS.map((s) => `station/${s.id}`)]

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
  if (route.startsWith('studio/')) return <Studio id={route.slice('studio/'.length).split('?')[0]} />

  if (KID_ROUTES.includes(route) || route.startsWith('spiel/')) {
    const session = getSession()
    const kid = session && findKid(session.classCode, session.kidId)
    if (!kid) return <Anmelden />
    const logout = () => { saveSession(null); window.location.hash = '#/anmelden' }
    const progress = getProgress(kid.id)
    if (route === 'karte') return <Zuhause kid={kid} progress={progress} onLogout={logout} />
    if (route === 'inseln') return <Weltkarte kid={kid} progress={progress} onLogout={logout} />
    if (route === 'pokale') return <Pokale kid={kid} progress={progress} />
    if (route === 'rangliste') return <Rangliste kid={kid} />
    if (route === 'garderobe') return <Ich kid={kid} progress={progress} onLogout={logout} />
    if (route === 'denkpark') return <DenkPark kid={kid} progress={progress} onLogout={logout} />
    if (route === 'einstufung') return <Einstufung kid={kid} />
    if (route.startsWith('spiel/')) {
      const game = findGame(route.slice(6))
      const open = game && game.ready && tierRank(tierFor(kid.birthYear)) >= tierRank(game.minTier)
      if (!game || !open) return <DenkPark kid={kid} progress={progress} onLogout={logout} />
      return <Denkspiel key={game.id} kid={kid} game={game} />
    }
    // Einheit und Stationen zeigen bei einer Wiederholung die gewählte, schon geschaffte Einheit
    const unitView = viewProgress(kid.id)
    if (route === 'einheit') return <Einheit progress={unitView} />
    if (route.startsWith('station/')) {
      const progress = unitView
      const id = route.slice(8)
      const content = unitContent(progress.world, progress.unit)
      const index = STATIONS.findIndex((s) => s.id === id)
      // gesperrte Stationen führen zurück zur Einheit
      if (index > currentStation(progress)) return <Einheit progress={progress} />
      const videos = unitVideos(progress.world, progress.unit)
      if (id === 'video' && videos.length) {
        const title = content?.title ?? WORLDS[progress.world - 1].units[progress.unit - 1]
        // fortlaufende Lektionsnummer über alle Welten
        const lektion = WORLDS.slice(0, progress.world - 1).reduce((n, w) => n + w.units.length, 0) + progress.unit
        return <VideoStation kidId={kid.id} title={title} lektion={lektion} videos={videos} learn={content?.learn} rule={content?.rule} />
      }
      if (content && id === 'entdecken') return <EntdeckenStation kidId={kid.id} content={content} />
      // Üben: Aufgaben aus dem Abakus-Kurs, sonst zufällige Aufgaben
      const kurs = klasseVon(kid.id).aufgaben <= 6 ? null : kursAufgaben(progress.world, progress.unit)
      if (kurs && id === 'ueben') return <KursStation kidId={kid.id} aufgaben={kurs} />
      if (content && id === 'ueben') return <UebenStation kidId={kid.id} content={content} />
      if (content && id === 'blitz') return <BlitzStation kidId={kid.id} content={content} />
      if (content && id === 'kopfrechnen') return <KopfrechnenStation kidId={kid.id} content={content} />
      if (content && id === 'boss') return <BossStation kidId={kid.id} content={content} world={progress.world} unit={progress.unit} />
      return <Placeholder title={content ? STATIONS[index].title : `${STATIONS[index].title}: Inhalte folgen`} back={{ href: '#/einheit', label: 'Zur Einheit' }} />
    }
  }
  return <Placeholder title={TITLES[route] ?? 'Unbekannte Seite'} />
}
