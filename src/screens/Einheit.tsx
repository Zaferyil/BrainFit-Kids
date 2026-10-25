import { Bead } from '../components/Bead'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import { WORLDS } from '../data/curriculum'
import { STATIONS, unitContent } from '../data/units'
import { currentStation, stationSkipped, stationStars, type Progress } from '../lib/progress'
import { unitVideos } from '../data/videos'

export function Einheit({ progress }: { progress: Progress }) {
  const world = WORLDS[progress.world - 1]
  const content = unitContent(progress.world, progress.unit)
  const stars = stationStars(progress)
  const current = currentStation(progress)
  const title = content?.title ?? world.units[progress.unit - 1]
  const next = STATIONS[current]

  return (
    <Stage>
      <div className="unit">
        <div className="unit-head">
          <div className="unit-title">
            <a href="#/karte" aria-label="Zur Karte" className="round-btn big"><Icon name="map" color="#FFFFFF" size={28} /></a>
            <div>
              <div className="unit-chip">Welt {world.n} · {world.name} · Einheit {progress.unit}</div>
              <h1>{title}</h1>
              {content && <p>{content.lead}</p>}
            </div>
          </div>
          {content && (
            <div className="rule-card">
              <div className="eyebrow rule-eyebrow"><Icon name="bulb" color="#8A5A00" size={18} /> MERKSATZ</div>
              <div className="rule-text">{content.rule.map((r) => <div key={r}>{r}</div>)}</div>
            </div>
          )}
        </div>

        <div className="stations">
          {STATIONS.map((s, i) => {
            const state = stationSkipped(progress, i) ? 'skipped' : i < current ? 'done' : i === current ? 'current' : 'locked'
            const videos = unitVideos(progress.world, progress.unit)
            const text = content?.stationText[s.id] ?? (s.id === 'video' && videos.length ? videos.map((v) => v.title).join(' · ') : '')
            return (
              <div key={s.id} className={`station ${state}`}>
                <div className="station-top">
                  <span className="station-icon" style={{ background: state === 'locked' ? 'var(--board)' : s.color }}>
                    {s.icon === 'bead'
                      ? <Bead color="yellow" width={40} />
                      : <Icon name={s.icon} color={state === 'locked' ? '#6B61A8' : '#231A4F'} size={32} strokeWidth={2.4} />}
                  </span>
                  <span className="station-num">{i + 1}</span>
                </div>
                <div>
                  <div className="station-title">{s.title}</div>
                  <div className="station-text">{text}</div>
                </div>
                <div className="station-foot">
                  <div className="station-stars" aria-label={`${stars[i]} von 3 Sternen`}>
                    {[0, 1, 2].map((k) => (
                      <Icon key={k} name="star" size={24} color={k < stars[i] ? '#DE9800' : state === 'current' ? '#C9C0FF' : '#4A3E9E'} fill={k < stars[i] ? '#FFC531' : 'none'} />
                    ))}
                  </div>
                  {state === 'current' && (
                    <a href={`#/station/${s.id}`} className="station-go">
                      <Icon name="play" color="#231A4F" fill="#231A4F" size={16} /> Start
                    </a>
                  )}
                  {state === 'done' && <a href={`#/station/${s.id}`} className="station-again">Nochmal</a>}
                  {state === 'locked' && <Icon name="lock" color="#6B61A8" size={26} />}
                  {state === 'skipped' && <span className="station-skip">kein Video</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="unit-foot">
          <div className="unit-perli"><Perli mood="happy" size={110} /></div>
          <div className="unit-say">
            <strong>{next ? `Jetzt kommt: ${next.title}` : 'Alle Stationen geschafft!'}</strong>
            <span>Jede Station öffnet die nächste. Für 3 Sterne: möglichst ohne Fehler.</span>
          </div>
          <div className="unit-reward">
            <span>Belohnung in dieser Einheit</span>
            <div>
              <span className="mini-chip"><Bead color="yellow" width={24} /> bis 60</span>
              <span className="mini-chip"><Icon name="medal" color="#FFC531" size={20} /> Abzeichen</span>
            </div>
          </div>
        </div>
      </div>
    </Stage>
  )
}
