// Supabase Edge Function „kind-anlegen“: Admin oder Lehrkraft legt ein Kind an.
// Läuft auf dem Supabase-Server; SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY stellt Supabase selbst bereit.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const WOERTER = ['stern', 'sonne', 'mond', 'blitz', 'perle', 'krone', 'tiger', 'adler', 'welle', 'rakete']
const passwort = () => WOERTER[Math.floor(Math.random() * WOERTER.length)] + (10 + Math.floor(Math.random() * 90))
const basis = (n: string) => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '') || 'kind'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // Wer ruft auf? Nur Admin oder Lehrkraft
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return antwort({ fehler: 'nicht angemeldet' }, 401)
  const { data: ich } = await admin.from('personen').select('rolle').eq('id', user.id).single()
  if (!ich || !['admin', 'lehrkraft'].includes(ich.rolle)) return antwort({ fehler: 'keine Berechtigung' }, 403)

  const { vorname, stufe = null, klasse = null } = await req.json()
  if (!vorname || String(vorname).trim().length < 1) return antwort({ fehler: 'Vorname fehlt' }, 400)
  const ergebnis = await kindAnlegen(admin, String(vorname).trim(), stufe, klasse, null, null)
  return antwort(ergebnis)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function kindAnlegen(admin: any, vorname: string, stufe: number | null, klasse: string | null, eltern: string | null, paket: string | null) {
  // freier Benutzername: lena, lena2, lena3 …
  const b0 = basis(vorname)
  const { data: belegt } = await admin.from('kinder').select('benutzer').like('benutzer', `${b0}%`)
  const vorhanden = new Set((belegt ?? []).map((x: { benutzer: string }) => x.benutzer))
  let benutzer = b0, i = 2
  while (vorhanden.has(benutzer)) benutzer = `${b0}${i++}`
  const pw = passwort()

  const { data: neu, error } = await admin.auth.admin.createUser({ email: `${benutzer}@kinder.brainfit-kids.at`, password: pw, email_confirm: true })
  if (error) throw error
  const id = neu.user.id
  await admin.from('personen').insert({ id, rolle: 'kind', name: vorname })
  await admin.from('kinder').insert({ id, benutzer, vorname, stufe, klasse, eltern, paket })
  await admin.from('konten').insert({ kind: id })
  const { data: start } = await admin.from('shop_artikel').select('id').eq('start', true)
  if (start?.length) await admin.from('besitz').insert(start.map((a: { id: string }) => ({ kind: id, artikel: a.id })))
  return { id, benutzer, passwort: pw }
}
