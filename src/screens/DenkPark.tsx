import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { getLevel, getPlacement, tierFor, tierRank, TIERS } from '../games/engine'
import { useState } from 'react'
import { GAMES, KATEGORIEN, kategorieVon, type Kategorie } from '../games/registry'
import { echteWerte } from '../lib/rangliste'
import { getDaily } from '../lib/daily'
import type { Progress } from '../lib/progress'
import { Funkeln } from './Anmelden'

// Denkspiele: oben das Spiel des Tages, darunter die Spiele nach Kategorien (= Bereiche im Lernbericht).

const SYMBOL: Record<string, IconName> = { memory: 'brain', kette: 'pearl', jagd: 'search', muster: 'bulb', zahlenmerken: 'clock', vergleich: 'bars', schnellzaehlen: 'bolt', farbwort: 'eyeoff', bildermerken: 'image', abakusrechnen: 'plus', sorobankarten: 'bolt' }


export function DenkPark({ kid }: { kid: Kid; progress: Progress; onLogout: () => void }) {
  const tier = tierFor(kid.birthYear)
  const playable = GAMES.filter((g) => g.ready && tierRank(tier) >= tierRank(g.minTier))
  const werte = echteWerte(kid)
  const [alleOffen, setAlleOffen] = useState<string | null>(null)
  const daily = getDaily(kid.id)
  // jeden Tag ein anderes Spiel des Tages
  const heute = playable[[...daily.date].reduce((n, c) => n + c.charCodeAt(0), 0) % Math.max(1, playable.length)]

  return (
    <Stage background="linear-gradient(180deg, #4B2FC2 0%, #7B5CFF 50%, #FF9AC8 100%)">
      <Funkeln />
      <div className="dp">
        <header className="dp-head">
          <h1>Denkspiele</h1>
          <p>Heute schon {Math.min(daily.games, 2)} von 2 gespielt · {TIERS[tier].name}</p>
        </header>

        {heute && (
          <a href={`#/spiel/${heute.id}`} className="dp-heute">
            <svg className="dp-heute-deko" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="40" r="30" fill="#FFC531" /><circle cx="95" cy="80" r="22" fill="#2ECC8F" />
              <circle cx="30" cy="92" r="20" fill="#FF8FB1" /><circle cx="98" cy="22" r="13" fill="#3BA7FF" />
            </svg>
            <span className="dp-tag">SPIEL DES TAGES</span>
            <strong>{heute.name}</strong>
            <span className="dp-text">{heute.text}</span>
            <span className="dp-play"><Icon name="play" color="#2B2257" fill="#2B2257" size={16} />Spielen</span>
          </a>
        )}

        {KATEGORIEN.map((kat) => {
          const spiele = GAMES.filter((g) => kategorieVon(g.id) === kat.id)
          const offen = spiele.filter((g) => playable.includes(g))
          const bald = spiele.filter((g) => !playable.includes(g))
          const alle = alleOffen === kat.id
          return (
            <section key={kat.id} className="dp-kat">
              <header className="dp-kat-kopf">
                <span className="dp-kat-icon" style={{ background: kat.color }}><Icon name={kat.icon} color="#231A4F" size={22} strokeWidth={2.5} /></span>
                <div><h2>{kat.name}</h2><small>{kat.text}</small></div>
                {kat.bericht && offen.length > 0 && <span className="dp-kat-wert" title="Dein Wert in dieser Kategorie (0–100, fließt in den Lernbericht)">Wert {werte[kat.id as Exclude<Kategorie, 'raum' | 'flex'>] ?? 0}</span>}
                {offen.length > 2 && <button type="button" className="dp-kat-alle" onClick={() => setAlleOffen(alle ? null : kat.id)}>{alle ? 'Weniger' : 'Alle ansehen'} ›</button>}
              </header>
              <div className={alle ? 'dp-reihe alle' : 'dp-reihe'}>
                {offen.map((g) => {
                  const st = getLevel(kid.id, g.id, tier)
                  return (
                    <a key={g.id} href={`#/spiel/${g.id}`} className="dp-karte">
                      <span className="dp-karte-bild" style={{ background: `radial-gradient(circle at 30% 20%, #FFFFFF66, ${kat.color} 70%)` }}>
                        <Icon name={SYMBOL[g.id] ?? kat.icon} color="#231A4F" size={46} strokeWidth={2.2} />
                      </span>
                      <strong>{g.name}</strong>
                      <span className="dp-karte-text">{g.text}</span>
                      <span className="dp-karte-stufe"><b>Stufe {st}</b><i><em style={{ width: `${Math.min(100, (st / 20) * 100)}%`, background: kat.color }} /></i></span>
                    </a>
                  )
                })}
                {bald.map((g) => (
                  <div key={g.id} className="dp-karte bald">
                    <span className="dp-karte-bild"><Icon name="lock" color="#FFFFFF" size={34} strokeWidth={2.4} /></span>
                    <strong>{g.name}</strong>
                    <span className="dp-karte-text">kommt bald</span>
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        {getPlacement(kid.id)?.status !== 'done' && (
          <a href="#/einstufung" className="nk-btn yellow dp-invite"><Icon name="sparkle" color="#2B2257" size={20} /> Perli kennenlernen</a>
        )}
      </div>
      <NavBar active="denkpark" />
    </Stage>
  )
}
