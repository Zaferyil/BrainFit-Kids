# BrainFit Kids – Abakus Akademie

Mental-Arithmetik-PWA für Kinder von 6 bis 10 Jahren (React + TypeScript + Vite).

## Entwicklung

```sh
npm install
npm run dev     # Entwicklungsserver
npm run build   # Typprüfung + Produktions-Build
npm run lint    # Oxlint
```

## Aufbau

- `src/screens/` – ein Bildschirm pro Route (Kinder, Eltern, Admin), siehe `src/App.tsx`
- `src/components/` – gemeinsame Bausteine: `Abakus`, `Perli`, `Avatar`, `Icon`, `TopBar`, `NavBar`, `Stage`, Layouts
- `src/styles.css` – Farb-Tokens und gemeinsame Klassen
- Routing über den URL-Hash (`#/karte`, `#/eltern/uebersicht`, `#/admin` …) – `src/router.ts`

Kinder-Bildschirme sind für 1194 × 834 (Tablet quer) gestaltet und werden von `Stage` auf das Fenster skaliert;
Eltern- und Admin-Bereich sind fließend.
