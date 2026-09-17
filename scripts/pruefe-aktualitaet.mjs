#!/usr/bin/env node
/**
 * Sagt, ob die Seite hinter der Ablage zurueckliegt.
 *
 *   npm run pruefe:aktualitaet -- --ablage "D:\WAMOCON"
 *
 * Der Export schreibt nur die Pruefläufe fort. Ein neuer Eintrag im Logbuch,
 * ein Tagesprotokoll oder ein neuer Plan kommen erst mit dem Standwaechter
 * oder von Hand auf die Seite. Dieses Skript zaehlt, was in der Ablage juenger
 * ist als der letzte Nachtrag, und sagt, ob die Frist aus herkunft.fristTage
 * ueberschritten ist.
 *
 * Als juenger gilt eine Notiz, deren Dateiname mit einem spaeteren Datum
 * beginnt oder deren Frontmatter in stand, datum oder aktualisiert ein
 * spaeteres Datum traegt. Die Zeit der letzten Aenderung zaehlt nicht: Git
 * setzt sie beim Auschecken neu.
 *
 * Ausgegeben werden nur Ordner und Anzahlen, keine Dateinamen. Endet mit 1,
 * wenn etwas nachzutragen ist, sonst mit 0.
 */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'

import { leseFilter, sammleNotizen } from './abbild-vault.mjs'
import { leseFrontmatter, normDatum } from './export-vault.mjs'

const TAG_MS = 24 * 60 * 60 * 1000
const deutsch = (iso) => iso.split('-').reverse().join('.')
const tage = (von, bis) => Math.round((Date.parse(`${bis}T00:00:00Z`) - Date.parse(`${von}T00:00:00Z`)) / TAG_MS)

/** Das juengste Datum, das eine Notiz von sich angibt. */
export function datumDerNotiz(dateiname, felder) {
  const kandidaten = [
    /^(\d{4}-\d{2}-\d{2})/.exec(dateiname)?.[1],
    normDatum(felder.stand),
    normDatum(felder.datum),
    normDatum(felder.aktualisiert),
  ].filter(Boolean)
  return kandidaten.sort().pop() ?? null
}

export function bewerten({ erzeugt, fristTage, heute, neuere }) {
  const alter = tage(erzeugt, heute)
  return {
    alter,
    ueberFrist: alter > fristTage,
    nachzutragen: neuere > 0 || alter > fristTage,
  }
}

export async function pruefen({ ablage, daten, heute, log = console.log }) {
  const d = JSON.parse(await readFile(daten, 'utf8'))
  const erzeugt = d.herkunft.erzeugt
  const fristTage = d.herkunft.fristTage ?? 7

  const filter = await leseFilter(ablage)
  const notizen = await sammleNotizen(ablage, filter)
  const jeOrdner = new Map()
  for (const datei of notizen) {
    const { felder } = leseFrontmatter(await readFile(datei, 'utf8'))
    const name = datei.split(/[\\/]/).pop()
    const datum = datumDerNotiz(name, felder)
    if (!datum || datum <= erzeugt || datum > heute) continue
    const ordner = relative(ablage, dirname(datei)).split(sep).join('/') || '.'
    jeOrdner.set(ordner, (jeOrdner.get(ordner) ?? 0) + 1)
  }
  const neuere = [...jeOrdner.values()].reduce((s, n) => s + n, 0)
  const ergebnis = bewerten({ erzeugt, fristTage, heute, neuere })

  log(`Nachgetragen am ${deutsch(erzeugt)}, Stand ${deutsch(d.stand)}, Frist ${fristTage} Tage.`)
  log(
    `Heute ${deutsch(heute)}: ${ergebnis.alter} Tage seit dem Nachtrag` +
      (ergebnis.ueberFrist ? ', über der Frist.' : ', in der Frist.'),
  )
  if (!neuere) {
    log(`In der Ablage ist nichts jünger als der Nachtrag (${notizen.length} Notizen gelesen).`)
  } else {
    log(`Jünger als der Nachtrag: ${neuere} von ${notizen.length} Notizen.`)
    for (const [ordner, n] of [...jeOrdner].sort()) log(`  ${ordner}: ${n}`)
  }
  log(ergebnis.nachzutragen ? 'Nachzutragen: ja.' : 'Nachzutragen: nein.')
  return { ...ergebnis, neuere, jeOrdner }
}

function argument(name, ersatz = null) {
  const i = process.argv.indexOf(`--${name}`)
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : ersatz
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())

if (direktAufgerufen) {
  const ablage = argument('ablage', process.env.ABLAGE ?? 'D:\\WAMOCON')
  const daten = resolve(argument('daten', 'data/projektstand.json'))
  // Ortszeit: ein Lauf kurz nach Mitternacht zählt zum neuen Tag
  const jetzt = new Date()
  const ortsdatum = [jetzt.getFullYear(), jetzt.getMonth() + 1, jetzt.getDate()].map((z) => String(z).padStart(2, '0')).join('-')
  const heute = argument('heute', ortsdatum)
  if (!existsSync(ablage)) {
    console.error(`Ablage nicht gefunden: ${ablage}\nPfad mit --ablage angeben oder ABLAGE setzen.`)
    process.exit(1)
  }
  const { nachzutragen } = await pruefen({ ablage, daten, heute })
  process.exitCode = nachzutragen ? 1 : 0
}
