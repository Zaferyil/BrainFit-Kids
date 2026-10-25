import { useState } from 'react'
import { Stage } from '../components/Stage'
import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Abakus } from '../components/Abakus'

const chapters = ['0:00 Was ist ein großer Freund?', '1:40 +7 am Abakus', '3:05 +6 am Abakus', '4:30 Jetzt du!']
const friends = [['9 + 1', false], ['8 + 2', false], ['7 + 3', true], ['6 + 4', true], ['5 + 5', false]] as const

const learn = (done: boolean, text: string) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: 700, fontSize: 16, lineHeight: 1.35, color: done ? undefined : 'var(--lilac)' }}>
    {done ? (
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="check" size={18} sw={3} color="#10351B" />
      </div>
    ) : (
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #4a3e9e', flexShrink: 0 }} />
    )}
    {text}
  </div>
)

export function Video() {
  const [playing, setPlaying] = useState(false)
  return (
    <Stage>
      <div style={{ padding: '28px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/einheit" aria-label="Zurück zur Einheit" className="round-btn">
            <Icon name="left" size={26} color="#fff" />
          </Link>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: 'var(--muted)' }}>STATION 1 VON 6</div>
            <h1 className="display" style={{ fontSize: 36, lineHeight: 1.05 }}>Video: Big Friends +7 und +6</h1>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ width: 44, height: 10, borderRadius: 999, background: i === 0 ? 'var(--yellow)' : 'var(--line)' }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, marginTop: 24 }}>
          <div style={{ width: 760, flexShrink: 0 }}>
            <div style={{ width: 760, height: 428, borderRadius: 28, background: '#0e0a2a', position: 'relative', overflow: 'hidden', border: '4px solid var(--panel)' }}>
              <div style={{ position: 'absolute', left: 40, bottom: 70 }}>
                <Abakus value={4} columns={2} colWidth={70} interactive={false} />
              </div>
              <div style={{ position: 'absolute', right: 56, top: 70, textAlign: 'right' }}>
                <div className="display" style={{ fontSize: 72, lineHeight: 1, color: 'var(--yellow)' }}>4 + 7</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--lilac)', marginTop: 6 }}>Lektion 7 · Big Friends</div>
              </div>
              {!playing && (
                <button
                  type="button" aria-label="Video abspielen" onClick={() => setPlaying(true)}
                  style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)', width: 112, height: 112, borderRadius: '50%', border: 0, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 0 var(--orange-d)', cursor: 'pointer' }}
                >
                  <Icon name="play" size={48} fill="#231A4F" />
                </button>
              )}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: 'rgba(14,10,42,.85)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px' }}>
                <button type="button" aria-label={playing ? 'Pause' : 'Abspielen'} onClick={() => setPlaying(!playing)} style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
                  <Icon name="play" size={22} color="#fff" fill="#fff" />
                </button>
                <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'var(--line)', position: 'relative' }}>
                  <div style={{ width: '58%', height: '100%', borderRadius: 999, background: 'var(--yellow)' }} />
                  <div style={{ position: 'absolute', left: '58%', top: '50%', width: 22, height: 22, margin: '-11px 0 0 -11px', borderRadius: '50%', background: '#fff' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--lilac-2)' }}>3:12 / 5:30</span>
                <Icon name="volume" size={22} color="#fff" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              {chapters.map((c, i) => (
                <span key={c} style={{ padding: '8px 14px', borderRadius: 14, fontWeight: 800, fontSize: 14, background: i === 2 ? 'var(--purple)' : 'var(--panel)', color: i === 2 ? '#fff' : '#8f85d6' }}>{c}</span>
              ))}
            </div>
          </div>

          <aside style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={{ background: 'var(--panel)', borderRadius: 24, padding: '20px 22px' }}>
              <h2 className="display" style={{ fontSize: 24, marginBottom: 12 }}>Das lernst du</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {learn(true, 'Was ein großer Freund ist (zusammen 10)')}
                {learn(true, '+7 rechnen: 3 weg, 1 Zehner dazu')}
                {learn(false, '+6 rechnen: 4 weg, 1 Zehner dazu')}
              </div>
            </section>
            <section style={{ background: 'var(--cream)', color: 'var(--ink)', borderRadius: 24, padding: '18px 22px', boxShadow: '0 6px 0 #e8c96b' }}>
              <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.04em', color: '#8a5a00' }}>GROSSE FREUNDE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                {friends.map(([t, hot]) => (
                  <span key={t} className="display" style={{ padding: '8px 0', textAlign: 'center', borderRadius: 12, background: hot ? 'var(--yellow)' : '#fff', fontSize: 20 }}>{t}</span>
                ))}
              </div>
            </section>
            <Link to="/entdecken" style={{ marginTop: 'auto', padding: '16px 20px', borderRadius: 24, border: '3px dashed var(--line)', display: 'flex', alignItems: 'center', gap: 12, color: 'inherit' }}>
              <Icon name="lock" size={26} color="#8f85d6" />
              <div>
                <div style={{ fontWeight: 900, fontSize: 17, color: 'var(--lilac-2)' }}>Weiter zu „Entdecken"</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#8f85d6' }}>öffnet sich, wenn das Video zu Ende ist</div>
              </div>
            </Link>
          </aside>
        </div>
      </div>
    </Stage>
  )
}
