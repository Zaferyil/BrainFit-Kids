import { useEffect, useMemo, useRef, useState } from 'react'
import { ALLE_LEKTIONEN } from '../lib/admin'
import type { Kid } from '../data/demo'
import { getProgress } from '../lib/progress'
import { FAEHIGKEITEN, MIN_VERGLEICH, berichtAktualisieren, einschaetzung, perzentil, verlauf, vergleichLaden, type Vergleich, type Werte } from '../lib/bericht'
import { stufeVon } from '../lib/rangliste'

// Lernbericht für Kind und Eltern: Überblick, Fähigkeiten im Vergleich zur Schulstufe, Platzierung,
// Entwicklung über die Monate und eine pädagogische Einschätzung. Karten zum Wischen wie in der App.

const FARBE: Record<string, string> = { rechnen: '#5B47D6', tempo: '#FF8A1F', konzentration: '#14B86A', aufmerksamkeit: '#1E9BFF', gedaechtnis: '#FF4FA3' }
const STUFE = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
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

  const karten = ['Überblick', 'Fähigkeiten', 'Platzierung', 'Entwicklung', 'Einschätzung']
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
  const punkte = v.map(([m, x]) => ({ m, w: x.werte?.[f] ?? 0 }))

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

        {/* 2 Fähigkeiten */}
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
              <p className="ber-zitat">„{werte[f] === 0 ? `Noch keine Punkte bei ${FAEHIGKEITEN.find((x) => x.id === f)!.name} – leg los und klettere die Treppe hinauf!` : top > 50 ? `Noch ${Math.max(1, (vgl!.mittel as Werte)[f] - werte[f])} Punkte bis zum Durchschnitt – das schaffst ${du === 'Du' ? 'du' : kid.name}!` : <>{du === 'Du' ? 'Du bist' : `${kid.name} ist`} bei {FAEHIGKEITEN.find((x) => x.id === f)!.name} unter den <b>Top {top} %</b>!</>}“</p>
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
              {punkte.length > 1 && <polyline fill="none" stroke={FARBE[f]} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"
                points={punkte.map((q, i) => `${30 + (i * 282) / Math.max(1, punkte.length - 1)},${160 - q.w * 1.4}`).join(' ')} />}
              {punkte.map((q, i) => <g key={q.m}><circle cx={30 + (i * 282) / Math.max(1, punkte.length - 1)} cy={160 - q.w * 1.4} r="5" fill={FARBE[f]} />
                <text className="m" x={30 + (i * 282) / Math.max(1, punkte.length - 1)} y="177">{MONAT(q.m)}</text></g>)}
            </svg>
            {chips}
            <p className="ber-zitat">„{punkte.length < 2 ? 'Ab dem nächsten Monat siehst du hier, wie du dich entwickelst.' : punkte[punkte.length - 1].w >= punkte[0].w ? 'Es geht aufwärts – weiter so!' : 'Dranbleiben lohnt sich – kleine Schritte jeden Tag.'}“</p>
          </div>
        </section>

        {/* 5 Einschätzung */}
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
