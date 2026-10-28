// Abschlusstest: Zahlen kommen nacheinander, das Kind rechnet mit dem Abakus (eigener oder Bildschirm) und tippt das Ergebnis ein.
// Aus dem Level-Plan (Aktuel Soroban Oyun Level Plan, Blatt „Level 1“): je Lektion 5 Aufgaben (SORU 1, 3, 5, 8, 11) der passenden Übung.

export type HoerAufgabe = { zahlen: number[]; antwort: number }

export const ABSCHLUSS: Record<string, HoerAufgabe[]> = {
  '1-1': [{ zahlen: [3, 1, -2, 2], antwort: 4 }, { zahlen: [2, 1, -3, 4], antwort: 4 }, { zahlen: [4, -3, 2, -2, 1], antwort: 2 }, { zahlen: [8, -1, 2, -5, 5, -8], antwort: 1 }, { zahlen: [9, -2, 2, -5, -2, 5, 2], antwort: 9 }],
  '1-2': [{ zahlen: [2, 9], antwort: 11 }, { zahlen: [7, 9, -1], antwort: 15 }, { zahlen: [4, 9, -2, 5], antwort: 16 }, { zahlen: [5, 4, -6, 9, 1], antwort: 13 }, { zahlen: [2, 6, 1, 9, -5, 6], antwort: 19 }],
  '1-3': [{ zahlen: [2, 8], antwort: 10 }, { zahlen: [5, 2, 8], antwort: 15 }, { zahlen: [2, 6, 8, -5], antwort: 11 }, { zahlen: [6, 1, 8, 4, 9], antwort: 28 }, { zahlen: [2, 5, 1, 9, 8, -5], antwort: 20 }],
  '1-4': [{ zahlen: [3, 7], antwort: 10 }, { zahlen: [5, 3, 7], antwort: 15 }, { zahlen: [5, 4, 7, -1], antwort: 15 }, { zahlen: [2, 6, 7, 4, 7], antwort: 26 }, { zahlen: [2, 6, 7, 4, -5, 7], antwort: 21 }],
  '1-5': [{ zahlen: [4, 6], antwort: 10 }, { zahlen: [6, 3, 6, 2], antwort: 17 }, { zahlen: [2, 5, 2, 6, 4], antwort: 19 }, { zahlen: [2, 8, 9, -5, 6, 7], antwort: 27 }, { zahlen: [3, 5, 7, 4, 6, 3, 9], antwort: 37 }],
  '1-6': [{ zahlen: [25, 5], antwort: 30 }, { zahlen: [4, 5, 5, 6], antwort: 20 }, { zahlen: [2, 7, 9, 7, 5], antwort: 30 }, { zahlen: [4, -2, 8, 6, 5, 2], antwort: 23 }, { zahlen: [7, 5, 6, 7, 4, 9, 8], antwort: 46 }],
  '1-7': [{ zahlen: [16, 4], antwort: 20 }, { zahlen: [5, 2, -1, 4], antwort: 10 }, { zahlen: [6, 4, 2, 5, 9], antwort: 26 }, { zahlen: [4, 5, -3, 4, 8, 7], antwort: 25 }, { zahlen: [2, 5, 9, 4, 8, 5, 7], antwort: 40 }],
  '1-8': [{ zahlen: [27, 3], antwort: 30 }, { zahlen: [5, 2, 3, 5], antwort: 15 }, { zahlen: [8, 5, 6, 3, 9], antwort: 31 }, { zahlen: [9, 5, -2, 6, 3, 9], antwort: 30 }, { zahlen: [7, 9, 2, -6, 5, 2, 3], antwort: 22 }],
  '1-9': [{ zahlen: [38, 2], antwort: 40 }, { zahlen: [6, 3, 2, 7], antwort: 18 }, { zahlen: [9, 2, 8, -6, 8], antwort: 21 }, { zahlen: [9, 5, 9, -1, 6, 2], antwort: 30 }, { zahlen: [9, 5, 9, 7, 6, 2, 2], antwort: 40 }],
  '1-10': [{ zahlen: [39, 1], antwort: 40 }, { zahlen: [5, 1, 3, 1], antwort: 10 }, { zahlen: [1, 8, 1, 6, -5], antwort: 11 }, { zahlen: [5, 4, -3, 9, 4, 1], antwort: 20 }, { zahlen: [8, 9, 2, 1, 8, -5, 8], antwort: 31 }],
  '1-11': [{ zahlen: [9, 5, 8, 9], antwort: 31 }, { zahlen: [9, 1, 8, 4], antwort: 22 }, { zahlen: [1, 6, -5, 9, 3], antwort: 14 }, { zahlen: [9, 7, 5, 7, 2, 5], antwort: 35 }, { zahlen: [8, 4, 9, 6, 5, -2, 8], antwort: 38 }],
  '1-12': [{ zahlen: [3, 5, 7, 5], antwort: 20 }, { zahlen: [8, 3, 9, 4, 9], antwort: 33 }, { zahlen: [9, -5, 7, 9, 4], antwort: 24 }, { zahlen: [1, 6, -5, 9, 7, 7], antwort: 25 }, { zahlen: [8, 4, 9, 6, 5, -2, 8], antwort: 38 }],
  '2-1': [{ zahlen: [2, 1, 4], antwort: 7 }, { zahlen: [6, 2, -7, 4], antwort: 5 }, { zahlen: [1, 4, 3, 4], antwort: 12 }, { zahlen: [7, 5, 4, -6, 8], antwort: 18 }, { zahlen: [2, 4, 5, 9, 8, 7], antwort: 35 }],
  '2-2': [{ zahlen: [1, 3, 3], antwort: 7 }, { zahlen: [5, 3, -6, 3], antwort: 5 }, { zahlen: [8, -6, 3, 4], antwort: 9 }, { zahlen: [3, 6, 4, 3, -5], antwort: 11 }, { zahlen: [9, -6, 3, 5, 9, 8, -7], antwort: 21 }],
  '2-3': [{ zahlen: [8, -5, 2], antwort: 5 }, { zahlen: [7, 1, 5, 2], antwort: 15 }, { zahlen: [8, -5, 2, 4], antwort: 9 }, { zahlen: [7, -5, 1, 2, 3], antwort: 8 }, { zahlen: [6, 2, 5, 2, 4, -7, 8], antwort: 20 }],
  '2-4': [{ zahlen: [2, 2, 1], antwort: 5 }, { zahlen: [8, 1, 5, 1], antwort: 15 }, { zahlen: [4, 1, 2, 8], antwort: 15 }, { zahlen: [4, 1, 3, -6, 3], antwort: 5 }, { zahlen: [9, 2, 9, 4, 1, 5, 8], antwort: 38 }],
  '2-5': [{ zahlen: [4, 1, 2, 8], antwort: 15 }, { zahlen: [8, 5, 2, 4, 1], antwort: 20 }, { zahlen: [9, -6, 3, 5, 9], antwort: 20 }, { zahlen: [5, 2, -6, 4, 3], antwort: 8 }, { zahlen: [9, -6, 3, 5, 9, 8, -7], antwort: 21 }],
  '2-6': [{ zahlen: [7, 5, 4, -6, 8], antwort: 18 }, { zahlen: [6, 5, 4, 3, -7], antwort: 11 }, { zahlen: [9, 5, 1, 5, 3, 2, -5], antwort: 20 }, { zahlen: [5, 5, 6, 2, -5, 4], antwort: 17 }, { zahlen: [5, 3, -6, 3, 4, 8], antwort: 17 }],
  '3-1': [{ zahlen: [19, 9, 6], antwort: 34 }, { zahlen: [14, 5, 8, 6], antwort: 33 }, { zahlen: [28, 6, 1, 6, 3], antwort: 44 }, { zahlen: [35, 6, 9, 5, 3, 1], antwort: 59 }, { zahlen: [34, 5, 9, 7, 6, 9], antwort: 70 }],
  '3-2': [{ zahlen: [26, 7, 2], antwort: 35 }, { zahlen: [12, 15, 7, 5], antwort: 39 }, { zahlen: [25, 6, 5, 7, 2], antwort: 45 }, { zahlen: [26, 7, 2, 5, 6], antwort: 46 }, { zahlen: [62, 8, 5, 7, 3], antwort: 85 }],
  '3-3': [{ zahlen: [11, 15, 8], antwort: 34 }, { zahlen: [19, 6, 8], antwort: 33 }, { zahlen: [32, 15, 9, 8], antwort: 64 }, { zahlen: [39, 15, 1, 8, 2], antwort: 65 }, { zahlen: [39, -4, 8, 2], antwort: 45 }],
  '3-4': [{ zahlen: [25, 9, 5], antwort: 39 }, { zahlen: [65, 9, 15], antwort: 89 }, { zahlen: [24, -10, 6, 9], antwort: 29 }, { zahlen: [31, 12, 2, 9, 1], antwort: 55 }, { zahlen: [14, 35, 6, 9, 1], antwort: 65 }],
  '3-5': [{ zahlen: [16, 6, 5, 6], antwort: 33 }, { zahlen: [19, 6, 7, 3], antwort: 35 }, { zahlen: [74, 5, 6, 8], antwort: 93 }, { zahlen: [63, 5, 6, 1, 5], antwort: 80 }, { zahlen: [11, 15, 8, 1], antwort: 35 }],
  '3-6': [{ zahlen: [61, 19, 6, 7], antwort: 93 }, { zahlen: [24, 7, 6, 3], antwort: 40 }, { zahlen: [31, 5, 6, 2, 7], antwort: 51 }, { zahlen: [15, 8, 12, -25], antwort: 10 }, { zahlen: [23, 15, 7, 9], antwort: 54 }],
}
