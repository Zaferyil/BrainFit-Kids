import { useState } from 'react'
import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { SeZa } from '../components/SeZa'
import { Stage } from '../components/Stage'
import { KISTE_PREIS, type Artikel } from '../data/seza'
import type { Kid } from '../data/demo'
import { getProgress } from '../lib/progress'
import { alleArtikel, anziehen, artikel, ausziehen, bedingungStand, hatArtikel, kaufen, kisteOeffnen, konto, type Ausstattung } from '../lib/wirtschaft'

// Mein SeZa: Kostüme werden durch Lernen frei; mit Sternen gibt es Hintergründe, Rahmen und die Überraschungskiste.

type Reiter = 'outfit' | 'hg' | 'rahmen'
const REITER: { id: Reiter; titel: string }[] = [{ id: 'outfit', titel: 'Kostüme' }, { id: 'hg', titel: 'Hintergründe' }, { id: 'rahmen', titel: 'Rahmen' }]
const BG = 'linear-gradient(180deg, #3B6DF0 0%, #6C4BFF 45%, #FF9AC8 100%)'

export function MeinSeZa({ kid }: { kid: Kid }) {
  const [, neu] = useState(0)
  const [reiter, setReiter] = useState<Reiter>('outfit')
  const [probe, setProbe] = useState<Ausstattung | null>(null)
  const [frage, setFrage] = useState<Artikel | null>(null)
  const [sagt, setSagt] = useState('Hallo! Ich bin SeZa. Such mir etwas Schönes aus!')
  const [jubel, setJubel] = useState(false)
  const k = konto(kid.id)
  const p = getProgress(kid.id)
  const liste = alleArtikel().filter((a) => a.slot === reiter)
  const [kiste, setKiste] = useState<Artikel | null>(null)

  const freuen = (text: string) => { setSagt(text); setJubel(true); window.setTimeout(() => setJubel(false), 1400) }
  const anprobieren = (a: Artikel) => {
    const basis = probe ?? k.an
    const neuAn: Ausstattung = a.slot === 'outfit' ? { ...basis, outfit: a.id } : { ...basis, [a.slot]: a.id }
    setProbe(neuAn)
    setSagt(`So sehe ich mit „${a.name}“ aus!`)
  }
  const kauf = (a: Artikel) => {
    const r = kaufen(kid.id, a.id)
    setFrage(null)
    if (r.ok) { anziehen(kid.id, a.id); setProbe(null); freuen(`Wow! ${a.name} gehört jetzt dir!`) }
    else if (r.grund === 'sterne') setSagt(`Dir fehlen noch ${r.fehlt} Sterne. Weiter so!`)
    else if (r.grund === 'diamanten') setSagt(`Dir fehlen noch ${r.fehlt} Diamanten. Weiter so!`)
    neu((x) => x + 1)
  }

  const oeffnen = () => {
    const r = kisteOeffnen(kid.id)
    if (r.ok) { setKiste(r.artikel); freuen(`Überraschung! ${r.artikel.name}!`) }
    else setSagt(r.grund === 'alles' ? 'Du hast schon alles gesammelt – Wahnsinn!' : `Für die Kiste fehlen dir noch ${r.fehlt} Sterne.`)
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
            <div className="sz-an">{(Object.entries(k.an) as [Reiter, string][]).filter(([s, id]) => s !== 'outfit' && artikel(id)).map(([s, id]) => (
              <button key={s} type="button" onClick={() => { ausziehen(kid.id, s); neu((x) => x + 1) }} aria-label={`${artikel(id)?.name} ausziehen`}>{artikel(id)?.name} ✕</button>
            ))}</div>
          )}
        </section>

        <nav className="sz-reiter" aria-label="Kategorien">
          {REITER.map((r) => <button key={r.id} type="button" aria-pressed={reiter === r.id} onClick={() => setReiter(r.id)}>{r.titel}</button>)}
        </nav>

        {reiter !== 'outfit' && (
          <button type="button" className="sz-kiste" onClick={oeffnen} disabled={k.sterne < KISTE_PREIS}>
            <span className="sz-kiste-bild" aria-hidden="true">🎁</span>
            <span><b>Überraschungskiste</b><small>Ein zufälliger Hintergrund oder Rahmen</small></span>
            <em>⭐ {KISTE_PREIS}</em>
          </button>
        )}

        <div className={`sz-raster ${reiter === 'outfit' ? '' : 'schmuck'}`}>
          {liste.map((a) => {
            const hat = hatArtikel(kid.id, a)
            const traegt = k.an[a.slot] === a.id || (a.slot === 'outfit' && !k.an.outfit && a.id === 'original')
            const genug = a.waehrung === 'sterne' ? k.sterne >= a.preis : p.gems >= a.preis
            const fehlt = a.waehrung === 'diamanten' ? Math.max(0, a.preis - p.gems) : 0
            const stand = a.slot === 'outfit' && a.frei ? bedingungStand(kid.id, a.frei) : null
            const vorschau = a.slot === 'outfit' ? <img src={a.bild} alt="" loading="lazy" />
              : <SeZa an={{ outfit: k.an.outfit, [a.slot]: a.id }} groesse="100%" />
            return (
              <article key={a.id} className={`sz-karte ${traegt ? 'an' : ''} ${hat ? 'hat' : 'zu'} ${a.waehrung === 'diamanten' ? 'diamant' : ''}`}>
                <button type="button" className="sz-bild" onClick={() => anprobieren(a)} aria-label={`${a.name} anprobieren`}>
                  {vorschau}
                  {traegt && <i className="sz-haken" aria-label="angezogen">✓</i>}
                  {!hat && <i className="sz-schloss" aria-hidden="true">🔒</i>}
                </button>
                <b title={a.name}>{a.name}</b>
                {hat ? (
                  traegt ? (a.slot === 'outfit' ? <span className="sz-status">Angezogen</span>
                    : <button type="button" className="sz-btn" onClick={() => { ausziehen(kid.id, a.slot); neu((x) => x + 1) }}>Ablegen</button>)
                    : <button type="button" className="sz-btn gruen" onClick={() => { if (anziehen(kid.id, a.id)) { setProbe(null); freuen('Super, so gefalle ich mir!') } neu((x) => x + 1) }}>{a.slot === 'outfit' ? 'Anziehen' : 'Benutzen'}</button>
                ) : stand ? (
                  <div className="sz-ziel"><i><em style={{ width: `${stand.anteil * 100}%` }} /></i><small>{stand.fehlt}</small></div>
                ) : (
                  <button type="button" className="sz-btn gelb" disabled={!genug} onClick={() => setFrage(a)} title={genug ? 'Kaufen' : a.waehrung === 'sterne' ? 'Nicht genug Sterne' : `Noch ${fehlt} Diamanten`}>
                    {a.waehrung === 'sterne' ? '⭐' : '💎'} {a.preis}
                  </button>
                )}
              </article>
            )
          })}
        </div>

        <Verlauf kidId={kid.id} />
      </div>

      {kiste && (
        <div className="sz-dialog" role="dialog" aria-label="Überraschung">
          <div className="sz-dialog-karte popin sz-kiste-auf">
            <span className="sz-kiste-gross" aria-hidden="true">🎉</span>
            <h2>{kiste.name}!</h2>
            <div className="sz-kiste-vorschau"><SeZa an={{ outfit: k.an.outfit, [kiste.slot]: kiste.id }} groesse={160} /></div>
            <div><button type="button" className="sz-btn" onClick={() => setKiste(null)}>Später</button><button type="button" className="sz-btn gruen" onClick={() => { anziehen(kid.id, kiste.id); setKiste(null); neu((x) => x + 1) }}>Gleich benutzen</button></div>
          </div>
        </div>
      )}
      {frage && (
        <div className="sz-dialog" role="dialog" aria-label="Freischalten bestätigen">
          <div className="sz-dialog-karte popin">
            <h2>{frage.name} kaufen?</h2>
            <p>Das kostet {frage.preis} {frage.waehrung === 'sterne' ? 'Sterne ⭐' : 'Diamanten 💎'}.</p>
            <div><button type="button" className="sz-btn" onClick={() => setFrage(null)}>Abbrechen</button><button type="button" className="sz-btn gelb" onClick={() => kauf(frage)}>Ja, kaufen</button></div>
          </div>
        </div>
      )}
      <NavBar active="garderobe" />
    </Stage>
  )
}

function Verlauf({ kidId }: { kidId: string }) {
  const b = konto(kidId).buchungen.slice(-8).reverse()
  if (!b.length) return <p className="sz-tipp">Lerne weiter: Für Übungen, Lektionen, Tests und den Buch-Check bekommst du Sterne. Neue Kostüme schaltest du durch Lernen frei!</p>
  return (
    <section className="sz-verlauf"><h2>Zuletzt</h2>
      <ul>{b.map((x) => <li key={x.id}><span>{x.grund}</span><b className={x.sterne + x.diamanten < 0 ? 'minus' : ''}>{x.sterne ? `${x.sterne > 0 ? '+' : ''}${x.sterne} ⭐` : ''} {x.diamanten ? `${x.diamanten > 0 ? '+' : ''}${x.diamanten} 💎` : ''}</b></li>)}</ul>
    </section>
  )
}
