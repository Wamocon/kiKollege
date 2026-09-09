#!/usr/bin/env node
/**
 * Liest Kennzahlen, Entscheidungen und offene Punkte aus dem Vault und schreibt
 * sie nach data/projektstand.json.
 *
 *   npm run export:vault -- --vault "D:\WAMOCON\KI-Mitarbeiter" --probelauf
 *   npm run export:vault -- --vault "D:\WAMOCON\KI-Mitarbeiter"
 *
 * Das Skript ersetzt nur die Abschnitte, die es aus dem Vault ableiten kann.
 * Prosa, Begriffe, Massstab und alles andere von Hand Geschriebene bleibt stehen.
 * Ein bereits gesetztes Feld "freigabe" bleibt erhalten, damit die Grenze
 * zwischen intern und oeffentlich nicht bei jedem Export verloren geht.
 *
 * Der Ordner mit den Laufnotizen wird gesucht, nicht vorausgesetzt: --vault
 * darf auf den Vault oder gleich auf den Notizordner zeigen. Der Probelauf
 * schreibt nichts und meldet, welche Ordner und Dateien gefunden wurden.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'

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
  const hatErgebnis = ZAHLFELDER.some((f) => typeof felder[f] === 'number')
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

export async function exportieren({ vault, ziel, probelauf = false, log = console.log }) {
  const alt = JSON.parse(await readFile(ziel, 'utf8'))

  // Prueflaeufe
  const notizordner = await findeNotizordner(vault)
  const notizen = notizordner ? await sammleDateien(notizordner) : []
  const laeufe = []
  for (const datei of notizen) {
    const { felder } = leseFrontmatter(await readFile(datei, 'utf8'))
    const lauf = alsPrueflauf(felder, relative(vault, datei).split(/[\\/]/).pop())
    if (lauf) laeufe.push(lauf)
  }
  laeufe.sort((a, b) => a.datum.localeCompare(b.datum) || a.id.localeCompare(b.id))

  // Entscheidungen
  let entscheidungen = alt.entscheidungen
  const entscheidungsdatei = await findeDatei(ORTE.entscheidungen, [notizordner, vault])
  if (entscheidungsdatei) {
    const gelesen = leseEntscheidungen(await readFile(entscheidungsdatei, 'utf8'))
    if (gelesen.length) entscheidungen = gelesen
  }

  // Offene Punkte
  let offenePunkte = alt.offenePunkte
  const punktedatei = await findeDatei(ORTE.offenePunkte, [notizordner, vault])
  if (punktedatei) {
    const gelesen = leseOffenePunkte(await readFile(punktedatei, 'utf8'))
    if (gelesen.length) offenePunkte = gelesen
  }

  const neu = {
    ...alt,
    stand: laeufe.length ? laeufe[laeufe.length - 1].datum : alt.stand,
    prueflaeufe: {
      ...alt.prueflaeufe,
      zeitraum: laeufe.length
        ? { von: laeufe[0].datum, bis: laeufe[laeufe.length - 1].datum }
        : alt.prueflaeufe.zeitraum,
      protokolliert: laeufe.length || alt.prueflaeufe.protokolliert,
      imDokumentAusgewiesen: laeufe.length || alt.prueflaeufe.imDokumentAusgewiesen,
      laeufe: laeufe.length
        ? freigabeUebernehmen(laeufe, alt.prueflaeufe.laeufe, (l) => l.id)
        : alt.prueflaeufe.laeufe,
    },
    entscheidungen: freigabeUebernehmen(
      entscheidungen,
      alt.entscheidungen,
      (e) => `${e.datum}|${e.entscheidung}`,
    ),
    offenePunkte: freigabeUebernehmen(offenePunkte, alt.offenePunkte, (p) => String(p.nr)),
    herkunft: {
      ...alt.herkunft,
      arbeitsordner: vault,
      notizordner: notizordner ? relative(vault, notizordner) || '.' : alt.herkunft.notizordner,
      erzeugt: new Date().toISOString().slice(0, 10),
      verfahren: 'Erzeugt von scripts/export-vault.mjs aus dem Frontmatter der Laufnotizen.',
    },
  }

  const fehlt = 'nicht gefunden, bisheriger Stand bleibt'
  log(
    `Gefunden\n` +
      `  Vault            ${vault}\n` +
      `  Notizordner      ${notizordner ?? fehlt}\n` +
      `  Entscheidungen   ${entscheidungsdatei ?? fehlt}\n` +
      `  Offene Punkte    ${punktedatei ?? fehlt}\n` +
      `Gelesen\n` +
      `  Laufnotizen      ${notizen.length}, davon als Prüflauf erkannt: ${laeufe.length}\n` +
      `Übernommen\n` +
      `  Entscheidungen   ${neu.entscheidungen.length}\n` +
      `  Offene Punkte    ${neu.offenePunkte.length}\n` +
      `  Stand            ${neu.stand}`,
  )

  if (probelauf) {
    log('Probelauf, nichts geschrieben.')
    return neu
  }
  await writeFile(ziel, JSON.stringify(neu, null, 2) + '\n', 'utf8')
  log(`Geschrieben: ${ziel}`)
  return neu
}

const direktAufgerufen = process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())
if (direktAufgerufen) {
  const vault = argument('vault', process.env.VAULT ?? 'D:\\WAMOCON\\KI-Mitarbeiter')
  const ziel = resolve(argument('ziel', 'data/projektstand.json'))
  const probelauf = process.argv.includes('--probelauf') || process.argv.includes('--dry-run')

  if (!existsSync(vault)) {
    console.error(
      `Ordner nicht gefunden: ${vault}\n` +
        'Pfad mit --vault "D:\\WAMOCON\\KI-Mitarbeiter" angeben oder die Umgebungsvariable VAULT setzen.',
    )
    process.exit(1)
  }
  await exportieren({ vault, ziel, probelauf })
}
