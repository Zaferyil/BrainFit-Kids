import { useEffect } from 'react'
import { SeZa } from '../components/SeZa'
import { save } from '../lib/storage'
import { supabase } from '../lib/supabase'
import { Stage } from '../components/Stage'

// Nach der Schnupperwoche: freundlicher Hinweis, weiter geht's mit einem Paket (Lernstand bleibt erhalten)
export function SchnupperVorbei({ kidId, name, schnupper = true, onLogout }: { kidId: string; name: string; schnupper?: boolean; onLogout: () => void }) {
  // Haben die Eltern inzwischen ein Paket gekauft? Dann Zugang aktualisieren und weiter
  useEffect(() => {
    void supabase.from('kinder').select('paket, gueltig_bis').eq('id', kidId).maybeSingle().then(({ data }) => {
      if (data && (!data.gueltig_bis || new Date(data.gueltig_bis).getTime() > Date.now())) {
        save(`bfk.zugang.${kidId}`, { paket: data.paket, bis: data.gueltig_bis })
        location.reload()
      }
    })
  }, [kidId])
  return (
    <Stage>
      <div className="dp ich ich2" style={{ textAlign: 'center' }}>
        <SeZa an={{ outfit: 'original' }} groesse={180} />
        <h1>Super gemacht, {name}!</h1>
        <p>{schnupper ? 'Deine Schnupperwoche ist vorbei.' : 'Dein Lernjahr ist vorbei.'} Mit einem Paket geht dein Abenteuer weiter – alles, was du geschafft hast, bleibt gespeichert.</p>
        <a className="nk-btn yellow" href="/#preise">Bitte deine Eltern: Jetzt weiterlernen</a>
        <button type="button" className="ich2-abmelden" onClick={onLogout}>Abmelden</button>
      </div>
    </Stage>
  )
}
