#!/usr/bin/env node
/**
 * Prueft, dass auf der Startseite nichts verloren geht.
 *
 *   FREIGABE=alles npm run build && npm run pruefe:start
 *
 * Seit dem 05.11.2026 ist die Produktseite die Startseite. Der
 * Projektverantwortliche hat verlangt, dass dabei keine Information wegfaellt:
 * Jeder Abschnitt der frueheren Landing Page hat einen Platz in den Einzelheiten,
 * und was von /stand/ dorthin gehoert, muss auf der Startseite stehen. Nur das
 * Archiv bleibt allein auf /stand/.
 *
 * Verglichen wird der sichtbare Text Stueck fuer Stueck, so wie React ihn
 * ausgibt. Die Abschnitte der Landing Page haben keine eigene Seite mehr, deshalb
 * gilt fuer sie die Kennung: Sie muss auf der Startseite stehen.
 */

import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Diese Abschnitte von /stand/ bleiben im Archiv und muessen nicht auf die Startseite. */
export const ARCHIV = ['entscheidungen', 'chronik', 'offen', 'beobachtungen', 'quellen']

/** Der Bereich zwischen <main> und </main>, ohne Skripte, Stile und Grafiken. */
function hauptteil(html) {
  const m = html.match(/<main\b[\s\S]*<\/main>/)
  return (m ? m[0] : '')
    .replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<p class="lp-index">[\s\S]*?<\/p>/g, ' ')
    .replace(/<p class="eyebrow">[\s\S]*?<\/p>\s*<h2>[\s\S]*?<\/h2>/g, ' ')
}

/** Die Abschnitte von /stand/ ohne die des Archivs. */
export function ohneArchiv(html, archiv = ARCHIV) {
  const teile = html.split(/(?=<section id=")/)
  return teile.filter((t) => {
    const id = t.match(/^<section id="([^"]+)"/)?.[1]
    return !id || !archiv.includes(id)
  }).join('')
}

const entitaeten = (s) =>
  s
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

/** Die Textstuecke zwischen zwei Tags, mit mindestens vier Zeichen. */
export function stuecke(html) {
  const s = new Set()
  for (const m of html.replace(/<!--[\s\S]*?-->/g, '<x>').matchAll(/>([^<]+)</g)) {
    const t = entitaeten(m[1]).replace(/\s+/g, ' ').trim()
    if (t.length >= 4) s.add(t)
  }
  return s
}

/** Überschriften von Blöcken, die die Startseite weglässt, weil ihr Inhalt dort
 *  schon an anderer Stelle steht (Auslassliste DOPPELT in app/page.tsx).
 *  Nur Überschriften, nie Inhalt. */
export const OHNE_UEBERSCHRIFT = [
  'Warum ein Programm',
  'So gehen wir die Risiken an.',
  'Wer ihn anstößt, und was er abgibt',
  'Auswahlregel',
]

/** Was in alt steht und in neu fehlt. */
export function fehlende(alt, neu, ausnahmen = OHNE_UEBERSCHRIFT) {
  const vorhanden = stuecke(neu)
  return [...stuecke(alt)].filter((t) => !vorhanden.has(t) && !ausnahmen.includes(t))
}

/** Grafiken, die mehr als einmal auf der Seite stehen, erkannt an ihrer
 *  Beschriftung für Screenreader. Seit dem 29.10. soll jede Grafik auf der
 *  Produktseite genau einmal vorkommen. */
export function doppelteGrafiken(html) {
  const zahl = new Map()
  for (const m of html.matchAll(/<[^>]*\brole="img"[^>]*>/g)) {
    const label = m[0].match(/aria-label="([^"]+)"/)?.[1]
    if (label) zahl.set(label, (zahl.get(label) ?? 0) + 1)
  }
  return [...zahl].filter(([, n]) => n > 1).map(([label]) => label)
}

/** Die Kennungen der Abschnitte aus lib/lpAbschnitte.ts, die auf der Startseite fehlen. */
export function fehlendeAbschnitte(quelle, html) {
  const ids = [...quelle.matchAll(/\{ id: '([^']+)'[^\n]*\}/g)].map((m) => m[1])
  return ids.filter((id) => !html.includes(`id="${id}"`))
}

export async function pruefen({ ausgabe, abschnitte = 'lib/lpAbschnitte.ts', log = console.log }) {
  const lies = (p) => readFile(join(ausgabe, p), 'utf8')
  if (!existsSync(join(ausgabe, 'index.html'))) {
    log('Keine Seite gebaut, nichts zu pruefen.')
    return []
  }
  const start = hauptteil(await lies('index.html'))
  const alt = ohneArchiv(hauptteil(await lies('stand/index.html')))
  const fehlt = fehlende(alt, start)
  log(`Verglichen: ${stuecke(alt).size} Textstuecke von /stand/ ohne Archiv.`)
  if (fehlt.length) {
    log(`Auf der Startseite fehlen ${fehlt.length}:`)
    for (const t of fehlt.slice(0, 40)) log(`  - ${t.slice(0, 140)}`)
  } else {
    log('Nichts verloren.')
  }
  const ohnePlatz = fehlendeAbschnitte(readFileSync(abschnitte, 'utf8'), start)
  if (ohnePlatz.length) {
    log(`Ohne Platz in den Einzelheiten (EINZELHEITEN in app/page.tsx): ${ohnePlatz.join(', ')}`)
  } else {
    log('Jeder Abschnitt der Landing Page hat seinen Platz.')
  }
  const doppelt = doppelteGrafiken(start)
  if (doppelt.length) {
    log(`Auf der Startseite stehen ${doppelt.length} Grafiken mehrfach:`)
    for (const t of doppelt) log(`  - ${t.slice(0, 140)}`)
  } else {
    log('Jede Grafik steht einmal.')
  }
  return [...fehlt, ...ohnePlatz, ...doppelt]
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const probleme = await pruefen({ ausgabe: 'out' })
  process.exit(probleme.length ? 1 : 0)
}
