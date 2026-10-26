# Lernvideos – Konzept

Alle Lektionen (1–33) und Übungsvideos (X.1) entstehen nach demselben Muster, damit die Reihe
einheitlich aussieht und sich leicht pflegen lässt.

## Prinzip: Video aus einem Drehbuch

Jede Lektion ist ein Drehbuch in `src/studio/lektionen.ts`: eine Folge von Szenen mit

- `say` – was Lehrerin **Lisa** sagt (Stimme + Untertitel),
- Abakus-Stand und Bewegungen (`moves`, zeitlich an Wörter im Satz gekoppelt),
- Einblendungen: Hervorhebung, Stellenwerte, Zahl-Abzeichen, Merk-Karten, Mitmach-Aufgabe.

Daraus entstehen automatisch:

1. **Bild** – das Video-Studio (`#/studio/<lektion>`) zeichnet jede Szene mit dem Abakus der App
   (Originalgrafiken von abacus.mentalmath.at). `scripts/studio-export.cjs` nimmt Bild für Bild in
   1920×1080 auf und erzeugt das MP4.
2. **Stimme** – je Szene eine ElevenLabs-Aufnahme. Ändert sich ein Satz, wird nur diese Szene neu
   vertont. Die echte Länge der Aufnahme ersetzt die geschätzte Sprechdauer im Zeitplan.
3. **Untertitel** – aus denselben Sätzen.

## Gestaltung (alle Videos gleich)

- Hintergrund: Nachtviolett der App, leichte Sterne; Schriften Baloo 2 / Nunito.
- Kopfzeile: „Lektion N“ + Titel, rechts „BrainFit Kids“.
- Abakus groß in der Mitte; bewegte Perlen mit Hand, Zahl-Abzeichen rechts („6 = 5 + 1“).
- Lisa unten links im Fenster mit Namensschild und Sprech-Anzeige.
  Das Fenster nimmt später ohne Umbau einen sprechenden Avatar-Clip auf.
- Untertitel unten.

## Fingertechnik (in jeder Lektion, in der Perlen bewegt werden)

| Perle | Richtung | Finger | Hand im Video |
|---|---|---|---|
| Erdperle | nach oben | Daumen | 👍 unter der Perle |
| Erdperle | nach unten | Zeigefinger | 👇 über der Perle |
| Himmelsperle | runter und hoch | Zeigefinger | 👇 / 👆 |

Die Hände setzt das Studio automatisch aus der Perlenbewegung – im Drehbuch muss nichts angegeben werden.
Handgrafiken: Twemoji (CC-BY 4.0, https://github.com/jdecked/twemoji).

## Aufbau jeder Lektion (3–5 Minuten)

1. Titel (5 s) – Logo, „Lektion N · Titel“
2. Begrüßung und Ziel (15 s)
3. Wiederholung der letzten Lektion (ab Lektion 2, 20–30 s)
4. Erklärung (1,5–2,5 min)
5. Mitmachen: 2–4 Aufgaben mit 3-2-1 und Lösung
6. Merk-Karte (10 s) – gleicher Merksatz wie in der App
7. Abschluss (10 s) – „Jetzt bist du dran!“ mit Verweis auf die App-Station

Übungsvideos (X.1) nutzen Titel, Mitmachen und Abschluss.

## Stand

- Lektion 1 „Der Abakus“: Drehbuch und Bild fertig, Vorschau ohne Ton.
- Offen: Stimme für Lisa (ElevenLabs, sobald Credits verfügbar), sprechender Avatar für Lisa
  (z. B. HeyGen/D-ID), hochauflösendes Bild von Lisa.
