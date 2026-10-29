#!/usr/bin/env node
/**
 * Meldet, wenn der Film im Labor nicht mehr zu den Daten passt.
 *
 *   npm run pruefe:film                Warnung, der Lauf bleibt grün
 *   npm run pruefe:film -- --streng    schlägt fehl, wenn der Film veraltet ist
 *
 * Der Film wird von Hand gerendert (npm run baue:film) und trägt in
 * film/stand.json den Fingerabdruck der Werte, die er zeigt. Ändern sich
 * Meilensteine, Prüfstand oder Risiken, passt der Abdruck nicht mehr. Das soll
 * eine Datenpflege nicht aufhalten, deshalb ist es ohne --streng nur ein Hinweis.
 */

import { existsSync, readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

import { filmDaten, fingerabdruck } from './film-daten.mjs'

/** Ob der Film zu den Daten passt, und wenn nicht, warum. */
export function vergleiche(stand, daten) {
  const werte = filmDaten(daten)
  const jetzt = fingerabdruck(werte)
  if (!stand.fingerabdruck) return { aktuell: false, grund: 'Der Film ist noch nicht gerendert.' }
  if (stand.fingerabdruck === jetzt) return { aktuell: true, grund: `Der Film passt zu den Daten (Stand ${stand.stand}).` }
  return {
    aktuell: false,
    grund: `Der Film zeigt den Stand vom ${stand.stand}, die Daten haben sich seitdem geändert. Neu rendern mit npm run baue:film.`,
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const stand = JSON.parse(readFileSync('film/stand.json', 'utf8'))
  const daten = JSON.parse(readFileSync('data/projektstand.json', 'utf8'))
  const fehlt = [stand.datei, stand.bild].filter((f) => !existsSync(`film/${f}`))
  const { aktuell, grund } = fehlt.length
    ? { aktuell: false, grund: `Es fehlt: ${fehlt.map((f) => `film/${f}`).join(', ')}` }
    : vergleiche(stand, daten)
  if (aktuell) {
    console.log(grund)
  } else if (process.argv.includes('--streng')) {
    console.error(grund)
    process.exit(1)
  } else {
    console.log(process.env.GITHUB_ACTIONS ? `::warning title=Film im Labor::${grund}` : `Hinweis: ${grund}`)
  }
}
