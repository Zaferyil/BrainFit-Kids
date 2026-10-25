import { useState } from 'react'
import { Bead } from '../components/Bead'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'
import { Stage } from '../components/Stage'
import type { Kid } from '../data/demo'
import { adjustLevel, getLevel, perlenFor, tierFor, type Adjustment } from '../games/engine'
import { MusterMeister } from '../games/MusterMeister'
import { PerlenKette } from '../games/PerlenKette'
import { PerlenMemory } from '../games/PerlenMemory'
import { PerlenJagd } from '../games/PerlenJagd'
import { AREAS, type GameMeta } from '../games/registry'
import type { GameProps } from '../games/types'
import { rewardGame } from '../lib/progress'
import { speak } from '../lib/speak'

const COMPONENTS: Record<string, (p: GameProps) => React.ReactElement> = {
  memory: PerlenMemory,
  muster: MusterMeister,
  kette: PerlenKette,
  jagd: PerlenJagd,
}

const INTRO: Record<string, string> = {
  memory: 'Decke immer zwei Karten auf. Finde alle Paare!',
  muster: 'Schau dir die Reihe an. Was kommt als Nächstes?',
  kette: 'Die Perlen leuchten nacheinander. Tippe sie danach in der gleichen Reihenfolge.',
  jagd: 'Tippe so schnell du kannst alle Perlen in der gesuchten Farbe an.',
}

type Result = { score: number; summary: string; perlen: number; adj: Adjustment }

export function Denkspiel({ kid, game }: { kid: Kid; game: GameMeta }) {
  const tier = tierFor(kid.birthYear)
  const [level, setLevel] = useState(() => getLevel(kid.id, game.id, tier))
  const [run, setRun] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const Game = COMPONENTS[game.id]
  const area = AREAS.find((a) => a.id === game.area)!

  const finish = (score: number, summary: string) => {
    const adj = adjustLevel(kid.id, game.id, tier, score)
    const perlen = perlenFor(score)
    rewardGame(kid.id, perlen)
    setResult({ score, summary, perlen, adj })
    speak(score >= 0.9 ? 'Super gemacht!' : score >= 0.6 ? 'Gut gemacht!' : 'Weiter so, du schaffst das!')
  }

  const again = () => {
    if (result) setLevel(result.adj.to)
    setResult(null)
    setRun(run + 1)
  }

  const levelText = !result ? '' : result.adj.change === 'up'
    ? `Stufe ${result.adj.from} → ${result.adj.to}: Nächstes Mal wird es kniffliger!`
    : result.adj.change === 'down'
      ? `Stufe ${result.adj.from} → ${result.adj.to}: Wir üben noch etwas leichter.`
      : `Du bleibst auf Stufe ${result.adj.to}.`

  return (
    <Stage>
      <div className="game-screen">
        <div className="station-bar">
          <a href="#/denkpark" aria-label="Spiel beenden" className="round-btn big"><Icon name="x" color="#FFFFFF" size={26} /></a>
          <div className="station-bar-title">
            <div className="eyebrow light">DENK-PARK · {area.name.toUpperCase()}</div>
            <h1>{game.name}</h1>
          </div>
          <span className="park-badge level big">Stufe {level}</span>
          <button type="button" className="round-btn" aria-label="Vorlesen" onClick={() => speak(INTRO[game.id])}>
            <Icon name="volume" color="#FFFFFF" size={26} />
          </button>
        </div>
        <div className="game-intro">
          <Perli mood="happy" size={64} />
          <span>{INTRO[game.id]}</span>
        </div>
        <div className="game-area">
          <Game key={`${run}-${level}`} level={level} onFinish={finish} />
        </div>
      </div>
      {result && (
        <div className="done-overlay" role="dialog" aria-label="Ergebnis">
          <div className="done-card">
            <Perli mood={result.score >= 0.6 ? 'cheer' : 'happy'} size={140} />
            <h2>{result.score >= 0.9 ? 'Super!' : result.score >= 0.6 ? 'Gut gemacht!' : 'Weiter so!'}</h2>
            <p>{result.summary}</p>
            <div className={`level-change ${result.adj.change}`}>
              <Icon name={result.adj.change === 'up' ? 'chart' : result.adj.change === 'down' ? 'refresh' : 'target'} color="currentColor" size={22} />
              {levelText}
            </div>
            <div className="done-reward"><Bead color="yellow" width={36} /> +{result.perlen} Perlen</div>
            <div className="done-actions">
              <a href="#/denkpark" className="btn-outline dark">Zum Denk-Park</a>
              <button type="button" className="btn-primary small" onClick={again}>Nochmal</button>
            </div>
          </div>
        </div>
      )}
    </Stage>
  )
}
