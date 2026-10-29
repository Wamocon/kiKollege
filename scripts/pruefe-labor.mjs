#!/usr/bin/env node
/**
 * Prueft, dass im Labor nichts verloren geht.
 *
 *   npm run build && npm run pruefe:labor
 *
 * Seit dem 29.10.2026 baut das Labor (/labor/) die Landing Page als
 * Produktseite neu. Der Projektverantwortliche hat verlangt, dass dabei keine
 * Information wegfaellt: Was heute auf der Landing Page steht und was von
 * /stand/ in die Einzelheiten wandert, muss im Labor stehen. Nur das Archiv
 * bleibt auf /stand/.
 *
 * Verglichen wird der sichtbare Text Stueck fuer Stueck, so wie React ihn
 * ausgibt. Nicht verglichen werden die Nummern und Titel der alten Abschnitte
 * selbst, denn die Gliederung ist das, was sich aendert.
 */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Diese Abschnitte von /stand/ bleiben im Archiv und muessen nicht ins Labor. */
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

/** Was in alt steht und in neu fehlt. */
export function fehlende(alt, neu) {
  const vorhanden = stuecke(neu)
  return [...stuecke(alt)].filter((t) => !vorhanden.has(t))
}

export async function pruefen({ ausgabe, log = console.log }) {
  const lies = (p) => readFile(join(ausgabe, p), 'utf8')
  if (!existsSync(join(ausgabe, 'labor', 'index.html'))) {
    log('Kein Labor gebaut, nichts zu pruefen.')
    return []
  }
  const labor = hauptteil(await lies('labor/index.html'))
  const alt = hauptteil(await lies('index.html')) + ohneArchiv(hauptteil(await lies('stand/index.html')))
  const fehlt = fehlende(alt, labor)
  log(`Verglichen: ${stuecke(alt).size} Textstuecke der Landing Page und von /stand/ ohne Archiv.`)
  if (fehlt.length) {
    log(`Im Labor fehlen ${fehlt.length}:`)
    for (const t of fehlt.slice(0, 40)) log(`  - ${t.slice(0, 140)}`)
  } else {
    log('Nichts verloren.')
  }
  return fehlt
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const fehlt = await pruefen({ ausgabe: 'out' })
  process.exit(fehlt.length ? 1 : 0)
}
