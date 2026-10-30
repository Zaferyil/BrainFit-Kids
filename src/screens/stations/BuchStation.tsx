import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import type { BuchAuftrag, WorkbookAuftrag } from '../../data/buch'
import { SAY, STATION_INTRO } from '../../data/sprache'
import { checkErgebnis, fotoVerkleinern, hausaufgabe, PRUEF_ANZAHL, pruefbareAufgaben, pruefFragen, speichereHausaufgabe, STATUS_TEXT, type Hausaufgabe, type PruefFrage } from '../../lib/hausaufgaben'
import { finishStation, setOhneBuch } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { Keypad, StationDone, StationShell } from './StationShell'
import cover from '../../assets/buch-cover.webp'
import workbookCover from '../../assets/workbook-cover.webp'

const BUCH_TITEL = 'Mental Arithmetic Basics Book'
const WORKBOOK_TITEL = 'Mental Arithmetic Work Book'

// Arbeitsbuch-Station: Die App sagt, welche Seite, Spalte und Aufgaben in beiden Büchern dran sind.
// Das Kind rechnet im Buch mit dem Abakus. Danach beweist es mit dem Wissenscheck (3 Aufgaben aus dem Buch
// und eine Abakus-Frage), dass es die Aufgaben gerechnet hat – erst dann gibt es die Belohnung.

const seiten = (von: number, bis: number) => von === bis ? [String(von)] : [String(von), SAY.bis, String(bis)]
const seitenText = (von: number, bis: number) => von === bis ? `${von}` : `${von} – ${bis}`

type Props = { kidId: string; world: number; unit: number; runde: number; auftrag: BuchAuftrag; workbook: WorkbookAuftrag | null }
type Phase = 'buch' | 'check' | 'soroban' | 'nochmal'

export function BuchStation({ kidId, world, unit, runde, auftrag, workbook }: Props) {
  const [h, setH] = useState<Hausaufgabe>(() => hausaufgabe(kidId, world, unit, runde, auftrag, workbook))
  const [phase, setPhase] = useState<Phase>('buch')
  const [done, setDone] = useState<{ stars: number; perlen: number; text: string; say: string[] } | null>(null)
  const [started, setStarted] = useState(false)
  // Ergebnis der Buch-Fragen, bis die Abakus-Frage beantwortet ist
  const [zwischen, setZwischen] = useState<{ r: number; f: number } | null>(null)
  const pruefbar = useMemo(() => pruefbareAufgaben(h).length >= PRUEF_ANZAHL, [h])
  const spalte = auftrag.spalte === 'A' ? SAY.spalteA : SAY.spalteB
  const auftragSagen = [SAY.buchName, SAY.seite, String(auftrag.seite), spalte, SAY.aufgabe, String(auftrag.von), SAY.bis, String(auftrag.bis),
    ...(workbook ? [SAY.workbookName, SAY.seite, ...seiten(workbook.von, workbook.bis), SAY.alleAufgaben] : []),
    ...(workbook?.freiwillig ? [SAY.freiwillig, SAY.seite, ...seiten(...workbook.freiwillig)] : [])]

  useEffect(() => { if (started) void speak(auftragSagen) }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  const ohneBuch = () => { setOhneBuch(kidId, true); window.location.hash = '#/einheit' }

  // Selbst bestätigt: die Station ist geschafft, aber ohne Belohnung – die gibt es erst für den Wissenscheck
  const selbst = () => {
    const neu: Hausaufgabe = { ...h, status: h.status === 'offen' ? 'selbst' : h.status, datum: h.datum ?? new Date().toISOString() }
    speichereHausaufgabe(neu); setH(neu)
    finishStation(kidId, 'buch', 1, 0, false)
    setDone({ stars: 1, perlen: 0, text: 'Danke! Mach noch den Wissenscheck, dann bekommst du deine Belohnung.', say: [SAY.selbstDanke] })
  }

  const checkFertig = (richtig: number, falsch: number, soroban: boolean | undefined) => {
    const neu = checkErgebnis(h, richtig, falsch, soroban)
    setH(neu)
    if (neu.status !== 'bestanden' && neu.status !== 'lehrkraft') { setPhase('nochmal'); void speak(SAY.checkNochmal); return }
    // Belohnung nur einmal je Hausaufgabe
    const perlen = finishStation(kidId, 'buch', 3, richtig, !h.belohnt)
    const belohnt = { ...neu, belohnt: true }
    speichereHausaufgabe(belohnt); setH(belohnt)
    setDone({ stars: 3, perlen, text: 'Super gemacht! Du hast deinen Wissenscheck geschafft! 🌟', say: [SAY.superGemacht, SAY.checkGeschafft] })
  }

  return (
    <StationShell station="buch" title="Mein Arbeitsbuch" intro={STATION_INTRO.buch} started={started} onStart={() => setStarted(true)} say={auftragSagen}>
      {phase === 'buch' && (
        <div className="buch">
          {h.status !== 'offen' && (
            <div className={`ha-status ${h.status}`}>
              <Icon name={h.status === 'wiederholen' ? 'refresh' : 'check'} size={20} color="currentColor" strokeWidth={3} />
              <span>{STATUS_TEXT[h.status]}{h.vonLehrkraft ? ` – ${h.vonLehrkraft}` : ''}</span>
            </div>
          )}
          <div className="buch-karte">
            <div className="buch-titel">
              <img src={cover} alt="" />
              <div><span>{workbook ? 'Buch 1' : 'Dein Buch'}</span><b>{BUCH_TITEL}</b></div>
            </div>
            <div className="buch-zeile"><span>Seite</span><b>{auftrag.seite}</b></div>
            <div className="buch-zeile"><span>Spalte</span><b>{auftrag.spalte}</b></div>
            <div className="buch-zeile"><span>Aufgaben</span><b>{auftrag.von} – {auftrag.bis}</b></div>
            {workbook && (
              <>
                <div className="buch-titel workbook">
                  <img src={workbookCover} alt="" />
                  <div><span>Buch 2</span><b>{WORKBOOK_TITEL}</b></div>
                </div>
                <div className="buch-zeile"><span>{workbook.von === workbook.bis ? 'Seite' : 'Seiten'}</span><b>{seitenText(workbook.von, workbook.bis)}</b></div>
                <div className="buch-zeile"><span>Aufgaben</span><b>alle</b></div>
                {workbook.freiwillig && <div className="buch-zeile freiwillig"><span>Freiwillig</span><b>Seiten {seitenText(...workbook.freiwillig)}</b></div>}
              </>
            )}
            <p>Rechne mit dem Abakus und schreib die Ergebnisse ins Buch.</p>
          </div>
          {pruefbar ? (
            <button type="button" className="btn-primary ha-start" onClick={() => { setPhase('check'); void speak(SAY.checkStart) }}>
              <Icon name="check" color="#231A4F" size={26} strokeWidth={3} /> Aufgaben überprüfen
            </button>
          ) : (
            <p className="ha-hinweis">Für diese Aufgaben gibt es noch keinen Wissenscheck. Deine Lehrkraft schaut sie sich an.</p>
          )}
          <Foto h={h} onFoto={(foto) => { const neu = { ...h, foto }; speichereHausaufgabe(neu); setH(neu) }} />
          {h.status === 'offen' && <button type="button" className="buch-ohne" onClick={selbst}>Ich habe alles gerechnet</button>}
          <button type="button" className="buch-ohne" onClick={ohneBuch}>Ich habe kein Buch</button>
        </div>
      )}
      {phase === 'check' && (
        <Wissenscheck h={h} onFertig={(r, f) => {
          // Abakus-Frage nur, wenn alle Buchaufgaben stimmen
          if (f === 0) { setZwischen({ r, f }); setPhase('soroban'); void speak(SAY.welcheZahlKarte) } else checkFertig(r, f, undefined)
        }} />
      )}
      {phase === 'soroban' && zwischen && <SorobanFrage h={h} onFertig={(ok) => checkFertig(zwischen.r, zwischen.f, ok)} />}
      {phase === 'nochmal' && (
        <div className="buch ha-nochmal popin">
          <Perli mood="think" size={120} />
          <h2>Fast geschafft!</h2>
          <p>{h.richtig} von {h.geprueft} Aufgaben stimmen. Rechne die Aufgaben im Buch nochmal mit dem Abakus nach und probier es dann wieder.</p>
          <button type="button" className="btn-primary" onClick={() => setPhase('buch')}><Icon name="book" color="#231A4F" size={24} /> Zurück zum Buch</button>
        </div>
      )}
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={done.text} say={done.say} />}
    </StationShell>
  )
}

const buchName = (f: PruefFrage) => f.buch === 1 ? 'Buch 1' : 'Buch 2'
const wo = (f: PruefFrage) => `Seite ${f.seite}${f.spalte ? ` · Spalte ${f.spalte}` : ''} · Aufgabe ${f.nr}`

/** Drei Aufgaben aus dem Buch: das Kind tippt das Ergebnis ein, das es ins Buch geschrieben hat. Zwei Versuche je Aufgabe. */
function Wissenscheck({ h, onFertig }: { h: Hausaufgabe; onFertig: (richtig: number, falsch: number) => void }) {
  const [fragen] = useState(() => pruefFragen(h) ?? [])
  const [i, setI] = useState(0)
  const [eingabe, setEingabe] = useState('')
  const [versuch, setVersuch] = useState(0)
  const [meldung, setMeldung] = useState<'falsch' | 'weiter' | 'richtig' | null>(null)
  const [stand, setStand] = useState<('right' | 'wrong')[]>([])
  const f = fragen[i]
  if (!f) return null

  const taste = (k: string) => {
    if (meldung === 'richtig' || meldung === 'weiter') return
    setMeldung(null)
    setEingabe((e) => k === 'C' ? '' : k === 'del' ? e.slice(0, -1) : (e + k).slice(0, 5))
  }
  const weiter = (neu: ('right' | 'wrong')[]) => window.setTimeout(() => {
    if (i + 1 >= fragen.length) { onFertig(neu.filter((x) => x === 'right').length, neu.filter((x) => x === 'wrong').length); return }
    setI(i + 1); setEingabe(''); setVersuch(0); setMeldung(null)
  }, 1300)
  const pruefen = () => {
    if (!eingabe) return
    if (Number(eingabe) === f.antwort) {
      const neu = [...stand, 'right' as const]; setStand(neu); setMeldung('richtig'); void speak(SAY.richtig); weiter(neu)
    } else if (versuch === 0) {
      setVersuch(1); setMeldung('falsch'); setEingabe(''); void speak(SAY.checkFalsch)
    } else {
      const neu = [...stand, 'wrong' as const]; setStand(neu); setMeldung('weiter'); void speak(SAY.checkWeiter); weiter(neu)
    }
  }

  return (
    <div className="ha-check popin">
      <div className="ha-punkte" aria-label={`Frage ${i + 1} von ${fragen.length}`}>
        {fragen.map((_, k) => <span key={k} className={stand[k] ?? (k === i ? 'current' : '')} />)}
      </div>
      <div className={`ha-frage buch${f.buch}`}>
        <div className="ha-frage-kopf">
          <img src={f.buch === 1 ? cover : workbookCover} alt="" />
          <div><span>{buchName(f)} · Frage {i + 1} von {fragen.length}</span><b>{wo(f)}</b></div>
        </div>
        <p>Welches Ergebnis hast du in dein Buch geschrieben?</p>
        <div className={`ha-antwort ${meldung ?? ''}`}>{eingabe || '?'}</div>
        {meldung === 'falsch' && <div className="ha-meldung">Hmm, das stimmt noch nicht. Rechne die Aufgabe nochmal mit dem Abakus nach.</div>}
        {meldung === 'weiter' && <div className="ha-meldung">Nicht schlimm! Diese Aufgabe übst du nochmal.</div>}
        {meldung === 'richtig' && <div className="ha-meldung gut">Richtig!</div>}
        <button type="button" className="btn-primary ha-pruefen" disabled={!eingabe || meldung === 'richtig' || meldung === 'weiter'} onClick={pruefen}>Prüfen</button>
      </div>
      <Keypad onKey={taste} disabled={meldung === 'richtig' || meldung === 'weiter'} />
    </div>
  )
}

/** Abakus-Frage: Welche Zahl zeigt der Abakus? Die Zahl ist ein Ergebnis aus dem Buch-Auftrag. */
function SorobanFrage({ h, onFertig }: { h: Hausaufgabe; onFertig: (ok: boolean) => void }) {
  const [zahl] = useState(() => {
    const moeglich = pruefbareAufgaben(h).map((f) => f.antwort).filter((a) => a > 0 && a < 1000)
    return moeglich.length ? moeglich[Math.floor(Math.random() * moeglich.length)] : 7
  })
  const [eingabe, setEingabe] = useState('')
  const [versuch, setVersuch] = useState(0)
  const [meldung, setMeldung] = useState<'falsch' | 'richtig' | 'weiter' | null>(null)
  const taste = (k: string) => {
    if (meldung === 'richtig' || meldung === 'weiter') return
    setMeldung(null)
    setEingabe((e) => k === 'C' ? '' : k === 'del' ? e.slice(0, -1) : (e + k).slice(0, 4))
  }
  const pruefen = () => {
    if (!eingabe) return
    if (Number(eingabe) === zahl) { setMeldung('richtig'); void speak(SAY.richtig); window.setTimeout(() => onFertig(true), 1200) }
    else if (versuch === 0) { setVersuch(1); setMeldung('falsch'); setEingabe(''); void speak(SAY.checkFalschAbakus) }
    else { setMeldung('weiter'); window.setTimeout(() => onFertig(false), 1600) }
  }
  return (
    <div className="ha-check popin">
      <div className="ha-frage soroban">
        <div className="ha-frage-kopf"><div><span>Abakus-Frage</span><b>Welche Zahl zeigt der Abakus?</b></div></div>
        <div className="ha-abakus"><Abakus value={zahl} cols={3} colw={56} marker /></div>
        <div className={`ha-antwort ${meldung ?? ''}`}>{eingabe || '?'}</div>
        {meldung === 'falsch' && <div className="ha-meldung">Schau dir die Perlen nochmal genau an: Himmelsperle ist 5, jede Erdperle ist 1.</div>}
        {meldung === 'weiter' && <div className="ha-meldung">Nicht schlimm! Das übst du nochmal.</div>}
        {meldung === 'richtig' && <div className="ha-meldung gut">Richtig!</div>}
        <button type="button" className="btn-primary ha-pruefen" disabled={!eingabe || meldung === 'richtig' || meldung === 'weiter'} onClick={pruefen}>Prüfen</button>
      </div>
      <Keypad onKey={taste} disabled={meldung === 'richtig' || meldung === 'weiter'} />
    </div>
  )
}

/** Freiwillig: Foto der fertigen Buchseite für die Lehrkraft */
function Foto({ h, onFoto }: { h: Hausaufgabe; onFoto: (foto: string) => void }) {
  const [fehler, setFehler] = useState(false)
  const gewaehlt = async (e: ChangeEvent<HTMLInputElement>) => {
    const datei = e.target.files?.[0]
    if (!datei) return
    try { onFoto(await fotoVerkleinern(datei)); setFehler(false) } catch { setFehler(true) }
  }
  return (
    <label className="ha-foto">
      {h.foto ? <img src={h.foto} alt="Dein Foto vom Buch" /> : <Icon name="camera" size={22} color="currentColor" />}
      <span>{h.foto ? 'Foto ändern' : 'Foto vom Buch (freiwillig)'}</span>
      <input type="file" accept="image/*" capture="environment" onChange={(e) => void gewaehlt(e)} hidden />
      {fehler && <small>Das Foto hat nicht geklappt.</small>}
    </label>
  )
}
