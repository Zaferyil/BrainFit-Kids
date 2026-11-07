import { merkeAntwort } from '../lib/lernspur'
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
// Tempo 1,5 s → 0,3 s je Zahl. Ein schnelleres Tempo öffnet sich, wenn alle 5 Aufgaben im jetzigen Tempo richtig sind.
const TEMPO = [
  { name: 'Langsam', ms: 1500 },
  { name: 'Normal', ms: 1100 },
  { name: 'Schnell', ms: 800 },
  { name: 'Blitz', ms: 500 },
  { name: 'Profi', ms: 300 },
]
const FARBEN = ['#FF4D6D', '#1E9BFF', '#14B86A', '#FF8A1F', '#A93BFF', '#00B3A4', '#FFB300']

const zufall = (n: number) => Math.floor(Math.random() * n)

/** Anzan-Test am Ende einer Welt (Karte Platz 23/24): vorgegebene Aufgaben, kein Level-Wählen */
export type AnzanTest = { welt: number; nr: 1 | 2; aufgaben: Aufgabe[] }
const TEST_KEY = 'bfk.anzan-test'
export const anzanTestStarten = (t: AnzanTest) => { try { sessionStorage.setItem(TEST_KEY, JSON.stringify(t)) } catch { /* egal */ } }
// einmal lesen und gleich löschen: wer danach normal zu Anzan geht, bekommt wieder die Level-Wahl
const testLesen = (): AnzanTest | null => { try { const t = sessionStorage.getItem(TEST_KEY); sessionStorage.removeItem(TEST_KEY); return t ? JSON.parse(t) as AnzanTest : null } catch { return null } }
export const anzanTestKey = (kidId: string, welt: number, nr: number) => `bfk.anzan-test.${kidId}.${welt}.${nr}`

type Phase = 'wahl' | 'zeigen' | 'tippen' | 'fertig'

export function Anzan({ kid }: { kid: Kid }) {
  const key = `bfk.anzan.${kid.id}`
  const [stand, setStand] = useState(() => load<{ level: number; tempo: number; frei: number; tempoFrei?: number; hoeren?: boolean }>(key, { level: 1, tempo: 0, frei: 1, tempoFrei: 2 }))
  const hoeren = !!stand.hoeren
  const tempoFrei = Math.max(stand.tempoFrei ?? 2, Math.min(stand.tempo, TEMPO.length - 1))
  const [neuesTempo, setNeuesTempo] = useState(false)
  const [phase, setPhase] = useState<Phase>('wahl')
  const [aufgaben, setAufgaben] = useState<Aufgabe[]>([])
  const [nr, setNr] = useState(0)
  const [schritt, setSchritt] = useState(-1)
  const [eingabe, setEingabe] = useState('')
  const [ergebnis, setErgebnis] = useState<'richtig' | 'falsch' | null>(null)
  const [richtig, setRichtig] = useState(0)
  const timer = useRef<number>(0)
  const [test] = useState(testLesen)

  useEffect(() => { save(key, stand) }, [key, stand])
  // Test: sofort mit den vorgegebenen Aufgaben starten (Tempo „Langsam“ bzw. das gewählte, Modus Sehen)
  useEffect(() => {
    if (!test) return
    setAufgaben(test.aufgaben.slice(0, RUNDE)); setNr(0); setRichtig(0); naechste(); void speak(SAY.passAuf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const a = aufgaben[nr]
  const ms = TEMPO[Math.min(stand.tempo, TEMPO.length - 1)].ms

  // Zahlen nacheinander zeigen
  useEffect(() => {
    if (phase !== 'zeigen' || !a) return
    if (schritt >= a.numbers.length) { timer.current = window.setTimeout(() => { setPhase('tippen'); void speak(SAY.ergebnisEintippen) }, 200); return }
    // Hören: erst „plus 6" ganz aussprechen lassen, dann kurze Pause je nach Tempo, dann die nächste Zahl
    if (hoeren && schritt >= 0) {
      let aus = false
      const z = a.numbers[schritt]
      void speak(z < 0 ? [SAY.minus, String(-z)] : [SAY.plus, String(z)]).then(() => {
        if (!aus) timer.current = window.setTimeout(() => setSchritt((s) => s + 1), Math.max(550, ms - 700))
      })
      return () => { aus = true; window.clearTimeout(timer.current) }
    }
    timer.current = window.setTimeout(() => setSchritt((s) => s + 1), schritt < 0 ? 3700 : ms)
    return () => window.clearTimeout(timer.current)
  }, [phase, schritt, a, ms, hoeren])

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
    merkeAntwort(kid.id, ok, { regel: null })
    setErgebnis(ok ? 'richtig' : 'falsch')
    if (ok) setRichtig((r) => r + 1)
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(a.answer)])
    timer.current = window.setTimeout(() => {
      if (nr + 1 < RUNDE) { setNr(nr + 1); naechste() }
      else {
        const r = richtig + (ok ? 1 : 0)
        if (test) {
          if (r >= 4) save(anzanTestKey(kid.id, test.welt, test.nr), true)
          rewardGame(kid.id, r * 2)
          setPhase('fertig'); return
        }
        rewardGame(kid.id, r * 2, r >= 4 ? `anzan-${stand.level}` : undefined)
        if (r >= 4 && stand.level === stand.frei && stand.frei < LEVELS.length) setStand((s) => ({ ...s, frei: s.frei + 1 }))
        const tNeu = r === RUNDE && stand.tempo === tempoFrei && tempoFrei < TEMPO.length - 1
        setNeuesTempo(tNeu)
        if (tNeu) setStand((s) => ({ ...s, tempoFrei: tempoFrei + 1 }))
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
          <h1>{test ? `Anzan-Test ${test.nr}` : 'Anzan'}</h1>
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
              <h2>Modus</h2>
              <div className="az-modus">
                <button type="button" className={!hoeren ? 'an' : ''} onClick={() => setStand((s) => ({ ...s, hoeren: false }))}><Icon name="bolt" size={20} color="currentColor" /> Sehen</button>
                <button type="button" className={hoeren ? 'an' : ''} onClick={() => setStand((s) => ({ ...s, hoeren: true }))}><Icon name="volume" size={20} color="currentColor" /> Hören</button>
              </div>
            </div>
            <div className="az-gruppe">
              <h2>Tempo</h2>
              <div className="az-tempo">
                {TEMPO.map((t, i) => {
                  const offen = ALLES_OFFEN || i <= tempoFrei
                  return <button key={t.name} type="button" disabled={!offen} className={i === stand.tempo ? 'an' : ''} onClick={() => setStand((s) => ({ ...s, tempo: i }))}>{offen ? <>{t.name}<small>{(t.ms / 1000).toLocaleString('de-AT')} s</small></> : <><Icon name="lock" size={14} color="currentColor" /><small>{(t.ms / 1000).toLocaleString('de-AT')} s</small></>}</button>
                })}
              </div>
            </div>
            <button type="button" className="az-start" onClick={starten}><Icon name="play" size={22} color="#231A4F" fill="#231A4F" /> Start</button>
            <p className="az-hinweis">{RUNDE} Aufgaben · 4 richtig öffnen das nächste Level · alle richtig öffnen das nächste Tempo</p>
          </section>
        )}

        {(phase === 'zeigen' || phase === 'tippen') && a && (
          <section className="az-spiel">
            <div className="az-info"><span>{test ? `Anzan-Test ${test.nr}` : `Level ${stand.level}`}</span><span>Aufgabe {nr + 1} / {RUNDE}</span></div>
            <div className={`az-tafel ${ergebnis ?? ''}`}>
              {phase === 'zeigen' && hoeren && schritt >= 0 && zahl !== null
                ? <span key={schritt} className="az-hoer"><Icon name="volume" size={90} color="#5B47D6" /><small>Zahl {schritt + 1}</small></span>
                : phase === 'zeigen'
                ? (zahl !== null
                  ? <b key={schritt} className="az-zahl" style={{ color: FARBEN[schritt % FARBEN.length] }}>{zahl > 0 ? '+' : ''}{zahl}</b>
                  : (schritt < 0
                    ? <span key={`uhr-${nr}`} className="az-uhr" aria-label="Gleich geht's los"><i /><b>Los!</b></span>
                    : <span className="az-bereit" />))
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
            {test && <p className="az-neu">{richtig >= 4 ? `🏅 Anzan-Test ${test.nr} bestanden!` : 'Für den Test brauchst du 4 richtige. Versuch es nochmal!'}</p>}
            {test && <a className="az-start" href="#/inseln">Zur Karte</a>}
            {!test && neuesTempo && <p className="az-neu">⚡ Neues Tempo frei: {TEMPO[tempoFrei].name} ({(TEMPO[tempoFrei].ms / 1000).toLocaleString('de-AT')} s)!</p>}
            {test ? <button type="button" className="az-zurueck" onClick={() => { setAufgaben(test.aufgaben.slice(0, RUNDE)); setNr(0); setRichtig(0); naechste() }}>Nochmal</button> : <>
            <button type="button" className="az-start" onClick={starten}>Nochmal</button>
            <button type="button" className="az-zurueck" onClick={() => setPhase('wahl')}>Level wählen</button></>}
          </section>
        )}
      </div>
      <NavBar active="anzan" />
    </Stage>
  )
}
