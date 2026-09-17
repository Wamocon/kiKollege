#!/usr/bin/env node
/**
 * Prueft das Repository auf Angaben, die in einem oeffentlichen Repository
 * nichts zu suchen haben: Adressen und Namen von Rechnern im Hausnetz, Ports,
 * Schluessel, Tokens, Zugangsdateien und fremde E-Mail-Adressen.
 *
 *   npm run pruefe:daten
 *
 * Das Repository ist oeffentlich. Was in data/projektstand.json steht, liest
 * jeder, egal welche Fassung die Seite zeigt. pruefe:oeffentlich schuetzt nur
 * die gebaute Seite, diese Pruefung schuetzt die Quelle.
 *
 * Die Muster sind absichtlich allgemein. Sie kennen keine echten Adressen oder
 * Namen aus dem Haus, sonst stuende gerade das hier im Klartext.
 */

import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'

export const MUSTER = [
  {
    name: 'IPv4-Adresse',
    muster: /\b(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}\b/g,
  },
  {
    name: 'Rechnername im Hausnetz',
    muster: /\b[\w-]+\.(?:local|lan|internal|intranet|home\.arpa|fritz\.box)\b/gi,
  },
  {
    name: 'Port an einem Rechner',
    muster: /\b[\w-]+\.[\w.-]+:\d{2,5}\b/g,
    // Adressen im Netz mit Schema sind Links, keine Zugangsdaten
    ausser: (treffer, zeile) => /https?:\/\/[^\s]*$/.test(zeile.slice(0, zeile.indexOf(treffer) + 1)),
  },
  {
    name: 'Schlüssel oder Token',
    muster:
      /\b(?:sk-(?:ant-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_\w{30,}|xox[abprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|AIza[\w-]{35})/g,
  },
  { name: 'Privater Schlüssel', muster: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { name: 'Bot-Token', muster: /\b\d{8,10}:[\w-]{35}\b/g },
  {
    name: 'Zugangsdaten als Zuweisung',
    muster: /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|secret|passwor[dt]|kennwort)\s*[:=]\s*["']?[^\s"',;]{8,}/gi,
  },
  {
    name: 'Zugangsdatei',
    muster: /(?:\.ssh[\\/]|\bid_(?:rsa|ed25519)\b|\.kube[\\/]config|\.netrc\b|\.pgpass\b)/g,
  },
  {
    name: 'E-Mail-Adresse',
    muster: /\b[\w.%+-]+@[\w-]+(?:\.[\w-]+)*\.[a-z]{2,}\b/gi,
    ausser: (treffer) => ERLAUBTE_ADRESSEN.has(treffer.toLowerCase()),
  },
]

/** Die Kontaktadressen der Gesellschaften stehen im Impressum und sind gewollt
 *  oeffentlich. Weitere Adressen gehoeren nicht ins Repository. */
const ERLAUBTE_ADRESSEN = new Set(['info@wamocon.com', 'info@test-it-academy.com'])

const WURZELN = ['data', 'app', 'components', 'lib', 'scripts', '.github', '.claude']
const ENDUNGEN = new Set(['.json', '.md', '.ts', '.tsx', '.mjs', '.js', '.yml', '.yaml', '.cmd', '.css', '.txt'])
const AUSLASSEN = new Set(['node_modules', '.next', 'out', '__fixtures__'])

/** Tests enthalten absichtlich falsche Schluessel und Adressen, und diese
 *  Datei enthaelt die Muster selbst. */
const auslassen = (datei) => /\.test\.m?[jt]s$/.test(datei) || datei === 'pruefe-daten.mjs'

export async function dateienUnter(wurzel) {
  const dateien = []
  async function lauf(pfad) {
    let eintraege
    try {
      eintraege = await readdir(pfad, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of eintraege) {
      if (AUSLASSEN.has(e.name)) continue
      const voll = join(pfad, e.name)
      if (e.isDirectory()) await lauf(voll)
      else if (ENDUNGEN.has(extname(e.name)) && !auslassen(e.name)) dateien.push(voll)
    }
  }
  for (const w of WURZELN) await lauf(join(wurzel, w))
  for (const e of await readdir(wurzel, { withFileTypes: true })) {
    if (e.isFile() && extname(e.name) === '.md') dateien.push(join(wurzel, e.name))
  }
  return dateien.sort()
}

/** Zeigt vom Treffer nur den Anfang, damit die Ausgabe im CI-Log das
 *  Gefundene nicht noch einmal veroeffentlicht. */
export function abdecken(treffer) {
  return treffer.length <= 6 ? '…' : `${treffer.slice(0, 4)}…`
}

export function pruefeText(text, datei = '') {
  const funde = []
  text.split(/\r?\n/).forEach((zeile, i) => {
    for (const m of MUSTER) {
      for (const treffer of zeile.matchAll(m.muster)) {
        if (m.ausser?.(treffer[0], zeile)) continue
        funde.push({ datei, zeile: i + 1, muster: m.name, ausschnitt: abdecken(treffer[0]) })
      }
    }
  })
  return funde
}

export async function pruefen({ wurzel, log = console.log }) {
  const dateien = await dateienUnter(wurzel)
  const funde = []
  for (const d of dateien) {
    funde.push(...pruefeText(await readFile(d, 'utf8'), relative(wurzel, d).split(sep).join('/')))
  }
  log(`Geprüft: ${dateien.length} Dateien gegen ${MUSTER.length} Muster.`)
  if (!funde.length) {
    log('Nichts gefunden.')
    return 0
  }
  for (const f of funde) log(`${f.datei}:${f.zeile}  ${f.muster}  ${f.ausschnitt}`)
  log(`${funde.length} Fundstellen. Entfernen oder allgemein umschreiben, dann erneut prüfen.`)
  return funde.length
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())

if (direktAufgerufen) {
  const wurzel = resolve(process.argv.includes('--wurzel')
    ? process.argv[process.argv.indexOf('--wurzel') + 1]
    : '.')
  const anzahl = await pruefen({ wurzel })
  process.exitCode = anzahl ? 1 : 0
}
