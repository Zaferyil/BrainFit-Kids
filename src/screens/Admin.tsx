import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon, type IconName } from '../components/Icon'
import { KLASSEN } from '../lib/klasse'
import { ALLE_LEKTIONEN, archivieren, archivierteKinder, inhaltStatus, kidZeilen, klasseAnlegen, klasseWechseln, klassenCodes, lektionNr, resetKid, setLektion, setStufe, wiederherstellen, type KidZeile } from '../lib/admin'
import { benutzerVon, passwortVon } from '../data/demo'
import { ALLES_OFFEN, setTestmodus } from '../lib/testmodus'
import { adminAbmelden, adminAnmelden, adminSitzung, alleKinderLaden, archivCloud, kindAnlegenCloud, klasseCloud, korrigierenCloud, stufeCloud } from '../lib/adminCloud'
import { istCloudKind } from '../lib/serverRpc'
import { alleArtikel, BELOHNUNG_NAME, belohnungsWert, konto, korrigieren, shopEinstellungen, speichereShopEinstellungen, type BelohnungsArt } from '../lib/wirtschaft'
import { SLOT_NAME, type Slot, type Waehrung } from '../data/seza'
import { fotoVerkleinern } from '../lib/hausaufgaben'
import { getProgress } from '../lib/progress'
import { alleHausaufgaben, lehrkraftEntscheidet, setWorkbookLoesung, STATUS_TEXT, workbookLoesungen, type Hausaufgabe } from '../lib/hausaufgaben'

// Admin-Bereich für Lehrkraft und Schule: Kinder, Lektionen, Einstellungen.
// Bis Supabase angebunden ist, zeigt er die Daten auf diesem Gerät.


type Tab = 'uebersicht' | 'kinder' | 'hausaufgaben' | 'shop' | 'lektionen' | 'einstellungen'
const TABS: { id: Tab; titel: string; icon: IconName }[] = [
  { id: 'uebersicht', titel: 'Übersicht', icon: 'chart' },
  { id: 'kinder', titel: 'Kinder', icon: 'users' },
  { id: 'hausaufgaben', titel: 'Hausaufgaben', icon: 'check' },
  { id: 'shop', titel: 'SeZa-Shop', icon: 'shirt' },
  { id: 'lektionen', titel: 'Lektionen', icon: 'book' },
  { id: 'einstellungen', titel: 'Einstellungen', icon: 'settings' },
]

// Anmeldung mit E-Mail und Passwort (Supabase); nur Konten mit der Rolle Admin oder Lehrkraft
export function Admin() {
  const [status, setStatus] = useState<'pruefen' | 'aus' | 'laden' | 'an'>('pruefen')
  const [fehler, setFehler] = useState('')
  const laden = async () => {
    setStatus('laden')
    try { await alleKinderLaden(); setStatus('an') } catch (e) { setFehler(String((e as Error).message)); setStatus('an') }
  }
  useEffect(() => { void adminSitzung().then((r) => (r ? laden() : setStatus('aus'))) }, [])
  if (status === 'pruefen' || status === 'laden') return <div className="adm adm-login"><div className="adm-card adm-login-card"><p>{status === 'laden' ? 'Daten werden geladen …' : 'Einen Moment …'}</p></div></div>
  if (status === 'aus') return <AdminLogin onOk={() => void laden()} />
  return <Dashboard hinweis={fehler} onLogout={() => { void adminAbmelden().then(() => setStatus('aus')) }} />
}

function AdminLogin({ onOk }: { onOk: () => void }) {
  const [mail, setMail] = useState('')
  const [pw, setPw] = useState('')
  const [fehler, setFehler] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const pruefen = async (e: FormEvent) => {
    e.preventDefault(); setLaeuft(true)
    const r = await adminAnmelden(mail, pw).catch(() => 'falsch' as const)
    setLaeuft(false)
    if (r === 'admin' || r === 'lehrkraft') onOk()
    else setFehler(r === 'keine-rolle' ? 'Dieses Konto hat keinen Zugang zum Admin-Bereich.' : 'E-Mail oder Passwort ist falsch.')
  }
  return (
    <div className="adm adm-login">
      <form className="adm-card adm-login-card" onSubmit={(e) => void pruefen(e)}>
        <img className="app-logo" src={`${import.meta.env.BASE_URL}logo.webp`} alt="BrainFit Kids" />
        <h1>Lehrkraft &amp; Admin</h1>
        <p>Mit E-Mail und Passwort anmelden.</p>
        <input type="email" autoFocus value={mail} onChange={(e) => { setMail(e.target.value); setFehler('') }} aria-label="E-Mail" placeholder="E-Mail" autoComplete="username" />
        <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setFehler('') }} aria-label="Passwort" placeholder="Passwort" autoComplete="current-password" />
        {fehler && <div className="adm-fehler">{fehler}</div>}
        <button type="submit" className="adm-btn primary" disabled={laeuft || !mail || !pw}>{laeuft ? 'Anmelden …' : 'Anmelden'}</button>
        <a href="../index.html" className="adm-link">Zurück zur Website</a>
      </form>
    </div>
  )
}

function Dashboard({ onLogout, hinweis }: { onLogout: () => void; hinweis?: string }) {
  const [tab, setTab] = useState<Tab>('uebersicht')
  const [version, setVersion] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const zeilen = useMemo(() => kidZeilen(), [version])
  const neu = () => setVersion((v) => v + 1)

  return (
    <div className="adm">
      <header className="adm-head">
        <div className="adm-brand"><span className="adm-logo small"><Icon name="chart" size={20} color="#5B47D6" /></span><b>BrainFit Kids</b><span>Admin</span></div>
        <nav className="adm-tabs" aria-label="Bereiche">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={18} color="currentColor" /> {t.titel}
            </button>
          ))}
        </nav>
        <div className="adm-head-r">
          {ALLES_OFFEN && <span className="adm-badge warn">Testmodus an</span>}
          <a href="#/" className="adm-btn">Zur App</a>
          <button type="button" className="adm-btn" onClick={onLogout}><Icon name="logout" size={16} color="currentColor" /> Abmelden</button>
        </div>
      </header>
      <main className="adm-main">
        <div className="adm-hinweis"><Icon name="alert" size={18} color="#8A5A00" /> {hinweis ? `Daten konnten nicht vollständig geladen werden: ${hinweis}` : 'Daten aus der Datenbank. Beispielkinder (Lena, Jonas …) gibt es nur auf diesem Gerät.'}</div>
        {tab === 'uebersicht' && <Uebersicht zeilen={zeilen} onKind={() => setTab('kinder')} />}
        {tab === 'kinder' && <Kinder zeilen={zeilen} onChange={neu} />}
        {tab === 'hausaufgaben' && <Hausaufgaben zeilen={zeilen} />}
        {tab === 'shop' && <Shop zeilen={zeilen} />}
        {tab === 'lektionen' && <Lektionen zeilen={zeilen} />}
        {tab === 'einstellungen' && <Einstellungen />}
      </main>
    </div>
  )
}

function Kpi({ titel, wert, sub }: { titel: string; wert: string | number; sub?: string }) {
  return <div className="adm-card adm-kpi"><span>{titel}</span><b>{wert}</b>{sub && <small>{sub}</small>}</div>
}

function Uebersicht({ zeilen, onKind }: { zeilen: KidZeile[]; onKind: () => void }) {
  const aktiv = zeilen.filter((z) => z.heute.minuten + z.heute.aufgaben + z.heute.spiele > 0).length
  const schnitt = zeilen.length ? (zeilen.reduce((a, z) => a + z.lektion, 0) / zeilen.length).toFixed(1) : '–'
  const status = inhaltStatus()
  const fertig = status.filter((s) => s.zellen.every((z) => z.status === 'fertig')).length
  const max = ALLE_LEKTIONEN.length
  const sortiert = [...zeilen].sort((a, b) => b.lektion - a.lektion || b.progress.perlen - a.progress.perlen)
  return (
    <>
      <div className="adm-kpis">
        <Kpi titel="Kinder" wert={zeilen.length} sub={`in ${new Set(zeilen.map((z) => z.klassenCode)).size} Klassen`} />
        <Kpi titel="Heute aktiv" wert={aktiv} sub={`von ${zeilen.length}`} />
        <Kpi titel="Ø Lektion" wert={schnitt} sub={`von ${max}`} />
        <Kpi titel="Lektionen fertig" wert={`${fertig} / ${max}`} sub="alle Inhalte vorhanden" />
      </div>
      <section className="adm-card">
        <div className="adm-card-head"><h2>Lernstand der Klasse</h2><button type="button" className="adm-link" onClick={onKind}>Alle Kinder</button></div>
        <div className="adm-balken">
          {sortiert.map((z) => (
            <div key={z.kid.id} className="adm-balken-zeile">
              <span className="adm-kind"><Avatar size={28} {...z.kid.avatar} />{z.kid.name}</span>
              <div className="adm-track"><div style={{ width: `${(z.geschafft / max) * 100}%` }} /></div>
              <span className="adm-num">L{z.lektion}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function Kinder({ zeilen, onChange }: { zeilen: KidZeile[]; onChange: () => void }) {
  const [offen, setOffen] = useState<string | null>(null)
  const [filter, setFilter] = useState('alle')
  const codes = klassenCodes()
  const sichtbar = filter === 'alle' ? zeilen : zeilen.filter((z) => z.klassenCode === filter)
  const archiv = archivierteKinder()
  return (
    <>
      <NeuesKind codes={codes} onChange={onChange} />
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Kinder</h2>
          <label className="adm-filter">Klasse
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="alle">Alle Klassen</option>
              {codes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <span className="adm-muted">{sichtbar.length} Kinder</span>
        </div>
        <table className="adm-tabelle">
          <thead>
            <tr><th>Kind</th><th>Login</th><th>Klasse</th><th>Schulstufe</th><th>Lektion</th><th>Level</th><th>Perlen</th><th>Sterne</th><th>Heute</th><th /></tr>
          </thead>
          <tbody>
            {sichtbar.map((z) => (
              <Fragment key={z.kid.id}>
                <tr>
                  <td><span className="adm-kind"><Avatar size={32} {...z.kid.avatar} /><span><b>{z.kid.name}</b><small>{z.eingestuft ? 'eingestuft' : 'noch nicht eingestuft'}</small></span></span></td>
                  <td><small className="adm-login">{benutzerVon(z.kid)}<br />{istCloudKind(z.kid.id) ? <i title="Passwort ist verschlüsselt gespeichert">••••••</i> : passwortVon(z.kid)}</small></td>
                  <td><span className="adm-badge">{z.klassenCode}</span></td>
                  <td>{z.stufeName}</td>
                  <td><b>L{z.lektion}</b> <small>{z.lektionName}</small></td>
                  <td>{z.progress.level}</td>
                  <td>{z.progress.perlen}</td>
                  <td>{z.sterne}</td>
                  <td><small>{z.heute.minuten} Min · {z.heute.aufgaben} Aufg. · {z.heute.spiele} Spiele</small></td>
                  <td><button type="button" className="adm-btn" onClick={() => setOffen(offen === z.kid.id ? null : z.kid.id)}>{offen === z.kid.id ? 'Schließen' : 'Bearbeiten'}</button></td>
                </tr>
                {offen === z.kid.id && (
                  <tr className="adm-edit"><td colSpan={10}><KindBearbeiten z={z} codes={codes} onChange={() => { onChange() }} onWeg={() => { setOffen(null); onChange() }} /></td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>
      <section className="adm-card">
        <div className="adm-card-head"><h2>Archiv</h2><span className="adm-muted">{archiv.length} Kinder</span></div>
        {archiv.length === 0 ? <p className="adm-muted">Keine archivierten Kinder. Archivierte Kinder können sich nicht anmelden; ihr Fortschritt bleibt gespeichert.</p> : (
          <div className="adm-archiv">
            {archiv.map(({ kid, klasse }) => (
              <div key={kid.id} className="adm-archiv-zeile">
                <span className="adm-kind"><Avatar size={28} {...kid.avatar} /><span><b>{kid.name}</b><small>{klasse}</small></span></span>
                <button type="button" className="adm-btn" onClick={() => { wiederherstellen(kid.id); void archivCloud(kid.id, false); onChange() }}>Wiederherstellen</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function NeuesKind({ codes, onChange }: { codes: string[]; onChange: () => void }) {
  const [name, setName] = useState('')
  const [klasse, setKlasse] = useState(codes[0] ?? '')
  const [neu, setNeu] = useState<{ name: string; benutzer: string; passwort: string } | null>(null)
  const [code, setCode] = useState('')
  const [meldung, setMeldung] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const hinzu = async (e: FormEvent) => {
    e.preventDefault(); setLaeuft(true); setMeldung('')
    try {
      const k = await kindAnlegenCloud(name.trim(), klasse)
      setNeu({ name: name.trim(), benutzer: k.benutzer, passwort: k.passwort }); setName(''); onChange()
    } catch (x) { setMeldung(`Kind konnte nicht angelegt werden: ${(x as Error).message}`) }
    setLaeuft(false)
  }
  const klasseNeu = (e: FormEvent) => {
    e.preventDefault()
    const c = klasseAnlegen(code)
    setMeldung(c ? `Klasse ${c} angelegt.` : 'Diesen Klassen-Code gibt es schon oder er ist leer.')
    if (c) { setCode(''); setKlasse(c); onChange() }
  }
  return (
    <section className="adm-card adm-neu">
      <form className="adm-neu-form" onSubmit={(e) => void hinzu(e)}>
        <h2>Kind hinzufügen</h2>
        <p className="adm-muted">Nur den Vornamen. Benutzername und Passwort vergibt das System (z. B. „lena2“ · „stern47“).</p>
        <div className="adm-neu-reihe">
          <label>Vorname<input id="adm-vorname" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Sara" autoComplete="off" maxLength={24} /></label>
          <label>Klasse<select id="adm-neu-klasse" value={klasse} onChange={(e) => setKlasse(e.target.value)}>{codes.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
          <button type="submit" className="adm-btn primary" disabled={laeuft || !name.trim()}>{laeuft ? 'Wird angelegt …' : 'Hinzufügen'}</button>
        </div>
        {neu && (
          <div className="adm-erfolg">
            <div><b>{neu.name}</b> ist angelegt. Bitte die Zugangsdaten notieren – das Passwort wird nur jetzt angezeigt.
              <span className="adm-zugang">Benutzername: <b>{neu.benutzer}</b> · Passwort: <b>{neu.passwort}</b></span>
            </div>
          </div>
        )}
      </form>
      <form className="adm-neu-form" onSubmit={klasseNeu}>
        <h2>Neue Klasse</h2>
        <p className="adm-muted">Mit diesem Code melden sich die Kinder an.</p>
        <div className="adm-neu-reihe">
          <label>Klassen-Code<input id="adm-code" value={code} onChange={(e) => { setCode(e.target.value); setMeldung('') }} placeholder="z. B. WIEN-3A" autoComplete="off" maxLength={12} /></label>
          <button type="submit" className="adm-btn primary" disabled={!code.trim()}>Anlegen</button>
        </div>
        {meldung && <div className="adm-muted">{meldung}</div>}
      </form>
    </section>
  )
}

function KindBearbeiten({ z, codes, onChange, onWeg }: { z: KidZeile; codes: string[]; onChange: () => void; onWeg: () => void }) {
  const [frage, setFrage] = useState(false)
  const [lekt, setLekt] = useState(`${z.progress.world}-${z.progress.unit}`)
  return (
    <div className="adm-edit-box">
      <label>Schulstufe
        <select value={z.stufe ?? 2} onChange={(e) => { setStufe(z.kid.id, Number(e.target.value)); void stufeCloud(z.kid.id, Number(e.target.value)); onChange() }}>
          {KLASSEN.map((k, i) => <option key={k.name} value={i}>{k.name}</option>)}
        </select>
      </label>
      <label>Klasse
        <select value={z.klassenCode} onChange={(e) => { klasseWechseln(z.kid.id, e.target.value); void klasseCloud(z.kid.id, e.target.value); onChange() }}>
          {codes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Lektion setzen
        <select value={lekt} onChange={(e) => setLekt(e.target.value)}>
          {ALLE_LEKTIONEN.map((l) => <option key={l.nr} value={`${l.world}-${l.unit}`}>L{l.nr} · {l.name}</option>)}
        </select>
      </label>
      <button type="button" className="adm-btn primary" onClick={() => { const [w, u] = lekt.split('-').map(Number); setLektion(z.kid.id, w, u); onChange() }}>Übernehmen</button>
      <button type="button" className="adm-btn danger" onClick={() => { if (window.confirm(`Fortschritt von ${z.kid.name} wirklich zurücksetzen? Klasse und Einstufung bleiben.`)) { resetKid(z.kid.id); onChange() } }}>Fortschritt zurücksetzen</button>
      {frage ? (
        <span className="adm-frage">{z.kid.name} archivieren?
          <button type="button" className="adm-btn danger" onClick={() => { archivieren(z.kid.id); void archivCloud(z.kid.id, true); onWeg() }}>Ja, archivieren</button>
          <button type="button" className="adm-btn" onClick={() => setFrage(false)}>Abbrechen</button>
        </span>
      ) : <button type="button" className="adm-btn" onClick={() => setFrage(true)}><Icon name="archive" size={16} color="currentColor" /> Archivieren</button>}
    </div>
  )
}

function Lektionen({ zeilen }: { zeilen: KidZeile[] }) {
  const status = inhaltStatus()
  const titel = status[0].zellen.map((z) => z.titel)
  return (
    <section className="adm-card adm-tabelle-wrap">
      <div className="adm-card-head"><h2>Lektionen und Inhalte</h2>
        <span className="adm-legende"><i className="fertig" /> fertig <i className="teil" /> vorläufig <i className="fehlt" /> fehlt</span>
      </div>
      <table className="adm-tabelle adm-matrix">
        <thead><tr><th>Lektion</th>{titel.map((t) => <th key={t}>{t}</th>)}<th>Kinder hier</th></tr></thead>
        <tbody>
          {status.map((s) => (
            <tr key={s.nr} className={s.unit === 1 ? 'welt-start' : ''}>
              <td><b>L{s.nr}</b> <small>Welt {s.world} · {s.name}</small></td>
              {s.zellen.map((c) => <td key={c.titel}><span className={`adm-dot ${c.status}`} title={c.info} /> <small>{c.info}</small></td>)}
              <td>{zeilen.filter((z) => z.lektion === s.nr).map((z) => z.kid.name).join(', ') || <small className="adm-muted">–</small>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function Einstellungen() {
  return (
    <section className="adm-card adm-settings">
      <h2>Einstellungen</h2>
      <div className="adm-setting">
        <div>
          <b>Testmodus</b>
          <p>An: Alle Lektionen und Stationen sind offen. Aus: Schloss-System – jede Lektion öffnet sich erst, wenn die vorherige geschafft ist.</p>
        </div>
        <button type="button" className={ALLES_OFFEN ? 'adm-switch on' : 'adm-switch'} role="switch" aria-checked={ALLES_OFFEN}
          onClick={() => { setTestmodus(!ALLES_OFFEN); window.location.reload() }}>
          <span />
        </button>
      </div>
      <div className="adm-setting">
        <div>
          <b>Anmeldung</b>
          <p>Admins und Lehrkräfte melden sich mit E-Mail und Passwort an. Neue Konten legen Sie in Supabase unter Authentication → Users an und geben ihnen dort die Rolle.</p>
        </div>
      </div>
    </section>
  )
}

const datum = (iso?: string) => iso ? new Date(iso).toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'

/** Hausaufgaben aller Kinder: Status, Wissenscheck, Foto; bestätigen oder zum Wiederholen zurückgeben */
function Hausaufgaben({ zeilen }: { zeilen: KidZeile[] }) {
  const [, neu] = useState(0)
  const [foto, setFoto] = useState<string | null>(null)
  const [filter, setFilter] = useState<'alle' | Hausaufgabe['status']>('alle')
  const liste = zeilen.flatMap((z) => Object.values(alleHausaufgaben(z.kid.id)).map((h) => ({ z, h })))
    .filter(({ h }) => filter === 'alle' || h.status === filter)
    .sort((a, b) => (b.h.datum ?? '').localeCompare(a.h.datum ?? ''))
  const entscheiden = (kidId: string, key: string, e: 'lehrkraft' | 'wiederholen') => { lehrkraftEntscheidet(kidId, key, e); neu((x) => x + 1) }
  return (
    <>
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Hausaufgaben</h2>
          <label className="adm-filter">Status
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="alle">Alle</option>
              {(Object.keys(STATUS_TEXT) as Hausaufgabe['status'][]).map((s) => <option key={s} value={s}>{STATUS_TEXT[s]}</option>)}
            </select>
          </label>
          <span className="adm-muted">{liste.length} Einträge</span>
        </div>
        <p className="adm-muted">„Wissenscheck bestanden“ heißt: 3 zufällige Aufgaben aus dem Buch und die Abakus-Frage waren richtig. Das zeigt, dass das Kind gerechnet hat – es beweist nicht jede einzelne Aufgabe.</p>
        <table className="adm-tabelle">
          <thead><tr><th>Kind</th><th>Lektion</th><th>Buch 1 · Basics Book</th><th>Buch 2 · Work Book</th><th>Status</th><th>Geprüft</th><th>Richtig / Falsch</th><th>Datum</th><th>Foto</th><th /></tr></thead>
          <tbody>
            {liste.map(({ z, h }) => (
              <tr key={z.kid.id + h.key}>
                <td><span className="adm-kind"><Avatar size={32} {...z.kid.avatar} /><b>{z.kid.name}</b></span></td>
                <td><b>L{lektionNr(h.world, h.unit)}</b>{h.runde ? <small> · Wiederholung</small> : null}</td>
                <td><small>Seite {h.buch1.seite} · Spalte {h.buch1.spalte} · Aufgaben {h.buch1.von}–{h.buch1.bis}</small></td>
                <td><small>{h.buch2 ? `Seite ${h.buch2.von}${h.buch2.bis !== h.buch2.von ? `–${h.buch2.bis}` : ''} · alle${h.buch2.freiwillig ? ` (freiwillig ${h.buch2.freiwillig[0]}–${h.buch2.freiwillig[1]})` : ''}` : '–'}</small></td>
                <td><span className={`adm-badge ha-${h.status}`}>{STATUS_TEXT[h.status]}</span></td>
                <td>{h.geprueft ? `${h.geprueft} Aufg.${h.soroban !== undefined ? ' + Abakus' : ''}` : '–'}{h.versuche > 1 ? <small> · {h.versuche} Versuche</small> : null}</td>
                <td>{h.geprueft ? <><b className="gut">{h.richtig}</b> / <b className="schlecht">{h.falsch}</b>{h.soroban === false ? <small> · Abakus falsch</small> : null}</> : '–'}</td>
                <td><small>{datum(h.datum)}</small></td>
                <td>{h.foto ? <button type="button" className="adm-foto" onClick={() => setFoto(h.foto ?? null)}><img src={h.foto} alt={`Foto von ${z.kid.name}`} /></button> : <small className="adm-muted">–</small>}</td>
                <td className="adm-aktionen">
                  {h.status !== 'lehrkraft' && <button type="button" className="adm-btn primary" onClick={() => entscheiden(z.kid.id, h.key, 'lehrkraft')}>Bestätigen</button>}
                  {h.status !== 'wiederholen' && <button type="button" className="adm-btn" onClick={() => entscheiden(z.kid.id, h.key, 'wiederholen')}>Wiederholen</button>}
                </td>
              </tr>
            ))}
            {!liste.length && <tr><td colSpan={10} className="adm-muted">Noch keine Hausaufgaben.</td></tr>}
          </tbody>
        </table>
      </section>
      <WorkbookLoesungen />
      {foto && (
        <div className="adm-foto-gross" role="dialog" aria-label="Foto" onClick={() => setFoto(null)}>
          <img src={foto} alt="Foto der Buchseite" />
          <button type="button" className="adm-btn">Schließen</button>
        </div>
      )}
    </>
  )
}

/** Lösungen fürs Work Book eintragen: nur diese Aufgaben kommen im Wissenscheck vor */
function WorkbookLoesungen() {
  const [, neu] = useState(0)
  const [seite, setSeite] = useState('')
  const [nr, setNr] = useState('')
  const [antwort, setAntwort] = useState('')
  const alle = workbookLoesungen()
  const eintraege = Object.entries(alle).flatMap(([s, a]) => Object.entries(a).map(([n, w]) => ({ s: Number(s), n: Number(n), w }))).sort((a, b) => a.s - b.s || a.n - b.n)
  const hinzufuegen = (e: FormEvent) => {
    e.preventDefault()
    if (!seite || !nr || antwort === '') return
    setWorkbookLoesung(Number(seite), Number(nr), Number(antwort)); setNr(''); setAntwort(''); neu((x) => x + 1)
  }
  return (
    <section className="adm-card">
      <div className="adm-card-head"><h2>Lösungen Work Book (Buch 2)</h2><span className="adm-muted">{eintraege.length} Aufgaben</span></div>
      <p className="adm-muted">Die Lösungen fürs Basics Book (Buch 1) sind schon hinterlegt. Fürs Work Book fehlen sie noch: Tragen Sie hier geprüfte Lösungen ein, dann fragt der Wissenscheck auch Aufgaben aus Buch 2.</p>
      <form className="adm-form-zeile" onSubmit={hinzufuegen}>
        <label>Seite<input type="number" min={1} value={seite} onChange={(e) => setSeite(e.target.value)} /></label>
        <label>Aufgabe<input type="number" min={1} value={nr} onChange={(e) => setNr(e.target.value)} /></label>
        <label>Lösung<input type="number" value={antwort} onChange={(e) => setAntwort(e.target.value)} /></label>
        <button type="submit" className="adm-btn primary">Hinzufügen</button>
      </form>
      {!!eintraege.length && (
        <ul className="adm-loesungen">
          {eintraege.map(({ s, n, w }) => (
            <li key={`${s}-${n}`}>Seite {s} · Aufgabe {n} = <b>{w}</b>
              <button type="button" className="adm-btn" onClick={() => { setWorkbookLoesung(s, n, null); neu((x) => x + 1) }}>Entfernen</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** SeZa-Shop: Preise, Artikel an/aus, eigene Artikel, Belohnungen, Käufe und Guthaben */
function Shop({ zeilen }: { zeilen: KidZeile[] }) {
  const [, neu] = useState(0)
  const e = shopEinstellungen()
  const setzeArtikel = (id: string, w: { preis?: number; aktiv?: boolean }) => { speichereShopEinstellungen({ ...e, artikel: { ...e.artikel, [id]: { ...e.artikel[id], ...w } } }); neu((x) => x + 1) }
  const setzeBelohnung = (art: BelohnungsArt, w: { sterne: number; diamanten: number }) => { speichereShopEinstellungen({ ...e, belohnungen: { ...e.belohnungen, [art]: w } }); neu((x) => x + 1) }
  const kaeufe = zeilen.flatMap((z) => konto(z.kid.id).buchungen.filter((b) => b.art !== 'belohnung').map((b) => ({ z, b }))).sort((a, b) => b.b.zeit.localeCompare(a.b.zeit))
  return (
    <>
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Artikel</h2><span className="adm-muted">{alleArtikel(true).length} Artikel</span></div>
        <table className="adm-tabelle">
          <thead><tr><th>Artikel</th><th>Bereich</th><th>Preis</th><th>Währung</th><th>Aktiv</th></tr></thead>
          <tbody>
            {alleArtikel(true).map((a) => (
              <tr key={a.id}>
                <td><span className="adm-kind">{a.bild ? <img src={a.bild} alt="" className="adm-artikel-bild" /> : <span className="adm-artikel-bild">✨</span>}<b>{a.name}</b>{a.eigen ? <small> · eigener Artikel</small> : null}</span></td>
                <td>{SLOT_NAME[a.slot]}</td>
                <td><input className="adm-zahl" type="number" min={0} defaultValue={a.preis} disabled={a.id === 'original'} onBlur={(x) => setzeArtikel(a.id, { preis: Math.max(0, Number(x.target.value) || 0) })} /></td>
                <td>{a.waehrung === 'sterne' ? '⭐ Sterne' : '💎 Diamanten'}</td>
                <td><input type="checkbox" checked={a.aktiv !== false} disabled={a.id === 'original'} onChange={(x) => setzeArtikel(a.id, { aktiv: x.target.checked })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <NeuerArtikel onNeu={() => neu((x) => x + 1)} />
      </section>
      <section className="adm-card">
        <div className="adm-card-head"><h2>Belohnungen</h2></div>
        <p className="adm-muted">Jede Belohnung gibt es je Aufgabe nur einmal (Übung je Lektion und Station, Lektion und Test je Lektion, Spiel 1 × am Tag).</p>
        <div className="adm-belohnungen">
          {(Object.keys(BELOHNUNG_NAME) as BelohnungsArt[]).map((art) => { const w = belohnungsWert(art); return (
            <label key={art}><span>{BELOHNUNG_NAME[art]}</span>
              <span>⭐ <input className="adm-zahl" type="number" min={0} defaultValue={w.sterne} onBlur={(x) => setzeBelohnung(art, { ...w, sterne: Math.max(0, Number(x.target.value) || 0) })} /></span>
              <span>💎 <input className="adm-zahl" type="number" min={0} defaultValue={w.diamanten} onBlur={(x) => setzeBelohnung(art, { ...w, diamanten: Math.max(0, Number(x.target.value) || 0) })} /></span>
            </label>) })}
        </div>
      </section>
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Guthaben der Kinder</h2></div>
        <table className="adm-tabelle">
          <thead><tr><th>Kind</th><th>Sterne</th><th>Diamanten</th><th>Besitz</th><th>Korrektur (mit Grund)</th></tr></thead>
          <tbody>{zeilen.map((z) => <GuthabenZeile key={z.kid.id} z={z} onNeu={() => neu((x) => x + 1)} />)}</tbody>
        </table>
      </section>
      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Käufe und Korrekturen</h2><span className="adm-muted">{kaeufe.length}</span></div>
        <table className="adm-tabelle">
          <thead><tr><th>Datum</th><th>Kind</th><th>Was</th><th>Sterne</th><th>Diamanten</th></tr></thead>
          <tbody>
            {kaeufe.map(({ z, b }) => <tr key={z.kid.id + b.id}><td><small>{datum(b.zeit)}</small></td><td>{z.kid.name}</td><td>{b.art === 'kauf' ? `Kauf: ${b.grund}` : `Korrektur: ${b.grund}`}</td><td>{b.sterne || '–'}</td><td>{b.diamanten || '–'}</td></tr>)}
            {!kaeufe.length && <tr><td colSpan={5} className="adm-muted">Noch keine Käufe.</td></tr>}
          </tbody>
        </table>
      </section>
    </>
  )
}

function GuthabenZeile({ z, onNeu }: { z: KidZeile; onNeu: () => void }) {
  const [st, setSt] = useState('')
  const [di, setDi] = useState('')
  const [grund, setGrund] = useState('')
  const k = konto(z.kid.id)
  return (
    <tr>
      <td><b>{z.kid.name}</b></td><td>{k.sterne}</td><td>{getProgress(z.kid.id).gems}</td><td><small>{k.besitz.length} Artikel</small></td>
      <td><form className="adm-form-zeile klein" onSubmit={(e) => { e.preventDefault(); if (!grund.trim() || (!Number(st) && !Number(di))) return; const ks = Number(st) || 0, kd = Number(di) || 0, g = grund.trim(); if (istCloudKind(z.kid.id)) void korrigierenCloud(z.kid.id, ks, kd, g).then(onNeu); else korrigieren(z.kid.id, ks, kd, g); setSt(''); setDi(''); setGrund(''); onNeu() }}>
        <input type="number" placeholder="± ⭐" value={st} onChange={(e) => setSt(e.target.value)} aria-label="Sterne ändern" />
        <input type="number" placeholder="± 💎" value={di} onChange={(e) => setDi(e.target.value)} aria-label="Diamanten ändern" />
        <input type="text" placeholder="Grund" value={grund} onChange={(e) => setGrund(e.target.value)} aria-label="Grund" />
        <button type="submit" className="adm-btn">Buchen</button>
      </form></td>
    </tr>
  )
}

/** Eigener Artikel: Bild hochladen (transparentes PNG empfohlen), Bereich, Preis */
function NeuerArtikel({ onNeu }: { onNeu: () => void }) {
  const [name, setName] = useState('')
  const [slot, setSlot] = useState<Slot>('begleiter')
  const [preis, setPreis] = useState('100')
  const [waehrung, setWaehrung] = useState<Waehrung>('sterne')
  const [bild, setBild] = useState<string | null>(null)
  const anlegen = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !bild) return
    const cfg = shopEinstellungen()
    speichereShopEinstellungen({ ...cfg, eigene: [...cfg.eigene, { id: `eigen-${Date.now().toString(36)}`, name: name.trim(), slot, preis: Number(preis) || 0, waehrung, bild, eigen: true }] })
    setName(''); setBild(null); onNeu()
  }
  return (
    <form className="adm-form-zeile" onSubmit={anlegen}>
      <label>Neuer Artikel<input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ width: 160 }} /></label>
      <label>Bereich<select value={slot} onChange={(e) => setSlot(e.target.value as Slot)}>{(['kopf', 'brille', 'ruecken', 'stab', 'begleiter'] as Slot[]).map((s) => <option key={s} value={s}>{SLOT_NAME[s]}</option>)}</select></label>
      <label>Preis<input type="number" min={0} value={preis} onChange={(e) => setPreis(e.target.value)} /></label>
      <label>Währung<select value={waehrung} onChange={(e) => setWaehrung(e.target.value as Waehrung)}><option value="sterne">Sterne</option><option value="diamanten">Diamanten</option></select></label>
      <label>Bild<input type="file" accept="image/png,image/webp" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setBild(await fotoVerkleinern(f)) }} /></label>
      <button type="submit" className="adm-btn primary" disabled={!name.trim() || !bild}>Anlegen</button>
    </form>
  )
}
