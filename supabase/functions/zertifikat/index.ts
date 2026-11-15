// Supabase Edge Function „zertifikat“: Das angemeldete Kind hat alle Welten geschafft –
// das Zertifikat (PDF) geht per E-Mail an die Eltern, die mit dem Kinderkonto verknüpft sind.
// Secret: RESEND_API_KEY (wie bei den anderen E-Mails).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
const APP = Deno.env.get('APP_URL') ?? 'https://brainfitkids.mentalmath.at'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '')
    const { data: { user } } = await admin.auth.getUser(token)
    if (!user) return antwort({ fehler: 'nicht angemeldet' }, 401)
    const { data: kind } = await admin.from('kinder').select('vorname, eltern').eq('id', user.id).maybeSingle()
    if (!kind) return antwort({ fehler: 'kein Kinderkonto' }, 403)
    if (!kind.eltern) return antwort({ status: 'keine-eltern' })
    const { data: e } = await admin.auth.admin.getUserById(kind.eltern)
    const mail = e?.user?.email
    if (!mail) return antwort({ status: 'keine-eltern' })

    const { pdf } = await req.json()
    if (typeof pdf !== 'string' || pdf.length < 1000 || pdf.length > 4_000_000 || !atob(pdf.slice(0, 8)).startsWith('%PDF')) return antwort({ fehler: 'ungültiges PDF' }, 400)

    const name = esc(kind.vorname)
    const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#231A4F;line-height:1.55">
      <p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="220" style="max-width:220px;height:auto"></p>
      <h1 style="color:#5B47D6;text-align:center;margin:0 0 12px">🎓 ${name} hat es geschafft!</h1>
      <p>Liebe Eltern,</p>
      <p><b>${name}</b> hat alle Welten der BrainFit Kids Grundstufe abgeschlossen – Plus und Minus mit Big Friends, Little Friends und Best Friends. Herzlichen Glückwunsch zu dieser tollen Leistung!</p>
      <div style="background:#FFF4CC;border-radius:16px;padding:14px 18px;margin:16px 0">
        Damit ist ${name} <b>berechtigt zur Mental-Arithmetik-Ausbildung für Fortgeschrittene</b> (Multiplikation und Division).
      </div>
      <p>Im Anhang finden Sie das <b>Zertifikat als PDF</b> – zum Ausdrucken, Aufhängen oder Teilen.</p>
      <p>Bei Fragen zur Fortgeschrittenen-Ausbildung antworten Sie einfach auf diese E-Mail.</p>
      <p>Herzliche Grüße<br><b>Ihr BrainFit Kids Team</b></p></div>`
    const s = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>', reply_to: 'info@mentalmath.at', to: [mail],
        subject: `🎓 Zertifikat für ${kind.vorname} – alle Welten geschafft!`, html,
        attachments: [{ filename: `Zertifikat-${kind.vorname}.pdf`, content: pdf }],
      }),
    })
    if (!s.ok) return antwort({ fehler: 'E-Mail konnte nicht gesendet werden' }, 502)
    return antwort({ status: 'gesendet' })
  } catch (e) {
    return antwort({ fehler: 'Fehler: ' + (e as Error).message }, 500)
  }
})
