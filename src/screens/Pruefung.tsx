import { merkeAntwort } from '../lib/lernspur'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Stage } from '../components/Stage'
import { WORLDS } from '../data/curriculum'
import type { Kid } from '../data/demo'
import { makeSum, randomIn, rechnet, rechnung, unitContent, type UnitContent } from '../data/units'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { rewardGame } from '../lib/progress'
import { PRUEFUNG, pruefungBestanden, pruefungen, type Bestanden } from '../lib/pruefung'
import { speak } from '../lib/speak'
import { Keypad } from './stations/StationShell'
import { Funkeln } from './Anmelden'

// Gürtel-Prüfung: 10 Kopfrechen-Aufgaben aus allen Einheiten der Welt, 4 Minuten Zeit, 8 richtig = bestanden.
// Danach gibt es eine Urkunde als Bild zum Speichern oder Teilen.

type Aufgabe = { text: string; loesung: number }
const guertelName = (belt: string) => (belt === 'orangen' ? 'orange' : belt.replace(/en$/, ''))

function aufgabenFuer(welt: number): Aufgabe[] {
  const w = WORLDS[welt - 1]
  const inhalte = w.units.map((_, i) => unitContent(welt, i + 1)).filter((c): c is UnitContent => !!c)
  const rechnen = inhalte.filter(rechnet)
  const pool = rechnen.length ? rechnen : inhalte
  const out: Aufgabe[] = []
  let prev: number | undefined
  while (out.length < PRUEFUNG.aufgaben && pool.length) {
    const c = pool[Math.floor(Math.random() * pool.length)]
    if (rechnet(c)) { const s = makeSum(c, prev); prev = s.a; if (s.b) out.push({ text: rechnung(s.a, s.b), loesung: s.a + s.b }); else out.push({ text: `${s.a}`, loesung: s.a }) }
    else { const n = randomIn(c.range, prev); prev = n; out.push({ text: `${n}`, loesung: n }) }
  }
  return out
}

/** Doktorhut (Absolventen-Kappe), selbst gezeichnet */
function kappe(g: CanvasRenderingContext2D, x: number, y: number, s: number, winkel: number) {
  g.save(); g.translate(x, y); g.rotate(winkel); g.scale(s, s)
  g.fillStyle = '#2B2257'
  g.beginPath(); g.moveTo(-60, 10); g.lineTo(60, 10); g.lineTo(52, 62); g.quadraticCurveTo(0, 80, -52, 62); g.closePath(); g.fill()
  g.fillStyle = '#3A2F70'
  g.beginPath(); g.moveTo(0, -48); g.lineTo(110, 0); g.lineTo(0, 46); g.lineTo(-110, 0); g.closePath(); g.fill()
  g.fillStyle = '#FFC531'; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill()
  g.strokeStyle = '#FFC531'; g.lineWidth = 6; g.lineCap = 'round'
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(70, 6, 80, 60); g.stroke()
  g.beginPath(); g.moveTo(72, 58); g.lineTo(70, 92); g.moveTo(80, 60); g.lineTo(82, 94); g.moveTo(88, 58); g.lineTo(94, 90); g.stroke()
  g.restore()
}

const bildLaden = (src: string) => new Promise<HTMLImageElement | null>((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src })

/** Urkunde als PNG zeichnen */
async function urkundeZeichnen(name: string, guertel: string, farbe: string, b: Bestanden): Promise<string> {
  const c = document.createElement('canvas'); c.width = 1600; c.height = 1130
  const g = c.getContext('2d')!
  const bg = g.createLinearGradient(0, 0, 1600, 1130); bg.addColorStop(0, '#FFF8E1'); bg.addColorStop(1, '#FFE9F3')
  g.fillStyle = bg; g.fillRect(0, 0, 1600, 1130)
  g.strokeStyle = '#4B2FC2'; g.lineWidth = 18; g.strokeRect(40, 40, 1520, 1050)
  g.strokeStyle = '#FFC531'; g.lineWidth = 6; g.strokeRect(80, 80, 1440, 970)
  g.textAlign = 'center'; g.fillStyle = '#4B2FC2'
  g.font = '900 110px "Baloo 2", "Fredoka", sans-serif'; g.fillText('URKUNDE', 800, 250)
  g.fillStyle = '#2B2257'; g.font = '600 44px "Nunito", sans-serif'; g.fillText('BrainFit Kids · Mentale Arithmetik mit dem Soroban', 800, 320)
  g.font = '600 46px "Nunito", sans-serif'; g.fillText('Hiermit wird bestätigt, dass', 800, 440)
  g.fillStyle = '#FF4D6D'; g.font = '900 120px "Baloo 2", "Fredoka", sans-serif'; g.fillText(name, 800, 580)
  g.fillStyle = '#2B2257'; g.font = '600 46px "Nunito", sans-serif'; g.fillText('die Gürtel-Prüfung bestanden hat:', 800, 670)
  // Gürtel
  g.fillStyle = farbe; g.beginPath(); g.roundRect(450, 720, 700, 90, 45); g.fill()
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 4; g.stroke()
  g.fillStyle = '#231A4F'; g.font = '900 60px "Baloo 2", "Fredoka", sans-serif'; g.fillText(`${guertel[0].toUpperCase() + guertel.slice(1)}er Gürtel`, 800, 785)
  g.fillStyle = '#2B2257'; g.font = '700 40px "Nunito", sans-serif'
  const m = Math.floor(b.sekunden / 60), s = b.sekunden % 60
  g.fillText(`${b.richtig} von ${b.von} Aufgaben richtig · Zeit ${m}:${String(s).padStart(2, '0')} min`, 800, 870)
  g.font = '600 34px "Nunito", sans-serif'; g.fillText(new Date(b.datum).toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' }), 800, 925)
  kappe(g, 230, 200, 1.05, -0.18)
  kappe(g, 1370, 200, 1.05, 0.18)
  const logo = await bildLaden(`${import.meta.env.BASE_URL}logo.webp`)
  if (logo) { const w = 150, h = (logo.height / logo.width) * w; g.drawImage(logo, 800 - w / 2, 1040 - h, w, h) }
  return c.toDataURL('image/png')
}

export function Pruefung({ kid, welt }: { kid: Kid; welt: number }) {
  const w = WORLDS[welt - 1]
  const guertel = guertelName(w.belt)
  const [phase, setPhase] = useState<'start' | 'laeuft' | 'ende'>('start')
  const [aufg, setAufg] = useState<Aufgabe[]>([])
  const [i, setI] = useState(0)
  const [eingabe, setEingabe] = useState('')
  const [richtig, setRichtig] = useState(0)
  const [rest, setRest] = useState(PRUEFUNG.sekunden)
  const [fb, setFb] = useState<'ok' | 'falsch' | null>(null)
  const [ergebnis, setErgebnis] = useState<Bestanden | null>(null)
  const [bild, setBild] = useState('')
  const t0 = useRef(0)
  const frueher = pruefungen(kid.id)[welt]

  const beenden = (r: number) => {
    const b: Bestanden = { datum: new Date().toISOString(), richtig: r, von: PRUEFUNG.aufgaben, sekunden: Math.min(PRUEFUNG.sekunden, Math.round((Date.now() - t0.current) / 1000)) }
    setErgebnis(b); setPhase('ende')
    if (r >= PRUEFUNG.bestehen) {
      pruefungBestanden(kid.id, welt, b); rewardGame(kid.id, 20, `pruefung-${welt}`)
      void urkundeZeichnen(kid.name, guertel, w.color, b).then(setBild); tonRichtig(5)
      void speak(`Herzlichen Glückwunsch! Du hast die Prüfung für den ${guertel}en Gürtel bestanden!`)
    } else { tonFalsch(); void speak('Fast geschafft! Übe noch ein bisschen und versuch es dann noch einmal.') }
  }

  useEffect(() => {
    if (phase !== 'laeuft') return
    const t = window.setInterval(() => setRest((x) => x - 1), 1000)
    return () => window.clearInterval(t)
  }, [phase])
  useEffect(() => { if (phase === 'laeuft' && rest <= 0) beenden(richtig) })

  const starten = () => { setAufg(aufgabenFuer(welt)); setI(0); setRichtig(0); setRest(PRUEFUNG.sekunden); setEingabe(''); setFb(null); t0.current = Date.now(); setPhase('laeuft') }

  const taste = (k: string) => {
    if (fb) return
    if (k === 'C') return setEingabe('')
    if (k === 'del') return setEingabe((e) => e.slice(0, -1))
    if (eingabe.length < 4) setEingabe(eingabe + k)
  }
  const weiter = () => {
    if (!eingabe || fb) return
    const ok = Number(eingabe) === aufg[i].loesung
    merkeAntwort(kid.id, ok, { regel: null })
    const r = richtig + (ok ? 1 : 0)
    setRichtig(r); setFb(ok ? 'ok' : 'falsch')
    if (ok) tonRichtig(r); else tonFalsch()
    window.setTimeout(() => { setFb(null); setEingabe(''); if (i + 1 >= aufg.length) beenden(r); else setI(i + 1) }, ok ? 500 : 900)
  }
  const teilen = async () => {
    const datei = await (await fetch(bild)).blob()
    const f = new File([datei], `Urkunde-${kid.name}-${guertel}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: 'BrainFit Kids Urkunde' }) } catch { /* abgebrochen */ } return }
    const a = document.createElement('a'); a.href = bild; a.download = f.name; a.click()
  }

  const mm = Math.floor(Math.max(0, rest) / 60), ss = Math.max(0, rest) % 60

  return (
    <Stage background="linear-gradient(180deg, #2A1B8C 0%, #5B47D6 50%, #FF6FB5 100%)">
      <Funkeln />
      <div className="pr">
        <a href="#/pokale" className="pr-zurueck" aria-label="Zurück"><Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} /></a>
        {phase === 'start' && (
          <section className="pr-box popin">
            <span className="pr-guertel" style={{ background: w.color, color: w.ink }}><Icon name="medal" color={w.ink} size={40} /></span>
            <h1>Prüfung: {guertel}er Gürtel</h1>
            <p>{PRUEFUNG.aufgaben} Aufgaben aus der Welt „{w.name}“ – ganz im Kopf, ohne Abakus.</p>
            <ul className="pr-regeln">
              <li>⏱️ {PRUEFUNG.sekunden / 60} Minuten Zeit</li>
              <li>✅ {PRUEFUNG.bestehen} richtig = bestanden</li>
              <li>📜 Du bekommst eine Urkunde</li>
            </ul>
            {frueher && <p className="pr-frueher">Schon bestanden: {frueher.richtig}/{frueher.von} – du kannst dich verbessern!</p>}
            <button type="button" className="az-start" onClick={starten}><Icon name="play" size={22} color="#231A4F" fill="#231A4F" /> Prüfung starten</button>
          </section>
        )}
        {phase === 'laeuft' && aufg[i] && (
          <section className="pr-spiel">
            <div className="az-info"><span>Aufgabe {i + 1} / {aufg.length}</span><span className={rest <= 30 ? 'pr-knapp' : ''}>⏱️ {mm}:{String(ss).padStart(2, '0')}</span></div>
            <div className={`az-tafel ${fb === 'ok' ? 'richtig' : fb === 'falsch' ? 'falsch' : ''}`}>
              <div className="pr-aufgabe">{aufg[i].text} =</div>
              <b className="az-eingabe">{eingabe || '?'}</b>
            </div>
            <Keypad onKey={taste} disabled={!!fb} />
            <button type="button" className="az-start" onClick={weiter} disabled={!eingabe || !!fb}>Weiter</button>
          </section>
        )}
        {phase === 'ende' && ergebnis && (
          <section className="pr-box popin">
            {ergebnis.richtig >= PRUEFUNG.bestehen ? (
              <>
                <h1>Bestanden! 🎉</h1>
                <p>{ergebnis.richtig} von {ergebnis.von} richtig · +20 Perlen</p>
                {bild && <img className="pr-urkunde" src={bild} alt={`Urkunde ${guertel}er Gürtel für ${kid.name}`} />}
                <button type="button" className="az-start" onClick={teilen}>📜 Urkunde speichern / teilen</button>
              </>
            ) : (
              <>
                <h1>Fast geschafft!</h1>
                <p>{ergebnis.richtig} von {ergebnis.von} richtig – du brauchst {PRUEFUNG.bestehen}. Übe noch ein bisschen!</p>
                <button type="button" className="az-start" onClick={starten}>Nochmal versuchen</button>
              </>
            )}
            <a href="#/pokale" className="az-zurueck">Zurück zu den Pokalen</a>
          </section>
        )}
      </div>
    </Stage>
  )
}
