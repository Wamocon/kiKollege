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
 *
 * Geprueft wird alles, was ausgeliefert wird und Text traegt: die HTML-Seiten,
 * die RSC-Dateien daneben und das JavaScript. Eine Client-Komponente, die den
 * Datensatz selbst importiert, schreibt ihn vollstaendig ins JavaScript, auch
 * das Interne, und im HTML sieht man davon nichts.
 */

import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

/** Kurze Werte taugen nicht als Beleg: "intern", "ja", ein Datum oder eine Zahl
 *  stehen auch in oeffentlichen Saetzen. Erst ab dieser Laenge ist ein Treffer
 *  aussagekraeftig. */
const MINDESTLAENGE = 24

const NICHT_PRUEFEN = new Set(['freigabe', 'id', 'datei', 'gruppe', 'ort'])

/** Eigennamen, die in der oeffentlichen Fassung nichts zu suchen haben, egal in
 *  welchem Datenfeld sie auftauchen: Hersteller, Produkte, Laufzeiten, Pfade.
 *  Die Seite spricht nach aussen von der Werkbank und vom KI-Rechner. Wer einen
 *  dieser Namen oeffentlich zeigen will, entscheidet das und streicht ihn hier.
 *
 *  Gestrichen am 17.09.2026, entschieden von Erwin Moretz: Claude, Hermes, DGX
 *  und Spark. Die Systemlandschaft nennt Claude Code, Hermes Agent und DGX
 *  Spark auch oeffentlich. Das Modell, der Anbieter dahinter, der Messenger,
 *  die Ablagesoftware und Pfade bleiben intern. */
export const NUR_INTERN = [
  'Qwen',
  'Anthropic',
  'Telegram',
  'Obsidian',
  'KFBM',
  'D:\\',
]

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

const AUSGELIEFERT = ['.html', '.txt', '.js']

async function ausgelieferteDateien(verzeichnis) {
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
      else if (e.isFile() && AUSGELIEFERT.some((x) => e.name.toLowerCase().endsWith(x))) gefunden.push(voll)
    }
  }
  await lauf(verzeichnis)
  return gefunden.sort()
}

/** HTML entkommt Anfuehrungszeichen und Umlaute nicht, wohl aber & < >. Damit
 *  ein Satz mit Ampersand nicht durchrutscht, wird gleich verglichen. Im
 *  JavaScript koennen Zeichen als Unicode-Escape stehen; auch die werden
 *  aufgeloest. */
function entschaerfen(text) {
  return text
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;/g, "'").replace(/&quot;/g, '"')
}

export async function pruefen({ ausgabe, daten, log = console.log }) {
  const stand = JSON.parse(await readFile(daten, 'utf8'))
  const verboten = [...interneTexte(stand)]
  const dateien = await ausgelieferteDateien(ausgabe)
  if (!dateien.some((d) => d.toLowerCase().endsWith('.html'))) {
    throw new Error(`Keine HTML-Dateien unter ${ausgabe}. Erst bauen.`)
  }

  const funde = []
  for (const datei of dateien) {
    const inhalt = entschaerfen(await readFile(datei, 'utf8'))
    for (const satz of verboten) {
      if (inhalt.includes(satz)) funde.push({ datei, satz })
    }
    for (const name of NUR_INTERN) {
      if (inhalt.includes(name)) funde.push({ datei, satz: `Eigenname: ${name}` })
    }
  }

  log(
    `Geprüft: ${dateien.length} ausgelieferte Dateien gegen ${verboten.length} interne Texte ` +
      `und ${NUR_INTERN.length} Eigennamen.`,
  )
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
