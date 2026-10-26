import { useState } from 'react'
import { Fit } from '../components/Fit'
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
import { GAME_INTRO as INTRO } from '../data/sprache'
import { cameFromMap, clearActiveStop, finishActiveStop } from '../lib/mapPath'

const COMPONENTS: Record<string, (p: GameProps) => React.ReactElement> = {
  memory: PerlenMemory,
  muster: MusterMeister,
  kette: PerlenKette,
  jagd: PerlenJagd,
}


type Result = { score: number; summary: string; perlen: number; adj: Adjustment }

export function Denkspiel({ kid, game }: { kid: Kid; game: GameMeta }) {
  const tier = tierFor(kid.birthYear)
  const [level, setLevel] = useState(() => getLevel(kid.id, game.id, tier))
  const [run, setRun] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  // Von der Karte gestartet: danach zurück zur Karte, die Station gilt als geschafft
  const [fromMap] = useState(cameFromMap)
  const back = fromMap ? '#/karte' : '#/denkpark'
  const Game = COMPONENTS[game.id]
  const area = AREAS.find((a) => a.id === game.area)!

  const finish = (score: number, summary: string) => {
    const adj = adjustLevel(kid.id, game.id, tier, score)
    const perlen = perlenFor(score)
    rewardGame(kid.id, perlen)
    finishActiveStop(kid.id)
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
          <a href={back} aria-label="Spiel beenden" className="round-btn big" onClick={clearActiveStop}><Icon name="x" color="#FFFFFF" size={26} /></a>
          <div className="station-bar-title">
            <div className="eyebrow light">{fromMap ? 'DENKSPIEL AUF DEINEM WEG' : 'DENK-PARK'} · {area.name.toUpperCase()}</div>
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
          <Fit className="game-fit" max={1.5}><Game key={`${run}-${level}`} level={level} onFinish={finish} /></Fit>
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
              <a href={back} className={fromMap ? 'btn-primary small' : 'btn-outline dark'}>{fromMap ? 'Weiter auf der Karte' : 'Zum Denk-Park'}</a>
              <button type="button" className="btn-primary small" onClick={again}>Nochmal</button>
            </div>
          </div>
        </div>
      )}
    </Stage>
  )
}
