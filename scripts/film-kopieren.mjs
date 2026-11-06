#!/usr/bin/env node
/**
 * Legt die Filme, ihre Standbilder und Untertitel nach dem Build nach out/film/.
 *
 * Läuft als postbuild. Der erste Film zeigt den Meilensteinplan, der zweite auch
 * julia-trend; beides ist nur intern freigegeben. Die Systemdemo hält sich an dieselbe
 * Regel, damit die öffentliche Fassung ohne Filme auskommt. Die öffentliche Fassung bekommt
 * sie deshalb nicht, und die Startseite zeigt sie dort auch nicht an.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'

const freigabe = process.env.FREIGABE ?? 'intern'
if (freigabe === 'oeffentlich') {
  console.log('Öffentliche Fassung: kein Film.')
  process.exit(0)
}
if (!existsSync('out')) {
  console.log('Keine Seite gebaut, kein Film.')
  process.exit(0)
}
mkdirSync('out/film', { recursive: true })
for (const [pfad, befehl] of [['film/stand.json', 'baue:film'], ['film/vorstellung/stand.json', 'baue:vorstellung'], ['film/systemdemo/stand.json', 'baue:systemdemo']]) {
  const stand = JSON.parse(readFileSync(pfad, 'utf8'))
  for (const datei of [stand.datei, stand.bild, stand.untertitel].filter(Boolean)) {
    if (!existsSync(`film/${datei}`)) {
      console.error(`Es fehlt film/${datei}. Erst npm run ${befehl}.`)
      process.exit(1)
    }
    copyFileSync(`film/${datei}`, `out/film/${datei}`)
  }
  console.log(`Film nach out/film/ gelegt: ${stand.datei}, ${stand.bild}`)
}
