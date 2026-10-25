import { useState } from 'react'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import type { UnitContent } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { StationDone, StationShell } from './StationShell'

export function VideoStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  const [done, setDone] = useState<number | null>(null)
  return (
    <StationShell station="video" title={`Video: ${content.title}`}>
      <div className="video-layout">
        <div className="video-box">
          {content.videoId ? (
            <iframe
              title={`Lernvideo: ${content.title}`}
              src={`https://www.youtube-nocookie.com/embed/${content.videoId}?rel=0&modestbranding=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="video-missing">
              <Abakus value={7} cols={1} colw={110} interactive={false} />
              <div>
                <div className="video-missing-title">Das Video kommt bald</div>
                <p>Für diese Einheit fehlt noch der Link zum Lernvideo. Du kannst trotzdem weitermachen.</p>
              </div>
            </div>
          )}
        </div>
        <aside className="video-side">
          <section className="learn-card">
            <h2>Das lernst du</h2>
            <ul>
              {content.learn.map((l) => (
                <li key={l}><span className="learn-dot"><Icon name="check" color="#10351B" size={18} strokeWidth={3} /></span>{l}</li>
              ))}
            </ul>
          </section>
          <section className="rule-card">
            <div className="eyebrow rule-eyebrow"><Icon name="bulb" color="#8A5A00" size={18} /> MERKSATZ</div>
            <div className="rule-text">{content.rule.map((r) => <div key={r}>{r}</div>)}</div>
          </section>
          <button type="button" className="btn-primary small video-next" onClick={() => setDone(finishStation(kidId, 'video', 3, 0))}>
            Weiter <Icon name="right" size={26} color="#231A4F" strokeWidth={3} />
          </button>
        </aside>
      </div>
      {done !== null && <StationDone stars={3} perlen={done} text="Du hast das Video angesehen." />}
    </StationShell>
  )
}
