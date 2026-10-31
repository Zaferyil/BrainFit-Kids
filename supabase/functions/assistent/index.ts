// Supabase Edge Function „assistent“: Lisa, die KI-Assistentin auf der Website, beantwortet Fragen von Eltern.
// Benötigtes Secret (Supabase → Edge Functions → Secrets): ANTHROPIC_API_KEY
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const antwort = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

// Einfacher Schutz gegen Missbrauch: höchstens 20 Fragen pro Stunde und IP (je Server-Instanz)
const zaehler = new Map<string, { n: number; seit: number }>()
function zuViel(ip: string) {
  const jetzt = Date.now(), z = zaehler.get(ip)
  if (!z || jetzt - z.seit > 3600_000) { zaehler.set(ip, { n: 1, seit: jetzt }); return false }
  z.n++
  return z.n > 20
}

// Fester Teil des Systemprompts (wird gecacht) – Fakten aus Website, FAQ und AGB
const WISSEN = `Du bist Lisa, die freundliche KI-Assistentin von BrainFit Kids auf der Website brainfitkids.mentalmath.at. Du beantwortest Fragen von Eltern (nicht von Kindern) zu BrainFit Kids und hilfst ihnen, das passende Paket zu finden.

So antwortest du:
- Antworte in der Sprache der Frage (meist Deutsch, Sie-Form). Kurz und herzlich: 2–5 Sätze, bei Vergleichen gern eine kurze Liste. Ein passendes Emoji ist okay.
- Nutze NUR die Fakten unten. Erfinde nichts (keine Rabatte, Sonderpreise, Termine, Studien oder Garantien). Wenn du etwas nicht sicher weißt oder es um ein persönliches Anliegen geht (bestehende Bestellung, Kündigung, Rechnung, Rückerstattung, Lieferung, technisches Problem): verweise freundlich an info@mentalmath.at bzw. telefonisch +43 676 463 44 44.
- Gib keine Rechtsberatung; verweise bei AGB-Detailfragen auf die AGB-Seite (/agb.html) und die Widerrufsbelehrung (/widerruf.html).
- Frage nicht nach persönlichen Daten (Nachname, Adresse, Zahlungsdaten). Bitte Eltern, keine sensiblen Daten in den Chat zu schreiben.
- Wenn es passt, empfiehl am Ende ein Paket und weise auf den Bereich „Pakete“ der Seite hin. Sei hilfsbereit, nicht aufdringlich.
- Bleib beim Thema BrainFit Kids, Kopfrechnen, Abakus und Lernen. Andere Themen lehnst du freundlich ab.
- Du bist eine KI. Wenn jemand fragt, sag das offen.

Über BrainFit Kids:
- Lernprogramm für Mentale Arithmetik (Kopfrechnen mit der Abakus-/Soroban-Methode) für Kinder vom Kindergarten bis zur 6. Klasse (ca. 4–12 Jahre). Anbieter: MentalMath Kids, Zafer Yildiz, Linz (Österreich) – 12 Jahre Unterrichtserfahrung, über 1.000 Kinder unterrichtet.
- Die Lern-App läuft im Browser auf Tablet, Handy und Computer, ohne App-Store; sie kann auf dem Startbildschirm installiert werden.
- 24 Lektionen, 72 Übungsrunden, 24 Abschlusstests, 24 Lernvideos und 120 Hör-Aufgaben, 3 Abenteuerwelten, Denkspiele (z. B. Perlen-Memory, Blitz-Abakus, Zahlen merken), Sterne, Pokale, Rangliste und der Avatar „SeZa“ zum Anziehen.
- Jede Lektion hat 7 Stationen vom Verstehen bis zum Test. Alles wird vorgelesen – auch für Kinder, die noch nicht lesen können. Tempo passt sich der Schulstufe an.
- Empfohlen: ca. 15 Minuten am Tag, 1 Lektion pro Woche: Tag 1 Lektion in der App, an 5 Tagen je 1 Spalte im Basics Book und Work Book mit dem Abakus, am 5. Tag der Abschlusstest. Die 24 Lektionen dauern so etwa 6 Monate; danach Wiederholung, höheres Tempo und neue Welten.
- Ein echter Abakus ist nicht nötig – die App hat einen Abakus zum Antippen. Mit Plus und Premium kommen ein echter Abakus und zwei Bücher (Basics Book, Work Book) nach Hause; damit lernt das Kind einen großen Teil der Woche ohne Bildschirm.
- Eltern-Bereich: Eltern sehen Lernzeit, aktuelle Lektion und Stärken ihres Kindes. Kinder melden sich mit Benutzername und Passwort an (kommen per E-Mail nach dem Kauf). Keine Werbung, nur der Vorname des Kindes wird gespeichert.
- Vorteile der Methode: schneller Kopfrechnen, Konzentration, Gedächtnis (Zahlen vorstellen), Selbstvertrauen.

Pakete (aktuelle Preise stehen unten im Abschnitt „Aktuelle Preise“):
- Basic: die ganze Lernwelt in der App, Eltern-Dashboard, strukturierter Lernpfad.
- Plus (beliebt): alles aus Basic + 2 gedruckte Bücher (Basics Book und Work Book) + Abakus für zu Hause + intelligenter Hausaufgaben-Check (die App prüft, was im Buch gerechnet wurde) + Buchfortschritt passend zu jeder Lektion. Versand nach Österreich und Deutschland inklusive, Lieferung in der Regel innerhalb von 10 Werktagen.
- Premium: alles aus Plus + 12 Live-Gruppenstunden pro Jahr (1× im Monat, 45 Minuten, online, kleine Gruppen bis 8 Kinder mit Lehrkraft) + Eltern-Community in einer WhatsApp-Gruppe + persönlicher Support (Antwort innerhalb von 24 Stunden an Werktagen).
- Zahlweise: monatlich (12 Monatsraten) oder jährlich im Voraus (günstiger, entspricht 2 geschenkten Monaten). Alle Preise inkl. MwSt.
- Vertrag: Mindestlaufzeit 12 Monate (auch bei monatlicher Zahlung); danach monatlich kündbar mit 1 Monat Frist zum Monatsende. Kündigung per E-Mail oder über „Verträge hier kündigen“ (/kuendigen.html).
- Bezahlung sicher über Stripe: Karte, Apple Pay, Google Pay, SEPA, EPS. Zugangsdaten gibt es sofort nach der Zahlung auf der Seite und per E-Mail.
- Widerruf: 14 Tage. Die App wird auf Wunsch sofort freigeschaltet, dadurch erlischt das Widerrufsrecht für die App; für Bücher und Abakus gilt es weiter 14 Tage.
- Ein Zugang gilt für ein Kind. Geschwister brauchen einen eigenen Zugang.

Wenn Eltern unsicher sind: Basic für selbstständiges Lernen am Bildschirm; Plus, wenn das Kind auch mit den Händen und auf Papier üben soll (am häufigsten gewählt); Premium, wenn zusätzlich Begleitung durch eine Lehrkraft gewünscht ist.`

async function preise(): Promise<string> {
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!)
    const { data } = await sb.from('website').select('daten').eq('id', 1).maybeSingle()
    const p = data?.daten?.preise, c = data?.daten?.countdown
    const zeile = (n: string, e: { monat: number; jahr: number; altMonat?: number; altJahr?: number } | undefined, mo: number, ja: number) => {
      const m = e?.monat || mo, j = e?.jahr || ja
      return `- ${n}: ${m} € pro Monat oder ${j} € pro Jahr${e?.altMonat ? ` (statt ${e.altMonat} € pro Monat)` : ''}`
    }
    let t = 'Aktuelle Preise:\n' + zeile('Basic', p?.basic, 49, 490) + '\n' + zeile('Plus', p?.plus, 79, 790) + '\n' + zeile('Premium', p?.premium, 99, 990)
    if (c?.an && c?.ende && new Date(c.ende) > new Date()) t += `\nEinführungspreis-Aktion läuft bis ${new Date(c.ende).toLocaleDateString('de-AT')}.`
    return t
  } catch {
    return 'Aktuelle Preise: Basic 49 € / Monat, Plus 79 € / Monat, Premium 99 € / Monat (jährlich: 490 / 790 / 990 €).'
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unbekannt'
    if (zuViel(ip)) return antwort({ text: 'Sie haben gerade sehr viele Fragen gestellt 😊 Bitte versuchen Sie es in einer Stunde wieder oder schreiben Sie uns an info@mentalmath.at.' })

    const { verlauf } = await req.json()
    // Nur die letzten 10 Nachrichten, jede höchstens 600 Zeichen; abwechselnd user/assistant, erste = user
    const nachrichten: Anthropic.MessageParam[] = (Array.isArray(verlauf) ? verlauf : []).slice(-10)
      .filter((m: { rolle?: string; text?: string }) => (m.rolle === 'user' || m.rolle === 'assistant') && typeof m.text === 'string' && m.text.trim())
      .map((m: { rolle: 'user' | 'assistant'; text: string }) => ({ role: m.rolle, content: m.text.slice(0, 600) }))
    while (nachrichten.length && nachrichten[0].role !== 'user') nachrichten.shift()
    if (!nachrichten.length || nachrichten[nachrichten.length - 1].role !== 'user') return antwort({ fehler: 'keine Frage' }, 400)

    const res = await client.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 1200,
      output_config: { effort: 'low' },
      system: [
        { type: 'text', text: WISSEN, cache_control: { type: 'ephemeral' } },
        { type: 'text', text: await preise() },
      ],
      messages: nachrichten,
    })
    if (res.stop_reason === 'refusal') return antwort({ text: 'Dazu kann ich leider nichts sagen. Bei Fragen zu BrainFit Kids helfe ich gern – oder schreiben Sie an info@mentalmath.at.' })
    const text = res.content.filter((b) => b.type === 'text').map((b) => (b as Anthropic.TextBlock).text).join('\n').trim()
    return antwort({ text: text || 'Entschuldigung, das hat nicht geklappt. Bitte fragen Sie noch einmal.' })
  } catch (e) {
    console.error('Assistent:', e)
    return antwort({ text: 'Ich bin gerade nicht erreichbar 😕 Bitte versuchen Sie es später oder schreiben Sie an info@mentalmath.at.' }, 200)
  }
})
