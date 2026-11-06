// Supabase Edge Function „lehrkraft“: nur Admins.
// • { aktion: 'liste' }                                   → alle Lehrkräfte mit E-Mail und Klassen
// • { aktion: 'anlegen', mail, name, klassen: string[] }  → Lehrkraft-Konto mit Startpasswort, Klassen zugeteilt
// • { aktion: 'klassen', id, klassen: string[] }          → Klassen der Lehrkraft neu setzen
// • { aktion: 'passwort-neu', id }                        → neues Startpasswort
// SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY stellt Supabase selbst bereit.
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const WOERTER = ['stern', 'sonne', 'mond', 'blitz', 'perle', 'krone', 'tiger', 'adler', 'welle', 'rakete']
const passwort = () => WOERTER[Math.floor(Math.random() * WOERTER.length)] + '-' + WOERTER[Math.floor(Math.random() * WOERTER.length)] + (100 + Math.floor(Math.random() * 900))

// deno-lint-ignore no-explicit-any
const db: any = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

async function nutzerMitMail(mail: string) {
  for (let seite = 1; seite <= 20; seite++) {
    const { data: l } = await db.auth.admin.listUsers({ page: seite, perPage: 200 })
    const u = l?.users.find((x: { email?: string }) => x.email?.toLowerCase() === mail)
    if (u) return u.id as string
    if (!l || l.users.length < 200) break
  }
  return null
}

async function klassenSetzen(id: string, klassen: string[]) {
  const codes = [...new Set(klassen.map((k) => String(k).trim().toUpperCase()).filter((k) => k && k !== 'ONLINE'))]
  await db.from('klassen').update({ lehrkraft: null }).eq('lehrkraft', id)
  for (const code of codes) await db.from('klassen').upsert({ code, lehrkraft: id }, { onConflict: 'code' })
  return codes
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const { data: { user } } = await db.auth.getUser(token)
    if (!user) return antwort({ fehler: 'Bitte anmelden.' }, 401)
    const { data: ich } = await db.from('personen').select('rolle').eq('id', user.id).maybeSingle()
    if (ich?.rolle !== 'admin') return antwort({ fehler: 'Nur für Admins' }, 403)
    const b = await req.json()

    if (b.aktion === 'liste') {
      const { data: leute } = await db.from('personen').select('id, name').eq('rolle', 'lehrkraft').order('erstellt')
      const { data: kl } = await db.from('klassen').select('code, lehrkraft')
      const out = []
      for (const p of leute ?? []) {
        const { data: u } = await db.auth.admin.getUserById(p.id)
        out.push({ id: p.id, name: p.name, mail: u?.user?.email ?? '', klassen: (kl ?? []).filter((k: { lehrkraft: string }) => k.lehrkraft === p.id).map((k: { code: string }) => k.code) })
      }
      return antwort({ lehrkraefte: out })
    }
    if (b.aktion === 'anlegen') {
      const mail = String(b.mail ?? '').trim().toLowerCase()
      const name = String(b.name ?? '').trim()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return antwort({ fehler: 'Bitte eine gültige E-Mail eingeben.' }, 400)
      if (!name) return antwort({ fehler: 'Bitte einen Namen eingeben.' }, 400)
      const pw = passwort()
      let id = await nutzerMitMail(mail)
      if (id) {
        const { data: r } = await db.from('personen').select('rolle').eq('id', id).maybeSingle()
        if (r && r.rolle !== 'eltern') return antwort({ fehler: `Diese E-Mail gehört schon zu einem Konto (${r.rolle}).` }, 400)
        await db.auth.admin.updateUserById(id, { password: pw })
        await db.from('personen').upsert({ id, rolle: 'lehrkraft', name })
      } else {
        const { data: neu, error } = await db.auth.admin.createUser({ email: mail, password: pw, email_confirm: true })
        if (error) throw error
        id = neu.user.id as string
        await db.from('personen').insert({ id, rolle: 'lehrkraft', name })
      }
      const klassen = await klassenSetzen(id!, b.klassen ?? [])
      return antwort({ id, mail, passwort: pw, klassen })
    }
    if (b.aktion === 'klassen') return antwort({ klassen: await klassenSetzen(String(b.id), b.klassen ?? []) })
    if (b.aktion === 'passwort-neu') {
      const pw = passwort()
      const { error } = await db.auth.admin.updateUserById(String(b.id), { password: pw })
      if (error) throw error
      return antwort({ passwort: pw })
    }
    return antwort({ fehler: 'Unbekannte Aktion' }, 400)
  } catch (e) {
    return antwort({ fehler: String((e as Error).message ?? e) }, 500)
  }
})
