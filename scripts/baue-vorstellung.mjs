#!/usr/bin/env node
/**
 * Rendert den Film „Ein Tag mit der Mannschaft“ neu, mit Stimmen.
 *
 *   npm run baue:vorstellung                    Stimmen messen, Projekt schreiben, prüfen, rendern
 *   npm run baue:vorstellung -- --nur-projekt   nur das Projekt im Temp-Ordner schreiben
 *
 * Wie scripts/baue-film.mjs: von Hand gerendert, nicht in der CI. Die Länge des Films
 * kommt aus den Sprachdateien. Der fertige Film geht zuerst als Datei an den
 * Projektverantwortlichen in den Chat; erst nach seinem Okay kommen Film, Standbild,
 * Untertitel und stand.json in einen Commit.
 */

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { figurenAlsSvg } from './figuren-svg.mjs'
import { messeZeilen, sprachspur, webvtt } from './stimme.mjs'
import { BREITE, HOECHSTENS, HOEHE, fingerabdruck, kompositionen, vorstellungDaten, zeitplan } from './vorstellung-daten.mjs'

const HYPERFRAMES = 'hyperframes@0.8.217'
const ORDNER = 'film/vorstellung'
/** Im Temp-Ordner, weil lange Pfade unter Windows sonst das Rendern abbrechen */
const PROJEKT = join(tmpdir(), 'kikollege-vorstellung')
const DATEI = 'kikollege-mannschaft.mp4'
const BILD = 'kikollege-mannschaft.jpg'
const UNTERTITEL = 'kikollege-mannschaft.vtt'
const CRF = '29'

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

let zeiten
try {
  zeiten = await messeZeilen(werte.stimme)
} catch (e) {
  console.error(`Abgebrochen: ${e.message}`)
  process.exit(1)
}
const plan = zeitplan(werte, zeiten)
console.log(`Stimmen gemessen: Der Film dauert ${plan.dauer} s.`)
if (plan.dauer >= HOECHSTENS) {
  console.error(`Abgebrochen: ${plan.dauer} s sind nicht unter ${HOECHSTENS} s. Text kürzen, nicht hetzen.`)
  process.exit(1)
}

rmSync(PROJEKT, { recursive: true, force: true })
for (const [pfad, inhalt] of Object.entries(kompositionen(werte, figuren, plan))) {
  mkdirSync(dirname(join(PROJEKT, pfad)), { recursive: true })
  writeFileSync(join(PROJEKT, pfad), inhalt)
}
mkdirSync(join(PROJEKT, 'assets', 'fonts'), { recursive: true })
copyFileSync('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', join(PROJEKT, 'assets', 'fonts', 'inter.woff2'))
copyFileSync('node_modules/gsap/dist/gsap.min.js', join(PROJEKT, 'assets', 'gsap.min.js'))
await sprachspur(zeiten, Object.fromEntries(werte.stimme.map((z) => [z.id, plan.zeilen[z.id].start])), plan.dauer, join(PROJEKT, 'assets', 'stimme.wav'))
const vtt = webvtt(
  werte.stimme.map((z) => {
    const p = plan.zeilen[z.id]
    return { zeile: z, start: p.start, wortZeit: p.woerter.map((t) => t - p.start), dauer: p.dauer }
  }),
)
writeFileSync(join(PROJEKT, UNTERTITEL), vtt)
writeFileSync(join(PROJEKT, 'zeitplan.json'), `${JSON.stringify(plan, null, 2)}\n`)
console.log(`Projekt geschrieben: ${PROJEKT}, Stand ${werte.stand}, ${plan.dauer} s`)
if (process.argv.includes('--nur-projekt')) process.exit(0)

lauf('npx', ['--yes', HYPERFRAMES, 'check', PROJEKT])
lauf('npx', ['--yes', HYPERFRAMES, 'render', PROJEKT, '-o', `film/${DATEI}`, '--crf', CRF, '--quiet'])
writeFileSync(`film/${UNTERTITEL}`, vtt)
// Das Standbild zeigt Gregor Dev mit den Paketen und dem, was noch fehlt
const gregor = werte.stopps.findIndex((s) => s.beispiel.art === 'projekte')
const bildBei = plan.stopps[gregor].weg - 0.1
lauf('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(bildBei), '-i', `film/${DATEI}`, '-frames:v', '1', '-vf', 'scale=1280:-1', '-q:v', '3', `film/${BILD}`])

const stand = {
  stand: werte.stand,
  fingerabdruck: fingerabdruck(werte),
  datei: DATEI,
  bild: BILD,
  untertitel: UNTERTITEL,
  bytes: statSync(`film/${DATEI}`).size,
  sekunden: plan.dauer,
  breite: BREITE,
  hoehe: HOEHE,
  hyperframes: HYPERFRAMES,
}
writeFileSync(`${ORDNER}/stand.json`, `${JSON.stringify(stand, null, 2)}\n`)
console.log(`Film gerendert: film/${DATEI}, ${plan.dauer} s, ${(stand.bytes / 1e6).toFixed(1)} MB, Fingerabdruck ${stand.fingerabdruck}`)
