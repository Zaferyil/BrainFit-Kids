import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { KidZeile } from '../lib/admin'

// Admin: automatische Benachrichtigungen ein/aus und eigene Nachrichten an Kinder/Eltern senden.

type Verlauf = { id: number; zeit: string; titel: string; text: string; ziel: string; kind: string | null; geraete: number }
type Statistik = { rolle: string; geraete: number; kinder: number }
const ZIEL_NAME: Record<string, string> = { alle: 'Alle', kind: 'Kinder', eltern: 'Eltern' }
const VORLAGEN = [
  { titel: '🧠 Neue Woche, neue Rekorde!', text: 'Schon 15 Minuten geübt? SeZa freut sich auf dich!' },
  { titel: '🎉 Neue Denkspiele!', text: 'Im Denk-Park warten neue Spiele auf dich – probier sie gleich aus!' },
  { titel: '🏆 Wochen-Challenge', text: 'Wer schafft diese Woche 5 Lerntage? Los geht’s!' },
]

export function AdminPush({ zeilen }: { zeilen: KidZeile[] }) {
  const [autoAn, setAutoAn] = useState<boolean | null>(null)
  const [stat, setStat] = useState<Statistik[]>([])
  const [verlauf, setVerlauf] = useState<Verlauf[]>([])
  const [titel, setTitel] = useState('')
  const [text, setText] = useState('')
  const [ziel, setZiel] = useState<'alle' | 'kind' | 'eltern'>('kind')
  const [kind, setKind] = useState('')
  const [info, setInfo] = useState('')
  const [laeuft, setLaeuft] = useState(false)

  const laden = async () => {
    const [{ data: g }, { data: s }, { data: v }] = await Promise.all([
      supabase.from('push_global').select('auto_an').eq('id', 1).maybeSingle(),
      supabase.rpc('push_statistik'),
      supabase.from('push_nachrichten').select('*').order('zeit', { ascending: false }).limit(20),
    ])
    setAutoAn(g?.auto_an ?? true)
    setStat((s ?? []) as Statistik[])
    setVerlauf((v ?? []) as Verlauf[])
  }
  useEffect(() => { void laden() }, [])

  const umschalten = async () => {
    const neu = !autoAn
    const { error } = await supabase.from('push_global').upsert({ id: 1, auto_an: neu, geaendert: new Date().toISOString() })
    if (error) setInfo(`Fehler: ${error.message}`)
    else { setAutoAn(neu); setInfo(neu ? 'Automatische Benachrichtigungen sind wieder an.' : 'Automatische Benachrichtigungen sind aus.') }
  }

  const geraete = (r: string) => stat.filter((s) => r === 'alle' || s.rolle === r).reduce((a, s) => a + Number(s.geraete), 0)
  const kindName = (id: string | null) => zeilen.find((z) => z.kid.id === id)?.kid.name

  const senden = async () => {
    const an = kind ? `${kindName(kind)} (${ZIEL_NAME[ziel]})` : ZIEL_NAME[ziel]
    if (!window.confirm(`Nachricht jetzt an „${an}“ senden?`)) return
    setLaeuft(true); setInfo('')
    const { data, error } = await supabase.functions.invoke('push-senden', { body: { titel, text, ziel, kind: kind || null } })
    setLaeuft(false)
    if (error || data?.fehler) { setInfo(`Nicht gesendet: ${data?.fehler ?? error?.message}`); return }
    setInfo(`Gesendet an ${data.gesendet} von ${data.geraete} Geräten ✓`)
    setTitel(''); setText('')
    void laden()
  }

  const stunde = new Date().getHours()
  return (
    <>
      <section className="adm-card">
        <div className="adm-card-head"><h2>🔔 Automatische Benachrichtigungen</h2>
          {autoAn !== null && <span className={autoAn ? 'adm-badge ok' : 'adm-badge warn'}>{autoAn ? 'An' : 'Aus'}</span>}</div>
        <p className="adm-muted">Lern-Erinnerung, Serien-Warnung, Wochenbericht und Pause-Hinweis. Eltern können einzelne Arten selbst abschalten.</p>
        <div className="push-stat">
          <span><b>{geraete('kind')}</b> Kinder-Geräte</span>
          <span><b>{geraete('eltern')}</b> Eltern-Geräte</span>
        </div>
        {autoAn !== null && <button type="button" className={autoAn ? 'adm-btn' : 'adm-btn primary'} onClick={() => void umschalten()}>{autoAn ? 'Alle automatischen Benachrichtigungen ausschalten' : 'Automatische Benachrichtigungen einschalten'}</button>}
      </section>

      <section className="adm-card push-admin">
        <div className="adm-card-head"><h2>✉️ Eigene Nachricht senden</h2><span className="adm-muted">wird sofort gesendet</span></div>
        <div className="push-vorlagen">{VORLAGEN.map((v) => <button key={v.titel} type="button" className="adm-btn" onClick={() => { setTitel(v.titel); setText(v.text) }}>{v.titel}</button>)}</div>
        <label>An<select value={ziel} onChange={(e) => setZiel(e.target.value as typeof ziel)}>
          <option value="kind">Kinder ({geraete('kind')} Geräte)</option>
          <option value="eltern">Eltern ({geraete('eltern')} Geräte)</option>
          <option value="alle">Alle ({geraete('alle')} Geräte)</option>
        </select></label>
        <label>Nur ein Kind (optional)<select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="">— alle —</option>
          {zeilen.map((z) => <option key={z.kid.id} value={z.kid.id}>{z.kid.name}</option>)}
        </select></label>
        <label>Titel<input value={titel} maxLength={80} onChange={(e) => setTitel(e.target.value)} placeholder="z. B. 🎉 Neue Denkspiele!" /></label>
        <label>Text<textarea value={text} maxLength={240} rows={3} onChange={(e) => setText(e.target.value)} placeholder="Kurz und freundlich – max. 240 Zeichen" /></label>
        {(titel || text) && <div className="push-vorschau"><img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" /><div><b>{titel || 'Titel'}</b><span>{text || 'Text'}</span></div></div>}
        {(stunde < 8 || stunde >= 20) && <p className="adm-fehler">Es ist gerade Nachtruhe (20–8 Uhr). Bitte Kindern lieber tagsüber schreiben.</p>}
        <button type="button" className="adm-btn primary" disabled={laeuft || !titel.trim() || !text.trim()} onClick={() => void senden()}>{laeuft ? 'Senden …' : 'Jetzt senden'}</button>
        {info && <p className="adm-info">{info}</p>}
      </section>

      <section className="adm-card adm-tabelle-wrap">
        <div className="adm-card-head"><h2>Gesendete Nachrichten</h2></div>
        {verlauf.length ? (
          <table className="adm-tabelle">
            <thead><tr><th>Zeit</th><th>An</th><th>Nachricht</th><th>Geräte</th></tr></thead>
            <tbody>{verlauf.map((v) => (
              <tr key={v.id}><td>{new Date(v.zeit).toLocaleString('de-AT', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>{ZIEL_NAME[v.ziel]}{v.kind ? ` · ${kindName(v.kind) ?? 'Kind'}` : ''}</td>
                <td><b>{v.titel}</b><br /><small>{v.text}</small></td><td>{v.geraete}</td></tr>
            ))}</tbody>
          </table>
        ) : <p className="adm-muted">Noch keine Nachrichten gesendet.</p>}
      </section>
    </>
  )
}
