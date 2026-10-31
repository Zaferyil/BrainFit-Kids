import { Icon, type IconName } from '../components/Icon'
import { NavBar } from '../components/NavBar'
import { Stage } from '../components/Stage'
import { WORLDS } from '../data/curriculum'
import { useState } from 'react'
import { rangVon } from '../data/seza'
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

const ZAHLEN = [
  { id: 'sterne', icon: '⭐', name: 'Sterne', farbe: '#FFC531', wert: (id: string) => konto(id).sterne, text: '⭐ Sterne bekommst du für Übungen, Lektionen und Tests. Damit kaufst du in „Mein SeZa“ Hintergründe, Rahmen und die Überraschungskiste.' },
  { id: 'dia', icon: '💎', name: 'Diamanten', farbe: '#3BA7FF', wert: (_: string, p: Progress) => p.gems, text: '💎 Diamanten sind selten: für perfekte Tests (3 Sterne) und geschaffte Welten. Damit holst du dir die besonderen Diamant-Kostüme!' },
  { id: 'perlen', icon: '🟡', name: 'Perlen', farbe: '#FF8FC8', wert: (_: string, p: Progress) => p.perlen, text: '🟡 Perlen sind deine Punkte für jede richtige Antwort. Sie werden nie weniger: Sie bestimmen deinen Rang und deinen Platz in der Rangliste.' },
  { id: 'serie', icon: '🔥', name: 'Tage am Stück', farbe: '#5FE08A', wert: (_: string, p: Progress) => p.streak, text: '🔥 So viele Tage hintereinander hast du gelernt. Lange Serien schalten Kostüme wie Feuerwehr und Ninja frei!' },
]

export function Ich({ kid, progress, onLogout }: { kid: Kid; progress: Progress; onLogout: () => void }) {
  const [info, setInfo] = useState<string | null>(null)
  const rang = rangVon(progress.perlen)
  const stufe = load<number | null>(`bfk.stufe.${kid.id}`, null)
  const world = WORLDS[progress.world - 1] ?? WORLDS[0]
  return (
    <Stage background={BG}>
      <Funkeln />
      <div className="dp ich ich2">
        {/* Profil: SeZa, Name, Stufe und Level */}
        <section className="ich2-profil">
          <a href="#/seza" className="ich2-seza" aria-label="Mein SeZa anziehen"><SeZa kidId={kid.id} groesse={150} /><span className="ich2-stift">✏️</span></a>
          <div className="ich2-name">
            <h1>{kid.name}</h1>
            <p>{stufe !== null ? STUFE[stufe] : 'Klasse nicht gewählt'}</p>
            <div className="ich2-level"><b>Level {progress.level}</b><i><em style={{ width: `${progress.xp}%` }} /></i><small>{100 - progress.xp} XP bis Level {progress.level + 1}</small></div>
          </div>
        </section>

        {/* Kennzahlen: antippen erklärt, wofür sie sind */}
        <div className="ich2-zahlen">
          {ZAHLEN.map((z) => (
            <button key={z.id} type="button" className={info === z.id ? 'an' : ''} style={{ ['--c' as string]: z.farbe }} onClick={() => setInfo(info === z.id ? null : z.id)}>
              <span>{z.icon}</span><b>{z.wert(kid.id, progress)}</b><small>{z.name}</small>
            </button>
          ))}
        </div>
        {info && <p className="ich2-info" role="status">{ZAHLEN.find((z) => z.id === info)!.text}</p>}
        <div className="ich2-rang">
          <span className="ich2-rang-icon">{rang.icon}</span>
          <div><small>Mein Rang</small><b>{rang.name}</b>
            {rang.naechster && <><i><em style={{ width: `${Math.min(100, (progress.perlen - rang.ab) / (rang.naechster.ab - rang.ab) * 100)}%` }} /></i>
            <small>Noch {rang.naechster.ab - progress.perlen} Perlen bis {rang.naechster.icon} {rang.naechster.name}</small></>}
          </div>
        </div>
        <div className="ich2-welt"><span>🗺️ Welt {world.n}</span><b>{world.name}</b></div>

        {/* Große Kacheln */}
        <div className="ich2-kacheln">
          <a href="#/seza" className="ich2-kachel" style={{ ['--a' as string]: '#FF8A1F', ['--b' as string]: '#FF4FA3' }}>
            <span className="ich2-k-icon">👕</span><b>Mein SeZa</b><small>Kostüme &amp; Accessoires</small>
          </a>
          <a href="#/bericht" className="ich2-kachel" style={{ ['--a' as string]: '#14B86A', ['--b' as string]: '#1E9BFF' }}>
            <span className="ich2-k-icon">📊</span><b>Lernbericht</b><small>Stärken &amp; Fortschritt</small>
          </a>
        </div>

        {/* Einstellungen */}
        <section className="ich2-box">
          <h2>⚙️ Einstellungen</h2>
          <Einstellungen kidId={kid.id} />
          <PasswortAendern kid={kid} />
        </section>
        <button type="button" className="ich2-abmelden" onClick={onLogout}><Icon name="logout" color="currentColor" size={20} />Abmelden</button>
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
