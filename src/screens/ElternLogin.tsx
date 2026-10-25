import { Link } from '../components/Link'
import { Icon } from '../components/Icon'
import { Perli } from '../components/Perli'

export function ElternLogin() {
  return (
    <div className="page" style={{ display: 'flex', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 480px', minHeight: 420, background: 'var(--bg)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -120, bottom: -120, width: 420, height: 420, borderRadius: '50%', background: 'var(--panel-2)' }} />
        <Link to="/" className="logo" style={{ color: '#fff', position: 'relative' }}>
          <div className="logo-mark" style={{ width: 40, height: 40 }}><Icon name="pearl" size={24} sw={2.4} /></div>
          <span className="display" style={{ fontSize: 24 }}>Abakus Akademie</span>
        </Link>
        <div style={{ position: 'relative', maxWidth: 460 }}>
          <h1 className="display" style={{ fontSize: 46, lineHeight: 1.05 }}>Begleiten Sie den Lernweg Ihres Kindes.</h1>
          <p style={{ marginTop: 16, fontSize: 18, lineHeight: 1.5, fontWeight: 600, color: 'var(--lilac-2)' }}>
            Wöchentlicher Lernbericht, Lernzeit-Einstellungen und Nachrichten der Lehrkraft – alles an einem Ort.
          </p>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <Perli mood="happy" size={140} />
          <div className="bubble" style={{ marginBottom: 40, padding: '12px 16px', borderRadius: '18px 18px 18px 4px', fontSize: 15 }}>Keine Werbung. Keine Käufe mit echtem Geld.</div>
        </div>
      </div>

      <div style={{ flex: '1 1 420px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 className="display" style={{ fontSize: 34 }}>Eltern-Anmeldung</h2>
          <p style={{ margin: '6px 0 26px', fontSize: 16, fontWeight: 600, color: 'var(--ink-soft)' }}>Melden Sie sich mit Ihrer E-Mail-Adresse an.</p>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={(e) => e.preventDefault()}>
            <label className="field-label" style={{ fontSize: 15 }}>
              E-Mail
              <input className="field" type="email" defaultValue="huber.familie@beispiel.at" style={{ padding: '14px 16px', borderRadius: 14, fontWeight: 700 }} />
            </label>
            <label className="field-label" style={{ fontSize: 15 }}>
              Passwort
              <input className="field" type="password" defaultValue="geheim123" style={{ padding: '14px 16px', borderRadius: 14, fontWeight: 700 }} />
            </label>
            <a href="#/eltern" style={{ alignSelf: 'flex-end', fontWeight: 800, fontSize: 14 }}>Passwort vergessen?</a>
            <Link to="/eltern/uebersicht" style={{ padding: 16, borderRadius: 14, background: 'var(--purple)', color: '#fff', textAlign: 'center', textDecoration: 'none', fontWeight: 900, fontSize: 18 }}>Anmelden</Link>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0', color: '#8f85d6', fontWeight: 800, fontSize: 14 }}>
            <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />
            Neu hier?
            <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />
          </div>
          <div style={{ padding: 18, borderRadius: 18, background: '#fff', border: '2px solid var(--border)' }}>
            <div style={{ fontWeight: 900, fontSize: 16 }}>Konto mit Einladungs-Code erstellen</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-soft)', marginTop: 4 }}>Den Code erhalten Sie von der Lehrkraft Ihres Kindes.</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <label style={{ flex: 1, display: 'flex' }}>
                <span className="sr-only">Einladungs-Code</span>
                <input className="field" type="text" defaultValue="LENA-4821" style={{ fontWeight: 900, letterSpacing: '0.08em' }} />
              </label>
              <button type="button" style={{ padding: '12px 18px', borderRadius: 12, border: 0, background: 'var(--orange)', color: 'var(--ink)', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>Weiter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
