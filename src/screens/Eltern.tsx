import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { Bericht } from './Bericht'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { alleKinder, type Kid } from '../data/demo'
import { SeZaKopf } from '../components/SeZa'
import { adminAbmelden, elternAnmelden, elternKinder, elternPasswortVergessen } from '../lib/adminCloud'
import { WORLDS } from '../data/curriculum'
import { STATIONS } from '../data/units'
import { buchAuftrag, workbookAuftrag } from '../data/buch'
import { getProgress, stationSkipped, stationStars } from '../lib/progress'
import { getDaily } from '../lib/daily'
import { klasseVon } from '../lib/klasse'
import { lektionNr, ALLE_LEKTIONEN } from '../lib/admin'
import { BEREICHE, echteWerte } from '../lib/rangliste'

// Eltern-Bereich: Lernstand des eigenen Kindes, Hausaufgabe im Buch, Tipps für zu Hause.
// Anmeldung mit der E-Mail und dem Passwort aus dem Kauf (Supabase); es erscheinen nur die eigenen Kinder.

const KEY = 'bfk.eltern'
const TAGESZIEL = 15

type KindKurz = { id: string; name: string }

export function Eltern() {
  const [kinder, setKinder] = useState<KindKurz[] | null>(null)
  const [kidId, setKidId] = useState<string | null>(() => { try { return sessionStorage.getItem(KEY) } catch { return null } })
  const [pruefen, setPruefen] = useState(true)
  useEffect(() => { void elternKinder().then((k) => { setKinder(k); setPruefen(false) }) }, [])
  const waehlen = (id: string | null) => { try { if (id) sessionStorage.setItem(KEY, id); else sessionStorage.removeItem(KEY) } catch { /* egal */ } setKidId(id) }
  const abmelden = () => { waehlen(null); setKinder(null); void adminAbmelden() }
  if (pruefen) return <div className="adm adm-login"><div className="adm-card adm-login-card"><p>Einen Moment …</p></div></div>
  if (!kinder) return <Login onOk={(k) => { setKinder(k); if (k.length === 1) waehlen(k[0].id) }} />
  const kid = alleKinder().find((x) => x.kid.id === kidId && kinder.some((k) => k.id === kidId))?.kid
  if (!kid) return <Auswahl kinder={kinder} onWahl={waehlen} onLogout={abmelden} />
  return <Dashboard kid={kid} onLogout={abmelden} onWechseln={kinder.length > 1 ? () => waehlen(null) : undefined} />
}

function Login({ onOk }: { onOk: (k: KindKurz[]) => void }) {
  const [mail, setMail] = useState('')
  const [pw, setPw] = useState('')
  const [fehler, setFehler] = useState('')
  const [info, setInfo] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const anmelden = async (e: FormEvent) => {
    e.preventDefault(); setLaeuft(true); setFehler('')
    const k = await elternAnmelden(mail, pw).catch(() => null)
    setLaeuft(false)
    if (!k) setFehler('E-Mail oder Passwort ist falsch.')
    else if (!k.length) setFehler('Mit diesem Konto ist noch kein Kind verknüpft.')
    else onOk(k)
  }
  const vergessen = async () => {
    if (!mail.trim()) { setFehler('Bitte zuerst Ihre E-Mail-Adresse eintragen.'); return }
    await elternPasswortVergessen(mail)
    setFehler(''); setInfo('Wenn es ein Konto mit dieser Adresse gibt, schicken wir Ihnen gleich eine E-Mail zum Zurücksetzen.')
  }
  return (
    <div className="adm adm-login">
      <form className="adm-card adm-login-card eltern-login" onSubmit={(e) => void anmelden(e)}>
        <img className="app-logo" src={`${import.meta.env.BASE_URL}logo.webp`} alt="BrainFit Kids" />
        <h1>Eltern-Bereich</h1>
        <p>Mit der E-Mail-Adresse und dem Passwort anmelden, die Sie beim Kauf gewählt haben.</p>
        <input type="email" autoFocus value={mail} onChange={(e) => { setMail(e.target.value); setFehler('') }} placeholder="E-Mail" aria-label="E-Mail" autoComplete="username" />
        <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setFehler('') }} placeholder="Passwort" aria-label="Passwort" autoComplete="current-password" />
        {fehler && <div className="adm-fehler">{fehler}</div>}
        {info && <div className="adm-info">{info}</div>}
        <button type="submit" className="adm-btn primary" disabled={laeuft || !mail || !pw}>{laeuft ? 'Anmelden …' : 'Anmelden'}</button>
        <button type="button" className="adm-link" onClick={() => void vergessen()}>Passwort vergessen?</button>
        <a href="../index.html" className="adm-link">Zurück zur Website</a>
      </form>
    </div>
  )
}

function Auswahl({ kinder, onWahl, onLogout }: { kinder: KindKurz[]; onWahl: (id: string) => void; onLogout: () => void }) {
  return (
    <div className="adm adm-login">
      <div className="adm-card adm-login-card eltern-login">
        <h1>Ihre Kinder</h1>
        <div className="eltern-kinder">
          {kinder.map((k) => <button key={k.id} type="button" onClick={() => onWahl(k.id)}><SeZaKopf kidId={k.id} size={52} /><span>{k.name}</span></button>)}
        </div>
        <button type="button" className="adm-link" onClick={onLogout}>Abmelden</button>
      </div>
    </div>
  )
}

function Dashboard({ kid, onLogout, onWechseln }: { kid: Kid; onLogout: () => void; onWechseln?: () => void }) {
  const [bericht, setBericht] = useState(false)
  if (bericht) return <Bericht kid={kid} eltern zurueck={{ onClick: () => setBericht(false) }} />
  const p = getProgress(kid.id)
  const daily = getDaily(kid.id)
  const welt = WORLDS[p.world - 1]
  const nr = lektionNr(p.world, p.unit)
  const sterne = stationStars(p)
  const stationen = STATIONS.map((s, i) => ({ ...s, sterne: sterne[i] ?? 0, aus: stationSkipped(p, i) })).filter((s) => !s.aus)
  const geschafft = stationen.filter((s) => s.sterne > 0).length
  const naechste = stationen.find((s) => s.sterne === 0)
  const buch = buchAuftrag(p.world, p.unit, klasseVon(kid.id).aufgaben)
  const wb = workbookAuftrag(p.world, p.unit)
  const werte = echteWerte(kid)
  const maxWert = Math.max(1, ...BEREICHE.filter((b) => b.id !== 'gesamt').map((b) => werte[b.id]))
  const minuten = Math.min(daily.minutes, TAGESZIEL)

  return (
    <div className="adm">
      <header className="adm-head">
        <div className="adm-brand"><Avatar size={36} {...kid.avatar} /><b>{kid.name}</b><span>Eltern</span></div>
        <div className="adm-tabs" />
        <div className="adm-head-r">
          {onWechseln && <button type="button" className="adm-btn" onClick={onWechseln}>Anderes Kind</button>}
          <button type="button" className="adm-btn" onClick={onLogout}><Icon name="logout" size={16} color="currentColor" /> Abmelden</button>
        </div>
      </header>
      <main className="adm-main">
        <button type="button" className="adm-btn primary eltern-bericht-knopf" onClick={() => setBericht(true)}>📊 Lernbericht ansehen – Stärken, Entwicklung &amp; Vergleich</button>
        <div className="adm-kpis">
          <div className="adm-card adm-kpi"><span>Lektion</span><b>{nr} <small>von {ALLE_LEKTIONEN.length}</small></b><small>{welt?.units[p.unit - 1]}</small></div>
          <div className="adm-card adm-kpi"><span>Level</span><b>{p.level}</b><small>{p.perlen} Perlen gesammelt</small></div>
          <div className="adm-card adm-kpi"><span>Klasse</span><b className="klein">{klasseVon(kid.id).name}</b><small>Tempo und Aufgaben passen sich an</small></div>
          <div className="adm-card adm-kpi"><span>Serie</span><b>{p.streak} <small>Tage</small></b><small>am Stück geübt</small></div>
        </div>

        <div className="eltern-grid">
          <section className="adm-card">
            <div className="adm-card-head"><h2>Heute</h2><span className="adm-muted">Ziel: {TAGESZIEL} Minuten</span></div>
            <div className="eltern-ring" style={{ '--p': `${(minuten / TAGESZIEL) * 100}%` } as CSSProperties}>
              <div><b>{daily.minutes}</b><small>Minuten</small></div>
            </div>
            <div className="eltern-heute">
              <span><b>{daily.tasks}</b> Aufgaben</span><span><b>{daily.stations}</b> Stationen</span><span><b>{daily.games}</b> Denkspiele</span>
            </div>
            {daily.minutes >= TAGESZIEL ? <p className="eltern-ok">Tagesaufgabe geschafft – loben Sie Ihr Kind!</p> : <p className="adm-muted">Eine Lektion am Tag (etwa 15 Minuten) ist genug.</p>}
          </section>

          <section className="adm-card">
            <div className="adm-card-head"><h2>Aktuelle Lektion</h2><span className="adm-muted">{geschafft} von {stationen.length} Stationen</span></div>
            <ol className="eltern-stationen">
              {stationen.map((s) => (
                <li key={s.id} className={s.sterne > 0 ? 'fertig' : s === naechste ? 'jetzt' : ''}>
                  <span className="eltern-st-icon">{s.sterne > 0 ? <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3} /> : null}</span>
                  <span>{s.title}</span>
                  {s.sterne > 0 && <span className="eltern-sterne">{'★'.repeat(s.sterne)}</span>}
                  {s === naechste && <span className="adm-badge warn">als Nächstes</span>}
                </li>
              ))}
            </ol>
          </section>

          <section className="adm-card">
            <div className="adm-card-head"><h2>Hausaufgabe im Buch</h2></div>
            {buch ? (
              <div className="eltern-buch">
                <div><b>Mental Arithmetic Basics Book</b><span>Seite {buch.seite} · Spalte {buch.spalte} · Aufgaben {buch.von}–{buch.bis}</span></div>
                {wb && <div><b>Mental Arithmetic Work Book</b><span>Seite {wb.von}{wb.bis !== wb.von ? `–${wb.bis}` : ''} · alle Aufgaben{wb.freiwillig ? ` · freiwillig Seite ${wb.freiwillig[0]}–${wb.freiwillig[1]}` : ''}</span></div>}
                <p className="adm-muted">Ihr Kind rechnet mit dem Abakus und schreibt die Ergebnisse ins Buch. Schauen Sie gern gemeinsam drüber.</p>
              </div>
            ) : <p className="adm-muted">In dieser Lektion gibt es keine Buch-Aufgabe.</p>}
          </section>

          <section className="adm-card">
            <div className="adm-card-head"><h2>Stärken</h2><span className="adm-muted">aus Übungen und Denkspielen</span></div>
            <div className="adm-balken">
              {BEREICHE.filter((b) => b.id !== 'gesamt').map((b) => (
                <div key={b.id} className="adm-balken-zeile eltern-staerke">
                  <span><b>{b.name}</b><small>{b.text}</small></span>
                  <div className="adm-track"><div style={{ width: `${(werte[b.id] / maxWert) * 100}%` }} /></div>
                  <span className="adm-num">{werte[b.id]}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="adm-card">
          <div className="adm-card-head"><h2>Lernweg · Welt {p.world}: {welt?.name.replace(/-/g, ' ')}</h2></div>
          <div className="eltern-weg">
            {welt?.units.map((name, i) => {
              const u = i + 1
              const st = u < p.unit ? 'fertig' : u === p.unit ? 'jetzt' : ''
              return <div key={u} className={`eltern-weg-punkt ${st}`}><span>{lektionNr(p.world, u)}</span><small>{name}</small></div>
            })}
          </div>
        </section>

        <section className="adm-card eltern-tipps">
          <h2>Tipps für zu Hause</h2>
          <ul>
            <li>Feste Zeit am Tag: lieber kurz und regelmäßig als selten und lang.</li>
            <li>Lassen Sie Ihr Kind am echten Abakus mitrechnen – das macht das Kopfrechnen später leichter.</li>
            <li>Fragen Sie nach dem Trick der Lektion, z. B. „Wie rechnest du plus 9?“ – erklären festigt.</li>
            <li>Loben Sie die Anstrengung, nicht nur das Ergebnis.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
