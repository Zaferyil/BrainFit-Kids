import { useEffect, useRef, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, type GameProps } from './types'
import { SpielKopf, useEinmal } from './spielTeile'

// „Stopp-Perle“: Grüne Perle → schnell tippen. Rote Perle → NICHT tippen! (Reaktion und Selbstkontrolle)
// Stufe 1–4: Perlen bleiben 1,6 s, 25 % rot · 5–9: schneller, ab 7 auch eine blaue „Schummel-Perle“ (nicht tippen)
// · ab 10: 0,8 s, 40 % Stopp-Perlen, ab 13 erscheinen sie an verschiedenen Stellen.

const ANZAHL = 24
type Art = 'gruen' | 'rot' | 'blau'
const FARBE: Record<Art, string> = { gruen: '#2ECC8F', rot: '#FF4D6D', blau: '#3BA7FF' }

function folge(stufe: number): { art: Art; x: number; y: number }[] {
  const stopp = stufe <= 4 ? 0.25 : stufe <= 9 ? 0.32 : 0.4
  return Array.from({ length: ANZAHL }, () => {
    const r = Math.random()
    const art: Art = r < stopp ? (stufe >= 7 && Math.random() < 0.35 ? 'blau' : 'rot') : 'gruen'
    return stufe >= 13 ? { art, x: randInt(20, 80), y: randInt(22, 78) } : { art, x: 50, y: 50 }
  })
}

export function StoppPerle({ level, onFinish, rounds }: GameProps) {
  const anzahl = rounds ? Math.min(ANZAHL, rounds * 3) : ANZAHL
  const [f] = useState(() => folge(level).slice(0, anzahl))
  const [i, setI] = useState(-1)
  const [sichtbar, setSichtbar] = useState(false)
  const [rueck, setRueck] = useState<'gut' | 'schlecht' | null>(null)
  const [stand, setStand] = useState({ treffer: 0, fehler: 0 })
  const getippt = useRef(false)
  const ende = useEinmal(onFinish)
  const dauer = Math.max(800, 1600 - level * 60)

  // Start nach kurzer Pause
  useEffect(() => { const t = window.setTimeout(() => setI(0), 1200); return () => window.clearTimeout(t) }, [])

  useEffect(() => {
    if (i < 0) return
    if (i >= f.length) {
      const richtigAnteil = stand.treffer / f.length
      ende(richtigAnteil, `${stand.treffer} von ${f.length} richtig reagiert`)
      return
    }
    getippt.current = false
    setSichtbar(true); setRueck(null)
    const t1 = window.setTimeout(() => {
      setSichtbar(false)
      // nicht getippt: richtig bei Stopp-Perlen, verpasst bei Grün
      if (!getippt.current) {
        const ok = f[i].art !== 'gruen'
        setStand((s) => ok ? { ...s, treffer: s.treffer + 1 } : { ...s, fehler: s.fehler + 1 })
        setRueck(ok ? 'gut' : 'schlecht')
      }
    }, dauer)
    const t2 = window.setTimeout(() => setI((x) => x + 1), dauer + 450)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2) }
  }, [i])

  const tippe = () => {
    if (!sichtbar || getippt.current || i < 0 || i >= f.length) return
    getippt.current = true
    const ok = f[i].art === 'gruen'
    setStand((s) => ok ? { ...s, treffer: s.treffer + 1 } : { ...s, fehler: s.fehler + 1 })
    setRueck(ok ? 'gut' : 'schlecht'); setSichtbar(false)
    if (ok) tonRichtig(stand.treffer + 1); else tonFalsch()
  }

  const p = f[Math.max(0, Math.min(i, f.length - 1))]
  return (
    <div className="sp">
      <SpielKopf punkte={stand.treffer * 10} />
      <div className="sp-auftrag"><b style={{ color: '#2ECC8F' }}>Grün</b> → tippen! · <b style={{ color: '#FF4D6D' }}>Rot</b>{level >= 7 ? <> oder <b style={{ color: '#3BA7FF' }}>Blau</b></> : null} → nicht tippen!</div>
      <button type="button" className={'sp-buehne sp-flaeche' + (rueck ? ' ' + rueck : '')} onPointerDown={tippe} aria-label="Tippfläche">
        {i < 0 && <span className="sp-bereit">Achtung … gleich geht’s los!</span>}
        {sichtbar && <span className="sp-perle gross" style={{ ['--f' as string]: FARBE[p.art], left: `${p.x}%`, top: `${p.y}%` }} />}
        {rueck === 'gut' && !sichtbar && <span className="sp-zeichen">✓</span>}
        {rueck === 'schlecht' && !sichtbar && <span className="sp-zeichen nein">✗</span>}
      </button>
      <div className="game-hint">Perle {Math.min(i + 1, f.length)} von {f.length} · {stand.fehler} {stand.fehler === 1 ? 'Fehler' : 'Fehler'}</div>
    </div>
  )
}
