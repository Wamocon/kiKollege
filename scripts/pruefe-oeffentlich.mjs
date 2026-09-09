#!/usr/bin/env node
/**
 * Prueft eine oeffentliche Ausgabe darauf, dass nichts als intern Markiertes
 * darin steht.
 *
 *   FREIGABE=oeffentlich npm run build && npm run pruefe:oeffentlich
 *
 * Die Liste der verbotenen Saetze wird nicht gepflegt, sondern aus
 * data/projektstand.json abgeleitet: jedes Objekt mit freigabe "intern" liefert
 * seine Textwerte. Wer ein Datenelement neu auf intern setzt, ist damit ohne
 * weiteres Zutun mit abgedeckt.
 */

import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

/** Kurze Werte taugen nicht als Beleg: "intern", "ja", ein Datum oder eine Zahl
 *  stehen auch in oeffentlichen Saetzen. Erst ab dieser Laenge ist ein Treffer
 *  aussagekraeftig. */
const MINDESTLAENGE = 24

const NICHT_PRUEFEN = new Set(['freigabe', 'id', 'datei', 'gruppe', 'ort'])

export function interneTexte(knoten, geerbt = false, treffer = new Set()) {
  if (Array.isArray(knoten)) {
    for (const eintrag of knoten) interneTexte(eintrag, geerbt, treffer)
    return treffer
  }
  if (!knoten || typeof knoten !== 'object') return treffer

  const intern = geerbt || knoten.freigabe === 'intern'
  for (const [schluessel, wert] of Object.entries(knoten)) {
    if (NICHT_PRUEFEN.has(schluessel)) continue
    if (typeof wert === 'string') {
      if (intern && wert.trim().length >= MINDESTLAENGE) treffer.add(wert.trim())
    } else {
      interneTexte(wert, intern, treffer)
    }
  }
  return treffer
}

async function htmlDateien(verzeichnis) {
  const gefunden = []
  async function lauf(pfad) {
    let eintraege
    try {
      eintraege = await readdir(pfad, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of eintraege) {
      const voll = join(pfad, e.name)
      if (e.isDirectory()) await lauf(voll)
      else if (e.isFile() && e.name.toLowerCase().endsWith('.html')) gefunden.push(voll)
    }
  }
  await lauf(verzeichnis)
  return gefunden.sort()
}

/** HTML entkommt Anfuehrungszeichen und Umlaute nicht, wohl aber & < >. Damit
 *  ein Satz mit Ampersand nicht durchrutscht, wird gleich verglichen. */
function entschaerfen(text) {
  return text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'").replace(/&quot;/g, '"')
}

export async function pruefen({ ausgabe, daten, log = console.log }) {
  const stand = JSON.parse(await readFile(daten, 'utf8'))
  const verboten = [...interneTexte(stand)]
  const dateien = await htmlDateien(ausgabe)
  if (!dateien.length) throw new Error(`Keine HTML-Dateien unter ${ausgabe}. Erst bauen.`)

  const funde = []
  for (const datei of dateien) {
    const inhalt = entschaerfen(await readFile(datei, 'utf8'))
    for (const satz of verboten) {
      if (inhalt.includes(satz)) funde.push({ datei, satz })
    }
  }

  log(`Geprüft: ${dateien.length} Seiten gegen ${verboten.length} interne Texte.`)
  return funde
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())
if (direktAufgerufen) {
  const ausgabe = resolve(process.argv.includes('--ausgabe')
    ? process.argv[process.argv.indexOf('--ausgabe') + 1]
    : 'out')
  const daten = resolve('data/projektstand.json')
  const funde = await pruefen({ ausgabe, daten })
  if (funde.length) {
    console.error(`\nInterner Inhalt in der öffentlichen Ausgabe: ${funde.length} Stellen\n`)
    for (const f of funde.slice(0, 20)) {
      console.error(`  ${f.datei}\n    ${f.satz.slice(0, 120)}`)
    }
    process.exit(1)
  }
  console.log('Nichts Internes gefunden.')
}
