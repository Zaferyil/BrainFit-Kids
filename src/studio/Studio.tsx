import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Abakus } from '../components/Abakus'
import { BEAD_H, BEAD_W, COL_LEFT, DOT, DOT_TOP, EARTH_BOTTOM, H, HEAVEN_TOP, PITCH, digitsFor, earthTop, frameWidth, heavenTop } from '../components/abakusGeometry'
import { Bead } from '../components/Bead'
import { Perli } from '../components/Perli'
import klassenzimmer from '../assets/lehrerin/klassenzimmer-vorschau.jpg'
import { findLesson, type HandIcon, type Lesson } from './lektionen'
import { abakusAt, buildTimeline, sceneAt, type TimedMove, type TimedScene } from './timeline'

// Video-Studio: zeichnet eine Lektion als 1920×1080-Bild zur Zeit t.
// Vorschau im Browser mit Abspielen/Spulen; für den Export setzt ein Skript die Zeit Bild für Bild
// (window.__studio.seek) und nimmt jedes Bild auf.

const HANDS = import.meta.glob('../assets/hand/*.svg', { eager: true, import: 'default' }) as Record<string, string>
const handSrc = (h: HandIcon) => HANDS[`../assets/hand/${h}.svg`]

const W = 1920
const HEIGHT = 1080
const PLACES = ['Einer', 'Zehner', 'Hunderter', 'Tausender']
const ease = (x: number) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3

declare global {
  interface Window { __studio?: { duration: number; seek: (t: number) => Promise<void>; scenes: { id: string; start: number; dur: number; say?: string }[] } }
}

export function Studio({ id }: { id: string }) {
  const lesson = findLesson(id)
  if (!lesson) return <div className="studio-missing">Lektion „{id}“ gibt es nicht.</div>
  return <StudioPlayer lesson={lesson} />
}

function StudioPlayer({ lesson }: { lesson: Lesson }) {
  const exporting = window.location.hash.includes('export')
  const tl = useMemo(() => buildTimeline(lesson), [lesson])
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [scale, setScale] = useState(1)
  const raf = useRef(0)

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / W, (window.innerHeight - (exporting ? 0 : 64)) / HEIGHT))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [exporting])

  // Export-Schnittstelle: Zeit setzen und warten, bis das Bild gezeichnet ist
  useEffect(() => {
    window.__studio = {
      duration: tl.duration,
      scenes: tl.scenes.map((s) => ({ id: s.scene.id, start: s.start, dur: s.dur, say: s.scene.say })),
      seek: (time) => new Promise((resolve) => { setT(time); requestAnimationFrame(() => requestAnimationFrame(() => resolve())) }),
    }
  }, [tl])

  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setT((x) => {
        if (x + dt >= tl.duration) { setPlaying(false); return tl.duration }
        return x + dt
      })
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, tl.duration])

  const s = sceneAt(tl, t)
  const local = t - s.start

  return (
    <div className={exporting ? 'studio exporting' : 'studio'}>
      <div className="studio-viewport" style={{ width: W * scale, height: HEIGHT * scale }}>
        <div className="studio-frame" style={{ transform: `scale(${scale})` }}>
          <Frame lesson={lesson} s={s} local={local} t={t} />
        </div>
      </div>
      {!exporting && (
        <div className="studio-controls">
          <button type="button" onClick={() => { if (t >= tl.duration) setT(0); setPlaying(!playing) }}>{playing ? 'Pause' : 'Abspielen'}</button>
          <input type="range" min={0} max={tl.duration} step={0.04} value={t} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)) }} aria-label="Zeit" />
          <span>{fmt(t)} / {fmt(tl.duration)}</span>
          <select value={s.scene.id} onChange={(e) => { const x = tl.scenes.find((y) => y.scene.id === e.target.value); if (x) setT(x.start) }} aria-label="Szene">
            {tl.scenes.map((x) => <option key={x.scene.id} value={x.scene.id}>{x.scene.id}</option>)}
          </select>
        </div>
      )}
    </div>
  )
}

const fmt = (x: number) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`

function Frame({ lesson, s, local, t }: { lesson: Lesson; s: TimedScene; local: number; t: number }) {
  const { scene } = s
  const fadeIn = ease(local / 0.5)
  const speaking = local >= s.speech.start && local <= s.speech.end
  const kind = scene.kind ?? 'tafel'
  // Titel und Abschluss: eigene Markenbilder. Alle anderen Szenen: Klassenzimmer mit Lisa links und Tafel rechts.
  const room = kind !== 'titel' && kind !== 'ende'
  // Beim Export über das HeyGen-Video bleibt der Hintergrund durchsichtig.
  const overlay = window.location.hash.includes('overlay')

  return (
    <div className={overlay && room ? 'sf transparent' : 'sf'}>
      {!room && <div className="sf-stars" />}
      {room && !overlay && <img className="sf-room" src={klassenzimmer} alt="" />}
      {kind === 'titel' && <TitleCard lesson={lesson} local={local} />}
      {kind === 'ende' && <EndCard local={local} />}

      {room && (
        <div className="sf-whiteboard">
          <div className="sf-wb-head">
            <span className="sf-chip">Lektion {lesson.number}</span>
            <span className="sf-title">{lesson.title}</span>
            <span className="sf-brand">BrainFit <b>Kids</b></span>
          </div>
          {kind === 'karte' && scene.card && (
            <div className="sf-card" style={{ opacity: fadeIn, transform: `translateY(${(1 - fadeIn) * 30}px)` }}>
              <h2>{scene.card.title}</h2>
              {scene.card.lines.map((l, i) => {
                const show = ease((local - 0.4 - i * 0.6) / 0.4)
                return (
                  <div key={i} className="sf-card-line" style={{ opacity: show, transform: `translateX(${(1 - show) * -30}px)` }}>
                    <span className="sf-card-icon">
                      {l.icon === 'erd' ? <Bead color="yellow" width={110} /> : l.icon === 'himmel' ? <Bead color="green" width={110} /> : l.icon ? <img src={handSrc(l.icon)} alt="" /> : null}
                    </span>
                    <span>{l.text}</span>
                  </div>
                )
              })}
            </div>
          )}
          {(kind === 'tafel' || kind === 'aufgabe') && <Board s={s} local={local} t={t} />}
          {kind === 'quiz' && scene.quiz && <QuizCard s={s} local={local} />}
        </div>
      )}

      {room && <TeacherTag speaking={speaking} t={t} />}
      {room && scene.say && <Subtitle s={s} local={local} />}
    </div>
  )
}

/** Quizfrage: Antworten als große Karten, 3-2-1, dann leuchtet die richtige Antwort grün. */
function QuizCard({ s, local }: { s: TimedScene; local: number }) {
  const quiz = s.scene.quiz!
  const countdown = local - s.speech.end
  const revealed = countdown >= 3.2
  const fade = ease(local / 0.5)
  return (
    <div className="sf-quiz" style={{ opacity: fade }}>
      <div className="sf-quiz-q"><span>?</span>{quiz.question}</div>
      <div className="sf-quiz-options">
        {quiz.options.map((o, i) => {
          const pop = ease((local - 0.5 - i * 0.35) / 0.4)
          const state = !revealed ? '' : i === quiz.correct ? ' right' : ' wrong'
          return (
            <div key={i} className={`sf-quiz-opt${state}`} style={{ transform: `scale(${(0.8 + 0.2 * pop) * (revealed && i === quiz.correct ? 1.06 : 1)})`, opacity: pop * (state === ' wrong' ? 0.35 : 1) }}>
              <div className="sf-quiz-icons">{o.icons.map((ic) => <img key={ic} src={handSrc(ic)} alt="" />)}</div>
              <div className="sf-quiz-text">{o.text}</div>
              {state === ' right' && <div className="sf-quiz-check">✓</div>}
            </div>
          )
        })}
      </div>
      {countdown >= 0 && !revealed && <div className="sf-countdown quiz">{Math.max(1, Math.ceil(3 - countdown))}</div>}
    </div>
  )
}

function TitleCard({ lesson, local }: { lesson: Lesson; local: number }) {
  const a = ease(local / 0.7)
  const b = ease((local - 0.6) / 0.7)
  return (
    <div className="sf-titlecard">
      <div className="sf-logo" style={{ opacity: a, transform: `scale(${0.8 + a * 0.2})` }}>
        <span className="brain">BrainFit</span> <span className="kids">Kids</span>
        <div className="sf-sub">Mental-Arithmetik</div>
      </div>
      <div className="sf-lesson" style={{ opacity: b, transform: `translateY(${(1 - b) * 40}px)` }}>
        <span>Lektion {lesson.number}</span>
        <strong>{lesson.title}</strong>
      </div>
      <div className="sf-title-perli" style={{ opacity: b }}><Perli mood="cheer" size={190} /></div>
    </div>
  )
}

function EndCard({ local }: { local: number }) {
  const a = ease(local / 0.6)
  return (
    <div className="sf-titlecard end" style={{ opacity: a }}>
      <div className="sf-lesson"><strong>Jetzt bist du dran!</strong><span>Station „Entdecken“ in der App</span></div>
      <div className="sf-title-perli"><Perli mood="cheer" size={230} /></div>
      <div className="sf-logo small"><span className="brain">BrainFit</span> <span className="kids">Kids</span></div>
    </div>
  )
}

/** Namensschild von Lisa mit Sprech-Anzeige; Lisa selbst ist im Hintergrund (Bild oder HeyGen-Video). */
function TeacherTag({ speaking, t }: { speaking: boolean; t: number }) {
  return (
    <div className="sf-teacher-name">
      Lisa
      <span className="sf-wave" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <i key={i} style={{ height: speaking ? 8 + Math.abs(Math.sin(t * 9 + i * 1.7)) * 22 : 6 }} />)}
      </span>
    </div>
  )
}

function Subtitle({ s, local }: { s: TimedScene; local: number }) {
  const text = s.scene.say!
  const sentences = text.split(/(?<=[.!?])\s+/)
  const talk = s.speech.end - s.speech.start
  let pos = 0
  let current = sentences[0]
  for (const sent of sentences) {
    const at = s.speech.start + (pos / text.length) * talk
    if (local >= at - 0.1) current = sent
    pos += sent.length + 1
  }
  return <div className="sf-subtitle">{current}</div>
}

function Board({ s, local, t }: { s: TimedScene; local: number; t: number }) {
  const { scene, cols } = s
  const ab = abakusAt(s, local)
  const colw = cols === 1 ? 190 : cols <= 4 ? 165 : 130
  const k = colw / PITCH
  const width = frameWidth(cols) * k
  const glow = 0.55 + Math.sin(t * 5) * 0.3
  const talk = s.speech.end - s.speech.start
  const wordAt = (w: string) => {
    const i = scene.say?.indexOf(w) ?? -1
    return i < 0 ? Infinity : s.speech.start + (i / scene.say!.length) * talk
  }
  const task = scene.task !== undefined
  const countdown = task ? local - s.speech.end : -1
  const revealed = task && ab.value === scene.task && (ab.progress >= 1 || ab.move)

  return (
    <div className="sf-board">
      {scene.caption && (
        <div className="sf-caption" style={{ opacity: ease(local / 0.4) }}>
          {scene.caption.icon && <img src={handSrc(scene.caption.icon)} alt="" />}
          {scene.caption.text}
        </div>
      )}
      {task && <div className="sf-caption task">Stell die {scene.task} ein!</div>}
      <div className="sf-abakus-wrap" style={{ width, height: H * k }}>
        <Abakus value={ab.value} from={ab.from} progress={ab.progress} cols={cols} colw={colw} interactive={false} sound={false} />
        {scene.highlight && Array.from({ length: cols }, (_, ci) => {
          const left = COL_LEFT[ci]
          const box = scene.highlight === 'erd'
            ? { x: left - 8, y: EARTH_BOTTOM - 4 * BEAD_H - 8, w: BEAD_W + 16, h: 4 * BEAD_H + 16 }
            : scene.highlight === 'himmel'
              ? { x: left - 8, y: HEAVEN_TOP - 8, w: BEAD_W + 16, h: BEAD_H + 16 }
              : null
          return box && <div key={ci} className="sf-glow" style={{ left: box.x * k, top: box.y * k, width: box.w * k, height: box.h * k, opacity: glow * ease(local / 0.6) }} />
        })}
        {scene.highlight === 'leiste' && (
          <div className="sf-glow bar" style={{ left: 20 * k, top: (DOT_TOP + DOT / 2 - 16) * k, width: width - 40 * k, height: 32 * k, opacity: glow * ease(local / 0.6) }} />
        )}
        {ab.move?.hand !== false && <Hands s={s} local={local} k={k} />}
        {scene.labels && Array.from({ length: cols }, (_, ci) => {
          const fromRight = cols - 1 - ci
          const name = PLACES[fromRight]
          const show = ease((local - wordAt(name)) / 0.4)
          return <div key={ci} className="sf-place" style={{ left: (COL_LEFT[ci] + BEAD_W / 2) * k, opacity: show, transform: `translate(-50%, ${(1 - show) * 20}px)` }}>{name}</div>
        })}
      </div>
      {scene.badge && <div className="sf-badge" style={{ opacity: ease((local - 0.6) / 0.4), transform: `scale(${0.7 + 0.3 * ease((local - 0.6) / 0.4)})` }}>{scene.badge}</div>}
      {task && countdown >= 0 && countdown < 3.2 && <div className="sf-countdown" key={Math.ceil(3 - countdown)}>{Math.max(1, Math.ceil(3 - countdown))}</div>}
      {revealed && <div className="sf-badge">{scene.task}</div>}
    </div>
  )
}

/** Hände an den Perlen, die sich gerade bewegen: Daumen schiebt Erdperlen hoch, Zeigefinger schiebt runter und bewegt die Himmelsperle. */
function Hands({ s, local, k }: { s: TimedScene; local: number; k: number }) {
  const m: TimedMove | undefined = s.moves.find((x) => x.hand && local >= x.start - 0.45 && local <= x.start + x.dur + 0.35)
  if (!m || s.cols !== 1) return null
  const idx = s.moves.indexOf(m)
  const fromValue = idx === 0 ? s.value : s.moves[idx - 1].to
  const [a] = digitsFor(fromValue, 1)
  const [b] = digitsFor(m.to, 1)
  const p = ease((local - m.start) / m.dur)
  const show = Math.min(ease((local - (m.start - 0.45)) / 0.3), 1 - ease((local - (m.start + m.dur + 0.05)) / 0.3))
  const lerp = (x: number, y: number) => x + (y - x) * p
  const left = COL_LEFT[0]
  const size = 150
  const hands: { icon: HandIcon; x: number; y: number }[] = []
  if ((a >= 5) !== (b >= 5)) {
    const top = lerp(heavenTop(a), heavenTop(b))
    hands.push(b >= 5 ? { icon: 'zeige-runter', x: left + BEAD_W * 0.62, y: top - size / k * 0.85 } : { icon: 'zeige-hoch', x: left + BEAD_W * 0.62, y: top + BEAD_H * 0.7 })
  }
  const la = a % 5
  const lb = b % 5
  if (lb > la) {
    const i = lb - 1 // unterste bewegte Perle
    hands.push({ icon: 'daumen-hoch', x: left + BEAD_W * 0.62, y: lerp(earthTop(a, i), earthTop(b, i)) + BEAD_H * 0.75 })
  } else if (lb < la) {
    const i = lb // oberste bewegte Perle
    hands.push({ icon: 'zeige-runter', x: left + BEAD_W * 0.62, y: lerp(earthTop(a, i), earthTop(b, i)) - size / k * 0.85 })
  }
  return (
    <>
      {hands.map((h, i) => (
        <img key={i} className="sf-hand" src={handSrc(h.icon)} alt="" style={{ left: h.x * k, top: h.y * k, width: size, height: size, opacity: show } as CSSProperties} />
      ))}
    </>
  )
}
