import type { ReactNode } from 'react'

import { daten } from '@/lib/daten'
import { sichtbar } from '@/lib/freigabe'

/** Ein Fachwort, das auf seine Erklärung unter „Begriffe“ zeigt. Gibt es den
 *  Begriff in dieser Fassung nicht, bleibt das Wort ohne Link, damit kein
 *  Anker ins Leere führt. */
export function Begriff({ id, children }: { id: string; children: ReactNode }) {
  const g = daten.glossar
  if (!sichtbar(g) || !g.eintraege.some((e) => e.id === id)) return <>{children}</>
  return (
    <a className="lp-begriff" href={`#begriff-${id}`}>
      {children}
    </a>
  )
}
