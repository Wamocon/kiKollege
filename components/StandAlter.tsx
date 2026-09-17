'use client'

import { useEffect, useState } from 'react'

import { alterInWorten, tageSeit } from '@/lib/alter'

/** Das Alter des Stands, im Browser gerechnet. Vor der ersten Zeichnung und
 *  ohne JavaScript steht hier nichts: dann bleibt es beim Datum daneben, das
 *  immer stimmt. Lieber keine Angabe als eine, die am Tag des Builds klebt.
 *
 *  satz=true liefert den ganzen Satz für die Fußleiste, und zwar nur, wenn der
 *  Stand die Frist überschritten hat. Ohne satz nur das Alter als kurzer
 *  Zusatz neben dem Datum.
 *
 *  Die Werte kommen als Props von der Seite. Diese Komponente läuft im
 *  Browser; würde sie die Daten selbst importieren, stünde der ganze Datensatz
 *  im ausgelieferten JavaScript, auch was nur intern ist. */
export function StandAlter({
  stand,
  fristTage,
  erzeugt,
  satz = false,
}: {
  /** Tag des Stands, ISO. */
  stand: string
  /** Ab wie vielen Tagen der Stand als alt gilt. */
  fristTage: number
  /** Tag des letzten Nachtrags, schon in der Schreibweise des Hauses. */
  erzeugt?: string
  satz?: boolean
}) {
  const [tage, setTage] = useState<number | null>(null)

  useEffect(() => setTage(tageSeit(stand)), [stand])

  if (tage === null) return null
  const alter = alterInWorten(tage)
  if (!alter) return null
  const ueberfaellig = tage > fristTage

  if (satz) {
    if (!ueberfaellig) return null
    return (
      <p className="stand-hinweis">
        Diese Zahlen sind {alter}.
        {erzeugt ? ` Zuletzt aus dem Vault fortgeschrieben am ${erzeugt}.` : ''}
      </p>
    )
  }

  return (
    <span className={ueberfaellig ? 'stand-alter ueberfaellig' : 'stand-alter'}>{alter}</span>
  )
}
