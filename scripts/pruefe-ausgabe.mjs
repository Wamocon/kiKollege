#!/usr/bin/env node
/**
 * Prueft die gebaute Seite auf Fehler, die kein Compiler meldet.
 *
 *   npm run build && npm run pruefe:ausgabe
 *   BASE_PATH=/kiKollege npm run build && BASE_PATH=/kiKollege npm run pruefe:ausgabe
 *
 * Je HTML-Seite unter out/:
 * - Satzzeichen: doppelter Punkt, doppeltes Komma, Leerzeichen davor. Die
 *   entstehen, wenn ein Datensatz mit Punkt endet und der Code noch einen setzt.
 * - Interne Links: Sie tragen den basePath und fuehren auf eine Seite, die es
 *   gibt, und ein Anker auf eine id, die es dort gibt. Am 17.09. fuehrten zwei
 *   Links auf Pages ins Leere, weil der basePath fehlte.
 * - Sprache: <html lang="de">.
 * - Genau eine h1, und keine Ueberschrift ueberspringt eine Ebene.
 * - Jede Grafik hat role="img" und eine Beschriftung oder ist aria-hidden.
 * - Jedes Bild hat ein alt.
 */

import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'

/** Eine Kopie der 404-Seite, die Next.js zusaetzlich ablegt. */
const AUSLASSEN = new Set(['_not-found'])

export async function seitenUnter(ausgabe) {
  const seiten = []
  async function lauf(pfad) {
    for (const e of await readdir(pfad, { withFileTypes: true })) {
      if (AUSLASSEN.has(e.name) || e.name === '_next') continue
      const voll = join(pfad, e.name)
      if (e.isDirectory()) await lauf(voll)
      else if (e.name.endsWith('.html')) seiten.push(voll)
    }
  }
  await lauf(ausgabe)
  return seiten.sort()
}

/** Sichtbarer Text: ohne Skripte, Stile und Kommentare. Inline-Elemente
 *  verschwinden ohne Luecke, alle anderen Tags werden zu einem Leerzeichen,
 *  damit Woerter aus zwei Absaetzen nicht zusammenkleben. */
export function sichtbarerText(html) {
  return html
    .replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?(?:a|b|strong|i|em|span|code|abbr|small|sub|sup)\b[^>]*>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t\r\n]+/g, ' ')
}

const SATZZEICHEN = [
  { name: 'doppelter Punkt', muster: /(?<![.])\.\.(?![.])/g },
  { name: 'doppeltes Komma', muster: /,,/g },
  // "am 17.09., danach" ist richtig, "Stand,." nicht
  { name: 'Komma und Punkt', muster: /,\./g },
  { name: 'Leerzeichen vor Satzzeichen', muster: /\S \s*[.,;:!?](?=\s|$)/g },
]

export function pruefeSatzzeichen(text) {
  const funde = []
  for (const s of SATZZEICHEN) {
    for (const m of text.matchAll(s.muster)) {
      const von = Math.max(0, m.index - 30)
      funde.push(`${s.name}: „…${text.slice(von, m.index + m[0].length + 10).trim()}…“`)
    }
  }
  return funde
}

const attribute = (tag) => {
  const a = {}
  for (const m of tag.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) a[m[1]] = m[2] ?? ''
  return a
}

export function pruefeAufbau(html) {
  const funde = []
  if (!/<html[^>]*\blang="de"/.test(html)) funde.push('<html> ohne lang="de"')

  const ebenen = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]))
  const h1 = ebenen.filter((e) => e === 1).length
  if (h1 !== 1) funde.push(`${h1} h1 statt genau einer`)
  ebenen.forEach((e, i) => {
    if (i > 0 && e > ebenen[i - 1] + 1) funde.push(`Überschrift springt von h${ebenen[i - 1]} auf h${e}`)
  })

  for (const m of html.matchAll(/<svg\b[^>]*>/g)) {
    const a = attribute(m[0])
    if (a['aria-hidden'] === 'true') continue
    if (a.role !== 'img' || !(a['aria-label'] || a['aria-labelledby'])) {
      funde.push(`Grafik ohne role="img" und Beschriftung: ${m[0].slice(0, 60)}`)
    }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!('alt' in attribute(m[0]))) funde.push(`Bild ohne alt: ${m[0].slice(0, 60)}`)
  }
  return funde
}

export const ids = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))

/** Wohin ein interner Link zeigt: die Datei unter out/ und der Anker. */
export function linkZiel(href, basis) {
  const [pfadTeil, anker = null] = href.split('#')
  if (!pfadTeil) return { seite: null, anker }
  if (basis && !(pfadTeil === basis || pfadTeil.startsWith(`${basis}/`))) {
    return { fehler: `ohne basePath ${basis}` }
  }
  const rest = pfadTeil.slice(basis.length).split('?')[0] || '/'
  const datei = rest.endsWith('/') ? `${rest}index.html` : rest
  return { seite: datei.replace(/^\//, ''), anker }
}

export async function pruefen({ ausgabe, basis = '', log = console.log }) {
  const seiten = await seitenUnter(ausgabe)
  const html = new Map()
  for (const s of seiten) html.set(relative(ausgabe, s).split(sep).join('/'), await readFile(s, 'utf8'))

  let anzahl = 0
  for (const [seite, inhalt] of html) {
    const funde = [...pruefeSatzzeichen(sichtbarerText(inhalt)), ...pruefeAufbau(inhalt)]
    const eigene = ids(inhalt)

    for (const m of inhalt.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)) {
      const href = m[1]
      if (/^(https?:|mailto:|tel:)/.test(href)) continue
      const ziel = linkZiel(href, basis)
      if (ziel.fehler) {
        funde.push(`Link ${href} ${ziel.fehler}`)
        continue
      }
      if (ziel.seite === null) {
        if (ziel.anker && !eigene.has(ziel.anker)) funde.push(`Anker #${ziel.anker} fehlt auf der Seite`)
        continue
      }
      const zielHtml = html.get(ziel.seite)
      if (zielHtml == null && !existsSync(join(ausgabe, ziel.seite))) {
        funde.push(`Link ${href} führt ins Leere`)
      } else if (ziel.anker && zielHtml && !ids(zielHtml).has(ziel.anker)) {
        funde.push(`Link ${href}: Anker fehlt auf ${ziel.seite}`)
      }
    }

    for (const f of funde) log(`${seite}: ${f}`)
    anzahl += funde.length
  }

  log(`Geprüft: ${html.size} Seiten${basis ? ` mit basePath ${basis}` : ''}.`)
  log(anzahl ? `${anzahl} Fundstellen.` : 'Nichts gefunden.')
  return anzahl
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())

if (direktAufgerufen) {
  const i = process.argv.indexOf('--ausgabe')
  const ausgabe = resolve(i !== -1 ? process.argv[i + 1] : 'out')
  const anzahl = await pruefen({ ausgabe, basis: process.env.BASE_PATH ?? '' })
  process.exitCode = anzahl ? 1 : 0
}
