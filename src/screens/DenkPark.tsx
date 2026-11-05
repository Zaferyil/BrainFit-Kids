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
import { SpielBild } from '../components/SpielBild'

// Spiele mit echtem Vorschaubild (Bildschirmfoto aus dem Spiel, public/spiele)
const BILDER = new Set(['abakusrechnen', 'sorobankarten', 'schnellzaehlen', 'memory', 'kette', 'bildermerken', 'zahlenmerken', 'jagd', 'farbwort', 'muster', 'vergleich', 'sortieren', 'blasen', 'spiegel', 'regel', 'tangram', 'labyrinth'])

// kräftige Farben je Kategorie (wie die früheren Kacheln): Verlauf, Rand-Schatten, Schrift
const FARBE: Record<string, { bg: string; rand: string; ink: string }> = {
  rechnen: { bg: 'radial-gradient(circle at 30% 20%, #FFE58A, #FFC531 60%, #F2A900)', rand: '#C98A00', ink: '#2B2257' },
  tempo: { bg: 'radial-gradient(circle at 30% 20%, #A8F0B8, #2ECC8F 60%, #1F9E6C)', rand: '#167A53', ink: '#0E3D28' },
  gedaechtnis: { bg: 'radial-gradient(circle at 30% 20%, #FFD0E4, #FF4F9A 60%, #C21F6A)', rand: '#8E1450', ink: '#FFFFFF' },
  konzentration: { bg: 'radial-gradient(circle at 30% 20%, #FFD2A8, #FF8A1F 60%, #E0600A)', rand: '#A84500', ink: '#2B1200' },
  aufmerksamkeit: { bg: 'radial-gradient(circle at 30% 20%, #CDE8FF, #3BA7FF 60%, #1C7FD6)', rand: '#145FA3', ink: '#08294A' },
  raum: { bg: 'radial-gradient(circle at 30% 20%, #D9F7FF, #2CC5E8 60%, #1495B5)', rand: '#0E6F87', ink: '#06303A' },
  flex: { bg: 'radial-gradient(circle at 30% 20%, #E7D8FF, #A06BFF 60%, #7444D9)', rand: '#5230A6', ink: '#FFFFFF' },
}

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
          const f = FARBE[kat.id]
          return (
            <section key={kat.id} className="dp-kat">
              <header className="dp-kat-kopf">
                <span className="dp-kat-icon" style={{ background: f.bg, boxShadow: `0 4px 0 ${f.rand}` }}><Icon name={kat.icon} color={f.ink} size={22} strokeWidth={2.5} /></span>
                <div><h2>{kat.name}</h2><small>{kat.text}</small></div>
                {kat.bericht && offen.length > 0 && <span className="dp-kat-wert" title="Dein Wert in dieser Kategorie (0–100, fließt in den Lernbericht)">Wert {werte[kat.id as Exclude<Kategorie, 'raum' | 'flex'>] ?? 0}</span>}
                {offen.length > 2 && <button type="button" className="dp-kat-alle" onClick={() => setAlleOffen(alle ? null : kat.id)}>{alle ? 'Weniger' : 'Alle ansehen'} ›</button>}
              </header>
              <div className={alle ? 'dp-reihe alle' : 'dp-reihe'}>
                {offen.map((g) => {
                  const st = getLevel(kid.id, g.id, tier)
                  return (
                    <a key={g.id} href={`#/spiel/${g.id}`} className="dp-karte">
                      <span className="dp-karte-bild">{BILDER.has(g.id) ? <img src={`${import.meta.env.BASE_URL}spiele/${g.id}.webp`} alt="" loading="lazy" /> : <SpielBild id={g.id} fallback={SYMBOL[g.id] ?? kat.icon} />}</span>
                      <strong>{g.name}</strong>
                      <span className="dp-karte-stufe"><b>Stufe {st}</b><small>{st}/20</small><i><em style={{ width: `${Math.min(100, (st / 20) * 100)}%` }} /></i></span>
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
