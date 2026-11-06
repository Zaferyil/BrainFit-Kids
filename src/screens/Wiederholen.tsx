import { useState } from 'react'
import { Icon } from '../components/Icon'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { makeSum, randomIn, rechnet, rechnung, unitContent } from '../data/units'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { faelligeRegeln, merkeAntwort } from '../lib/lernspur'
import { rewardGame } from '../lib/progress'
import { speak } from '../lib/speak'
import { Keypad } from './stations/StationShell'
import { Funkeln } from './Anmelden'

// Verteilte Wiederholung: Regeln, bei denen das Kind Fehler gemacht hat, kommen nach 1, 3, 7 und 14 Tagen wieder.

type Aufgabe = { regel: string; name: string; text: string; loesung: number }

function aufgabenErstellen(kid: string): Aufgabe[] {
  const out: Aufgabe[] = []
  for (const r of faelligeRegeln(kid).slice(0, 4)) {
    const [w, u] = r.key.split('-').map(Number)
    const c = unitContent(w, u)
    if (!c) continue
    let prev: number | undefined
    for (let i = 0; i < 3; i++) {
      if (rechnet(c)) { const s = makeSum(c, prev); prev = s.a; out.push({ regel: r.key, name: r.name, text: s.b ? rechnung(s.a, s.b) : `${s.a}`, loesung: s.a + s.b }) }
      else { const n = randomIn(c.range, prev); prev = n; out.push({ regel: r.key, name: r.name, text: `Stell dir ${n} vor: wie viel ist das?`, loesung: n }) }
    }
  }
  return out
}

export function Wiederholen({ kid }: { kid: Kid }) {
  const [aufg] = useState(() => aufgabenErstellen(kid.id))
  const [i, setI] = useState(0)
  const [eingabe, setEingabe] = useState('')
  const [fb, setFb] = useState<'ok' | 'falsch' | null>(null)
  const [richtig, setRichtig] = useState(0)
  const [fertig, setFertig] = useState(false)
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
    merkeAntwort(kid.id, ok, { regel: a.regel, wiederholung: true })
    const r = richtig + (ok ? 1 : 0); setRichtig(r); setFb(ok ? 'ok' : 'falsch')
    if (ok) tonRichtig(r); else { tonFalsch(); void speak(['Fast! Das ist', String(a.loesung)]) }
    window.setTimeout(() => {
      setFb(null); setEingabe('')
      if (i + 1 >= aufg.length) { rewardGame(kid.id, r * 2, 'wiederholen'); setFertig(true) } else setI(i + 1)
    }, ok ? 600 : 1600)
  }

  return (
    <Stage background="linear-gradient(180deg, #2A1B8C 0%, #5B47D6 50%, #FF6FB5 100%)">
      <Funkeln />
      <div className="pr">
        <a href="#/karte" className="pr-zurueck" aria-label="Zurück"><Icon name="left" color="#FFFFFF" size={26} strokeWidth={3} /></a>
        {!aufg.length && (
          <section className="pr-box popin"><h1>Alles sicher! 🌟</h1><p>Heute gibt es nichts zu wiederholen.</p><a href="#/karte" className="az-start">Zurück</a></section>
        )}
        {!!aufg.length && !fertig && a && (
          <section className="pr-spiel">
            <div className="az-info"><span>🔁 {a.name}</span><span>{i + 1} / {aufg.length}</span></div>
            <div className={`az-tafel ${fb === 'ok' ? 'richtig' : fb === 'falsch' ? 'falsch' : ''}`}>
              <div className="pr-aufgabe" style={a.text.length > 12 ? { fontSize: 24 } : undefined}>{a.text}{/[+−]/.test(a.text) ? ' =' : ''}</div>
              <b className="az-eingabe">{fb === 'falsch' ? a.loesung : eingabe || '?'}</b>
            </div>
            <Keypad onKey={taste} disabled={!!fb} />
            <button type="button" className="az-start" onClick={pruefen} disabled={!eingabe || !!fb}>Weiter</button>
          </section>
        )}
        {fertig && (
          <section className="pr-box popin">
            <h1>Super wiederholt! 🔁</h1>
            <p>{richtig} von {aufg.length} richtig · +{richtig * 2} Perlen</p>
            <p>Was noch nicht sicher ist, kommt in ein paar Tagen wieder.</p>
            <a href="#/karte" className="az-start">Fertig</a>
          </section>
        )}
      </div>
    </Stage>
  )
}
