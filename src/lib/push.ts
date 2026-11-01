import { supabase } from './supabase'

// Push-Benachrichtigungen: Gerät anmelden/abmelden, Einstellungen der Eltern, Motivations-Melodie.
// Der öffentliche VAPID-Schlüssel darf in der App stehen; der private liegt nur in Supabase (Secret VAPID_PRIVATE).
const VAPID_PUBLIC = 'BDFJCxlorlm-JCZP1eoRv-FdDQn6qLTIvMUWfqZvfhCHFqi_1O7IK4oHRGjgCXHEhs7Vn_jXtm36_G0zvf8SIFA'

export type PushRolle = 'kind' | 'eltern'
export type PushEinstellungen = { kind_an: boolean; erinnerung: string; serie_an: boolean; eltern_woche: boolean; eltern_pause: boolean }
export const STANDARD: PushEinstellungen = { kind_an: false, erinnerung: '17:00', serie_an: true, eltern_woche: true, eltern_pause: true }

/** Kann dieses Gerät überhaupt Push? (iPhone nur als installierte App vom Home-Bildschirm) */
export function pushMoeglich() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}
export const istIphone = () => /iPhone|iPad|iPod/.test(navigator.userAgent)
export const istInstalliert = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true

const schluessel = (b64: string) => {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}
const merkKey = (kid: string, rolle: PushRolle) => `bfk.push.${rolle}.${kid}`

/** Ist dieses Gerät für Kind/Rolle angemeldet? */
export async function pushAktiv(kidId: string, rolle: PushRolle) {
  if (!pushMoeglich() || Notification.permission !== 'granted') return false
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  try { return !!sub && localStorage.getItem(merkKey(kidId, rolle)) === sub.endpoint } catch { return !!sub }
}

/** Erlaubnis fragen und Gerät beim Server anmelden. Rückgabe: 'ok' | 'abgelehnt' | 'fehler' */
export async function pushEinschalten(kidId: string, rolle: PushRolle): Promise<'ok' | 'abgelehnt' | 'fehler'> {
  if (!pushMoeglich()) return 'fehler'
  const erlaubnis = await Notification.requestPermission()
  if (erlaubnis !== 'granted') return 'abgelehnt'
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: schluessel(VAPID_PUBLIC) }))
    const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
    const { error } = await supabase.rpc('push_abo_speichern', { p_kind: kidId, p_rolle: rolle, p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth })
    if (error) { console.warn('Push-Anmeldung:', error.message); return 'fehler' }
    try { localStorage.setItem(merkKey(kidId, rolle), j.endpoint) } catch { /* egal */ }
    return 'ok'
  } catch (e) { console.warn('Push-Anmeldung:', e); return 'fehler' }
}

/** Dieses Gerät für Kind/Rolle abmelden (andere Anmeldungen auf dem Gerät bleiben) */
export async function pushAusschalten(kidId: string, rolle: PushRolle) {
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (sub) await supabase.from('push_abos').delete().eq('endpoint', sub.endpoint).eq('kind', kidId).eq('rolle', rolle)
  try { localStorage.removeItem(merkKey(kidId, rolle)) } catch { /* egal */ }
}

export async function einstellungenLaden(kidId: string): Promise<PushEinstellungen> {
  const { data } = await supabase.from('push_einstellungen').select('kind_an, erinnerung, serie_an, eltern_woche, eltern_pause').eq('kind', kidId).maybeSingle()
  return data ? { ...data, erinnerung: String(data.erinnerung).slice(0, 5) } : STANDARD
}
export async function einstellungenSpeichern(kidId: string, e: PushEinstellungen) {
  const { error } = await supabase.from('push_einstellungen').upsert({ kind: kidId, ...e, geaendert: new Date().toISOString() })
  return !error
}

/** Kurze, fröhliche Motivations-Melodie (Web Audio, ohne Datei) */
export function motivationsMelodie() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    if (ctx.state === 'suspended') void ctx.resume()
    const t0 = ctx.currentTime + 0.05
    // C-E-G-C aufwärts, dann ein heller Schluss-Akkord
    const noten: [number, number, number][] = [[523.25, 0, 0.14], [659.25, 0.12, 0.14], [783.99, 0.24, 0.14], [1046.5, 0.36, 0.5], [1318.5, 0.36, 0.5], [1568, 0.36, 0.5]]
    for (const [f, start, dauer] of noten) {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'triangle'; o.frequency.value = f
      g.gain.setValueAtTime(0.0001, t0 + start)
      g.gain.exponentialRampToValueAtTime(0.22, t0 + start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dauer)
      o.connect(g).connect(ctx.destination)
      o.start(t0 + start); o.stop(t0 + start + dauer + 0.05)
    }
    setTimeout(() => void ctx.close(), 1500)
    return ctx.state !== 'suspended'
  } catch { return false }
}

/** Beim Start: kam das Kind über eine Benachrichtigung? Dann Melodie (notfalls beim ersten Tippen) */
export function pushStart() {
  const spielen = () => {
    if (!motivationsMelodie()) window.addEventListener('pointerdown', () => motivationsMelodie(), { once: true })
  }
  const p = new URLSearchParams(location.search)
  if (p.has('push')) {
    spielen()
    p.delete('push')
    history.replaceState(null, '', location.pathname + (p.size ? `?${p}` : '') + location.hash)
  }
  navigator.serviceWorker?.addEventListener('message', (e) => { if (e.data?.typ === 'push-ton') spielen() })
}
