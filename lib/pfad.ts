/** Auf GitHub Pages liegt die Seite unter /kiKollege, nicht in der Wurzel.
 *  Next.js setzt diesen Pfad nur bei eigenen Bausteinen wie <Link> davor. Ein
 *  schlichtes <a href> bekommt ihn hier, sonst führt der Link ins Leere. */
export function pfad(ziel: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${ziel}`
}
