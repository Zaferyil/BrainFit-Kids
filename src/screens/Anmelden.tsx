import { SeZa } from '../components/SeZa'
import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getProgress } from '../lib/progress'
import { nextStop } from '../lib/mapPath'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { findeLogin, type Kid, type SchoolClass } from '../data/demo'
import { saveSession } from '../lib/session'
import { hatStimme, speak } from '../lib/speak'
import { load, save } from '../lib/storage'


const STEPS = ['Anmelden', 'Schulstufe']

// Neue Namen haben keine Aufnahme: dann nur die Frage sprechen, nie mit der Telefonstimme
const klasseFrage = (name: string) => (hatStimme(`Hallo ${name}!`) ? [`Hallo ${name}!`, 'In welche Klasse gehst du?'] : ['In welche Klasse gehst du?'])

// Schulstufe des Kindes (Kindergarten bis 6. Klasse), pro Kind auf dem Gerät gemerkt
const STUFEN = [
  { id: 0, label: 'Kiga', lang: 'Kindergarten' },
  ...[1, 2, 3, 4, 5, 6].map((n) => ({ id: n, label: `${n}.`, lang: `${n}. Klasse` })),
]
const stufeKey = (kidId: string) => `bfk.stufe.${kidId}`
const getStufe = (kidId: string) => load<number | null>(stufeKey(kidId), null)

export function Anmelden() {
  const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null)
  const [kid, setKid] = useState<Kid | null>(null)
  const [stufe, setStufe] = useState<number | null>(null)

  const step = !schoolClass || !kid ? 0 : stufe === null ? 1 : 2
  const instruction = [
    'Gib deinen Benutzernamen und dein Passwort ein.',
    `Hallo ${kid?.name ?? ''}! In welche Klasse gehst du?`,
    '',
  ][step]
  const instructionSay = step === 1 ? klasseFrage(kid?.name ?? '') : instruction

  return (
    <Stage className="nk" background="var(--nk-sky)">
      <Funkeln />
      <div className="nk-login">
        <div className="nk-top">
          <a href="../index.html" className="nk-round ghost" aria-label="Zurück zur Website"><Icon name="home" color="#FFFFFF" size={24} strokeWidth={2.6} /></a>
          <ol className="nk-dots" aria-label={`Schritt ${step + 1} von ${STEPS.length}: ${STEPS[step]}`}>
            {STEPS.map((label, i) => <li key={label} className={i < step ? 'done' : i === step ? 'current' : ''} />)}
          </ol>
          <button type="button" className="nk-round yellow" aria-label="Vorlesen" onClick={() => void speak(instructionSay)}>
            <Icon name="volume" color="#2B2257" size={24} />
          </button>
        </div>

        {schoolClass && kid ? (
          stufe === null ? (
            <StufePicker key="stufe" kid={kid} onBack={() => { setKid(null); setSchoolClass(null) }} onPick={(n) => { save(stufeKey(kid.id), n); saveSession({ classCode: schoolClass.code, kidId: kid.id }); setStufe(n) }} />
          ) : (
            <section className="nk-step popin"><LosPopup kid={kid} /></section>
          )
        ) : (
          <LoginForm onLogin={(c, k) => {
            setSchoolClass(c); setKid(k)
            // Schulstufe schon gewählt? Dann direkt los – nichts nochmal fragen
            const bekannt = getStufe(k.id)
            if (bekannt !== null) { saveSession({ classCode: c.code, kidId: k.id }); setStufe(bekannt); return }
            setStufe(null)
            void speak(klasseFrage(k.name))
          }} />
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

function LoginForm({ onLogin }: { onLogin: (c: SchoolClass, k: Kid) => void }) {
  const [benutzer, setBenutzer] = useState('')
  const [passwort, setPasswort] = useState('')
  const [error, setError] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = findeLogin(benutzer, passwort)
    if (t) onLogin(t.klasse, t.kid)
    else {
      setError(true)
      speak('Das hat nicht geklappt. Schau nochmal nach.')
    }
  }

  return (
    <section className="nk-step popin">
      <header className="nk-title">
        <Perli mood={error ? 'think' : 'happy'} size={120} />
        <h1>Hallo! Melde dich an.</h1>
        <p>Benutzername und Passwort stehen in der E-Mail deiner Eltern.</p>
      </header>
      <form className="nk-code" onSubmit={submit}>
        <label htmlFor="login-name" className="sr-only">Benutzername</label>
        <input id="login-name" className={error ? 'error' : ''} value={benutzer} onChange={(e) => { setBenutzer(e.target.value); setError(false) }}
          placeholder="Benutzername" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={24} />
        <label htmlFor="login-pw" className="sr-only">Passwort</label>
        <input id="login-pw" type="password" className={error ? 'error' : ''} value={passwort} onChange={(e) => { setPasswort(e.target.value); setError(false) }}
          placeholder="Passwort" autoComplete="current-password" maxLength={24} />
        {error && <p className="nk-wrong" role="alert">Das hat nicht geklappt. Schau nochmal nach.</p>}
        <button type="submit" className="nk-btn yellow big" disabled={!benutzer.trim() || !passwort.trim()}>
          Los
          <Icon name="right" size={26} color="#2B2257" strokeWidth={3} />
        </button>
        <p className="nk-foot dim">Zum Ausprobieren: lena · abakus</p>
      </form>
    </section>
  )
}

const NEIGUNG = [-6, 5, 4, -4, 7, -3, 5, -5]


function StufePicker({ kid, onPick, onBack }: { kid: Kid; onPick: (n: number) => void; onBack: () => void }) {
  const saved = getStufe(kid.id)
  return (
    <section className="nk-step popin" aria-labelledby="nk-stufe">
      <header className="nk-title">
        <SeZa kidId={kid.id} groesse={110} />
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

