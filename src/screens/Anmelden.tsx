import { useState, type FormEvent } from 'react'
import { kidCard } from '../data/kinderBilder'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { findClass, PICTURES, type Kid, type PictureId, type SchoolClass } from '../data/demo'
import { getSavedClass, saveClass, saveSession } from '../lib/session'
import { speak } from '../lib/speak'
import { load, save } from '../lib/storage'

type Status = 'input' | 'wrong' | 'right'

const STEPS = ['Klassen-Code', 'Wer bist du?', 'Schulstufe', 'Bild-Passwort']

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

  const step = !schoolClass ? 0 : !kid ? 1 : stufe === null ? 2 : 3
  const instruction = [
    'Wie heißt deine Klasse? Tippe den Klassen-Code ein.',
    'Wer bist du? Tippe auf dein Bild.',
    `Hallo ${kid?.name ?? ''}! In welche Klasse gehst du?`,
    'Tippe deine vier Bilder.',
  ][step]
  const instructionSay = step === 2 ? [`Hallo ${kid?.name ?? ''}!`, 'In welche Klasse gehst du?'] : instruction

  return (
    <Stage>
      <div className="login">
        <div className="login-head">
          <a href="#/" className="pill-link">
            <Icon name="left" color="#FFFFFF" size={22} />
            Zurück
          </a>
          <ol className="login-steps" aria-label="Schritte">
            {STEPS.map((label, i) => (
              <li key={label} className={i < step ? 'done' : i === step ? 'current' : ''} aria-current={i === step ? 'step' : undefined}>
                {i + 1} {label}
              </li>
            ))}
          </ol>
          <button type="button" className="round-btn" aria-label="Vorlesen" onClick={() => void speak(instructionSay)}>
            <Icon name="volume" color="#FFFFFF" size={26} />
          </button>
        </div>

        {schoolClass ? (
          <div className="login-body">
            <KidPicker
              schoolClass={schoolClass}
              selected={kid}
              onSelect={(k) => { setKid(k); setStufe(null); void speak([`Hallo ${k.name}!`, 'In welche Klasse gehst du?']) }}
              onChangeClass={() => { saveClass(null); setSchoolClass(null); setKid(null) }}
            />
            {kid && stufe === null
              ? <StufePicker kid={kid} onPick={(n) => { save(stufeKey(kid.id), n); setStufe(n); void speak('Tippe deine vier Bilder.') }} />
              : <PicturePassword key={kid?.id ?? 'none'} schoolClass={schoolClass} kid={kid} onBack={() => setStufe(null)} />}
          </div>
        ) : (
          <ClassCode onFound={(c) => { saveClass(c.code); setSchoolClass(c) }} />
        )}
      </div>
    </Stage>
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
    <div className="code-wrap">
      <Perli mood={error ? 'think' : 'happy'} size={200} />
      <form className="code-card" onSubmit={submit}>
        <label htmlFor="class-code" className="code-title">Wie heißt deine Klasse?</label>
        <input
          id="class-code"
          className={error ? 'code-input error' : 'code-input'}
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(false) }}
          placeholder="z. B. LINZ-7K"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
        />
        <p className={error ? 'code-hint error' : 'code-hint'} role={error ? 'alert' : undefined}>
          {error ? 'Diesen Code kennen wir nicht. Schau nochmal nach.' : 'Den Klassen-Code bekommst du von deiner Lehrerin.'}
        </p>
        <button type="submit" className="btn-primary small" disabled={code.trim().length < 3}>
          Weiter
          <Icon name="right" size={26} color="#231A4F" strokeWidth={3} />
        </button>
        <p className="dev-hint">Zum Ausprobieren: LINZ-7K</p>
      </form>
    </div>
  )
}

function KidPicker({ schoolClass, selected, onSelect, onChangeClass }: {
  schoolClass: SchoolClass
  selected: Kid | null
  onSelect: (k: Kid) => void
  onChangeClass: () => void
}) {
  return (
    <section className="kids-panel">
      <div className="kids-head">
        <h2>Wer bist du?</h2>
        <span className="class-chip">Klasse {schoolClass.code}</span>
      </div>
      <div className="kids-grid">
        {schoolClass.kids.map((k) => (
          <button key={k.id} type="button" className={k.id === selected?.id ? 'kid active' : 'kid'} aria-pressed={k.id === selected?.id} onClick={() => onSelect(k)}>
            {kidCard(k.id)
              ? <img className="kid-card" src={kidCard(k.id)} alt="" />
              : <Avatar size={76} {...k.avatar} bg={k.id === selected?.id ? '#5B47D6' : '#3A2F80'} />}
            <span>{k.name}</span>
          </button>
        ))}
      </div>
      <div className="kids-foot">
        <span>Nicht dabei? Frag deine Lehrerin.</span>
        <button type="button" className="text-btn" onClick={onChangeClass}>Andere Klasse</button>
      </div>
    </section>
  )
}

function StufePicker({ kid, onPick }: { kid: Kid; onPick: (n: number) => void }) {
  const saved = getStufe(kid.id)
  return (
    <section className="pw-panel">
      <div className="pw-head">
        <Avatar size={64} {...kid.avatar} />
        <div>
          <div className="pw-hello">Hallo {kid.name}!</div>
          <h2>In welche Klasse gehst du?</h2>
        </div>
      </div>
      <div className="stufe-grid">
        {STUFEN.map((s) => (
          <button key={s.id} type="button" className={s.id === saved ? 'stufe active' : 'stufe'} aria-label={s.lang} onClick={() => onPick(s.id)}>
            <strong>{s.label}</strong>
            <span>{s.id === 0 ? 'Kindergarten' : 'Klasse'}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function PicturePassword({ schoolClass, kid, onBack }: { schoolClass: SchoolClass; kid: Kid | null; onBack: () => void }) {
  const [picks, setPicks] = useState<PictureId[]>([])
  const [status, setStatus] = useState<Status>('input')

  if (!kid) {
    return (
      <section className="pw-panel pw-empty">
        <Perli mood="think" size={170} />
        <h2>Tippe zuerst auf dein Bild.</h2>
        <p>Dann zeigt dir Perli dein Bild-Passwort.</p>
      </section>
    )
  }

  const pick = (id: PictureId) => {
    if (status !== 'input' || picks.length >= 4) return
    const next = [...picks, id]
    setPicks(next)
    if (next.length < 4) return
    if (next.every((p, i) => p === kid.password[i])) {
      setStatus('right')
      saveSession({ classCode: schoolClass.code, kidId: kid.id })
      void speak('Richtig!')
    } else {
      setStatus('wrong')
      speak('Das war nicht richtig. Probier es nochmal!')
      setTimeout(() => { setPicks([]); setStatus('input') }, 1200)
    }
  }

  return (
    <section className="pw-panel">
      <div className="pw-head">
        <Avatar size={64} {...kid.avatar} />
        <div>
          <div className="pw-hello">Hallo {kid.name}!</div>
          <h2>Tippe deine 4 Bilder</h2>
        </div>
        <button type="button" className="text-btn pw-back" onClick={onBack}>Klasse ändern</button>
      </div>
      <div className={`pw-slots ${status}`}>
        {[0, 1, 2, 3].map((i) => {
          const p = PICTURES.find((x) => x.id === picks[i])
          return (
            <div key={i} className={p ? 'pw-slot filled' : 'pw-slot'} aria-label={p ? p.label : `Bild ${i + 1} leer`}>
              {p && <Icon name={p.icon} color={p.color} fill={p.fill} size={40} strokeWidth={2} />}
            </div>
          )
        })}
        <button type="button" className="pw-del" aria-label="Löschen" disabled={status !== 'input' || picks.length === 0} onClick={() => setPicks(picks.slice(0, -1))}>
          <Icon name="del" color="#6B61A8" size={34} />
        </button>
      </div>
      <div className="pw-grid">
        {PICTURES.map((p) => (
          <button key={p.id} type="button" className="pw-pic" onClick={() => pick(p.id)} disabled={status !== 'input'}>
            <Icon name={p.icon} color={p.color} fill={p.fill} size={52} strokeWidth={2} />
            <span>{p.label}</span>
          </button>
        ))}
      </div>
      {status === 'wrong' && (
        <div className="pw-banner wrong" role="alert">Das war nicht richtig. Probier es nochmal!</div>
      )}
      {status === 'right' && (
        <a href="#/karte" className="btn-primary los" role="status">
          Los geht’s!
          <Icon name="right" size={28} color="#231A4F" strokeWidth={3} />
        </a>
      )}
      {status === 'input' && kid.id === 'lena' && (
        <p className="dev-hint pw-dev">Zum Ausprobieren: Stern, Herz, Blitz, Krone</p>
      )}
    </section>
  )
}
