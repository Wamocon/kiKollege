#!/usr/bin/env node
/**
 * Vergleicht zwei Staende von data/projektstand.json und schlaegt an, wenn der
 * neuere weniger enthaelt als der aeltere.
 *
 *   node scripts/pruefe-bestand.mjs --alt <datei> [--neu data/projektstand.json]
 *
 * Aendern darf jeder Lauf, entfernen nicht. Eine Zahl, die sich korrigiert, ist
 * Arbeit; ein Eintrag, der verschwindet, ist Verlust. Was eine neue Quelle nicht
 * mehr nennt, bleibt stehen und bekommt eine Beobachtung; geloescht wird es nur,
 * wenn ein Mensch das entscheidet.
 */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/** Stabile Kennung eines Listeneintrags. Ohne Kennung bleibt nur die Anzahl. */
export function kennung(eintrag) {
  if (eintrag == null || typeof eintrag !== 'object') return null
  for (const feld of ['id', 'nr', 'titel', 'punkt', 'ort', 'name', 'rolle']) {
    if (eintrag[feld] != null) return `${feld}=${eintrag[feld]}`
  }
  if (eintrag.datum != null) {
    const zweites = Object.entries(eintrag).find(
      ([k, v]) => k !== 'datum' && typeof v === 'string',
    )
    return zweites ? `datum=${eintrag.datum}|${zweites[1]}` : `datum=${eintrag.datum}`
  }
  return null
}

/** Alles, was im neuen Stand fehlt. Leere Liste heisst: nichts verloren. */
export function fehlendes(alt, neu, pfad = '') {
  const funde = []

  if (Array.isArray(alt)) {
    if (!Array.isArray(neu)) {
      funde.push({ pfad, art: 'keine Liste mehr' })
      return funde
    }
    if (neu.length < alt.length) {
      funde.push({ pfad, art: 'kürzer', alt: alt.length, neu: neu.length })
    }
    const vorhanden = new Set(neu.map(kennung).filter(Boolean))
    for (const eintrag of alt) {
      const k = kennung(eintrag)
      if (k && !vorhanden.has(k)) funde.push({ pfad: `${pfad}[${k}]`, art: 'entfallen' })
    }
    // Eintraege ohne Kennung koennen nur ueber die Anzahl geprueft werden.
    return funde
  }

  if (alt && typeof alt === 'object') {
    if (!neu || typeof neu !== 'object' || Array.isArray(neu)) {
      funde.push({ pfad, art: 'kein Objekt mehr' })
      return funde
    }
    for (const [schluessel, wert] of Object.entries(alt)) {
      const unter = pfad ? `${pfad}.${schluessel}` : schluessel
      if (!(schluessel in neu)) {
        funde.push({ pfad: unter, art: 'fehlt' })
        continue
      }
      funde.push(...fehlendes(wert, neu[schluessel], unter))
    }
    return funde
  }

  if (typeof alt === 'string' && alt.trim() !== '') {
    if (neu == null || (typeof neu === 'string' && neu.trim() === '')) {
      funde.push({ pfad, art: 'geleert' })
    }
  }
  return funde
}

function argument(name, ersatz = null) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1]
  }
  return ersatz
}

export async function pruefen({ alt, neu, log = console.log }) {
  const a = JSON.parse(await readFile(alt, 'utf8'))
  const b = JSON.parse(await readFile(neu, 'utf8'))
  const funde = fehlendes(a, b)
  log(
    `Verglichen: ${Object.keys(a).length} Schlüssel im alten Stand ` +
      `gegen ${Object.keys(b).length} im neuen.`,
  )
  return funde
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())
if (direktAufgerufen) {
  const alt = argument('alt')
  if (!alt) {
    console.error('Aufruf: node scripts/pruefe-bestand.mjs --alt <datei> [--neu <datei>]')
    process.exit(2)
  }
  const funde = await pruefen({
    alt: resolve(alt),
    neu: resolve(argument('neu', 'data/projektstand.json')),
  })
  if (funde.length) {
    console.error(`\nIm neuen Stand fehlt etwas: ${funde.length} Stellen\n`)
    for (const f of funde.slice(0, 40)) {
      console.error(`  ${f.pfad}: ${f.art}` + (f.alt != null ? ` (${f.alt} → ${f.neu})` : ''))
    }
    console.error(
      '\nÄndern ist erlaubt, entfernen nicht. Was eine neue Quelle nicht mehr nennt,\n' +
        'bleibt stehen und bekommt eine Beobachtung.',
    )
    process.exit(1)
  }
  console.log('Nichts verloren.')
}
