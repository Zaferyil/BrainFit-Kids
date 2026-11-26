import { PasswortFeld } from '../components/PasswortFeld'
import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { Bericht } from './Bericht'
import { PushKarte } from '../components/PushEinstellungen'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { PanelLayout, type PanelFuss, type PanelPunkt } from '../components/PanelLayout'
import { alleKinder, type Kid } from '../data/demo'
import { SeZaKopf } from '../components/SeZa'
import { adminAbmelden, elternAnmelden, elternKinder, elternPasswortVergessen } from '../lib/adminCloud'
import { WORLDS } from '../data/curriculum'
import { supabase } from '../lib/supabase'
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
        <PasswortFeld value={pw} onChange={(e) => { setPw(e.target.value); setFehler('') }} placeholder="Passwort" aria-label="Passwort" autoComplete="current-password" />
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

type ElternTab = 'uebersicht' | 'lektion' | 'lernweg' | 'buch' | 'staerken' | 'bericht' | 'benachrichtigung' | 'rechnungen' | 'tipps'
const ELTERN_KEY = 'bfk.eltern-tab'

function Dashboard({ kid, onLogout, onWechseln }: { kid: Kid; onLogout: () => void; onWechseln?: () => void }) {
  const [tab, setTabRoh] = useState<ElternTab>(() => { try { return (sessionStorage.getItem(ELTERN_KEY) as ElternTab) || 'uebersicht' } catch { return 'uebersicht' } })
  const setTab = (t: ElternTab) => { setTabRoh(t); try { sessionStorage.setItem(ELTERN_KEY, t) } catch { /* egal */ } }
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

  const punkte: PanelPunkt<ElternTab>[] = [
    { id: 'uebersicht', titel: 'Übersicht', icon: 'chart', gruppe: '', info: `So lernt ${kid.name} gerade – heute und insgesamt.` },
    { id: 'lektion', titel: 'Aktuelle Lektion', icon: 'target', gruppe: 'Lernen', info: `Lektion ${nr}: welche Stationen schon geschafft sind.` },
    { id: 'lernweg', titel: 'Lernweg', icon: 'map', gruppe: 'Lernen', info: `Alle Lektionen in Welt ${p.world}: ${welt?.name ?? ''}.` },
    { id: 'buch', titel: 'Hausaufgabe im Buch', icon: 'book', gruppe: 'Lernen', info: 'Die Aufgaben im Übungsbuch zur aktuellen Lektion.' },
    { id: 'staerken', titel: 'Stärken', icon: 'bars', gruppe: 'Fortschritt', info: 'Aus Übungen und Denkspielen berechnet.' },
    { id: 'bericht', titel: 'Lernbericht', icon: 'medal', gruppe: 'Fortschritt', info: 'Stärken, Entwicklung und Vergleich mit Gleichaltrigen.' },
    { id: 'benachrichtigung', titel: 'Benachrichtigungen', icon: 'bell', gruppe: 'Konto', info: 'Wochenbericht per E-Mail und Erinnerungen auf dem Handy.' },
    { id: 'rechnungen', titel: 'Rechnungen & Abo', icon: 'bag', gruppe: 'Konto', info: 'Rechnungen, Zahlungsdaten und Kündigung.' },
    { id: 'tipps', titel: 'Tipps für zu Hause', icon: 'bulb', gruppe: 'Hilfe', info: 'So unterstützen Sie Ihr Kind beim Üben.' },
  ]
  const fuss: PanelFuss[] = [
    ...(onWechseln ? [{ titel: 'Anderes Kind', icon: 'users' as const, onClick: onWechseln }] : []),
    { titel: 'Zur Website', icon: 'home', href: '/' },
    { titel: 'Abmelden', icon: 'logout', onClick: onLogout },
  ]

  const heute = (
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
  )
  const lektion = (
    <section className="adm-card">
      <div className="adm-card-head"><h2>Lektion {nr} · {welt?.units[p.unit - 1]}</h2><span className="adm-muted">{geschafft} von {stationen.length} Stationen</span></div>
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
  )

  return (
    <PanelLayout<ElternTab> speicherKey="bf-eltern" marke={<Avatar size={30} {...kid.avatar} />} name={kid.name} rolle="Eltern-Bereich"
      punkte={punkte} aktiv={tab} onWahl={setTab} fuss={fuss}
      kopfRechts={<button type="button" className="adm-btn primary" onClick={() => setTab('bericht')}>📊 Lernbericht</button>}>
      {tab === 'uebersicht' && <>
        <div className="adm-kpis">
          <div className="adm-card adm-kpi"><span>Lektion</span><b>{nr} <small>von {ALLE_LEKTIONEN.length}</small></b><small>{welt?.units[p.unit - 1]}</small></div>
          <div className="adm-card adm-kpi"><span>Level</span><b>{p.level}</b><small>{p.perlen} Perlen gesammelt</small></div>
          <div className="adm-card adm-kpi"><span>Klasse</span><b className="klein">{klasseVon(kid.id).name}</b><small>Tempo und Aufgaben passen sich an</small></div>
          <div className="adm-card adm-kpi"><span>Serie</span><b>{p.streak} <small>Tage</small></b><small>am Stück geübt</small></div>
        </div>
        <div className="eltern-grid">{heute}{lektion}</div>
      </>}
      {tab === 'lektion' && lektion}
      {tab === 'lernweg' && (
        <section className="adm-card">
          <div className="adm-card-head"><h2>Welt {p.world}: {welt?.name}</h2></div>
          <div className="eltern-weg">
            {welt?.units.map((name, i) => {
              const u = i + 1
              const st = u < p.unit ? 'fertig' : u === p.unit ? 'jetzt' : ''
              return <div key={u} className={`eltern-weg-punkt ${st}`}><span>{lektionNr(p.world, u)}</span><small>{name}</small></div>
            })}
          </div>
        </section>
      )}
      {tab === 'buch' && (
        <section className="adm-card">
          {buch ? (
            <div className="eltern-buch">
              <div><b>Mental Arithmetic Basics Book</b><span>Seite {buch.seite} · Spalte {buch.spalte} · Aufgaben {buch.von}–{buch.bis}</span></div>
              {wb && <div><b>Mental Arithmetic Work Book</b><span>Seite {wb.von}{wb.bis !== wb.von ? `–${wb.bis}` : ''} · alle Aufgaben{wb.freiwillig ? ` · freiwillig Seite ${wb.freiwillig[0]}–${wb.freiwillig[1]}` : ''}</span></div>}
              <p className="adm-muted">Ihr Kind rechnet mit dem Abakus und schreibt die Ergebnisse ins Buch. Schauen Sie gern gemeinsam drüber.</p>
            </div>
          ) : <p className="adm-muted">In dieser Lektion gibt es keine Buch-Aufgabe.</p>}
        </section>
      )}
      {tab === 'staerken' && (
        <section className="adm-card">
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
      )}
      {tab === 'bericht' && <div className="ber-eingebettet"><Bericht kid={kid} eltern /></div>}
      {tab === 'benachrichtigung' && <><WochenberichtKarte /><PushKarte kidId={kid.id} name={kid.name} /></>}
      {tab === 'rechnungen' && (
        <section className="adm-card eltern-konto">
          <h2>🧾 Rechnungen &amp; Zahlungsdaten</h2>
          <p className="adm-muted">Rechnungen herunterladen, Karte oder Adresse ändern – Anmeldung mit der E-Mail-Adresse vom Kauf.</p>
          <a className="adm-btn primary" href="https://billing.stripe.com/p/login/00w7sMafb8SUa6Z9WX9oc00" target="_blank" rel="noopener">Zum Kundenportal</a>
          <h2>Kündigen</h2>
          <p className="adm-muted">Sie möchten Ihr Abo beenden? <a href="/kuendigen.html">Verträge hier kündigen</a></p>
        </section>
      )}
      {tab === 'tipps' && (
        <section className="adm-card eltern-tipps">
          <ul>
            <li>Feste Zeit am Tag: lieber kurz und regelmäßig als selten und lang.</li>
            <li>Lassen Sie Ihr Kind am echten Abakus mitrechnen – das macht das Kopfrechnen später leichter.</li>
            <li>Fragen Sie nach dem Trick der Lektion, z. B. „Wie rechnest du plus 9?“ – erklären festigt.</li>
            <li>Loben Sie die Anstrengung, nicht nur das Ergebnis.</li>
          </ul>
        </section>
      )}
    </PanelLayout>
  )
}

/** Eltern: Wochenbericht per E-Mail an- oder abbestellen (Tabelle eltern_einstellungen, update-21) */
function WochenberichtKarte() {
  const [uid, setUid] = useState<string | null>(null)
  const [an, setAn] = useState(true)
  const [info, setInfo] = useState('')
  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data }) => {
      const id = data.user?.id; if (!id) return
      setUid(id)
      const { data: e } = await supabase.from('eltern_einstellungen').select('wochenbericht').eq('eltern', id).maybeSingle()
      if (e) setAn(e.wochenbericht)
    })
  }, [])
  if (!uid) return null
  const setzen = async (v: boolean) => {
    setAn(v)
    const { error } = await supabase.from('eltern_einstellungen').upsert({ eltern: uid, wochenbericht: v, geaendert: new Date().toISOString() })
    setInfo(error ? 'Speichern hat nicht geklappt.' : v ? 'Sie bekommen jeden Sonntag den Wochenbericht.' : 'Wochenbericht abbestellt.')
  }
  return (
    <section className="adm-card">
      <div className="adm-card-head"><h2>📧 Wochenbericht per E-Mail</h2></div>
      <label className="eltern-schalter"><input type="checkbox" checked={an} onChange={(e) => void setzen(e.target.checked)} /> Jeden Sonntag eine kurze Zusammenfassung der Lernwoche (Lernzeit, Lerntage, geschaffte Lektionen)</label>
      {info && <p className="adm-muted">{info}</p>}
    </section>
  )
}
