import { useEffect, useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Keypad } from '../components/Keypad'
import { go } from '../router'

const ROUNDS = 15
const COUNT = 5
const SPARKS: [number, number, number][] = [[120, 640, 6], [1080, 120, 5], [980, 700, 7], [60, 260, 4], [560, 40, 5], [700, 780, 4], [300, 760, 6], [1140, 420, 4]]

// Zahlenfolge: erste Zahl plus lauter +n (Big-Friends-Übung)
function makeRound() {
  return Array.from({ length: COUNT }, (_, i) => (i === 0 ? 1 + Math.floor(Math.random() * 9) : [6, 7][Math.floor(Math.random() * 2)]))
}

const panel = { background: 'var(--panel)', borderRadius: 24, padding: 18 } as const

export function Blitz() {
  const [round, setRound] = useState(1)
  const [seq, setSeq] = useState(makeRound)
  const [shown, setShown] = useState(1) // wie viele Zahlen schon gezeigt wurden (die erste sofort)
  const [tempo, setTempo] = useState(55) // 0 = langsam, 100 = schnell
  const [timeLeft, setTimeLeft] = useState(60)
  const [input, setInput] = useState('')
  const [streak, setStreak] = useState(0)
  const [hits, setHits] = useState(0)

  const seconds = Math.round((2 - tempo / 100 * 1.5) * 10) / 10
  const answering = shown > COUNT
  const total = seq.reduce((a, b) => a + b, 0)

  useEffect(() => {
    if (answering) return
    const t = setTimeout(() => setShown((s) => s + 1), seconds * 1000)
    return () => clearTimeout(t)
  }, [shown, answering, seconds])

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (timeLeft === 0) go('/einheit')
  }, [timeLeft])

  const submit = (value: string) => {
    const ok = Number(value) === total
    setStreak(ok ? streak + 1 : 0)
    if (ok) setHits(hits + 1)
    if (round === ROUNDS) return go('/einheit')
    setRound(round + 1)
    setSeq(makeRound())
    setShown(1)
    setInput('')
  }

  const press = (d: string) => {
    const next = (input + d).slice(0, 3)
    setInput(next)
    if (next.length === String(total).length) setTimeout(() => submit(next), 400)
  }

  const current = seq[Math.min(shown, COUNT) - 1]

  return (
    <Stage bg="#160f3d">
      {SPARKS.map(([x, y, s]) => (
        <div key={`${x}-${y}`} style={{ position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: 'var(--yellow)', opacity: 0.35 }} />
      ))}
      <div style={{ padding: '28px 40px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/einheit" aria-label="Training beenden" className="round-btn">
            <Icon name="x" size={26} color="#fff" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bolt" size={28} fill="#231A4F" />
            </div>
            <div>
              <div className="display" style={{ fontSize: 30, lineHeight: 1 }}>Blitz-Training</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--muted)' }}>Aufgabe {round} von {ROUNDS} · Big Friends +7</div>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', width: 360, height: 14, borderRadius: 999, background: 'var(--panel)', overflow: 'hidden' }}>
            <div style={{ width: `${(round / ROUNDS) * 100}%`, height: '100%', borderRadius: 999, background: 'var(--yellow)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32, marginTop: 40, alignItems: 'center' }}>
          <aside style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 170, height: 170 }}>
              <svg width="170" height="170" viewBox="0 0 170 170" aria-hidden="true">
                <circle cx="85" cy="85" r="72" fill="none" stroke="#2a2066" strokeWidth="16" />
                <circle cx="85" cy="85" r="72" fill="none" stroke="#3dbe5b" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(timeLeft / 60) * 452} 453`} transform="rotate(-90 85 85)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span className="display" style={{ fontSize: 44, lineHeight: 1 }}>{timeLeft >= 60 ? '1:00' : `0:${String(timeLeft).padStart(2, '0')}`}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--muted)' }}>Zeit übrig</span>
              </div>
            </div>
            {streak > 0 && (
              <div className="pill" style={{ padding: '12px 20px', background: 'var(--orange)', color: 'var(--ink)', gap: 10 }}>
                <Icon name="flame" size={28} fill="#FFC531" />
                <span className="display" style={{ fontSize: 24 }}>{streak}er-Serie!</span>
              </div>
            )}
          </aside>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--lilac)' }}>{answering ? 'Dein Ergebnis' : `Zahl ${Math.max(1, shown)} von ${COUNT}`}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: COUNT }, (_, i) => (
                  <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', background: i < shown - 1 || answering ? 'var(--yellow)' : i === shown - 1 ? '#fff' : 'var(--line)', boxShadow: i === shown - 1 ? '0 0 0 4px rgba(255,255,255,.3)' : undefined }} />
                ))}
              </div>
            </div>
            <div style={{ width: 500, height: 380, borderRadius: 48, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 0 var(--purple), 0 0 0 12px rgba(255,197,49,.25)' }}>
              <span className="display" style={{ fontSize: answering ? 200 : 240, lineHeight: 1, color: 'var(--ink)' }}>
                {answering ? input || '?' : shown === 1 ? current : `+${current}`}
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--muted)' }}>Merk dir alles – am Ende tippst du das Ergebnis.</div>
          </div>

          <aside style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {answering ? (
              <div style={{ transform: 'scale(.8)', transformOrigin: 'top right', marginLeft: -60 }}>
                <Keypad onDigit={press} onDelete={() => setInput((c) => c.slice(0, -1))} onClear={() => setInput('')} />
              </div>
            ) : (
              <div style={panel}>
                <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--muted)' }}>TEMPO</div>
                <div className="display" style={{ fontSize: 30, lineHeight: 1.1 }}>{String(seconds).replace('.', ',')} s</div>
                <input
                  type="range" min={0} max={100} value={tempo} aria-label="Tempo" onChange={(e) => setTempo(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 12, accentColor: '#3BA7FF' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontWeight: 800, fontSize: 13, color: 'var(--muted)' }}>
                  <span>langsam</span><span>schnell</span>
                </div>
              </div>
            )}
            <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Zahlen', String(COUNT)], ['Stellen', '1–2']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}><span style={{ color: 'var(--muted)' }}>{k}</span><span>{v}</span></div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
                <span style={{ color: 'var(--muted)' }}>Richtig</span>
                <span style={{ color: 'var(--green)' }}>{hits} / {round - (answering ? 0 : 1)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Perli mood="wow" size={110} /></div>
          </aside>
        </div>
      </div>
    </Stage>
  )
}
