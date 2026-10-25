import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import { Stage } from '../../components/Stage'
import { Bead } from '../../components/Bead'
import { STATIONS, type StationId } from '../../data/units'

type Props = {
  station: StationId
  title: string
  /** Fortschrittspunkte: 'right' | 'wrong' | 'current' | 'open' */
  dots?: ('right' | 'wrong' | 'current' | 'open')[]
  perlen?: number
  children: ReactNode
}

export function StationShell({ station, title, dots, perlen, children }: Props) {
  const i = STATIONS.findIndex((s) => s.id === station)
  return (
    <Stage>
      <div className="station-screen">
        <div className="station-bar">
          <a href="#/einheit" aria-label="Station beenden" className="round-btn big"><Icon name="x" color="#FFFFFF" size={26} /></a>
          <div className="station-bar-title">
            <div className="eyebrow light">STATION {i + 1} VON 6 · {STATIONS[i].title.toUpperCase()}</div>
            <h1>{title}</h1>
          </div>
          {dots && (
            <div className="task-dots" aria-label="Fortschritt">
              {dots.map((d, k) => <span key={k} className={`task-dot ${d}`} />)}
            </div>
          )}
          {perlen !== undefined && (
            <div className="chip"><Bead color="yellow" width={28} /><span>+{perlen}</span></div>
          )}
        </div>
        {children}
      </div>
    </Stage>
  )
}

export function StationDone({ stars, perlen, text }: { stars: number; perlen: number; text: string }) {
  return (
    <div className="done-overlay" role="dialog" aria-label="Station geschafft">
      <div className="done-card">
        <Perli mood="cheer" size={150} />
        <h2>Geschafft!</h2>
        <div className="done-stars" aria-label={`${stars} von 3 Sternen`}>
          {[0, 1, 2].map((k) => (
            <Icon key={k} name="star" size={64} color="#DE9800" fill={k < stars ? '#FFC531' : 'none'} strokeWidth={1.8} />
          ))}
        </div>
        <p>{text}</p>
        <div className="done-reward"><Bead color="yellow" width={36} /> +{perlen} Perlen</div>
        <a href="#/einheit" className="btn-primary small">Weiter <Icon name="right" size={26} color="#231A4F" strokeWidth={3} /></a>
      </div>
    </div>
  )
}

export function Keypad({ onKey, disabled }: { onKey: (k: string) => void; disabled?: boolean }) {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', 'del']
  return (
    <div className="keypad" aria-label="Zahlen-Tasten">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          className={k === 'C' || k === 'del' ? 'key key-alt' : 'key'}
          aria-label={k === 'del' ? 'Löschen' : k === 'C' ? 'Alles löschen' : `Zahl ${k}`}
          disabled={disabled}
          onClick={() => onKey(k)}
        >
          {k === 'del' ? <Icon name="del" color="#231A4F" size={34} /> : k}
        </button>
      ))}
    </div>
  )
}
