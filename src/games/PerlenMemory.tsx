import { useState } from 'react'
import { Abakus } from '../components/Abakus'
import { Bead, type BeadColor } from '../components/Bead'
import { Icon, type IconName } from '../components/Icon'
import { speak } from '../lib/speak'
import { usePortrait } from '../lib/usePortrait'
import { randInt, shuffle, type GameProps } from './types'

type Face =
  | { kind: 'bead'; color: BeadColor }
  | { kind: 'icon'; icon: IconName; color: string; fill: string }
  | { kind: 'digit'; n: number }
  | { kind: 'abakus'; n: number }

type Card = { id: number; pair: number; face: Face }

const BEADS: BeadColor[] = ['yellow', 'green', 'orange', 'blue', 'purple', 'pink']
const ICONS: { icon: IconName; color: string; fill: string }[] = [
  { icon: 'star', color: '#DE9800', fill: '#FFC531' }, { icon: 'heart', color: '#C2264E', fill: '#FF5C8A' },
  { icon: 'bolt', color: '#5B47D6', fill: '#C9C0FF' }, { icon: 'crown', color: '#DE9800', fill: '#FFE58F' },
  { icon: 'gem', color: '#1F7FD1', fill: '#9BD3FF' }, { icon: 'gift', color: '#25913F', fill: '#B6EFC2' },
  { icon: 'paw', color: '#8A4B20', fill: '#E8B48A' }, { icon: 'flame', color: '#E06A00', fill: '#FFB15E' },
  { icon: 'book', color: '#5B47D6', fill: '#E4DFFF' }, { icon: 'trophy', color: '#DE9800', fill: '#FFE58F' },
  { icon: 'bell', color: '#C2410C', fill: '#FFD2A8' }, { icon: 'map', color: '#25913F', fill: '#DDF7E3' },
]

/** Stufe → Anzahl Paare und Art der Karten */
const memoryPairs = (level: number) => Math.min(12, 3 + Math.floor((level - 1) / 2))

function makeDeck(level: number): Card[] {
  const pairs = memoryPairs(level)
  const cards: Card[] = []
  if (level <= 6 && pairs <= BEADS.length) {
    shuffle(BEADS).slice(0, pairs).forEach((color, p) => {
      cards.push({ id: p * 2, pair: p, face: { kind: 'bead', color } }, { id: p * 2 + 1, pair: p, face: { kind: 'bead', color } })
    })
  } else if (level <= 12) {
    shuffle(ICONS).slice(0, pairs).forEach((ic, p) => {
      cards.push({ id: p * 2, pair: p, face: { kind: 'icon', ...ic } }, { id: p * 2 + 1, pair: p, face: { kind: 'icon', ...ic } })
    })
  } else {
    // Zahl und Abakus-Bild bilden ein Paar
    const nums = new Set<number>()
    while (nums.size < pairs) nums.add(randInt(1, 19))
    ;[...nums].forEach((n, p) => {
      cards.push({ id: p * 2, pair: p, face: { kind: 'digit', n } }, { id: p * 2 + 1, pair: p, face: { kind: 'abakus', n } })
    })
  }
  return shuffle(cards)
}

function FaceView({ face, size }: { face: Face; size: number }) {
  if (face.kind === 'bead') return <Bead color={face.color} width={size * 0.72} />
  if (face.kind === 'icon') return <Icon name={face.icon} color={face.color} fill={face.fill} size={size * 0.55} strokeWidth={2} />
  if (face.kind === 'digit') return <span className="mem-digit" style={{ fontSize: size * 0.5 }}>{face.n}</span>
  return <Abakus value={face.n} cols={2} colw={size * 0.3} interactive={false} marker={false} />
}

export function PerlenMemory({ level, onFinish }: GameProps) {
  const [deck] = useState(() => makeDeck(level))
  const [open, setOpen] = useState<number[]>([])
  const [found, setFound] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const pairs = deck.length / 2
  const portrait = usePortrait()

  // Quer: breite Fläche; hochkant: weniger Spalten, mehr Zeilen
  const n = deck.length
  const cols = portrait
    ? (n <= 6 ? 2 : n <= 12 ? 3 : 4)
    : (n <= 6 ? 3 : n <= 16 ? 4 : n <= 20 ? 5 : 6)
  const [areaW, areaH] = portrait ? [520, 760] : [980, 560]
  const rows = Math.ceil(n / cols)
  const size = Math.min(150, Math.floor((areaH - (rows - 1) * 12) / rows), Math.floor((areaW - (cols - 1) * 12) / cols))

  const flip = (c: Card) => {
    if (open.length === 2 || open.includes(c.id) || found.includes(c.pair)) return
    const next = [...open, c.id]
    setOpen(next)
    if (next.length < 2) return
    const tries = attempts + 1
    setAttempts(tries)
    const [a, b] = next.map((id) => deck.find((d) => d.id === id)!)
    if (a.pair === b.pair) {
      const f = [...found, a.pair]
      setFound(f)
      setOpen([])
      speak(f.length === pairs ? 'Alle Paare gefunden!' : 'Ein Paar!')
      if (f.length === pairs) {
        window.setTimeout(() => onFinish(Math.min(1, (pairs * 1.6) / tries), `${pairs} Paare in ${tries} Zügen`), 700)
      }
    } else {
      window.setTimeout(() => setOpen([]), 900)
    }
  }

  return (
    <div className="game-memory">
      <div className="game-hint">Paare: {found.length} von {pairs} · Züge: {attempts}</div>
      <div className="mem-grid" style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)` }}>
        {deck.map((c) => {
          const shown = open.includes(c.id) || found.includes(c.pair)
          return (
            <button
              key={c.id}
              type="button"
              className={found.includes(c.pair) ? 'mem-card found' : shown ? 'mem-card open' : 'mem-card'}
              style={{ width: size, height: size }}
              aria-label={shown ? 'Aufgedeckte Karte' : 'Verdeckte Karte'}
              onClick={() => flip(c)}
            >
              {shown ? <FaceView face={c.face} size={size} /> : <Bead color="purple" width={size * 0.36} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
