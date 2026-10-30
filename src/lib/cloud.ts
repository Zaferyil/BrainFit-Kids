import { supabase } from './supabase'
import { CLASSES, ladeSchule, speichereSchule, type Kid } from '../data/demo'
import { save } from './storage'

// Anmeldung über Supabase: Kinder haben die interne Adresse <benutzer>@kinder.brainfit-kids.at.
// Das angemeldete Kind wird zusätzlich auf diesem Gerät angelegt, damit die App wie bisher läuft;
// das Speichern von Fortschritt und Guthaben in der Datenbank folgt im nächsten Schritt.

const KLASSE = 'ONLINE'

export async function cloudLogin(benutzer: string, passwort: string) {
  const email = `${benutzer.trim().toLowerCase()}@kinder.brainfit-kids.at`
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: passwort.trim() })
  if (error || !data.user) return null
  const { data: k } = await supabase.from('kinder').select('id, benutzer, vorname, stufe').eq('id', data.user.id).maybeSingle()
  if (!k) return null

  const sch = ladeSchule()
  if (!sch.kinder.some((x) => x.id === k.id)) {
    const kid: Kid & { klasse: string } = {
      id: k.id, name: k.vorname, benutzer: k.benutzer, birthYear: new Date().getFullYear() - 8, klasse: KLASSE,
      password: ['stern', 'herz', 'blitz', 'krone'], avatar: { hat: 'none', hatColor: '#3BA7FF', shirt: '#3BA7FF', hair: '#231A4F', skin: '#F6C9A6' },
    }
    speichereSchule({ ...sch, klassen: sch.klassen.includes(KLASSE) ? sch.klassen : [...sch.klassen, KLASSE], kinder: [...sch.kinder, kid] })
  }
  if (k.stufe !== null && k.stufe !== undefined) save(`bfk.stufe.${k.id}`, k.stufe)
  const klasse = CLASSES.find((c) => c.code === KLASSE)
  const kid = klasse?.kids.find((x) => x.id === k.id)
  return klasse && kid ? { klasse, kid } : null
}

export const cloudLogout = () => supabase.auth.signOut()
