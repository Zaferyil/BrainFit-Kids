import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { STANDARD, websiteLaden, type VorOrt as VorOrtDaten } from '../lib/website'

// Öffentliche Formulare für den Vor-Ort-Kurs in Linz (#/vorort, Website /vorort):
// Voranmeldung (Interesse), Schnupperstunde (bezahlt) und Kursanmeldung (monatlich als Stripe-Abo oder jährlich).
// Link mit Vorauswahl: /vorort?art=voranmeldung | schnupper | anmeldung
const BASE = import.meta.env.BASE_URL
type Art = 'voranmeldung' | 'schnupper' | 'anmeldung'
const STUFEN = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
const euro = (n: number) => n.toLocaleString('de-AT', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'

const ARTEN: { id: Art; emoji: string; titel: string; text: string }[] = [
  { id: 'voranmeldung', emoji: '💌', titel: 'Voranmeldung', text: 'Unverbindlich Interesse anmelden – wir melden uns, sobald ein Kurs startet.' },
  { id: 'schnupper', emoji: '🧮', titel: 'Schnupperstunde', text: 'Eine Probestunde vor Ort oder online: Ihr Kind lernt den Abakus kennen.' },
  { id: 'anmeldung', emoji: '🎓', titel: 'Kursanmeldung', text: 'Verbindlich zum Vor-Ort-Kurs anmelden – monatlich oder jährlich zahlen.' },
]

export function VorOrt({ wahl }: { wahl?: string }) {
  const [art, setArt] = useState<Art | null>(ARTEN.some((a) => a.id === wahl) ? (wahl as Art) : null)
  const [v, setV] = useState<VorOrtDaten>(STANDARD.vorort)
  const [f, setF] = useState({ eltern_vorname: '', eltern_nachname: '', mail: '', telefon: '', strasse: '', plz: '', ort: '', kind_vorname: '', kind_nachname: '', kind_geburt: '', kind_stufe: '', wunschzeiten: '', nachricht: '' })
  const [takt, setTakt] = useState<'monat' | 'jahr'>('monat')
  const [wo, setWo] = useState<'vorort' | 'online'>('vorort')
  const [ok, setOk] = useState(false)
  const [agb, setAgb] = useState(false)
  const [status, setStatus] = useState<'' | 'senden' | 'fertig'>('')
  const [zahlung, setZahlung] = useState<string | null>(null)
  const [fehler, setFehler] = useState('')
  useEffect(() => { document.title = 'Vor-Ort-Kurs in Linz – Anmeldung | BrainFit Kids'; void websiteLaden().then((d) => setV(d.vorort)).catch(() => { /* Standard */ }) }, [])
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const jahrMoeglich = v.jahr > 0

  const senden = async (e: FormEvent) => {
    e.preventDefault(); if (!art) return
    setFehler(''); setStatus('senden')
    const { data, error } = await supabase.functions.invoke('vorort-anmeldung', {
      body: { art, ...f, kind_stufe: f.kind_stufe === '' ? null : Number(f.kind_stufe), takt, wo: art === 'schnupper' ? wo : null, zustimmung: ok, agb },
    })
    if (error || data?.fehler) { setFehler(data?.fehler ?? 'Das hat leider nicht geklappt. Bitte später erneut versuchen.'); setStatus(''); return }
    setZahlung(data?.zahlung ?? null); setStatus('fertig')
    // direkt weiter zur sicheren Zahlung bei Stripe
    if (data?.zahlung) window.setTimeout(() => { window.location.href = data.zahlung }, 2500)
  }

  const a = ARTEN.find((x) => x.id === art)
  return (
    <div className="chk">
      <header className="chk-kopf"><a href="/"><img src={`${BASE}logo.webp`} alt="BrainFit Kids" /></a></header>
      <main className="chk-main">
        <section className="chk-karte chk-start vo">
          <span className="chk-eyebrow">📍 Vor-Ort-Kurs in {v.adresse || 'Linz'}</span>
          <h1>Vor-Ort-Kurs: Mentale Arithmetik 🧠</h1>
          {status === 'fertig' ? <>
            <h2>{art === 'voranmeldung' ? 'Danke für Ihr Interesse! 💜' : 'Vielen Dank! 🎉'}</h2>
            <p>Wir haben Ihnen eine Bestätigung an <b>{f.mail}</b> geschickt (bitte auch im Spam-Ordner nachsehen).</p>
            {zahlung ? <>
              <p>Sie werden jetzt zur <b>sicheren Zahlung bei Stripe</b> weitergeleitet …</p>
              <a className="chk-knopf" href={zahlung}>💳 Weiter zur Zahlung</a>
            </> : <p>Wir melden uns in Kürze persönlich bei Ihnen.</p>}
          </> : <>
            {(v.zeiten || v.adresse) && <p className="vo-info">{v.adresse && <>📍 {v.adresse}<br /></>}{v.zeiten && <>🕒 {v.zeiten}</>}</p>}
            <p><b>Wofür möchten Sie sich anmelden?</b></p>
            <div className="vo-arten">
              {ARTEN.map((x) => (
                <button key={x.id} type="button" className={'vo-art' + (art === x.id ? ' on' : '')} onClick={() => setArt(x.id)} aria-pressed={art === x.id}>
                  <span className="vo-emoji">{x.emoji}</span><b>{x.titel}</b><small>{x.text}</small>
                  {x.id === 'schnupper' && v.schnupper > 0 && <em>{euro(v.schnupper)}</em>}
                  {x.id === 'anmeldung' && <em>{euro(v.monat)} / Monat{v.mindest > 0 ? ` · mind. ${v.mindest} Monate` : ''}</em>}
                </button>
              ))}
            </div>
            {art && <form onSubmit={senden}>
              <h2 className="vo-teil">{a?.emoji} {a?.titel}</h2>
              <fieldset className="vo-gruppe"><legend>Eltern</legend>
                <div className="vo-zwei">
                  <label>Vorname<input required value={f.eltern_vorname} onChange={set('eltern_vorname')} autoComplete="given-name" /></label>
                  <label>Nachname<input required value={f.eltern_nachname} onChange={set('eltern_nachname')} autoComplete="family-name" /></label>
                </div>
                <div className="vo-zwei">
                  <label>E-Mail<input required type="email" value={f.mail} onChange={set('mail')} autoComplete="email" /></label>
                  <label>Telefon<input required type="tel" value={f.telefon} onChange={set('telefon')} autoComplete="tel" /></label>
                </div>
                {art === 'anmeldung' && <>
                  <label>Straße und Hausnummer<input required value={f.strasse} onChange={set('strasse')} autoComplete="street-address" /></label>
                  <div className="vo-zwei">
                    <label>PLZ<input required value={f.plz} onChange={set('plz')} autoComplete="postal-code" inputMode="numeric" /></label>
                    <label>Ort<input required value={f.ort} onChange={set('ort')} autoComplete="address-level2" /></label>
                  </div>
                </>}
              </fieldset>
              <fieldset className="vo-gruppe"><legend>Kind</legend>
                <div className="vo-zwei">
                  <label>Vorname<input required value={f.kind_vorname} onChange={set('kind_vorname')} /></label>
                  {art === 'anmeldung' && <label>Nachname<input required value={f.kind_nachname} onChange={set('kind_nachname')} /></label>}
                </div>
                <div className="vo-zwei">
                  <label>Geburtsdatum<input type="date" required={art === 'anmeldung'} value={f.kind_geburt} onChange={set('kind_geburt')} /></label>
                  <label>Schulstufe<select required value={f.kind_stufe} onChange={set('kind_stufe')}>
                    <option value="" disabled>Bitte wählen</option>
                    {STUFEN.map((s, i) => <option key={s} value={i}>{s}</option>)}
                  </select></label>
                </div>
                <label>Wunschzeiten (optional)<input value={f.wunschzeiten} onChange={set('wunschzeiten')} placeholder="z. B. Mo/Mi nachmittags, Sa vormittags" /></label>
                <label>Nachricht an uns (optional)<textarea rows={3} value={f.nachricht} onChange={set('nachricht')} /></label>
              </fieldset>

              {art === 'anmeldung' && <fieldset className="vo-gruppe"><legend>Zahlungsweise</legend>
                <label className={'vo-takt' + (takt === 'monat' ? ' on' : '')}><input type="radio" name="takt" checked={takt === 'monat'} onChange={() => setTakt('monat')} />
                  <span><b>Monatlich · {euro(v.monat)} / Monat</b><small>{v.mindest > 0 && <><b>Mindestlaufzeit {v.mindest} Monate.</b> </>}Der Beitrag wird jeden Monat automatisch abgebucht.</small></span></label>
                {jahrMoeglich && <label className={'vo-takt' + (takt === 'jahr' ? ' on' : '')}><input type="radio" name="takt" checked={takt === 'jahr'} onChange={() => setTakt('jahr')} />
                  <span><b>Jährlich · {euro(v.jahr)} / Jahr</b><small>Einmal im Jahr bezahlen{v.jahr < v.monat * 12 ? ` – Sie sparen ${euro(v.monat * 12 - v.jahr)}` : ''}.</small></span></label>}
              </fieldset>}
              {art === 'schnupper' && <fieldset className="vo-gruppe"><legend>Wo soll die Schnupperstunde stattfinden?</legend>
                <label className={'vo-takt' + (wo === 'vorort' ? ' on' : '')}><input type="radio" name="wo" checked={wo === 'vorort'} onChange={() => setWo('vorort')} />
                  <span><b>📍 Vor Ort in {v.adresse || 'Linz'}</b><small>Ihr Kind kommt zu uns in den Kurs.</small></span></label>
                <label className={'vo-takt' + (wo === 'online' ? ' on' : '')}><input type="radio" name="wo" checked={wo === 'online'} onChange={() => setWo('online')} />
                  <span><b>💻 Online</b><small>Per Videoanruf von zu Hause – den Link bekommen Sie per E-Mail.</small></span></label>
              </fieldset>}
              {art === 'schnupper' && v.schnupper > 0 && <p className="vo-preis">Schnupperstunde: <b>{euro(v.schnupper)}</b> (einmalig) – Zahlung im nächsten Schritt.</p>}

              {art === 'anmeldung' && <label className="wb-ok"><input type="checkbox" required checked={agb} onChange={(e) => setAgb(e.target.checked)} />
                <span>Ich melde mein Kind verbindlich an{takt === 'monat' && v.mindest > 0 ? ` (Mindestlaufzeit ${v.mindest} Monate)` : ''} und akzeptiere die <a href="/agb" target="_blank" rel="noopener">AGB</a>.</span></label>}
              <label className="wb-ok"><input type="checkbox" required checked={ok} onChange={(e) => setOk(e.target.checked)} />
                <span>Ich bin einverstanden, dass BrainFit Kids meine Angaben für diese Anmeldung speichert und mich dazu kontaktiert (<a href="/datenschutz" target="_blank" rel="noopener">Datenschutz</a>).</span></label>
              {fehler && <p className="wb-fehler">{fehler}</p>}
              <button type="submit" className="chk-knopf" disabled={status === 'senden'}>
                {status === 'senden' ? 'Wird gesendet …' : art === 'voranmeldung' ? 'Unverbindlich voranmelden' : art === 'schnupper' ? 'Weiter zur Zahlung' : 'Anmelden und weiter zur Zahlung'}
              </button>
              {art !== 'voranmeldung' && <p className="chk-klein">🔒 Die Zahlung erfolgt sicher über Stripe. Sie bekommen eine Bestätigung per E-Mail.</p>}
            </form>}
          </>}
        </section>
      </main>
    </div>
  )
}
