import { useEffect, useState } from 'react'
import { STANDARD, einstellungenLaden, einstellungenSpeichern, istInstalliert, istIphone, motivationsMelodie, pushAktiv, pushAusschalten, pushEinschalten, pushMoeglich, type PushEinstellungen } from '../lib/push'

// Eltern-Bereich: Benachrichtigungen fürs Kind erlauben, Uhrzeit wählen, eigene Benachrichtigungen ein/aus.

export function PushKarte({ kidId, name }: { kidId: string; name: string }) {
  const [e, setE] = useState<PushEinstellungen | null>(null)
  const [aktiv, setAktiv] = useState(false)
  const [info, setInfo] = useState('')
  useEffect(() => {
    void einstellungenLaden(kidId).then(setE)
    void pushAktiv(kidId, 'eltern').then(setAktiv)
  }, [kidId])

  const aendern = async (neu: Partial<PushEinstellungen>) => {
    const n = { ...(e ?? STANDARD), ...neu }
    setE(n)
    setInfo((await einstellungenSpeichern(kidId, n)) ? 'Gespeichert ✓' : 'Konnte nicht speichern – bitte später erneut versuchen.')
  }
  const elternGeraet = async () => {
    if (aktiv) { await pushAusschalten(kidId, 'eltern'); setAktiv(false); setInfo('Auf diesem Gerät ausgeschaltet.'); return }
    const r = await pushEinschalten(kidId, 'eltern')
    if (r === 'ok') { setAktiv(true); setInfo('Auf diesem Gerät eingeschaltet ✓') }
    else setInfo(r === 'abgelehnt' ? 'Benachrichtigungen sind im Browser blockiert. Bitte in den Browser-Einstellungen erlauben.' : 'Das hat nicht geklappt. Bitte später erneut versuchen.')
  }
  if (!e) return null
  const iphoneHinweis = istIphone() && !istInstalliert()

  return (
    <section className="adm-card push-karte">
      <div className="adm-card-head"><h2>🔔 Benachrichtigungen</h2><span className="adm-muted">automatisch, max. 2 am Tag, nie zwischen 20 und 8 Uhr</span></div>

      <h3>Für {name}</h3>
      <label className="push-zeile"><input type="checkbox" checked={e.kind_an} onChange={(x) => void aendern({ kind_an: x.target.checked })} />
        <span><b>Tägliche Lern-Erinnerung</b><small>Mo–Sa, nur wenn noch nicht geübt wurde</small></span>
        <input type="time" value={e.erinnerung} min="08:00" max="19:30" step={900} disabled={!e.kind_an} onChange={(x) => void aendern({ erinnerung: x.target.value || '17:00' })} aria-label="Uhrzeit der Erinnerung" />
      </label>
      <label className="push-zeile"><input type="checkbox" checked={e.serie_an} disabled={!e.kind_an} onChange={(x) => void aendern({ serie_an: x.target.checked })} />
        <span><b>Serien-Warnung um 19:30</b><small>„Deine Serie ist in Gefahr!“ – nur bei mind. 2 Tagen am Stück</small></span>
      </label>
      {e.kind_an && <p className="adm-muted">{name} schaltet die Erinnerungen dann einmal in der App auf dem eigenen Gerät ein (Knopf auf der Inselkarte).</p>}

      <h3>Für Sie</h3>
      <label className="push-zeile"><input type="checkbox" checked={e.eltern_woche} onChange={(x) => void aendern({ eltern_woche: x.target.checked })} />
        <span><b>Wochenbericht</b><small>Sonntag 18:00</small></span>
      </label>
      <label className="push-zeile"><input type="checkbox" checked={e.eltern_pause} onChange={(x) => void aendern({ eltern_pause: x.target.checked })} />
        <span><b>Hinweis bei Pause</b><small>wenn 3 Tage nicht geübt wurde, höchstens 1 × pro Woche</small></span>
      </label>
      {pushMoeglich() && !iphoneHinweis
        ? <button type="button" className={aktiv ? 'adm-btn' : 'adm-btn primary'} onClick={() => void elternGeraet()}>{aktiv ? 'Auf diesem Gerät ausschalten' : 'Auf diesem Gerät einschalten'}</button>
        : <p className="adm-muted">{iphoneHinweis ? 'iPhone: Öffnen Sie diese Seite in Safari, tippen Sie auf „Teilen“ → „Zum Home-Bildschirm“ und öffnen Sie BrainFit Kids dann von dort.' : 'Dieser Browser unterstützt keine Benachrichtigungen.'}</p>}
      <button type="button" className="adm-link" onClick={() => motivationsMelodie()}>🎵 Melodie anhören</button>
      {info && <p className="adm-info">{info}</p>}
    </section>
  )
}

/** Kind: Knopf auf der Inselkarte, wenn die Eltern Erinnerungen erlaubt haben und das Gerät noch nicht angemeldet ist */
export function PushKindKnopf({ kidId }: { kidId: string }) {
  const zuKey = `bfk.push-knopf-zu.${kidId}`
  const [zeigen, setZeigen] = useState(false)
  useEffect(() => {
    if (!/^[0-9a-f]{8}-/.test(kidId) || !pushMoeglich() || Notification.permission === 'denied') return
    try { if (localStorage.getItem(zuKey) === new Date().toISOString().slice(0, 10)) return } catch { /* egal */ }
    void Promise.all([einstellungenLaden(kidId), pushAktiv(kidId, 'kind')]).then(([e, aktiv]) => setZeigen(e.kind_an && !aktiv))
  }, [kidId, zuKey])
  if (!zeigen) return null
  const an = async () => {
    const r = await pushEinschalten(kidId, 'kind')
    setZeigen(false)
    if (r === 'ok') motivationsMelodie()
  }
  const zu = () => { try { localStorage.setItem(zuKey, new Date().toISOString().slice(0, 10)) } catch { /* egal */ } setZeigen(false) }
  return (
    <div className="push-kind" role="group" aria-label="Erinnerungen">
      <button type="button" onClick={() => void an()} style={{ all: 'unset', cursor: 'pointer' }}>🔔 Erinnerungen einschalten</button>
      <button type="button" className="zu" aria-label="Später" onClick={zu} style={{ border: 0, cursor: 'pointer' }}>✕</button>
    </div>
  )
}
