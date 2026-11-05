import { schwierigeRegeln, verlauf as lernVerlauf } from '../lib/lernspur'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ALLE_LEKTIONEN } from '../lib/admin'
import type { Kid } from '../data/demo'
import { getProgress } from '../lib/progress'
import { FAEHIGKEITEN, MIN_VERGLEICH, berichtAktualisieren, einschaetzung, perzentil, verlauf, vergleichLaden, type Vergleich, type Werte } from '../lib/bericht'
import { stufeVon } from '../lib/rangliste'
import { load } from '../lib/storage'
import type { Aktivitaet } from '../lib/daily'
import { ALTE_BEREICHE, KATEGORIEN } from '../games/registry'

// Lernbericht für Kind und Eltern: Überblick, Fähigkeiten im Vergleich zur Schulstufe, Platzierung,
// Entwicklung über die Monate und eine pädagogische Einschätzung. Karten zum Wischen wie in der App.

const FARBE: Record<string, string> = { rechnen: '#5B47D6', tempo: '#FF8A1F', konzentration: '#14B86A', aufmerksamkeit: '#1E9BFF', gedaechtnis: '#FF4FA3' }
const STUFE = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
const TIPP: Record<string, string> = { rechnen: 'Mach die nächste Lektion auf der Karte!', tempo: 'Spiel „Schnell zählen“ im Denkpark!', konzentration: 'Spiel „Perlen-Jagd“ oder „Farb-Wort“ im Denkpark!', aufmerksamkeit: 'Spiel „Muster“ oder „Zahlen vergleichen“ im Denkpark!', gedaechtnis: 'Spiel „Memory“ oder „Zahlen merken“ im Denkpark!' }
const MONAT = (m: string) => new Date(m + '-01').toLocaleDateString('de-AT', { month: 'short' })

type Props = { kid: Kid; eltern?: boolean; zurueck?: { href?: string; onClick?: () => void } }

export function Bericht({ kid, eltern, zurueck }: Props) {
  const werte = useMemo(() => berichtAktualisieren(kid), [kid])
  const [vgl, setVgl] = useState<Vergleich | null>(null)
  const [f, setF] = useState(FAEHIGKEITEN[0].id)
  const [karte, setKarte] = useState(0)
  const leiste = useRef<HTMLDivElement>(null)
  useEffect(() => { void vergleichLaden(kid).then(setVgl) }, [kid])

  const p = getProgress(kid.id)
  const v = verlauf(kid.id)
  const monat = v[v.length - 1]?.[1]
  const lektion = Math.max(0, ALLE_LEKTIONEN.findIndex((l) => l.world === p.world && l.unit === p.unit))
  const mitVergleich = !!vgl && vgl.n >= MIN_VERGLEICH && !!vgl.mittel
  const mittel = mitVergleich ? (vgl!.mittel as Werte) : undefined
  const ein = einschaetzung(werte, kid.name, mittel)
  const du = eltern ? kid.name : 'Du'
  const stufe = STUFE[stufeVon(kid)] ?? ''
  const gruppe = vgl?.richtwert ? `BrainFit-Richtwerte · ${stufe}` : `${vgl?.n ?? 0} Kindern · ${stufe}`

  // Aktivität: wie viele Lektions-Stationen und Denkspiele in welchem Bereich
  const akt = load<Aktivitaet>(`bfk.aktivitaet.${kid.id}`, { bereiche: {}, richtig: 0, gesamt: 0 })
  // Aktivität je Kategorie (frühere Bereichs-Schlüssel werden zugeordnet)
  const proKat: Record<string, number> = {}
  for (const [k, n] of Object.entries(akt.bereiche)) { const z = ALTE_BEREICHE[k] ?? k; proKat[z] = (proKat[z] ?? 0) + n }
  const TEILE = KATEGORIEN.map((k) => ({ id: k.id, name: k.id === 'rechnen' ? 'Rechnen (Lektionen & Mathe-Spiele)' : k.name, color: k.color }))
  const teile = TEILE.map((t) => ({ ...t, n: proKat[t.id] ?? 0 })).filter((t) => t.n > 0)
  const gesamtAkt = teile.reduce((a, t) => a + t.n, 0)
  const quote = akt.gesamt ? Math.round((akt.richtig / akt.gesamt) * 100) : 0
  let winkel = -Math.PI / 2
  const stuecke = teile.map((t) => {
    const w = (t.n / gesamtAkt) * Math.PI * 2, a0 = winkel, a1 = winkel + w; winkel = a1
    const p = (a: number, r = 80) => `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`
    const mitte = (a0 + a1) / 2
    const d = teile.length === 1 ? 'M100,20 A80,80 0 1 1 99.99,20 Z' : `M100,100 L${p(a0)} A80,80 0 ${w > Math.PI ? 1 : 0} 1 ${p(a1)} Z`
    return { ...t, d, lx: 100 + 52 * Math.cos(mitte), ly: 100 + 52 * Math.sin(mitte), pz: Math.round((t.n / gesamtAkt) * 100) }
  })
  const meist = [...teile].sort((a, b) => b.n - a.n)[0]

  const karten = ['Überblick', 'Aktivität', 'Fähigkeiten', 'Platzierung', 'Entwicklung', 'Tempo', 'Mein Jahr', 'Einschätzung']
  const zu = (i: number) => leiste.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
  const onScroll = () => { const el = leiste.current; if (el) setKarte(Math.round(el.scrollLeft / el.clientWidth)) }

  const chips = (
    <div className="ber-chips">{FAEHIGKEITEN.map((x) => (
      <button key={x.id} type="button" className={f === x.id ? 'an' : ''} style={{ ['--c' as string]: FARBE[x.id] }} onClick={() => setF(x.id)}>{x.name}</button>
    ))}</div>
  )

  // Platzierung: Anteil der Vergleichskinder mit weniger Punkten
  const pz = mitVergleich ? perzentil(werte[f], vgl!.werte?.[f]) : 0
  const top = Math.max(1, 100 - pz)
  // Entwicklung: Linie der Monatswerte
  // Jahresansicht: immer die letzten 12 Monate (auch ohne Daten), damit Monat für Monat sichtbar ist
  const vm = Object.fromEntries(v)
  const jetzt = new Date()
  const monate = Array.from({ length: 12 }, (_, i) => { const d = new Date(jetzt.getFullYear(), jetzt.getMonth() - 11 + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` })
  const X = (i: number) => 30 + (i * 282) / 11
  const punkte = monate.map((m, i) => ({ m, i, w: vm[m]?.werte?.[f] })).filter((q) => q.w !== undefined) as { m: string; i: number; w: number }[]
  const jahr = monate.map((m) => vm[m] ?? { minuten: 0, aufgaben: 0, stationen: 0, spiele: 0, tage: [] })
  const maxMin = Math.max(60, ...jahr.map((x) => x.minuten))
  const summe = { minuten: jahr.reduce((a, x) => a + x.minuten, 0), tage: jahr.reduce((a, x) => a + x.tage.length, 0), aufgaben: jahr.reduce((a, x) => a + x.aufgaben, 0) }

  // Tempo & Genauigkeit der letzten 14 Übungstage
  const spur = lernVerlauf(kid.id)
  const SX = (i: number) => 30 + (i * 260) / Math.max(1, spur.length - 1)
  const mitSek = spur.map((q, i) => ({ ...q, i })).filter((q) => q.sek !== null)
  const maxSek = Math.max(2, ...mitSek.map((q) => q.sek!))
  const schwer = schwierigeRegeln(kid.id)

  return (
    <div className="ber">
      <header className="ber-kopf">
        {zurueck && (zurueck.href ? <a className="ber-zurueck" href={zurueck.href} aria-label="Zurück">←</a> : <button type="button" className="ber-zurueck" onClick={zurueck.onClick} aria-label="Zurück">←</button>)}
        <div><h1>{eltern ? `Lernbericht von ${kid.name}` : 'Mein Lernbericht'}</h1><small>{stufe} · Stand {new Date().toLocaleDateString('de-AT')}</small></div>
      </header>

      <div className="ber-leiste" ref={leiste} onScroll={onScroll}>
        {/* 1 Überblick */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#FF6B6B,#FF9F43)' }}>
          <h2>Überblick</h2>
          <div className="ber-weiss">
            <h3>Dieser Monat</h3>
            <div className="ber-kacheln">
              <div><b>{monat?.minuten ?? 0}</b><span>Minuten gelernt</span></div>
              <div><b>{monat?.tage.length ?? 0}</b><span>Lerntage</span></div>
              <div><b>{monat?.aufgaben ?? 0}</b><span>Aufgaben gelöst</span></div>
              <div><b>{monat?.spiele ?? 0}</b><span>Denkspiele</span></div>
            </div>
            <div className="ber-lektion"><span>Lektion</span><b>{lektion + 1} <small>von {ALLE_LEKTIONEN.length}</small></b>
              <i><em style={{ width: `${(lektion / ALLE_LEKTIONEN.length) * 100}%` }} /></i></div>
            <p className="ber-zitat">„{(monat?.tage.length ?? 0) >= 12 ? `${du === 'Du' ? 'Du übst' : `${kid.name} übt`} richtig regelmäßig – super!` : 'Ein bisschen jeden Tag bringt am meisten: etwa 15 Minuten.'}“</p>
          </div>
        </section>

        {/* 2 Aktivität: Kreisdiagramm */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#FF6B6B,#FF8FC8)' }}>
          <h2>Aktivität</h2>
          <div className="ber-weiss">
            {gesamtAkt ? <>
              <div className="ber-kreis">
                <svg viewBox="0 0 200 200" role="img" aria-label="Aktivität nach Bereichen">
                  {stuecke.map((t) => <path key={t.id} d={t.d} fill={t.color} stroke="#fff" strokeWidth="2" />)}
                  {stuecke.filter((t) => t.pz >= 7).map((t) => <text key={t.id} x={t.lx} y={t.ly} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontWeight="900" fontSize="15">{t.pz}%</text>)}
                </svg>
                <ul>{TEILE.map((t) => <li key={t.id} className={proKat[t.id] ? '' : 'leer'}><i style={{ background: t.color }} />{t.name}</li>)}</ul>
              </div>
              <div className="ber-zeile"><span>Aktivitäten gesamt</span><b>{gesamtAkt}</b></div>
              <div className="ber-zeile"><span>Richtig</span><b>{quote} %</b></div>
              <p className="ber-zitat">„{teile.length >= 4 ? 'Schön abwechslungsreich – so trainierst du alle Fähigkeiten!' : `Am meisten: ${meist.name}. Probier auch andere Denkspiele aus!`}“</p>
            </> : <p className="ber-leer">Nach den ersten Lektionen und Denkspielen siehst du hier, womit {du === 'Du' ? 'du dich' : `${kid.name} sich`} am meisten beschäftigt.</p>}
          </div>
        </section>

        {/* 3 Fähigkeiten */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#FF9F43,#A8D86E)' }}>
          <h2>Fähigkeiten</h2>
          <div className="ber-weiss">
            <div className="ber-balken">
              {FAEHIGKEITEN.map((x) => (
                <div key={x.id}>
                  <span className="ber-b-name" lang="de">{x.name}</span>
                  <div className="ber-b-paar">
                    <i style={{ height: `${Math.max(2, werte[x.id])}%`, background: FARBE[x.id] }} title={`${werte[x.id]}`} />
                    {mittel && <i className="avg" style={{ height: `${Math.max(2, mittel[x.id])}%`, background: FARBE[x.id] }} />}
                  </div>
                  <small>{eltern ? 'Kind' : 'Ich'}{mittel ? ' · Ø' : ''}</small>
                </div>
              ))}
            </div>
            <div className="ber-zeile"><span>Vergleich</span><b>{mitVergleich ? (vgl!.richtwert ? `Richtwerte · ${stufe}` : `${stufe}, ${vgl!.n} Kinder`) : 'wird geladen …'}</b></div>
            <p className="ber-zitat">„{mitVergleich ? 'Kräftige Balken: ' + (eltern ? 'Ihr Kind' : 'du') + (vgl!.richtwert ? '. Helle Balken: Richtwert der Schulstufe – das Ziel zum Überholen!' : '. Helle Balken: Durchschnitt der Schulstufe.') : `Der Vergleich erscheint, sobald mindestens ${MIN_VERGLEICH} Kinder der Schulstufe mitlernen.`}“</p>
          </div>
        </section>

        {/* 3 Platzierung */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#A8D86E,#4FC3B4)' }}>
          <h2>Platzierung</h2>
          <div className="ber-weiss">
            {mitVergleich ? <>
              <div className="ber-treppe">
                {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map((s, i) => (
                  <div key={s} className={top <= s ? 'erreicht' : ''} style={{ ['--i' as string]: i, ['--c' as string]: FARBE[f] }}>Top {s} %</div>
                ))}
              </div>
              {chips}
              <div className="ber-zeile"><span>Verglichen mit</span><b>{gruppe}</b></div>
              <p className="ber-zitat">„{werte[f] === 0 ? `Noch keine Punkte bei ${FAEHIGKEITEN.find((x) => x.id === f)!.name}. Tipp: ${TIPP[f]}` : top > 50 ? `Noch ${Math.max(1, (vgl!.mittel as Werte)[f] - werte[f])} Punkte bis zum Durchschnitt – das schaffst ${du === 'Du' ? 'du' : kid.name}!` : <>{du === 'Du' ? 'Du bist' : `${kid.name} ist`} bei {FAEHIGKEITEN.find((x) => x.id === f)!.name} unter den <b>Top {top} %</b>!</>}“</p>
            </> : <p className="ber-leer">Die Platzierung erscheint, sobald mindestens {MIN_VERGLEICH} Kinder derselben Schulstufe mitlernen. Namen anderer Kinder werden nie angezeigt.</p>}
          </div>
        </section>

        {/* 4 Entwicklung */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#4FC3B4,#6C7BFF)' }}>
          <h2>Entwicklung</h2>
          <div className="ber-weiss">
            <h3 style={{ color: FARBE[f] }}>{FAEHIGKEITEN.find((x) => x.id === f)!.name}</h3>
            <svg className="ber-linie" viewBox="0 0 320 180" role="img" aria-label="Entwicklung über die Monate">
              {[0, 25, 50, 75, 100].map((y) => <g key={y}><line x1="30" x2="312" y1={160 - y * 1.4} y2={160 - y * 1.4} /><text x="24" y={164 - y * 1.4}>{y}</text></g>)}
              {monate.map((m, i) => <text key={m} className="m" x={X(i)} y="177">{MONAT(m).slice(0, 3)}</text>)}
              {punkte.length > 1 && <polyline fill="none" stroke={FARBE[f]} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"
                points={punkte.map((q) => `${X(q.i)},${160 - q.w * 1.4}`).join(' ')} />}
              {punkte.map((q) => <circle key={q.m} cx={X(q.i)} cy={160 - q.w * 1.4} r="5" fill={FARBE[f]} />)}
            </svg>
            {chips}
            <p className="ber-zitat">„{punkte.length < 2 ? 'Ab dem nächsten Monat siehst du hier, wie du dich entwickelst.' : punkte[punkte.length - 1].w >= punkte[0].w ? 'Es geht aufwärts – weiter so!' : 'Dranbleiben lohnt sich – kleine Schritte jeden Tag.'}“</p>
          </div>
        </section>

        {/* 4b Tempo & Genauigkeit (Lernspur) */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#6C7BFF,#4FC3B4)' }}>
          <h2>Tempo & Genauigkeit</h2>
          <div className="ber-weiss">
            {spur.length < 2 ? <p className="ber-leer">Nach ein paar Übungstagen siehst du hier, wie {du === 'Du' ? 'du' : kid.name} schneller und genauer {du === 'Du' ? 'wirst' : 'wird'}.</p> : <>
              <svg className="ber-linie" viewBox="0 0 320 180" role="img" aria-label="Genauigkeit und Antwortzeit pro Tag">
                {[0, 25, 50, 75, 100].map((y) => <g key={y}><line x1="30" x2="290" y1={160 - y * 1.4} y2={160 - y * 1.4} /><text x="24" y={164 - y * 1.4}>{y}</text></g>)}
                {[0, maxSek / 2, maxSek].map((y) => <text key={y} x="312" y={164 - (y / maxSek) * 140} style={{ fill: '#FF8A1F' }}>{y.toFixed(y < 10 ? 1 : 0)}s</text>)}
                {spur.map((q, i) => i % Math.ceil(spur.length / 7) === 0 && <text key={q.tag} className="m" x={SX(i)} y="177">{q.tag.slice(8)}.{q.tag.slice(5, 7)}</text>)}
                <polyline fill="none" stroke="#3DBE5B" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={spur.map((q, i) => `${SX(i)},${160 - q.prozent * 1.4}`).join(' ')} />
                {spur.map((q, i) => <circle key={q.tag} cx={SX(i)} cy={160 - q.prozent * 1.4} r="4" fill="#3DBE5B" />)}
                {mitSek.length > 1 && <polyline fill="none" stroke="#FF8A1F" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" points={mitSek.map((q) => `${SX(q.i)},${160 - (q.sek! / maxSek) * 140}`).join(' ')} />}
              </svg>
              <div className="ber-legende"><span style={{ color: '#3DBE5B' }}>● richtig (%)</span><span style={{ color: '#FF8A1F' }}>– – Ø Antwortzeit</span></div>
              {mitSek.length > 1 && <p className="ber-zitat">„Antwortzeit: Ø {mitSek[0].sek!.toFixed(1)} s → {mitSek[mitSek.length - 1].sek!.toFixed(1)} s · Genauigkeit: {spur[0].prozent} % → {spur[spur.length - 1].prozent} %“</p>}
            </>}
            {schwer.length > 0 && <>
              <h3>Noch üben</h3>
              <ul className="ber-schwer">{schwer.map((r) => <li key={r.key}><span>{r.name}</span><b>{Math.round(r.quote * 100)} % Fehler</b></li>)}</ul>
              {!eltern && <a className="ber-wdh" href="#/wiederholen">🔁 Jetzt wiederholen</a>}
            </>}
          </div>
        </section>

        {/* 5 Jahr: Lernzeit Monat für Monat */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#FF8FC8,#6C7BFF)' }}>
          <h2>Mein Jahr</h2>
          <div className="ber-weiss">
            <h3>Lernzeit pro Monat</h3>
            <svg className="ber-linie" viewBox="0 0 320 180" role="img" aria-label="Lernminuten der letzten 12 Monate">
              <line x1="30" x2="312" y1="160" y2="160" />
              {jahr.map((x, i) => {
                const h = (x.minuten / maxMin) * 130
                return <g key={monate[i]}>
                  <rect x={X(i) - 9} y={160 - h} width="18" height={Math.max(h, x.minuten ? 3 : 0)} rx="5" fill={i === 11 ? '#FF8A1F' : '#8C7BFF'} />
                  {x.minuten > 0 && <text className="m" x={X(i)} y={154 - h}>{x.minuten}</text>}
                  <text className="m" x={X(i)} y="177">{MONAT(monate[i]).slice(0, 3)}</text>
                </g>
              })}
            </svg>
            <div className="ber-kacheln">
              <div><b>{Math.round(summe.minuten / 60 * 10) / 10}</b><span>Stunden gelernt</span></div>
              <div><b>{summe.tage}</b><span>Lerntage</span></div>
              <div><b>{summe.aufgaben}</b><span>Aufgaben gelöst</span></div>
              <div><b>{jahr.filter((x) => x.minuten > 0).length}</b><span>aktive Monate</span></div>
            </div>
            <p className="ber-zitat">„Die letzten 12 Monate auf einen Blick – jeder Balken ist ein Monat.“</p>
          </div>
        </section>

        {/* 6 Einschätzung */}
        <section className="ber-karte" style={{ ['--k' as string]: 'linear-gradient(135deg,#6C7BFF,#B57CFF)' }}>
          <h2>{eltern ? 'Pädagogische Einschätzung' : 'Das kannst du schon'}</h2>
          <div className="ber-weiss ber-text">
            {ein.staerke && <div className="ber-punkt gut"><b>⭐ Stärke</b><span>{ein.staerke.name}: {ein.staerke.text}</span></div>}
            {ein.foerdern && <div className="ber-punkt"><b>🌱 Fördern</b><span>{ein.foerdern.name}: {ein.foerdern.text}</span></div>}
            <p>{ein.text}</p>
            {eltern && <p className="ber-klein">Die Werte (0–100) berechnen sich aus den Sternen in Übungen, Kopfrechnen und Abschlusstests sowie den erreichten Stufen in den Denkspielen. Verglichen wird nur mit Kindern derselben Schulstufe – ohne Namen.</p>}
          </div>
        </section>
      </div>

      <div className="ber-punkte" role="tablist">
        {karten.map((t, i) => <button key={t} type="button" role="tab" aria-selected={karte === i} aria-label={t} className={karte === i ? 'an' : ''} onClick={() => zu(i)} />)}
      </div>
    </div>
  )
}
