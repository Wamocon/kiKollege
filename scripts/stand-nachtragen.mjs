#!/usr/bin/env node
/**
 * Ein ganzer Durchgang: Vault lesen, data/projektstand.json fortschreiben,
 * pruefen und als Pull Request stellen.
 *
 *   npm run stand:nachtragen -- --vault "D:\WAMOCON\KFBM" --ablage "D:\WAMOCON"
 *   npm run stand:nachtragen -- --probelauf
 *
 * Harnessneutral: Das Skript kennt kein Windows und keine Sitzung, es ruft nur
 * git, node und die GitHub-CLI. Damit laeuft derselbe Durchgang in der
 * Aufgabenplanung, auf dem Rechner mit der Ablage und als Auftrag eines
 * KI-Mitarbeiters. Der Weg nach draussen bleibt schmal: Es aendert genau eine
 * Datei, pusht nur auf einen eigenen Zweig und fuehrt nichts zusammen.
 *
 * Endet mit 0, wenn nichts zu tun war oder ein Pull Request steht, sonst mit 1.
 */

import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { heute as heuteOrtszeit } from './heute.mjs'

export const DATEI = 'data/projektstand.json'

/** Fuehrt einen Befehl aus. Keine Shell: Pfade mit Leerzeichen bleiben heil. */
export function wirklichLaufen(befehl, args, { wurzel }) {
  const e = spawnSync(befehl, args, { cwd: wurzel, encoding: 'utf8' })
  if (e.error) return { status: 127, aus: String(e.error.message) }
  return { status: e.status ?? 1, aus: `${e.stdout ?? ''}${e.stderr ?? ''}`.trimEnd() }
}

const KOERPER =
  'Aus dem Vault fortgeschrieben von scripts/stand-nachtragen.mjs. Geändert ist nur ' +
  'data/projektstand.json. Geprüft vor dem Stellen: pruefe:bestand gegen main, pruefe:daten und ' +
  'npm test, alle ohne Fund. Was die Seite daraus macht, prüft die CI. Zusammenführen bleibt bei ' +
  'einem Menschen.'

/**
 * @returns {Promise<{ende: 'abgebrochen'|'nichts'|'probelauf'|'gestellt', satz: string, zweig?: string}>}
 */
export async function nachtragen({
  wurzel = process.cwd(),
  vault,
  ablage,
  heute = heuteOrtszeit(),
  probelauf = false,
  ohnePr = false,
  pruefer = 'erwinmoretz',
  lauf = wirklichLaufen,
  schreibe = writeFileSync,
  log = console.log,
}) {
  const fuehre = (befehl, ...args) => lauf(befehl, args, { wurzel })
  const knapp = (t) => (t ? t.split('\n').slice(-12).join('\n') : '')
  const ende = (art, satz) => {
    log(satz)
    return { ende: art, satz }
  }
  const verwerfen = () => fuehre('git', 'checkout', '--', DATEI)
  const abbruch = (satz, ausgabe) => {
    if (ausgabe) log(knapp(ausgabe))
    return ende('abgebrochen', satz)
  }

  // Nichts anfassen, was jemand anders angefangen hat
  const sauber = fuehre('git', 'status', '--porcelain')
  if (sauber.status !== 0) return abbruch('Git antwortet nicht. Nichts getan.', sauber.aus)
  if (sauber.aus.trim()) return abbruch('Das Arbeitsverzeichnis ist nicht sauber. Nichts getan.')

  const zweigJetzt = fuehre('git', 'rev-parse', '--abbrev-ref', 'HEAD')
  if (zweigJetzt.aus.trim() !== 'main') {
    return abbruch(`Das Arbeitsverzeichnis steht auf ${zweigJetzt.aus.trim()}, nicht auf main. Nichts getan.`)
  }

  const ziehen = fuehre('git', 'pull', '--ff-only')
  if (ziehen.status !== 0) return abbruch('main lässt sich nicht fortschreiben. Nichts getan.', ziehen.aus)

  // Aus dem Vault lesen
  const export_ = fuehre('node', 'scripts/export-vault.mjs', '--vault', vault)
  log(knapp(export_.aus))
  if (export_.status !== 0) {
    verwerfen()
    return abbruch('Der Export ist fehlgeschlagen. Nichts geändert.')
  }
  const abbild = fuehre('node', 'scripts/abbild-vault.mjs', '--vault', ablage)
  log(knapp(abbild.aus))
  if (abbild.status !== 0) {
    verwerfen()
    return abbruch('Das Abbild der Ablage ist fehlgeschlagen. Nichts gestellt.')
  }

  // Sagt nur, ob jemand nachtragen muss, und hält den Durchgang nicht auf
  const aktuell = fuehre('node', 'scripts/pruefe-aktualitaet.mjs', '--ablage', ablage, '--heute', heute)
  log(knapp(aktuell.aus))

  const geaendert = fuehre('git', 'diff', '--quiet', '--', DATEI)
  if (geaendert.status === 0) return ende('nichts', 'Kein neuer Stand, nichts zu tun.')

  // Ändern ist erlaubt, entfernen nicht
  const alt = join(tmpdir(), 'projektstand-vorher.json')
  const vorher = fuehre('git', 'show', `HEAD:${DATEI}`)
  if (vorher.status !== 0) {
    verwerfen()
    return abbruch('Der bisherige Stand lässt sich nicht lesen. Nichts gestellt.', vorher.aus)
  }
  schreibe(alt, `${vorher.aus}\n`, 'utf8')

  for (const [satz, befehl, args] of [
    ['Der neue Stand verliert Einträge. Nichts gestellt.', 'node', ['scripts/pruefe-bestand.mjs', '--alt', alt]],
    ['Der neue Stand enthält heikle Angaben. Nichts gestellt.', 'node', ['scripts/pruefe-daten.mjs']],
    ['Die Tests schlagen an. Nichts gestellt.', 'node', ['--test', 'scripts/*.test.mjs', 'lib/*.test.mjs']],
  ]) {
    const e = fuehre(befehl, ...args)
    if (e.status !== 0) {
      verwerfen()
      return abbruch(satz, e.aus)
    }
  }

  if (probelauf) {
    verwerfen()
    return ende('probelauf', 'Probelauf: Es gäbe einen neuen Stand. Nichts geschrieben.')
  }

  // Ein eigener Zweig, niemals main
  const zweig = `stand/${heute}`
  const kennt = fuehre('git', 'rev-parse', '--verify', zweig)
  const wechsel =
    kennt.status === 0 ? fuehre('git', 'switch', zweig) : fuehre('git', 'switch', '-c', zweig)
  if (wechsel.status !== 0) {
    verwerfen()
    return abbruch(`Der Zweig ${zweig} lässt sich nicht anlegen. Nichts gestellt.`, wechsel.aus)
  }

  const zurueck = () => fuehre('git', 'checkout', 'main')
  fuehre('git', 'add', DATEI)
  const commit = fuehre('git', 'commit', '-m', `Stand vom ${heute} aus dem Vault`)
  if (commit.status !== 0) {
    zurueck()
    return abbruch('Der Commit ist fehlgeschlagen.', commit.aus)
  }

  const push = fuehre('git', 'push', '-u', 'origin', zweig)
  if (push.status !== 0) {
    zurueck()
    return abbruch(`Der Push ist fehlgeschlagen. Der Zweig ${zweig} liegt lokal bereit.`, push.aus)
  }

  if (ohnePr) {
    zurueck()
    return ende('gestellt', `Zweig ${zweig} gepusht, kein Pull Request angelegt.`)
  }

  const steht = fuehre('gh', 'pr', 'view', zweig)
  if (steht.status === 0) {
    zurueck()
    return { ...ende('gestellt', 'Der Pull Request besteht schon, der neue Stand hängt daran.'), zweig }
  }
  const pr = fuehre(
    'gh', 'pr', 'create', '--base', 'main', '--head', zweig,
    '--title', `Stand vom ${heute}`, '--body', KOERPER,
  )
  if (pr.status !== 0) {
    zurueck()
    return abbruch(`Der Pull Request ließ sich nicht anlegen. Der Zweig ${zweig} ist gepusht.`, pr.aus)
  }
  log(pr.aus)
  // Ohne Prüfer geht es auch, deshalb hält ein Fehler den Durchgang nicht auf
  fuehre('gh', 'pr', 'edit', zweig, '--add-reviewer', pruefer)
  zurueck()
  return { ...ende('gestellt', `Stand vom ${heute} gestellt. Zusammenführen bleibt bei einem Menschen.`), zweig }
}

function argument(name, ersatz = null) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : ersatz
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())

if (direktAufgerufen) {
  const ergebnis = await nachtragen({
    wurzel: resolve(argument('wurzel', '.')),
    vault: argument('vault', process.env.VAULT ?? 'D:\\WAMOCON\\KFBM'),
    ablage: argument('ablage', process.env.ABLAGE ?? 'D:\\WAMOCON'),
    heute: argument('heute', heuteOrtszeit()),
    probelauf: process.argv.includes('--probelauf'),
    ohnePr: process.argv.includes('--ohne-pr'),
    pruefer: argument('pruefer', 'erwinmoretz'),
  })
  process.exitCode = ergebnis.ende === 'abgebrochen' ? 1 : 0
}
