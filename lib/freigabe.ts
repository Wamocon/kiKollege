// Freigabestufen. Das Uebergabedokument empfiehlt, die Grenze zwischen internem
// und oeffentlichem Inhalt als Eigenschaft der Notiz zu fuehren statt als
// Erinnerungsleistung. Genau das macht dieses Feld: Jedes Datenelement traegt
// seine Stufe, und der Build entscheidet, welche Stufe er rendert.

export type Freigabe = 'intern' | 'oeffentlich'

export interface MitFreigabe {
  freigabe?: Freigabe
}

/** Fassung dieses Builds, gesetzt ueber FREIGABE:
 *
 *  - intern: alles, und was intern ist, traegt eine Markierung. Voreinstellung.
 *  - oeffentlich: nur, was nach aussen tragfaehig ist.
 *  - alles: alles, ohne Markierung.
 *
 *  Seit dem 17.09.2026 stellt GitHub Pages die Fassung "alles". Erwin Moretz
 *  hat entschieden, vorerst keinen Unterschied zwischen intern und oeffentlich
 *  zu machen. Die Felder werden weiter gepflegt, damit die Trennung mit einer
 *  Zeile im Workflow zurueckkommt. */
export type Fassung = Freigabe | 'alles'

const angefordert = process.env.NEXT_PUBLIC_FREIGABE

export const fassung: Fassung =
  angefordert === 'oeffentlich' || angefordert === 'alles' ? angefordert : 'intern'

/** Zeigt diese Fassung auch, was als intern markiert ist? */
export const zeigtInternes = fassung !== 'oeffentlich'

/** Markiert diese Fassung, was intern ist? Das tut nur die interne. */
export const istIntern = fassung === 'intern'

/** Ein Element ohne Angabe gilt als oeffentlich, weil die Datenpflege sonst
 *  stillschweigend Inhalt verlieren wuerde, sobald jemand das Feld vergisst. */
export function sichtbar(element: MitFreigabe): boolean {
  if (zeigtInternes) return true
  return (element.freigabe ?? 'oeffentlich') === 'oeffentlich'
}

export function nurSichtbare<T extends MitFreigabe>(elemente: readonly T[]): T[] {
  return elemente.filter(sichtbar)
}
