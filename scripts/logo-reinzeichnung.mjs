#!/usr/bin/env node
/**
 * Reinzeichnung des kiKollege-Logos, Variante B4 "Zwei i", Proportion "Kopf gross".
 * Schreibt SVG-Dateien mit Pfaden statt Schrift nach marke/, dazu PNG-Fassungen.
 *
 *   node scripts/logo-reinzeichnung.mjs
 *
 * Das Zeichen: zwei i als Figuren. Links der Mensch mit rundem Kopf, rechts die
 * KI mit eckigem Kopf. Im Schriftzug traegt das i von "ki" denselben eckigen
 * Kopf. Das Zeichen steht auf der Grundlinie, seine Staemme sind x-hoch.
 *
 * Die Schrift ist Inter in Staerke 800 mit -4 % Laufweite, wie im CI-Profil.
 * Die Umrisse kommen aus der variablen Inter von @fontsource-variable; gelesen
 * wird sie mit dem fontkit, das Next.js mitbringt. Der kann variable WOFF2 nur
 * mit zwei Umwegen: Die Abweichungen fuer Staerke 800 werden direkt auf die
 * Punkte angewandt, und eine Luecke bei zusammengesetzten Zeichen, die der
 * Schriftzug nicht braucht, wird fuer die Laufzeit des Skripts ueberbrueckt.
 * Unterschnitten wird nur das Paar "Ko" (-81 Einheiten), im Browser gemessen.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..')
const ziel = join(wurzel, 'marke')

const INK = '#140B0B'
const ROT = '#F40E0E'
const ROT300 = '#FA8686'
const WEISS = '#FFFFFF'
const AUF_INK = '#F3F2F2'

// m = Mensch, k = KI-Stamm, kd = KI-Kopf, t = Schrift, dot = i-Punkt im Schriftzug
const FASSUNGEN = {
  '': { m: INK, k: ROT, kd: ROT, t: INK, dot: ROT, grund: WEISS },
  '-auf-rot': { m: WEISS, k: WEISS, kd: INK, t: WEISS, dot: INK, grund: ROT },
  '-auf-dunkel': { m: AUF_INK, k: ROT300, kd: ROT300, t: AUF_INK, dot: ROT300, grund: INK },
}

/* ---------- Schrift ---------- */

const create = require('next/dist/compiled/@next/font/dist/fontkit').default
const schriftDatei = require.resolve('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')

Object.defineProperty(Object.prototype, '_getPhantomPoints', {
  value: () => [],
  configurable: true,
  writable: true,
})
const font = create(await readFile(schriftDatei))
font.variationCoords = [800]
const abweichung = font._variationProcessor

const UPM = font.unitsPerEm
const EM = (wert) => wert * UPM
const LAUFWEITE = EM(-0.04)
const UNTERSCHNITT = { Ko: -81 }

const glyphen = new Map()
function glyph(zeichen) {
  if (glyphen.has(zeichen)) return glyphen.get(zeichen)
  const g = font.glyphForCodePoint(zeichen.codePointAt(0))
  const roh = g._decode()
  const ttf = Object.getPrototypeOf(Object.getPrototypeOf(g))
  const punkte = roh.points.map((p) => p.copy()).concat(ttf._getPhantomPoints.call(g, roh))
  abweichung.transformPoints(g.id, punkte)
  const eintrag = { punkte: punkte.slice(0, roh.points.length), breite: g.advanceWidth }
  glyphen.set(zeichen, eintrag)
  return eintrag
}
glyph('k') // entpackt die Glyphentabelle, solange die Ueberbrueckung steht
delete Object.prototype._getPhantomPoints

const r = (wert) => Math.round(wert * 10) / 10

/** TrueType-Konturen (quadratisch) als SVG-Pfad, y nach unten gedreht. */
function pfad(punkte, ox, grundlinie) {
  const X = (x) => r(ox + x)
  const Y = (y) => r(grundlinie - y)
  let d = ''
  let kontur = []
  for (const p of punkte) {
    kontur.push(p)
    if (!p.endContour) continue
    const start = kontur.findIndex((q) => q.onCurve)
    const folge =
      start === -1
        ? [{ x: (kontur[0].x + kontur.at(-1).x) / 2, y: (kontur[0].y + kontur.at(-1).y) / 2, onCurve: true }, ...kontur]
        : [...kontur.slice(start), ...kontur.slice(0, start)]
    const n = folge.length
    d += `M${X(folge[0].x)} ${Y(folge[0].y)}`
    let i = 1
    while (i < n) {
      const p1 = folge[i]
      if (p1.onCurve) {
        d += `L${X(p1.x)} ${Y(p1.y)}`
        i += 1
        continue
      }
      const p2 = folge[(i + 1) % n]
      const ende = p2.onCurve ? p2 : { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
      d += `Q${X(p1.x)} ${Y(p1.y)} ${X(ende.x)} ${Y(ende.y)}`
      i += p2.onCurve ? 2 : 1
    }
    d += 'Z'
    kontur = []
  }
  return d
}

/* ---------- Schriftzug ---------- */

const PUNKT = EM(0.26) // eckiger i-Punkt, Proportion "Kopf gross"
const PUNKT_ABSTAND = EM(0.045) // Luecke ueber der x-Hoehe
const PUNKT_RUNDUNG = (PUNKT * 3) / 26 // wie der eckige Kopf im Zeichen: 3 auf 26
const X_HOEHE = font.xHeight

/** Liefert Pfad, i-Punkt und Tintenausdehnung des Schriftzugs ab Ursprung ox. */
function schriftzug(ox, grundlinie) {
  const folge = [...'kıKollege']
  let x = ox
  let d = ''
  let punkt = null
  const box = { links: Infinity, rechts: -Infinity, oben: Infinity, unten: -Infinity }
  folge.forEach((zeichen, i) => {
    const g = glyph(zeichen)
    d += pfad(g.punkte, x, grundlinie)
    for (const p of g.punkte) {
      box.links = Math.min(box.links, x + p.x)
      box.rechts = Math.max(box.rechts, x + p.x)
      box.oben = Math.min(box.oben, grundlinie - p.y)
      box.unten = Math.max(box.unten, grundlinie - p.y)
    }
    if (zeichen === 'ı') {
      const unten = grundlinie - X_HOEHE - PUNKT_ABSTAND
      punkt = { x: x + g.breite / 2 - PUNKT / 2, y: unten - PUNKT }
      box.oben = Math.min(box.oben, punkt.y)
    }
    x += g.breite + LAUFWEITE + (UNTERSCHNITT[zeichen + (folge[i + 1] ?? '')] ?? 0)
  })
  return { d, punkt, box }
}

function schriftzugMarkup(s, c) {
  return (
    `<path d="${s.d}" fill="${c.t}"/>` +
    `<rect x="${r(s.punkt.x)}" y="${r(s.punkt.y)}" width="${r(PUNKT)}" height="${r(PUNKT)}" rx="${r(PUNKT_RUNDUNG)}" fill="${c.dot}"/>`
  )
}

/* ---------- Zeichen ---------- */

// Raster 60 x 64, Staemme 31 hoch. Auf der Grundlinie stehend sind sie x-hoch.
const ZEICHEN_B = 60
const ZEICHEN_H = 64
const ZEICHEN_STAMM = 31

function zeichenMarkup(c) {
  return (
    `<circle cx="14" cy="14" r="14" fill="${c.m}"/>` +
    `<path d="M7 64V40A7 7 0 0 1 21 40V64Z" fill="${c.m}"/>` +
    `<rect x="34" y="1" width="26" height="26" rx="3" fill="${c.kd}"/>` +
    `<path d="M40 64V35A2 2 0 0 1 42 33H52A2 2 0 0 1 54 35V64Z" fill="${c.k}"/>`
  )
}

/* ---------- Dateien ---------- */

function svg(x, y, b, h, inhalt, titel = 'kiKollege') {
  const breite = Math.round(b / 8)
  const hoehe = Math.round(h / 8)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x)} ${r(y)} ${r(b)} ${r(h)}" ` +
    `width="${breite}" height="${hoehe}" role="img" aria-label="${titel}">` +
    `<title>${titel}</title>${inhalt}</svg>\n`
  )
}

function quer(c) {
  const skala = (X_HOEHE / ZEICHEN_STAMM)
  const zeichenH = ZEICHEN_H * skala
  const zeichenB = ZEICHEN_B * skala
  const grundlinie = zeichenH
  const s = schriftzug(zeichenB + EM(0.2), grundlinie)
  const unten = Math.max(grundlinie, s.box.unten)
  return svg(
    0,
    0,
    s.box.rechts,
    unten,
    `<g transform="scale(${r(skala * 1000) / 1000})">${zeichenMarkup(c)}</g>` + schriftzugMarkup(s, c),
  )
}

function gestapelt(c) {
  const skala = EM(1.9) / ZEICHEN_H
  const zeichenB = ZEICHEN_B * skala
  const zeichenH = EM(1.9)
  const probe = schriftzug(0, 0)
  const schriftB = probe.box.rechts - probe.box.links
  const breite = Math.max(zeichenB, schriftB)
  const grundlinie = zeichenH + EM(0.32) + EM(0.864)
  const s = schriftzug((breite - schriftB) / 2 - probe.box.links, grundlinie)
  return svg(
    0,
    0,
    breite,
    s.box.unten,
    `<g transform="translate(${r((breite - zeichenB) / 2)} 0) scale(${r(skala * 1000) / 1000})">${zeichenMarkup(c)}</g>` +
      schriftzugMarkup(s, c),
  )
}

function nurSchriftzug(c) {
  const probe = schriftzug(0, 0)
  const s = schriftzug(-probe.box.links, -probe.box.oben)
  return svg(0, 0, s.box.rechts, s.box.unten, schriftzugMarkup(s, c))
}

function nurZeichen(c) {
  const inhalt = zeichenMarkup(c)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ZEICHEN_B} ${ZEICHEN_H}" width="240" height="256" ` +
    `role="img" aria-label="kiKollege"><title>kiKollege</title>${inhalt}</svg>\n`
  )
}

function appIcon() {
  const c = FASSUNGEN['-auf-rot']
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="512" height="512" role="img" aria-label="kiKollege">` +
    `<title>kiKollege</title><rect width="96" height="96" rx="22" fill="${ROT}"/>` +
    `<g transform="translate(23.625 22) scale(.8125)">${zeichenMarkup(c)}</g></svg>\n`
  )
}

function profilKi() {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="512" height="512" role="img" aria-label="KI-Mitarbeiter">` +
    `<title>KI-Mitarbeiter</title><circle cx="48" cy="48" r="48" fill="${ROT}"/>` +
    `<g transform="translate(10.4 22) scale(.8)">` +
    `<rect x="34" y="1" width="26" height="26" rx="3" fill="${INK}"/>` +
    `<path d="M40 64V35A2 2 0 0 1 42 33H52A2 2 0 0 1 54 35V64Z" fill="${WEISS}"/>` +
    `</g></svg>\n`
  )
}

await mkdir(ziel, { recursive: true })
const dateien = {}
for (const [endung, c] of Object.entries(FASSUNGEN)) {
  dateien[`kikollege-quer${endung}.svg`] = quer(c)
  dateien[`kikollege-gestapelt${endung}.svg`] = gestapelt(c)
  dateien[`kikollege-schriftzug${endung}.svg`] = nurSchriftzug(c)
  dateien[`kikollege-zeichen${endung}.svg`] = nurZeichen(c)
}
dateien['kikollege-app-icon.svg'] = appIcon()
dateien['kikollege-profil-ki.svg'] = profilKi()

for (const [name, inhalt] of Object.entries(dateien)) {
  await writeFile(join(ziel, name), inhalt)
}
console.log(`${Object.keys(dateien).length} SVG-Dateien nach marke/`)

/* ---------- PNG ---------- */

const PNG = [
  ['kikollege-quer.svg', 2400],
  ['kikollege-quer-auf-rot.svg', 2400],
  ['kikollege-quer-auf-dunkel.svg', 2400],
  ['kikollege-gestapelt.svg', 1600],
  ['kikollege-app-icon.svg', 512],
  ['kikollege-profil-ki.svg', 512],
]

const { chromium } = require('playwright-core')
const browser = await chromium.launch()
const seite = await browser.newPage()
for (const [name, breite] of PNG) {
  const inhalt = dateien[name]
  const [, , , b, h] = inhalt.match(/viewBox="([\d.-]+) ([\d.-]+) ([\d.]+) ([\d.]+)"/).map(Number)
  const hoehe = Math.round((breite * h) / b)
  await seite.setViewportSize({ width: breite, height: hoehe })
  await seite.setContent(
    `<html><body style="margin:0;background:transparent">` +
      `<img src="data:image/svg+xml;base64,${Buffer.from(inhalt).toString('base64')}" style="display:block;width:${breite}px;height:${hoehe}px"></body></html>`,
  )
  await seite.screenshot({ path: join(ziel, name.replace('.svg', '.png')), omitBackground: true })
}
await browser.close()
console.log(`${PNG.length} PNG-Dateien nach marke/`)
