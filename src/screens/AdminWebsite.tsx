// Admin-Bereich „Website“: Countdown und Kampagnen-Popup der Website ändern – gilt sofort, ohne neues Deploy
import { useEffect, useState, type FormEvent } from 'react'
import { STANDARD, bildHochladen, websiteLaden, websiteSpeichern, type PaketKey, type Preis, type WebsiteDaten } from '../lib/website'

export function AdminWebsite() {
  const [d, setD] = useState<WebsiteDaten>(STANDARD)
  const [status, setStatus] = useState<'laden' | 'bereit' | 'fehlt'>('laden')
  const [meldung, setMeldung] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const [upload, setUpload] = useState('')

  useEffect(() => {
    websiteLaden().then((x) => { setD(x); setStatus('bereit') }).catch(() => setStatus('fehlt'))
  }, [])

  const cd = <K extends keyof WebsiteDaten['countdown']>(k: K, v: WebsiteDaten['countdown'][K]) => setD((x) => ({ ...x, countdown: { ...x.countdown, [k]: v } }))
  const pp = <K extends keyof WebsiteDaten['popup']>(k: K, v: WebsiteDaten['popup'][K]) => setD((x) => ({ ...x, popup: { ...x.popup, [k]: v } }))

  const pr = (p: PaketKey, k: keyof Preis, v: string | number) => setD((x) => ({ ...x, preise: { ...x.preise, [p]: { ...x.preise[p], [k]: v } } }))
  const zahl = (v: string) => Math.max(0, Math.round((Number(v.replace(',', '.')) || 0) * 100) / 100)

  const hochladen = async (datei: File | undefined) => {
    if (!datei) return
    setUpload('Wird hochgeladen …')
    try { const url = await bildHochladen(datei); pp('bild', url); pp('bildAn', true); setUpload('Hochgeladen – bitte unten speichern.') }
    catch (err) { setUpload('Hochladen hat nicht geklappt: ' + String((err as Error).message)) }
  }

  const speichern = async (e: FormEvent) => {
    e.preventDefault()
    setLaeuft(true); setMeldung('')
    try { await websiteSpeichern(d); setMeldung('Gespeichert – die Website zeigt die Änderung beim nächsten Laden.') }
    catch (err) { setMeldung('Speichern hat nicht geklappt: ' + String((err as Error).message)) }
    setLaeuft(false)
  }

  if (status === 'laden') return <section className="adm-card"><p className="adm-muted">Wird geladen …</p></section>
  if (status === 'fehlt') return (
    <section className="adm-card">
      <h2>Website</h2>
      <p>Die Tabelle für die Website-Einstellungen fehlt noch. Bitte einmal <b>supabase/update-4-website.sql</b> im Supabase SQL Editor ausführen.</p>
    </section>
  )

  return (
    <form className="adm-web" onSubmit={(e) => void speichern(e)}>
      <section className="adm-card">
        <div className="adm-web-kopf"><h2>⏰ Countdown bei den Paketen</h2>
          <label className="adm-schalter"><input type="checkbox" checked={d.countdown.an} onChange={(e) => cd('an', e.target.checked)} /> anzeigen</label></div>
        <div className="adm-web-felder">
          <label>Endet am<input type="datetime-local" value={d.countdown.ende} onChange={(e) => cd('ende', e.target.value)} /></label>
          <label className="breit">Überschrift<input value={d.countdown.titel} onChange={(e) => cd('titel', e.target.value)} maxLength={90} /></label>
          <label className="breit">Text darunter<input value={d.countdown.fuss} onChange={(e) => cd('fuss', e.target.value)} maxLength={90} placeholder="leer = kein Text" /></label>
          <label>Balken voll (%)<input type="number" min={0} max={100} value={d.countdown.balken} onChange={(e) => cd('balken', Math.max(0, Math.min(100, Number(e.target.value) || 0)))} /></label>
        </div>
        <p className="adm-muted">Ist das Datum vorbei, verschwindet der Countdown automatisch.</p>
      </section>

      <section className="adm-card">
        <div className="adm-web-kopf"><h2>🎉 Kampagnen-Popup</h2>
          <label className="adm-schalter"><input type="checkbox" checked={d.popup.an} onChange={(e) => pp('an', e.target.checked)} /> aktiv</label></div>
        <div className="adm-web-felder">
          <label className="breit">Titel<input value={d.popup.titel} onChange={(e) => pp('titel', e.target.value)} maxLength={70} placeholder="z. B. Black-Friday: 20 % auf das erste Jahr" /></label>
          <label className="breit">Text<textarea rows={3} value={d.popup.text} onChange={(e) => pp('text', e.target.value)} maxLength={300} /></label>
          <label>Gutscheincode<input value={d.popup.code} onChange={(e) => pp('code', e.target.value.toUpperCase())} maxLength={30} placeholder="leer = kein Code" /></label>
          <label>Button-Text<input value={d.popup.knopf} onChange={(e) => pp('knopf', e.target.value)} maxLength={30} /></label>
          <label>Sichtbar ab<input type="datetime-local" value={d.popup.ab} onChange={(e) => pp('ab', e.target.value)} /></label>
          <label>Sichtbar bis<input type="datetime-local" value={d.popup.bis} onChange={(e) => pp('bis', e.target.value)} /></label>
          <label>Erscheint nach (Sekunden)<input type="number" min={0} max={120} value={d.popup.sekunden} onChange={(e) => pp('sekunden', Math.max(0, Math.min(120, Number(e.target.value) || 0)))} /></label>
        </div>
        <div className="adm-web-zusatz">
          <div>
            <label className="adm-schalter"><input type="checkbox" checked={d.popup.bildAn} onChange={(e) => pp('bildAn', e.target.checked)} /> 🖼️ Bild zeigen</label>
            <div className="adm-web-bild">
              {d.popup.bild ? <img src={d.popup.bild} alt="" /> : <span className="adm-muted">Noch kein Bild</span>}
              <label className="adm-btn">Bild wählen<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => void hochladen(e.target.files?.[0])} /></label>
              {d.popup.bild && <button type="button" className="adm-btn" onClick={() => { pp('bild', ''); pp('bildAn', false) }}>Entfernen</button>}
            </div>
            {upload && <small className="adm-muted">{upload}</small>}
            <small className="adm-muted">JPG, PNG, WebP oder GIF, höchstens 3 MB. Am besten quer (z. B. 1200 × 600).</small>
          </div>
          <div>
            <label className="adm-schalter"><input type="checkbox" checked={d.popup.uhrAn} onChange={(e) => pp('uhrAn', e.target.checked)} /> ⏰ Countdown im Popup</label>
            <label className="adm-web-einzel">Läuft bis<input type="datetime-local" value={d.popup.uhrEnde} onChange={(e) => pp('uhrEnde', e.target.value)} /></label>
            <small className="adm-muted">Leer = bis „Sichtbar bis“. Ist die Zeit abgelaufen, verschwindet das Popup.</small>
          </div>
        </div>
        <p className="adm-muted">Jede Besucherin, jeder Besucher sieht das Popup nur einmal pro Kampagne. Den Gutscheincode legen Sie in Stripe unter Produktkatalog → Gutscheine an und erlauben in den Zahlungslinks „Promotion-Codes“.</p>
        {d.popup.titel && (
          <div className="adm-web-vorschau" aria-label="Vorschau">
            {d.popup.bildAn && d.popup.bild && <img src={d.popup.bild} alt="" />}
            <b>{d.popup.titel}</b>{d.popup.uhrAn && <span>⏰ 02 Tg : 14 Std : 30 Min : 12 Sek</span>}{d.popup.text && <p>{d.popup.text}</p>}{d.popup.code && <span>Code: <b>{d.popup.code}</b></span>}<i>{d.popup.knopf}</i>
          </div>
        )}
      </section>

      <section className="adm-card">
        <div className="adm-web-kopf"><h2>💶 Paketpreise</h2></div>
        <p className="adm-muted">Durchgestrichener Preis: leer oder 0 = kein durchgestrichener Preis. <b>Wichtig:</b> Stripe bucht den Preis, der im Zahlungslink hinterlegt ist. Ändern Sie hier den Preis, legen Sie in Stripe einen neuen Zahlungslink mit genau diesem Preis an und tragen Sie ihn unten ein.</p>
        <div className="adm-preise">
          {(['basic', 'plus', 'premium'] as PaketKey[]).map((p) => {
            const e = d.preise[p]
            return (
              <div key={p} className="adm-preis-karte">
                <h3>{p.charAt(0).toUpperCase() + p.slice(1)}</h3>
                <div className="adm-preis-reihe">
                  <label>Preis / Monat (€)<input inputMode="decimal" value={e.monat} onChange={(x) => pr(p, 'monat', zahl(x.target.value))} /></label>
                  <label>statt (durchgestrichen)<input inputMode="decimal" value={e.altMonat || ''} placeholder="–" onChange={(x) => pr(p, 'altMonat', zahl(x.target.value))} /></label>
                  <label>Preis / Jahr (€)<input inputMode="decimal" value={e.jahr} onChange={(x) => pr(p, 'jahr', zahl(x.target.value))} /></label>
                  <label>statt (durchgestrichen)<input inputMode="decimal" value={e.altJahr || ''} placeholder="–" onChange={(x) => pr(p, 'altJahr', zahl(x.target.value))} /></label>
                </div>
                <label>Hinweis unter dem Preis<input value={e.hinweis} maxLength={80} onChange={(x) => pr(p, 'hinweis', x.target.value)} /></label>
                <label>Stripe-Link monatlich<input value={e.linkMonat} placeholder="https://buy.stripe.com/…" onChange={(x) => pr(p, 'linkMonat', x.target.value.trim())} /></label>
                <label>Stripe-Link jährlich<input value={e.linkJahr} placeholder="https://buy.stripe.com/…" onChange={(x) => pr(p, 'linkJahr', x.target.value.trim())} /></label>
                <div className="adm-preis-vorschau"><b>{e.monat} €</b>{e.altMonat > e.monat && <s>{e.altMonat} €</s>}<span>/ Monat</span>{e.altMonat > e.monat && <em>−{Math.round((1 - e.monat / e.altMonat) * 100)} %</em>}</div>
              </div>
            )
          })}
        </div>
      </section>

      <div className="adm-web-fuss">
        <button type="submit" className="adm-btn primary" disabled={laeuft}>{laeuft ? 'Speichert …' : 'Speichern'}</button>
        {meldung && <span className="adm-muted">{meldung}</span>}
      </div>
    </form>
  )
}
