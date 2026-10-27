import { Avatar } from '../components/Avatar'
import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import { WORLDS } from '../data/curriculum'
import type { Kid } from '../data/demo'
import { getDaily } from '../lib/daily'
import type { Progress } from '../lib/progress'
import { load } from '../lib/storage'
import { Funkeln } from './Anmelden'

// Pokale: Tagesaufgaben und die Gürtel der Welten. Ich: Profil des Kindes mit Abmelden.

const BG = 'linear-gradient(180deg, #4B2FC2 0%, #7B5CFF 50%, #FF9AC8 100%)'

export function Pokale({ kid, progress }: { kid: Kid; progress: Progress }) {
  const daily = getDaily(kid.id)
  const quests: { icon: IconName; text: string; done: number; goal: number }[] = [
    { icon: 'target', text: 'Löse 20 Aufgaben', done: Math.min(daily.tasks, 20), goal: 20 },
    { icon: 'brain', text: 'Spiele 2 Denkspiele', done: Math.min(daily.games, 2), goal: 2 },
    { icon: 'clock', text: 'Lerne 10 Minuten', done: Math.min(daily.minutes, 10), goal: 10 },
  ]
  return (
    <Stage background={BG}>
      <Funkeln />
      <div className="dp">
        <header className="dp-head"><h1>Pokale</h1><p>{progress.perlen} Perlen gesammelt</p></header>

        <section className="pk-box">
          <h2>Tagesaufgaben</h2>
          {quests.map((q) => (
            <div key={q.text} className={q.done >= q.goal ? 'pk-quest fertig' : 'pk-quest'}>
              <span className="pk-icon"><Icon name={q.done >= q.goal ? 'check' : q.icon} color="#FFFFFF" size={22} strokeWidth={2.8} /></span>
              <div className="pk-body">
                <strong>{q.text}</strong>
                <div className="pk-track"><div style={{ width: `${(q.done / q.goal) * 100}%` }} /></div>
              </div>
              <b>{q.done}/{q.goal}</b>
            </div>
          ))}
        </section>

        <section className="pk-box">
          <h2>Gürtel</h2>
          <div className="pk-guertel">
            {WORLDS.map((w) => {
              const has = w.n < progress.world
              return (
                <div key={w.n} className={has ? 'pk-g' : 'pk-g zu'}>
                  <span style={{ background: has ? w.color : undefined, color: w.ink }}>
                    {has ? <Icon name="medal" color={w.ink} size={26} /> : <Icon name="lock" color="#FFFFFF" size={20} />}
                  </span>
                  <small>{w.belt.replace(/(en|n)$/, '')}</small>
                </div>
              )
            })}
          </div>
        </section>
      </div>
      <NavBar active="pokale" />
    </Stage>
  )
}

const STUFE = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']

export function Ich({ kid, progress, onLogout }: { kid: Kid; progress: Progress; onLogout: () => void }) {
  const stufe = load<number | null>(`bfk.stufe.${kid.id}`, null)
  const world = WORLDS[progress.world - 1] ?? WORLDS[0]
  return (
    <Stage background={BG}>
      <Funkeln />
      <div className="dp ich">
        <div className="ich-bild"><Avatar size={130} {...kid.avatar} /></div>
        <h1>{kid.name}</h1>
        <p>{stufe !== null ? STUFE[stufe] : 'Klasse nicht gewählt'} · Level {progress.level}</p>
        <div className="erfolg-chips ich-chips">
          <div><span>PERLEN</span><b className="gelb">{progress.perlen}</b></div>
          <div><span>WELT</span><b className="gruen">{world.n} · {world.name}</b></div>
        </div>
        <button type="button" className="nk-btn yellow" onClick={onLogout}><Icon name="logout" color="#2B2257" size={22} />Abmelden</button>
      </div>
      <NavBar active="garderobe" />
    </Stage>
  )
}
