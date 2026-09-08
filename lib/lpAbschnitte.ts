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
  { id: 'grenze', label: 'Rollengrenze' },
  { id: 'begriffe', label: 'Begriffe' },
  { id: 'schichten', label: 'Aufbau' },
  { id: 'massstab', label: 'Maßstab' },
  { id: 'gemessen', label: 'Gemessen' },
  { id: 'luecke', label: 'Nicht gemessen' },
  { id: 'uebertragbarkeit', label: 'Übertragbarkeit' },
  { id: 'plattform', label: 'Betrieb', freigabe: 'intern' },
  { id: 'entscheidungen', label: 'Entscheidungen' },
  { id: 'offen', label: 'Offen' },
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
