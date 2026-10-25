import { useEffect, useState } from 'react'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import type { UnitContent } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { StationDone, StationShell } from './StationShell'

export function EntdeckenStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  const steps = content.discover
  const [step, setStep] = useState(0)
  const [value, setValue] = useState(steps[0].start)
  const [solved, setSolved] = useState(false)
  const [done, setDone] = useState<number | null>(null)
  const cur = steps[step]
  const last = step === steps.length - 1
  const waiting = cur.goal !== null && !solved

  useEffect(() => { speak(cur.say) }, [cur.say])

  const go = (to: number) => {
    setStep(to)
    setValue(steps[to].start)
    setSolved(false)
  }

  const onChange = (v: number) => {
    setValue(v)
    if (cur.goal !== null && v === cur.goal && !solved) {
      setSolved(true)
      speak('Richtig!')
      setTimeout(() => go(step + 1), 1300)
    }
  }

  const finish = () => {
    const goals = steps.filter((s) => s.goal !== null).length
    setDone(finishStation(kidId, 'entdecken', 3, goals))
  }

  return (
    <StationShell station="entdecken" title={`So funktioniert der Abakus`}>
      <div className="discover">
        <div className="discover-board">
          <div className="board-label">Einer</div>
          <Abakus key={step} value={cur.start} cols={content.cols} colw={150} interactive={cur.goal !== null && !solved} onChange={onChange} />
          <div className="board-value">{value}</div>
        </div>
        <div className="discover-side">
          <ol className="discover-steps">
            {steps.map((s, i) => (
              <li key={i} className={i < step ? 'done' : i === step ? 'current' : ''}>
                <span className="step-num">{i < step ? <Icon name="check" color="#10351B" size={20} strokeWidth={3} /> : i + 1}</span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <div className="perli-say">
            <Perli mood={solved ? 'cheer' : cur.mood} size={104} />
            <div className="say-bubble" role="status">{solved ? 'Richtig! Super gemacht.' : cur.say}</div>
          </div>
          <div className="discover-actions">
            <button type="button" className="btn-outline" disabled={step === 0} onClick={() => go(step - 1)}>Zurück</button>
            {last ? (
              <button type="button" className="btn-primary small grow" onClick={finish}>Fertig</button>
            ) : (
              <button type="button" className="btn-primary small grow" disabled={waiting} onClick={() => go(step + 1)}>
                {waiting ? 'Tippe auf die Perlen' : 'Nächster Schritt'}
              </button>
            )}
          </div>
        </div>
      </div>
      {done !== null && <StationDone stars={3} perlen={done} text="Du kennst jetzt die Erd- und Himmelsperlen." />}
    </StationShell>
  )
}
