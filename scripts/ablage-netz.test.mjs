import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { BEREICHE } from './abbild-vault.mjs'
import {
  FELD,
  QUELLE,
  alsText,
  anordnen,
  aufloesen,
  leseAblage,
  netzAbbilden,
  netzBauen,
  ohneCode,
  verknuepfen,
  verzeichnis,
} from './ablage-netz.mjs'

const hier = dirname(fileURLToPath(import.meta.url))
const ablage = join(hier, '__fixtures__', 'ablage')
const datei = join(hier, '..', 'data', 'ablage-netz.json')
const still = () => {}

const PFADE = [
  'KI-Mitarbeiter/00_Meta/Konvention.md',
  'KI-Mitarbeiter/85_Logbuch/Entscheidung A.md',
  'KFBM/00_Meta/Notiz.md',
  'KI-Mitarbeiter/00_Meta/Notiz.md',
  'Notiz.md',
]

test('aufloesen findet die Notiz über den Dateinamen ohne Endung', () => {
  const v = verzeichnis(PFADE)
  const von = 'KI-Mitarbeiter/85_Logbuch/Entscheidung A.md'
  assert.equal(aufloesen('Konvention', von, v), 0)
  assert.equal(aufloesen('konvention', von, v), 0, 'gross oder klein egal')
  assert.equal(aufloesen('Konvention.md', von, v), 0)
  assert.equal(aufloesen(' Entscheidung A ', PFADE[0], v), 1)
  assert.equal(aufloesen('Gibt es nicht', von, v), -1)
  assert.equal(aufloesen('Konvention.png', von, v), -1, 'Anhang ist keine Notiz')
})

test('aufloesen wählt bei gleichem Namen wie die Ablage', () => {
  const v = verzeichnis(PFADE)
  // Ohne Pfad: erst der eigene Ordner, sonst der kürzeste Pfad
  assert.equal(aufloesen('Notiz', 'KFBM/00_Meta/Andere.md', v), 2)
  assert.equal(aufloesen('Notiz', 'KI-Mitarbeiter/00_Meta/Konvention.md', v), 3)
  assert.equal(aufloesen('Notiz', 'KI-Mitarbeiter/85_Logbuch/Entscheidung A.md', v), 4)
  // Mit Pfad muss der Pfad passen
  assert.equal(aufloesen('KFBM/00_Meta/Notiz', 'Notiz.md', v), 2)
  assert.equal(aufloesen('00_Meta/Notiz', 'KI-Mitarbeiter/85_Logbuch/Entscheidung A.md', v), 2)
  assert.equal(aufloesen('../00_Meta/Notiz', 'KI-Mitarbeiter/85_Logbuch/Entscheidung A.md', v), 3)
  assert.equal(aufloesen('Woanders/Notiz', 'Notiz.md', v), -1)
})

test('verknuepfen lässt Leere, Selbstverweise und Doppelte weg', () => {
  const notizen = [
    { pfad: 'A.md', ziele: ['B', 'B', 'b', 'A', 'Fehlt', 'C'] },
    { pfad: 'Ordner/B.md', ziele: ['A'] },
    { pfad: 'C.md', ziele: [] },
    { pfad: 'D.md', ziele: ['Fehlt auch'] },
  ]
  const { kanten, ...zaehler } = verknuepfen(notizen)
  assert.deepEqual(kanten, [
    [0, 1],
    [0, 2],
  ])
  assert.deepEqual(zaehler, { verweise: 8, insLeere: 2, aufSich: 1, doppelt: 3 })
})

test('ohneCode nimmt Verweise in Code aus', () => {
  const text = 'Vor [[A]]\n```md\n[[B]]\n```\nmit `[[C]]` und [[D]]\n~~~\n[[E]]'
  assert.equal(ohneCode(text).includes('[[A]]'), true)
  assert.equal(ohneCode(text).includes('[[D]]'), true)
  for (const z of ['[[B]]', '[[C]]', '[[E]]']) assert.equal(ohneCode(text).includes(z), false, z)
})

/** Zwei Sterne, eine Brücke, zwei Punkte ohne Linie. */
function beispiel() {
  const bereich = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2]
  const kanten = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
    [6, 7], [6, 8], [6, 9], [6, 10],
    [0, 6],
  ]
  return { bereich, kanten }
}

test('anordnen ist bei gleicher Eingabe gleich', () => {
  const { bereich, kanten } = beispiel()
  const a = anordnen(bereich, kanten)
  const b = anordnen([...bereich], kanten.map((k) => [...k]))
  assert.deepEqual(a, b)
  assert.notDeepEqual(anordnen(bereich, kanten, { saat: 7 }), a, 'andere Saat, andere Lage')
})

test('anordnen legt ganze Zahlen ins Feld, Verbundene innen, die übrigen am Rand', () => {
  const { bereich, kanten } = beispiel()
  const lage = anordnen(bereich, kanten)
  assert.equal(lage.length, bereich.length)
  for (const [x, y] of lage) {
    assert.ok(Number.isInteger(x) && Number.isInteger(y))
    assert.ok(x >= 0 && x <= FELD && y >= 0 && y <= FELD)
  }
  const r = ([x, y]) => Math.hypot(x - FELD / 2, y - FELD / 2)
  const innen = Math.max(...lage.slice(0, 11).map(r))
  for (const p of lage.slice(11)) assert.ok(r(p) > innen, 'ohne Linie liegt außen')
  // Der meistverbundene Punkt liegt näher an der Mitte als seine Blätter
  const blaetter = [1, 2, 3, 4, 5].map((i) => r(lage[i]))
  assert.ok(r(lage[0]) < blaetter.reduce((s, x) => s + x, 0) / blaetter.length)
})

test('anordnen kommt mit leerem und unverbundenem Netz zurecht', () => {
  assert.deepEqual(anordnen([], []), [])
  const lage = anordnen([3, 3, 4], [])
  assert.equal(lage.length, 3)
})

/** Alle Zeichenketten einer Ausgabe mit ihrem Ort. */
function zeichenketten(wert, ort = '') {
  if (typeof wert === 'string') return [[ort, wert]]
  if (Array.isArray(wert)) return wert.flatMap((w, i) => zeichenketten(w, `${ort}[${i}]`))
  if (wert && typeof wert === 'object') {
    return Object.entries(wert).flatMap(([k, w]) => zeichenketten(w, `${ort}.${k}`))
  }
  return []
}

function pruefeAnonym(netz) {
  assert.deepEqual(Object.keys(netz), ['gezaehltAm', 'bereiche', 'knoten', 'kanten', 'quelle'])
  assert.match(netz.gezaehltAm, /^\d{4}-\d{2}-\d{2}$/)
  assert.deepEqual(netz.bereiche, BEREICHE.map((b) => b.id))
  assert.equal(netz.quelle, QUELLE)
  const erlaubt = new Set([netz.gezaehltAm, netz.quelle, ...BEREICHE.map((b) => b.id)])
  for (const [ort, wert] of zeichenketten(netz)) {
    assert.ok(ort === '.gezaehltAm' || ort === '.quelle' || ort.startsWith('.bereiche['), `Text an ${ort}`)
    assert.ok(erlaubt.has(wert), `unerwarteter Text an ${ort}`)
  }
  const n = netz.knoten.length
  for (const k of netz.knoten) {
    assert.equal(k.length, 4)
    assert.ok(k.every(Number.isInteger))
    assert.ok(k[2] >= 0 && k[2] < netz.bereiche.length)
  }
  const grad = new Array(n).fill(0)
  const paare = new Set()
  for (const k of netz.kanten) {
    assert.equal(k.length, 2)
    assert.ok(k.every(Number.isInteger))
    assert.ok(k[0] >= 0 && k[0] < k[1] && k[1] < n, 'Paar i < j')
    assert.ok(!paare.has(`${k[0]}-${k[1]}`), 'Linie doppelt')
    paare.add(`${k[0]}-${k[1]}`)
    grad[k[0]] += 1
    grad[k[1]] += 1
  }
  assert.deepEqual(netz.knoten.map((k) => k[3]), grad, 'Grad passt zu den Linien')
}

test('netzBauen liest die Ablage und gibt nur Zahlen heraus', async () => {
  const notizen = await leseAblage(ablage)
  const { netz, zaehler } = netzBauen(notizen, { heute: '2026-09-17' })
  // Sechs Notizen wie in abbild-vault: Konvention und Entscheidung A hin und
  // zurück, Protokoll auf Konvention, Lauf dreimal auf Kriterien, Wert allein
  assert.equal(netz.knoten.length, 6)
  assert.equal(netz.kanten.length, 3)
  assert.deepEqual(zaehler, { verweise: 8, insLeere: 1, aufSich: 0, doppelt: 4 })
  assert.equal(netz.knoten.filter((k) => k[3] === 0).length, 1)
  // Nach Bereich nummeriert
  const b = netz.knoten.map((k) => k[2])
  assert.deepEqual(b, [...b].sort((p, q) => p - q))
  pruefeAnonym(netz)

  const text = alsText(netz)
  assert.deepEqual(JSON.parse(text), netz)
  for (const n of notizen) {
    const name = n.pfad.split('/').pop().replace(/\.md$/, '')
    assert.equal(text.includes(name), false, 'kein Dateiname in der Datei')
  }
  assert.equal(netzBauen(notizen, { heute: '2026-09-17' }).netz.knoten.join(), netz.knoten.join(), 'gleiche Ablage, gleiche Lage')
})

test('netzAbbilden schreibt im Probelauf nichts', async () => {
  const ziel = join(tmpdir(), `ablage-netz-probe-${process.pid}.json`)
  const netz = await netzAbbilden({ vault: ablage, ziel, probelauf: true, heute: '2026-09-17', log: still })
  assert.equal(existsSync(ziel), false)
  assert.equal(netz.knoten.length, 6)
})

test('die Datei im Repository enthält nur Zahlen, Bereiche, Datum und Quelle', { skip: !existsSync(datei) }, () => {
  pruefeAnonym(JSON.parse(readFileSync(datei, 'utf8')))
})
