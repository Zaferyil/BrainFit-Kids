import { SeZa } from '../components/SeZa'
import { Stage } from '../components/Stage'

// Nach der Schnupperwoche: freundlicher Hinweis, weiter geht's mit einem Paket (Lernstand bleibt erhalten)
export function SchnupperVorbei({ name, onLogout }: { name: string; onLogout: () => void }) {
  return (
    <Stage>
      <div className="dp ich ich2" style={{ textAlign: 'center' }}>
        <SeZa an={{ outfit: 'original' }} groesse={180} />
        <h1>Super gemacht, {name}!</h1>
        <p>Deine Schnupperwoche ist vorbei. Mit einem Paket geht dein Abenteuer weiter – alles, was du geschafft hast, bleibt gespeichert.</p>
        <a className="nk-btn yellow" href="/#preise">Bitte deine Eltern: Jetzt weiterlernen</a>
        <button type="button" className="ich2-abmelden" onClick={onLogout}>Abmelden</button>
      </div>
    </Stage>
  )
}
