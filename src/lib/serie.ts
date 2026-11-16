import { load, save } from './storage'
import { getProgress, saveProgress } from './progress'
import { belohnen } from './wirtschaft'

// Tagesserie: an wie vielen Tagen hintereinander das Kind gelernt hat (mind. eine Aufgabe, Station oder ein Denkspiel).
// Alle 7 Tage am Stück gibt es den Serien-Bonus; mit 7 Tagen wird außerdem das Ninja-Kostüm frei.
const tag = (d = new Date()) => { const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000); return x.toISOString().slice(0, 10) }
const key = (kid: string) => `bfk.serie.${kid}`

export function serieZaehlen(kidId: string) {
  const heute = tag(), gestern = tag(new Date(Date.now() - 864e5))
  const s = load<{ letzter: string; tage: number }>(key(kidId), { letzter: '', tage: 0 })
  if (s.letzter === heute) return
  const tage = s.letzter === gestern ? s.tage + 1 : 1
  save(key(kidId), { letzter: heute, tage })
  const p = getProgress(kidId)
  saveProgress(kidId, { ...p, streak: tage })
  if (tage % 7 === 0) {
    belohnen(kidId, 'serie', heute, tage === 7
      ? '🔥 7 Tage am Stück! Super! Serien-Bonus – und das Ninja-Kostüm ist jetzt frei!'
      : `🔥 ${tage} Tage am Stück! Wahnsinn – hier ist dein Serien-Bonus!`)
  }
}

/** Serie anzeigen: ist der letzte Lerntag älter als gestern, ist sie gerissen */
export function aktuelleSerie(kidId: string) {
  const s = load<{ letzter: string; tage: number }>(key(kidId), { letzter: '', tage: 0 })
  return s.letzter === tag() || s.letzter === tag(new Date(Date.now() - 864e5)) ? s.tage : 0
}
