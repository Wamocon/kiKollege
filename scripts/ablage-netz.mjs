#!/usr/bin/env node
/**
 * Zeichnet das Netz der Ablage vor, wie es die Graphansicht der Ablage zeigt:
 * jede Notiz ein Punkt, jeder Wikilink eine Linie, gefaerbt nach Bereich.
 * Schreibt nach data/ablage-netz.json.
 *
 *   npm run abbild:netz -- --vault "D:\WAMOCON" --probelauf
 *   npm run abbild:netz -- --vault "D:\WAMOCON"
 *
 * Gelesen wird mit scripts/abbild-vault.mjs: dieselben Notizen, dieselben
 * Bereiche, dieselben Auslassungen, dazu der fremde Quelltext unter _quellen/
 * (siehe AUCH_AUSGELASSEN). Ein Verweis wird aufgeloest wie in der
 * Ablage: ueber den Dateinamen ohne Endung, gross oder klein egal; steht ein
 * Pfad davor, muss er passen. Verweise ins Leere, auf sich selbst und doppelte
 * fallen weg, Hin und Rueck ist eine Linie.
 *
 * Die Lage der Punkte rechnet dieses Skript, nicht die Seite: ein Kraftlayout
 * mit fester Saat. Gleiche Ablage, gleiche Datei.
 *
 * Das Repository ist oeffentlich. In die Datei gehen nur Zahlen: je Punkt Lage,
 * Bereich und Anzahl der Nachbarn, je Linie zwei Nummern. Keine Dateinamen,
 * keine Pfade, keine Titel, keine Inhalte.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { posix, relative, resolve } from 'node:path'

import { BEREICHE, bereichVon, leseFilter, sammleNotizen, verweise } from './abbild-vault.mjs'
import { leseFrontmatter } from './export-vault.mjs'
import { heute as heuteOrtszeit } from './heute.mjs'

/** Seitenlaenge des Felds, in dem die Punkte liegen. */
export const FELD = 1000

/** Ausser dem, was die Ablage selbst aus ihrem Index nimmt. Unter _quellen/
 *  liegt Quelltext fremder Werkzeuge, nur zum Lesen; seine Markdown-Dateien
 *  sind keine Notizen der Ablage und haben keine Wikilinks. Steht der Ordner
 *  einmal in userIgnoreFilters, ist dieser Eintrag ohne Wirkung. */
export const AUCH_AUSGELASSEN = ['_quellen/']

export const QUELLE =
  'Wikilinks zwischen den Notizen der Ablage, gezählt und angeordnet von scripts/ablage-netz.mjs.'

// ---------------------------------------------------------------------------
// Verweise aufloesen

/** Schluessel fuer die Aufloesung: Pfad ohne .md, klein, Schraegstriche, NFC. */
const schluesselVon = (pfad) =>
  pfad.replace(/\\/g, '/').normalize('NFC').replace(/\.md$/i, '').toLowerCase()

/** Code zeigt Verweise nur als Beispiel; die Ablage zaehlt sie nicht. */
export const ohneCode = (text) =>
  text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?(?:^\1[^\n]*$|(?![\s\S]))/gm, '').replace(/`[^`\n]*`/g, '')

/** Verzeichnis der Notizen nach Dateinamen. Bei gleichem Namen steht der
 *  kuerzeste Pfad vorn. */
export function verzeichnis(pfade) {
  const nachName = new Map()
  pfade.forEach((pfad, i) => {
    const schluessel = schluesselVon(pfad)
    const name = schluessel.slice(schluessel.lastIndexOf('/') + 1)
    if (!nachName.has(name)) nachName.set(name, [])
    nachName.get(name).push({ i, schluessel })
  })
  for (const liste of nachName.values()) {
    liste.sort((a, b) => a.schluessel.length - b.schluessel.length || (a.schluessel < b.schluessel ? -1 : 1))
  }
  return nachName
}

/** Nummer der Notiz, auf die ein Verweis zeigt, oder -1. Ohne Pfad gilt der
 *  Dateiname; gibt es ihn mehrfach, die Notiz im selben Ordner, sonst die mit
 *  dem kuerzesten Pfad. Mit Pfad muss der Pfad passen, vom Wurzelordner, vom
 *  eigenen Ordner aus oder als Ende des Pfads. */
export function aufloesen(ziel, quelle, nachName) {
  const z = schluesselVon(ziel.trim()).replace(/^\.?\//, '')
  const name = z.slice(z.lastIndexOf('/') + 1)
  const kandidaten = nachName.get(name)
  if (!kandidaten) return -1
  const ordner = posix.dirname(schluesselVon(quelle))
  if (z.includes('/')) {
    const vonHier = posix.normalize(posix.join(ordner, z))
    const passt =
      kandidaten.find((k) => k.schluessel === z || k.schluessel === vonHier) ??
      kandidaten.find((k) => k.schluessel.endsWith(`/${z}`))
    return passt ? passt.i : -1
  }
  if (kandidaten.length === 1) return kandidaten[0].i
  return (kandidaten.find((k) => posix.dirname(k.schluessel) === ordner) ?? kandidaten[0]).i
}

/** Linien zwischen den Notizen. notizen: [{ pfad, ziele }]. Jede Linie einmal,
 *  als [i, j] mit i < j, aufsteigend sortiert. */
export function verknuepfen(notizen) {
  const nachName = verzeichnis(notizen.map((n) => n.pfad))
  const gesehen = new Set()
  const kanten = []
  const zaehler = { verweise: 0, insLeere: 0, aufSich: 0, doppelt: 0 }
  notizen.forEach((n, i) => {
    for (const ziel of n.ziele) {
      zaehler.verweise += 1
      const j = aufloesen(ziel, n.pfad, nachName)
      if (j === -1) zaehler.insLeere += 1
      else if (j === i) zaehler.aufSich += 1
      else {
        const [a, b] = i < j ? [i, j] : [j, i]
        const paar = a * notizen.length + b
        if (gesehen.has(paar)) zaehler.doppelt += 1
        else {
          gesehen.add(paar)
          kanten.push([a, b])
        }
      }
    }
  })
  kanten.sort((p, q) => p[0] - q[0] || p[1] - q[1])
  return { kanten, ...zaehler }
}

// ---------------------------------------------------------------------------
// Anordnen

/** Zufallszahlen mit fester Saat (mulberry32): gleiche Saat, gleiche Folge. */
export function zufallMitSaat(saat) {
  let a = saat >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Kraefte wie in der Graphansicht (d3-force): Federn zwischen verbundenen
// Punkten, Abstossung zwischen allen, Zug zur Mitte. Dazu ein schwacher Zug
// zum eigenen Bereich, damit die Bereiche als Haufen erkennbar bleiben.
const FEDERLAENGE = 30
const LADUNG = -30
const ZUG_MITTE = 0.02
const ZUG_BEREICH = 0.45
const BEREICH_ABSTAND = 0.7
const REIBUNG = 0.6
const THETA2 = 0.81
const NAEHE2 = 1

/** Abstossung zwischen allen Punkten, genaehert nach Barnes-Hut: ein ferner
 *  Haufen wirkt wie ein Punkt in seinem Schwerpunkt. */
function abstossen(x, y, vx, vy, alpha, wackeln) {
  const m = x.length
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (let k = 0; k < m; k++) {
    if (x[k] < x0) x0 = x[k]
    if (x[k] > x1) x1 = x[k]
    if (y[k] < y0) y0 = y[k]
    if (y[k] > y1) y1 = y[k]
  }
  const seite = Math.max(x1 - x0, y1 - y0, 1) * 1.0001

  // Zellen als flache Felder: Ecke, Seite, Kinder, Punktkette, Masse
  let platz = 4 * m + 16
  let zx = new Float64Array(platz)
  let zy = new Float64Array(platz)
  let zs = new Float64Array(platz)
  let kind = new Int32Array(4 * platz).fill(-1)
  let punkt = new Int32Array(platz).fill(-1)
  let blatt = new Uint8Array(platz)
  const naechster = new Int32Array(m).fill(-1)
  let zellen = 0
  const neueZelle = (cx, cy, s) => {
    if (zellen === platz) {
      const alt = platz
      platz *= 2
      const wachse = (feld, Art, fuell) => {
        const neu = new Art(feld.length * 2)
        if (fuell !== undefined) neu.fill(fuell)
        neu.set(feld)
        return neu
      }
      zx = wachse(zx, Float64Array)
      zy = wachse(zy, Float64Array)
      zs = wachse(zs, Float64Array)
      kind = wachse(kind, Int32Array, -1)
      punkt = wachse(punkt, Int32Array, -1)
      blatt = wachse(blatt, Uint8Array)
      void alt
    }
    zx[zellen] = cx
    zy[zellen] = cy
    zs[zellen] = s
    blatt[zellen] = 1
    return zellen++
  }
  const viertel = (c, px, py) => {
    const h = zs[c] / 2
    return (px >= zx[c] + h ? 1 : 0) + (py >= zy[c] + h ? 2 : 0)
  }
  const kindZelle = (c, q) => {
    if (kind[4 * c + q] === -1) {
      const h = zs[c] / 2
      const neu = neueZelle(zx[c] + (q & 1 ? h : 0), zy[c] + (q & 2 ? h : 0), h)
      kind[4 * c + q] = neu
    }
    return kind[4 * c + q]
  }

  neueZelle(x0, y0, seite)
  for (let i = 0; i < m; i++) {
    let c = 0
    let tiefe = 0
    for (;;) {
      if (blatt[c]) {
        const p = punkt[c]
        if (p === -1) {
          punkt[c] = i
          break
        }
        if ((x[p] === x[i] && y[p] === y[i]) || tiefe > 40) {
          naechster[i] = p
          punkt[c] = i
          break
        }
        // Zelle teilen: die vorhandenen Punkte wandern ins passende Viertel
        blatt[c] = 0
        punkt[c] = -1
        const q = kindZelle(c, viertel(c, x[p], y[p]))
        punkt[q] = p
      }
      c = kindZelle(c, viertel(c, x[i], y[i]))
      tiefe += 1
    }
  }

  // Masse und Schwerpunkt, von den Blaettern zur Wurzel
  const masse = new Float64Array(zellen)
  const sx = new Float64Array(zellen)
  const sy = new Float64Array(zellen)
  for (let c = zellen - 1; c >= 0; c--) {
    if (blatt[c]) {
      for (let p = punkt[c]; p !== -1; p = naechster[p]) {
        masse[c] += 1
        sx[c] += x[p]
        sy[c] += y[p]
      }
    } else {
      for (let q = 0; q < 4; q++) {
        const k = kind[4 * c + q]
        if (k === -1) continue
        masse[c] += masse[k]
        sx[c] += sx[k]
        sy[c] += sy[k]
      }
    }
  }

  const stapel = new Int32Array(zellen + 4)
  for (let i = 0; i < m; i++) {
    let oben = 0
    stapel[oben++] = 0
    while (oben) {
      const c = stapel[--oben]
      const mc = masse[c]
      if (!mc) continue
      let dx = sx[c] / mc - x[i]
      let dy = sy[c] / mc - y[i]
      let l = dx * dx + dy * dy
      if ((zs[c] * zs[c]) / THETA2 < l) {
        if (l < NAEHE2) l = Math.sqrt(NAEHE2 * l)
        const w = (LADUNG * alpha * mc) / l
        vx[i] += dx * w
        vy[i] += dy * w
        continue
      }
      if (!blatt[c]) {
        for (let q = 0; q < 4; q++) if (kind[4 * c + q] !== -1) stapel[oben++] = kind[4 * c + q]
        continue
      }
      for (let p = punkt[c]; p !== -1; p = naechster[p]) {
        if (p === i) continue
        dx = x[p] - x[i]
        dy = y[p] - y[i]
        if (dx === 0) dx = wackeln()
        if (dy === 0) dy = wackeln()
        l = dx * dx + dy * dy
        if (l < NAEHE2) l = Math.sqrt(NAEHE2 * l)
        const w = (LADUNG * alpha) / l
        vx[i] += dx * w
        vy[i] += dy * w
      }
    }
  }
}

/** Lage aller Punkte im Feld, als ganze Zahlen [x, y]. bereich: Bereichsnummer
 *  je Punkt, kanten: Paare von Punktnummern. Verbundene Punkte ordnet ein
 *  Kraftlayout, die uebrigen liegen auf einem Ring am Rand. */
export function anordnen(bereich, kanten, { schritte = 400, saat = 20260909 } = {}) {
  const n = bereich.length
  const zufall = zufallMitSaat(saat)
  const wackeln = () => (zufall() - 0.5) * 1e-6
  const grad = new Int32Array(n)
  for (const [i, j] of kanten) {
    grad[i] += 1
    grad[j] += 1
  }

  const im = []
  for (let i = 0; i < n; i++) if (grad[i] > 0) im.push(i)
  const m = im.length
  const nr = new Int32Array(n).fill(-1)
  im.forEach((i, k) => {
    nr[i] = k
  })

  // Jeder Bereich bekommt einen Abschnitt des Kreises, so breit wie sein
  // Anteil an den verbundenen Punkten, in der Reihenfolge der Bereiche, oben
  // beginnend. Dort beginnt er, und dorthin zieht es ihn.
  const anzahl = new Map()
  for (const i of im) anzahl.set(bereich[i], (anzahl.get(bereich[i]) ?? 0) + 1)
  const abschnitt = new Map()
  let winkel = -Math.PI / 2
  for (const b of [...anzahl.keys()].sort((p, q) => p - q)) {
    const breite = (2 * Math.PI * anzahl.get(b)) / m
    abschnitt.set(b, { anfang: winkel, breite })
    winkel += breite
  }

  const x = new Float64Array(m)
  const y = new Float64Array(m)
  const vx = new Float64Array(m)
  const vy = new Float64Array(m)
  const ax = new Float64Array(m)
  const ay = new Float64Array(m)
  const anfang = 10 * Math.sqrt(m)
  for (let k = 0; k < m; k++) {
    const { anfang: a0, breite } = abschnitt.get(bereich[im[k]])
    const w = a0 + breite * zufall()
    const r = anfang * (0.2 + 0.8 * Math.sqrt(zufall()))
    x[k] = r * Math.cos(w)
    y[k] = r * Math.sin(w)
    const mitte = a0 + breite / 2
    ax[k] = Math.cos(mitte)
    ay[k] = Math.sin(mitte)
  }

  // Federn wie in d3: Staerke nach dem schwaecher verbundenen Ende, der
  // schwaecher verbundene Punkt bewegt sich mehr.
  const fq = new Int32Array(kanten.length)
  const fz = new Int32Array(kanten.length)
  const fs = new Float64Array(kanten.length)
  const fb = new Float64Array(kanten.length)
  kanten.forEach(([i, j], e) => {
    fq[e] = nr[i]
    fz[e] = nr[j]
    fs[e] = 1 / Math.min(grad[i], grad[j])
    fb[e] = grad[i] / (grad[i] + grad[j])
  })
  // Gut verbundene Punkte zieht es staerker zur Mitte, schwaecher zum Bereich
  const gewicht = new Float64Array(m)
  for (let k = 0; k < m; k++) gewicht[k] = Math.log2(1 + grad[im[k]])

  const abkuehlen = 1 - Math.pow(0.001, 1 / Math.max(schritte, 1))
  let alpha = 1
  for (let s = 0; s < schritte; s++) {
    alpha += (0 - alpha) * abkuehlen
    for (let e = 0; e < fq.length; e++) {
      const q = fq[e]
      const z = fz[e]
      let dx = x[z] + vx[z] - x[q] - vx[q] || wackeln()
      let dy = y[z] + vy[z] - y[q] - vy[q] || wackeln()
      let l = Math.sqrt(dx * dx + dy * dy)
      l = ((l - FEDERLAENGE) / l) * alpha * fs[e]
      dx *= l
      dy *= l
      vx[z] -= dx * fb[e]
      vy[z] -= dy * fb[e]
      vx[q] += dx * (1 - fb[e])
      vy[q] += dy * (1 - fb[e])
    }
    if (m > 1) abstossen(x, y, vx, vy, alpha, wackeln)
    let rr = 0
    for (let k = 0; k < m; k++) rr += x[k] * x[k] + y[k] * y[k]
    const radius = Math.sqrt(rr / Math.max(m, 1)) * BEREICH_ABSTAND
    for (let k = 0; k < m; k++) {
      const mitte = ZUG_MITTE * (1 + gewicht[k]) * alpha
      const zum = (ZUG_BEREICH / (1 + gewicht[k])) * alpha
      vx[k] += -x[k] * mitte + (ax[k] * radius - x[k]) * zum
      vy[k] += -y[k] * mitte + (ay[k] * radius - y[k]) * zum
      x[k] += vx[k] *= REIBUNG
      y[k] += vy[k] *= REIBUNG
    }
  }

  // Ins Feld legen: das Netz in die Mitte, der Ring aussen herum
  const halb = FELD / 2
  const ring = m < n
  const innen = ring ? 0.76 * halb : 0.94 * halb
  let mx = 0
  let my = 0
  for (let k = 0; k < m; k++) {
    mx += x[k] / m
    my += y[k] / m
  }
  const abstand = []
  for (let k = 0; k < m; k++) abstand.push(Math.hypot(x[k] - mx, y[k] - my))
  const weit = [...abstand].sort((p, q) => p - q)[Math.floor(0.99 * (m - 1))] || 1
  const lage = new Array(n)
  const runde = (v) => Math.min(FELD, Math.max(0, Math.round(v)))
  for (let k = 0; k < m; k++) {
    // Einzelne Ausreisser weich an den Rand des Netzes holen
    const r = (abstand[k] / weit) * innen
    const rWeich = r <= innen ? r : innen + 0.04 * halb * Math.tanh((r - innen) / (0.04 * halb))
    const f = abstand[k] ? rWeich / abstand[k] : 0
    lage[im[k]] = [runde(halb + (x[k] - mx) * f), runde(halb + (y[k] - my) * f)]
  }

  // Punkte ohne Linie: gleichmaessig auf einem Ring, nach Bereich hintereinander
  const allein = []
  for (let i = 0; i < n; i++) if (!grad[i]) allein.push(i)
  allein.sort((p, q) => bereich[p] - bereich[q] || p - q)
  allein.forEach((i, k) => {
    const w = -Math.PI / 2 + (2 * Math.PI * (k + 0.5 + 0.6 * (zufall() - 0.5))) / allein.length
    const r = halb * (0.86 + 0.1 * zufall())
    lage[i] = [runde(halb + r * Math.cos(w)), runde(halb + r * Math.sin(w))]
  })
  return lage
}

// ---------------------------------------------------------------------------
// Ablage lesen und Datei bauen

/** Liest die Notizen der Ablage: Pfad, Bereich, Verweisziele. */
export async function leseAblage(vault) {
  const filter = [...(await leseFilter(vault)), ...AUCH_AUSGELASSEN]
  const dateien = await sammleNotizen(vault, filter)
  const notizen = []
  for (const datei of dateien) {
    const text = await readFile(datei, 'utf8')
    const { felder } = leseFrontmatter(text)
    const pfad = relative(vault, datei).replace(/\\/g, '/').normalize('NFC')
    notizen.push({ pfad, bereich: bereichVon(pfad, felder.typ), ziele: verweise(ohneCode(text)) })
  }
  return notizen
}

/** Baut das Netz aus den Notizen. Nummeriert die Punkte nach Bereich, darin
 *  die meistverbundenen zuerst; so verraet die Reihenfolge nichts ueber die
 *  Pfade. Liefert die Datei und die Zaehler fuer die Meldung. */
export function netzBauen(notizen, { heute = heuteOrtszeit(), schritte, saat } = {}) {
  const bereichNr = new Map(BEREICHE.map((b, i) => [b.id, i]))
  const { kanten: roh, ...zaehler } = verknuepfen(notizen)
  const grad = new Array(notizen.length).fill(0)
  for (const [i, j] of roh) {
    grad[i] += 1
    grad[j] += 1
  }
  const b = notizen.map((n) => bereichNr.get(n.bereich) ?? bereichNr.get('einstiege'))
  const folge = notizen.map((_, i) => i).sort((p, q) => b[p] - b[q] || grad[q] - grad[p] || p - q)
  const neu = new Array(notizen.length)
  folge.forEach((alt, i) => {
    neu[alt] = i
  })
  const kanten = roh
    .map(([i, j]) => (neu[i] < neu[j] ? [neu[i], neu[j]] : [neu[j], neu[i]]))
    .sort((p, q) => p[0] - q[0] || p[1] - q[1])
  const bereich = folge.map((alt) => b[alt])
  const lage = anordnen(bereich, kanten, { schritte, saat })

  return {
    netz: {
      gezaehltAm: heute,
      bereiche: BEREICHE.map((x) => x.id),
      knoten: folge.map((alt, i) => [lage[i][0], lage[i][1], bereich[i], grad[alt]]),
      kanten,
      quelle: QUELLE,
    },
    zaehler,
  }
}

/** JSON mit einer Zeile je Schluessel; Punkte und Linien in Zeilen zu mehreren,
 *  damit die Datei klein bleibt und trotzdem lesbar. */
export function alsText(netz, jeZeile = 16) {
  const zeilen = (liste) => {
    const teile = []
    for (let i = 0; i < liste.length; i += jeZeile) {
      teile.push(liste.slice(i, i + jeZeile).map((e) => JSON.stringify(e)).join(','))
    }
    return teile.length ? `[\n    ${teile.join(',\n    ')}\n  ]` : '[]'
  }
  return (
    '{\n' +
    Object.entries(netz)
      .map(([k, v]) => `  ${JSON.stringify(k)}: ${k === 'knoten' || k === 'kanten' ? zeilen(v) : JSON.stringify(v)}`)
      .join(',\n') +
    '\n}\n'
  )
}

function argument(name, ersatz = null) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1]
  }
  return ersatz
}

export async function netzAbbilden({ vault, ziel, probelauf = false, heute, log = console.log }) {
  const beginn = performance.now()
  const notizen = await leseAblage(vault)
  const { netz, zaehler } = netzBauen(notizen, { heute })
  const text = alsText(netz)
  const dauer = ((performance.now() - beginn) / 1000).toFixed(1)

  const jeBereich = BEREICHE.map((b, i) => {
    const hier = netz.knoten.filter((k) => k[2] === i)
    return `  ${b.name.padEnd(30)} ${String(hier.length).padStart(4)}   davon ohne Linie ${hier.filter((k) => !k[3]).length}`
  })
  log(
    `Gezählt am ${netz.gezaehltAm}: ${netz.knoten.length} Punkte, ${netz.kanten.length} Linien, ` +
      `${netz.knoten.filter((k) => !k[3]).length} ohne Linie\n` +
      `Verweise ${zaehler.verweise}: ${zaehler.insLeere} ins Leere, ${zaehler.aufSich} auf sich selbst, ` +
      `${zaehler.doppelt} doppelt\n` +
      jeBereich.join('\n') +
      `\nGröße ${(Buffer.byteLength(text) / 1024).toFixed(1)} KB, gerechnet in ${dauer} s`,
  )
  if (probelauf) {
    log('Probelauf, nichts geschrieben.')
    return netz
  }
  await writeFile(ziel, text, 'utf8')
  log(`Geschrieben: ${ziel}`)
  return netz
}

const direktAufgerufen = process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())
if (direktAufgerufen) {
  const vault = argument('vault', process.env.ABLAGE ?? 'D:\\WAMOCON')
  const ziel = resolve(argument('ziel', 'data/ablage-netz.json'))
  const probelauf = process.argv.includes('--probelauf') || process.argv.includes('--dry-run')

  if (!existsSync(vault)) {
    console.error(
      `Ordner nicht gefunden: ${vault}\n` +
        'Pfad mit --vault "D:\\WAMOCON" angeben oder die Umgebungsvariable ABLAGE setzen.',
    )
    process.exit(1)
  }
  await netzAbbilden({ vault, ziel, probelauf })
}
