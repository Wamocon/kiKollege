import type { ReactNode } from 'react'
import { lpAbschnitt } from '@/lib/lpAbschnitte'
import { istIntern } from '@/lib/freigabe'

/** Abschnitt mit Monospace-Index in der Rinne. Gibt null zurück, wenn der
 *  Abschnitt in dieser Fassung nicht gezeigt wird, damit die Seite ihn nicht
 *  einzeln abfragen muss. */
export function Sektion({
  id,
  klasse,
  children,
}: {
  id: string
  klasse?: string
  children: ReactNode
}) {
  const a = lpAbschnitt(id)
  if (!a) return null
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
