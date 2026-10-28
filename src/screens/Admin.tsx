import { Fragment, useMemo, useState, type FormEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { Icon, type IconName } from '../components/Icon'
import { KLASSEN } from '../lib/klasse'
import { ALLE_LEKTIONEN, inhaltStatus, kidZeilen, resetKid, setLektion, setStufe, type KidZeile } from '../lib/admin'
import { ALLES_OFFEN, setTestmodus } from '../lib/testmodus'

// Admin-Bereich für Lehrkraft und Schule: Kinder, Lektionen, Einstellungen.
// Bis Supabase angebunden ist, zeigt er die Daten auf diesem Gerät.

const PIN = '1234'
const PIN_KEY = 'bfk.admin'

type Tab = 'uebersicht' | 'kinder' | 'lektionen' | 'einstellungen'
const TABS: { id: Tab; titel: string; icon: IconName }[] = [
  { id: 'uebersicht', titel: 'Übersicht', icon: 'chart' },
  { id: 'kinder', titel: 'Kinder', icon: 'users' },
  { id: 'lektionen', titel: 'Lektionen', icon: 'book' },
  { id: 'einstellungen', titel: 'Einstellungen', icon: 'settings' },
]

const angemeldet = () => { try { return sessionStorage.getItem(PIN_KEY) === '1' } catch { return false } }

export function Admin() {
  const [ok, setOk] = useState(angemeldet)
  if (!ok) return <PinLogin onOk={() => setOk(true)} />
  return <Dashboard onLogout={() => { try { sessionStorage.removeItem(PIN_KEY) } catch { /* egal */ } setOk(false) }} />
}

function PinLogin({ onOk }: { onOk: () => void }) {
  const [pin, setPin] = useState('')
  const [fehler, setFehler] = useState(false)
  const pruefen = (e: FormEvent) => {
    e.preventDefault()
    if (pin === PIN) { try { sessionStorage.setItem(PIN_KEY, '1') } catch { /* egal */ } onOk() } else { setFehler(true); setPin('') }
  }
  return (
    <div className="adm adm-login">
      <form className="adm-card adm-login-card" onSubmit={pruefen}>
        <div className="adm-logo"><Icon name="lock" size={30} color="#5B47D6" /></div>
        <h1>Lehrkraft &amp; Admin</h1>
        <p>Bitte gib die PIN ein.</p>
        <input type="password" inputMode="numeric" autoFocus value={pin} onChange={(e) => { setPin(e.target.value); setFehler(false) }} aria-label="PIN" placeholder="PIN" />
        {fehler && <div className="adm-fehler">PIN ist falsch.</div>}
        <button type="submit" className="adm-btn primary">Anmelden</button>
        <a href="#/" className="adm-link">Zurück zur App</a>
      </form>
    </div>
  )
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
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
        <div className="adm-hinweis"><Icon name="alert" size={18} color="#8A5A00" /> Daten von diesem Gerät. Für alle Geräte der Klasse braucht es den Server (Supabase).</div>
        {tab === 'uebersicht' && <Uebersicht zeilen={zeilen} onKind={() => setTab('kinder')} />}
        {tab === 'kinder' && <Kinder zeilen={zeilen} onChange={neu} />}
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
        <Kpi titel="Kinder" wert={zeilen.length} sub={`in ${new Set(zeilen.map((z) => z.klassenCode)).size} Klasse`} />
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
  return (
    <section className="adm-card adm-tabelle-wrap">
      <div className="adm-card-head"><h2>Kinder</h2><span className="adm-muted">{zeilen.length} Kinder · Klasse {zeilen[0]?.klassenCode}</span></div>
      <table className="adm-tabelle">
        <thead>
          <tr><th>Kind</th><th>Klasse</th><th>Lektion</th><th>Level</th><th>Perlen</th><th>Sterne</th><th>Heute</th><th /></tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <Fragment key={z.kid.id}>
              <tr>
                <td><span className="adm-kind"><Avatar size={32} {...z.kid.avatar} /><span><b>{z.kid.name}</b><small>{z.eingestuft ? 'eingestuft' : 'noch nicht eingestuft'}</small></span></span></td>
                <td>{z.stufeName}</td>
                <td><b>L{z.lektion}</b> <small>{z.lektionName}</small></td>
                <td>{z.progress.level}</td>
                <td>{z.progress.perlen}</td>
                <td>{z.sterne}</td>
                <td><small>{z.heute.minuten} Min · {z.heute.aufgaben} Aufg. · {z.heute.spiele} Spiele</small></td>
                <td><button type="button" className="adm-btn" onClick={() => setOffen(offen === z.kid.id ? null : z.kid.id)}>{offen === z.kid.id ? 'Schließen' : 'Bearbeiten'}</button></td>
              </tr>
              {offen === z.kid.id && (
                <tr className="adm-edit"><td colSpan={8}><KindBearbeiten z={z} onChange={onChange} /></td></tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </section>
  )
}

function KindBearbeiten({ z, onChange }: { z: KidZeile; onChange: () => void }) {
  const [lekt, setLekt] = useState(`${z.progress.world}-${z.progress.unit}`)
  return (
    <div className="adm-edit-box">
      <label>Klasse
        <select value={z.stufe ?? 2} onChange={(e) => { setStufe(z.kid.id, Number(e.target.value)); onChange() }}>
          {KLASSEN.map((k, i) => <option key={k.name} value={i}>{k.name}</option>)}
        </select>
      </label>
      <label>Lektion setzen
        <select value={lekt} onChange={(e) => setLekt(e.target.value)}>
          {ALLE_LEKTIONEN.map((l) => <option key={l.nr} value={`${l.world}-${l.unit}`}>L{l.nr} · {l.name}</option>)}
        </select>
      </label>
      <button type="button" className="adm-btn primary" onClick={() => { const [w, u] = lekt.split('-').map(Number); setLektion(z.kid.id, w, u); onChange() }}>Übernehmen</button>
      <button type="button" className="adm-btn danger" onClick={() => { if (window.confirm(`Fortschritt von ${z.kid.name} wirklich zurücksetzen? Klasse und Einstufung bleiben.`)) { resetKid(z.kid.id); onChange() } }}>Fortschritt zurücksetzen</button>
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
          <b>Admin-PIN</b>
          <p>Die PIN ist fest eingestellt (1234). Mit dem Server bekommt jede Lehrkraft ein eigenes Konto.</p>
        </div>
      </div>
    </section>
  )
}
