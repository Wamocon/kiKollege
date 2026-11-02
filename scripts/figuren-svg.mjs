/**
 * Die Zeichnungen der KI-Kollegen als SVG-Text, für Filme außerhalb von Next.js.
 *
 * Die Figuren stehen als React-Komponenten in components/figuren/kollegen/. Dieses
 * Modul übersetzt sie mit TypeScript in einen Ordner unter node_modules/.cache und
 * rendert sie einmal zu Text. So gibt es jede Zeichnung nur einmal, im Code der Seite.
 */

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const QUELLE = 'components/figuren/kollegen'
const ZIEL = 'node_modules/.cache/kollegen-svg'

/** Übersetzt eine Datei; Importe zeigen danach auf die übersetzten Dateien. */
export function uebersetze(text) {
  const js = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  return js
    .replace(/^import\s+['"]\.\/[^'"]+\.css['"];?\s*$/gm, '')
    .replace(/from\s+['"]\.\/([^'"]+)['"]/g, "from './$1.mjs'")
}

/** Je Kennung aus mannschaft.koepfe die Zeichnung bei der Arbeit und den Kopf. */
export async function figurenAlsSvg() {
  rmSync(ZIEL, { recursive: true, force: true })
  mkdirSync(ZIEL, { recursive: true })
  for (const datei of readdirSync(QUELLE)) {
    if (!/\.tsx?$/.test(datei)) continue
    const name = datei.replace(/\.tsx?$/, '.mjs')
    writeFileSync(join(ZIEL, name), uebersetze(readFileSync(join(QUELLE, datei), 'utf8')))
  }
  const { FIGUREN } = await import(pathToFileURL(resolve(ZIEL, 'index.mjs')).href)
  const svg = {}
  for (const [id, f] of Object.entries(FIGUREN)) {
    svg[id] = {
      linie: renderToStaticMarkup(createElement(f.linie)),
      kopf: renderToStaticMarkup(createElement(f.kopf)),
    }
  }
  return svg
}
