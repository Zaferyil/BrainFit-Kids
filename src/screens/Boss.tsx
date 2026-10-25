import { useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Avatar } from '../components/Avatar'
import { go } from '../router'

const questions: number[][] = [[18, 7, 6], [9, 7, 4], [25, 6, 7], [14, 9, 8], [33, 7, 6], [21, 8, 9]]
const colors = [['#3BA7FF', '#1F6FB8'], ['#3DBE5B', '#25913F'], ['#FF8A1F', '#C45E00'], ['#FF5C8A', '#C2264E']]
const HIT = 20

// Antworten: richtige plus drei falsche, je Frage anders gemischt
function optionsFor(q: number[], i: number) {
  const ans = q.reduce((a, b) => a + b, 0)
  const all = [ans, ans - 2, ans + 2, ans + 10]
  return all.map((_, k) => all[(k + i) % all.length])
}

export function Boss() {
  const [index, setIndex] = useState(0)
  const [hp, setHp] = useState(100)
  const [hearts, setHearts] = useState(3)

  const q = questions[index]
  const answer = q.reduce((a, b) => a + b, 0)
  const options = optionsFor(q, index)

  const pick = (v: number) => {
    if (v === answer) {
      const next = hp - HIT
      setHp(next)
      if (next <= 0) return go('/ergebnis')
      setIndex((index + 1) % questions.length)
    } else {
      const left = hearts - 1
      setHearts(left)
      if (left <= 0) go('/einheit')
    }
  }

  return (
    <Stage bg="#2a0f3e">
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: '#1f0a2f' }} />
      <div style={{ position: 'absolute', left: 330, top: 300, width: 540, height: 60, borderRadius: '50%', background: '#1a0827' }} />

      <div style={{ padding: '28px 40px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to="/einheit" aria-label="Aufgeben" className="round-btn" style={{ background: '#3d1a57' }}>
              <Icon name="x" size={26} color="#fff" />
            </Link>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <Icon key={i} name="heart" size={40} color={i < hearts ? '#FF5C8A' : '#6E3B8A'} fill={i < hearts ? '#FF5C8A' : 'none'} />
              ))}
            </div>
          </div>
          <div style={{ width: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 18 }}>
              <span>Grummel, der Zahlenfresser</span>
              <span style={{ color: '#ffb3c7' }}>{hp} / 100</span>
            </div>
            <div style={{ height: 22, borderRadius: 999, background: '#3d1a57', marginTop: 8, overflow: 'hidden', border: '3px solid #5a2a7a' }}>
              <div style={{ width: `${hp}%`, height: '100%', borderRadius: 999, background: '#ff4d6d', transition: 'width .3s' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: '50%', top: 92, transform: 'translateX(-50%)', width: 300, height: 250 }}>
        <svg width="300" height="250" viewBox="0 0 300 250" role="img" aria-label="Boss Grummel">
          <path d="M78 70 L60 10 L108 52 Z" fill="#FFC531" stroke="#B8860B" strokeWidth="5" strokeLinejoin="round" />
          <path d="M222 70 L240 10 L192 52 Z" fill="#FFC531" stroke="#B8860B" strokeWidth="5" strokeLinejoin="round" />
          <path d="M40 160 C40 80 90 46 150 46 C210 46 260 80 260 160 C260 210 220 236 150 236 C80 236 40 210 40 160 Z" fill="#7B3FD0" stroke="#4A1F8F" strokeWidth="6" />
          <path d="M70 150 C70 100 100 76 150 76 C200 76 230 100 230 150" fill="none" stroke="#9A63E6" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
          <path d="M90 108 L134 124" stroke="#231A4F" strokeWidth="9" strokeLinecap="round" />
          <path d="M210 108 L166 124" stroke="#231A4F" strokeWidth="9" strokeLinecap="round" />
          <ellipse cx="114" cy="140" rx="17" ry="19" fill="#FFFFFF" />
          <ellipse cx="186" cy="140" rx="17" ry="19" fill="#FFFFFF" />
          <circle cx="118" cy="144" r="8" fill="#231A4F" />
          <circle cx="182" cy="144" r="8" fill="#231A4F" />
          <path d="M100 190 Q150 176 200 190 Q150 222 100 190 Z" fill="#2A0F3E" />
          <path d="M118 186 L124 198 L130 184 M160 183 L166 197 L172 186" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" strokeLinejoin="round" />
          <text x="38" y="96" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="30" fill="#FFC531" opacity="0.7">7</text>
          <text x="248" y="120" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="26" fill="#3BA7FF" opacity="0.7">+6</text>
        </svg>
        <div className="display" style={{ position: 'absolute', right: -40, top: 40, padding: '6px 14px', borderRadius: 14, background: 'var(--yellow)', color: 'var(--ink)', fontSize: 30, transform: 'rotate(8deg)' }}>−{HIT}!</div>
      </div>

      <div style={{ position: 'absolute', left: 40, right: 40, top: 378 }}>
        <div className="card-white" style={{ margin: '0 auto', width: 640, padding: 22, borderRadius: 32, textAlign: 'center', boxShadow: '0 8px 0 #c9a7f2' }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: '#7b3fd0' }}>TREFFER {(100 - hp) / HIT} VON {100 / HIT}</div>
          <div className="display" style={{ fontSize: 72, lineHeight: 1.1 }}>{q.join(' + ')} = ?</div>
          <div style={{ height: 10, borderRadius: 999, background: '#efe7fb', marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${100 - hp}%`, height: '100%', borderRadius: 999, background: 'var(--orange)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, width: 900, margin: '28px auto 0' }}>
          {options.map((v, i) => (
            <button
              key={`${index}-${i}`} type="button" onClick={() => pick(v)} className="display"
              style={{ height: 120, borderRadius: 30, border: 0, cursor: 'pointer', fontSize: 56, color: 'var(--ink)', background: colors[i][0], boxShadow: `0 8px 0 ${colors[i][1]}` }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 40, bottom: 26, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ padding: 4, borderRadius: '50%', background: 'var(--yellow)' }}>
          <Avatar size={70} hat="cap" hatColor="#FF4D6D" shirt="#3BA7FF" />
        </div>
        <div style={{ fontWeight: 900, fontSize: 18 }}>
          Lena<br /><span style={{ fontWeight: 800, fontSize: 14, color: '#ffb3c7' }}>Antworte schnell für Extra-Schaden</span>
        </div>
      </div>
    </Stage>
  )
}
