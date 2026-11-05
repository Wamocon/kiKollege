#!/usr/bin/env node
/**
 * Rendert den Film „kiKollege in 30 Sekunden“ neu, mit Stimme.
 *
 *   npm run baue:film                    Stimme messen, Projekt schreiben, prüfen, rendern
 *   npm run baue:film -- --nur-projekt   nur film/projekt/ schreiben, zum Anschauen
 *
 * Spricht die Sätze lokal mit Piper (scripts/stimme.mjs), misst ihre Längen und
 * schreibt daraus die Kompositionen, die Tonspur und die Untertitel nach film/projekt/
 * (nicht versioniert). Prüft mit HyperFrames, rendert film/kikollege-30s.mp4, zieht
 * das Standbild und hält in film/stand.json fest, aus welchem Stand der Daten der Film
 * ist. Braucht Piper und ffmpeg; HyperFrames kommt über npx in fester Version und läuft
 * ohne Telemetrie. Gerendert wird von Hand, nicht in der CI. Der fertige Film geht
 * zuerst an den Projektverantwortlichen; erst nach seinem Okay kommen Film, Standbild,
 * Untertitel und stand.json in einen Commit.
 */

import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { BREITE, HOEHE, SOLL, TOLERANZ, filmDaten, fingerabdruck, kompositionen, laengePasst, zeitplan } from './film-daten.mjs'
import { messeZeilen, sprachspur, webvtt, woerterVon } from './stimme.mjs'

export const HYPERFRAMES = 'hyperframes@0.8.217'
const PROJEKT = 'film/projekt'
const DATEI = 'kikollege-30s.mp4'
const BILD = 'kikollege-30s.jpg'
const UNTERTITEL = 'kikollege-30s.vtt'
const CRF = '28'

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

let zeiten
try {
  zeiten = await messeZeilen(werte.stimme)
} catch (e) {
  console.error(`Abgebrochen: ${e.message}`)
  process.exit(1)
}
const plan = zeitplan(werte, zeiten)
console.log(`Stimme gemessen: Der Film dauert ${plan.dauer} s, die letzte Silbe fällt bei ${plan.szenen.schluss.stimmeEnde} s.`)
if (!laengePasst(plan)) {
  console.error(`Abgebrochen: ${plan.dauer} s liegen mehr als ${TOLERANZ} s neben den ${SOLL} s des Titels. Text kürzen, nicht hetzen.`)
  process.exit(1)
}

rmSync(PROJEKT, { recursive: true, force: true })
for (const [pfad, inhalt] of Object.entries(kompositionen(werte, plan))) {
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
    if (p.woerter.length !== woerterVon(z).length) throw new Error(`Wörter und Zeiten passen nicht: ${z.id}`)
    return { zeile: z, start: p.start, wortZeit: p.woerter.map((t) => t - p.start), dauer: p.dauer }
  }),
)
writeFileSync(join(PROJEKT, UNTERTITEL), vtt)
writeFileSync(join(PROJEKT, 'zeitplan.json'), `${JSON.stringify(plan, null, 2)}\n`)
console.log(`Projekt geschrieben: ${PROJEKT}, Stand ${werte.stand}`)
if (process.argv.includes('--nur-projekt')) process.exit(0)

lauf('npx', ['--yes', HYPERFRAMES, 'check', PROJEKT])
lauf('npx', ['--yes', HYPERFRAMES, 'render', PROJEKT, '-o', `film/${DATEI}`, '--crf', CRF, '--quiet'])
writeFileSync(`film/${UNTERTITEL}`, vtt)
// Das Standbild zeigt den Zeitstrahl, wenn alle Meilensteine stehen
const bildBei = plan.szenen.zeitstrahl.ende - 0.1
lauf('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(bildBei), '-i', `film/${DATEI}`, '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', `film/${BILD}`])

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
writeFileSync('film/stand.json', `${JSON.stringify(stand, null, 2)}\n`)
console.log(`Film gerendert: film/${DATEI}, ${plan.dauer} s, ${(stand.bytes / 1e6).toFixed(1)} MB, Fingerabdruck ${stand.fingerabdruck}`)
