import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from 'react'
import { Abakus3D } from '../components/Abakus3D'
import { abakusStellen, BEREICHE, berichtAnfordern, blitzStellen, optionen, punkte, rechenaufgabe, speichernUndVergleichen, STUFEN, stufeVonAlter, zahlMitStellen, zeitLimit, type Bereich, type Variante, type Vergleich, type Werte } from '../lib/check'

// Gratis Kopfrechen-Check: Alter + Schulstufe → 5 kurze Spiele → Ergebnis im Vergleich mit Gleichaltrigen → Bericht per E-Mail.

const BASE = import.meta.env.BASE_URL
const SITE = '/'
type Phase = { typ: 'start' } | { typ: 'info'; schritt: number } | { typ: 'spiel'; schritt: number } | { typ: 'rechnet' } | { typ: 'ergebnis' }
type Spiel = { id: Bereich; titel: string; info: string; Comp: (p: SpielProps) => ReactElement }
/** Spiele je Variante – A: Vorschule (nur Bilder), B: kennt Zahlen (Auswahl statt Tippen), C: Schulkind */
function spieleFuer(v: Variante, abakus: boolean, rechnet: boolean): Spiel[] {
  const merken: Spiel = { id: 'merken', titel: 'Perlen merken', info: 'Die Perlen leuchten nacheinander auf. Tippe sie danach in der gleichen Reihenfolge an.', Comp: Merken }
  const finden: Spiel = { id: 'konzentration', titel: 'Perlen finden', info: 'Finde so schnell wie möglich alle Perlen in der gesuchten Farbe.', Comp: Finden }
  const abakusLesen: Spiel = { id: 'abakus', titel: 'Abakus lesen', info: 'Welche Zahl zeigt der Abakus? Tippe die richtige Antwort.', Comp: AbakusLesen }
  const mengeZahl: Spiel = { id: 'abakus', titel: 'Mengen erkennen', info: 'Wie viele Perlen sind es? Tippe die richtige Zahl. Tipp: Zehnerstangen helfen beim Zählen.', Comp: MengeZahl }
  if (v === 'A') return [
    { id: 'rechnen', titel: 'Wo sind mehr?', info: 'Tippe auf die Seite, auf der mehr Perlen sind.', Comp: MengenVergleich },
    { id: 'abakus', titel: 'Gleich viele', info: 'Schau dir die Perlen oben an. Tippe unten das Bild mit genauso vielen Perlen.', Comp: GleicheMenge },
    { id: 'blitz', titel: 'Blitz-Perlen', info: 'Perlen erscheinen ganz kurz. Tippe danach das Bild mit gleich vielen Perlen.', Comp: BlitzMenge },
    merken, finden,
  ]
  if (v === 'B') return [
    rechnet ? { id: 'rechnen', titel: 'Rechnen', info: 'Rechne im Kopf und tippe die richtige Antwort.', Comp: RechnenAuswahl } : { id: 'rechnen', titel: 'Zählen', info: 'Wie viele Perlen siehst du? Tippe die richtige Zahl.', Comp: Zaehlen },
    abakus ? abakusLesen : mengeZahl,
    { id: 'blitz', titel: 'Blitzzahlen', info: 'Eine Zahl erscheint ganz kurz. Tippe danach dieselbe Zahl.', Comp: BlitzAuswahl },
    merken, finden,
  ]
  return [
    { id: 'rechnen', titel: 'Kopfrechnen', info: 'Rechne im Kopf und tippe das Ergebnis ein. Schnell, aber genau!', Comp: Rechnen },
    abakus ? abakusLesen : mengeZahl,
    { id: 'blitz', titel: 'Blitzzahlen', info: 'Eine Zahl erscheint ganz kurz. Merke sie dir und tippe sie danach ein.', Comp: Blitz },
    merken, finden,
  ]
}

export function Check() {
  const [phase, setPhase] = useState<Phase>({ typ: 'start' })
  const [alter, setAlter] = useState<number | ''>('')
  const [stufe, setStufe] = useState<number | ''>('')
  const [antw, setAntw] = useState<{ abakus?: boolean; liest?: boolean; rechnet?: boolean; schreibt?: boolean }>({})
  const jung = stufe !== '' && stufe <= 1
  const liest = !jung || antw.liest === true
  const rechnet = !jung || (liest && antw.rechnet === true)
  const schreibt = !jung || (liest && antw.schreibt === true)
  const variante: Variante = !liest ? 'A' : rechnet && schreibt ? 'C' : 'B'
  const abakus = antw.abakus === true && liest
  const SPIELE = useMemo(() => spieleFuer(variante, abakus, rechnet), [variante, abakus, rechnet])
  const fragenOffen = antw.abakus === undefined || (jung && (antw.liest === undefined || (antw.liest && (antw.rechnet === undefined || antw.schreibt === undefined))))
  const [werte, setWerte] = useState<Partial<Werte>>({})
  const [ergebnis, setErgebnis] = useState<{ id: string; vergleich: Vergleich } | null>(null)
  const startZeit = useRef(0)
  useEffect(() => { document.title = 'Gratis Kopfrechen-Check für Kinder | BrainFit Kids' }, [])

  const fertig = (b: Bereich, wert: number) => {
    const neu = { ...werte, [b]: Math.round(Math.max(0, Math.min(100, wert))) }
    setWerte(neu)
    const i = SPIELE.findIndex((s) => s.id === b)
    if (i < SPIELE.length - 1) { setPhase({ typ: 'info', schritt: i + 1 }); return }
    setPhase({ typ: 'rechnet' })
    void speichernUndVergleichen(Number(alter), Number(stufe), variante, abakus, neu as Werte, Math.round((Date.now() - startZeit.current) / 1000))
      .then((r) => { setErgebnis(r); setPhase({ typ: 'ergebnis' }) })
  }

  const st = Number(stufe)
  return (
    <div className="chk">
      <header className="chk-kopf"><a href={SITE}><img src={`${BASE}logo.webp`} alt="BrainFit Kids" /></a>
        {(phase.typ === 'info' || phase.typ === 'spiel') && <div className="chk-fortschritt" aria-label={`Spiel ${phase.schritt + 1} von 5`}>{SPIELE.map((s, i) => <i key={s.id} className={i < phase.schritt ? 'fertig' : i === phase.schritt ? 'jetzt' : ''} />)}</div>}
      </header>
      <main className="chk-main">
        {phase.typ === 'start' && (
          <section className="chk-karte chk-start">
            <span className="chk-eyebrow">Gratis · ohne Anmeldung · ca. 4 Minuten</span>
            <h1>Kopfrechen-Check 🎯</h1>
            <p>5 kurze Spiele zeigen, wo Ihr Kind beim Kopfrechnen, Zahlenverständnis, Gedächtnis und bei der Konzentration steht – im Vergleich mit Gleichaltrigen.</p>
            <form onSubmit={(e: FormEvent) => { e.preventDefault(); startZeit.current = Date.now(); setPhase({ typ: 'info', schritt: 0 }) }}>
              <label>Wie alt ist Ihr Kind?
                <select required value={alter} onChange={(e) => { const a = Number(e.target.value); setAlter(a); if (stufe === '') setStufe(stufeVonAlter(a)) }}>
                  <option value="" disabled>Alter wählen</option>
                  {Array.from({ length: 9 }, (_, i) => i + 4).map((a) => <option key={a} value={a}>{a} Jahre</option>)}
                </select></label>
              <label>Welche Klasse besucht es?
                <select required value={stufe} onChange={(e) => setStufe(Number(e.target.value))}>
                  <option value="" disabled>Klasse wählen</option>
                  {STUFEN.map((s, i) => <option key={s} value={i}>{s}</option>)}
                </select></label>
              {stufe !== '' && <>
                <JaNein frage="Hat Ihr Kind schon mit einem Abakus gerechnet?" wert={antw.abakus} onWahl={(v) => setAntw({ ...antw, abakus: v })} />
                {jung && <JaNein frage="Erkennt Ihr Kind die Zahlen von 1 bis 10?" wert={antw.liest} onWahl={(v) => setAntw({ ...antw, liest: v })} />}
                {jung && antw.liest && <JaNein frage="Kann es kleine Aufgaben wie 3 + 2 schon rechnen?" wert={antw.rechnet} onWahl={(v) => setAntw({ ...antw, rechnet: v })} />}
                {jung && antw.liest && <JaNein frage="Kann es Zahlen selbst schreiben bzw. eintippen?" wert={antw.schreibt} onWahl={(v) => setAntw({ ...antw, schreibt: v })} />}
              </>}
              {stufe !== '' && !fragenOffen && <p className="chk-variante">{variante === 'A' ? '👶 Wir starten mit dem Bilder-Check – ganz ohne Lesen und Schreiben.' : variante === 'B' ? '🔢 Ihr Kind tippt die richtige Antwort an – ohne selbst zu schreiben.' : '✏️ Ihr Kind rechnet im Kopf und tippt die Ergebnisse ein.'}{jung ? ' Lesen Sie die kurzen Anleitungen gern vor.' : ''}</p>}
              <button type="submit" className="chk-knopf" disabled={alter === '' || stufe === '' || fragenOffen}>Test starten 🚀</button>
            </form>
            <p className="chk-klein">Tipp: Lassen Sie Ihr Kind selbst spielen – ohne Hilfe. Nur so ist das Ergebnis aussagekräftig.</p>
          </section>
        )}
        {phase.typ === 'info' && (
          <section className="chk-karte chk-info">
            <span className="chk-eyebrow">Spiel {phase.schritt + 1} von 5</span>
            <h2>{BEREICHE.find((b) => b.id === SPIELE[phase.schritt].id)?.emoji} {SPIELE[phase.schritt].titel}</h2>
            <p>{SPIELE[phase.schritt].info}</p>
            <button type="button" className="chk-knopf" onClick={() => setPhase({ typ: 'spiel', schritt: phase.schritt })} autoFocus>Los geht’s!</button>
          </section>
        )}
        {phase.typ === 'spiel' && (() => {
          const sp = SPIELE[phase.schritt]
          return <sp.Comp key={phase.schritt} stufe={st} onFertig={(w: number) => fertig(sp.id, w)} />
        })()}
        {phase.typ === 'rechnet' && <section className="chk-karte chk-info"><h2>Super gemacht! 🎉</h2><p>Wir werten die Ergebnisse aus …</p></section>}
        {phase.typ === 'ergebnis' && ergebnis && <Ergebnis werte={werte as Werte} stufe={st} alter={Number(alter)} id={ergebnis.id} vergleich={ergebnis.vergleich} />}
      </main>
    </div>
  )
}

type SpielProps = { stufe: number; onFertig: (wert: number) => void }

/** Ziffernblock zum Eintippen */
function Eingabe({ onOk, max = 4 }: { onOk: (n: number) => void; max?: number }) {
  const [wert, setWert] = useState('')
  const tippe = (z: string) => setWert((w) => (w.length < max ? w + z : w))
  useEffect(() => {
    const t = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) tippe(e.key)
      else if (e.key === 'Backspace') setWert((w) => w.slice(0, -1))
      else if (e.key === 'Enter' && wert) { onOk(Number(wert)); setWert('') }
    }
    window.addEventListener('keydown', t)
    return () => window.removeEventListener('keydown', t)
  })
  return (
    <div className="chk-eingabe">
      <output className="chk-anzeige">{wert || ' '}</output>
      <div className="chk-tasten">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((z) => <button key={z} type="button" onClick={() => tippe(z)}>{z}</button>)}
        <button type="button" className="weg" onClick={() => setWert((w) => w.slice(0, -1))} aria-label="Löschen">⌫</button>
        <button type="button" onClick={() => tippe('0')}>0</button>
        <button type="button" className="ok" disabled={!wert} onClick={() => { onOk(Number(wert)); setWert('') }} aria-label="Fertig">✓</button>
      </div>
    </div>
  )
}

function Rechnen({ stufe, onFertig }: SpielProps) {
  const N = 8
  const aufgaben = useMemo(() => Array.from({ length: N }, () => rechenaufgabe(stufe)), [stufe])
  const [i, setI] = useState(0)
  const summe = useRef(0)
  const t0 = useRef(Date.now())
  const [rueck, setRueck] = useState<'ok' | 'falsch' | null>(null)
  const limit = zeitLimit(stufe)
  const antwort = (n: number) => {
    const ok = n === aufgaben[i].loesung
    summe.current += punkte(ok, (Date.now() - t0.current) / 1000, limit)
    setRueck(ok ? 'ok' : 'falsch')
    window.setTimeout(() => {
      setRueck(null)
      if (i + 1 >= N) onFertig((summe.current / N) * 100)
      else { setI(i + 1); t0.current = Date.now() }
    }, 450)
  }
  return (
    <section className="chk-karte chk-spiel">
      <span className="chk-zaehler">Aufgabe {i + 1} / {N}</span>
      <div className={`chk-aufgabe ${rueck ?? ''}`}>{aufgaben[i].text} = ?</div>
      <Eingabe onOk={antwort} />
    </section>
  )
}

function AbakusLesen({ stufe, onFertig }: SpielProps) {
  const N = 4
  const stellen = abakusStellen(stufe)
  const items = useMemo(() => Array.from({ length: N }, () => { const z = zahlMitStellen(stellen); return { z, opt: optionen(z, stellen) } }), [stellen])
  const [i, setI] = useState(0)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const summe = useRef(0)
  const t0 = useRef(Date.now())
  const waehle = (o: number) => {
    if (gewaehlt !== null) return
    setGewaehlt(o)
    summe.current += punkte(o === items[i].z, (Date.now() - t0.current) / 1000, zeitLimit(stufe))
    window.setTimeout(() => {
      setGewaehlt(null)
      if (i + 1 >= N) onFertig((summe.current / N) * 100)
      else { setI(i + 1); t0.current = Date.now() }
    }, 600)
  }
  return (
    <section className="chk-karte chk-spiel">
      <span className="chk-zaehler">Abakus {i + 1} / {N}</span>
      <div className="chk-abakus"><Abakus3D key={i} value={items[i].z} cols={stellen} colw={stellen === 1 ? 70 : 56} /></div>
      <div className="chk-optionen">
        {items[i].opt.map((o) => <button key={o} type="button" className={gewaehlt === null ? '' : o === items[i].z ? 'ok' : o === gewaehlt ? 'falsch' : ''} onClick={() => waehle(o)}>{o}</button>)}
      </div>
    </section>
  )
}

function Blitz({ stufe, onFertig }: SpielProps) {
  const N = 4
  const stellen = blitzStellen(stufe)
  const zahlen = useMemo(() => Array.from({ length: N }, () => zahlMitStellen(stellen)), [stellen])
  const [i, setI] = useState(0)
  const [sichtbar, setSichtbar] = useState(true)
  const [rueck, setRueck] = useState<'ok' | 'falsch' | null>(null)
  const richtig = useRef(0)
  useEffect(() => {
    setSichtbar(true)
    const t = window.setTimeout(() => setSichtbar(false), stufe === 0 ? 2000 : 1200)
    return () => window.clearTimeout(t)
  }, [i, stufe])
  const antwort = (n: number) => {
    const ok = n === zahlen[i]
    if (ok) richtig.current++
    setRueck(ok ? 'ok' : 'falsch')
    window.setTimeout(() => {
      setRueck(null)
      if (i + 1 >= N) onFertig((richtig.current / N) * 100)
      else setI(i + 1)
    }, 600)
  }
  return (
    <section className="chk-karte chk-spiel">
      <span className="chk-zaehler">Zahl {i + 1} / {N}</span>
      <div className={`chk-aufgabe chk-blitz ${rueck ?? ''}`}>{sichtbar ? zahlen[i] : rueck ? zahlen[i] : '?'}</div>
      {sichtbar ? <p className="chk-klein">Gut hinschauen …</p> : <Eingabe onOk={antwort} max={stellen} />}
    </section>
  )
}

const FARBEN = ['#FF4D6D', '#FFC531', '#3DBE5B', '#3BA7FF', '#7B5CFF', '#FF8A1F']

function Merken({ stufe, onFertig }: SpielProps) {
  const start = stufe === 0 ? 2 : 3, MAX = 8
  const [laenge, setLaenge] = useState(start)
  const [folge, setFolge] = useState<number[]>([])
  const [leuchtet, setLeuchtet] = useState<number | null>(null)
  const [zeigen, setZeigen] = useState(true)
  const [eingabe, setEingabe] = useState<number[]>([])
  const [fehler, setFehler] = useState(0)
  const besteLaenge = useRef(start - 1)

  useEffect(() => {
    const f = Array.from({ length: laenge }, () => Math.floor(Math.random() * FARBEN.length))
    setFolge(f); setEingabe([]); setZeigen(true)
    const timer: number[] = []
    f.forEach((p, k) => {
      timer.push(window.setTimeout(() => setLeuchtet(p), 700 + k * 750))
      timer.push(window.setTimeout(() => setLeuchtet(null), 700 + k * 750 + 500))
    })
    timer.push(window.setTimeout(() => setZeigen(false), 700 + f.length * 750))
    return () => timer.forEach((t) => window.clearTimeout(t))
  }, [laenge, fehler])

  const ende = () => onFertig(((besteLaenge.current - (start - 1)) / (MAX - (start - 1))) * 100)
  const tippe = (p: number) => {
    if (zeigen) return
    const neu = [...eingabe, p]
    setLeuchtet(p); window.setTimeout(() => setLeuchtet(null), 200)
    if (folge[neu.length - 1] !== p) {
      // zwei Versuche pro Länge
      if (fehler >= 1) { window.setTimeout(ende, 400); return }
      setFehler(fehler + 1); return
    }
    setEingabe(neu)
    if (neu.length === folge.length) {
      besteLaenge.current = laenge
      if (laenge >= MAX) { window.setTimeout(ende, 400); return }
      window.setTimeout(() => { setFehler(0); setLaenge(laenge + 1) }, 500)
    }
  }
  return (
    <section className="chk-karte chk-spiel">
      <span className="chk-zaehler">{zeigen ? 'Gut aufpassen …' : 'Jetzt du!'} · {laenge} Perlen</span>
      <div className="chk-perlen">
        {FARBEN.map((f, p) => <button key={f} type="button" aria-label={`Perle ${p + 1}`} className={leuchtet === p ? 'an' : ''} style={{ background: f }} disabled={zeigen} onClick={() => tippe(p)} />)}
      </div>
      <p className="chk-klein">{zeigen ? 'Merke dir die Reihenfolge.' : `${eingabe.length} von ${folge.length}`}{fehler > 0 && !zeigen ? ' · Noch ein Versuch!' : ''}</p>
    </section>
  )
}

function Finden({ stufe, onFertig }: SpielProps) {
  const ZEIT = 20
  const ziel = useMemo(() => Math.floor(Math.random() * 4), [])
  const feld = useMemo(() => {
    const n = stufe === 0 ? 20 : 30, treffer = stufe === 0 ? 6 : 9
    const f = Array.from({ length: n }, (_, k) => (k < treffer ? ziel : (ziel + 1 + Math.floor(Math.random() * 3)) % 4))
    return f.sort(() => Math.random() - 0.5)
  }, [stufe, ziel])
  const [weg, setWeg] = useState<Set<number>>(new Set())
  const [falsch, setFalsch] = useState(0)
  const [rest, setRest] = useState(ZEIT)
  const vorbei = useRef(false)
  const alle = feld.filter((f) => f === ziel).length
  const gefunden = [...weg].filter((k) => feld[k] === ziel).length
  const ende = (zeitRest: number) => {
    if (vorbei.current) return
    vorbei.current = true
    const genau = Math.max(0, gefunden - falsch * 0.5) / alle
    onFertig(genau * 80 + (genau === 1 ? (zeitRest / ZEIT) * 20 : 0))
  }
  useEffect(() => {
    const t = window.setInterval(() => setRest((r) => r - 1), 1000)
    return () => window.clearInterval(t)
  }, [])
  useEffect(() => { if (rest <= 0) ende(0) })
  useEffect(() => { if (gefunden === alle) ende(rest) })
  const tippe = (k: number) => {
    if (weg.has(k) || vorbei.current) return
    if (feld[k] !== ziel) { setFalsch(falsch + 1); return }
    setWeg(new Set(weg).add(k))
  }
  return (
    <section className="chk-karte chk-spiel">
      <span className="chk-zaehler">Finde alle <b style={{ color: FARBEN[ziel] }}>●</b> Perlen · noch {Math.max(0, rest)} s</span>
      <div className={`chk-feld ${stufe === 0 ? 'klein' : ''}`}>
        {feld.map((f, k) => <button key={k} type="button" aria-label="Perle" className={weg.has(k) ? 'weg' : ''} style={{ background: FARBEN[f] }} onClick={() => tippe(k)} />)}
      </div>
      <p className="chk-klein">{gefunden} von {alle} gefunden</p>
    </section>
  )
}

function Ergebnis({ werte, stufe, alter, id, vergleich }: { werte: Werte; stufe: number; alter: number; id: string; vergleich: Vergleich }) {
  const gruppe = STUFEN[stufe] === 'Kindergarten' ? 'Kindergartenkinder' : `Kinder der ${STUFEN[stufe]}`
  const sortiert = [...BEREICHE].sort((a, b) => werte[b.id] - werte[a.id])
  const staerke = sortiert[0], potenzial = sortiert[sortiert.length - 1]
  const p = vergleich.perzentil.gesamt
  const [mail, setMail] = useState('')
  const [ok, setOk] = useState(false)
  const [news, setNews] = useState(false)
  const [status, setStatus] = useState<'' | 'laeuft' | 'fertig'>('')
  const [fehler, setFehler] = useState('')
  const senden = async (e: FormEvent) => {
    e.preventDefault(); setStatus('laeuft'); setFehler('')
    const f = await berichtAnfordern(id, mail, news)
    if (f) { setFehler(f); setStatus('') } else setStatus('fertig')
  }
  const etwa = vergleich.echt ? '' : 'etwa '
  return (
    <>
      <section className="chk-karte chk-ergebnis">
        <span className="chk-eyebrow">Ergebnis · {alter} Jahre · {STUFEN[stufe]}</span>
        <h1>Super gemacht! 🎉</h1>
        <div className="chk-gesamt">
          <b>{p >= 10 ? `${p}%` : '🌱'}</b>
          <span>{p >= 10 ? <>Ihr Kind liegt vor {etwa}<b>{p} %</b> der {gruppe} – {p >= 70 ? 'ein starkes Ergebnis!' : p >= 40 ? 'ein solider Start mit viel Potenzial!' : 'hier steckt noch viel ungenutztes Potenzial!'}</> : <>Ihr Kind steht hier noch am Anfang – das ist ganz normal. Genau jetzt bringt regelmäßiges, spielerisches Üben am meisten.</>}</span>
        </div>
        <div className="chk-balken">
          {BEREICHE.map((b) => (
            <div key={b.id} className="chk-zeile">
              <span>{b.emoji} <b>{b.name}</b></span>
              <div className="chk-track"><div style={{ width: `${Math.max(4, vergleich.perzentil[b.id])}%` }} /><i style={{ left: '50%' }} title="Durchschnitt" /></div>
              <small>{vergleich.perzentil[b.id] >= 10 ? `besser als ${etwa}${vergleich.perzentil[b.id]} %` : 'noch am Anfang'}</small>
            </div>
          ))}
        </div>
        <p className="chk-legende">Der Strich in der Mitte zeigt den Durchschnitt der {gruppe}.</p>
        <div className="chk-zwei">
          <div><span>💪 Stärke</span><b>{staerke.name}</b><small>{staerke.text}.</small></div>
          <div><span>🚀 Größtes Potenzial</span><b>{potenzial.name}</b><small>Genau das trainiert BrainFit Kids gezielt.</small></div>
        </div>
      </section>

      <section className="chk-karte chk-empfehlung">
        <h2>Unsere Empfehlung</h2>
        <p>Mit <b>BrainFit Kids</b> kann Ihr Kind sein Potenzial beim Kopfrechnen, im Gedächtnis und in der Konzentration gezielt entfalten – mit nur <b>15 Minuten am Tag</b>, spielerisch mit Abakus, Lernvideos und Denkspielen.</p>
        <p><b>Möchten Sie, dass Ihr Kind sicherer und schneller rechnet – und gegenüber Gleichaltrigen weiter nach vorne kommt?</b></p>
        <a className="chk-knopf" href={`${SITE}#preise`}>Jetzt Paket wählen →</a>
      </section>

      <section className="chk-karte chk-mail">
        <h2>📩 Ausführlicher Bericht per E-Mail</h2>
        {status === 'fertig' ? <p className="chk-ok">Danke! Der ausführliche Bericht ist unterwegs – bitte schauen Sie auch im Spam-Ordner nach.</p> : (
          <form onSubmit={(e) => void senden(e)}>
            <p>Alle 5 Bereiche im Detail, Vergleich mit Gleichaltrigen und konkrete Übungstipps für zu Hause – kostenlos.</p>
            <input type="email" required value={mail} onChange={(e) => setMail(e.target.value)} placeholder="E-Mail der Eltern" aria-label="E-Mail der Eltern" />
            <label className="chk-check"><input type="checkbox" required checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>Ich möchte den Bericht per E-Mail erhalten und akzeptiere die <a href="/datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>.</span></label>
            <label className="chk-check"><input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} /><span>Ja, schicken Sie mir gelegentlich Lerntipps und Angebote (jederzeit abbestellbar).</span></label>
            {fehler && <p className="chk-fehler">{fehler}</p>}
            <button type="submit" className="chk-knopf" disabled={status === 'laeuft' || !ok}>{status === 'laeuft' ? 'Wird gesendet …' : 'Bericht anfordern'}</button>
          </form>
        )}
      </section>
      <p className="chk-hinweis">Der Check ist eine spielerische Momentaufnahme und kein standardisierter Test. {vergleich.echt ? `Vergleich mit ${vergleich.anzahl} Kindern derselben Schulstufe, die den Check gemacht haben.` : 'Solange noch wenige Ergebnisse vorliegen, vergleichen wir mit Richtwerten.'}</p>
      <p className="chk-hinweis"><a href={SITE}>← Zur Website</a> · <button type="button" className="chk-link" onClick={() => location.reload()}>Check wiederholen</button></p>
    </>
  )
}

function JaNein({ frage, wert, onWahl }: { frage: string; wert?: boolean; onWahl: (v: boolean) => void }) {
  return (
    <div className="chk-janein"><span>{frage}</span>
      <div><button type="button" className={wert === true ? 'an' : ''} onClick={() => onWahl(true)}>Ja</button><button type="button" className={wert === false ? 'an' : ''} onClick={() => onWahl(false)}>Nein</button></div>
    </div>
  )
}

const mischen = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
const zz = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))

/** Perlen als Bild: verstreut (zum Schätzen/Zählen) oder geordnet in Fünferreihen */
function Punkte({ n, geordnet = false, farbe = '#7B5CFF', klein = false }: { n: number; geordnet?: boolean; farbe?: string; klein?: boolean }) {
  const plaetze = useMemo(() => mischen(Array.from({ length: 16 }, (_, i) => i)).slice(0, n), [n])
  if (geordnet) return <div className={`chk-punkte geordnet ${klein ? 'klein' : ''}`}>{Array.from({ length: n }, (_, i) => <i key={i} style={{ background: farbe }} />)}</div>
  return <div className={`chk-punkte frei ${klein ? 'klein' : ''}`}>{plaetze.map((p) => <i key={p} style={{ background: farbe, gridColumn: (p % 4) + 1, gridRow: Math.floor(p / 4) + 1 }} />)}</div>
}

/** Zahl als Hunderterplatten, Zehnerstangen und Einer */
function Stellenbild({ n }: { n: number }) {
  const h = Math.floor(n / 100), z = Math.floor((n % 100) / 10), e = n % 10
  return (
    <div className="chk-stellen">
      {Array.from({ length: h }, (_, i) => <span key={`h${i}`} className="h">{Array.from({ length: 100 }, (_, k) => <i key={k} />)}</span>)}
      {Array.from({ length: z }, (_, i) => <span key={`z${i}`} className="z">{Array.from({ length: 10 }, (_, k) => <i key={k} />)}</span>)}
      <span className="e">{Array.from({ length: e }, (_, k) => <i key={k} />)}</span>
    </div>
  )
}

/** Allgemeine Auswahl-Runde: Aufgabe zeigen, aus Antworten wählen (ohne Lesen/Schreiben möglich) */
function Auswahl<T>({ n, titel, erzeugen, antwort, gleich, stufe, onFertig, spalten = 2 }: {
  n: number; titel: string; erzeugen: (runde: number) => { aufgabe: ReactNode; optionen: T[]; richtig: T }; antwort: (o: T) => ReactNode; gleich?: (a: T, b: T) => boolean; spalten?: number
} & SpielProps) {
  const runden = useMemo(() => Array.from({ length: n }, (_, k) => erzeugen(k)), []) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const summe = useRef(0)
  const t0 = useRef(Date.now())
  const g = gleich ?? ((a: T, b: T) => a === b)
  const r = runden[i]
  const waehle = (k: number) => {
    if (gewaehlt !== null) return
    setGewaehlt(k)
    summe.current += punkte(g(r.optionen[k], r.richtig), (Date.now() - t0.current) / 1000, zeitLimit(stufe))
    window.setTimeout(() => {
      setGewaehlt(null)
      if (i + 1 >= n) onFertig((summe.current / n) * 100)
      else { setI(i + 1); t0.current = Date.now() }
    }, 650)
  }
  return (
    <section className="chk-karte chk-spiel">
      <span className="chk-zaehler">{titel} {i + 1} / {n}</span>
      <div className="chk-aufgabenbild">{r.aufgabe}</div>
      <div className="chk-optionen" style={{ gridTemplateColumns: `repeat(${spalten}, 1fr)` }}>
        {r.optionen.map((o, k) => <button key={k} type="button" className={gewaehlt === null ? '' : g(o, r.richtig) ? 'ok' : k === gewaehlt ? 'falsch' : ''} onClick={() => waehle(k)}>{antwort(o)}</button>)}
      </div>
    </section>
  )
}

const zahlOptionen = (richtig: number, min: number, max: number) => {
  const set = new Set([richtig])
  while (set.size < 4) { const d = zz(1, Math.max(2, Math.round(richtig * 0.2) + 2)) * (Math.random() < 0.5 ? -1 : 1); const v = richtig + d; if (v >= min && v <= max) set.add(v); else set.add(zz(min, max)) }
  return mischen([...set])
}

/** A: Wo sind mehr Perlen? (Mengen vergleichen) */
function MengenVergleich(p: SpielProps) {
  return <Auswahl<number> {...p} n={8} titel="Runde" spalten={2}
    erzeugen={() => { const a = zz(1, 9); let b = zz(1, 10); while (b === a) b = zz(1, 10); return { aufgabe: <p className="chk-frage">Wo sind mehr Perlen?</p>, optionen: [a, b], richtig: Math.max(a, b) } }}
    antwort={(o) => <Punkte n={o} farbe={o % 2 ? '#FF8A1F' : '#3BA7FF'} />} />
}

/** A: Gleiche Menge finden */
function GleicheMenge(p: SpielProps) {
  return <Auswahl<number> {...p} n={5} titel="Bild" spalten={3}
    erzeugen={() => { const z = zz(2, 7); const opt = new Set([z]); while (opt.size < 3) opt.add(zz(1, 9)); return { aufgabe: <Punkte n={z} geordnet farbe="#FF4D6D" />, optionen: mischen([...opt]), richtig: z } }}
    antwort={(o) => <Punkte n={o} klein farbe="#7B5CFF" />} />
}

/** A: Blitz-Perlen – Menge kurz zeigen, dann gleiches Bild wählen */
function BlitzMenge(p: SpielProps) {
  return <Auswahl<number> {...p} n={4} titel="Blitz" spalten={3}
    erzeugen={(k) => { const z = zz(2, 6); const opt = new Set([z]); while (opt.size < 3) opt.add(zz(1, 8)); return { aufgabe: <Kurz key={k} ms={1500}><Punkte n={z} farbe="#3DBE5B" /></Kurz>, optionen: mischen([...opt]), richtig: z } }}
    antwort={(o) => <Punkte n={o} klein geordnet farbe="#3DBE5B" />} />
}

/** zeigt den Inhalt nur kurz, danach ein Fragezeichen */
function Kurz({ ms, children }: { ms: number; children: ReactNode }) {
  const [an, setAn] = useState(true)
  useEffect(() => { const t = window.setTimeout(() => setAn(false), ms); return () => window.clearTimeout(t) }, [ms])
  return an ? <>{children}</> : <div className="chk-frage gross">?</div>
}

/** B: Zählen – wie viele Perlen? Zahl wählen */
function Zaehlen(p: SpielProps) {
  const max = p.stufe === 0 ? 10 : 16
  return <Auswahl<number> {...p} n={6} titel="Zählen"
    erzeugen={() => { const z = zz(3, max); return { aufgabe: z <= 16 ? <Punkte n={z} farbe="#FF8A1F" /> : null, optionen: zahlOptionen(z, 1, max), richtig: z } }}
    antwort={(o) => <b className="chk-zahl">{o}</b>} />
}

/** B: Rechnen mit Antwort-Auswahl */
function RechnenAuswahl(p: SpielProps) {
  return <Auswahl<number> {...p} n={8} titel="Aufgabe"
    erzeugen={() => { const a = rechenaufgabe(p.stufe); return { aufgabe: <div className="chk-aufgabe">{a.text} = ?</div>, optionen: zahlOptionen(a.loesung, 0, 999), richtig: a.loesung } }}
    antwort={(o) => <b className="chk-zahl">{o}</b>} />
}

/** B/C ohne Abakus: Mengen erkennen (Punktebild, Zehnerstangen, Hunderterplatten) */
function MengeZahl(p: SpielProps) {
  const [min, max] = p.stufe === 0 ? [3, 10] : p.stufe <= 1 ? [8, 20] : p.stufe === 2 ? [21, 99] : [110, 399]
  return <Auswahl<number> {...p} n={4} titel="Bild"
    erzeugen={() => { const z = zz(min, max); return { aufgabe: z <= 10 ? <Punkte n={z} geordnet farbe="#5B47D6" /> : <Stellenbild n={z} />, optionen: zahlOptionen(z, 1, 999), richtig: z } }}
    antwort={(o) => <b className="chk-zahl">{o}</b>} />
}

/** B: Blitzzahl mit Auswahl statt Eintippen */
function BlitzAuswahl(p: SpielProps) {
  const stellen = blitzStellen(p.stufe)
  return <Auswahl<number> {...p} n={4} titel="Zahl"
    erzeugen={(k) => { const z = zahlMitStellen(stellen); return { aufgabe: <Kurz key={k} ms={p.stufe === 0 ? 2000 : 1200}><div className="chk-aufgabe chk-blitz">{z}</div></Kurz>, optionen: optionen(z, stellen), richtig: z } }}
    antwort={(o) => <b className="chk-zahl">{o}</b>} />
}
