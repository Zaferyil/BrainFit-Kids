import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus3D } from '../../components/Abakus3D'
import { Abakus } from '../../components/Abakus'
import { Grummel } from '../../components/Grummel'
import { Icon } from '../../components/Icon'
import { Stage } from '../../components/Stage'
import { WORLDS } from '../../data/curriculum'
import { describeNumber, makeSum, randomIn, rechnet, type UnitContent } from '../../data/units'
import { ABSCHLUSS, type HoerAufgabe } from '../../data/abschluss'
import { typeDigit } from '../../lib/typeDigit'
import { completeUnit, finishStation } from '../../lib/progress'
import { klasseVon } from '../../lib/klasse'
import { speak } from '../../lib/speak'
import { Keypad, SayButton, StationDone, StationIntro } from './StationShell'
import { SAY, STATION_INTRO, sayDescribe } from '../../data/sprache'

const LIVES = 3

// Abschlusstest: Mischung aus allen Übungsarten der Lektion
// lesen (Abakus ablesen) · beschreiben (Text) · blitz (Abakus blitzt kurz) · abakus (Rechnen mit Abakus)
// kopf (Kopfrechnen ohne Abakus) · hoeren (Zahlen kommen nacheinander, Ergebnis eintippen – 5 je Lektion aus dem Level-Plan)
type Art = 'lesen' | 'beschreiben' | 'blitz' | 'abakus' | 'kopf' | 'hoeren'
type Question = { art: Art; n: number; options: number[]; a?: number; b?: number; zahlen?: number[] }

function optionen(n: number, range: [number, number]): number[] {
  const opts = new Set([n])
  const near = n >= 10 ? [Number(String(n).split('').reverse().join('')), n + 1, n - 1, n + 10, n - 10, n + 2] : [n + 1, n - 1, n + 2, n - 2]
  for (const x of near) if (opts.size < 4 && x >= 0 && x !== n) opts.add(x)
  while (opts.size < 4) opts.add(randomIn(range))
  return [...opts].sort(() => Math.random() - 0.5)
}

function arten(content: UnitContent): Art[] {
  return rechnet(content) ? ['abakus', 'kopf', 'blitz', 'lesen'] : ['lesen', 'beschreiben', 'blitz']
}

function makeQuestion(art: Art, content: UnitContent, prev?: number): Question {
  const { range } = content
  if ((art === 'abakus' || art === 'kopf') && rechnet(content)) {
    const { a, b, n } = makeSum(content, prev === undefined ? undefined : prev - (content.add ?? 0))
    return { art, n, a, b, options: optionen(n, range) }
  }
  const n = randomIn(range, prev)
  return { art, n, options: optionen(n, range) }
}

/** Reihenfolge im Test: Hör-Aufgaben (Zahlen nacheinander) im Wechsel mit den übrigen Übungsarten, bis alle 5 dran waren */
const PLAN: ('H' | 'O')[] = ['H', 'O', 'H', 'O', 'H', 'O', 'H', 'H']

/** Nimmt jede Übungsart der Reihe nach (gemischt), damit alle im Test vorkommen */
function useMischung(content: UnitContent, hoer: HoerAufgabe[]) {
  const deck = useRef<Art[]>([])
  const nr = useRef(0)
  const hoerRest = useRef<HoerAufgabe[]>([])
  return (prev?: number, neuStart = false) => {
    if (neuStart || nr.current === 0) { nr.current = 0; hoerRest.current = [...hoer] }
    const platz = PLAN[nr.current++] ?? 'O'
    if (platz === 'H' && hoerRest.current.length) {
      const h = hoerRest.current.shift()!
      return { art: 'hoeren' as const, n: h.antwort, zahlen: h.zahlen, options: [] }
    }
    if (!deck.current.length) deck.current = arten(content).sort(() => Math.random() - 0.5)
    return makeQuestion(deck.current.shift()!, content, prev)
  }
}

function sprich(q: Question): string[] {
  if (q.art === 'hoeren') return [SAY.ergebnisEintippen]
  if (q.art === 'abakus' || q.art === 'kopf') return [SAY.rechne, String(q.a), SAY.plus, String(q.b), SAY.wievielIst]
  if (q.art === 'blitz') return [SAY.welcheZahlWar]
  if (q.art === 'lesen') return [SAY.welcheZahlAbakus]
  return [...sayDescribe(q.n), SAY.welcheZahlIst]
}

export function BossStation({ kidId, content, world, unit }: { kidId: string; content: UnitContent; world: number; unit: number }) {
  const [{ aufgaben, blitzMs, takt, testSek }] = useState(() => klasseVon(kidId))
  const hoer = ABSCHLUSS[`${world}-${unit}`] ?? []
  // so viele Treffer, dass alle 5 Hör-Aufgaben vorkommen
  const HITS = hoer.length ? Math.max(aufgaben, PLAN.length) : aufgaben
  const naechste = useMischung(content, hoer)
  const [q, setQ] = useState(() => naechste())
  // blitz: Abakus sichtbar bis zeigen = false · hoeren: schritt = wie viele Zahlen schon gezeigt
  const [zeigen, setZeigen] = useState(true)
  const [schritt, setSchritt] = useState(0)
  const [hits, setHits] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [picked, setPicked] = useState<number | null>(null)
  const [result, setResult] = useState<'won' | 'lost' | null>(null)
  const [reward, setReward] = useState<{ perlen: number; worldDone: boolean } | null>(null)
  const [started, setStarted] = useState(false)
  const hp = Math.round(((HITS - hits) / HITS) * 100)
  const question = sprich(q)
  const questionKey = question.join('|')
  const kettenLaenge = q.zahlen?.length ?? 0
  const bereit = q.art === 'blitz' ? !zeigen : q.art === 'hoeren' ? schritt > kettenLaenge : true
  // Hör-Aufgaben: Ergebnis eintippen, Abakus auf dem Bildschirm auf Wunsch; Erklärung beim ersten Mal
  const [input, setInput] = useState('')
  const [abakusZeigen, setAbakusZeigen] = useState(false)
  const [erklaert, setErklaert] = useState(false)

  // neue Aufgabe: Blitz und Kette zurücksetzen
  const [rest, setRest] = useState(testSek)
  const neu = (next: Question) => { setQ(next); setZeigen(true); setSchritt(0); setRest(testSek); setInput('') }

  // Blitz: Abakus nach blitzMs ausblenden
  useEffect(() => {
    if (!started || q.art !== 'blitz' || !zeigen) return
    const t = window.setTimeout(() => setZeigen(false), blitzMs)
    return () => window.clearTimeout(t)
  }, [started, q, zeigen, blitzMs])

  // Vor der ersten Hör-Aufgabe erklärt Perli, wie es geht
  useEffect(() => {
    if (!started || q.art !== 'hoeren' || erklaert) return
    let aktiv = true
    void speak(SAY.hoerErklaerung).then(() => { if (aktiv) setErklaert(true) })
    return () => { aktiv = false }
  }, [started, q, erklaert])

  // Hör-Aufgabe: Zahlen im Takt nacheinander zeigen und sprechen
  useEffect(() => {
    if (!started || !erklaert || q.art !== 'hoeren' || !q.zahlen || schritt > kettenLaenge) return
    if (schritt > 0) {
      const z = q.zahlen[schritt - 1]
      void speak(schritt === 1 ? String(z) : z < 0 ? [SAY.minus, String(-z)] : [SAY.plus, String(z)])
    }
    const t = window.setTimeout(() => setSchritt((x) => x + 1), schritt === 0 ? 400 : takt * 1000)
    return () => window.clearTimeout(t)
  }, [started, erklaert, q, schritt, kettenLaenge, takt])

  useEffect(() => { if (started && bereit) void speak(questionKey.split('|')) }, [started, questionKey, q, bereit])

  // Countdown je Frage: läuft erst, wenn die Frage ganz gezeigt ist; bei 0 zählt es als Fehler
  const laeuft = started && bereit && picked === null && !result
  useEffect(() => {
    if (!laeuft) return
    const t = window.setTimeout(() => { if (rest <= 1) answer(-1); else setRest(rest - 1) }, 1000)
    return () => window.clearTimeout(t)
  })

  function answer(v: number) {
    if (picked !== null || result || !bereit) return
    setPicked(v)
    const ok = v === q.n
    const nextHits = ok ? hits + 1 : hits
    const nextLives = ok ? lives : lives - 1
    void speak(ok ? SAY.treffer : [SAY.autsch, String(q.n)])
    window.setTimeout(() => {
      setHits(nextHits)
      setLives(nextLives)
      setPicked(null)
      if (nextHits >= HITS) {
        const stars = nextLives
        const perlen = finishStation(kidId, 'boss', stars, HITS)
        const w = WORLDS[world - 1]
        const { worldDone } = completeUnit(kidId, w.units.length, WORLDS.length)
        setReward({ perlen, worldDone })
        setResult('won')
        void speak(SAY.bossGewonnen)
      } else if (nextLives <= 0) {
        setResult('lost')
        void speak(SAY.bossVerloren)
      } else neu(naechste(q.n))
    }, ok ? 800 : 1800)
  }

  const onKey = (k: string) => {
    if (picked !== null || !bereit) return
    const t = typeDigit(input, k, q.n)
    setInput(t.input)
    if (t.done) answer(Number(t.input))
  }

  const retry = () => { neu(naechste(undefined, true)); setHits(0); setLives(LIVES); setResult(null) }
  const w = WORLDS[world - 1]
  const nextText = reward?.worldDone
    ? `Welt ${world} geschafft! Du bekommst den ${w.belt} Gürtel und 1 Diamant.`
    : `Einheit ${unit} geschafft! Einheit ${unit + 1} ist jetzt offen.`

  return (
    <Stage >
      <div className="boss">
        <div className="boss-top">
          <a href="#/einheit" aria-label="Aufgeben" className="round-btn big"><Icon name="x" color="#FFFFFF" size={26} /></a>
          <div className="boss-lives" aria-label={`${lives} von ${LIVES} Leben`}>
            {Array.from({ length: LIVES }, (_, i) => (
              <Icon key={i} name="heart" size={40} color={i < lives ? '#FF5C8A' : '#6E3B8A'} fill={i < lives ? '#FF5C8A' : 'none'} />
            ))}
          </div>
          <SayButton say={question} />
          <div className="boss-hp">
            <div className="boss-hp-head"><span>Grummel, der Zahlenfresser</span><span>{hp} / 100</span></div>
            <div className="boss-hp-track"><div style={{ width: `${hp}%` }} /></div>
          </div>
        </div>

        <div className={q.art === 'hoeren' && erklaert && schritt > 0 ? 'boss-arena mit-liste' : 'boss-arena'}>
          {q.art === 'hoeren' && erklaert && schritt > 0 && (
            // gesagte Zahlen untereinander wie beim schriftlichen Rechnen; nach der letzten Zahl Strich und Ergebnis
            <div className="hoer-liste" aria-live="polite" style={{ '--zeilen': kettenLaenge + 1 } as CSSProperties}>
              {q.zahlen!.slice(0, Math.min(schritt, kettenLaenge)).map((z, i) => (
                <div key={i} className={i === schritt - 1 ? 'hoer-z neu' : 'hoer-z'}>{i === 0 ? z : z < 0 ? `− ${-z}` : `+ ${z}`}</div>
              ))}
              {schritt > kettenLaenge && (
                <div className={picked === null ? 'hoer-ergebnis' : picked === q.n ? 'hoer-ergebnis right' : 'hoer-ergebnis wrong'}>{picked !== null && picked !== q.n ? q.n : input || '?'}</div>
              )}
            </div>
          )}
          {q.art === 'hoeren' && abakusZeigen
            ? <Fit className="boss-fit"><Abakus key={`${hits}-${lives}-${q.zahlen?.join()}`} value={0} cols={Math.max(2, content.cols)} colw={110} /></Fit>
            : <Fit className="boss-fit"><Grummel size={280} hit={picked !== null && picked === q.n} /></Fit>}
          {picked !== null && picked === q.n && <div className="boss-pow">−10!</div>}
        </div>

        <div className="boss-panel">
          <div className="boss-question">
            <div className="boss-q-head">
              <span className="eyebrow light">TREFFER {hits} VON {HITS}</span>
              <span className={rest <= 3 && laeuft ? 'boss-sek knapp' : 'boss-sek'}><Icon name="clock" size={30} color="currentColor" /> {rest}</span>
            </div>
            <div className="boss-timer"><div style={{ width: `${(rest / testSek) * 100}%` }} /></div>
            {q.art === 'hoeren' ? (
              <>
                <div key={schritt} className={schritt >= 1 && schritt <= kettenLaenge ? 'boss-hoer-zahl neu' : 'boss-hoer-zahl'}>
                  {!erklaert ? 'Hör gut zu!' : schritt === 0 ? 'Pass auf …' : schritt <= kettenLaenge ? (() => { const z = q.zahlen![schritt - 1]; return schritt === 1 ? z : z < 0 ? `− ${-z}` : `+ ${z}` })() : (input || '?')}
                </div>
                <button type="button" className="boss-abakus-btn" onClick={() => setAbakusZeigen((x) => !x)}>
                  {abakusZeigen ? 'Abakus ausblenden' : 'Abakus zeigen'}
                </button>
              </>
            ) : q.art === 'kopf' ? (
              <div className="boss-q-text">{q.a} + {q.b} = ?</div>
            ) : q.art === 'beschreiben' ? (
              <div className="boss-q-text">{describeNumber(q.n)[0].toUpperCase() + describeNumber(q.n).slice(1)} = ?</div>
            ) : q.art === 'blitz' && !zeigen ? (
              <div className="boss-q-text">Welche Zahl war es?</div>
            ) : (
              <div className="boss-q-read">
                <Abakus3D key={`${hits}-${lives}`} value={q.a ?? q.n} cols={content.cols} colw={content.cols > 1 ? 40 : 46} />
                <span>{q.art === 'abakus' ? `${q.a} + ${q.b} = ?` : q.art === 'blitz' ? 'Schau genau!' : 'Welche Zahl?'}</span>
              </div>
            )}
          </div>
          {q.art === 'hoeren' ? (
            <div className={picked === null ? 'boss-keypad' : picked === q.n ? 'boss-keypad right' : 'boss-keypad wrong'}>
              <Keypad onKey={onKey} disabled={picked !== null || !bereit} />
            </div>
          ) : (
          <div className="boss-options">
            {q.options.map((o) => (
              <button
                key={o}
                type="button"
                className={picked === null ? 'boss-opt' : o === q.n ? 'boss-opt right' : o === picked ? 'boss-opt wrong' : 'boss-opt dim'}
                disabled={picked !== null || !bereit}
                onClick={() => answer(o)}
              >
                {o}
              </button>
            ))}
          </div>
          )}
        </div>
      </div>

      {!started && <StationIntro station="boss" text={STATION_INTRO.boss} onStart={() => setStarted(true)} />}
      {result === 'lost' && (
        <div className="done-overlay" role="dialog" aria-label="Verloren">
          <div className="done-card">
            <Grummel size={180} />
            <h2>Fast geschafft!</h2>
            <p>Grummel hat diesmal gewonnen. Du hast {hits} von {HITS} Treffern geschafft. Bestehe den Test, dann geht es zur nächsten Lektion!</p>
            <div className="done-actions">
              <a href="#/einheit" className="btn-outline dark">Zur Einheit</a>
              <button type="button" className="btn-primary small" onClick={retry}>Nochmal kämpfen</button>
            </div>
          </div>
        </div>
      )}
      {result === 'won' && reward && (
        <StationDone
          title="Tagesaufgabe geschafft!"
          stars={lives}
          perlen={reward.perlen}
          text={nextText}
          say={[SAY.bossGewonnen, SAY.tagGeschafft]}
          href={reward.worldDone ? '#/karte' : '#/einheit'}
          extra={<>
            <div className="done-tag">Du hast deine Lektion für heute geschafft. Du bist großartig!</div>
            <div className="done-trophy"><Icon name="trophy" color="#DE9800" fill="#FFE58F" size={40} /> Pokal: {content.title}</div>
          </>}
        />
      )}
    </Stage>
  )
}
