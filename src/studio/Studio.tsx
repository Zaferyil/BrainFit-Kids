import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Abakus3D } from '../components/Abakus3D'
import { digitsFor } from '../components/abakusGeometry'
import {
  BEAD_W3 as BEAD_W, BEAM_Y3, EARTH_H3 as BEAD_H, H3 as H, HEAVEN_H3, PITCH3 as PITCH, colLeft3, earthTop3 as earthTop, frameWidth3 as frameWidth, heavenTop3 as heavenTop,
} from '../components/abakus3dGeometry'
import { Bead } from '../components/Bead'
import { Perli } from '../components/Perli'
import vorlageGruen from '../assets/lehrerin/vorlage-leer-1080.jpg'
import schild from '../assets/video/lektion-schild.webp'
import fortschritt from '../assets/video/fortschritt.webp'
import punktAktiv from '../assets/video/punkt-aktiv.webp'
import { findLesson, type HandIcon, type Lesson } from './lektionen'
import { abakusAt, buildTimeline, sceneAt, type TimedMove, type TimedScene } from './timeline'
import { lessonAudio } from './audio'

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
  const tl = useMemo(() => buildTimeline(lesson, lessonAudio(lesson.id)), [lesson])
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

export function Frame({ lesson, s, local, t }: { lesson: Lesson; s: TimedScene; local: number; t: number }) {
  const { scene } = s
  const fadeIn = ease(local / 0.5)
  const kind = scene.kind ?? 'tafel'
  // Beim Export über das HeyGen-Video bleibt alles außer den Tafel-Inhalten durchsichtig.
  const overlay = window.location.hash.includes('overlay')
  const section = sectionIndex(lesson, scene.id)
  // Vorlage: helle Tafel (Standard) oder grüne Kreidetafel (?gruen)
  const gruen = window.location.hash.includes('gruen')

  return (
    <div className={overlay ? 'sf transparent' : gruen ? 'sf' : 'sf himmel'}>
      {!overlay && (gruen ? <img className="sf-room" src={vorlageGruen} alt="" /> : null)}
      <div className={gruen ? 'sf-chalk' : 'sf-chalk creme'}>
        {gruen && <ChalkDoodles />}
        <div className="sf-schild" style={{ backgroundImage: `url(${schild})` }}>
          <b>Lektion {lesson.number}</b><span>{lesson.title}</span>
        </div>
        <div className="sf-fortschritt" style={{ backgroundImage: `url(${fortschritt})` }} aria-label={`Teil ${section + 1} von ${lesson.sections.length}`}>
          {/* Punktmitten im Bild (1890 px breit): 135, 463, 757, 1048, 1343 */}
          {[135, 463, 757, 1048, 1343].slice(0, lesson.sections.length).map((x, i) => i <= section && (
            <img key={i} src={punktAktiv} alt="" className={i === section ? 'aktiv' : 'fertig'} style={{ left: `${(x / 1890) * 100}%` }} />
          ))}
          <b>{section + 1}/{lesson.sections.length}</b>
        </div>

        {!gruen && !overlay && <Sprecher an={local >= s.speech.start && local < s.speech.end} t={t} />}
        <div className="sf-stage">
          {kind === 'titel' && <TitleBoard lesson={lesson} local={local} />}
          {kind === 'ende' && <EndBoard local={local} />}
          {kind === 'karte' && scene.card && (
            <div className="sf-card" style={{ opacity: fadeIn, transform: `translateY(${(1 - fadeIn) * 30}px)` }}>
              <h2>{scene.card.title}</h2>
              {scene.card.lines.map((l, i) => {
                const show = ease((local - 0.4 - i * 0.6) / 0.4)
                return (
                  <div key={i} className="sf-card-line" style={{ opacity: show, transform: `translateX(${(1 - show) * -30}px)` }}>
                    <span className="sf-card-icon">
                      {l.icon === 'erd' ? <Bead color="yellow" width={100} /> : l.icon === 'himmel' ? <Bead color="green" width={100} /> : l.icon ? <img src={handSrc(l.icon)} alt="" /> : null}
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

        <BottomLine s={s} local={local} />
      </div>
    </div>
  )
}

const sectionIndex = (lesson: Lesson, id: string) => {
  const order = lesson.scenes.map((x) => x.id)
  let cur = 0
  lesson.sections.forEach((sec, i) => { if (order.indexOf(sec.start) <= order.indexOf(id)) cur = i })
  return cur
}

/** Kreide-Sterne und gelbe Striche wie in der Vorlage */
function ChalkDoodles() {
  const star = 'M0 -26 L7 -8 L26 -8 L11 4 L17 23 L0 12 L-17 23 L-11 4 L-26 -8 L-7 -8 Z'
  return (
    <svg className="sf-doodles" width="1253" height="824" viewBox="0 0 1253 824" aria-hidden="true">
      <g fill="none" stroke="#E9F1EA" strokeWidth="3.5" strokeLinejoin="round" opacity=".55">
        <path d={star} transform="translate(80 70) rotate(-12)" />
        <path d={star} transform="translate(1175 150) rotate(10) scale(.9)" />
      </g>
      <g stroke="#FFD33D" strokeWidth="7" strokeLinecap="round">
        <path d="M300 40 l26 14 M290 78 l32 0 M300 116 l26 -14" />
        <path d="M953 40 l-26 14 M963 78 l-32 0 M953 116 l-26 -14" />
      </g>
      <g stroke="#E9F1EA" strokeWidth="3" strokeLinecap="round" opacity=".5">
        <path d="M60 640 l18 8 M56 668 l20 0 M60 696 l18 -8" />
        <path d="M1196 640 l-18 8 M1200 668 l-20 0 M1196 696 l-18 -8" />
      </g>
    </svg>
  )
}

/** Untere Zeile der Tafel: Aufgabe, Quizfrage oder der Satz, den Lisa gerade sagt. */
function BottomLine({ s, local }: { s: TimedScene; local: number }) {
  const { scene } = s
  let label = ''
  let text = ''
  if (scene.task !== undefined) { label = 'Aufgabe:'; text = `Stell die ${scene.task} ein!` }
  else if (scene.quiz) { label = 'Frage:'; text = scene.quiz.question }
  else if (scene.say) text = currentSentence(s, local)
  if (!text) return null
  return (
    <div className="sf-bottom">
      {label && <b>{label}</b>}
      <span>{text}</span>
      <svg className="sf-bottom-star" width="64" height="64" viewBox="-32 -32 64 64" aria-hidden="true">
        <path d="M0 -28 L8 -9 L28 -9 L12 4 L18 25 L0 13 L-18 25 L-12 4 L-28 -9 L-8 -9 Z" fill="#FFD33D" stroke="#E0A800" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="-6" cy="0" r="2.6" fill="#231A4F" /><circle cx="6" cy="0" r="2.6" fill="#231A4F" />
        <path d="M-6 7 Q0 12 6 7" stroke="#231A4F" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function currentSentence(s: TimedScene, local: number) {
  const sentences = s.scene.say!.split(/(?<=[.!?])\s+/)
  let current = sentences[0]
  for (const sent of sentences) if (local >= s.at(sent) - 0.1) current = sent
  return current
}

/** Quizfrage: Antworten als große Karten, 3-2-1, dann leuchtet die richtige Antwort grün. */
function QuizCard({ s, local }: { s: TimedScene; local: number }) {
  const quiz = s.scene.quiz!
  const countdown = local - s.speech.end
  const revealed = countdown >= 3.2
  return (
    <div className="sf-quiz" style={{ opacity: ease(local / 0.5) }}>
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
      {countdown >= 0 && !revealed && <div className="sf-countdown">{Math.max(1, Math.ceil(3 - countdown))}</div>}
    </div>
  )
}

function TitleBoard({ lesson, local }: { lesson: Lesson; local: number }) {
  const a = ease(local / 0.7)
  const b = ease((local - 0.6) / 0.7)
  return (
    <div className="sf-titleboard">
      <div className="sf-logo" style={{ opacity: a, transform: `scale(${0.85 + a * 0.15})` }}>
        <span className="brain">BrainFit</span> <span className="kids">Kids</span>
        <div className="sf-sub">Mental-Arithmetik</div>
      </div>
      <div className="sf-chalk-title" style={{ opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>{lesson.title}</div>
      <div className="sf-title-perli" style={{ opacity: b }}><Perli mood="cheer" size={150} /></div>
    </div>
  )
}

function EndBoard({ local }: { local: number }) {
  const a = ease(local / 0.6)
  return (
    <div className="sf-titleboard" style={{ opacity: a }}>
      <div className="sf-chalk-title big">Jetzt bist du dran!</div>
      <div className="sf-chalk-sub">Station „Entdecken“ in der App</div>
      <div className="sf-title-perli"><Perli mood="cheer" size={170} /></div>
    </div>
  )
}

function Board({ s, local, t }: { s: TimedScene; local: number; t: number }) {
  const { scene, cols } = s
  const ab = abakusAt(s, local)
  // Platz auf der Tafel: Bühne 484 px hoch, abzüglich Überschrift und Stellenwerte
  const gruen = window.location.hash.includes('gruen')
  const room = (gruen ? 465 : 780) - (scene.caption || scene.task !== undefined ? 76 : 0) - (scene.labels ? 84 : 0)
  const colw = Math.min(gruen ? (cols === 1 ? 170 : 165) : cols === 1 ? 260 : 240, (room / H) * PITCH)
  const k = colw / PITCH
  const width = frameWidth(cols) * k
  const glow = 0.55 + Math.sin(t * 5) * 0.3
  const task = scene.task !== undefined
  const countdown = task ? local - s.speech.end : -1
  const revealed = task && ab.value === scene.task && (ab.progress >= 1 || ab.move)

  return (
    <div className="sf-board" style={scene.labels ? { paddingBottom: 84 } : undefined}>
      {scene.caption && (
        <div className="sf-caption" style={{ opacity: ease(local / 0.4) }}>
          {scene.caption.icon && <img src={handSrc(scene.caption.icon)} alt="" />}
          {scene.caption.text}
        </div>
      )}
      {task && <div className="sf-caption task">Stell die {scene.task} ein!</div>}
      <div className="sf-abakus-wrap" style={{ width, height: H * k }}>
        <Abakus3D value={ab.value} from={ab.from} progress={ab.progress} cols={cols} colw={colw} />
        {scene.highlight && Array.from({ length: cols }, (_, ci) => {
          const left = colLeft3(ci)
          const box = scene.highlight === 'erd'
            ? { x: left - 8, y: earthTop(0, 0) - 8, w: BEAD_W + 16, h: earthTop(0, 3) + BEAD_H - earthTop(0, 0) + 16 }
            : scene.highlight === 'himmel'
              ? { x: left - 8, y: heavenTop(0) - 8, w: BEAD_W + 16, h: HEAVEN_H3 + 16 }
              : null
          return box && <div key={ci} className="sf-glow" style={{ left: box.x * k, top: box.y * k, width: box.w * k, height: box.h * k, opacity: glow * ease(local / 0.6) }} />
        })}
        {scene.highlight === 'leiste' && (
          <div className="sf-glow bar" style={{ left: 40 * k, top: (BEAM_Y3 - 22) * k, width: width - 80 * k, height: 44 * k, opacity: glow * ease(local / 0.6) }} />
        )}
        {ab.move?.hand !== false && <Hands s={s} local={local} k={k} />}
        {scene.labels && Array.from({ length: cols }, (_, ci) => {
          const fromRight = cols - 1 - ci
          const name = PLACES[fromRight]
          const show = ease((local - s.at(name)) / 0.4)
          // abwechselnd zwei Zeilen, damit lange Wörter nebeneinander Platz haben
          return <div key={ci} className={fromRight % 2 ? 'sf-place low' : 'sf-place'} style={{ left: (colLeft3(ci) + BEAD_W / 2) * k, opacity: show, transform: `translate(-50%, ${(1 - show) * 20}px)` }}>{name}</div>
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
  const left = colLeft3(0)
  const size = Math.max(84, BEAD_W * k * 0.9)
  const hands: { icon: HandIcon; x: number; y: number }[] = []
  if ((a >= 5) !== (b >= 5)) {
    const top = lerp(heavenTop(a), heavenTop(b))
    hands.push(b >= 5 ? { icon: 'zeige-runter', x: left + BEAD_W * 0.62, y: top - size / k * 0.85 } : { icon: 'zeige-hoch', x: left + BEAD_W * 0.62, y: top + HEAVEN_H3 * 0.7 })
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

/** Zeigt, dass gerade jemand spricht: tanzende Tonbalken über dem Abakus, nur während gesprochen wird. */
function Sprecher({ an, t }: { an: boolean; t: number }) {
  return (
    <div className={an ? 'sf-sprecher an' : 'sf-sprecher'} aria-hidden="true">
      <div className="sf-sprecher-balken">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        // Pseudo-Lautstärke aus der Zeit, damit die Balken beim Pausieren stehen bleiben
        const h = an ? 0.25 + 0.75 * Math.abs(Math.sin(t * (7 + i * 1.7) + i * 1.3) * Math.sin(t * 3.1 + i)) : 0.18
        return <span key={i} style={{ height: `${h * 100}%` }} />
      })}
      </div>
    </div>
  )
}
