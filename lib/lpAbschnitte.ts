import type { Freigabe } from './freigabe'
import { nurSichtbare } from './freigabe'

/** Die Kapitel der Navigation, in der Reihenfolge, in der ein Leser fragt. */
export type Kapitel = 'Verstehen' | 'Arbeiten' | 'Bauen' | 'Stand' | 'Nachschlagen'

export interface LpAbschnitt {
  id: string
  label: string
  kapitel: Kapitel
  freigabe?: Freigabe
}

/** Reihenfolge der Landing Page. Faellt ein interner Abschnitt in der
 *  oeffentlichen Fassung weg, ruecken die Nummern nach, damit die Zaehlung
 *  keine Luecke zeigt.
 *
 *  Seit dem 17.10. ist die Seite für alle Leser gebaut, nicht für Kenner: erst
 *  verstehen, dann damit arbeiten, dann wie es gebaut ist, zuletzt der Stand.
 *  Abgrenzung und Eignung stehen im ersten Abschnitt, die Ablage unter Wissen;
 *  ihre alten Anker `chatbot`, `eignung` und `ablage` gibt es weiter. Stufen,
 *  Betrieb, Entscheidungen, Abgleich und die Einzelheiten des Plans stehen nur
 *  unter /stand/. */
const alle: readonly LpAbschnitt[] = [
  { id: 'vorhaben', label: 'Was er ist', kapitel: 'Verstehen' },
  { id: 'erster', label: 'Der erste', kapitel: 'Verstehen' },
  { id: 'messung', label: 'Verlässlich?', kapitel: 'Verstehen' },
  { id: 'auftrag', label: 'Beauftragen', kapitel: 'Arbeiten' },
  { id: 'mannschaft', label: 'Mannschaft', kapitel: 'Arbeiten' },
  { id: 'aufbau', label: 'Aufbau', kapitel: 'Bauen' },
  { id: 'wissen', label: 'Wissen', kapitel: 'Bauen' },
  { id: 'durchlauf', label: 'Arbeitsweise', kapitel: 'Bauen' },
  { id: 'landschaft', label: 'Landschaft', kapitel: 'Bauen' },
  { id: 'technik', label: 'Technik', kapitel: 'Bauen' },
  { id: 'stand', label: 'Stand', kapitel: 'Stand' },
  // Der Fahrplan gehört nach der Übergabe vom 11.09. nicht in die öffentliche
  // Fassung. Pages zeigt seit dem 17.09. ohnehin alles.
  { id: 'plan', label: 'Meilensteine', kapitel: 'Stand', freigabe: 'intern' },
  { id: 'begriffe', label: 'Begriffe', kapitel: 'Nachschlagen' },
]

export const sichtbareAbschnitte = nurSichtbare(alle)

const nummern = new Map(
  sichtbareAbschnitte.map((a, i) => [a.id, String(i + 1).padStart(2, '0')]),
)

/** Die Abschnitte nach Kapiteln, in der Reihenfolge der Seite. */
export function nachKapiteln<T extends LpAbschnitt>(liste: T[]): { kapitel: Kapitel; abschnitte: T[] }[] {
  const gruppen: { kapitel: Kapitel; abschnitte: T[] }[] = []
  for (const a of liste) {
    const letzte = gruppen.at(-1)
    if (letzte && letzte.kapitel === a.kapitel) letzte.abschnitte.push(a)
    else gruppen.push({ kapitel: a.kapitel, abschnitte: [a] })
  }
  return gruppen
}

export function lpAbschnitt(id: string): (LpAbschnitt & { nr: string }) | null {
  const treffer = sichtbareAbschnitte.find((a) => a.id === id)
  if (!treffer) return null
  return { ...treffer, nr: nummern.get(id)! }
}
