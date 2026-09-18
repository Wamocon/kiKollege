#!/usr/bin/env node
/**
 * Prueft die gebaute Seite in einem echten Browser: ob sich Beschriftungen in
 * den Figuren ueberlappen oder aus dem Bild ragen, ob eine Schrift zu klein
 * ist, ob die Seite auf dem Telefon seitlich scrollt und ob ein Skript einen
 * Fehler wirft.
 *
 *   npm run build && npm run pruefe:figuren
 *   BASE_PATH=/kiKollege npm run pruefe:figuren
 *
 * Benutzt den installierten Chrome, sonst Edge, ueber playwright-core; es wird
 * kein Browser heruntergeladen. BROWSER_PFAD zeigt auf einen anderen. Findet
 * sich keiner, endet die Pruefung mit einem Hinweis und ohne Fehler, ausser
 * mit --streng.
 */

import { createServer } from 'node:http'
import { existsSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { extname, join, resolve } from 'node:path'

const SEITEN = ['/', '/stand/', '/impressum/', '/datenschutz/']
const BREITEN = [1280, 375]
/** Eine Glyphe darf den Rand um so viel beruehren; das ist ihr Seitenabstand. */
const TOLERANZ = 1.5
/** Kleiner wird keine Schrift in einer Figur. Die Tageszahlen im Zeitplan
 *  stehen genau auf dieser Grenze. */
const MINDESTSCHRIFT = 10

const ARTEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
}

/** Liefert out/ aus wie GitHub Pages: unter dem basePath, Ordner als index.html. */
export function starteServer(ausgabe, basis) {
  const server = createServer(async (anfrage, antwort) => {
    let pfad = decodeURIComponent(new URL(anfrage.url, 'http://x').pathname)
    if (basis) {
      if (!pfad.startsWith(basis)) {
        antwort.writeHead(404).end()
        return
      }
      pfad = pfad.slice(basis.length) || '/'
    }
    let datei = join(ausgabe, pfad)
    if (!datei.startsWith(ausgabe)) {
      antwort.writeHead(404).end()
      return
    }
    if (existsSync(datei) && statSync(datei).isDirectory()) datei = join(datei, 'index.html')
    if (!existsSync(datei)) {
      antwort.writeHead(404).end()
      return
    }
    antwort.writeHead(200, { 'content-type': ARTEN[extname(datei)] ?? 'application/octet-stream' })
    antwort.end(await readFile(datei))
  })
  return new Promise((fertig) => server.listen(0, '127.0.0.1', () => fertig(server)))
}

/** Laeuft im Browser. Rechnet in den Einheiten der viewBox, also unabhaengig
 *  davon, wie breit die Figur gerade dargestellt wird. */
function vermessen({ toleranz, mindestschrift }) {
  const funde = []
  document.querySelectorAll('main svg[role="img"]').forEach((svg) => {
    const name = (svg.getAttribute('aria-label') || '').slice(0, 40)
    const vb = svg.viewBox.baseVal
    if (!vb || !vb.width) return
    const texte = [...svg.querySelectorAll('text')].map((t) => ({
      text: t.textContent.slice(0, 30),
      box: t.getBBox(),
      schrift: Number(t.getAttribute('font-size')) || null,
    }))
    for (let i = 0; i < texte.length; i++) {
      const a = texte[i]
      if (a.schrift && a.schrift < mindestschrift) funde.push(`${name}: Schrift ${a.schrift} bei „${a.text}“`)
      const b0 = a.box
      if (
        b0.x < vb.x - toleranz || b0.y < vb.y - toleranz ||
        b0.x + b0.width > vb.x + vb.width + toleranz || b0.y + b0.height > vb.y + vb.height + toleranz
      ) {
        funde.push(`${name}: „${a.text}“ ragt aus dem Bild`)
      }
      for (let j = i + 1; j < texte.length; j++) {
        const b1 = texte[j].box
        const x = Math.min(b0.x + b0.width, b1.x + b1.width) - Math.max(b0.x, b1.x)
        const y = Math.min(b0.y + b0.height, b1.y + b1.height) - Math.max(b0.y, b1.y)
        if (x > 1 && y > 1) funde.push(`${name}: „${a.text}“ überdeckt „${texte[j].text}“`)
      }
    }
  })
  return funde
}

export async function browserStarten(streng, log) {
  let chromium
  try {
    ;({ chromium } = await import('playwright-core'))
  } catch {
    log('playwright-core ist nicht installiert.')
    return null
  }
  const versuche = process.env.BROWSER_PFAD
    ? [{ executablePath: process.env.BROWSER_PFAD }]
    : [{ channel: 'chrome' }, { channel: 'msedge' }]
  for (const v of versuche) {
    try {
      return await chromium.launch({ headless: true, ...v })
    } catch {
      // naechster Versuch
    }
  }
  log(`Kein Browser gefunden (${versuche.map((v) => v.channel ?? v.executablePath).join(', ')}).`)
  if (!streng && process.env.GITHUB_ACTIONS) log('::warning::Figurenprüfung übersprungen: kein Browser')
  return null
}

export async function pruefen({ ausgabe, basis = '', seiten = SEITEN, streng = false, log = console.log }) {
  const browser = await browserStarten(streng, log)
  if (!browser) {
    log(streng ? 'Abgebrochen.' : 'Übersprungen.')
    return streng ? 1 : 0
  }
  const server = await starteServer(ausgabe, basis)
  const wurzel = `http://127.0.0.1:${server.address().port}${basis}`
  let anzahl = 0
  try {
    for (const breite of BREITEN) {
      const seite = await browser.newPage({ viewport: { width: breite, height: 900 } })
      const fehler = []
      seite.on('pageerror', (e) => fehler.push(e.message))
      for (const pfad of seiten) {
        fehler.length = 0
        const antwort = await seite.goto(wurzel + pfad, { waitUntil: 'networkidle' })
        const funde = []
        if (!antwort || antwort.status() !== 200) funde.push(`Status ${antwort?.status()}`)
        if (breite === BREITEN[0]) {
          funde.push(...(await seite.evaluate(vermessen, { toleranz: TOLERANZ, mindestschrift: MINDESTSCHRIFT })))
        }
        const zuBreit = await seite.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        if (zuBreit > 1) funde.push(`scrollt seitlich um ${zuBreit} Pixel`)
        funde.push(...fehler.map((f) => `Skriptfehler: ${f}`))
        for (const f of funde) log(`${pfad} bei ${breite} px: ${f}`)
        anzahl += funde.length
      }
      await seite.close()
    }
  } finally {
    await browser.close()
    server.close()
  }
  log(`Geprüft: ${seiten.length} Seiten bei ${BREITEN.join(' und ')} Pixeln.`)
  log(anzahl ? `${anzahl} Fundstellen.` : 'Nichts gefunden.')
  return anzahl
}

const direktAufgerufen =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())

if (direktAufgerufen) {
  const i = process.argv.indexOf('--ausgabe')
  const ausgabe = resolve(i !== -1 ? process.argv[i + 1] : 'out')
  const anzahl = await pruefen({
    ausgabe,
    basis: process.env.BASE_PATH ?? '',
    streng: process.argv.includes('--streng'),
  })
  process.exitCode = anzahl ? 1 : 0
}
