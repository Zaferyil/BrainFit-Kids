import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { SAY } from '../data/sprache'
import { rewardGame } from '../lib/progress'
import { load, save } from '../lib/storage'
import { speak } from '../lib/speak'
import { ALLES_OFFEN } from '../lib/testmodus'
import { Keypad } from './stations/StationShell'
import { Funkeln } from './Anmelden'
import daten from '../../content/mathkids-levels.json'

// Anzan (Flash-Rechnen) wie in MathKids: Zahlen blitzen nacheinander auf, das Kind rechnet im Kopf
// und tippt das Ergebnis. Aufgaben aus den 96 MathKids-Levels (content/mathkids-levels.json).

type Aufgabe = { numbers: number[]; answer: number }
const LEVELS = (daten as { levels: { levelNumber: number; questions: Aufgabe[] }[] }).levels
const RUNDE = 5
const TEMPO = [
  { name: 'Langsam', ms: 1600 },
  { name: 'Normal', ms: 1100 },
  { name: 'Schnell', ms: 700 },
]
const FARBEN = ['#FF4D6D', '#1E9BFF', '#14B86A', '#FF8A1F', '#A93BFF', '#00B3A4', '#FFB300']

const zufall = (n: number) => Math.floor(Math.random() * n)

type Phase = 'wahl' | 'zeigen' | 'tippen' | 'fertig'

export function Anzan({ kid }: { kid: Kid }) {
  const key = `bfk.anzan.${kid.id}`
  const [stand, setStand] = useState(() => load<{ level: number; tempo: number; frei: number }>(key, { level: 1, tempo: 0, frei: 1 }))
  const [phase, setPhase] = useState<Phase>('wahl')
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([])
  const [nr, setNr] = useState(0)
  const [schritt, setSchritt] = useState(-1)
  const [eingabe, setEingabe] = useState('')
  const [ergebnis, setErgebnis] = useState<'richtig' | 'falsch' | null>(null)
  const [richtig, setRichtig] = useState(0)
  const timer = useRef<number>(0)

  useEffect(() => { save(key, stand) }, [key, stand])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const a = aufgaben[nr]
  const ms = TEMPO[stand.tempo].ms

  // Zahlen nacheinander zeigen
  useEffect(() => {
    if (phase !== 'zeigen' || !a) return
    if (schritt >= a.numbers.length) { timer.current = window.setTimeout(() => { setPhase('tippen'); void speak(SAY.ergebnisEintippen) }, 200); return }
    timer.current = window.setTimeout(() => setSchritt((s) => s + 1), schritt < 0 ? 1100 : ms)
    return () => window.clearTimeout(timer.current)
  }, [phase, schritt, a, ms])

  const starten = () => {
    const qs = LEVELS[stand.level - 1].questions
    const start = zufall(qs.length)
    setAufgaben(Array.from({ length: RUNDE }, (_, i) => qs[(start + i) % qs.length]))
    setNr(0); setRichtig(0); naechste()
    void speak(SAY.passAuf)
  }
  const naechste = () => { setEingabe(''); setErgebnis(null); setSchritt(-1); setPhase('zeigen') }

  const pruefen = () => {
    if (!a || eingabe === '') return
    const ok = Number(eingabe) === a.answer
    setErgebnis(ok ? 'richtig' : 'falsch')
    if (ok) setRichtig((r) => r + 1)
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(a.answer)])
    timer.current = window.setTimeout(() => {
      if (nr + 1 < RUNDE) { setNr(nr + 1); naechste() }
      else {
        const r = richtig + (ok ? 1 : 0)
        rewardGame(kid.id, r * 2, r >= 4 ? `anzan-${stand.level}` : undefined)
        if (r >= 4 && stand.level === stand.frei && stand.frei < LEVELS.length) setStand((s) => ({ ...s, frei: s.frei + 1 }))
        setPhase('fertig')
      }
    }, 1500)
  }

  const taste = (k: string) => {
    if (phase !== 'tippen' || ergebnis) return
    if (k === 'C') setEingabe('')
    else if (k === 'del') setEingabe((e) => e.slice(0, -1))
    else setEingabe((e) => (e.length < 4 ? e + k : e))
  }

  const zahl = a && schritt >= 0 && schritt < a.numbers.length ? a.numbers[schritt] : null

  return (
    <Stage background="linear-gradient(180deg, #2A1B8C 0%, #5B47D6 50%, #FF6FB5 100%)">
      <Funkeln />
      <div className="az">
        <header className="az-kopf">
          <h1>Anzan</h1>
          <p>Zahlen blitzen auf – rechne im Kopf!</p>
        </header>

        {phase === 'wahl' && (
          <section className="az-wahl popin">
            <div className="az-gruppe">
              <h2>Level</h2>
              <div className="az-levels">
                {LEVELS.map((l) => {
                  const offen = ALLES_OFFEN || l.levelNumber <= stand.frei
                  return (
                    <button key={l.levelNumber} type="button" disabled={!offen} className={l.levelNumber === stand.level ? 'an' : ''}
                      onClick={() => setStand((s) => ({ ...s, level: l.levelNumber }))} aria-label={`Level ${l.levelNumber}${offen ? '' : ' (gesperrt)'}`}>
                      {offen ? l.levelNumber : <Icon name="lock" size={16} color="currentColor" />}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="az-gruppe">
              <h2>Tempo</h2>
              <div className="az-tempo">
                {TEMPO.map((t, i) => <button key={t.name} type="button" className={i === stand.tempo ? 'an' : ''} onClick={() => setStand((s) => ({ ...s, tempo: i }))}>{t.name}</button>)}
              </div>
            </div>
            <button type="button" className="az-start" onClick={starten}><Icon name="play" size={22} color="#231A4F" fill="#231A4F" /> Start</button>
            <p className="az-hinweis">{RUNDE} Aufgaben · 4 richtig öffnen das nächste Level</p>
          </section>
        )}

        {(phase === 'zeigen' || phase === 'tippen') && a && (
          <section className="az-spiel">
            <div className="az-info"><span>Level {stand.level}</span><span>Aufgabe {nr + 1} / {RUNDE}</span></div>
            <div className={`az-tafel ${ergebnis ?? ''}`}>
              {phase === 'zeigen'
                ? (zahl !== null
                  ? <b key={schritt} className="az-zahl" style={{ color: FARBEN[schritt % FARBEN.length] }}>{schritt > 0 && zahl > 0 ? '+' : ''}{zahl}</b>
                  : <span className="az-bereit">{schritt < 0 ? 'Bereit?' : ''}</span>)
                : <b className="az-eingabe">{ergebnis === 'falsch' ? a.answer : eingabe || '?'}</b>}
            </div>
            {phase === 'tippen' && (
              <>
                <Keypad onKey={taste} disabled={!!ergebnis} />
                <button type="button" className="az-start" onClick={pruefen} disabled={!eingabe || !!ergebnis}>Fertig</button>
              </>
            )}
          </section>
        )}

        {phase === 'fertig' && (
          <section className="az-wahl popin az-ende">
            <div className="az-sterne">{[0, 1, 2].map((i) => <Icon key={i} name="star" size={44} color="#E0A100" fill={i < Math.round((richtig / RUNDE) * 3) ? '#FFC531' : 'rgba(255,255,255,.25)'} />)}</div>
            <h2>{richtig} von {RUNDE} richtig!</h2>
            <p>+{richtig * 2} Perlen</p>
            <button type="button" className="az-start" onClick={starten}>Nochmal</button>
            <button type="button" className="az-zurueck" onClick={() => setPhase('wahl')}>Level wählen</button>
          </section>
        )}
      </div>
      <NavBar active="anzan" />
    </Stage>
  )
}
