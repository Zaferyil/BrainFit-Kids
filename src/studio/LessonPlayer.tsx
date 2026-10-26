import { useEffect, useMemo, useRef, useState } from 'react'
import { Fit } from '../components/Fit'
import { Icon } from '../components/Icon'
import { Frame } from './Studio'
import { findLesson } from './lektionen'
import { buildTimeline, sceneAt } from './timeline'
import { lessonAudio, lessonTrack } from './audio'

// Spielt eine Lektion in der App ab: das Bild des Video-Studios, gesteuert von Lisas Tonspur.
export function LessonPlayer({ id, onEnded }: { id: string; onEnded?: () => void }) {
  const lesson = findLesson(id)!
  const tl = useMemo(() => buildTimeline(lesson, lessonAudio(id)), [lesson, id])
  const audio = useRef<HTMLAudioElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)

  // Zeit aus der Tonspur übernehmen, solange sie läuft
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const step = () => { setT(audio.current?.currentTime ?? 0); raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) { if (a.ended) a.currentTime = 0; void a.play() } else a.pause()
  }
  const seek = (v: number) => { if (audio.current) audio.current.currentTime = v; setT(v) }
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void box.current?.requestFullscreen?.()
  }

  const s = sceneAt(tl, t)
  const fmt = (x: number) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`

  return (
    <div className={playing ? 'lesson-player playing' : 'lesson-player'} ref={box}>
      <Fit className="lesson-fit">
        <div className="lesson-frame" onClick={toggle}>
          <Frame lesson={lesson} s={s} local={t - s.start} t={t} />
        </div>
      </Fit>
      {!playing && (
        <button type="button" className="lesson-play" onClick={toggle} aria-label={t > 0 ? 'Weiter abspielen' : 'Lektion starten'}>
          <Icon name="play" color="#FFFFFF" fill="#FFFFFF" size={56} />
        </button>
      )}
      <div className="lesson-bar">
        <button type="button" onClick={toggle} aria-label={playing ? 'Pause' : 'Abspielen'}>
          {playing ? <span className="lesson-pause" aria-hidden="true" /> : <Icon name="play" color="#FFFFFF" fill="#FFFFFF" size={22} />}
        </button>
        <input type="range" min={0} max={tl.duration} step={0.1} value={t} onChange={(e) => seek(Number(e.target.value))} aria-label="Stelle im Video" />
        <span>{fmt(t)} / {fmt(tl.duration)}</span>
        <button type="button" onClick={fullscreen} aria-label="Vollbild"><Icon name="expand" color="#FFFFFF" size={22} /></button>
      </div>
      <audio
        ref={audio}
        src={lessonTrack(id)}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setT(tl.duration); onEnded?.() }}
      />
    </div>
  )
}
