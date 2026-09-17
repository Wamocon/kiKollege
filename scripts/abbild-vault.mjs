#!/usr/bin/env node
/**
 * Zaehlt die Ablage durch und schreibt ein Abbild nach data/projektstand.json:
 * wie viele Notizen in welchem Bereich liegen, mit welchem Freigabestand, und
 * wie oft die Bereiche aufeinander verweisen.
 *
 *   npm run abbild:vault -- --vault "D:\WAMOCON" --probelauf
 *   npm run abbild:vault -- --vault "D:\WAMOCON"
 *
 * --vault zeigt auf den Ordner, den die Ablage als Ganzes oeffnet, nicht auf
 * einen der beiden Bereiche. Ausgelassen wird, was die Ablage selbst aus ihrem
 * Index nimmt (userIgnoreFilters in .obsidian/app.json), dazu jeder Ordner, der
 * mit einem Punkt beginnt.
 *
 * Das Repository ist oeffentlich. Ins Abbild gehen deshalb nur Zahlen je
 * Bereich, keine Dateinamen und keine Pfade. Ersetzt werden nur der Schluessel
 * "ablage" und die Kennzahl "verbindlich", die aus derselben Zaehlung stammt.
 */

import { readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, join, relative, resolve } from 'node:path'

import { leseFrontmatter } from './export-vault.mjs'

/** Die Bereiche des Abbilds. Die Reihenfolge ist die der Figur. Die ersten
 *  sieben sind die Ebenen der Wissensschicht aus der Systemarchitektur vom
 *  09.09.2026, von allgemein zu speziell. Die Namen stehen in der Figur in
 *  normaler Schreibung; nur die Gruppenzeilen setzt sie in Grossbuchstaben. */
export const BEREICHE = [
  { id: 'konventionen', gruppe: 'wissen', name: 'Konventionen und Begriffe', kurz: 'Konventionen' },
  { id: 'entscheidungen', gruppe: 'wissen', name: 'Entscheidungen mit Datum', kurz: 'Entscheidungen' },
  { id: 'unternehmen', gruppe: 'wissen', name: 'Wissen über das Unternehmen', kurz: 'Unternehmen' },
  { id: 'bauplan', gruppe: 'wissen', name: 'Bauplan der Mitarbeiter', kurz: 'Bauplan' },
  { id: 'normbasis', gruppe: 'wissen', name: 'Normbasis des Berufs', kurz: 'Normbasis' },
  { id: 'massstab', gruppe: 'wissen', name: 'Prüfmaßstab der Academy', kurz: 'Prüfmaßstab' },
  { id: 'quellen', gruppe: 'wissen', name: 'Quellen', kurz: 'Quellen' },
  { id: 'prueflaeufe', gruppe: 'gedaechtnis', name: 'Prüfläufe', kurz: 'Prüfläufe' },
  { id: 'arbeitsstand', gruppe: 'werkstatt', name: 'Pläne, Berichte, Übergaben', kurz: 'Arbeitsstände' },
  { id: 'protokoll', gruppe: 'werkstatt', name: 'Tagesprotokolle', kurz: 'Protokolle' },
  { id: 'einstiege', gruppe: 'werkstatt', name: 'Einstiege und Eingang', kurz: 'Einstiege' },
  { id: 'archiv', gruppe: 'werkstatt', name: 'Archiv', kurz: 'Archiv' },
]

/** Notiztypen, die einen Arbeitsstand festhalten und kein Wissen sind. */
const ARBEITSTYPEN = new Set([
  'arbeitsplan',
  'bericht',
  'uebergabe',
  'briefing',
  'vorschlag',
  'auftrag',
  'analyse',
  'sichtung',
  'fragenkatalog',
])

/** Ordnet eine Notiz einem Bereich zu. Erste passende Zeile gewinnt. Der Pfad
 *  ist relativ zur Ablage und mit Schraegstrichen geschrieben. */
export function bereichVon(pfad, typ) {
  const p = pfad.replace(/\\/g, '/').normalize('NFC')
  const t = typeof typ === 'string' ? typ.toLowerCase() : ''
  if (/(^|\/)00_Meta\/Protokoll\//.test(p)) return 'protokoll'
  if (/(^|\/)Prüfläufe\//.test(p) || t === 'prueflauf') return 'prueflaeufe'
  if (/(^|\/)85_Logbuch\//.test(p)) return 'entscheidungen'
  if (/(^|\/)00_Meta\//.test(p)) return 'konventionen'
  if (/(^|\/)20_Ausbildungsberufe\//.test(p)) return 'normbasis'
  if (/(^|\/)(30|80)_Quellen\//.test(p)) return 'quellen'
  if (/(^|\/)15_Academy\//.test(p) || t === 'kriterium' || t === 'vorlage') return 'massstab'
  if (/(^|\/)90_Archiv\//.test(p) || t === 'archiv') return 'archiv'
  if (/^KI-Mitarbeiter\/[1-7]0_/.test(p)) return 'unternehmen'
  if (ARBEITSTYPEN.has(t)) return 'arbeitsstand'
  if (/(^|\/)(75|10)_KI-Mitarbeiter\//.test(p)) return 'bauplan'
  return 'einstiege'
}

/** Freigabestand aus dem Frontmatter. Alles andere als die drei erlaubten
 *  Werte zaehlt als "ohne Feld", auch ein Tippfehler. */
export function freigabestand(felder) {
  const v = typeof felder.verbindlichkeit === 'string' ? felder.verbindlichkeit.trim() : ''
  if (v === 'verbindlich' || v === 'informativ' || v === 'ungeprueft') return v
  return 'ohneFeld'
}

/** Ziele aller Wikilinks einer Notiz, ohne Anker und ohne Anzeigetext. */
export function verweise(text) {
  const ziele = []
  for (const m of text.matchAll(/!?\[\[([^\]|#^]+)(?:[#^][^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const ziel = m[1].trim()
    if (ziel) ziele.push(ziel)
  }
  return ziele
}

/** userIgnoreFilters: ein Eintrag zwischen zwei Schraegstrichen ist ein
 *  regulaerer Ausdruck, jeder andere ein Pfadanfang. */
export function ausgelassen(pfad, filter) {
  const p = pfad.replace(/\\/g, '/')
  for (const f of filter) {
    if (f.length > 2 && f.startsWith('/') && f.endsWith('/')) {
      try {
        if (new RegExp(f.slice(1, -1)).test(p)) return true
      } catch {
        // Ein kaputter Ausdruck laesst nichts aus, statt alles.
      }
    } else if (p === f || p.startsWith(f)) {
      return true
    }
  }
  return false
}

async function leseFilter(vault) {
  try {
    const app = JSON.parse(await readFile(join(vault, '.obsidian', 'app.json'), 'utf8'))
    return Array.isArray(app.userIgnoreFilters) ? app.userIgnoreFilters.map(String) : []
  } catch {
    return []
  }
}

async function sammleNotizen(vault, filter) {
  const gefunden = []
  async function lauf(pfad) {
    let eintraege
    try {
      eintraege = await readdir(pfad, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of eintraege) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue
      const voll = join(pfad, e.name)
      const rel = relative(vault, voll).replace(/\\/g, '/')
      if (e.isDirectory()) {
        if (!ausgelassen(`${rel}/`, filter)) await lauf(voll)
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md') && !ausgelassen(rel, filter)) {
        gefunden.push(voll)
      }
    }
  }
  await lauf(vault)
  return gefunden.sort()
}

const leer = () => ({ notizen: 0, verbindlich: 0, informativ: 0, ungeprueft: 0, ohneFeld: 0 })

/** Zaehlt die Ablage. Liefert das Abbild, schreibt nichts. */
export async function zaehlen(vault, heute = new Date().toISOString().slice(0, 10)) {
  const filter = await leseFilter(vault)
  const dateien = await sammleNotizen(vault, filter)

  const notizen = []
  for (const datei of dateien) {
    const text = await readFile(datei, 'utf8')
    const { felder } = leseFrontmatter(text)
    const rel = relative(vault, datei).replace(/\\/g, '/')
    notizen.push({
      name: basename(datei, '.md').toLowerCase(),
      bereich: bereichVon(rel, felder.typ),
      stand: freigabestand(felder),
      typ: typeof felder.typ === 'string' ? felder.typ.toLowerCase() : '',
      ziele: verweise(text),
    })
  }

  // Ein Dateiname kommt in der Ablage nur einmal vor. Kommt er doch doppelt
  // vor, ist der Verweis mehrdeutig und wird nicht gezaehlt.
  const nachName = new Map()
  const doppelt = new Set()
  for (const n of notizen) {
    if (nachName.has(n.name)) doppelt.add(n.name)
    nachName.set(n.name, n)
  }

  const zaehler = new Map(BEREICHE.map((b) => [b.id, leer()]))
  const matrix = new Map(
    BEREICHE.map((b) => [b.id, Object.fromEntries(BEREICHE.filter((c) => c.id !== b.id).map((c) => [c.id, 0]))]),
  )
  let verweiseGesamt = 0
  let unaufgeloest = 0

  for (const n of notizen) {
    const z = zaehler.get(n.bereich)
    z.notizen += 1
    z[n.stand] += 1
    for (const ziel of n.ziele) {
      const schluessel = basename(ziel.replace(/\.md$/i, '')).toLowerCase()
      const treffer = doppelt.has(schluessel) ? null : nachName.get(schluessel)
      if (!treffer) {
        unaufgeloest += 1
        continue
      }
      verweiseGesamt += 1
      if (treffer.bereich !== n.bereich) matrix.get(n.bereich)[treffer.bereich] += 1
    }
  }

  return {
    gezaehltAm: heute,
    notizen: notizen.length,
    verweise: verweiseGesamt,
    unaufgeloest,
    regelnotizen: notizen.filter((n) => n.typ === 'regel').length,
    bereiche: BEREICHE.map((b) => ({ ...b, ...zaehler.get(b.id), verweiseNach: matrix.get(b.id) })),
  }
}

function argument(name, ersatz = null) {
  const i = process.argv.indexOf(`--${name}`)
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    return process.argv[i + 1]
  }
  return ersatz
}

export async function abbilden({ vault, ziel, probelauf = false, heute, log = console.log }) {
  const alt = JSON.parse(await readFile(ziel, 'utf8'))
  const abbild = await zaehlen(vault, heute)
  const verbindlich = abbild.bereiche.reduce((s, b) => s + b.verbindlich, 0)

  const neu = {
    ...alt,
    kennzahlen: alt.kennzahlen.map((k) => (k.id === 'verbindlich' ? { ...k, zahl: verbindlich } : k)),
    ablage: {
      ...alt.ablage,
      ...abbild,
      verfahren:
        'Gezählt von scripts/abbild-vault.mjs aus dem Frontmatter und den Verweisen der Notizen. ' +
        'Ausgelassen ist, was die Ablage selbst aus ihrem Index nimmt.',
      freigabe: alt.ablage?.freigabe ?? 'oeffentlich',
    },
  }

  log(
    `Gezählt am ${abbild.gezaehltAm}: ${abbild.notizen} Notizen, ${verbindlich} verbindlich, ` +
      `${abbild.verweise} Verweise, ${abbild.unaufgeloest} ohne Ziel\n` +
      abbild.bereiche
        .map((b) => `  ${b.name.padEnd(30)} ${String(b.notizen).padStart(4)}   verbindlich ${b.verbindlich}`)
        .join('\n'),
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
  const vault = argument('vault', process.env.ABLAGE ?? 'D:\\WAMOCON')
  const ziel = resolve(argument('ziel', 'data/projektstand.json'))
  const probelauf = process.argv.includes('--probelauf') || process.argv.includes('--dry-run')

  if (!existsSync(vault)) {
    console.error(
      `Ordner nicht gefunden: ${vault}\n` +
        'Pfad mit --vault "D:\\WAMOCON" angeben oder die Umgebungsvariable ABLAGE setzen.',
    )
    process.exit(1)
  }
  await abbilden({ vault, ziel, probelauf })
}
