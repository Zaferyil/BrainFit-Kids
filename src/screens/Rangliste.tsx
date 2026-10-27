import { useMemo, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { KLASSEN } from '../lib/klasse'
import { BEREICHE, rangliste, stufeVon, vergleichsgruppe, type Bereich, type Eintrag } from '../lib/rangliste'
import { Funkeln } from './Anmelden'

// Rangliste nach Klassenstufe. Pädagogisch: Podest für die ersten drei, dazu nur der eigene Platz
// und wie viel bis zum nächsten Platz fehlt – die letzten Plätze werden nicht aufgelistet.

const BG = 'linear-gradient(180deg, #4B2FC2 0%, #7B5CFF 50%, #FF9AC8 100%)'
const MEDAILLE = ['#FFC531', '#C9D3E8', '#E39A5B']

function Kopf({ e, size }: { e: Eintrag; size: number }) {
  if (e.kid) return <Avatar size={size} {...e.kid.avatar} />
  return <span className="rl-init" style={{ width: size, height: size, fontSize: size * 0.42 }}>{e.name[0]}</span>
}

export function Rangliste({ kid }: { kid: Kid }) {
  const [bereich, setBereich] = useState<Bereich>('gesamt')
  const gruppe = useMemo(() => vergleichsgruppe(kid), [kid])
  const liste = rangliste(gruppe, bereich)
  const platz = liste.findIndex((e) => e.id === kid.id)
  const ich = liste[platz]
  const vor = platz > 0 ? liste[platz - 1] : null
  const info = BEREICHE.find((b) => b.id === bereich)!
  const einheit = bereich === 'gesamt' ? 'Perlen' : 'Punkte'
  const ichWerte = gruppe.find((e) => e.id === kid.id)!.werte

  return (
    <Stage background={BG}>
      <Funkeln />
      <div className="dp rl">
        <header className="dp-head">
          <h1>Rangliste</h1>
          <p>Du wirst mit Kindern der {KLASSEN[stufeVon(kid)]?.name ?? 'gleichen Klasse'} verglichen</p>
        </header>

        <div className="rl-tabs" role="tablist">
          {BEREICHE.map((b) => (
            <button key={b.id} type="button" role="tab" aria-selected={b.id === bereich} className={b.id === bereich ? 'rl-tab an' : 'rl-tab'} onClick={() => setBereich(b.id)}>{b.name}</button>
          ))}
        </div>
        <p className="rl-info">{info.text}</p>

        <div className="rl-podest">
          {[1, 0, 2].map((i) => liste[i] && (
            <div key={liste[i].id} className={`rl-stufe p${i + 1} ${liste[i].id === kid.id ? 'ich' : ''}`}>
              <Kopf e={liste[i]} size={i === 0 ? 70 : 56} />
              <strong>{liste[i].name}</strong>
              <span>{liste[i].werte[bereich]} {einheit}</span>
              <div className="rl-sockel" style={{ background: MEDAILLE[i] }}>{i + 1}</div>
            </div>
          ))}
        </div>

        {ich && platz > 2 && (
          <section className="rl-ich">
            {vor && <div className="rl-zeile"><b>{platz}.</b><Kopf e={vor} size={38} /><span>{vor.name}</span><em>{vor.werte[bereich]}</em></div>}
            <div className="rl-zeile ich"><b>{platz + 1}.</b><Kopf e={ich} size={38} /><span>Du</span><em>{ich.werte[bereich]}</em></div>
          </section>
        )}
        {ich && (
          <p className="rl-motiv">
            {platz === 0 ? 'Du bist auf Platz 1 – super!' : `Noch ${vor!.werte[bereich] - ich.werte[bereich] + 1} ${einheit} bis Platz ${platz}. Du schaffst das!`}
          </p>
        )}

        <section className="pk-box">
          <h2>Dein Profil</h2>
          {BEREICHE.filter((b) => b.id !== 'gesamt').map((b) => (
            <div key={b.id} className="rl-balken">
              <span>{b.name}</span>
              <div className="pk-track"><div style={{ width: `${Math.min(100, ichWerte[b.id])}%` }} /></div>
              <b>{ichWerte[b.id]}</b>
            </div>
          ))}
          <p className="rl-hinweis"><Icon name="bulb" color="#8A5A00" size={16} /> Werte von 0 bis 100. Spiele Denkspiele und mach deine Lektionen, dann wachsen sie.</p>
        </section>
        {gruppe.some((e) => e.beispiel) && <p className="rl-demo">Bis alle Kinder online verbunden sind, stehen hier auch Beispiel-Kinder.</p>}
      </div>
      <NavBar active="pokale" />
    </Stage>
  )
}
