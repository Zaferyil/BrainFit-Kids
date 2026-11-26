import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

// Gemeinsames Layout für Admin- und Eltern-Bereich: Seitenleiste links (gruppierte Menüpunkte),
// rechts Kopfzeile mit Seitentitel und darunter der Inhalt. Einklappbar; auf dem Handy als Schublade.
export type PanelPunkt<T extends string> = { id: T; titel: string; icon: IconName; gruppe: string; info?: string; zahl?: number }
export type PanelFuss = { titel: string; icon: IconName; href?: string; onClick?: () => void }

type Props<T extends string> = {
  marke: ReactNode
  name: string
  rolle: string
  punkte: PanelPunkt<T>[]
  aktiv: T
  onWahl: (id: T) => void
  fuss: PanelFuss[]
  kopfRechts?: ReactNode
  speicherKey: string
  children: ReactNode
}

export function PanelLayout<T extends string>({ marke, name, rolle, punkte, aktiv, onWahl, fuss, kopfRechts, speicherKey, children }: Props<T>) {
  const [menue, setMenue] = useState(false)
  const [schmal, setSchmal] = useState(() => { try { return localStorage.getItem(speicherKey + '-schmal') === '1' } catch { return false } })
  const umschalten = () => setSchmal((v) => { try { localStorage.setItem(speicherKey + '-schmal', v ? '0' : '1') } catch { /* egal */ }; return !v })
  const wahl = (id: T) => { setMenue(false); onWahl(id); window.scrollTo(0, 0) }
  const gruppen = [...new Set(punkte.map((t) => t.gruppe))]
  const a = punkte.find((t) => t.id === aktiv) ?? punkte[0]
  return (
    <div className={'adm adm-wp' + (schmal ? ' schmal' : '') + (menue ? ' menue-offen' : '')}>
      <aside className="adm-side" aria-label="Bereiche">
        <div className="adm-side-brand">
          <span className="adm-side-logo">{marke}</span>
          <span className="adm-side-name"><b>{name}</b><small>{rolle}</small></span>
        </div>
        <nav className="adm-side-nav">
          {gruppen.map((g) => (
            <div key={g || 'start'} className="adm-side-gruppe">
              {g && <span className="adm-side-titel">{g}</span>}
              {punkte.filter((t) => t.gruppe === g).map((t) => (
                <button key={t.id} type="button" className={aktiv === t.id ? 'on' : ''} onClick={() => wahl(t.id)} title={t.titel} aria-current={aktiv === t.id ? 'page' : undefined}>
                  <Icon name={t.icon} size={19} color="currentColor" /><span>{t.titel}</span>
                  {!!t.zahl && <em className="adm-side-zahl">{t.zahl}</em>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side-fuss">
          {fuss.map((f) => f.href
            ? <a key={f.titel} href={f.href} title={f.titel}><Icon name={f.icon} size={18} color="currentColor" /><span>{f.titel}</span></a>
            : <button key={f.titel} type="button" onClick={f.onClick} title={f.titel}><Icon name={f.icon} size={18} color="currentColor" /><span>{f.titel}</span></button>)}
          <button type="button" className="adm-side-klein" onClick={umschalten} title={schmal ? 'Menü ausklappen' : 'Menü einklappen'}><Icon name={schmal ? 'right' : 'left'} size={18} color="currentColor" /><span>Menü einklappen</span></button>
        </div>
      </aside>
      {menue && <button type="button" className="adm-side-schleier" aria-label="Menü schließen" onClick={() => setMenue(false)} />}
      <div className="adm-wp-rechts">
        <header className="adm-top">
          <button type="button" className="adm-top-menue" onClick={() => setMenue(true)} aria-label="Menü öffnen"><Icon name="bars" size={20} color="currentColor" /></button>
          <div className="adm-top-titel">
            <small>{a.gruppe || 'Start'} / {a.titel}</small>
            <h1>{a.titel}</h1>
          </div>
          {kopfRechts && <div className="adm-head-r">{kopfRechts}</div>}
        </header>
        <main className="adm-main">
          {a.info && <p className="adm-top-info">{a.info}</p>}
          {children}
        </main>
      </div>
    </div>
  )
}
