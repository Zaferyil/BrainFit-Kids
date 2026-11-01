import { useEffect, useState, type FormEvent } from 'react'
import { Icon } from '../components/Icon'
import { KLASSEN } from '../lib/klasse'
import { adminAbmelden, elternPasswortVergessen } from '../lib/adminCloud'
import { bestellen, bestellungenLaden, datum, euro, kindAnlegen, kinderLaden, mindestmenge, PAKETE, paketName, partnerAnmelden, partnerLaden, preiseLaden, standLaden, stufeFuer, STUFEN, USt, zugangNeu, type Bestellung, type Paket, type PartnerInfo, type PartnerKind, type Preis, type Stand } from '../lib/partner'

// Partner-Dashboard: Kredite, Kinder anlegen (1 Kredit = 1 Kind, 12 Monate), Zugangsdaten drucken.

export function Partner() {
  const [partner, setPartner] = useState<PartnerInfo | null | undefined>(undefined)
  useEffect(() => { void partnerLaden().then(setPartner) }, [])
  if (partner === undefined) return <div className="adm adm-login"><div className="adm-card adm-login-card"><p>Einen Moment …</p></div></div>
  if (!partner) return <Login onOk={() => void partnerLaden().then(setPartner)} />
  return <Dashboard partner={partner} onLogout={() => { void adminAbmelden(); setPartner(null) }} />
}

function Login({ onOk }: { onOk: () => void }) {
  const [mail, setMail] = useState('')
  const [pw, setPw] = useState('')
  const [fehler, setFehler] = useState('')
  const [info, setInfo] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const anmelden = async (e: FormEvent) => {
    e.preventDefault(); setLaeuft(true); setFehler('')
    const r = await partnerAnmelden(mail, pw).catch(() => 'falsch')
    setLaeuft(false)
    if (r === 'ok') onOk()
    else setFehler(r === 'kein-partner' ? 'Dieses Konto ist kein Partner-Konto.' : 'E-Mail oder Passwort ist falsch.')
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
        <h1>Partner-Bereich</h1>
        <p>Mit der E-Mail-Adresse und dem Passwort Ihres Partner-Kontos anmelden.</p>
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

type Karte = { vorname: string; benutzer: string; passwort: string; paket: string; bis: string | null; mail?: boolean }

export function Dashboard({ partner, onLogout }: { partner: PartnerInfo; onLogout: () => void }) {
  const [stand, setStand] = useState<Stand[]>([])
  const [kinder, setKinder] = useState<PartnerKind[] | null>(null)
  const [neu, setNeu] = useState(false)
  const [karte, setKarte] = useState<Karte | null>(null)
  const [suche, setSuche] = useState('')
  const [bestellenOffen, setBestellen] = useState(false)
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([])
  const laden = () => { void standLaden().then(setStand); void kinderLaden(partner.id).then(setKinder); void bestellungenLaden(partner.id).then(setBestellungen) }
  useEffect(laden, [partner.id])

  const passwortNeu = async (k: PartnerKind) => {
    if (!window.confirm(`Neues Passwort für ${k.vorname} erstellen? Das alte Passwort gilt dann nicht mehr.`)) return
    const r = await zugangNeu(k.id)
    if (r.fehler) { window.alert(r.fehler); return }
    setKarte({ vorname: k.vorname, benutzer: r.benutzer, passwort: r.passwort, paket: paketName(k.paket), bis: k.gueltig_bis })
  }
  const liste = (kinder ?? []).filter((k) => !suche || `${k.vorname} ${k.benutzer} ${k.eltern_mail ?? ''}`.toLowerCase().includes(suche.toLowerCase()))
  const aktiv = (kinder ?? []).filter((k) => k.zuletzt && Date.now() - new Date(k.zuletzt).getTime() < 7 * 864e5).length

  return (
    <div className="adm">
      <header className="adm-head no-print">
        <div className="adm-brand"><span className="adm-logo small"><Icon name="users" size={20} color="#5B47D6" /></span><b>{partner.firma || partner.name || 'Partner'}</b><span>Partner</span></div>
        <div className="adm-tabs" />
        <div className="adm-head-r">
          <button type="button" className="adm-btn" onClick={onLogout}><Icon name="logout" size={16} color="currentColor" /> Abmelden</button>
        </div>
      </header>
      <main className="adm-main no-print">
        {!partner.aktiv && <div className="adm-fehler">Ihr Partner-Konto ist pausiert. Bitte melden Sie sich bei info@mentalmath.at.</div>}

        <div className="partner-kredite">
          {PAKETE.map((p) => {
            const s = stand.find((x) => x.paket === p.id)
            const frei = s?.frei ?? 0, gekauft = s?.gekauft ?? 0
            return (
              <div key={p.id} className="adm-card partner-kredit" style={{ borderTop: `5px solid ${p.farbe}` }}>
                <span>{p.name}</span>
                <b>{frei}<small> frei</small></b>
                <div className="adm-track"><div style={{ width: `${gekauft ? ((s?.verbraucht ?? 0) / gekauft) * 100 : 0}%`, background: p.farbe }} /></div>
                <small>{s?.verbraucht ?? 0} von {gekauft} verwendet{s?.naechster_ablauf ? ` · gültig bis ${datum(s.naechster_ablauf)}` : ''}</small>
              </div>
            )
          })}
          <div className="adm-card partner-kredit">
            <span>Kinder</span>
            <b>{kinder?.length ?? 0}</b>
            <small>{aktiv} in den letzten 7 Tagen aktiv</small>
          </div>
        </div>

        <div className="partner-aktionen">
          <button type="button" className="adm-btn primary" disabled={!partner.aktiv} onClick={() => setNeu(true)}>➕ Neues Kind anlegen</button>
          <button type="button" className="adm-btn" disabled={!partner.aktiv} onClick={() => setBestellen(true)}>🛒 Kredite bestellen</button>
        </div>

        <section className="adm-card adm-tabelle-wrap">
          <div className="adm-card-head"><h2>Meine Kinder</h2><input className="partner-suche" value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Suchen …" aria-label="Kinder suchen" /></div>
          {kinder === null ? <p className="adm-muted">Lädt …</p> : !kinder.length ? <p className="adm-muted">Noch keine Kinder. Legen Sie mit „Neues Kind anlegen“ das erste Kind an – dabei wird 1 Kredit verwendet.</p> : (
            <table className="adm-tabelle">
              <thead><tr><th>Kind</th><th>Paket</th><th>Lektion</th><th>Zuletzt aktiv</th><th>Zugang bis</th><th /></tr></thead>
              <tbody>{liste.map((k) => {
                const abgelaufen = k.gueltig_bis && new Date(k.gueltig_bis).getTime() < Date.now()
                return (
                  <tr key={k.id}>
                    <td><b>{k.vorname}</b><br /><small className="adm-muted">{k.benutzer}{k.stufe !== null ? ` · ${KLASSEN[k.stufe]?.name}` : ''}</small></td>
                    <td>{paketName(k.paket)}</td>
                    <td>{k.lektion ?? '—'}</td>
                    <td>{k.zuletzt ? datum(k.zuletzt) : 'noch nicht'}</td>
                    <td>{abgelaufen ? <span className="adm-badge warn">abgelaufen</span> : datum(k.gueltig_bis)}</td>
                    <td><button type="button" className="adm-btn" onClick={() => void passwortNeu(k)}>Neues Passwort</button></td>
                  </tr>
                )
              })}</tbody>
            </table>
          )}
        </section>

        {bestellungen.length > 0 && (
          <section className="adm-card adm-tabelle-wrap">
            <div className="adm-card-head"><h2>Meine Bestellungen</h2></div>
            <table className="adm-tabelle">
              <thead><tr><th>Nr.</th><th>Datum</th><th>Kredite</th><th>Summe netto</th><th>Status</th></tr></thead>
              <tbody>{bestellungen.map((b) => (
                <tr key={b.id}><td>#{b.id}</td><td>{datum(b.erstellt)}</td>
                  <td>{b.positionen.map((x) => `${x.anzahl} × ${paketName(x.paket)}`).join(', ')}</td>
                  <td>{euro(b.netto)}</td>
                  <td><span className={b.status === 'bezahlt' ? 'adm-badge ok' : 'adm-badge warn'}>{b.status === 'offen' ? 'wartet auf Zahlung' : b.status === 'bezahlt' ? 'bezahlt · Kredite gebucht' : 'storniert'}</span></td></tr>
              ))}</tbody>
            </table>
          </section>
        )}

        <section className="adm-card eltern-tipps">
          <h2>So funktioniert’s</h2>
          <ul>
            <li>1 Kredit = 1 Kind mit 12 Monaten Zugang. Kredite sind ab Kauf 18 Monate gültig – bereits angelegte Kinder behalten ihre vollen 12 Monate.</li>
            <li>Beim Anlegen bekommen die Eltern die Zugangsdaten per E-Mail. Sie können die Zugangskarte auch ausdrucken und übergeben.</li>
            <li>Plus und Premium: Bücher und Abakus erhalten Sie gesammelt von uns – bitte an die Familien weitergeben.</li>
            <li>Premium-Kinder nehmen an unseren Live-Gruppenstunden teil; die Termine bekommen die Eltern von uns.</li>
            <li>Fragen: <a href="mailto:info@mentalmath.at">info@mentalmath.at</a> · WhatsApp +43 676 463 44 44</li>
          </ul>
        </section>
      </main>

      {neu && <NeuesKind stand={stand} onZu={() => setNeu(false)} onFertig={(k) => { setNeu(false); setKarte(k); laden() }} />}
      {karte && <Zugangskarte karte={karte} onZu={() => setKarte(null)} />}
      {bestellenOffen && <KrediteBestellen onZu={() => setBestellen(false)} onFertig={() => { setBestellen(false); laden() }} />}
    </div>
  )
}

function NeuesKind({ stand, onZu, onFertig }: { stand: Stand[]; onZu: () => void; onFertig: (k: Karte) => void }) {
  const ersteFreie = PAKETE.find((p) => (stand.find((s) => s.paket === p.id)?.frei ?? 0) > 0)?.id ?? 'basic'
  const [vorname, setVorname] = useState('')
  const [stufe, setStufe] = useState<string>('')
  const [paket, setPaket] = useState<Paket>(ersteFreie)
  const [mail, setMail] = useState('')
  const [eltern, setEltern] = useState('')
  const [fehler, setFehler] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const frei = (p: Paket) => stand.find((s) => s.paket === p)?.frei ?? 0

  const anlegen = async (e: FormEvent) => {
    e.preventDefault()
    if (!window.confirm(`${vorname} mit ${paketName(paket)} anlegen? Dabei wird 1 ${paketName(paket)}-Kredit verwendet.`)) return
    setLaeuft(true); setFehler('')
    const r = await kindAnlegen({ vorname, stufe: stufe === '' ? null : Number(stufe), paket, eltern_mail: mail, eltern_name: eltern })
    setLaeuft(false)
    if (r.fehler) { setFehler(r.fehler); return }
    onFertig({ vorname, benutzer: r.benutzer, passwort: r.passwort, paket: paketName(paket), bis: r.bis, mail: r.mail })
  }

  return (
    <div className="partner-modal" role="dialog" aria-modal="true" aria-label="Neues Kind anlegen">
      <form className="adm-card push-admin" onSubmit={(e) => void anlegen(e)}>
        <div className="adm-card-head"><h2>Neues Kind anlegen</h2><button type="button" className="adm-btn" onClick={onZu} aria-label="Schließen">✕</button></div>
        <label>Vorname des Kindes<input required value={vorname} onChange={(e) => setVorname(e.target.value)} autoFocus /></label>
        <label>Schulstufe<select value={stufe} onChange={(e) => setStufe(e.target.value)}>
          <option value="">— später beim Einstufungstest —</option>
          {KLASSEN.map((k, i) => <option key={k.name} value={i}>{k.name}</option>)}
        </select></label>
        <label>Paket<div className="partner-pakete">
          {PAKETE.map((p) => (
            <button key={p.id} type="button" className={paket === p.id ? 'adm-btn primary' : 'adm-btn'} disabled={!frei(p.id)} onClick={() => setPaket(p.id)}>
              {p.name} <small>({frei(p.id)} frei)</small>
            </button>
          ))}
        </div></label>
        <label>E-Mail der Eltern<input type="email" value={mail} onChange={(e) => setMail(e.target.value)} placeholder="Zugangsdaten und Eltern-Bereich" /></label>
        <label>Name der Eltern (optional)<input value={eltern} onChange={(e) => setEltern(e.target.value)} /></label>
        <p className="adm-muted">Die Eltern bekommen die Zugangsdaten per E-Mail und können im Eltern-Bereich den Lernstand sehen.</p>
        {fehler && <p className="adm-fehler">{fehler}</p>}
        <button type="submit" className="adm-btn primary" disabled={laeuft || !vorname.trim() || !frei(paket)}>{laeuft ? 'Wird angelegt …' : 'Kind anlegen (1 Kredit)'}</button>
      </form>
    </div>
  )
}

function Zugangskarte({ karte, onZu }: { karte: Karte; onZu: () => void }) {
  return (
    <div className="partner-modal" role="dialog" aria-modal="true" aria-label="Zugangsdaten">
      <div className="adm-card partner-karte">
        <img src={`${import.meta.env.BASE_URL}logo.webp`} alt="BrainFit Kids" />
        <h2>Zugang für {karte.vorname} 🎉</h2>
        <dl>
          <dt>Benutzername</dt><dd>{karte.benutzer}</dd>
          <dt>Passwort</dt><dd>{karte.passwort}</dd>
          <dt>Paket</dt><dd>{karte.paket}{karte.bis ? ` · bis ${datum(karte.bis)}` : ''}</dd>
        </dl>
        <p>So geht’s: <b>brainfitkids.mentalmath.at/app</b> öffnen → Benutzername und Passwort eingeben → SeZa wählen – los geht’s!</p>
        {karte.mail !== undefined && <p className="adm-muted no-print">{karte.mail ? '✓ Die Zugangsdaten wurden den Eltern per E-Mail geschickt.' : 'Hinweis: Es wurde keine E-Mail verschickt – bitte die Karte ausdrucken oder die Daten weitergeben.'}</p>}
        <div className="partner-aktionen no-print">
          <button type="button" className="adm-btn primary" onClick={() => window.print()}>🖨️ Drucken</button>
          <button type="button" className="adm-btn" onClick={onZu}>Fertig</button>
        </div>
      </div>
    </div>
  )
}

function KrediteBestellen({ onZu, onFertig }: { onZu: () => void; onFertig: () => void }) {
  const [preise, setPreise] = useState<Preis[] | null>(null)
  const [anzahl, setAnzahl] = useState<Record<Paket, number>>({ basic: 0, plus: 0, premium: 0 })
  const [fehler, setFehler] = useState('')
  const [fertig, setFertig] = useState<{ id: number; netto: number } | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  useEffect(() => { void preiseLaden().then(setPreise) }, [])
  if (!preise) return null
  const gesamt = anzahl.basic + anzahl.plus + anzahl.premium
  const stufe = stufeFuer(preise, gesamt)
  const preis = (st: string, p: Paket) => preise.find((x) => x.stufe === st && x.paket === p)?.preis ?? 0
  const netto = stufe ? PAKETE.reduce((a, p) => a + anzahl[p.id] * preis(stufe.id, p.id), 0) : 0
  const min = mindestmenge(preise)

  const senden = async () => {
    if (!stufe || !window.confirm(`Verbindlich bestellen: ${gesamt} Kredite für ${euro(netto)} netto?`)) return
    setLaeuft(true); setFehler('')
    const r = await bestellen(anzahl)
    setLaeuft(false)
    if (r.fehler) setFehler(r.fehler)
    else setFertig({ id: r.id, netto: r.netto })
  }

  return (
    <div className="partner-modal" role="dialog" aria-modal="true" aria-label="Kredite bestellen">
      <div className="adm-card push-admin partner-bestellen">
        <div className="adm-card-head"><h2>🛒 Kredite bestellen</h2><button type="button" className="adm-btn" onClick={fertig ? onFertig : onZu} aria-label="Schließen">✕</button></div>
        {fertig ? (
          <>
            <p className="adm-info">Danke! Ihre Bestellung #{fertig.id} über {euro(fertig.netto)} netto ist eingegangen.</p>
            <p>Sie erhalten in Kürze die Rechnung per E-Mail. Sobald die Zahlung eingegangen ist, stehen die Kredite hier im Partner-Bereich bereit.</p>
            <button type="button" className="adm-btn primary" onClick={onFertig}>Fertig</button>
          </>
        ) : (
          <>
            <table className="adm-tabelle partner-preistabelle">
              <thead><tr><th>Stufe</th>{PAKETE.map((p) => <th key={p.id}>{p.name}</th>)}</tr></thead>
              <tbody>{STUFEN.map((st) => (
                <tr key={st.id} className={stufe?.id === st.id ? 'aktiv' : ''}>
                  <td><b>{st.name}</b><br /><small>ab {Math.min(...preise.filter((x) => x.stufe === st.id).map((x) => x.min_kredite))} Kredite</small></td>
                  {PAKETE.map((p) => <td key={p.id}>{euro(preis(st.id, p.id))}</td>)}
                </tr>
              ))}</tbody>
            </table>
            <p className="adm-muted">Preise je Kredit (1 Kind, 12 Monate), netto zzgl. {USt * 100} % USt. Die Stufe richtet sich nach der Gesamtzahl der Kredite einer Bestellung.</p>
            <div className="partner-mengen">
              {PAKETE.map((p) => (
                <label key={p.id}>{p.name}
                  <input type="number" min={0} max={1000} value={anzahl[p.id] || ''} placeholder="0" onChange={(e) => setAnzahl({ ...anzahl, [p.id]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} />
                </label>
              ))}
            </div>
            <div className="partner-summe">
              {stufe ? (
                <>
                  <span>{gesamt} Kredite · Stufe <b>{stufe.name}</b></span>
                  <span>Netto <b>{euro(netto)}</b> · USt. {euro(netto * USt)} · <b>Gesamt {euro(netto * (1 + USt))}</b></span>
                </>
              ) : <span>Mindestbestellung: {min} Kredite (gemischt möglich). Aktuell: {gesamt}.</span>}
            </div>
            <p className="adm-muted">Bezahlung per Rechnung (Überweisung). Die Kredite sind ab Buchung 18 Monate gültig. Bücher und Abakus für Plus/Premium schicken wir gesammelt an Sie.</p>
            {fehler && <p className="adm-fehler">{fehler}</p>}
            <button type="button" className="adm-btn primary" disabled={!stufe || laeuft} onClick={() => void senden()}>{laeuft ? 'Wird gesendet …' : 'Verbindlich bestellen'}</button>
          </>
        )}
      </div>
    </div>
  )
}
