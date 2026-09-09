// Wie alt der Stand heute ist. Eine statisch gebaute Seite kennt ihr eigenes
// Alter nicht: "heute" waere der Tag des Builds, nicht der Tag des Lesers.
// Deshalb rechnen diese Funktionen gegen die Uhr des Lesers, im Browser. So
// behauptet die Seite keine Frische, die sie nicht hat.

const WOERTER = [
  'null',
  'ein',
  'zwei',
  'drei',
  'vier',
  'fünf',
  'sechs',
  'sieben',
  'acht',
  'neun',
  'zehn',
  'elf',
  'zwölf',
]

/** Kleine Zahlen als Wort, groessere als Ziffer. */
export function inWorten(n: number): string {
  return WOERTER[n] ?? String(n)
}

/** Ganze Tage zwischen einem ISO-Datum und heute. Beide Enden liegen auf
 *  Mitternacht, damit die Uhrzeit des Aufrufs nichts verschiebt. */
export function tageSeit(iso: string, jetzt: Date = new Date()): number {
  const [jahr, monat, tag] = iso.split('-').map(Number)
  const dann = Date.UTC(jahr, monat - 1, tag)
  const heute = Date.UTC(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate())
  return Math.round((heute - dann) / 86_400_000)
}

/** Das Alter in einer Form, die sowohl allein steht als auch in den Satz
 *  "Diese Zahlen sind ..." passt. Ein Datum in der Zukunft ergibt nichts:
 *  dann stimmt etwas an den Daten nicht, und Schweigen ist besser als eine
 *  erfundene Angabe. */
export function alterInWorten(tage: number): string | null {
  if (tage < 0) return null
  if (tage === 0) return 'von heute'
  if (tage === 1) return 'von gestern'
  if (tage < 7) return `${inWorten(tage)} Tage alt`
  if (tage < 60) {
    const wochen = Math.floor(tage / 7)
    return wochen === 1 ? 'eine Woche alt' : `${inWorten(wochen)} Wochen alt`
  }
  const monate = Math.floor(tage / 30)
  return `${inWorten(monate)} Monate alt`
}
