import { useState } from 'react'
import { Fit } from '../components/Fit'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { MAX_LEVEL, MIN_LEVEL, placementShift, savePlacement, setLevel, tierFor, tierRank, TIERS } from '../games/engine'
import { MusterMeister } from '../games/MusterMeister'
import { PerlenJagd } from '../games/PerlenJagd'
import { PerlenKette } from '../games/PerlenKette'
import { AREAS, GAMES, type Area } from '../games/registry'
import type { GameProps } from '../games/types'
import { rewardGame } from '../lib/progress'
import { speak } from '../lib/speak'

// Drei kurze Spiele, je eines aus einem Bereich.
const STEPS: { area: Area; title: string; say: string; rounds: number; Game: (p: GameProps) => React.ReactElement }[] = [
  { area: 'gedaechtnis', title: 'Perlen merken', say: 'Die Perlen leuchten nacheinander. Tippe sie danach in der gleichen Reihenfolge.', rounds: 3, Game: PerlenKette },
  { area: 'logik', title: 'Muster finden', say: 'Was kommt als Nächstes? Tippe die richtige Perle oder Zahl.', rounds: 4, Game: MusterMeister },
  { area: 'konzentration', title: 'Perlen suchen', say: 'Finde alle Perlen in der gesuchten Farbe.', rounds: 3, Game: PerlenJagd },
]

export function Einstufung({ kid }: { kid: Kid }) {
  const tier = tierFor(kid.birthYear)
  const start = TIERS[tier].start
  const [step, setStep] = useState(-1)
  const [scores, setScores] = useState<number[]>([])
  const done = step >= STEPS.length

  const begin = () => { setStep(0); speak(STEPS[0].say) }
  const skip = () => { savePlacement(kid.id, 'skipped'); window.location.hash = '#/karte' }

  const finish = (score: number) => {
    const all = [...scores, score]
    setScores(all)
    if (step + 1 < STEPS.length) {
      setStep(step + 1)
      speak(`Super! Jetzt: ${STEPS[step + 1].title}. ${STEPS[step + 1].say}`)
      return
    }
    // Startstufe je Bereich für alle Spiele dieses Bereichs setzen
    STEPS.forEach((s, i) => {
      const level = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, start + placementShift(all[i])))
      GAMES.filter((g) => g.area === s.area && tierRank(tier) >= tierRank(g.minTier)).forEach((g) => setLevel(kid.id, g.id, level))
    })
    savePlacement(kid.id, 'done')
    rewardGame(kid.id, 15)
    setStep(STEPS.length)
    speak(`Fertig! Jetzt kenne ich dich, ${kid.name}.`)
  }

  const cur = STEPS[step]
  return (
    <Stage>
      <div className="game-screen">
        <div className="station-bar">
          <a href="#/karte" aria-label="Zur Karte" className="round-btn big"><Icon name="x" color="#FFFFFF" size={26} /></a>
          <div className="station-bar-title">
            <div className="eyebrow light">PERLI KENNENLERNEN · ETWA 3 MINUTEN</div>
            <h1>{cur ? `${step + 1} von 3: ${cur.title}` : done ? 'Geschafft!' : `Hallo ${kid.name}!`}</h1>
          </div>
          <div className="task-dots" aria-label="Fortschritt">
            {STEPS.map((_, i) => <span key={i} className={`task-dot ${i < step || done ? 'right' : i === step ? 'current' : 'open'}`} />)}
          </div>
          {cur && (
            <button type="button" className="round-btn" aria-label="Vorlesen" onClick={() => speak(cur.say)}>
              <Icon name="volume" color="#FFFFFF" size={26} />
            </button>
          )}
        </div>

        {cur && (
          <>
            <div className="game-intro"><Perli mood="happy" size={64} /><span>{cur.say}</span></div>
            <div className="game-area">
              <Fit className="game-fit" max={1.5}><cur.Game key={step} level={start} rounds={cur.rounds} onFinish={finish} /></Fit>
            </div>
          </>
        )}

        {step === -1 && (
          <div className="placement-intro">
            <Perli mood="cheer" size={220} />
            <div className="placement-card">
              <h2>Lass uns zusammen spielen!</h2>
              <p>Drei kurze Spiele, dann weiß ich, welche Denkspiele gut zu dir passen. Es gibt kein Richtig oder Falsch – spiel einfach mit.</p>
              <ul>
                {STEPS.map((s) => {
                  const a = AREAS.find((x) => x.id === s.area)!
                  return <li key={s.area}><span style={{ background: a.color }}><Icon name={a.icon} color="#231A4F" size={20} strokeWidth={2.4} /></span>{s.title}</li>
                })}
              </ul>
              <div className="done-actions">
                <button type="button" className="btn-outline dark" onClick={skip}>Später</button>
                <button type="button" className="btn-primary small" onClick={begin}>Los geht’s <Icon name="right" size={26} color="#231A4F" strokeWidth={3} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {done && (
        <div className="done-overlay" role="dialog" aria-label="Einstufung fertig">
          <div className="done-card">
            <Perli mood="cheer" size={140} />
            <h2>Jetzt kenne ich dich!</h2>
            <p>Deine Denkspiele starten hier:</p>
            <ul className="placement-result">
              {STEPS.map((s, i) => {
                const a = AREAS.find((x) => x.id === s.area)!
                const level = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, start + placementShift(scores[i] ?? 0)))
                return <li key={s.area}><span>{a.name}</span><span className="park-badge level">Stufe {level}</span></li>
              })}
            </ul>
            <div className="done-actions">
              <a href="#/karte" className="btn-outline dark">Zur Karte</a>
              <a href="#/denkpark" className="btn-primary small">Zum Denk-Park</a>
            </div>
          </div>
        </div>
      )}
    </Stage>
  )
}
