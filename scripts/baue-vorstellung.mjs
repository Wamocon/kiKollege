#!/usr/bin/env node
/**
 * Rendert den Film „Ein Tag mit der Mannschaft“ neu.
 *
 *   npm run baue:vorstellung                    Projekt schreiben, prüfen, rendern
 *   npm run baue:vorstellung -- --nur-projekt   nur das Projekt im Temp-Ordner schreiben
 *
 * Wie scripts/baue-film.mjs: von Hand gerendert, nicht in der CI. Der fertige Film
 * geht zuerst als Datei an den Projektverantwortlichen in den Chat; erst nach seinem
 * Okay kommen Film, Standbild und stand.json in einen Commit.
 */

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { figurenAlsSvg } from './figuren-svg.mjs'
import { BREITE, HOEHE, dauer, fingerabdruck, kompositionen, vorstellungDaten } from './vorstellung-daten.mjs'

const HYPERFRAMES = 'hyperframes@0.8.217'
const ORDNER = 'film/vorstellung'
/** Im Temp-Ordner, weil lange Pfade unter Windows sonst das Rendern abbrechen */
const PROJEKT = join(tmpdir(), 'kikollege-vorstellung')
const DATEI = 'kikollege-mannschaft.mp4'
const BILD = 'kikollege-mannschaft.jpg'
/** Das Standbild zeigt Gregor Dev mit den Paketen */
const BILD_BEI = 16.5

const umgebung = {
  ...process.env,
  DO_NOT_TRACK: '1',
  HYPERFRAMES_NO_TELEMETRY: '1',
  HYPERFRAMES_SKIP_SKILLS: '1',
  HYPERFRAMES_NO_UPDATE_CHECK: '1',
}

function lauf(befehl, args) {
  const r = spawnSync(befehl, args, { stdio: 'inherit', env: umgebung, shell: process.platform === 'win32' })
  if (r.status !== 0) {
    console.error(`Abgebrochen: ${befehl} ${args.join(' ')}`)
    process.exit(r.status ?? 1)
  }
}

const werte = vorstellungDaten(JSON.parse(readFileSync('data/projektstand.json', 'utf8')))
const figuren = await figurenAlsSvg()
rmSync(PROJEKT, { recursive: true, force: true })
for (const [pfad, inhalt] of Object.entries(kompositionen(werte, figuren))) {
  mkdirSync(dirname(join(PROJEKT, pfad)), { recursive: true })
  writeFileSync(join(PROJEKT, pfad), inhalt)
}
mkdirSync(join(PROJEKT, 'assets', 'fonts'), { recursive: true })
copyFileSync('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', join(PROJEKT, 'assets', 'fonts', 'inter.woff2'))
copyFileSync('node_modules/gsap/dist/gsap.min.js', join(PROJEKT, 'assets', 'gsap.min.js'))
console.log(`Projekt geschrieben: ${PROJEKT}, Stand ${werte.stand}, ${dauer(werte)} s`)
if (process.argv.includes('--nur-projekt')) process.exit(0)

lauf('npx', ['--yes', HYPERFRAMES, 'check', PROJEKT])
lauf('npx', ['--yes', HYPERFRAMES, 'render', PROJEKT, '-o', `film/${DATEI}`, '--crf', '26', '--quiet'])
lauf('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(BILD_BEI), '-i', `film/${DATEI}`, '-frames:v', '1', '-vf', 'scale=1280:-1', '-q:v', '3', `film/${BILD}`])

const stand = {
  stand: werte.stand,
  fingerabdruck: fingerabdruck(werte),
  datei: DATEI,
  bild: BILD,
  bytes: statSync(`film/${DATEI}`).size,
  sekunden: dauer(werte),
  breite: BREITE,
  hoehe: HOEHE,
  hyperframes: HYPERFRAMES,
}
writeFileSync(`${ORDNER}/stand.json`, `${JSON.stringify(stand, null, 2)}\n`)
console.log(`Film gerendert: film/${DATEI}, ${(stand.bytes / 1e6).toFixed(1)} MB, Fingerabdruck ${stand.fingerabdruck}`)
