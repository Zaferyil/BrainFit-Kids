// Supabase Edge Function „vorort-anmeldung“: Formulare für den Vor-Ort-Kurs in Linz (Website /vorort).
// Arten: voranmeldung (Interesse), schnupper (Schnupperstunde, bezahlt), anmeldung (Kursanmeldung mit monatlicher oder jährlicher Zahlung).
// Speichert die Angaben, schickt eine Bestätigung an die Eltern und eine Benachrichtigung an den Admin,
// und gibt bei Schnupperstunde/Anmeldung den Stripe-Zahlungslink zurück (monatlich = Stripe-Abo, wird automatisch abgebucht).
// Secrets: RESEND_API_KEY (vorhanden). Optional: ADMIN_MAIL (sonst info@mentalmath.at).
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const APP = Deno.env.get('APP_URL') ?? 'https://brainfitkids.mentalmath.at'
const ADMIN = Deno.env.get('ADMIN_MAIL') ?? 'info@mentalmath.at'
const esc = (t: unknown) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))
const txt = (v: unknown, max = 120) => String(v ?? '').trim().slice(0, max)
const STUFEN = ['Kindergarten', '1. Klasse', '2. Klasse', '3. Klasse', '4. Klasse', '5. Klasse', '6. Klasse']
const ART: Record<string, string> = { voranmeldung: 'Voranmeldung (Interesse)', schnupper: 'Schnupperstunde', anmeldung: 'Kursanmeldung' }
const gen = (n: string) => /[sßxz]$/i.test(n) ? n + '’' : n + 's'
const TAKT = '🗓️ <b>Kurs:</b> 1 × pro Woche, 90 Minuten · In den Schulferien (auch in den Sommerferien) findet kein Kurs statt.'
const euro = (n: number) => n.toLocaleString('de-AT', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'

type VorOrt = { monat: number; jahr: number; schnupper: number; linkMonat: string; linkJahr: string; linkSchnupper: string; adresse: string; zeiten: string; mindest: number }

async function mail(to: string, subject: string, html: string, replyTo = 'info@mentalmath.at') {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('MAIL_FROM') ?? 'BrainFit Kids <noreply@mentalmath.at>', reply_to: replyTo, to: [to], subject, html }),
  })
  return r.ok
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const b = await req.json()
    const art = txt(b.art, 20)
    if (!ART[art]) return antwort({ fehler: 'Bitte wählen Sie, wofür Sie sich anmelden möchten.' }, 400)
    const a = {
      art,
      eltern_vorname: txt(b.eltern_vorname), eltern_nachname: txt(b.eltern_nachname), mail: txt(b.mail).toLowerCase(), telefon: txt(b.telefon, 40),
      strasse: txt(b.strasse) || null, plz: txt(b.plz, 10) || null, ort: txt(b.ort, 60) || null,
      kind_vorname: txt(b.kind_vorname), kind_nachname: txt(b.kind_nachname) || null,
      kind_geburt: /^\d{4}-\d{2}-\d{2}$/.test(txt(b.kind_geburt, 10)) ? txt(b.kind_geburt, 10) : null,
      kind_stufe: Number.isInteger(b.kind_stufe) && b.kind_stufe >= 0 && b.kind_stufe <= 6 ? b.kind_stufe : null,
      wunschzeiten: txt(b.wunschzeiten, 300) || null, nachricht: txt(b.nachricht, 1000) || null,
      takt: art === 'anmeldung' ? (b.takt === 'jahr' ? 'jahr' : 'monat') : null,
      wo: art === 'schnupper' ? (b.wo === 'online' ? 'online' : 'vorort') : null,
    }
    if (!a.eltern_vorname || !a.eltern_nachname) return antwort({ fehler: 'Bitte Vor- und Nachnamen eingeben.' }, 400)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.mail)) return antwort({ fehler: 'Bitte eine gültige E-Mail-Adresse eingeben.' }, 400)
    if (!a.telefon) return antwort({ fehler: 'Bitte eine Telefonnummer eingeben.' }, 400)
    if (!a.kind_vorname) return antwort({ fehler: 'Bitte den Vornamen Ihres Kindes eingeben.' }, 400)
    if (art === 'anmeldung' && (!a.kind_nachname || !a.kind_geburt || !a.strasse || !a.plz || !a.ort)) return antwort({ fehler: 'Bitte alle Pflichtfelder für die Anmeldung ausfüllen.' }, 400)
    if (art === 'anmeldung' && !b.agb) return antwort({ fehler: 'Bitte den AGB zustimmen.' }, 400)
    if (!b.zustimmung) return antwort({ fehler: 'Bitte der Datenverarbeitung zustimmen.' }, 400)

    // Preise und Stripe-Links aus den Website-Einstellungen (Admin → Website)
    const { data: w } = await db.from('website').select('daten').eq('id', 1).maybeSingle()
    const v = { monat: 249, jahr: 0, schnupper: 49, linkMonat: '', linkJahr: '', linkSchnupper: '', adresse: 'Linz', zeiten: '', mindest: 12, ...((w?.daten as { vorort?: Partial<VorOrt> } | null)?.vorort ?? {}) } as VorOrt
    if (a.takt === 'jahr' && !(v.jahr > 0)) a.takt = 'monat'
    const betrag = art === 'schnupper' ? v.schnupper : art === 'anmeldung' ? (a.takt === 'jahr' ? v.jahr : v.monat) : null

    const { data: neu, error } = await db.from('vorort_anmeldungen').insert({ ...a, betrag }).select('id').single()
    if (error || !neu) return antwort({ fehler: 'Die Anmeldung hat nicht geklappt. Bitte später erneut versuchen.' }, 500)

    // Zahlungslink (Stripe Payment Link) mit E-Mail und Bezug zur Anmeldung
    const roh = art === 'schnupper' ? v.linkSchnupper : art === 'anmeldung' ? (a.takt === 'jahr' ? v.linkJahr : v.linkMonat) : ''
    const zahlung = /^https:\/\/buy\.stripe\.com\//.test(roh) ? `${roh}${roh.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(a.mail)}&client_reference_id=vorort-${art}-${neu.id}` : null

    const stufe = a.kind_stufe !== null ? STUFEN[a.kind_stufe] : '–'
    const geburt = a.kind_geburt ? new Date(a.kind_geburt).toLocaleDateString('de-AT') : '–'
    const preisText = art === 'schnupper' ? (v.schnupper > 0 ? `${euro(v.schnupper)} (einmalig)` : '') : art === 'anmeldung' ? (a.takt === 'jahr' ? `${euro(v.jahr)} pro Jahr` : `${euro(v.monat)} pro Monat${v.mindest > 0 ? ` · Mindestlaufzeit ${v.mindest} Monate` : ''} · wird monatlich automatisch abgebucht`) : ''
    const knopf = (href: string, text: string) => `<a href="${href}" style="background:#5B47D6;color:#fff;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:30px;display:inline-block">${text}</a>`
    const kopf = `<p style="text-align:center;margin:0 0 8px"><img src="${APP}/logo.png" alt="BrainFit Kids" width="200" style="max-width:200px;height:auto"></p>`
    const kind = esc(a.kind_vorname)
    const kindVoll = esc(a.kind_vorname + (a.kind_nachname ? ' ' + a.kind_nachname : ''))
    const titel = art === 'voranmeldung' ? 'Herzlich willkommen bei BrainFit Kids! 💜' : art === 'schnupper' ? `Bald geht’s los, ${kind}! 🎉` : 'Willkommen in der BrainFit Kids Familie! 🎓'
    const schritte = (z: string[]) => `<p style="margin:18px 0 6px"><b>So geht es weiter:</b></p><div style="background:#F3F0FF;border-radius:16px;padding:12px 18px">${z.map((x) => `<p style="margin:6px 0">${x}</p>`).join('')}</div>`
    const angabenZeilen: [string, string][] = [['Eltern', `${a.eltern_vorname} ${a.eltern_nachname}`],
      ...(a.strasse ? [['Adresse', `${a.strasse}, ${a.plz} ${a.ort}`] as [string, string]] : []),
      ['E-Mail', a.mail], ['Telefon', a.telefon],
      ['Kind', `${a.kind_vorname}${a.kind_nachname ? ' ' + a.kind_nachname : ''}`], ['Geburtsdatum', geburt], ['Schulstufe', stufe],
      ...(a.wo ? [['Schnupperstunde', a.wo === 'online' ? 'Online' : `Vor Ort in ${v.adresse || 'Linz'}`] as [string, string]] : []),
      ...(a.wunschzeiten ? [['Wunschzeiten', a.wunschzeiten] as [string, string]] : []), ...(a.nachricht ? [['Nachricht', a.nachricht] as [string, string]] : []),
      ...(preisText && art === 'schnupper' ? [['Preis', preisText] as [string, string]] : [])]
    const angaben = `<p style="margin:22px 0 6px"><b>Ihre Angaben</b></p><table style="border-collapse:collapse;width:100%;font-size:14px">${angabenZeilen.map(([k, x]) => `<tr><td style="padding:5px 12px 5px 0;color:#6B648F;vertical-align:top;border-bottom:1px solid #EEEAF8;white-space:nowrap">${esc(k)}</td><td style="padding:5px 0;border-bottom:1px solid #EEEAF8">${esc(x)}</td></tr>`).join('')}</table>`
    const ort = esc(v.adresse || 'Linz')
    const text = art === 'voranmeldung'
      ? `<p>wie schön, dass Sie sich für unseren Vor-Ort-Kurs in Linz interessieren! Mit Ihrer Voranmeldung haben Sie den ersten Schritt gemacht – und der ist oft der wichtigste.</p>
         <p>Mit dem Abakus lernt <b>${kind}</b>, Zahlen im Kopf zu „sehen“. Das stärkt nicht nur das Rechnen, sondern auch <b>Konzentration, Gedächtnis und Selbstvertrauen</b>. Viele Kinder erleben bei uns zum ersten Mal: <i>„Mathe kann ich – und es macht sogar Spaß!“</i></p>
         ${schritte(['✅ Wir haben Ihre Voranmeldung erhalten.', '📞 Sobald ein Kurstermin feststeht, melden wir uns persönlich bei Ihnen.', `🧮 Tipp: Mit einer <b>Schnupperstunde</b> kann ${kind} den Abakus schon vorher kennenlernen.`])}
         <p style="text-align:center;margin:20px 0">${knopf(`${APP}/vorort?art=schnupper`, '🧮 Schnupperstunde buchen')}</p>
         <p>📍 <b>Kursort:</b> ${ort}${v.zeiten ? `<br>🕒 <b>Kurszeiten:</b> ${esc(v.zeiten)}` : ''}<br>${TAKT}</p>
         <p>Wir freuen uns darauf, ${kind} kennenzulernen!</p>`
      : art === 'schnupper'
        ? `<p>vielen Dank für Ihre Anmeldung zur <b>Schnupperstunde</b> (${a.wo === 'online' ? 'online' : 'vor Ort in ' + ort})!</p>
           <p>In dieser Stunde lernt ${kind} den Abakus spielerisch kennen und löst schon die ersten Aufgaben – Sie werden staunen, wie schnell Kinder dabei Erfolgserlebnisse haben. Genau diese kleinen Erfolge machen Kinder stark und neugierig auf mehr.</p>
           ${schritte([...(zahlung ? [`💳 Falls noch nicht erledigt: Schnupperstunde bezahlen (${euro(v.schnupper)}) – Knopf unten.`] : []), `📅 Wir melden uns in Kürze mit dem genauen Termin${a.wo === 'online' ? ' und dem Link zum Videoanruf' : ''}.`, '😊 Ihr Kind braucht nichts mitzubringen – nur gute Laune!'])}
           ${zahlung ? `<p style="text-align:center;margin:20px 0">${knopf(zahlung, '💳 Schnupperstunde bezahlen')}</p>` : ''}
           <p style="color:#6B648F;font-size:14px">🗓️ Gut zu wissen: Der Vor-Ort-Kurs findet 1 × pro Woche für 90 Minuten statt – in den Schulferien (auch in den Sommerferien) ist kein Kurs.</p>
           ${angaben}
           <p style="margin-top:20px">Bis bald!</p>`
        : `<p>herzlichen Glückwunsch – <b>${kindVoll}</b> ist jetzt für den Vor-Ort-Kurs in ${ort} angemeldet! Sie haben eine tolle Entscheidung für die Zukunft Ihres Kindes getroffen.</p>
           <p>In den kommenden Monaten lernt ${kind} Schritt für Schritt, auch große Aufgaben blitzschnell im Kopf zu rechnen. Dabei wachsen <b>Konzentration, Gedächtnis und Selbstvertrauen</b> mit – Fähigkeiten, die ${kind} in der Schule und im Leben weiterbringen. Wir begleiten ${kind} mit viel Freude auf diesem Weg.</p>
           ${schritte([...(zahlung ? ['💳 Falls noch nicht erledigt: Zahlung abschließen – Knopf unten.'] : ['💳 Die Zahlungsinformationen schicken wir Ihnen in Kürze.']), '📅 Wir melden uns mit dem Kursbeginn, der Gruppe und allen Details.', `📚 Zum Kursstart bekommt ${kind} alles, was dafür nötig ist.`])}
           ${zahlung ? `<p style="text-align:center;margin:20px 0">${knopf(zahlung, '💳 Zahlung abschließen')}</p>` : ''}
           <p><b>Zahlungsweise:</b> ${esc(preisText)}</p>
           <p>📍 <b>Kursort:</b> ${ort}${v.zeiten ? `<br>🕒 <b>Kurszeiten:</b> ${esc(v.zeiten)}` : ''}<br>${TAKT}</p>
           ${angaben}
           <p style="margin-top:20px">Wir freuen uns sehr auf ${kind}!</p>`
    const elternHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#231A4F;line-height:1.55">${kopf}
      <h1 style="color:#5B47D6;text-align:center;margin:0 0 16px;font-size:24px">${titel}</h1>
      <p>Hallo ${esc(a.eltern_vorname)},</p>${text}
      <p>Herzliche Grüße<br><b>Ihr BrainFit Kids Team</b></p>
      <p style="color:#8A84A8;font-size:12px;margin-top:24px">Fragen? Antworten Sie einfach auf diese E-Mail.</p></div>`
    const zeilen: [string, string][] = [['Art', ART[art]], ...angabenZeilen, ...(preisText && art === 'anmeldung' ? [['Zahlung', preisText] as [string, string]] : [])]
    const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;color:#231A4F;line-height:1.5"><h2 style="color:#5B47D6">📝 Neue ${esc(ART[art])} – Vor-Ort-Kurs Linz</h2>
      <table style="border-collapse:collapse">${zeilen.map(([k, x]) => `<tr><td style="padding:4px 12px 4px 0;color:#6B648F;vertical-align:top">${esc(k)}</td><td style="padding:4px 0"><b>${esc(x)}</b></td></tr>`).join('')}</table>
      <p style="color:#6B648F;font-size:13px">${zahlung ? 'Die Eltern wurden zur Stripe-Zahlung weitergeleitet – den Zahlungsstatus sehen Sie in Stripe (Referenz: vorort-' + esc(art) + '-' + esc(neu.id) + ').' : art === 'voranmeldung' ? 'Keine Zahlung (Voranmeldung).' : 'Achtung: Kein Stripe-Link hinterlegt (Admin → Website → Vor-Ort-Kurs).'}</p>
      <p><a href="${APP}/app/#admin">Zum Admin-Bereich → Vor-Ort</a></p></div>`

    const [ok] = await Promise.all([
      mail(a.mail, art === 'voranmeldung' ? `💜 Schön, dass Sie dabei sind – ${gen(a.kind_vorname)} Weg zum Rechen-Profi beginnt!` : art === 'schnupper' ? `🎉 ${gen(a.kind_vorname)} Schnupperstunde ist gebucht – wir freuen uns!` : `🎓 Willkommen im Vor-Ort-Kurs – ${a.kind_vorname} ist dabei!`, elternHtml),
      mail(ADMIN, `Neue ${ART[art]}: ${a.kind_vorname} (${a.eltern_vorname} ${a.eltern_nachname})`, adminHtml, a.mail),
    ])
    if (ok) await db.from('vorort_anmeldungen').update({ mail_gesendet: new Date().toISOString() }).eq('id', neu.id)
    return antwort({ ok: true, zahlung, mail: ok })
  } catch (e) {
    return antwort({ fehler: 'Fehler: ' + (e as Error).message }, 500)
  }
})
