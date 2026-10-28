import { useState, type CSSProperties, type FormEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { findClass, type Kid } from '../data/demo'
import { WORLDS } from '../data/curriculum'
import { STATIONS } from '../data/units'
import { buchAuftrag, workbookAuftrag } from '../data/buch'
import { getProgress, stationSkipped, stationStars } from '../lib/progress'
import { getDaily } from '../lib/daily'
import { klasseVon } from '../lib/klasse'
import { lektionNr, ALLE_LEKTIONEN } from '../lib/admin'
import { BEREICHE, echteWerte } from '../lib/rangliste'

// Eltern-Bereich: Lernstand des eigenen Kindes, Hausaufgabe im Buch, Tipps für zu Hause.
// Anmeldung mit Klassen-Code und Kind (bis Supabase ein eigenes Eltern-Konto bringt).

const KEY = 'bfk.eltern'
const TAGESZIEL = 15

type Auswahl = { code: string; kidId: string }
const gespeichert = (): Auswahl | null => { try { return JSON.parse(sessionStorage.getItem(KEY) ?? 'null') } catch { return null } }

export function Eltern() {
  const [auswahl, setAuswahl] = useState<Auswahl | null>(gespeichert)
  const kid = auswahl ? findClass(auswahl.code)?.kids.find((k) => k.id === auswahl.kidId) : undefined
  const abmelden = () => { try { sessionStorage.removeItem(KEY) } catch { /* egal */ } setAuswahl(null) }
  if (!auswahl || !kid) return <Login onOk={(a) => { try { sessionStorage.setItem(KEY, JSON.stringify(a)) } catch { /* egal */ } setAuswahl(a) }} />
  return <Dashboard kid={kid} onLogout={abmelden} />
}

function Login({ onOk }: { onOk: (a: Auswahl) => void }) {
  const [code, setCode] = useState('')
  const [fehler, setFehler] = useState(false)
  const klasse = findClass(code)
  const pruefen = (e: FormEvent) => { e.preventDefault(); if (!klasse) setFehler(true) }
  return (
    <div className="adm adm-login">
      <div className="adm-card adm-login-card eltern-login">
        <div className="adm-logo"><Icon name="users" size={30} color="#5B47D6" /></div>
        <h1>Eltern-Bereich</h1>
        {!klasse ? (
          <form onSubmit={pruefen} className="eltern-form">
            <p>Geben Sie den Klassen-Code Ihres Kindes ein. Sie finden ihn im Brief der Lehrkraft.</p>
            <input value={code} onChange={(e) => { setCode(e.target.value); setFehler(false) }} placeholder="z. B. LINZ-7K" aria-label="Klassen-Code" autoFocus />
            {fehler && <div className="adm-fehler">Diesen Code gibt es nicht.</div>}
            <button type="submit" className="adm-btn primary">Weiter</button>
          </form>
        ) : (
          <>
            <p>Wählen Sie Ihr Kind aus.</p>
            <div className="eltern-kinder">
              {klasse.kids.map((k) => (
                <button key={k.id} type="button" onClick={() => onOk({ code: klasse.code, kidId: k.id })}>
                  <Avatar size={52} {...k.avatar} /><span>{k.name}</span>
                </button>
              ))}
            </div>
            <button type="button" className="adm-link" onClick={() => setCode('')}>Anderer Code</button>
          </>
        )}
        <a href="#/" className="adm-link">Zurück zur App</a>
      </div>
    </div>
  )
}

function Dashboard({ kid, onLogout }: { kid: Kid; onLogout: () => void }) {
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
          <a href="#/" className="adm-btn">Zur App</a>
          <button type="button" className="adm-btn" onClick={onLogout}><Icon name="logout" size={16} color="currentColor" /> Abmelden</button>
        </div>
      </header>
      <main className="adm-main">
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
