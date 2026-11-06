import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Abakus } from '../components/Abakus'
import { Fit } from '../components/Fit'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { WORLDS } from '../data/curriculum'
import { makeSum, randomIn, rechnet, unitContent, type UnitContent } from '../data/units'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { faelligeRegeln, merkeAntwort } from '../lib/lernspur'
import { getProgress, rewardGame } from '../lib/progress'
import { speak } from '../lib/speak'
import { load, save } from '../lib/storage'
import { Keypad } from './stations/StationShell'
import { Funkeln } from './Anmelden'

// Tages-Training (ca. 5 Minuten): Aufwärmen (leichte Aufgaben aus früheren Lektionen),
// Neues (aktuelle Lektion) und Wiederholen (fällige Regeln aus der Fehleranalyse).

type Teil = 'Aufwärmen' | 'Neu' | 'Wiederholen'
type Aufgabe = { teil: Teil; regel: string | null; text: string; loesung: number; abakus?: { n: number; cols: number } }
const tagKey = (kid: string) => `bfk.training.${kid}`
const heute = () => new Date().toISOString().slice(0, 10)
export const trainingHeuteFertig = (kid: string) => load<string | null>(tagKey(kid), null) === heute()

function aufgabe(c: UnitContent, teil: Teil, regel: string | null, prev?: number): Aufgabe {
  if (rechnet(c)) { const s = makeSum(c, prev); return { teil, regel, text: s.b ? `${s.a} + ${s.b}` : `${s.a}`, loesung: s.a + s.b } }
  const n = randomIn(c.range, prev); return { teil, regel, text: 'Welche Zahl zeigt der Abakus?', loesung: n, abakus: { n, cols: c.cols } }
}
const lektionVor = (w: number, u: number, schritte: number) => {
  let welt = w, einheit = u
  for (let i = 0; i < schritte; i++) { if (einheit > 1) einheit--; else if (welt > 1) { welt--; einheit = WORLDS[welt - 1].units.length } }
  return { welt, einheit }
}

function erstellen(kid: string): Aufgabe[] {
  const p = getProgress(kid)
  const out: Aufgabe[] = []
  // Aufwärmen: 3 Aufgaben aus der vorigen Lektion (oder der aktuellen am Anfang)
  const v = lektionVor(p.world, p.unit, 1)
  const cw = unitContent(v.welt, v.einheit) ?? unitContent(p.world, p.unit)
  if (cw) for (let i = 0; i < 3; i++) out.push(aufgabe(cw, 'Aufwärmen', `${v.welt}-${v.einheit}`))
  // Neu: 4 Aufgaben aus der aktuellen Lektion
  const cn = unitContent(p.world, p.unit)
  if (cn) for (let i = 0; i < 4; i++) out.push(aufgabe(cn, 'Neu', `${p.world}-${p.unit}`))
  // Wiederholen: 3 Aufgaben aus fälligen Regeln, sonst aus älteren Lektionen
  const f = faelligeRegeln(kid).slice(0, 3)
  for (let i = 0; i < 3; i++) {
    const r = f[i % Math.max(1, f.length)]
    const [w, u] = r ? r.key.split('-').map(Number) : (() => { const x = lektionVor(p.world, p.unit, 2 + i); return [x.welt, x.einheit] })()
    const c = unitContent(w, u)
    if (c) out.push(aufgabe(c, 'Wiederholen', `${w}-${u}`))
  }
  return out
}

export function Training({ kid }: { kid: Kid }) {
  const [aufg] = useState(() => erstellen(kid.id))
  const [i, setI] = useState(0)
  const [eingabe, setEingabe] = useState('')
  const [fb, setFb] = useState<'ok' | 'falsch' | null>(null)
  const [richtig, setRichtig] = useState(0)
  const [fertig, setFertig] = useState(false)
  const [schonHeute] = useState(() => trainingHeuteFertig(kid.id))
  const a = aufg[i]

  const taste = (k: string) => {
    if (fb) return
    if (k === 'C') return setEingabe('')
    if (k === 'del') return setEingabe((e) => e.slice(0, -1))
    setEingabe((e) => (e.length < 4 ? e + k : e))
  }
  const pruefen = () => {
    if (!eingabe || fb) return
    const ok = Number(eingabe) === a.loesung
    merkeAntwort(kid.id, ok, { regel: a.regel, wiederholung: a.teil === 'Wiederholen' })
    const r = richtig + (ok ? 1 : 0); setRichtig(r); setFb(ok ? 'ok' : 'falsch')
    if (ok) tonRichtig(r); else { tonFalsch(); void speak(['Fast! Das ist', String(a.loesung)]) }
    window.setTimeout(() => {
      setFb(null); setEingabe('')
      if (i + 1 >= aufg.length) { rewardGame(kid.id, schonHeute ? r : r * 2, 'training'); save(tagKey(kid.id), heute()); setFertig(true) } else setI(i + 1)
    }, ok ? 600 : 1600)
  }

  return (
    <Stage background="linear-gradient(180deg, #2A1B8C 0%, #5B47D6 50%, #FF6FB5 100%)">
      <Funkeln />
      <div className="pr">
        <a href="#/karte" className="pr-zurueck" aria-label="Zurück"><Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} /></a>
        {!fertig && a && (
          <section className="pr-spiel">
            <div className="tr-teile">{(['Aufwärmen', 'Neu', 'Wiederholen'] as Teil[]).map((t) => <span key={t} className={t === a.teil ? 'an' : aufg.findIndex((x) => x.teil === t) < i ? 'fertig' : ''}>{t === 'Aufwärmen' ? '🔥' : t === 'Neu' ? '⭐' : '🔁'} {t}</span>)}</div>
            <div className="az-info"><span>Aufwärm-Training</span><span>{i + 1} / {aufg.length}</span></div>
            {a.abakus && <Fit className="tr-abakus"><Abakus key={i} value={a.abakus.n} cols={a.abakus.cols} colw={80} interactive={false} /></Fit>}
            <div className={`az-tafel ${fb === 'ok' ? 'richtig' : fb === 'falsch' ? 'falsch' : ''}`}>
              <div className="pr-aufgabe" style={a.abakus ? { fontSize: 20 } : undefined}>{a.abakus ? a.text : `${a.text} =`}</div>
              <b className="az-eingabe">{fb === 'falsch' ? a.loesung : eingabe || '?'}</b>
            </div>
            <Keypad onKey={taste} disabled={!!fb} />
            <button type="button" className="az-start" onClick={pruefen} disabled={!eingabe || !!fb}>Weiter</button>
          </section>
        )}
        {fertig && (
          <section className="pr-box popin">
            <h1>Aufwärm-Training geschafft! 🔥</h1>
            <p>{richtig} von {aufg.length} richtig · +{schonHeute ? richtig : richtig * 2} Perlen</p>
            <p>Jeden Tag ein bisschen – so wird dein Kopf-Abakus immer schneller.</p>
            <a href="#/karte" className="az-start">Fertig</a>
          </section>
        )}
      </div>
    </Stage>
  )
}
