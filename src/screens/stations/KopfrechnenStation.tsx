import { useState } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import { describeDigit, type UnitContent } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { speak } from '../../lib/speak'
import { Keypad, StationDone, StationShell } from './StationShell'

const COUNT = 8

const randomDigits = () => {
  const out: number[] = []
  while (out.length < COUNT) {
    const n = 1 + Math.floor(Math.random() * 9)
    if (n !== out[out.length - 1]) out.push(n)
  }
  return out
}

const starsFor = (errors: number) => (errors === 0 ? 3 : errors <= 1 ? 2 : 1)

export function KopfrechnenStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  const [numbers] = useState(randomDigits)
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [state, setState] = useState<'ask' | 'right' | 'wrong'>('ask')
  const [results, setResults] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const n = numbers[index]
  const phrase = describeDigit(n)

  const onKey = (k: string) => {
    if (state !== 'ask') return
    if (k === 'C' || k === 'del') { setInput(''); return }
    setInput(k)
    const ok = Number(k) === n
    const res = [...results, ok ? 'right' as const : 'wrong' as const]
    setResults(res)
    setState(ok ? 'right' : 'wrong')
    speak(ok ? 'Richtig!' : `Das ist die ${n}.`)
    window.setTimeout(() => {
      setInput('')
      setState('ask')
      if (index + 1 >= COUNT) {
        const errors = res.filter((r) => r === 'wrong').length
        const stars = starsFor(errors)
        // doppelte Perlen ohne Abakus
        setDone({ stars, perlen: finishStation(kidId, 'kopfrechnen', stars, (COUNT - errors) * 2) })
      } else setIndex(index + 1)
    }, ok ? 1000 : 2400)
  }

  const dots = numbers.map((_, i) => results[i] ?? (i === index ? 'current' : 'open'))

  return (
    <StationShell station="kopfrechnen" title="Perlen im Kopf" dots={dots} perlen={results.filter((r) => r === 'right').length * 2}>
      <div className="mental">
        <div className="mental-think">
          <div className="mental-badge"><Icon name="eyeoff" color="#C9C0FF" size={22} /> Ohne Abakus · doppelte Perlen</div>
          <Fit className="mental-abakus">
            <Abakus key={`${index}-${state}`} value={state === 'wrong' ? n : 0} cols={content.cols} colw={90} faded={state !== 'wrong'} interactive={false} />
          </Fit>
          <div className="mental-perli">
            <Perli mood={state === 'right' ? 'cheer' : 'think'} size={170} />
            <div className="say-bubble">
              {state === 'wrong' ? `So sieht die ${n} aus: ${phrase}.` : 'Mach die Augen zu und stell dir die Perlen vor.'}
            </div>
          </div>
        </div>
        <section className="mental-task">
          <div className="mental-q">
            <div className="eyebrow">AUFGABE {index + 1} VON {COUNT} · STELL DIR VOR</div>
            <div className="mental-phrase">{phrase[0].toUpperCase() + phrase.slice(1)}</div>
            <div className="mental-eq">
              <span>=</span>
              <div className={`task-answer ${state === 'ask' ? '' : state} ${input ? 'filled' : ''}`}>{input || '?'}</div>
            </div>
          </div>
          <Keypad onKey={onKey} disabled={state !== 'ask'} />
        </section>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text="Der Abakus ist jetzt in deinem Kopf!" />}
    </StationShell>
  )
}
