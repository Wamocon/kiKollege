#!/usr/bin/env node
/**
 * Liest Kennzahlen, Entscheidungen und offene Punkte aus dem Vault und schreibt
 * sie nach data/projektstand.json.
 *
 *   npm run export:vault -- --vault "D:\WAMOCON\KFBM" --probelauf
 *   npm run export:vault -- --vault "D:\WAMOCON\KFBM"
 *
 * Das Skript ergaenzt nur, was es aus dem Vault ableiten kann, und entfernt
 * nichts. Prosa, Begriffe, Massstab und alles andere von Hand Geschriebene
 * bleibt stehen. Ein bereits gesetztes Feld "freigabe" bleibt erhalten, damit
 * die Grenze zwischen intern und oeffentlich nicht bei jedem Export verloren
 * geht.
 *
 * Zusammengefuehrt wird so:
 * - Prueflaeufe: Die Liste in den Daten ist von Hand kuratiert. Dazu kommen nur
 *   Laeufe, die neuer sind als das Ende des bisherigen Zeitraums und nicht
 *   schon mit demselben Datum und derselben Zahl geprueft dastehen.
 * - Entscheidungen: Neue kommen dazu, bestehende bleiben.
 * - Offene Punkte: Ein Punkt mit bekannter Nummer bekommt den neuen Wortlaut,
 *   seine uebrigen Felder bleiben. Neue Nummern kommen dazu, keine faellt weg.
 * - stand ist das juengere von bisherigem Stand und juengstem Lauf.
 * - herkunft.erzeugt wird nur gesetzt, wenn sich etwas geaendert hat.
 *   Arbeitsordner und Verfahren bleiben, wie sie sind.
 *
 * Der Ordner mit den Laufnotizen wird gesucht, nicht vorausgesetzt: --vault
 * darf auf den Vault oder gleich auf den Notizordner zeigen. Der Probelauf
 * schreibt nichts und meldet, welche Ordner und Dateien gefunden wurden.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, relative, resolve, sep } from 'node:path'

export const ORTE = {
  /** Aus dem Uebergabedokument bekannte Lagen, in dieser Reihenfolge geprueft. */
  ordner: ['00_Vault/10_KI-Mitarbeiter', '00_Vault/KI-Mitarbeiter', 'KI-Mitarbeiter', '10_KI-Mitarbeiter'],
  /** Passt keine, wird bis drei Ebenen tief nach einem so benannten Ordner gesucht. */
  ordnerMuster: /^(\d+[_-])?KI[-_ ]?Mitarbeiter$/i,
  entscheidungen: ['Entscheidungen.md'],
  offenePunkte: ['Offene Punkte.md', 'Offene-Punkte.md', 'Offene_Punkte.md'],
}

async function eintraege(pfad, art) {
  try {
    const gelesen = await readdir(pfad, { withFileTypes: true })
    return gelesen.filter((e) => (art === 'ordner' ? e.isDirectory() : e.isFile())).map((e) => e.name)
  } catch {
    return []
  }
}

/** Windows unterscheidet Gross- und Kleinschreibung nicht, Linux schon. Der
 *  Export soll auf beiden dieselben Ordner finden, also wird Schritt fuer
 *  Schritt verglichen statt der Pfad einfach zusammengesetzt. */
async function loesePfad(wurzel, teile) {
  let pfad = wurzel
  for (const teil of teile) {
    const treffer = (await eintraege(pfad, 'ordner')).find(
      (n) => n.toLowerCase() === teil.toLowerCase(),
    )
    if (!treffer) return null
    pfad = join(pfad, treffer)
  }
  return pfad
}

async function sucheOrdner(wurzel, tiefe) {
  let ebene = [wurzel]
  for (let i = 0; i < tiefe && ebene.length; i++) {
    const naechste = []
    for (const pfad of ebene) {
      for (const name of await eintraege(pfad, 'ordner')) {
        if (name.startsWith('.') || name === 'node_modules') continue
        const voll = join(pfad, name)
        if (ORTE.ordnerMuster.test(name)) return voll
        naechste.push(voll)
      }
    }
    ebene = naechste
  }
  return null
}

/** Sucht den Ordner mit den Laufnotizen: erst die bekannten Lagen, dann der
 *  angegebene Ordner selbst, dann eine Suche in der Breite. So laesst sich
 *  --vault auf den Vault oder gleich auf den Notizordner richten. */
export async function findeNotizordner(vault, tiefe = 3) {
  for (const kandidat of ORTE.ordner) {
    const pfad = await loesePfad(vault, kandidat.split('/'))
    if (pfad) return pfad
  }
  if (ORTE.ordnerMuster.test(basename(vault))) return vault
  const gefunden = await sucheOrdner(vault, tiefe)
  if (gefunden) return gefunden
  const hatNotizen = (await eintraege(vault, 'datei')).some((n) => n.toLowerCase().endsWith('.md'))
  return hatNotizen ? vault : null
}

/** Erste Datei, die einen der Namen traegt, in den Ordnern der Reihe nach. */
export async function findeDatei(namen, ordner) {
  for (const pfad of ordner) {
    if (!pfad) continue
    const vorhanden = await eintraege(pfad, 'datei')
    for (const name of namen) {
      const treffer = vorhanden.find((n) => n.toLowerCase() === name.toLowerCase())
      if (treffer) return join(pfad, treffer)
    }
  }
  return null
}

/** Frontmatter am Dateianfang, begrenzt durch --- Zeilen. Nur flache
 *  Schluessel-Wert-Paare, mehr braucht eine Laufnotiz nicht. */
export function leseFrontmatter(text) {
  const treffer = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!treffer) return { felder: {}, rumpf: text }

  const felder = {}
  for (const zeile of treffer[1].split(/\r?\n/)) {
    if (!zeile.trim() || zeile.trimStart().startsWith('#')) continue
    const doppelpunkt = zeile.indexOf(':')
    if (doppelpunkt < 1) continue
    const schluessel = zeile.slice(0, doppelpunkt).trim()
    let wert = zeile.slice(doppelpunkt + 1).trim()
    if (
      (wert.startsWith('"') && wert.endsWith('"')) ||
      (wert.startsWith("'") && wert.endsWith("'"))
    ) {
      wert = wert.slice(1, -1)
    }
    if (wert === '') felder[schluessel] = null
    else if (/^-?\d+$/.test(wert)) felder[schluessel] = Number(wert)
    else if (/^-?\d+[.,]\d+$/.test(wert)) felder[schluessel] = Number(wert.replace(',', '.'))
    else if (wert === 'true' || wert === 'false') felder[schluessel] = wert === 'true'
    else felder[schluessel] = wert
  }
  return { felder, rumpf: text.slice(treffer[0].length) }
}

/** Akzeptiert 2026-08-27 und 27.08.2026 und liefert immer das ISO-Format. */
export function normDatum(wert) {
  if (wert == null) return null
  const s = String(wert).trim()
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (m) return s
  m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return null
}

const ZAHLFELDER = [
  'geprueft',
  'blocker',
  'major',
  'minor',
  'hinweise',
  'bewertet',
  'enabler',
  'fragen',
  'themenkomplexe',
  'befunde',
  'ohneBefund',
  'bestaetigt',
  'neuGefunden',
]

/** Eine Laufnotiz gilt als Prueflauf, wenn ihr Frontmatter mindestens ein
 *  Ergebnisfeld und eine Standsangabe traegt. Alles andere im Ordner wird
 *  uebergangen, damit Konzeptnotizen nicht als Lauf gezaehlt werden. */
export function alsPrueflauf(felder, dateiname) {
  const stand = normDatum(felder.stand ?? felder.datum)
  const hatErgebnis = [...ZAHLFELDER, 'hinweis'].some((f) => typeof felder[f] === 'number')
  if (!stand || !hatErgebnis) return null

  const lauf = {
    id: String(felder.id ?? dateiname.replace(/\.md$/i, '')),
    datum: stand,
    art: String(felder.art ?? 'mechanisch'),
    gegenstand: String(felder.gegenstand ?? dateiname.replace(/\.md$/i, '')),
  }
  for (const f of ZAHLFELDER) {
    if (typeof felder[f] === 'number') lauf[f] = felder[f]
  }
  // Die Laufnotizen schreiben das Feld in der Einzahl
  if (lauf.hinweise == null && typeof felder.hinweis === 'number') lauf.hinweise = felder.hinweis
  if (felder.laufzeit != null) lauf.laufzeit = String(felder.laufzeit)
  if (felder.notiz != null) lauf.notiz = String(felder.notiz)
  if (felder.freigabe != null) lauf.freigabe = String(felder.freigabe)
  return lauf
}

/** Erste Markdown-Tabelle mit den Spalten Datum und Entscheidung. */
export function leseEntscheidungen(markdown) {
  const zeilen = markdown.split(/\r?\n/)
  const ergebnis = []
  for (const zeile of zeilen) {
    if (!zeile.trim().startsWith('|')) continue
    const zellen = zeile.split('|').slice(1, -1).map((z) => z.trim())
    if (zellen.length < 2) continue
    if (/^:?-{2,}:?$/.test(zellen[0])) continue
    const datum = normDatum(zellen[0])
    if (!datum) continue
    ergebnis.push({ datum, entscheidung: zellen[1] })
  }
  return ergebnis
}

/** Nummerierte Liste. Ein Punkt endet am naechsten Listenpunkt, Fortsetzungs-
 *  zeilen gehoeren dazu. Der erste Satz ist der Punkt, der Rest der Grund. */
export function leseOffenePunkte(markdown) {
  const zeilen = markdown.split(/\r?\n/)
  const roh = []
  for (const zeile of zeilen) {
    const m = /^\s*(\d+)[.)]\s+(.*)$/.exec(zeile)
    if (m) {
      roh.push({ nr: Number(m[1]), text: m[2].trim() })
    } else if (roh.length && /^\s{2,}\S/.test(zeile)) {
      roh[roh.length - 1].text += ' ' + zeile.trim()
    } else if (roh.length && zeile.trim() === '') {
      // Leerzeile beendet die Fortsetzung nicht zwingend, wird ignoriert.
    }
  }
  return roh.map(({ nr, text }) => {
    const punkt = /^(.*?)\.\s+(.*)$/s.exec(text)
    return punkt
      ? { nr, punkt: punkt[1].trim(), grund: punkt[2].trim() }
      : { nr, punkt: text.replace(/\.$/, ''), grund: null }
  })
}

/** Uebernimmt das Freigabefeld aus dem bisherigen Stand, damit ein Export die
 *  einmal gezogene Grenze nicht zuruecksetzt. */
export function freigabeUebernehmen(neu, alt, schluessel) {
  const bisher = new Map(alt.map((e) => [schluessel(e), e.freigabe]))
  return neu.map((e) => {
    const vorher = bisher.get(schluessel(e))
    return e.freigabe != null || vorher == null ? e : { ...e, freigabe: vorher }
  })
}

const spaeter = (a, b) => (a && b ? (a > b ? a : b) : a ?? b)
const deutsch = (iso) => iso.split('-').reverse().join('.')
const laufSchluessel = (l) => `${l.datum}|${l.geprueft ?? ''}`
const entscheidungSchluessel = (e) => `${e.datum}|${e.entscheidung}`

/** Laeufe aus dem Vault, die in der kuratierten Liste noch fehlen. */
export function laeufeZusammenfuehren(alt, gelesen) {
  const bis = alt.zeitraum?.bis ?? ''
  const schon = new Set(alt.laeufe.map(laufSchluessel))
  const dazu = gelesen.filter((l) => l.datum > bis && !schon.has(laufSchluessel(l)))
  return { laeufe: [...alt.laeufe, ...dazu], dazu }
}

/** Neue Entscheidungen kommen dazu, keine bestehende faellt weg. */
export function entscheidungenZusammenfuehren(alt, gelesen) {
  const bekannt = new Set(alt.map(entscheidungSchluessel))
  const dazu = gelesen.filter((e) => !bekannt.has(entscheidungSchluessel(e)))
  // sort ist stabil: gleiche Tage behalten ihre Reihenfolge
  return [...alt, ...dazu].sort((a, b) => a.datum.localeCompare(b.datum))
}

/** Ein bekannter Punkt bekommt den neuen Wortlaut und behaelt seine uebrigen
 *  Felder, etwa erledigt oder freigabe. Kein Punkt faellt weg. */
export function punkteZusammenfuehren(alt, gelesen) {
  const neu = new Map(gelesen.map((p) => [p.nr, p]))
  const ergebnis = alt.map((p) => {
    const n = neu.get(p.nr)
    return n ? { ...p, punkt: n.punkt, grund: n.grund } : p
  })
  const bekannt = new Set(alt.map((p) => p.nr))
  ergebnis.push(...gelesen.filter((p) => !bekannt.has(p.nr)))
  return ergebnis.sort((a, b) => a.nr - b.nr)
}

async function sammleDateien(verzeichnis) {
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
      else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) gefunden.push(voll)
    }
  }
  await lauf(verzeichnis)
  return gefunden.sort()
}

function argument(name, ersatz = null) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1]
  }
  return ersatz
}

export async function exportieren({
  vault,
  ziel,
  probelauf = false,
  heute = new Date().toISOString().slice(0, 10),
  log = console.log,
}) {
  const alt = JSON.parse(await readFile(ziel, 'utf8'))

  // Prueflaeufe
  const notizordner = await findeNotizordner(vault)
  const notizen = notizordner ? await sammleDateien(notizordner) : []
  const gelesen = []
  for (const datei of notizen) {
    const { felder } = leseFrontmatter(await readFile(datei, 'utf8'))
    const lauf = alsPrueflauf(felder, basename(datei))
    if (lauf) gelesen.push(lauf)
  }
  gelesen.sort((a, b) => a.datum.localeCompare(b.datum) || a.id.localeCompare(b.id))
  const { laeufe, dazu } = laeufeZusammenfuehren(alt.prueflaeufe, gelesen)

  // Entscheidungen
  let entscheidungen = alt.entscheidungen
  const entscheidungsdatei = await findeDatei(ORTE.entscheidungen, [notizordner, vault])
  if (entscheidungsdatei) {
    const gefunden = leseEntscheidungen(await readFile(entscheidungsdatei, 'utf8'))
    entscheidungen = entscheidungenZusammenfuehren(alt.entscheidungen, gefunden)
  }

  // Offene Punkte
  let offenePunkte = alt.offenePunkte
  const punktedatei = await findeDatei(ORTE.offenePunkte, [notizordner, vault])
  if (punktedatei) {
    const gefunden = leseOffenePunkte(await readFile(punktedatei, 'utf8'))
    offenePunkte = punkteZusammenfuehren(alt.offenePunkte, gefunden)
  }

  const juengster = gelesen.length ? gelesen[gelesen.length - 1].datum : null
  const zeitraum = alt.prueflaeufe.zeitraum ?? {}
  const neu = {
    ...alt,
    stand: spaeter(alt.stand, juengster),
    prueflaeufe: {
      ...alt.prueflaeufe,
      zeitraum: dazu.length
        ? { von: zeitraum.von ?? dazu[0].datum, bis: spaeter(zeitraum.bis, dazu[dazu.length - 1].datum) }
        : alt.prueflaeufe.zeitraum,
      protokolliert: Math.max(gelesen.length, alt.prueflaeufe.protokolliert ?? 0),
      imDokumentAusgewiesen: dazu.length ? laeufe.length : alt.prueflaeufe.imDokumentAusgewiesen,
      laeufe: freigabeUebernehmen(laeufe, alt.prueflaeufe.laeufe, (l) => l.id),
    },
    entscheidungen: freigabeUebernehmen(entscheidungen, alt.entscheidungen, entscheidungSchluessel),
    offenePunkte: freigabeUebernehmen(offenePunkte, alt.offenePunkte, (p) => String(p.nr)),
    herkunft: {
      ...alt.herkunft,
      arbeitsordner: alt.herkunft.arbeitsordner ?? vault,
      // relativ zum Arbeitsordner, weil /stand/ beide in einem Satz nennt
      notizordner: notizordner
        ? relative(alt.herkunft.arbeitsordner ?? vault, notizordner).split(sep).join('/') || '.'
        : alt.herkunft.notizordner,
      verfahren:
        alt.herkunft.verfahren ??
        'Erzeugt von scripts/export-vault.mjs aus dem Frontmatter der Laufnotizen.',
    },
  }

  // Nur ein Export, der etwas geaendert hat, traegt ein neues Datum
  const geaendert = JSON.stringify(neu) !== JSON.stringify(alt)
  if (geaendert) {
    const quelle = `Laufnotizen der Prüfläufe, exportiert am ${deutsch(heute)}`
    const quellen = alt.herkunft.quellen ?? []
    neu.herkunft = {
      ...neu.herkunft,
      erzeugt: heute,
      quellen: dazu.length && !quellen.includes(quelle) ? [...quellen, quelle] : quellen,
    }
  }

  const fehlt = 'nicht gefunden, bisheriger Stand bleibt'
  log(
    `Gefunden\n` +
      `  Vault            ${vault}\n` +
      `  Notizordner      ${notizordner ?? fehlt}\n` +
      `  Entscheidungen   ${entscheidungsdatei ?? fehlt}\n` +
      `  Offene Punkte    ${punktedatei ?? fehlt}\n` +
      `Gelesen\n` +
      `  Laufnotizen      ${notizen.length}, davon als Prüflauf erkannt: ${gelesen.length}\n` +
      `Übernommen\n` +
      `  Neue Läufe       ${dazu.length}${dazu.length ? ': ' + dazu.map((l) => l.id).join(', ') : ''}\n` +
      `  Entscheidungen   ${neu.entscheidungen.length}\n` +
      `  Offene Punkte    ${neu.offenePunkte.length}\n` +
      `  Stand            ${neu.stand}` +
      (geaendert ? '' : `\nNichts Neues, erzeugt bleibt ${alt.herkunft.erzeugt}`),
  )

  if (probelauf) {
    log('Probelauf, nichts geschrieben.')
    return neu
  }
  if (!geaendert) return neu
  await writeFile(ziel, JSON.stringify(neu, null, 2) + '\n', 'utf8')
  log(`Geschrieben: ${ziel}`)
  return neu
}

const direktAufgerufen = process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())
if (direktAufgerufen) {
  // Die Laufnotizen liegen seit der Trennung vom 09.09. unter KFBM
  const vault = argument('vault', process.env.VAULT ?? 'D:\\WAMOCON\\KFBM')
  const ziel = resolve(argument('ziel', 'data/projektstand.json'))
  const probelauf = process.argv.includes('--probelauf') || process.argv.includes('--dry-run')

  if (!existsSync(vault)) {
    console.error(
      `Ordner nicht gefunden: ${vault}\n` +
        'Pfad mit --vault "D:\\WAMOCON\\KFBM" angeben oder die Umgebungsvariable VAULT setzen.',
    )
    process.exit(1)
  }
  await exportieren({ vault, ziel, probelauf })
}
