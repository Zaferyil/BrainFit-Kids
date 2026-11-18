import { useEffect, useState } from 'react'
import { Abakus3D } from '../components/Abakus3D'
import { tonFalsch, tonRichtig } from '../lib/effekte'
import { speak } from '../lib/speak'
import { randInt, shuffle, type GameProps } from './types'
import { SpielKopf, useEinmal } from './spielTeile'

// „Blitz-Abakus“: Ein Abakus blitzt kurz auf – welche Zahl war es?
// Stufe 1–5: eine Stange, 2,2 s → 1,4 s · 6–11: zwei Stangen · ab 12: drei Stangen; die Blitzzeit sinkt bis 0,6 s,
// ab Stufe 9 sind die falschen Antworten sehr ähnlich (eine Stelle anders). Kiga/1. Klasse: nur eine Stange.

const RUNDEN = 10

function aufgabe(stufe: number, einstellig: boolean) {
  const stellen = einstellig ? 1 : stufe <= 5 ? 1 : stufe <= 11 ? 2 : 3
  const min = stellen === 1 ? 1 : 10 ** (stellen - 1), max = 10 ** stellen - 1
  const z = randInt(min, max)
  const opt = new Set([z])
  const aehnlich = stufe >= 9
  for (let i = 0; opt.size < 4 && i < 200; i++) {
    let v: number
    if (aehnlich && stellen > 1) { const s = String(z).split(''); const k = randInt(0, s.length - 1); s[k] = String((Number(s[k]) + randInt(1, 4)) % 10); v = Number(s.join('')) }
    else v = z + randInt(-3, 3) * (stellen === 1 ? 1 : randInt(1, 10))
    if (v >= min && v <= max) opt.add(v)
  }
  while (opt.size < 4) opt.add(randInt(min, max))
  const ms = Math.max(600, 2200 - stufe * 90)
  return { z, stellen, ms, optionen: shuffle([...opt]) }
}

export function BlitzAbakus({ level, onFinish, rounds = RUNDEN, einstellig = false }: GameProps) {
  const [runde, setRunde] = useState(0)
  const [richtig, setRichtig] = useState(0)
  const stufe = level + Math.floor(richtig / 3)
  const [a, setA] = useState(() => aufgabe(level, einstellig))
  const [phase, setPhase] = useState<'zeigen' | 'raten' | 'ergebnis'>('zeigen')
  const [wahl, setWahl] = useState<number | null>(null)
  const ende = useEinmal(onFinish)

  useEffect(() => {
    if (phase !== 'zeigen') return
    const t = window.setTimeout(() => setPhase('raten'), a.ms)
    return () => window.clearTimeout(t)
  }, [phase, a])

  const tippe = (v: number) => {
    if (phase !== 'raten') return
    const ok = v === a.z
    setWahl(v); setPhase('ergebnis')
    const r = richtig + (ok ? 1 : 0)
    setRichtig(r)
    if (ok) { tonRichtig(r); void speak('Richtig!') } else tonFalsch()
    window.setTimeout(() => {
      if (runde + 1 >= rounds) { ende(r / rounds, `${r} von ${rounds} Blitz-Zahlen erkannt`); return }
      setRunde(runde + 1); setA(aufgabe(level + Math.floor(r / 3), einstellig)); setWahl(null); setPhase('zeigen')
    }, ok ? 800 : 1600)
  }

  const colw = a.stellen === 1 ? 80 : a.stellen === 2 ? 62 : 46
  return (
    <div className="sp">
      <SpielKopf punkte={richtig * 10} />
      <div className="game-hint">Runde {runde + 1} von {rounds} · {phase === 'zeigen' ? 'Gut hinschauen!' : 'Welche Zahl war es?'}</div>
      <div className="sp-buehne ba-buehne">
        {phase === 'zeigen' || phase === 'ergebnis' ? <div className={phase === 'zeigen' ? 'ba-abakus blitz' : 'ba-abakus'}><Abakus3D value={a.z} cols={a.stellen} colw={colw} /></div>
          : <div className="ba-frage">?</div>}
      </div>
      <div className="sp-optionen">
        {a.optionen.map((v) => (
          <button key={v} type="button" disabled={phase !== 'raten'} onClick={() => tippe(v)}
            className={'sp-option' + (wahl !== null && v === a.z ? ' richtig' : wahl === v ? ' falsch' : '')}>{v}</button>
        ))}
      </div>
      <div className="game-hint">Stufe {stufe} · Blitz {(a.ms / 1000).toFixed(1).replace('.', ',')} s</div>
    </div>
  )
}
