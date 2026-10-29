#!/usr/bin/env node
/**
 * Rendert den Film „kiKollege in 30 Sekunden“ neu.
 *
 *   npm run baue:film                    Projekt schreiben, prüfen, rendern
 *   npm run baue:film -- --nur-projekt   nur film/projekt/ schreiben, zum Anschauen
 *
 * Schreibt die Kompositionen aus data/projektstand.json nach film/projekt/
 * (nicht versioniert), prüft sie mit HyperFrames, rendert film/kikollege-30s.mp4,
 * zieht daraus das Standbild und hält in film/stand.json fest, aus welchem
 * Stand der Daten der Film ist. Braucht ffmpeg; HyperFrames kommt über npx in
 * fester Version und läuft ohne Telemetrie. Gerendert wird von Hand, nicht in
 * der CI; danach Film, Standbild und stand.json committen.
 */

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { BREITE, DAUER, HOEHE, filmDaten, fingerabdruck, kompositionen } from './film-daten.mjs'

export const HYPERFRAMES = 'hyperframes@0.8.217'
const PROJEKT = 'film/projekt'
const DATEI = 'kikollege-30s.mp4'
const BILD = 'kikollege-30s.jpg'
/** Das Standbild zeigt den Zeitstrahl, wenn alle Meilensteine stehen */
const BILD_BEI = 15.6

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

const werte = filmDaten(JSON.parse(readFileSync('data/projektstand.json', 'utf8')))
rmSync(PROJEKT, { recursive: true, force: true })
for (const [pfad, inhalt] of Object.entries(kompositionen(werte))) {
  mkdirSync(dirname(join(PROJEKT, pfad)), { recursive: true })
  writeFileSync(join(PROJEKT, pfad), inhalt)
}
mkdirSync(join(PROJEKT, 'assets', 'fonts'), { recursive: true })
copyFileSync('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', join(PROJEKT, 'assets', 'fonts', 'inter.woff2'))
copyFileSync('node_modules/gsap/dist/gsap.min.js', join(PROJEKT, 'assets', 'gsap.min.js'))
console.log(`Projekt geschrieben: ${PROJEKT}, Stand ${werte.stand}`)
if (process.argv.includes('--nur-projekt')) process.exit(0)

lauf('npx', ['--yes', HYPERFRAMES, 'check', PROJEKT])
lauf('npx', ['--yes', HYPERFRAMES, 'render', PROJEKT, '-o', `film/${DATEI}`, '--crf', '26', '--quiet'])
lauf('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(BILD_BEI), '-i', `film/${DATEI}`, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', `film/${BILD}`])

const stand = {
  stand: werte.stand,
  fingerabdruck: fingerabdruck(werte),
  datei: DATEI,
  bild: BILD,
  bytes: statSync(`film/${DATEI}`).size,
  sekunden: DAUER,
  breite: BREITE,
  hoehe: HOEHE,
  hyperframes: HYPERFRAMES,
}
writeFileSync('film/stand.json', `${JSON.stringify(stand, null, 2)}\n`)
console.log(`Film gerendert: film/${DATEI}, ${(stand.bytes / 1e6).toFixed(1)} MB, Fingerabdruck ${stand.fingerabdruck}`)
