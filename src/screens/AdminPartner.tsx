import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { datum, kinderLaden, PAKETE, paketName, partnerAnlegen, standLaden, type Kredit, type Paket, type PartnerInfo, type PartnerKind, type Stand } from '../lib/partner'

// Admin: Partner anlegen, Kredite buchen, Partner pausieren, Kinder und Verbrauch ansehen.

export function AdminPartner() {
  const [liste, setListe] = useState<(PartnerInfo & { stand: Stand[] })[] | null>(null)
  const [offen, setOffen] = useState<string | null>(null)
  const [neu, setNeu] = useState(false)
  const [info, setInfo] = useState<{ mail: string; passwort: string } | null>(null)

  const laden = async () => {
    const { data } = await supabase.from('partner').select('*').order('erstellt', { ascending: false })
    const mit = await Promise.all(((data ?? []) as PartnerInfo[]).map(async (p) => ({ ...p, stand: await standLaden(p.id) })))
    setListe(mit)
  }
  useEffect(() => { void laden() }, [])

  return (
    <>
      <div className="partner-aktionen">
        <button type="button" className="adm-btn primary" onClick={() => setNeu(true)}>➕ Neuer Partner</button>
        <a className="adm-btn" href="#/partner" target="_blank" rel="noopener">Partner-Bereich ansehen</a>
      </div>
      {info && (
        <div className="adm-card partner-neu-info">
          <h3>Partner angelegt ✓</h3>
          <p>Bitte diese Zugangsdaten an den Partner schicken (das Passwort wird nur jetzt angezeigt):</p>
          <p>Adresse: <b>brainfitkids.mentalmath.at/app/#/partner</b><br />E-Mail: <b>{info.mail}</b><br />Passwort: <b>{info.passwort}</b></p>
          <button type="button" className="adm-btn" onClick={() => void navigator.clipboard?.writeText(`Partner-Bereich BrainFit Kids\nhttps://brainfitkids.mentalmath.at/app/#/partner\nE-Mail: ${info.mail}\nPasswort: ${info.passwort}`)}>📋 Kopieren</button>
          <button type="button" className="adm-link" onClick={() => setInfo(null)}>Ausblenden</button>
        </div>
      )}
      {neu && <NeuerPartner onZu={() => setNeu(false)} onFertig={(i) => { setNeu(false); setInfo(i); void laden() }} />}

      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Partner</h2><span className="adm-muted">frei / gekauft je Paket</span></div>
        {liste === null ? <p className="adm-muted">Lädt …</p> : !liste.length ? <p className="adm-muted">Noch keine Partner. Legen Sie mit „Neuer Partner“ den ersten an.</p> : (
          <table className="adm-tabelle">
            <thead><tr><th>Partner</th><th>Region</th>{PAKETE.map((p) => <th key={p.id}>{p.name}</th>)}<th>Status</th><th /></tr></thead>
            <tbody>{liste.map((p) => (
              <tr key={p.id}>
                <td><b>{p.firma || p.name}</b><br /><small className="adm-muted">{p.name && p.firma ? `${p.name} · ` : ''}{p.mail}</small></td>
                <td>{p.region || '—'}</td>
                {PAKETE.map((pk) => { const s = p.stand.find((x) => x.paket === pk.id); return <td key={pk.id}>{s?.frei ?? 0} / {s?.gekauft ?? 0}</td> })}
                <td><span className={p.aktiv ? 'adm-badge ok' : 'adm-badge warn'}>{p.aktiv ? 'aktiv' : 'pausiert'}</span></td>
                <td><button type="button" className="adm-btn" onClick={() => setOffen(offen === p.id ? null : p.id)}>{offen === p.id ? 'Schließen' : 'Verwalten'}</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </section>
      {offen && liste?.find((p) => p.id === offen) && <Verwalten partner={liste.find((p) => p.id === offen)!} onAenderung={() => void laden()} />}
    </>
  )
}

function NeuerPartner({ onZu, onFertig }: { onZu: () => void; onFertig: (i: { mail: string; passwort: string }) => void }) {
  const [d, setD] = useState({ firma: '', name: '', mail: '', telefon: '', region: '' })
  const [fehler, setFehler] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const feld = (k: keyof typeof d, titel: string, typ = 'text') => <label>{titel}<input type={typ} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} /></label>
  const anlegen = async (e: FormEvent) => {
    e.preventDefault(); setLaeuft(true); setFehler('')
    const r = await partnerAnlegen(d)
    setLaeuft(false)
    if (r.fehler) setFehler(r.fehler)
    else onFertig({ mail: r.mail, passwort: r.passwort })
  }
  return (
    <form className="adm-card push-admin" onSubmit={(e) => void anlegen(e)}>
      <div className="adm-card-head"><h2>Neuer Partner</h2><button type="button" className="adm-btn" onClick={onZu}>✕</button></div>
      {feld('firma', 'Firma / Lernzentrum')}
      {feld('name', 'Ansprechperson')}
      {feld('mail', 'E-Mail (Login)', 'email')}
      {feld('telefon', 'Telefon', 'tel')}
      {feld('region', 'Region (z. B. Wien, Graz, München)')}
      {fehler && <p className="adm-fehler">{fehler}</p>}
      <button type="submit" className="adm-btn primary" disabled={laeuft || !d.mail}>{laeuft ? 'Wird angelegt …' : 'Partner anlegen'}</button>
    </form>
  )
}

function Verwalten({ partner, onAenderung }: { partner: PartnerInfo & { stand: Stand[] }; onAenderung: () => void }) {
  const [kredite, setKredite] = useState<Kredit[]>([])
  const [kinder, setKinder] = useState<PartnerKind[]>([])
  const [paket, setPaket] = useState<Paket>('basic')
  const [anzahl, setAnzahl] = useState('10')
  const [notiz, setNotiz] = useState('')
  const [info, setInfo] = useState('')
  const laden = () => {
    void supabase.from('partner_kredite').select('*').eq('partner', partner.id).order('erstellt', { ascending: false }).then(({ data }) => setKredite((data ?? []) as Kredit[]))
    void kinderLaden(partner.id).then(setKinder)
  }
  useEffect(laden, [partner.id])

  const buchen = async (e: FormEvent) => {
    e.preventDefault()
    const n = Math.round(Number(anzahl))
    if (!(n > 0)) return
    if (!window.confirm(`${n} ${paketName(paket)}-Kredite für ${partner.firma || partner.name} buchen? (gültig 18 Monate)`)) return
    const { error } = await supabase.from('partner_kredite').insert({ partner: partner.id, paket, anzahl: n, notiz })
    setInfo(error ? `Fehler: ${error.message}` : `${n} ${paketName(paket)}-Kredite gebucht ✓`)
    setNotiz(''); laden(); onAenderung()
  }
  const umschalten = async () => {
    const { error } = await supabase.from('partner').update({ aktiv: !partner.aktiv }).eq('id', partner.id)
    if (!error) onAenderung()
  }

  return (
    <section className="adm-card push-admin">
      <div className="adm-card-head"><h2>{partner.firma || partner.name}</h2>
        <button type="button" className="adm-btn" onClick={() => void umschalten()}>{partner.aktiv ? 'Partner pausieren' : 'Partner wieder aktivieren'}</button></div>
      <p className="adm-muted">{[partner.name, partner.mail, partner.telefon, partner.region].filter(Boolean).join(' · ')} · seit {datum(partner.erstellt)}</p>

      <h3>Kredite buchen</h3>
      <form className="partner-buchen" onSubmit={(e) => void buchen(e)}>
        <select value={paket} onChange={(e) => setPaket(e.target.value as Paket)} aria-label="Paket">{PAKETE.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <input type="number" min={1} max={1000} value={anzahl} onChange={(e) => setAnzahl(e.target.value)} aria-label="Anzahl" />
        <input value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="Notiz (z. B. Rechnung 2026-014)" aria-label="Notiz" />
        <button type="submit" className="adm-btn primary">Buchen</button>
      </form>
      {info && <p className="adm-info">{info}</p>}

      <h3>Käufe</h3>
      {kredite.length ? (
        <table className="adm-tabelle"><thead><tr><th>Datum</th><th>Paket</th><th>Anzahl</th><th>gültig bis</th><th>Notiz</th></tr></thead>
          <tbody>{kredite.map((k) => <tr key={k.id}><td>{datum(k.erstellt)}</td><td>{paketName(k.paket)}</td><td>{k.anzahl}</td><td>{datum(k.gueltig_bis)}</td><td>{k.notiz}</td></tr>)}</tbody></table>
      ) : <p className="adm-muted">Noch keine Kredite gebucht.</p>}

      <h3>Kinder ({kinder.length})</h3>
      {kinder.length ? (
        <table className="adm-tabelle"><thead><tr><th>Kind</th><th>Paket</th><th>Lektion</th><th>Zuletzt</th><th>Zugang bis</th><th>Eltern</th></tr></thead>
          <tbody>{kinder.map((k) => <tr key={k.id}><td>{k.vorname} <small className="adm-muted">{k.benutzer}</small></td><td>{paketName(k.paket)}</td><td>{k.lektion ?? '—'}</td><td>{datum(k.zuletzt)}</td><td>{datum(k.gueltig_bis)}</td><td>{k.eltern_mail ?? '—'}</td></tr>)}</tbody></table>
      ) : <p className="adm-muted">Noch keine Kinder angelegt.</p>}
    </section>
  )
}
