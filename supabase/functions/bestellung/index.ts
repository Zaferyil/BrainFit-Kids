// Supabase Edge Function „bestellung“: nach der Rückkehr von Stripe.
// Fragt Stripe, ob die Checkout-Session wirklich bezahlt ist, und legt erst dann das Kind an (genau einmal je Session).
// Benötigte Secrets (Supabase → Edge Functions → Secrets): STRIPE_SECRET_KEY (eingeschränkter Schlüssel, Lesen von Checkout Sessions).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const WOERTER = ['stern', 'sonne', 'mond', 'blitz', 'perle', 'krone', 'tiger', 'adler', 'welle', 'rakete']
const passwort = () => WOERTER[Math.floor(Math.random() * WOERTER.length)] + (10 + Math.floor(Math.random() * 90))
const basis = (n: string) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '') || 'kind'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const { session_id, vorname, stufe = null } = await req.json()
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(session_id ?? '')) return antwort({ fehler: 'ungültige Zahlung' }, 400)
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    // schon verarbeitet? Dann dieselben Zugangsdaten zurückgeben
    const { data: alt } = await admin.from('bestellungen').select('kind_benutzer, passwort_start').eq('stripe_session', session_id).maybeSingle()
    if (alt) return antwort({ benutzer: alt.kind_benutzer, passwort: alt.passwort_start, schon: true })

    // bei Stripe nachfragen
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, { headers: { Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}` } })
    if (!r.ok) return antwort({ fehler: 'Zahlung nicht gefunden' }, 400)
    const s = await r.json()
    if (s.status !== 'complete' || !['paid', 'no_payment_required'].includes(s.payment_status)) return antwort({ fehler: 'Zahlung nicht abgeschlossen' }, 402)

    const [paketName, takt] = String(s.client_reference_id ?? 'Basic-monat').split('-')
    const paket = paketName.toLowerCase()
    const mail = s.customer_details?.email ?? s.customer_email ?? ''
    const name = String(vorname ?? '').trim() || 'Kind'

    // freier Benutzername
    const b0 = basis(name)
    const { data: belegt } = await admin.from('kinder').select('benutzer').like('benutzer', `${b0}%`)
    const vorhanden = new Set((belegt ?? []).map((x: { benutzer: string }) => x.benutzer))
    let benutzer = b0, i = 2
    while (vorhanden.has(benutzer)) benutzer = `${b0}${i++}`
    const pw = passwort()

    // zuerst die Bestellung vormerken (Primärschlüssel = Session): verhindert doppeltes Anlegen bei zwei gleichzeitigen Aufrufen
    const { error: dop } = await admin.from('bestellungen').insert({ stripe_session: session_id, eltern_mail: mail, paket, takt: takt === 'jahr' ? 'jahr' : 'monat',
      kind_vorname: name, kind_stufe: stufe, kind_benutzer: benutzer, passwort_start: pw })
    if (dop) {
      const { data: x } = await admin.from('bestellungen').select('kind_benutzer, passwort_start').eq('stripe_session', session_id).single()
      return antwort({ benutzer: x?.kind_benutzer, passwort: x?.passwort_start, schon: true })
    }

    const { data: neu, error } = await admin.auth.admin.createUser({ email: `${benutzer}@kinder.brainfit-kids.at`, password: pw, email_confirm: true })
    if (error) throw error
    const id = neu.user.id
    await admin.from('personen').insert({ id, rolle: 'kind', name })
    await admin.from('kinder').insert({ id, benutzer, vorname: name, stufe, paket: ['basic', 'plus', 'premium'].includes(paket) ? paket : null })
    await admin.from('konten').insert({ kind: id })
    const { data: start } = await admin.from('shop_artikel').select('id').eq('start', true)
    if (start?.length) await admin.from('besitz').insert(start.map((a: { id: string }) => ({ kind: id, artikel: a.id })))
    await admin.from('bestellungen').update({ kind: id }).eq('stripe_session', session_id)

    return antwort({ benutzer, passwort: pw })
  } catch (e) {
    return antwort({ fehler: String((e as Error).message ?? e) }, 500)
  }
})
