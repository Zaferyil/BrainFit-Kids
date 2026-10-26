import { useEffect, useState } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus3D } from '../../components/Abakus3D'
import { Grummel } from '../../components/Grummel'
import { Icon } from '../../components/Icon'
import { Stage } from '../../components/Stage'
import { WORLDS } from '../../data/curriculum'
import { describeNumber, randomIn, type UnitContent } from '../../data/units'
import { completeUnit, finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { SayButton, StationDone, StationIntro } from './StationShell'
import { SAY, STATION_INTRO, sayDescribe } from '../../data/sprache'

const HITS = 10
const LIVES = 3

type Question = { kind: 'read' | 'describe'; n: number; options: number[] }

function makeQuestion(range: [number, number], prev?: number): Question {
  const n = randomIn(range, prev)
  const opts = new Set([n])
  // bei zwei Stellen: ähnliche Zahlen (Ziffern vertauscht, ±1, ±10) als Ablenkung
  const near = n >= 10 ? [Number(String(n).split('').reverse().join('')), n + 1, n - 1, n + 10, n - 10] : []
  for (const x of near) if (opts.size < 4 && x >= range[0] && x <= range[1]) opts.add(x)
  while (opts.size < 4) opts.add(randomIn(range))
  return { kind: Math.random() < 0.5 ? 'read' : 'describe', n, options: [...opts].sort(() => Math.random() - 0.5) }
}

export function BossStation({ kidId, content, world, unit }: { kidId: string; content: UnitContent; world: number; unit: number }) {
  const [q, setQ] = useState(() => makeQuestion(content.range))
  const [hits, setHits] = useState(0)
  const [lives, setLives] = useState(LIVES)
  const [picked, setPicked] = useState<number | null>(null)
  const [result, setResult] = useState<'won' | 'lost' | null>(null)
  const [reward, setReward] = useState<{ perlen: number; worldDone: boolean } | null>(null)
  const [started, setStarted] = useState(false)
  const hp = Math.round(((HITS - hits) / HITS) * 100)
  const question = q.kind === 'read' ? [SAY.welcheZahlAbakus] : [...sayDescribe(q.n), SAY.welcheZahlIst]
  const questionKey = question.join('|')

  useEffect(() => { if (started) void speak(questionKey.split('|')) }, [started, questionKey, q])

  const answer = (v: number) => {
    if (picked !== null || result) return
    setPicked(v)
    const ok = v === q.n
    const nextHits = ok ? hits + 1 : hits
    const nextLives = ok ? lives : lives - 1
    void speak(ok ? SAY.treffer : [SAY.autsch, String(q.n)])
    window.setTimeout(() => {
      setHits(nextHits)
      setLives(nextLives)
      setPicked(null)
      if (nextHits >= HITS) {
        const stars = nextLives
        const perlen = finishStation(kidId, 'boss', stars, HITS)
        const w = WORLDS[world - 1]
        const { worldDone } = completeUnit(kidId, w.units.length, WORLDS.length)
        setReward({ perlen, worldDone })
        setResult('won')
        void speak(SAY.bossGewonnen)
      } else if (nextLives <= 0) {
        setResult('lost')
        void speak(SAY.bossVerloren)
      } else setQ(makeQuestion(content.range, q.n))
    }, ok ? 800 : 1800)
  }

  const retry = () => { setQ(makeQuestion(content.range)); setHits(0); setLives(LIVES); setResult(null) }
  const w = WORLDS[world - 1]
  const nextText = reward?.worldDone
    ? `Welt ${world} geschafft! Du bekommst den ${w.belt} Gürtel und 1 Diamant.`
    : `Einheit ${unit} geschafft! Einheit ${unit + 1} ist jetzt offen.`

  return (
    <Stage >
      <div className="boss">
        <div className="boss-top">
          <a href="#/einheit" aria-label="Aufgeben" className="round-btn big"><Icon name="x" color="#FFFFFF" size={26} /></a>
          <div className="boss-lives" aria-label={`${lives} von ${LIVES} Leben`}>
            {Array.from({ length: LIVES }, (_, i) => (
              <Icon key={i} name="heart" size={40} color={i < lives ? '#FF5C8A' : '#6E3B8A'} fill={i < lives ? '#FF5C8A' : 'none'} />
            ))}
          </div>
          <SayButton say={question} />
          <div className="boss-hp">
            <div className="boss-hp-head"><span>Grummel, der Zahlenfresser</span><span>{hp} / 100</span></div>
            <div className="boss-hp-track"><div style={{ width: `${hp}%` }} /></div>
          </div>
        </div>

        <div className="boss-arena">
          <Fit className="boss-fit"><Grummel size={280} hit={picked !== null && picked === q.n} /></Fit>
          {picked !== null && picked === q.n && <div className="boss-pow">−10!</div>}
        </div>

        <div className="boss-panel">
          <div className="boss-question">
            <div className="eyebrow light">TREFFER {hits} VON {HITS}</div>
            {q.kind === 'read' ? (
              <div className="boss-q-read">
                <Abakus3D key={`${hits}-${lives}`} value={q.n} cols={content.cols} colw={content.cols > 1 ? 56 : 70} />
                <span>Welche Zahl?</span>
              </div>
            ) : (
              <div className="boss-q-text">{describeNumber(q.n)[0].toUpperCase() + describeNumber(q.n).slice(1)} = ?</div>
            )}
          </div>
          <div className="boss-options">
            {q.options.map((o) => (
              <button
                key={o}
                type="button"
                className={picked === null ? 'boss-opt' : o === q.n ? 'boss-opt right' : o === picked ? 'boss-opt wrong' : 'boss-opt dim'}
                disabled={picked !== null}
                onClick={() => answer(o)}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!started && <StationIntro station="boss" text={STATION_INTRO.boss} onStart={() => setStarted(true)} />}
      {result === 'lost' && (
        <div className="done-overlay" role="dialog" aria-label="Verloren">
          <div className="done-card">
            <Grummel size={180} />
            <h2>Fast geschafft!</h2>
            <p>Grummel hat diesmal gewonnen. Du hast {hits} von {HITS} Treffern geschafft.</p>
            <div className="done-actions">
              <a href="#/einheit" className="btn-outline dark">Zur Einheit</a>
              <button type="button" className="btn-primary small" onClick={retry}>Nochmal kämpfen</button>
            </div>
          </div>
        </div>
      )}
      {result === 'won' && reward && (
        <StationDone
          title="Grummel besiegt!"
          stars={lives}
          perlen={reward.perlen}
          text={nextText}
          say={[SAY.bossGewonnen]}
          href={reward.worldDone ? '#/karte' : '#/einheit'}
          extra={<div className="done-trophy"><Icon name="trophy" color="#DE9800" fill="#FFE58F" size={40} /> Pokal: {content.title}</div>}
        />
      )}
    </Stage>
  )
}
