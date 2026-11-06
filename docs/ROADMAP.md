# BrainFit Kids – Roadmap (Mentale Arithmetik)

Status-Legende: [ ] offen · [~] in Arbeit · [x] fertig
Regel: Immer die erste offene Aufgabe von oben nehmen. Nach jeder fertigen Aufgabe hier abhaken und committen.

## 1. Kern der Mentalen Arithmetik (höchste Priorität)
- [x] 1.1 Abakus ausblenden – Übergang vom echten zum Kopf-Abakus (voll → blass → nur Rahmen → kein Abakus), automatisch nach Stufe (Station „Kopfrechnen“, src/lib/kopfAbakus.ts: 2× fehlerfrei → weiter, 3+ Fehler → zurück)
- [x] 1.2 Flash-Anzan-Modus – Zahlen blitzen nacheinander auf, Kind nennt die Summe; Tempo (1,5 s → 0,3 s) und Stellenzahl einstellbar (Seite „Anzan“: 96 Level + 5 Tempi, schnelleres Tempo öffnet sich bei 5/5)
- [x] 1.3 Gürtel-Prüfung + Urkunde – offizielle Prüfung mit Zeitlimit pro Gürtel, bei Bestehen PDF-Urkunde zum Teilen (#/pruefung/<welt> über Pokale → Gürtel; 10 Aufgaben, 4 min, 8 richtig; Urkunde als PNG – PDF-Variante noch offen)
- [x] 1.4 Hör-Rechnen – Zahlen werden vorgelesen (Lisa-Stimme), Kind rechnet nur nach Gehör (Anzan-Seite: Modus Sehen/Hören; zusätzlich Lektions-Station „Hör-Rechnen“)
- [ ] 1.5 Formel-Training – gezielte Mini-Übungen für Kleine Freunde (5er) und Große Freunde (10er), z. B. „+4 = +5 −1"

## 2. Nachhaltiges Lernen
- [x] 2.1 Fehleranalyse + verteilte Wiederholung – Regeln, bei denen das Kind oft Fehler macht, nach einigen Tagen erneut üben (src/lib/lernspur.ts, #/wiederholen, Abstände 1/3/7/14 Tage, Knopf auf der Startseite)
- [x] 2.2 Tempo- und Genauigkeitskurve im Bericht (z. B. Ø 4,2 s → 2,1 s pro Aufgabe) (Bericht-Karte „Tempo & Genauigkeit“ + „Noch üben“)
- [ ] 2.3 Tägliches 5-Minuten-Training (Aufwärmen + Neues + Wiederholung)

## 3. Motivation
- [ ] 3.1 Wöchentliches Klassen-Turnier / Duell (gleiche Flash-Anzan-Aufgabe gleichzeitig)
- [ ] 3.2 Serien-Belohnungen (7 Tage am Stück → Perlen-Bonus + SeZa-Kostüm)

## 4. Eltern und Lehrkräfte
- [ ] 4.1 Wöchentliche Eltern-Zusammenfassung per E-Mail (Resend)
- [~] 4.2 (vorerst ausgeschaltet: HAUSAUFGABEN_AKTIV in src/lib/auftraege.ts) Lehrkräfte vergeben Hausaufgaben an die Klasse (Admin → „Aufträge & Blätter“; Kind: #/auftraege + Knopf auf der Startseite; SQL: supabase/update-16-auftraege.sql einspielen!)
- [x] 4.3 Druckbare Arbeitsblätter (PDF) (Admin → „Aufträge & Blätter“: Lektion, Abakus ablesen, Anzan-Ketten, mit Lösungsseite)

## 5. Klein, aber wichtig
- [~] 5.1 Antwort per Handschrift oder Sprache für jüngere Kinder (Sprache fertig: Einstellung „Antwort sagen“, Mikrofon über den Zahlen-Tasten; Handschrift noch offen)
- [x] 5.2 Barrierefreiheit: Perlen zusätzlich mit Mustern (Farbenblindheit), Schriftgröße einstellbar (Einstellungen auf „Ich“)
- [x] 5.3 Offline-Modus der PWA für Übungen (Bilder jetzt im Offline-Speicher, Fortschritt wird nachgeladen, Offline-Hinweis; Lektions-Videos brauchen Internet)

## Offene Punkte aus früheren Sitzungen
- „Genie Kids Math" in der Werbung: Markenrecht prüfen (vorerst „Mathe-Genie")
- Angeboten: Shorts-Version (9:16) des YouTube-Videos; Effekt-Sounds auf ältere Spiele übertragen
