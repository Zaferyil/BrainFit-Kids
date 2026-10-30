import { useState } from 'react'
import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { SeZa } from '../components/SeZa'
import { Stage } from '../components/Stage'
import { passt, WARUM_NICHT, type Artikel, type Slot } from '../data/seza'
import type { Kid } from '../data/demo'
import { getProgress } from '../lib/progress'
import { alleArtikel, anziehen, artikel, ausziehen, kaufen, konto, type Ausstattung } from '../lib/wirtschaft'

// Mein SeZa: Figur ansehen, anprobieren, mit Sternen und Diamanten freischalten, anziehen.

type Reiter = 'kostueme' | 'accessoires'
const REITER: { id: Reiter; titel: string }[] = [{ id: 'kostueme', titel: 'Kostüme' }, { id: 'accessoires', titel: 'Accessoires' }]
const reiterVon = (a: Artikel): Reiter => a.slot === 'outfit' ? 'kostueme' : 'accessoires'
const BG = 'linear-gradient(180deg, #3B6DF0 0%, #6C4BFF 45%, #FF9AC8 100%)'

export function MeinSeZa({ kid }: { kid: Kid }) {
  const [, neu] = useState(0)
  const [reiter, setReiter] = useState<Reiter>('kostueme')
  const [probe, setProbe] = useState<Ausstattung | null>(null)
  const [frage, setFrage] = useState<Artikel | null>(null)
  const [sagt, setSagt] = useState('Hallo! Ich bin SeZa. Such mir etwas Schönes aus!')
  const [jubel, setJubel] = useState(false)
  const k = konto(kid.id)
  const p = getProgress(kid.id)
  const kostuem = artikel(k.an.outfit)
  const liste = alleArtikel().filter((a) => reiterVon(a) === reiter)

  const freuen = (text: string) => { setSagt(text); setJubel(true); window.setTimeout(() => setJubel(false), 1400) }
  const anprobieren = (a: Artikel) => {
    const basis = probe ?? k.an
    const neuAn: Ausstattung = a.slot === 'outfit' ? { ...basis, outfit: a.id } : { ...basis, [a.slot]: a.id }
    setProbe(neuAn)
    setSagt(passt(artikel(neuAn.outfit), a) ? `So sehe ich mit „${a.name}“ aus!` : WARUM_NICHT[a.slot] ?? '')
  }
  const kauf = (a: Artikel) => {
    const r = kaufen(kid.id, a.id)
    setFrage(null)
    if (r.ok) { anziehen(kid.id, a.id); setProbe(null); freuen(a.slot === 'outfit' ? 'Wow! Dein neues Outfit ist freigeschaltet!' : `Wow! ${a.name} ist freigeschaltet!`) }
    else if (r.grund === 'sterne') setSagt(`Dir fehlen noch ${r.fehlt} Sterne. Weiter so!`)
    else if (r.grund === 'diamanten') setSagt(`Dir fehlen noch ${r.fehlt} Diamanten. Weiter so!`)
    neu((x) => x + 1)
  }

  return (
    <Stage background={BG}>
      <div className="sz">
        <header className="sz-kopf">
          <a href="#/garderobe" className="nk-round ghost" aria-label="Zurück"><Icon name="left" color="#FFFFFF" size={22} strokeWidth={3} /></a>
          <div className="sz-titel"><small>{kid.name}</small><h1>Mein SeZa</h1></div>
          <div className="sz-konto">
            <span className="stern" aria-label={`${k.sterne} Sterne`}>⭐ {k.sterne}</span>
            <span className="dia" aria-label={`${p.gems} Diamanten`}>💎 {p.gems}</span>
            <span className="lvl">Level {p.level}</span>
          </div>
        </header>

        <section className="sz-buehne">
          <div className="sz-blase" role="status">{sagt}</div>
          <SeZa an={probe ?? k.an} groesse="min(300px, 70vw)" jubel={jubel} />
          {probe ? (
            <div className="sz-probe"><span>Anprobe</span><button type="button" onClick={() => { setProbe(null); setSagt('Wieder wie vorher.') }}>Zurück zu meinem SeZa</button></div>
          ) : (
            <div className="sz-an">{(Object.entries(k.an) as [Slot, string][]).filter(([s]) => s !== 'outfit').map(([s, id]) => (
              <button key={s} type="button" onClick={() => { ausziehen(kid.id, s); neu((x) => x + 1) }} aria-label={`${artikel(id)?.name} ausziehen`}>{artikel(id)?.name} ✕</button>
            ))}</div>
          )}
        </section>

        <nav className="sz-reiter" aria-label="Kategorien">
          {REITER.map((r) => <button key={r.id} type="button" aria-pressed={reiter === r.id} onClick={() => setReiter(r.id)}>{r.titel}</button>)}
        </nav>

        <div className="sz-raster">
          {liste.map((a) => {
            const hat = k.besitz.includes(a.id)
            const traegt = a.slot === 'outfit' ? k.an.outfit === a.id : k.an[a.slot] === a.id
            const ok = a.slot === 'outfit' || passt(kostuem, a)
            const genug = a.waehrung === 'sterne' ? k.sterne >= a.preis : p.gems >= a.preis
            return (
              <article key={a.id} className={`sz-karte ${traegt ? 'an' : ''} ${hat ? 'hat' : ''}`}>
                <button type="button" className="sz-bild" onClick={() => anprobieren(a)} aria-label={`${a.name} anprobieren`}>
                  {a.bild ? <img src={a.bild} alt="" loading="lazy" /> : <span>✨</span>}
                  {traegt && <i className="sz-haken" aria-label="angezogen">✓</i>}
                  {!hat && <i className="sz-schloss" aria-hidden="true">🔒</i>}
                </button>
                <b title={a.name}>{a.name}</b>
                {hat ? (
                  traegt ? (a.slot === 'outfit' ? <span className="sz-status">Angezogen</span>
                    : <button type="button" className="sz-btn" onClick={() => { ausziehen(kid.id, a.slot); neu((x) => x + 1) }}>Ausziehen</button>)
                    : <button type="button" className="sz-btn gruen" disabled={!ok} onClick={() => { if (anziehen(kid.id, a.id)) { setProbe(null); freuen('Super, so gefalle ich mir!') } neu((x) => x + 1) }}>{ok ? 'Anziehen' : 'Passt nicht'}</button>
                ) : (
                  <button type="button" className="sz-btn gelb" disabled={!genug} onClick={() => setFrage(a)} title={genug ? 'Freischalten' : a.waehrung === 'sterne' ? 'Nicht genug Sterne' : 'Nicht genug Diamanten'}>
                    {a.waehrung === 'sterne' ? '⭐' : '💎'} {a.preis}
                  </button>
                )}
              </article>
            )
          })}
        </div>

        <Verlauf kidId={kid.id} />
      </div>

      {frage && (
        <div className="sz-dialog" role="dialog" aria-label="Freischalten bestätigen">
          <div className="sz-dialog-karte popin">
            <h2>{frage.name} freischalten?</h2>
            <p>Das kostet {frage.preis} {frage.waehrung === 'sterne' ? 'Sterne ⭐' : 'Diamanten 💎'}.</p>
            <div><button type="button" className="sz-btn" onClick={() => setFrage(null)}>Abbrechen</button><button type="button" className="sz-btn gelb" onClick={() => kauf(frage)}>Ja, freischalten</button></div>
          </div>
        </div>
      )}
      <NavBar active="garderobe" />
    </Stage>
  )
}

function Verlauf({ kidId }: { kidId: string }) {
  const b = konto(kidId).buchungen.slice(-8).reverse()
  if (!b.length) return <p className="sz-tipp">Lerne weiter: Für Übungen, Lektionen, Tests und den Buch-Check bekommst du Sterne!</p>
  return (
    <section className="sz-verlauf"><h2>Zuletzt</h2>
      <ul>{b.map((x) => <li key={x.id}><span>{x.grund}</span><b className={x.sterne + x.diamanten < 0 ? 'minus' : ''}>{x.sterne ? `${x.sterne > 0 ? '+' : ''}${x.sterne} ⭐` : ''} {x.diamanten ? `${x.diamanten > 0 ? '+' : ''}${x.diamanten} 💎` : ''}</b></li>)}</ul>
    </section>
  )
}
