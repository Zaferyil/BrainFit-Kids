import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { youtubeUrl, type Video } from '../../data/videos'
import { finishStation } from '../../lib/progress'
import { StationDone, StationShell } from './StationShell'

type Props = { kidId: string; title: string; videos: Video[]; learn?: string[]; rule?: string[] }

/** Nach so vielen Sekunden erscheint „Trotzdem weiter“, falls der Player nicht lädt. */
const FALLBACK_SECONDS = 25

export function VideoStation({ kidId, title, videos, learn, rule }: Props) {
  const [current, setCurrent] = useState(0)
  const [watched, setWatched] = useState<string[]>([])
  const [fallback, setFallback] = useState(false)
  const [done, setDone] = useState<number | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const video = videos[current]
  const allWatched = videos.every((v) => watched.includes(v.id))

  useEffect(() => {
    const t = window.setTimeout(() => setFallback(true), FALLBACK_SECONDS * 1000)
    return () => window.clearTimeout(t)
  }, [])

  // Der YouTube-Player meldet über postMessage, wann das Video zu Ende ist.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return
      let data: { event?: string; info?: unknown } | null = null
      try { data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data } catch { return }
      const ended = (data?.event === 'onStateChange' && data.info === 0) ||
        (data?.event === 'infoDelivery' && (data.info as { playerState?: number } | undefined)?.playerState === 0)
      if (ended) setWatched((w) => (w.includes(video.id) ? w : [...w, video.id]))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [video.id])

  const listen = () => {
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: video.id, channel: 'widget' }), '*')
  }

  const openOnYoutube = () => setWatched((w) => (w.includes(video.id) ? w : [...w, video.id]))
  const finish = () => setDone(finishStation(kidId, 'video', 3, 0))

  return (
    <StationShell station="video" title={`Video: ${title}`}>
      <div className="video-layout">
        <div className="video-main">
          {videos.length > 1 && (
            <div className="video-tabs" role="tablist">
              {videos.map((v, i) => (
                <button key={v.id} type="button" role="tab" aria-selected={i === current} className={i === current ? 'video-tab active' : 'video-tab'} onClick={() => setCurrent(i)}>
                  {watched.includes(v.id) && <Icon name="check" color="#10351B" size={16} strokeWidth={3} />}
                  {v.title}
                </button>
              ))}
            </div>
          )}
          <div className="video-box">
            <iframe
              key={video.id}
              ref={frame}
              title={`Lernvideo: ${video.title}`}
              src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              onLoad={listen}
            />
          </div>
          <div className="video-actions">
            <a href={youtubeUrl(video.id)} target="_blank" rel="noreferrer" className="watch-btn" onClick={openOnYoutube}>
              <span className="watch-icon"><Icon name="play" color="#FFFFFF" fill="#FFFFFF" size={22} /></span>
              Auf YouTube ansehen
            </a>
            <span className="video-status">
              {watched.includes(video.id) ? 'Angesehen ✓' : 'Schau das Video bis zum Ende.'}
            </span>
          </div>
        </div>
        <aside className="video-side">
          {learn && learn.length > 0 && (
            <section className="learn-card">
              <h2>Das lernst du</h2>
              <ul>
                {learn.map((l) => (
                  <li key={l}><span className="learn-dot"><Icon name="check" color="#10351B" size={18} strokeWidth={3} /></span>{l}</li>
                ))}
              </ul>
            </section>
          )}
          {rule && (
            <section className="rule-card">
              <div className="eyebrow rule-eyebrow"><Icon name="bulb" color="#8A5A00" size={18} /> MERKSATZ</div>
              <div className="rule-text">{rule.map((r) => <div key={r}>{r}</div>)}</div>
            </section>
          )}
          <button type="button" className="btn-primary small video-next" disabled={!allWatched} onClick={finish}>
            {allWatched ? 'Weiter' : videos.length > 1 ? `Erst alle ${videos.length} Videos ansehen` : 'Erst das Video ansehen'}
            {allWatched && <Icon name="right" size={26} color="#231A4F" strokeWidth={3} />}
          </button>
          {!allWatched && fallback && (
            <button type="button" className="text-btn" onClick={finish}>Video lässt sich nicht abspielen? Trotzdem weiter</button>
          )}
        </aside>
      </div>
      {done !== null && <StationDone stars={3} perlen={done} text="Du hast das Video angesehen." />}
    </StationShell>
  )
}
