import type { Freigabe } from './freigabe'
import { nurSichtbare } from './freigabe'

export interface LpAbschnitt {
  id: string
  label: string
  freigabe?: Freigabe
}

/** Reihenfolge der Landing Page. Faellt ein interner Abschnitt in der
 *  oeffentlichen Fassung weg, ruecken die Nummern nach, damit die Zaehlung
 *  keine Luecke zeigt. */
const alle: readonly LpAbschnitt[] = [
  { id: 'vorhaben', label: 'Vorhaben' },
  { id: 'chatbot', label: 'Abgrenzung' },
  { id: 'eignung', label: 'Eignung' },
  { id: 'ertrag', label: 'Ertrag' },
  { id: 'aufbau', label: 'Aufbau' },
  { id: 'wissen', label: 'Wissen' },
  { id: 'durchlauf', label: 'Durchlauf' },
  { id: 'messung', label: 'Messung' },
  { id: 'erster', label: 'Der erste' },
  { id: 'mannschaft', label: 'Mannschaft' },
  { id: 'landschaft', label: 'Landschaft' },
  { id: 'steuerung', label: 'Steuerung' },
  { id: 'stand', label: 'Stand' },
  { id: 'stufen', label: 'Stufen' },
  { id: 'arbeit', label: 'Aufwand' },
  { id: 'plattform', label: 'Betrieb', freigabe: 'intern' },
  { id: 'entscheidungen', label: 'Entscheidungen' },
  { id: 'beobachtungen', label: 'Abgleich', freigabe: 'intern' },
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
