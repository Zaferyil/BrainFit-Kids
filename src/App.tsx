import type { ComponentType } from 'react'
import { usePath } from './router'
import { Start } from './screens/Start'
import { Anmelden } from './screens/Anmelden'
import { Weltkarte } from './screens/Weltkarte'
import { Einheit } from './screens/Einheit'
import { Video } from './screens/Video'
import { Entdecken } from './screens/Entdecken'
import { Ueben } from './screens/Ueben'
import { Blitz } from './screens/Blitz'
import { Kopfrechnen } from './screens/Kopfrechnen'
import { Boss } from './screens/Boss'
import { Ergebnis } from './screens/Ergebnis'
import { Shop } from './screens/Shop'
import { Garderobe } from './screens/Garderobe'
import { Rangliste } from './screens/Rangliste'
import { Pokale } from './screens/Pokale'
import { ElternLogin } from './screens/ElternLogin'
import { ElternDashboard } from './screens/ElternDashboard'
import { Lernbericht } from './screens/Lernbericht'
import { ElternEinstellungen } from './screens/ElternEinstellungen'
import { AdminDashboard } from './screens/AdminDashboard'
import { AdminSchueler } from './screens/AdminSchueler'
import { AdminSchuelerDetail } from './screens/AdminSchuelerDetail'
import { AdminInhalte } from './screens/AdminInhalte'
import { AdminShop } from './screens/AdminShop'
import './styles.css'

const routes: Record<string, ComponentType> = {
  '/': Start,
  '/anmelden': Anmelden,
  '/karte': Weltkarte,
  '/einheit': Einheit,
  '/video': Video,
  '/entdecken': Entdecken,
  '/ueben': Ueben,
  '/blitz': Blitz,
  '/kopfrechnen': Kopfrechnen,
  '/boss': Boss,
  '/ergebnis': Ergebnis,
  '/shop': Shop,
  '/garderobe': Garderobe,
  '/rangliste': Rangliste,
  '/pokale': Pokale,
  '/eltern': ElternLogin,
  '/eltern/uebersicht': ElternDashboard,
  '/eltern/bericht': Lernbericht,
  '/eltern/einstellungen': ElternEinstellungen,
  '/admin': AdminDashboard,
  '/admin/schueler': AdminSchueler,
  '/admin/schueler/lena': AdminSchuelerDetail,
  '/admin/inhalte': AdminInhalte,
  '/admin/shop': AdminShop,
}

export default function App() {
  const Screen = routes[usePath()] ?? Start
  return <Screen />
}
