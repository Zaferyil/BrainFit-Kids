import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { Abakus3D } from '../../components/Abakus3D'
import { makeSum, type UnitContent } from '../../data/units'
import { kette, kettenLaenge, UEBUNGEN, type UebungsArt, type UebungsPlatz } from '../../data/uebungen'
import { SAY } from '../../data/sprache'
import { finishStation } from '../../lib/progress'
import { klasseVon } from '../../lib/klasse'
import { speak } from '../../lib/speak'
import { typeDigit } from '../../lib/typeDigit'
import { Keypad, StationDone, StationShell } from './StationShell'

// Neue Übungsarten für die Abwechslung zwischen den Lektionen (siehe data/uebungen.ts).

type Props = { kidId: string; content: UnitContent; platz: UebungsPlatz; art: UebungsArt }

const sterne = (fehler: number) => (fehler === 0 ? 3 : fehler <= 2 ? 2 : 1)
const zeichen = (z: number, i: number) => (i === 0 ? `${z}` : z < 0 ? `− ${-z}` : `+ ${z}`)
const sagZahl = (z: number, i: number) => (i === 0 ? String(z) : z < 0 ? [SAY.minus, String(-z)] : [SAY.plus, String(z)])

function useStart(art: UebungsArt) {
  const [started, setStarted] = useState(false)
  return { started, start: () => setStarted(true), intro: UEBUNGEN[art].intro, label: UEBUNGEN[art].title }
}

/** Zahlen-Blitz (Math Kids) und Hör-Rechnen: Zahlen kommen im Takt, am Ende das Ergebnis eintippen */
export function KettenStation({ kidId, content, platz, art }: Props) {
  const hoer = art === 'hoerRechnen'
  const [{ aufgaben: COUNT, takt }] = useState(() => klasseVon(kidId))
  const [aufgaben] = useState(() => Array.from({ length: COUNT }, () => kette(content, kettenLaenge(COUNT))))
  const [index, setIndex] = useState(0)
  const [schritt, setSchritt] = useState(-1)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'zeigen' | 'tippen' | 'richtig' | 'falsch'>('zeigen')
  const [ergebnisse, setErgebnisse] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const s = useStart(art)
  const a = aufgaben[index]

  // Zahlen nacheinander zeigen (Zahlen-Blitz) oder nur sprechen (Hör-Rechnen)
  useEffect(() => {
    if (!s.started || status !== 'zeigen') return
    if (schritt >= a.zahlen.length) {
      const t = window.setTimeout(() => { setStatus('tippen'); void speak(SAY.ergebnisEintippen) }, 300)
      return () => window.clearTimeout(t)
    }
    if (schritt >= 0) void speak(sagZahl(a.zahlen[schritt], schritt))
    const t = window.setTimeout(() => setSchritt((x) => x + 1), schritt < 0 ? 900 : takt * 1000)
    return () => window.clearTimeout(t)
  }, [s.started, status, schritt, a, takt])

  useEffect(() => { if (s.started && schritt === -1 && status === 'zeigen') void speak(SAY.passAuf) }, [s.started, schritt, status])

  const onKey = (k: string) => {
    if (status !== 'tippen') return
    const t = typeDigit(input, k, a.antwort)
    setInput(t.input)
    if (!t.done) return
    const ok = Number(t.input) === a.antwort
    const res = [...ergebnisse, ok ? 'right' as const : 'wrong' as const]
    setErgebnisse(res)
    setStatus(ok ? 'richtig' : 'falsch')
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(a.antwort)])
    window.setTimeout(() => {
      if (index + 1 >= COUNT) {
        const f = res.filter((r) => r === 'wrong').length
        setDone({ stars: sterne(f), perlen: finishStation(kidId, platz, sterne(f), COUNT - f) })
      } else { setIndex(index + 1); setSchritt(-1); setInput(''); setStatus('zeigen') }
    }, ok ? 1000 : 2200)
  }

  const dots = Array.from({ length: COUNT }, (_, i) => ergebnisse[i] ?? (i === index ? 'current' : 'open'))
  const gezeigt = a.zahlen.slice(0, Math.max(0, Math.min(schritt + 1, a.zahlen.length)))
  return (
    <StationShell station={platz} title={UEBUNGEN[art].title} label={s.label} dots={dots} intro={s.intro} started={s.started} onStart={s.start}>
      <div className="ue">
        <div className="ue-karte">
          <div className="eyebrow">AUFGABE {index + 1} VON {COUNT}</div>
          {hoer ? (
            <div className={status === 'zeigen' ? 'ue-hoer an' : 'ue-hoer'}><Icon name="volume" size={64} color="currentColor" /><span>{status === 'zeigen' ? 'Hör gut zu …' : 'Wie viel ist das?'}</span></div>
          ) : (
            <div className="ue-kette">
              {gezeigt.map((z, i) => <span key={i} className={i === gezeigt.length - 1 && status === 'zeigen' ? 'neu' : ''}>{zeichen(z, i)}</span>)}
              {!gezeigt.length && <span className="leise">Pass auf …</span>}
            </div>
          )}
          <div className={`ue-antwort ${status}`}>{status === 'falsch' ? `${a.zahlen.map(zeichen).join(' ')} = ${a.antwort}` : input || '?'}</div>
        </div>
        <Keypad onKey={onKey} disabled={status !== 'tippen'} />
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Alles richtig – wow!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}

/** Schnell-Runde (Math Kids): eine Minute, so viele Aufgaben wie möglich, mit Tempo-Anzeige */
export function SchnellStation({ kidId, content, platz, art }: Props) {
  const ZEIT = 60
  const [{ aufgaben: ZIEL }] = useState(() => klasseVon(kidId))
  const [aufgabe, setAufgabe] = useState(() => makeSum(content))
  const [input, setInput] = useState('')
  const [rest, setRest] = useState(ZEIT)
  const [richtig, setRichtig] = useState(0)
  const [falsch, setFalsch] = useState(0)
  const [blink, setBlink] = useState<'' | 'right' | 'wrong'>('')
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const s = useStart(art)
  const fertig = useRef(false)

  useEffect(() => { if (s.started) void speak(SAY.schnellLos) }, [s.started])
  useEffect(() => {
    if (!s.started || done) return
    if (rest <= 0) {
      if (fertig.current) return
      fertig.current = true
      void speak(SAY.zeitUm)
      const st = richtig >= ZIEL ? 3 : richtig >= Math.ceil(ZIEL / 2) ? 2 : 1
      setDone({ stars: st, perlen: finishStation(kidId, platz, st, richtig) })
      return
    }
    const t = window.setTimeout(() => setRest((r) => r - 1), 1000)
    return () => window.clearTimeout(t)
  }, [s.started, rest, done, richtig, ZIEL, kidId, platz])

  const onKey = (k: string) => {
    if (!s.started || rest <= 0) return
    const t = typeDigit(input, k, aufgabe.n)
    setInput(t.input)
    if (!t.done) return
    const ok = Number(t.input) === aufgabe.n
    if (ok) setRichtig((x) => x + 1); else setFalsch((x) => x + 1)
    setBlink(ok ? 'right' : 'wrong')
    window.setTimeout(() => setBlink(''), 350)
    setInput('')
    setAufgabe(makeSum(content, aufgabe.a))
  }

  const tempo = Math.min(1, richtig / Math.max(1, ZIEL))
  return (
    <StationShell station={platz} title={UEBUNGEN[art].title} label={s.label} intro={s.intro} started={s.started} onStart={s.start}>
      <div className="ue">
        <div className="ue-karte">
          <div className="ue-schnell-kopf">
            <span className="ue-zeit"><Icon name="clock" size={26} color="currentColor" /> {rest}</span>
            <span className="ue-zaehler"><b className="gruen">{richtig}</b> richtig · <b className="rot">{falsch}</b> falsch</span>
          </div>
          <div className="ue-tempo" aria-label="Tempo"><div style={{ width: `${tempo * 100}%` }} /><span>Tempo</span></div>
          <div className="ue-aufgabe">{aufgabe.a} + {aufgabe.b} = ?</div>
          <div className={`ue-antwort ${blink}`}>{input || '?'}</div>
        </div>
        <Keypad onKey={onKey} disabled={!s.started || rest <= 0} />
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={`${richtig} Aufgaben in einer Minute!`} />}
    </StationShell>
  )
}

/** Rechen-Memory: Karten umdrehen, Aufgabe und Ergebnis finden */
export function MemoryStation({ kidId, content, platz, art }: Props) {
  const [paare] = useState(() => {
    const out: { a: number; b: number; n: number }[] = []
    let guard = 0
    while (out.length < 4 && guard++ < 200) {
      const x = makeSum(content)
      if (!out.some((o) => o.n === x.n)) out.push(x)
    }
    return out
  })
  const [karten] = useState(() => paare.flatMap((p, i) => [{ id: `a${i}`, paar: i, text: `${p.a} + ${p.b}` }, { id: `e${i}`, paar: i, text: String(p.n) }]).sort(() => Math.random() - 0.5))
  const [offen, setOffen] = useState<string[]>([])
  const [gefunden, setGefunden] = useState<number[]>([])
  const [fehler, setFehler] = useState(0)
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const s = useStart(art)

  useEffect(() => { if (s.started) void speak(SAY.findePaare) }, [s.started])

  const tippen = (id: string) => {
    const k = karten.find((x) => x.id === id)!
    if (offen.length >= 2 || offen.includes(id) || gefunden.includes(k.paar)) return
    const neu = [...offen, id]
    setOffen(neu)
    if (neu.length < 2) return
    const [x, y] = neu.map((i) => karten.find((c) => c.id === i)!)
    if (x.paar === y.paar) {
      const g = [...gefunden, x.paar]
      setGefunden(g)
      void speak(SAY.paarGefunden)
      window.setTimeout(() => {
        setOffen([])
        if (g.length === paare.length) { const st = fehler <= 2 ? 3 : fehler <= 5 ? 2 : 1; setDone({ stars: st, perlen: finishStation(kidId, platz, st, paare.length * 2) }) }
      }, 600)
    } else {
      setFehler((f) => f + 1)
      window.setTimeout(() => setOffen([]), 1100)
    }
  }

  return (
    <StationShell station={platz} title={UEBUNGEN[art].title} label={s.label} intro={s.intro} started={s.started} onStart={s.start}>
      <div className="ue">
        <div className="ue-memory">
          {karten.map((k) => {
            const zu = !offen.includes(k.id) && !gefunden.includes(k.paar)
            return (
              <button key={k.id} type="button" className={`ue-mkarte ${zu ? 'zu' : ''} ${gefunden.includes(k.paar) ? 'gefunden' : ''}`} onClick={() => tippen(k.id)} aria-label={zu ? 'Karte' : k.text}>
                {zu ? '?' : k.text}
              </button>
            )
          })}
        </div>
        <p className="ue-hinweis">{gefunden.length} von {paare.length} Paaren gefunden</p>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text="Alle Paare gefunden!" />}
    </StationShell>
  )
}

/** Größer oder kleiner? (nach Anzan Meister „Zahlen vergleichen“): die Aufgabe mit dem größeren Ergebnis antippen */
export function VergleichStation({ kidId, content, platz, art }: Props) {
  const [{ aufgaben: COUNT }] = useState(() => klasseVon(kidId))
  const [aufgaben] = useState(() => Array.from({ length: COUNT }, () => {
    const x = makeSum(content)
    let y = makeSum(content)
    for (let i = 0; i < 30 && y.n === x.n; i++) y = makeSum(content)
    if (y.n === x.n) y = { ...y, b: y.b, n: y.n + 1, a: y.a + 1 }
    return [x, y]
  }))
  const [index, setIndex] = useState(0)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const [ergebnisse, setErgebnisse] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const s = useStart(art)
  const paar = aufgaben[index]
  const groesser = paar[0].n > paar[1].n ? 0 : 1

  useEffect(() => { if (s.started) void speak(SAY.welcheGroesser) }, [s.started, index])

  const waehlen = (i: number) => {
    if (gewaehlt !== null) return
    setGewaehlt(i)
    const ok = i === groesser
    const res = [...ergebnisse, ok ? 'right' as const : 'wrong' as const]
    setErgebnisse(res)
    void speak(ok ? SAY.richtig : SAY.autsch)
    window.setTimeout(() => {
      setGewaehlt(null)
      if (index + 1 >= COUNT) {
        const f = res.filter((r) => r === 'wrong').length
        setDone({ stars: sterne(f), perlen: finishStation(kidId, platz, sterne(f), COUNT - f) })
      } else setIndex(index + 1)
    }, ok ? 900 : 1800)
  }

  const dots = Array.from({ length: COUNT }, (_, i) => ergebnisse[i] ?? (i === index ? 'current' : 'open'))
  return (
    <StationShell station={platz} title={UEBUNGEN[art].title} label={s.label} dots={dots} intro={s.intro} started={s.started} onStart={s.start} say={SAY.welcheGroesser}>
      <div className="ue">
        <p className="ue-frage">Welche Aufgabe gibt mehr?</p>
        <div className="ue-vergleich">
          {paar.map((p, i) => (
            <button key={i} type="button" disabled={gewaehlt !== null}
              className={gewaehlt === null ? 'ue-vkarte' : i === groesser ? 'ue-vkarte right' : i === gewaehlt ? 'ue-vkarte wrong' : 'ue-vkarte dim'}
              onClick={() => waehlen(i)}>
              <span>{p.a} + {p.b}</span>
              {gewaehlt !== null && <small>= {p.n}</small>}
            </button>
          ))}
        </div>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Alles richtig – wow!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}

/** Merken und rechnen (nach Anzan Meister „Zahlen merken“): Zahlen kurz zeigen, dann die Summe eintippen */
export function MerkenStation({ kidId, content, platz, art }: Props) {
  const [{ aufgaben: COUNT, blitzMs }] = useState(() => klasseVon(kidId))
  const [aufgaben] = useState(() => Array.from({ length: COUNT }, () => kette(content, kettenLaenge(COUNT))))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'bereit' | 'zeigen' | 'tippen' | 'richtig' | 'falsch'>('bereit')
  const [input, setInput] = useState('')
  const [ergebnisse, setErgebnisse] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const s = useStart(art)
  const a = aufgaben[index]

  useEffect(() => {
    if (!s.started) return
    if (phase === 'bereit') { void speak(SAY.merkDir); const t = window.setTimeout(() => setPhase('zeigen'), 1200); return () => window.clearTimeout(t) }
    // jüngere Kinder sehen die Zahlen länger: Blitzzeit je Zahl
    if (phase === 'zeigen') { const t = window.setTimeout(() => { setPhase('tippen'); void speak(SAY.alleZusammen) }, blitzMs * a.zahlen.length + 800); return () => window.clearTimeout(t) }
  }, [s.started, phase, blitzMs, a])

  const onKey = (k: string) => {
    if (phase !== 'tippen') return
    const t = typeDigit(input, k, a.antwort)
    setInput(t.input)
    if (!t.done) return
    const ok = Number(t.input) === a.antwort
    const res = [...ergebnisse, ok ? 'right' as const : 'wrong' as const]
    setErgebnisse(res)
    setPhase(ok ? 'richtig' : 'falsch')
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(a.antwort)])
    window.setTimeout(() => {
      if (index + 1 >= COUNT) {
        const f = res.filter((r) => r === 'wrong').length
        setDone({ stars: sterne(f), perlen: finishStation(kidId, platz, sterne(f), COUNT - f) })
      } else { setIndex(index + 1); setInput(''); setPhase('bereit') }
    }, ok ? 1000 : 2400)
  }

  const dots = Array.from({ length: COUNT }, (_, i) => ergebnisse[i] ?? (i === index ? 'current' : 'open'))
  const sichtbar = phase === 'zeigen' || phase === 'falsch'
  return (
    <StationShell station={platz} title={UEBUNGEN[art].title} label={s.label} dots={dots} intro={s.intro} started={s.started} onStart={s.start}>
      <div className="ue">
        <div className="ue-karte">
          <div className="eyebrow">AUFGABE {index + 1} VON {COUNT}</div>
          <div className="ue-merken">
            {sichtbar ? a.zahlen.map((z, i) => <span key={i}>{zeichen(z, i)}</span>) : <span className="leise">{phase === 'bereit' ? 'Merk dir die Zahlen!' : 'Wie viel sind alle zusammen?'}</span>}
          </div>
          <div className={`ue-antwort ${phase}`}>{phase === 'falsch' ? `= ${a.antwort}` : input || '?'}</div>
        </div>
        <Keypad onKey={onKey} disabled={phase !== 'tippen'} />
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Super Gedächtnis!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}

/** Abakus-Karten (nach Anzan Meister „Abakus Flash Card“): Abakus → Zahl wählen oder Zahl → Abakus wählen */
export function FlashKartenStation({ kidId, content, platz, art }: Props) {
  const [{ aufgaben: COUNT }] = useState(() => klasseVon(kidId))
  const [karten] = useState(() => Array.from({ length: COUNT }, (_, i) => {
    const n = makeSum(content).n
    // Ablenker wie bei Anzan Meister: Nachbarzahlen und Zahlen mit verwechselbaren Perlen
    const opts = new Set([n])
    for (const x of [n + 1, n - 1, n + 5, n - 5, n + 10, n - 10, n + 2]) if (opts.size < 4 && x >= 0 && x <= 99) opts.add(x)
    return { n, modus: i % 2 === 0 ? 'abakus' as const : 'zahl' as const, optionen: [...opts].sort(() => Math.random() - 0.5) }
  }))
  const [index, setIndex] = useState(0)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const [ergebnisse, setErgebnisse] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const s = useStart(art)
  const k = karten[index]
  const frage = k.modus === 'abakus' ? SAY.welcheZahlKarte : SAY.welcherAbakus

  useEffect(() => { if (s.started) void speak(frage) }, [s.started, index, frage])

  const waehlen = (o: number) => {
    if (gewaehlt !== null) return
    setGewaehlt(o)
    const ok = o === k.n
    const res = [...ergebnisse, ok ? 'right' as const : 'wrong' as const]
    setErgebnisse(res)
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(k.n)])
    window.setTimeout(() => {
      setGewaehlt(null)
      if (index + 1 >= COUNT) {
        const f = res.filter((r) => r === 'wrong').length
        setDone({ stars: sterne(f), perlen: finishStation(kidId, platz, sterne(f), COUNT - f) })
      } else setIndex(index + 1)
    }, ok ? 800 : 1800)
  }

  const klasse = (o: number) => (gewaehlt === null ? 'ue-fk-opt' : o === k.n ? 'ue-fk-opt right' : o === gewaehlt ? 'ue-fk-opt wrong' : 'ue-fk-opt dim')
  const dots = Array.from({ length: COUNT }, (_, i) => ergebnisse[i] ?? (i === index ? 'current' : 'open'))
  return (
    <StationShell station={platz} title={UEBUNGEN[art].title} label={s.label} dots={dots} intro={s.intro} started={s.started} onStart={s.start} say={frage}>
      <div className="ue">
        <div className="ue-karte ue-fk-frage">
          <div className="eyebrow">KARTE {index + 1} VON {COUNT}</div>
          {k.modus === 'abakus'
            ? <Abakus3D key={index} value={k.n} cols={2} colw={64} />
            : <div className="ue-aufgabe">{k.n}</div>}
          <span className="ue-fk-text">{k.modus === 'abakus' ? 'Welche Zahl zeigt der Abakus?' : 'Welcher Abakus zeigt diese Zahl?'}</span>
        </div>
        <div className={k.modus === 'abakus' ? 'ue-fk-optionen zahlen' : 'ue-fk-optionen bilder'}>
          {k.optionen.map((o) => (
            <button key={o} type="button" className={klasse(o)} disabled={gewaehlt !== null} onClick={() => waehlen(o)} aria-label={k.modus === 'abakus' ? String(o) : `Abakus ${o}`}>
              {k.modus === 'abakus' ? o : <Abakus3D value={o} cols={2} colw={42} />}
            </button>
          ))}
        </div>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.stars === 3 ? 'Blitzschnell erkannt!' : 'Gut geübt! Du wirst immer besser.'} />}
    </StationShell>
  )
}
