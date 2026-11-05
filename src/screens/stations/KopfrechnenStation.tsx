import { useEffect, useState } from 'react'
import { Fit } from '../../components/Fit'
import { Abakus } from '../../components/Abakus'
import { Icon } from '../../components/Icon'
import { Perli } from '../../components/Perli'
import { describeNumber, randomIn, type UnitContent, makeSum, rechnet } from '../../data/units'
import { finishStation } from '../../lib/progress'
import { klasseVon } from '../../lib/klasse'
import { speak } from '../../lib/speak'
import { SAY, STATION_INTRO, sayDescribe } from '../../data/sprache'
import { Keypad, StationDone, StationShell } from './StationShell'
import { typeDigit } from '../../lib/typeDigit'
import { KOPF_STUFEN, kopfStufe, kopfStufeNachRunde } from '../../lib/kopfAbakus'


/** Zahlen (bzw. bei Rechen-Einheiten die Startzahl a) für alle Aufgaben */
/** Je Aufgabe die Zahl a und (bei Rechen-Einheiten) das „+b“ */
const makePairs = (content: UnitContent, COUNT: number) => {
  const out: { a: number; b: number }[] = []
  while (out.length < COUNT) {
    const prev = out[out.length - 1]?.a
    out.push(rechnet(content) ? makeSum(content, prev) : { a: randomIn(content.range, prev), b: 0 })
  }
  return out
}

const starsFor = (errors: number) => (errors === 0 ? 3 : errors <= 1 ? 2 : 1)

export function KopfrechnenStation({ kidId, content }: { kidId: string; content: UnitContent }) {
  const [COUNT] = useState(() => klasseVon(kidId).aufgaben)
  const [pairs] = useState(() => makePairs(content, COUNT))
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [state, setState] = useState<'ask' | 'right' | 'wrong'>('ask')
  const [results, setResults] = useState<('right' | 'wrong')[]>([])
  const [done, setDone] = useState<{ stars: number; perlen: number } | null>(null)
  const add = pairs[index].b
  const a = pairs[index].a
  const n = a + add
  const sum = add ? `${a} + ${add}` : null
  const phrase = sum ?? describeNumber(n)
  const [started, setStarted] = useState(false)
  const [stufe] = useState(() => kopfStufe(kidId))
  const [wechsel, setWechsel] = useState(0)
  // was der Abakus während der Aufgabe zeigt (bei reinen Zahl-Aufgaben nie die Lösung)
  const zeigeStart = sum && stufe <= 1 ? a : 0
  const question = sum ? [SAY.rechne, String(a), SAY.plus, String(add), SAY.wievielIst] : [...sayDescribe(n), SAY.welcheZahlIst]
  const questionKey = question.join('|')

  useEffect(() => { if (started) void speak(questionKey.split('|')) }, [started, questionKey, index])

  const onKey = (k: string) => {
    if (state !== 'ask') return
    const t = typeDigit(input, k, n)
    setInput(t.input)
    if (!t.done) return
    const ok = Number(t.input) === n
    const res = [...results, ok ? 'right' as const : 'wrong' as const]
    setResults(res)
    setState(ok ? 'right' : 'wrong')
    void speak(ok ? SAY.richtig : [SAY.fastDasIst, String(n)])
    window.setTimeout(() => {
      setInput('')
      setState('ask')
      if (index + 1 >= COUNT) {
        const errors = res.filter((r) => r === 'wrong').length
        const stars = starsFor(errors)
        // doppelte Perlen ohne Abakus
        setWechsel(kopfStufeNachRunde(kidId, errors))
        setDone({ stars, perlen: finishStation(kidId, 'kopfrechnen', stars, (COUNT - errors) * 2) })
      } else setIndex(index + 1)
    }, ok ? 1000 : 2400)
  }

  const dots = pairs.map((_, i) => results[i] ?? (i === index ? 'current' : 'open'))

  return (
    <StationShell station="kopfrechnen" title="Perlen im Kopf" dots={dots} perlen={results.filter((r) => r === 'right').length * 2} intro={STATION_INTRO.kopfrechnen} started={started} onStart={() => setStarted(true)} say={question}>
      <div className="mental">
        <div className="mental-think">
          <div className="mental-badge"><Icon name="eyeoff" color="#C9C0FF" size={22} /> Kopf-Abakus {stufe + 1}/{KOPF_STUFEN.length} · {KOPF_STUFEN[stufe].name} · doppelte Perlen</div>
          {(stufe < 3 || state === 'wrong') && (
            <Fit className={`mental-abakus kopf-${stufe}`}>
              <Abakus key={`${index}-${state}`} value={state === 'wrong' ? n : zeigeStart} cols={content.cols} colw={90} faded={state !== 'wrong' && stufe >= 2} interactive={false} />
            </Fit>
          )}
          {stufe >= 3 && state !== 'wrong' && <div className="kopf-leer"><Icon name="brain" color="#FFFFFF" size={72} /><span>Der Abakus ist in deinem Kopf</span></div>}
          <div className="mental-perli">
            <Perli mood={state === 'right' ? 'cheer' : 'think'} size={170} />
            <div className="say-bubble">
              {state === 'wrong' ? (sum ? `${sum} = ${n}. ${content.rule[0]}.` : `So sieht die ${n} aus: ${phrase}.`) : KOPF_STUFEN[stufe].text}
            </div>
          </div>
        </div>
        <section className="mental-task">
          <div className="mental-q">
            <div className="eyebrow">AUFGABE {index + 1} VON {COUNT} · {sum ? 'RECHNE IM KOPF' : 'STELL DIR VOR'}</div>
            <div className="mental-phrase">{phrase[0].toUpperCase() + phrase.slice(1)}</div>
            <div className="mental-eq">
              <div className={`task-answer ${state === 'ask' ? '' : state} ${input ? 'filled' : ''}`}>{input || '?'}</div>
            </div>
          </div>
          <Keypad onKey={onKey} disabled={state !== 'ask'} />
        </section>
      </div>
      {done && <StationDone stars={done.stars} perlen={done.perlen} text={wechsel > 0 ? `Super! Nächste Kopf-Abakus-Stufe: ${KOPF_STUFEN[stufe + 1].name}. ${KOPF_STUFEN[stufe + 1].text}` : wechsel < 0 ? 'Wir üben noch einmal mit mehr Hilfe vom Abakus.' : stufe === 3 ? 'Der Abakus ist jetzt ganz in deinem Kopf!' : 'Noch eine Runde ohne Fehler, dann wird der Abakus noch blasser.'} />}
    </StationShell>
  )
}
