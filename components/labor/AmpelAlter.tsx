'use client'

import { useEffect, useState } from 'react'

import { alterInWorten, tageSeit } from '@/lib/alter'

/** Hinweis an der Ampel der Management Summary, wenn ihr Urteil älter ist als
 *  die Frist. Gerechnet wird im Browser, mit dem Tag des Lesers, wie bei
 *  StandAlter: Der Tag des Builds sagt nichts darüber, wie alt das Urteil
 *  beim Lesen ist. Vor der ersten Zeichnung und ohne JavaScript steht hier
 *  nichts; das Datum daneben stimmt immer. */
export function AmpelAlter({ am, fristTage }: { am: string; fristTage: number }) {
  const [tage, setTage] = useState<number | null>(null)

  useEffect(() => setTage(tageSeit(am)), [am])

  if (tage === null || tage <= fristTage) return null
  const alter = alterInWorten(tage)
  if (!alter) return null
  return <span className="lb-ampel-alt">nicht aktuell, {alter}</span>
}
