import type { ReactNode } from 'react'
import { lpAbschnitt } from '@/lib/lpAbschnitte'

/** Abschnitt der Laborseite. Anders als `Sektion` ohne Nummer in der Rinne: Die
 *  Nummern stehen nur in der Navigation. Ein Kapitel bekommt seinen Namen einmal,
 *  über dem ersten Abschnitt. Gibt null zurück, wenn der Abschnitt in dieser
 *  Fassung nicht gezeigt wird. */
export function LaborSektion({
  id,
  klasse,
  kapitel,
  children,
}: {
  id: string
  klasse?: string
  /** Name des Kapitels, nur über dem ersten Abschnitt eines Kapitels */
  kapitel?: string
  children: ReactNode
}) {
  if (!lpAbschnitt(id)) return null

  return (
    <section id={id} className={klasse ? `lab-sektion ${klasse}` : 'lab-sektion'}>
      <div className="lab-sektion-innen">
        <span className="lab-rinne" aria-hidden="true" />
        <div className="lab-inhalt">
          {kapitel ? <p className="lab-kapitel">{kapitel}</p> : null}
          {children}
        </div>
      </div>
    </section>
  )
}
