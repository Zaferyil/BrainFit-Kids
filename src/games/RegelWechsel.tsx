import { useEffect, useRef, useState } from 'react'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { randInt, type GameProps } from './types'

// Regel-Wechsel (Flexibles Denken): Eine Karte zeigt eine Form in einer Farbe. Oben steht die Regel: FARBE oder FORM.
// Tippe die Zielkarte, die nach dieser Regel passt. Die Regel wechselt – je höher die Stufe, desto öfter und schneller.

type Form = 'kreis' | 'dreieck' | 'quadrat' | 'stern'
type Karte = { form: Form; farbe: string }
const FARBEN = ['#FF4D6D', '#3BA7FF', '#FFC531', '#3DBE5B']
const FORMEN: Form[] = ['kreis', 'dreieck', 'quadrat', 'stern']

function stufe(level: number) {
  if (level <= 3) return { runden: 12, wechsel: 6, zeit: 0 }
  if (level <= 7) return { runden: 14, wechsel: 4, zeit: 0 }
  if (level <= 11) return { runden: 16, wechsel: 3, zeit: 5 }
  if (level <= 15) return { runden: 18, wechsel: 2, zeit: 4 }
  return { runden: 20, wechsel: 0, zeit: 3 } // 0 = zufällig wechselnd
}

function Symbol({ k, gr }: { k: Karte; gr: number }) {
  const p = { fill: k.farbe, stroke: 'rgba(0,0,0,.18)', strokeWidth: 4 }
  return (
    <svg width={gr} height={gr} viewBox="0 0 100 100" aria-hidden="true">
      {k.form === 'kreis' && <circle cx="50" cy="50" r="40" {...p} />}
      {k.form === 'quadrat' && <rect x="12" y="12" width="76" height="76" rx="10" {...p} />}
      {k.form === 'dreieck' && <polygon points="50,8 94,90 6,90" {...p} />}
      {k.form === 'stern' && <polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" {...p} />}
    </svg>
  )
}

/** zwei Zielkarten, die sich in Farbe UND Form unterscheiden, und eine Spielkarte, die zu je einer passt */
function neueRunde() {
  const [f1, f2] = [randInt(0, 3), 0].map((x, i, a) => (i ? (a[0] + randInt(1, 3)) % 4 : x))
  const [s1, s2] = [randInt(0, 3), 0].map((x, i, a) => (i ? (a[0] + randInt(1, 3)) % 4 : x))
  const ziele: Karte[] = [{ form: FORMEN[s1], farbe: FARBEN[f1] }, { form: FORMEN[s2], farbe: FARBEN[f2] }]
  // Spielkarte: Farbe von einem Ziel, Form vom anderen (so zählt nur die Regel)
  const a = randInt(0, 1)
  return { ziele, karte: { farbe: ziele[a].farbe, form: ziele[1 - a].form } as Karte }
}

export function RegelWechsel({ level, onFinish }: GameProps) {
  const st = stufe(level)
  const [i, setI] = useState(0)
  const [regel, setRegel] = useState<'farbe' | 'form'>(() => (randInt(0, 1) ? 'farbe' : 'form'))
  const [r, setR] = useState(neueRunde)
  const [richtig, setRichtig] = useState(0)
  const [serie, setSerie] = useState(0)
  const [feedback, setFeedback] = useState<{ ok: boolean; wahl: number } | null>(null)
  const [neuRegel, setNeuRegel] = useState(false)
  const [rest, setRest] = useState(st.zeit)
  const t0 = useRef(Date.now())

  const weiter = (ok: boolean) => {
    const c = richtig + (ok ? 1 : 0)
    setRichtig(c)
    window.setTimeout(() => {
      setFeedback(null)
      if (i + 1 >= st.runden) { onFinish(c / st.runden, `${c} von ${st.runden} Karten richtig sortiert`); return }
      const wechseln = st.wechsel ? (i + 1) % st.wechsel === 0 : Math.random() < 0.4
      if (wechseln) { setRegel((x) => (x === 'farbe' ? 'form' : 'farbe')); setNeuRegel(true); window.setTimeout(() => setNeuRegel(false), 700) }
      setI(i + 1); setR(neueRunde()); t0.current = Date.now(); setRest(st.zeit)
    }, ok ? 550 : 1200)
  }
  const waehle = (k: number) => {
    if (feedback) return
    const z = r.ziele[k]
    const ok = regel === 'farbe' ? z.farbe === r.karte.farbe : z.form === r.karte.form
    setFeedback({ ok, wahl: k })
    if (ok) { const s = serie + 1; setSerie(s); tonRichtig(s) } else { setSerie(0); tonFalsch() }
    weiter(ok)
  }
  // Zeitlimit je Karte (höhere Stufen)
  useEffect(() => {
    if (!st.zeit || feedback) return
    const t = window.setInterval(() => setRest((x) => x - 1), 1000)
    return () => window.clearInterval(t)
  }, [i, feedback, st.zeit])
  useEffect(() => { if (st.zeit && rest <= 0 && !feedback) { setFeedback({ ok: false, wahl: -1 }); setSerie(0); tonFalsch(); weiter(false) } })

  return (
    <div className="game-regel">
      <div className="game-hint">Karte {i + 1} von {st.runden}{st.zeit ? ` · ${Math.max(0, rest)} s` : ''}</div>
      <div className={`regel-schild ${regel}${neuRegel ? ' neu' : ''}`}>{regel === 'farbe' ? '🎨 Nach FARBE' : '🔷 Nach FORM'}</div>
      <div className={`regel-karte${feedback ? (feedback.ok ? ' ok' : ' falsch') : ''}`}><Symbol k={r.karte} gr={140} /></div>
      <div className="regel-ziele">
        {r.ziele.map((z, k) => (
          <button key={k} type="button" className={`regel-ziel${feedback && feedback.wahl === k ? (feedback.ok ? ' ok' : ' falsch') : ''}`} onClick={() => waehle(k)} aria-label={`Ziel ${k + 1}`}>
            <Symbol k={z} gr={110} />
          </button>
        ))}
      </div>
      {feedback && !feedback.ok && <div className="regel-tipp">Regel: {regel === 'farbe' ? 'gleiche FARBE' : 'gleiche FORM'}!</div>}
    </div>
  )
}
