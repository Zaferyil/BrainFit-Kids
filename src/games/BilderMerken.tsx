import { useEffect, useState } from 'react'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'

// „Bilder merken“: Karten erscheinen nacheinander je ~1 Sekunde. Danach kommt für jede gezeigte Karte eine Frage
// mit 4 Karten aus derselben Gruppe: „Welche Karte hast du gesehen?“ Höhere Stufe: mehr Karten, kürzer sichtbar.

const GRUPPEN = [
  ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓'], ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'],
  ['🚗', '🚕', '🚙', '🚌', '🚑', '🚒', '🚜', '🏎️'], ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎱', '🏓'],
  ['😀', '😢', '😡', '😴', '😎', '😮', '🤔', '😂'], ['🌸', '🌻', '🌷', '🌹', '🌼', '🍀', '🌵', '🍄'],
  ['🎈', '🎁', '🎂', '🧁', '🍭', '🍬', '🍩', '🍪'], ['⏰', '⌚', '📱', '💡', '🔑', '✏️', '📚', '🎒'],
]

function runde(level: number) {
  const n = Math.min(10, 3 + Math.floor(level / 2))
  const gruppen = shuffle(GRUPPEN.map((_, i) => i))
  return Array.from({ length: n }, (_, i) => {
    const g = GRUPPEN[gruppen[i % gruppen.length]]
    const bild = g[randInt(0, g.length - 1)]
    return { bild, optionen: shuffle([bild, ...shuffle(g.filter((x) => x !== bild)).slice(0, 3)]) }
  })
}

export function BilderMerken({ level, onFinish }: GameProps) {
  const [karten] = useState(() => runde(level))
  const ms = Math.max(600, 1200 - level * 30)
  const [zeige, setZeige] = useState(0) // 0..n während des Zeigens, dann Fragen
  const [frage, setFrage] = useState(-1)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    if (frage >= 0) return
    if (zeige >= karten.length) { const t = window.setTimeout(() => setFrage(0), 600); return () => clearTimeout(t) }
    const t = window.setTimeout(() => setZeige(zeige + 1), ms)
    return () => clearTimeout(t)
  }, [zeige, frage, karten.length, ms])

  if (frage < 0) return (
    <div className="sk">
      <div className="game-hint">Merke dir die Karten! ({Math.min(zeige + 1, karten.length)} von {karten.length})</div>
      <div className="bm-karte" key={zeige}>{zeige < karten.length && <span>{karten[zeige].bild}</span>}</div>
    </div>
  )

  const k = karten[frage]
  const pick = (v: string) => {
    if (picked) return
    setPicked(v)
    const ok = v === k.bild, c = correct + (ok ? 1 : 0)
    setCorrect(c)
    speak(ok ? 'Richtig!' : 'Fast! Schau nochmal genau.')
    window.setTimeout(() => {
      setPicked(null)
      if (frage + 1 >= karten.length) onFinish(c / karten.length, `${c} von ${karten.length} Karten gemerkt`)
      else setFrage(frage + 1)
    }, ok ? 800 : 1600)
  }
  const kl = (v: string) => !picked ? 'bm-option' : v === k.bild ? 'bm-option right' : v === picked ? 'bm-option wrong' : 'bm-option dim'
  return (
    <div className="sk">
      <div className="game-hint">Frage {frage + 1} von {karten.length} · Welche Karte hast du gesehen?</div>
      <div className="bm-raster">{k.optionen.map((v) => <button key={v} type="button" className={kl(v)} disabled={!!picked} onClick={() => pick(v)}>{v}</button>)}</div>
    </div>
  )
}
