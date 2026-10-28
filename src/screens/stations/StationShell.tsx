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
    <div className="done-overlay erfolg" role="dialog" aria-label="Station geschafft">
      <svg className="erfolg-konfetti" viewBox="0 0 390 300" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
        <rect x="40" y="40" width="12" height="20" rx="3" fill="#FFC531" transform="rotate(20 46 50)" />
        <rect x="320" y="70" width="12" height="20" rx="3" fill="#2ECC8F" transform="rotate(-25 326 80)" />
        <rect x="90" y="170" width="10" height="18" rx="3" fill="#FF8FB1" transform="rotate(40 95 179)" />
        <rect x="290" y="200" width="10" height="18" rx="3" fill="#FFC531" transform="rotate(-10 295 209)" />
        <circle cx="200" cy="30" r="6" fill="#3BA7FF" /><circle cx="60" cy="250" r="5" fill="#2ECC8F" /><circle cx="340" cy="150" r="6" fill="#FF8FB1" />
      </svg>
      <div className="erfolg-inhalt popin">
        <div className="erfolg-sterne" aria-label={`${stars} von 3 Sternen`}>
          {[0, 1, 2].map((k) => (
            <Icon key={k} name="star" size={k === 1 ? 96 : 74} color={k < stars ? '#E0A100' : 'rgba(255,255,255,.5)'} fill={k < stars ? '#FFC531' : 'rgba(255,255,255,.18)'} strokeWidth={1.4} />
          ))}
        </div>
        <Perli mood="cheer" size={130} />
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="erfolg-chips">
          <div><span>STERNE</span><b className="gelb">{stars} / 3</b></div>
          <div><span>PERLEN</span><b className="gruen">+{perlen}</b></div>
        </div>
        {extra}
        <a href={href} className="nk-btn yellow big">Weiter <Icon name="right" size={26} color="#2B2257" strokeWidth={3} /></a>
      </div>
    </div>
  )
}

export function Keypad({ onKey, disabled }: { onKey: (k: string) => void; disabled?: boolean }) {
  // 4 Kreise je Reihe: 1–4, 5–8, dann C · 0 · 9 · Löschen
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', 'C', '0', '9', 'del']
  return (
    <div className="keypad glas" aria-label="Zahlen-Tasten">
      {keys.map((k) => (
        <button
          key={k}
          type="button"
          className={k === 'C' || k === 'del' ? 'key key-alt' : 'key'}
          aria-label={k === 'del' ? 'Löschen' : k === 'C' ? 'Alles löschen' : `Zahl ${k}`}
          disabled={disabled}
          onClick={() => onKey(k)}
        >
          {k === 'del' ? <Icon name="del" color="#FFFFFF" size={30} /> : k}
        </button>
      ))}
    </div>
  )
}

