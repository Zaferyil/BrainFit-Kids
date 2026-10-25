import { useEffect, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import { Stage } from '../../components/Stage'
import { Bead } from '../../components/Bead'
import { STATIONS, type StationId } from '../../data/units'
import type { Say } from '../../data/sprache'
import { speak } from '../../lib/speak'

type Props = {
  station: StationId
  title: string
  /** Fortschrittspunkte: 'right' | 'wrong' | 'current' | 'open' */
  dots?: ('right' | 'wrong' | 'current' | 'open')[]
  perlen?: number
  /** Erklärung vor dem Start; solange started false ist, liegt sie über der Station. */
  intro?: string
  started?: boolean
  onStart?: () => void
  /** Aktuelle Frage zum Nochmal-Hören */
  say?: Say
  children: ReactNode
}

export function StationShell({ station, title, dots, perlen, intro, started = true, onStart, say, children }: Props) {
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
          {say && <SayButton say={say} />}
          {perlen !== undefined && (
            <div className="chip"><Bead color="yellow" width={28} /><span>+{perlen}</span></div>
          )}
        </div>
        {children}
      </div>
      {intro && !started && <StationIntro station={station} text={intro} onStart={onStart} />}
    </Stage>
  )
}

/** Lautsprecher-Knopf: liest den Text noch einmal vor. */
export function SayButton({ say, light }: { say: Say; light?: boolean }) {
  return (
    <button type="button" className={light ? 'round-btn big say-btn light' : 'round-btn big say-btn'} aria-label="Nochmal hören" onClick={() => void speak(say)}>
      <Icon name="volume" color={light ? '#231A4F' : '#FFFFFF'} size={28} />
    </button>
  )
}

/** Perli erklärt kurz, was in der Station zu tun ist. */
export function StationIntro({ station, text, onStart }: { station: StationId; text: string; onStart?: () => void }) {
  const s = STATIONS.find((x) => x.id === station)!
  useEffect(() => { void speak(text) }, [text])
  return (
    <div className="done-overlay" role="dialog" aria-label="So geht's">
      <div className="done-card intro-card">
        <Perli mood="happy" size={130} />
        <div className="eyebrow">{s.title.toUpperCase()} · SO GEHT'S</div>
        <p className="intro-text">{text}</p>
        <div className="done-actions">
          <SayButton say={text} light />
          <button type="button" className="btn-primary small" onClick={onStart}>
            Los geht's <Icon name="right" size={26} color="#231A4F" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function StationDone({ stars, perlen, text, title = 'Geschafft!', href = '#/einheit', extra, say }: { stars: number; perlen: number; text: string; title?: string; href?: string; extra?: ReactNode; say?: Say }) {
  const spoken = say ?? [title, text]
  const key = JSON.stringify(spoken)
  useEffect(() => { void speak(JSON.parse(key)) }, [key])
  return (
    <div className="done-overlay" role="dialog" aria-label="Station geschafft">
      <div className="done-card">
        <Perli mood="cheer" size={150} />
        <h2>{title}</h2>
        <div className="done-stars" aria-label={`${stars} von 3 Sternen`}>
          {[0, 1, 2].map((k) => (
            <Icon key={k} name="star" size={64} color="#DE9800" fill={k < stars ? '#FFC531' : 'none'} strokeWidth={1.8} />
          ))}
        </div>
        <p>{text}</p>
        <div className="done-reward"><Bead color="yellow" width={36} /> +{perlen} Perlen</div>
        {extra}
        <a href={href} className="btn-primary small">Weiter <Icon name="right" size={26} color="#231A4F" strokeWidth={3} /></a>
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

