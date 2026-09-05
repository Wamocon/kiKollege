import test from 'node:test'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  alsPrueflauf,
  exportieren,
  freigabeUebernehmen,
  leseEntscheidungen,
  leseFrontmatter,
  leseOffenePunkte,
  normDatum,
} from './export-vault.mjs'

const hier = dirname(fileURLToPath(import.meta.url))
const vault = join(hier, '__fixtures__', 'vault')
const ziel = join(hier, '..', 'data', 'projektstand.json')
const still = () => {}

test('leseFrontmatter liest flache Felder und lässt den Rumpf stehen', () => {
  const { felder, rumpf } = leseFrontmatter(
    '---\nstand: 2026-08-27\ngeprueft: 238\nminor:\ngegenstand: "mit: Doppelpunkt"\nfertig: true\n# Kommentar\n---\nText\n',
  )
  assert.equal(felder.stand, '2026-08-27')
  assert.equal(felder.geprueft, 238)
  assert.equal(felder.minor, null)
  assert.equal(felder.gegenstand, 'mit: Doppelpunkt')
  assert.equal(felder.fertig, true)
  assert.equal(felder['# Kommentar'], undefined)
  assert.equal(rumpf, 'Text\n')
})

test('leseFrontmatter kommt ohne Frontmatter zurecht', () => {
  const { felder, rumpf } = leseFrontmatter('Nur Text.\n')
  assert.deepEqual(felder, {})
  assert.equal(rumpf, 'Nur Text.\n')
})

test('normDatum nimmt beide Schreibweisen und weist alles andere ab', () => {
  assert.equal(normDatum('2026-08-27'), '2026-08-27')
  assert.equal(normDatum('27.08.2026'), '2026-08-27')
  assert.equal(normDatum('offen'), null)
  assert.equal(normDatum(null), null)
})

test('alsPrueflauf übergeht Notizen ohne Ergebnisfeld', () => {
  assert.equal(alsPrueflauf({ stand: '2026-09-03', art: 'konzept' }, 'Konzept.md'), null)
  assert.equal(alsPrueflauf({ geprueft: 12 }, 'Ohne Stand.md'), null)
})

test('alsPrueflauf übernimmt nur belegte Zahlen', () => {
  const lauf = alsPrueflauf(
    { stand: '2026-08-27', geprueft: 238, blocker: 2, minor: null, laufzeit: 'vier Minuten' },
    'Lauf.md',
  )
  assert.equal(lauf.id, 'Lauf')
  assert.equal(lauf.datum, '2026-08-27')
  assert.equal(lauf.geprueft, 238)
  assert.equal(lauf.blocker, 2)
  assert.ok(!('minor' in lauf), 'ein leeres Feld darf nicht als 0 durchgehen')
  assert.equal(lauf.laufzeit, 'vier Minuten')
})

test('leseEntscheidungen nimmt Datumszeilen und lässt Trenn- und Kopfzeile aus', () => {
  const zeilen = leseEntscheidungen(
    '| Datum | Entscheidung |\n|---|---|\n| 28.08.2026 | Der Reviewer heißt Fritz |\n| offen | ohne Datum |\n',
  )
  assert.deepEqual(zeilen, [{ datum: '2026-08-28', entscheidung: 'Der Reviewer heißt Fritz' }])
})

test('leseOffenePunkte trennt Punkt und Grund und hängt Folgezeilen an', () => {
  const punkte = leseOffenePunkte(
    '1. Befunde bewerten. Ohne das keine Quote,\n   ohne Quote keine Abnahme.\n2. Format festlegen\n',
  )
  assert.equal(punkte.length, 2)
  assert.deepEqual(punkte[0], {
    nr: 1,
    punkt: 'Befunde bewerten',
    grund: 'Ohne das keine Quote, ohne Quote keine Abnahme.',
  })
  assert.deepEqual(punkte[1], { nr: 2, punkt: 'Format festlegen', grund: null })
})

test('freigabeUebernehmen behält eine früher gezogene Grenze', () => {
  const neu = [{ id: 'a' }, { id: 'b', freigabe: 'oeffentlich' }, { id: 'c' }]
  const alt = [
    { id: 'a', freigabe: 'intern' },
    { id: 'b', freigabe: 'intern' },
  ]
  assert.deepEqual(freigabeUebernehmen(neu, alt, (e) => e.id), [
    { id: 'a', freigabe: 'intern' },
    { id: 'b', freigabe: 'oeffentlich' },
    { id: 'c' },
  ])
})

test('exportieren liest den Fixture-Vault und lässt Handgeschriebenes stehen', async () => {
  const neu = await exportieren({ vault, ziel, probelauf: true, log: still })

  const ids = neu.prueflaeufe.laeufe.map((l) => l.id)
  assert.deepEqual(ids, [
    '2026-08-27-usecases',
    '2026-08-31-quiz-voll',
    '2026-09-04-wiederholung',
  ])
  assert.equal(neu.prueflaeufe.laeufe.length, 3, 'Konzeptnotiz darf nicht als Lauf zählen')
  assert.deepEqual(neu.prueflaeufe.zeitraum, { von: '2026-08-27', bis: '2026-09-04' })
  assert.equal(neu.stand, '2026-09-04')

  assert.equal(neu.prueflaeufe.laeufe[1].freigabe, 'intern', 'Freigabe aus dem Frontmatter')
  assert.equal(neu.prueflaeufe.laeufe[0].freigabe, 'oeffentlich', 'Freigabe aus dem alten Stand')

  assert.equal(neu.entscheidungen.length, 2)
  assert.equal(neu.offenePunkte.length, 3)

  // Handgeschriebenes bleibt unangetastet
  assert.equal(neu.begriffe.length, 3)
  assert.equal(neu.massstab.kriterien.gesamt, 11)
  assert.equal(neu.auftrag.harteRegeln.length, 4)
  assert.equal(neu.gesellschaften.length, 2)
})

test('exportieren behält den alten Stand, wenn der Vault keine Läufe hat', async () => {
  const neu = await exportieren({ vault: join(vault, '00_Vault'), ziel, probelauf: true, log: still })
  assert.equal(neu.prueflaeufe.laeufe.length, 5, 'Fallback auf den bisherigen Stand')
  assert.equal(neu.stand, '2026-09-05')
})
