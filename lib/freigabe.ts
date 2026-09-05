// Freigabestufen. Das Uebergabedokument empfiehlt, die Grenze zwischen internem
// und oeffentlichem Inhalt als Eigenschaft der Notiz zu fuehren statt als
// Erinnerungsleistung. Genau das macht dieses Feld: Jedes Datenelement traegt
// seine Stufe, und der Build entscheidet, welche Stufe er rendert.

export type Freigabe = 'intern' | 'oeffentlich'

export interface MitFreigabe {
  freigabe?: Freigabe
}

/** Stufe dieses Builds. FREIGABE=oeffentlich npm run build baut die Fassung,
 *  die nach aussen tragfaehig ist. Ohne Angabe gilt die interne Fassung. */
export const stufe: Freigabe =
  process.env.NEXT_PUBLIC_FREIGABE === 'oeffentlich' ? 'oeffentlich' : 'intern'

export const istIntern = stufe === 'intern'

/** Ein Element ohne Angabe gilt als oeffentlich, weil die Datenpflege sonst
 *  stillschweigend Inhalt verlieren wuerde, sobald jemand das Feld vergisst. */
export function sichtbar(element: MitFreigabe): boolean {
  if (istIntern) return true
  return (element.freigabe ?? 'oeffentlich') === 'oeffentlich'
}

export function nurSichtbare<T extends MitFreigabe>(elemente: readonly T[]): T[] {
  return elemente.filter(sichtbar)
}
