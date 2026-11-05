import type { ReactNode } from 'react'
import { Abakus3D } from './Abakus3D'
import { Bead, type BeadColor } from './Bead'
import { Icon, type IconName } from './Icon'

// Kleines Vorschaubild je Denkspiel im Denk-Park: zeigt, worum es im Spiel geht
// (Abakus-Spiele mit dem Abakus der App, Perlen-Spiele mit den App-Perlen).

const Karte = ({ children, farbe = '#fff', dreh = 0 }: { children?: ReactNode; farbe?: string; dreh?: number }) => (
  <span className="sb-karte" style={{ background: farbe, rotate: `${dreh}deg` }}>{children}</span>
)

export function SpielBild({ id, fallback }: { id: string; fallback: IconName }) {
  switch (id) {
    case 'abakusrechnen':
      return <span className="sb sb-abakus"><Abakus3D value={23} cols={2} colw={22} /><b className="sb-zeichen">+</b></span>
    case 'sorobankarten':
      return <span className="sb sb-abakus"><Abakus3D value={7} cols={1} colw={26} /><b className="sb-blitz">⚡</b></span>
    case 'vergleich':
      return <span className="sb sb-abakus sb-zwei"><Abakus3D value={4} cols={1} colw={18} /><b className="sb-zeichen klein">&gt;</b><Abakus3D value={2} cols={1} colw={18} /></span>
    case 'schnellzaehlen':
      return <span className="sb sb-frei">{(['yellow', 'green', 'blue', 'pink', 'orange', 'purple'] as BeadColor[]).map((c, i) => <span key={c} style={{ left: `${[8, 46, 20, 60, 34, 70][i]}%`, top: `${[14, 10, 46, 42, 70, 72][i]}%` }}><Bead color={c} width={30} /></span>)}</span>
    case 'kette':
      return <span className="sb sb-kette">{(['pink', 'yellow', 'green', 'blue'] as BeadColor[]).map((c) => <Bead key={c} color={c} width={30} />)}</span>
    case 'memory':
      return <span className="sb sb-karten"><Karte dreh={-8}><Bead color="pink" width={34} /></Karte><Karte dreh={6} farbe="#7B5CFF"><b className="sb-frage">?</b></Karte></span>
    case 'bildermerken':
      return <span className="sb sb-karten"><Karte dreh={-10}>🐱</Karte><Karte>🚀</Karte><Karte dreh={10}>🍎</Karte></span>
    case 'zahlenmerken':
      return <span className="sb sb-zahlen"><b>3</b><b>8</b><b>5</b></span>
    case 'jagd':
      return <span className="sb sb-jagd"><span className="sb-reihe"><Bead color="blue" width={26} /><Bead color="pink" width={26} /><Bead color="blue" width={26} /></span><span className="sb-reihe"><Bead color="yellow" width={26} /><Bead color="blue" width={26} /><Bead color="green" width={26} /></span><span className="sb-lupe"><Icon name="search" color="#231A4F" size={34} strokeWidth={2.8} /></span></span>
    case 'farbwort':
      return <span className="sb sb-farbwort"><b style={{ color: '#3BA7FF' }}>ROT</b><b style={{ color: '#FF4D6D' }}>GELB</b></span>
    case 'muster':
      return <span className="sb sb-kette"><Bead color="yellow" width={26} /><Bead color="blue" width={26} /><Bead color="yellow" width={26} /><Bead color="blue" width={26} /><b className="sb-frage dunkel">?</b></span>
    default:
      return <span className="sb"><Icon name={fallback} color="#231A4F" size={46} strokeWidth={2.2} /></span>
  }
}
