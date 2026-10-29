#!/usr/bin/env node
/**
 * Legt den Film und sein Standbild nach dem Build neben das Labor (out/labor/).
 *
 * Läuft als postbuild. Der Film zeigt den Meilensteinplan, der nur intern
 * freigegeben ist; die öffentliche Fassung bekommt ihn deshalb nicht, und das
 * Labor zeigt ihn dort auch nicht an.
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
const stand = JSON.parse(readFileSync('film/stand.json', 'utf8'))
for (const datei of [stand.datei, stand.bild]) {
  if (!existsSync(`film/${datei}`)) {
    console.error(`Es fehlt film/${datei}. Erst npm run baue:film.`)
    process.exit(1)
  }
  copyFileSync(`film/${datei}`, `out/labor/${datei}`)
}
console.log(`Film neben das Labor gelegt: ${stand.datei}, ${stand.bild}`)
