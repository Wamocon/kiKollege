#!/usr/bin/env node
/**
 * Legt die Filme und ihre Standbilder nach dem Build neben das Labor (out/labor/).
 *
 * Läuft als postbuild. Der erste Film zeigt den Meilensteinplan, der zweite auch
 * julia-trend; beides ist nur intern freigegeben. Die öffentliche Fassung bekommt
 * sie deshalb nicht, und das Labor zeigt sie dort auch nicht an.
 */

import { copyFileSync, existsSync, readFileSync } from 'node:fs'

const freigabe = process.env.FREIGABE ?? 'intern'
if (freigabe === 'oeffentlich') {
  console.log('Öffentliche Fassung: kein Film.')
  process.exit(0)
}
if (!existsSync('out/labor')) {
  console.log('Kein Labor gebaut, kein Film.')
  process.exit(0)
}
for (const [pfad, befehl] of [['film/stand.json', 'baue:film'], ['film/vorstellung/stand.json', 'baue:vorstellung']]) {
  const stand = JSON.parse(readFileSync(pfad, 'utf8'))
  for (const datei of [stand.datei, stand.bild]) {
    if (!existsSync(`film/${datei}`)) {
      console.error(`Es fehlt film/${datei}. Erst npm run ${befehl}.`)
      process.exit(1)
    }
    copyFileSync(`film/${datei}`, `out/labor/${datei}`)
  }
  console.log(`Film neben das Labor gelegt: ${stand.datei}, ${stand.bild}`)
}
