import type { Freigabe } from './freigabe'

export interface Abschnitt {
  id: string
  nr: string
  titel: string
  freigabe?: Freigabe
}

/** Eine Quelle fuer die Ankernavigation und die Abschnittsueberschriften,
 *  damit Nummerierung und Reihenfolge nicht auseinanderlaufen koennen. */
export const abschnitte: readonly Abschnitt[] = [
  { id: 'vorhaben', nr: '01', titel: 'Das Vorhaben' },
  { id: 'begriffe', nr: '02', titel: 'Drei Begriffe' },
  { id: 'schichten', nr: '03', titel: 'Die acht Schichten' },
  { id: 'gedaechtnis', nr: '04', titel: 'Wissen und Gedächtnis' },
  { id: 'fritz', nr: '05', titel: 'Auftrag, Grenze, Ablauf' },
  { id: 'massstab', nr: '06', titel: 'Der Maßstab' },
  { id: 'gegenstand', nr: '07', titel: 'Der Gegenstand' },
  { id: 'gemessen', nr: '08', titel: 'Was gemessen wurde' },
  { id: 'luecke', nr: '09', titel: 'Was nicht gemessen ist' },
  { id: 'uebertragbarkeit', nr: '10', titel: 'Übertragbarkeit' },
  { id: 'plattform', nr: '11', titel: 'Wo Fritz läuft', freigabe: 'intern' },
  { id: 'entscheidungen', nr: '12', titel: 'Entscheidungen mit Datum' },
  { id: 'offen', nr: '13', titel: 'Offene Punkte' },
  { id: 'beobachtungen', nr: '14', titel: 'Beobachtungen aus dem Abgleich', freigabe: 'intern' },
  { id: 'quellen', nr: '15', titel: 'Wo die Quellen liegen', freigabe: 'intern' },
]

export function abschnitt(id: string): Abschnitt {
  const treffer = abschnitte.find((a) => a.id === id)
  if (!treffer) throw new Error(`Unbekannter Abschnitt: ${id}`)
  return treffer
}
