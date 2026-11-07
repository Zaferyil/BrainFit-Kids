import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

// Öffentliche Anmeldung zu Online-Webinaren für Eltern (#/webinar, Website /webinar).
// Den Zoom-Link gibt es nur per E-Mail nach der Anmeldung (Edge Function „webinar-anmeldung“).
const BASE = import.meta.env.BASE_URL
type W = { id: string; titel: string; beschreibung: string | null; beginn: string; dauer_min: number }
const wann = (d: string) => new Date(d).toLocaleString('de-AT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' Uhr'

export function Webinar({ wahl }: { wahl?: string }) {
  const [liste, setListe] = useState<W[] | null>(null)
  const [w, setW] = useState('')
  const [f, setF] = useState({ vorname: '', nachname: '', mail: '', telefon: '' })
  const [ok, setOk] = useState(false)
  const [status, setStatus] = useState<'' | 'senden' | 'fertig'>('')
  const [fehler, setFehler] = useState('')
  useEffect(() => {
    void supabase.rpc('webinare_offen').then(({ data }) => {
      const l = (data ?? []) as W[]; setListe(l)
      setW(l.find((x) => x.id === wahl)?.id ?? l[0]?.id ?? '')
    })
  }, [wahl])
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const senden = async (e: FormEvent) => {
    e.preventDefault(); setFehler(''); setStatus('senden')
    const { data, error } = await supabase.functions.invoke('webinar-anmeldung', { body: { webinar: w, ...f, zustimmung: ok } })
    if (error || data?.fehler) { setFehler(data?.fehler ?? 'Das hat leider nicht geklappt. Bitte später erneut versuchen.'); setStatus(''); return }
    setStatus('fertig')
  }
  const gewaehlt = liste?.find((x) => x.id === w)
  return (
    <div className="chk">
      <header className="chk-kopf"><a href="/"><img src={`${BASE}logo.webp`} alt="BrainFit Kids" /></a></header>
      <main className="chk-main">
        <section className="chk-karte chk-start">
          <span className="chk-eyebrow">Kostenlos · online über Zoom</span>
          <h1>Webinar für Eltern 🎓</h1>
          {liste === null ? <p>Laden …</p>
            : !liste.length ? <p>Zurzeit ist kein Webinar geplant. Schauen Sie bald wieder vorbei!</p>
            : status === 'fertig' ? <>
              <h2>Sie sind angemeldet! 🎉</h2>
              <p>Wir haben Ihnen eine E-Mail an <b>{f.mail}</b> geschickt – mit Termin und Zoom-Link. Bitte auch im Spam-Ordner nachsehen.</p>
            </> : <>
              {gewaehlt && <p><b>{gewaehlt.titel}</b><br />📅 {wann(gewaehlt.beginn)} · ca. {gewaehlt.dauer_min} Minuten{gewaehlt.beschreibung ? <><br /><br />{gewaehlt.beschreibung}</> : null}</p>}
              <form onSubmit={senden}>
                {liste.length > 1 && <label>Termin
                  <select required value={w} onChange={(e) => setW(e.target.value)}>
                    {liste.map((x) => <option key={x.id} value={x.id}>{x.titel} – {wann(x.beginn)}</option>)}
                  </select></label>}
                <label>Vorname<input required value={f.vorname} onChange={set('vorname')} autoComplete="given-name" /></label>
                <label>Nachname<input required value={f.nachname} onChange={set('nachname')} autoComplete="family-name" /></label>
                <label>E-Mail<input required type="email" value={f.mail} onChange={set('mail')} autoComplete="email" /></label>
                <label>Telefon<input required type="tel" value={f.telefon} onChange={set('telefon')} autoComplete="tel" /></label>
                <label className="wb-ok"><input type="checkbox" required checked={ok} onChange={(e) => setOk(e.target.checked)} />
                  <span>Ich bin einverstanden, dass BrainFit Kids meine Angaben für dieses Webinar speichert und mir dazu E-Mails schickt (<a href="/datenschutz" target="_blank" rel="noopener">Datenschutz</a>).</span></label>
                {fehler && <p className="wb-fehler">{fehler}</p>}
                <button type="submit" className="chk-knopf" disabled={status === 'senden'}>{status === 'senden' ? 'Wird gesendet …' : 'Kostenlos anmelden'}</button>
              </form>
              <p className="chk-klein">Den Zoom-Link bekommen Sie sofort per E-Mail.</p>
            </>}
        </section>
      </main>
    </div>
  )
}
