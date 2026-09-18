#!/usr/bin/env node
/**
 * Das heutige Datum in Ortszeit als JJJJ-MM-TT.
 *
 *   node scripts/heute.mjs
 *
 * Eigene Datei, weil cmd kein Datum in dieser Form kennt und Anfuehrungszeichen
 * in einem node -e innerhalb einer for-Schleife nicht heil ankommen. Ortszeit,
 * nicht UTC: Ein Lauf am fruehen Morgen gehoert zum laufenden Tag.
 */

export function heute(jetzt = new Date()) {
  const zwei = (n) => String(n).padStart(2, '0')
  return `${jetzt.getFullYear()}-${zwei(jetzt.getMonth() + 1)}-${zwei(jetzt.getDate())}`
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())

if (direktAufgerufen) process.stdout.write(heute())
