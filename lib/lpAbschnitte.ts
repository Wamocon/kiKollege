import type { Freigabe } from './freigabe'
import { nurSichtbare } from './freigabe'

export interface LpAbschnitt {
  id: string
  label: string
  freigabe?: Freigabe
}

/** Reihenfolge der Landing Page. Faellt ein interner Abschnitt in der
 *  oeffentlichen Fassung weg, ruecken die Nummern nach, damit die Zaehlung
 *  keine Luecke zeigt.
 *
 *  Seit dem 17.09. hat die Seite zwoelf Abschnitte statt neunzehn. Ertrag und
 *  Aufwand stehen unter Eignung, die Steuerung unter Arbeitsweise. Stufen,
 *  Betrieb, Entscheidungen und Abgleich stehen nur noch unter /stand/, ebenso
 *  die Einzelheiten des Meilensteinplans. */
const alle: readonly LpAbschnitt[] = [
  { id: 'vorhaben', label: 'Vorhaben' },
  { id: 'chatbot', label: 'Abgrenzung' },
  { id: 'eignung', label: 'Eignung' },
  { id: 'aufbau', label: 'Aufbau' },
  { id: 'wissen', label: 'Wissen' },
  { id: 'durchlauf', label: 'Arbeitsweise' },
  { id: 'messung', label: 'Messung' },
  { id: 'erster', label: 'Der erste' },
  { id: 'mannschaft', label: 'Mannschaft' },
  { id: 'landschaft', label: 'Landschaft' },
  { id: 'stand', label: 'Stand' },
  // Der Fahrplan gehört nach der Übergabe vom 11.09. nicht in die öffentliche
  // Fassung. Pages zeigt seit dem 17.09. ohnehin alles.
  { id: 'plan', label: 'Meilensteine', freigabe: 'intern' },
]

export const sichtbareAbschnitte = nurSichtbare(alle)

const nummern = new Map(
  sichtbareAbschnitte.map((a, i) => [a.id, String(i + 1).padStart(2, '0')]),
)

export function lpAbschnitt(id: string): (LpAbschnitt & { nr: string }) | null {
  const treffer = sichtbareAbschnitte.find((a) => a.id === id)
  if (!treffer) return null
  return { ...treffer, nr: nummern.get(id)! }
}
