import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import { WORLDS } from '../data/curriculum'
import { useState } from 'react'
import { SeZa } from '../components/SeZa'
import { konto, kindEinstellungen, speichereKindEinstellungen } from '../lib/wirtschaft'
import { passwortVon, setzePasswort, type Kid } from '../data/demo'
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
        <a href="#/rangliste" className="pk-rangliste"><Icon name="trophy" color="#2B2257" fill="#FFE58F" size={30} /><span><strong>Rangliste</strong><small>Vergleiche dich mit deiner Klasse</small></span><Icon name="right" color="#2B2257" size={24} /></a>

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
                  <small>{w.belt === 'orangen' ? 'orange' : w.belt.replace(/en$/, '')}</small>
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
        <a href="#/seza" className="ich-seza"><SeZa kidId={kid.id} groesse={120} /><span><b>Mein SeZa</b><small>⭐ {konto(kid.id).sterne} · 💎 {progress.gems}</small><em>Kostüme &amp; Accessoires →</em></span></a>
        <a href="#/bericht" className="ich-seza ich-bericht"><span className="ich-bericht-icon" aria-hidden="true">📊</span><span><b>Mein Lernbericht</b><small>Stärken, Fortschritt &amp; Vergleich</small><em>Ansehen →</em></span></a>
        <h1>{kid.name}</h1>
        <p>{stufe !== null ? STUFE[stufe] : 'Klasse nicht gewählt'} · Level {progress.level}</p>
        <div className="erfolg-chips ich-chips">
          <div><span>PERLEN</span><b className="gelb">{progress.perlen}</b></div>
          <div><span>WELT</span><b className="gruen">{world.n} · {world.name}</b></div>
        </div>
        <Einstellungen kidId={kid.id} />
        <PasswortAendern kid={kid} />
        <button type="button" className="nk-btn yellow" onClick={onLogout}><Icon name="logout" color="#2B2257" size={22} />Abmelden</button>
      </div>
      <NavBar active="garderobe" />
    </Stage>
  )
}

function PasswortAendern({ kid }: { kid: Kid }) {
  const [offen, setOffen] = useState(false)
  const [alt, setAlt] = useState('')
  const [neu, setNeu] = useState('')
  const [nochmal, setNochmal] = useState('')
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null)
  if (!offen) return (
    <>
    {meldung?.ok && <p className="pw-ok pw-hell">{meldung.text}</p>}
    <button type="button" className="nk-btn green" onClick={() => { setOffen(true); setMeldung(null) }}>
      <Icon name="settings" color="#FFFFFF" size={22} />Passwort ändern
    </button>
    </>
  )
  const speichern = () => {
    if (alt.trim() !== passwortVon(kid)) return setMeldung({ ok: false, text: 'Das alte Passwort stimmt nicht.' })
    if (neu.trim().length < 4) return setMeldung({ ok: false, text: 'Das neue Passwort braucht mindestens 4 Zeichen.' })
    if (neu.trim() !== nochmal.trim()) return setMeldung({ ok: false, text: 'Die beiden neuen Passwörter sind nicht gleich.' })
    setzePasswort(kid.id, neu)
    setAlt(''); setNeu(''); setNochmal(''); setOffen(false)
    setMeldung({ ok: true, text: 'Super! Dein neues Passwort ist gespeichert.' })
  }
  return (
    <form className="pw-form" onSubmit={(e) => { e.preventDefault(); speichern() }}>
      <label>Altes Passwort<input type="password" value={alt} onChange={(e) => setAlt(e.target.value)} autoComplete="current-password" /></label>
      <label>Neues Passwort<input type="password" value={neu} onChange={(e) => setNeu(e.target.value)} autoComplete="new-password" /></label>
      <label>Nochmal neues Passwort<input type="password" value={nochmal} onChange={(e) => setNochmal(e.target.value)} autoComplete="new-password" /></label>
      {meldung && <p className={meldung.ok ? 'pw-ok' : 'pw-fehler'}>{meldung.text}</p>}
      <div className="pw-knoepfe">
        <button type="button" className="pw-abbrechen" onClick={() => setOffen(false)}>Abbrechen</button>
        <button type="submit" className="nk-btn green">Speichern</button>
      </div>
    </form>
  )
}

/** Ton und Animationen an/aus */
function Einstellungen({ kidId }: { kidId: string }) {
  const [e, setE] = useState(() => kindEinstellungen(kidId))
  const setze = (neu: typeof e) => { setE(neu); speichereKindEinstellungen(kidId, neu) }
  return (
    <div className="ich-schalter">
      <label><input type="checkbox" checked={e.ton} onChange={(x) => setze({ ...e, ton: x.target.checked })} /> Ton und Vorlesen</label>
      <label><input type="checkbox" checked={e.animation} onChange={(x) => setze({ ...e, animation: x.target.checked })} /> Animationen</label>
    </div>
  )
}
