import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getProgress } from '../lib/progress'
import { nextStop } from '../lib/mapPath'
import { FIGUREN, figurVon, kidPhoto, setFigur } from '../data/kinderBilder'
import { klassenNeuAufbauen } from '../data/demo'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { findClass, type Kid, type SchoolClass } from '../data/demo'
import { getSavedClass, saveClass, saveSession } from '../lib/session'
import { speak } from '../lib/speak'
import { load, save } from '../lib/storage'


const STEPS = ['Klassen-Code', 'Wähle deine Figur', 'Schulstufe']

// Schulstufe des Kindes (Kindergarten bis 6. Klasse), pro Kind auf dem Gerät gemerkt
const STUFEN = [
  { id: 0, label: 'Kiga', lang: 'Kindergarten' },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: n, label: `${n}.`, lang: `${n}. Klasse` })),
]
const stufeKey = (kidId: string) => `bfk.stufe.${kidId}`
const getStufe = (kidId: string) => load<number | null>(stufeKey(kidId), null)

export function Anmelden() {
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(() => {
    const saved = getSavedClass()
    return saved ? findClass(saved) ?? null : null
  })
  const [kid, setKid] = useState<Kid | null>(null)
  const [stufe, setStufe] = useState<number | null>(null)
  const [, neu] = useState(0)

  const step = !schoolClass ? 0 : !kid ? 1 : stufe === null ? 2 : 3
  const instruction = [
    'Wie heißt deine Klasse? Tippe den Klassen-Code ein.',
    'Wähle deine Figur! Tippe auf dein Bild.',
    `Hallo ${kid?.name ?? ''}! In welche Klasse gehst du?`,
    'Tippe deine vier Bilder.',
  ][step]
  const instructionSay = step === 2 ? [`Hallo ${kid?.name ?? ''}!`, 'In welche Klasse gehst du?'] : instruction

  return (
    <Stage className="nk" background="var(--nk-sky)">
      <Funkeln />
      <div className="nk-login">
        <div className="nk-top">
          <a href="#/" className="nk-round ghost" aria-label="Zurück"><Icon name="left" color="#FFFFFF" size={22} strokeWidth={3} /></a>
          <ol className="nk-dots" aria-label={`Schritt ${step + 1} von ${STEPS.length}: ${STEPS[step]}`}>
            {STEPS.map((label, i) => <li key={label} className={i < step ? 'done' : i === step ? 'current' : ''} />)}
          </ol>
          <button type="button" className="nk-round yellow" aria-label="Vorlesen" onClick={() => void speak(instructionSay)}>
            <Icon name="volume" color="#2B2257" size={24} />
          </button>
        </div>

        {schoolClass ? (
          !kid ? (
            <KidPicker
              key="kind"
              schoolClass={schoolClass}
              onSelect={(k) => { setKid(k); setStufe(null); void speak(figurVon(k.id) ? [`Hallo ${k.name}!`, 'In welche Klasse gehst du?'] : 'Wähle deine Figur! Tippe auf dein Bild.') }}
              onChangeClass={() => { saveClass(null); setSchoolClass(null); setKid(null) }}
            />
          ) : !figurVon(kid.id) ? (
            <FigurPicker key="figur" kid={kid} onPick={(f) => { setFigur(kid.id, f); klassenNeuAufbauen(); neu((x) => x + 1); void speak([`Hallo ${kid.name}!`, 'In welche Klasse gehst du?']) }} />
          ) : stufe === null ? (
            <StufePicker key="stufe" kid={kid} onBack={() => setKid(null)} onPick={(n) => { save(stufeKey(kid.id), n); saveSession({ classCode: schoolClass.code, kidId: kid.id }); setStufe(n) }} />
          ) : (
            <section className="nk-step popin"><LosPopup kid={kid} /></section>
          )
        ) : (
          <ClassCode onFound={(c) => { saveClass(c.code); setSchoolClass(c) }} />
        )}
      </div>
    </Stage>
  )
}

/** Sterne und Lichtflecken im Hintergrund des neuen Looks */
export function Funkeln() {
  return (
    <svg className="nk-funkeln" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="340" cy="80" r="70" fill="#FFFFFF" opacity=".13" />
      <circle cx="20" cy="620" r="100" fill="#FFFFFF" opacity=".09" />
      <path d="M60 140l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFE58A" />
      <path d="M320 760l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFE58A" />
      <circle cx="120" cy="60" r="2" fill="#FFFFFF" /><circle cx="250" cy="200" r="1.6" fill="#FFFFFF" /><circle cx="360" cy="420" r="2" fill="#FFFFFF" opacity=".8" />
    </svg>
  )
}

function ClassCode({ onFound }: { onFound: (c: SchoolClass) => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const c = findClass(code)
    if (c) onFound(c)
    else {
      setError(true)
      speak('Diesen Code kennen wir nicht. Schau nochmal nach.')
    }
  }

  return (
    <section className="nk-step popin">
      <header className="nk-title">
        <Perli mood={error ? 'think' : 'happy'} size={120} />
        <h1>Wie heißt deine Klasse?</h1>
        <p>Den Code bekommst du von deiner Lehrerin.</p>
      </header>
      <form className="nk-code" onSubmit={submit}>
        <label htmlFor="class-code" className="sr-only">Klassen-Code</label>
        <input
          id="class-code"
          className={error ? 'error' : ''}
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(false) }}
          placeholder="z. B. LINZ-7K"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
        />
        {error && <p className="nk-wrong" role="alert">Diesen Code kennen wir nicht. Schau nochmal nach.</p>}
        <button type="submit" className="nk-btn yellow big" disabled={code.trim().length < 3}>
          Weiter
          <Icon name="right" size={26} color="#2B2257" strokeWidth={3} />
        </button>
        <p className="nk-foot dim">Zum Ausprobieren: LINZ-7K</p>
      </form>
    </section>
  )
}

const NEIGUNG = [-6, 5, 4, -4, 7, -3, 5, -5]

function KidPicker({ schoolClass, onSelect, onChangeClass }: {
  schoolClass: SchoolClass
  onSelect: (k: Kid) => void
  onChangeClass: () => void
}) {
  return (
    <section className="nk-step popin" aria-labelledby="nk-wer">
      <header className="nk-title">
        <h1 id="nk-wer">Wähle deine Figur!</h1>
        <p>Tippe auf dein Bild.</p>
      </header>
      <div className="nk-kids">
        {schoolClass.kids.map((k, i) => (
          <button key={k.id} type="button" className="nk-kid" style={{ rotate: `${NEIGUNG[i % NEIGUNG.length]}deg` }} onClick={() => onSelect(k)} aria-label={k.name}>
            {figurVon(k.id) ? <img src={kidPhoto(figurVon(k.id)!)} alt="" /> : <span className="nk-neu"><b>?</b>{k.name}</span>}
          </button>
        ))}
      </div>
      <p className="nk-foot">Nicht dabei? <button type="button" onClick={onChangeClass}>Andere Klasse</button></p>
    </section>
  )
}

function StufePicker({ kid, onPick, onBack }: { kid: Kid; onPick: (n: number) => void; onBack: () => void }) {
  const saved = getStufe(kid.id)
  return (
    <section className="nk-step popin" aria-labelledby="nk-stufe">
      <header className="nk-title">
        <Avatar size={84} {...kid.avatar} />
        <p>Hallo {kid.name}!</p>
        <h1 id="nk-stufe">In welche Klasse gehst du?</h1>
      </header>
      <button type="button" className={saved === 0 ? 'nk-kiga active' : 'nk-kiga'} onClick={() => onPick(0)}>
        <strong>Kiga</strong><span>Kindergarten</span>
      </button>
      <div className="nk-stufen">
        {STUFEN.slice(1).map((s, i) => (
          <button key={s.id} type="button" aria-label={s.lang} className={s.id === saved ? 'nk-perle active' : 'nk-perle'} style={{ rotate: `${NEIGUNG[i] / 1.5}deg` }} onClick={() => onPick(s.id)}>
            <strong>{s.label}</strong><span>Klasse</span>
          </button>
        ))}
      </div>
      <p className="nk-foot"><button type="button" onClick={onBack}>Anderes Kind</button></p>
    </section>
  )
}


/** Nach dem richtigen Geheim-Code: großer runder Knopf, der zur Karte führt. */
function LosPopup({ kid }: { kid: Kid }) {
  const next = nextStop(kid, getProgress(kid.id))
  // ins body, damit der Schleier den ganzen Bildschirm bedeckt (der Schritt selbst ist animiert und würde fixed einsperren)
  return createPortal(
    <div className="nk-los-popup" role="dialog" aria-modal="true" aria-label="Los geht’s">
      <div className="nk-los-karte popin">
        <small>Hallo {kid.name}!</small>
        <strong>{next.title}</strong>
        <a href="#/inseln" className="zh-los">
          <Icon name="play" color="#2B1A7A" fill="#2B1A7A" size={58} />
          <span>Los geht’s</span>
        </a>
      </div>
    </div>,
    document.body,
  )
}

/** Erster Login: Das Kind sucht sich seine Figur aus */
function FigurPicker({ kid, onPick }: { kid: Kid; onPick: (f: string) => void }) {
  return (
    <section className="nk-step popin" aria-labelledby="nk-figur">
      <header className="nk-title">
        <h1 id="nk-figur">Hallo {kid.name}!</h1>
        <p>Wähle deine Figur! Tippe auf dein Bild.</p>
      </header>
      <div className="nk-kids">
        {FIGUREN.map((f, i) => (
          <button key={f} type="button" className="nk-kid" style={{ rotate: `${NEIGUNG[i % NEIGUNG.length]}deg` }} onClick={() => onPick(f)} aria-label={`Figur ${i + 1}`}>
            <img src={kidPhoto(f)} alt="" />
          </button>
        ))}
      </div>
    </section>
  )
}
