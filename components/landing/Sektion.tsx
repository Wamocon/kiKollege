import type { ReactNode } from 'react'
import { lpAbschnitt } from '@/lib/lpAbschnitte'
import { istIntern } from '@/lib/freigabe'

/** Abschnitt mit Monospace-Index in der Rinne. Gibt null zurück, wenn der
 *  Abschnitt in dieser Fassung nicht gezeigt wird, damit die Seite ihn nicht
 *  einzeln abfragen muss. Ohne Rahmen bleibt nur der Inhalt, so wie das Labor
 *  ihn als Einzelheiten aufklappt. */
export function Sektion({
  id,
  klasse,
  rahmen = true,
  children,
}: {
  id: string
  klasse?: string
  rahmen?: boolean
  children: ReactNode
}) {
  const a = lpAbschnitt(id)
  if (!a) return null
  if (!rahmen) {
    return (
      <section id={id} className="lp-einzelheit">
        <div className="lp-inhalt">{children}</div>
      </section>
    )
  }
  const nurIntern = a.freigabe === 'intern' && istIntern

  return (
    <section id={id} className={klasse ? `lp-sektion ${klasse}` : 'lp-sektion'}>
      <div className="lp-sektion-innen">
        <p className="lp-index">
          <span className="nr">[ {a.nr} ]</span>
          <span className="was">
            {a.label}
            {nurIntern ? ', nur intern' : ''}
          </span>
        </p>
        <div className="lp-inhalt">{children}</div>
      </div>
    </section>
  )
}
