'use client'

import { useEffect, useState } from 'react'

import { alterInWorten, tageSeit } from '@/lib/alter'
import { daten, datum } from '@/lib/daten'

/** Das Alter des Stands, im Browser gerechnet. Vor der ersten Zeichnung und
 *  ohne JavaScript steht hier nichts: dann bleibt es beim Datum daneben, das
 *  immer stimmt. Lieber keine Angabe als eine, die am Tag des Builds klebt.
 *
 *  satz=true liefert den ganzen Satz für die Fußleiste, und zwar nur, wenn der
 *  Stand die Frist überschritten hat. Ohne satz nur das Alter als kurzer
 *  Zusatz neben dem Datum. */
export function StandAlter({ satz = false }: { satz?: boolean }) {
  const [tage, setTage] = useState<number | null>(null)

  useEffect(() => setTage(tageSeit(daten.stand)), [])

  if (tage === null) return null
  const alter = alterInWorten(tage)
  if (!alter) return null
  const ueberfaellig = tage > daten.herkunft.fristTage

  if (satz) {
    if (!ueberfaellig) return null
    return (
      <p className="stand-hinweis">
        Diese Zahlen sind {alter}. Zuletzt aus dem Vault fortgeschrieben am{' '}
        {datum(daten.herkunft.erzeugt)}.
      </p>
    )
  }

  return (
    <span className={ueberfaellig ? 'stand-alter ueberfaellig' : 'stand-alter'}>{alter}</span>
  )
}
