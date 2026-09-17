import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  alsPrueflauf,
  entscheidungenZusammenfuehren,
  exportieren,
  findeDatei,
  findeNotizordner,
  freigabeUebernehmen,
  leseEntscheidungen,
  leseFrontmatter,
  leseOffenePunkte,
  laeufeZusammenfuehren,
  normDatum,
  punkteZusammenfuehren,
} from './export-vault.mjs'

const hier = dirname(fileURLToPath(import.meta.url))
const vault = join(hier, '__fixtures__', 'vault')
const vaultFlach = join(hier, '__fixtures__', 'vault-flach')
const vaultOhneLaeufe = join(hier, '__fixtures__', 'vault-ohne-laeufe')
const vaultLeer = join(hier, '__fixtures__', 'vault-leer')
const ziel = join(hier, '..', 'data', 'projektstand.json')
const standAlt = join(hier, '__fixtures__', 'stand-alt.json')
const still = () => {}
const bisher = JSON.parse(readFileSync(ziel, 'utf8'))
const alt = JSON.parse(readFileSync(standAlt, 'utf8'))

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

test('alsPrueflauf liest hinweis in der Einzahl und bewertet', () => {
  const lauf = alsPrueflauf({ stand: '2026-09-09', geprueft: 239, hinweis: 161, bewertet: 49 }, 'Enabler.md')
  assert.equal(lauf.hinweise, 161)
  assert.equal(lauf.bewertet, 49)
  assert.ok(alsPrueflauf({ stand: '2026-09-09', hinweis: 3 }, 'Nur Hinweise.md'), 'hinweis allein ist ein Ergebnis')
})

test('laeufeZusammenfuehren nimmt nur Neueres und nichts doppelt', () => {
  const alt = {
    zeitraum: { von: '2026-08-27', bis: '2026-09-01' },
    laeufe: [{ id: 'a', datum: '2026-08-27', geprueft: 10 }],
  }
  const { laeufe, dazu } = laeufeZusammenfuehren(alt, [
    { id: 'a-aus-dem-vault', datum: '2026-08-27', geprueft: 10 },
    { id: 'aelter', datum: '2026-08-30', geprueft: 5 },
    { id: 'neu', datum: '2026-09-02', geprueft: 7 },
  ])
  assert.deepEqual(dazu.map((l) => l.id), ['neu'])
  assert.deepEqual(laeufe.map((l) => l.id), ['a', 'neu'])
})

test('entscheidungenZusammenfuehren ergänzt und entfernt nichts', () => {
  const alt = [{ datum: '2026-08-28', entscheidung: 'B' }, { datum: '2026-08-20', entscheidung: 'A' }]
  const neu = entscheidungenZusammenfuehren(alt, [
    { datum: '2026-08-28', entscheidung: 'B' },
    { datum: '2026-09-01', entscheidung: 'C' },
  ])
  assert.deepEqual(neu.map((e) => e.entscheidung), ['A', 'B', 'C'])
})

test('punkteZusammenfuehren ändert den Wortlaut und behält die übrigen Felder', () => {
  const alt = [
    { nr: 2, punkt: 'alt', grund: 'alt', erledigt: { am: '2026-09-01', text: 'x' } },
    { nr: 7, punkt: 'bleibt', grund: null },
  ]
  const neu = punkteZusammenfuehren(alt, [
    { nr: 2, punkt: 'neu', grund: 'neu' },
    { nr: 3, punkt: 'dazu', grund: null },
  ])
  assert.deepEqual(neu, [
    { nr: 2, punkt: 'neu', grund: 'neu', erledigt: { am: '2026-09-01', text: 'x' } },
    { nr: 3, punkt: 'dazu', grund: null },
    { nr: 7, punkt: 'bleibt', grund: null },
  ])
})

test('exportieren führt den Fixture-Vault mit dem alten Stand zusammen', async () => {
  const neu = await exportieren({ vault, ziel: standAlt, probelauf: true, heute: '2026-09-10', log: still })

  const ids = neu.prueflaeufe.laeufe.map((l) => l.id)
  assert.deepEqual(ids, ['2026-08-27-usecases', '2026-08-31-quiz-voll', '2026-09-04-wiederholung'])
  assert.equal(neu.prueflaeufe.laeufe[0].gegenstand, 'von Hand beschrieben', 'Kuratiertes bleibt')
  assert.equal(neu.prueflaeufe.laeufe[1].freigabe, 'intern', 'Freigabe aus dem Frontmatter')
  assert.equal(neu.prueflaeufe.laeufe[0].freigabe, 'oeffentlich', 'Freigabe aus dem alten Stand')
  assert.deepEqual(neu.prueflaeufe.zeitraum, { von: '2026-08-27', bis: '2026-09-04' })
  assert.equal(neu.prueflaeufe.protokolliert, 3, 'Konzeptnotiz darf nicht als Lauf zählen')
  assert.equal(neu.prueflaeufe.imDokumentAusgewiesen, 3)
  assert.equal(neu.stand, '2026-09-04')

  assert.deepEqual(neu.entscheidungen.map((e) => e.datum), ['2026-08-20', '2026-08-28', '2026-09-03'])
  assert.equal(neu.entscheidungen[1].freigabe, 'oeffentlich')

  assert.deepEqual(neu.offenePunkte.map((p) => p.nr), [1, 2, 3, 9])
  assert.equal(neu.offenePunkte[0].punkt, 'Die vorliegenden Befunde bewerten')
  assert.equal(neu.offenePunkte[0].freigabe, 'intern')
  assert.equal(neu.offenePunkte[0].erledigt.am, '2026-08-29')

  assert.equal(neu.herkunft.verfahren, 'Von Hand.')
  assert.equal(neu.herkunft.erzeugt, '2026-09-10')
  assert.deepEqual(neu.herkunft.quellen, [
    'Übergabe vom 30.08.',
    'Laufnotizen der Prüfläufe, exportiert am 10.09.2026',
  ])

  // Handgeschriebenes bleibt unangetastet
  assert.deepEqual(neu.begriffe, alt.begriffe)
  assert.deepEqual(neu.gesellschaften, alt.gesellschaften)
})

test('exportieren behält den alten Stand, wenn der Vault keine Läufe hat', async () => {
  const neu = await exportieren({ vault: vaultOhneLaeufe, ziel: standAlt, probelauf: true, log: still })
  assert.deepEqual(neu.prueflaeufe.laeufe, alt.prueflaeufe.laeufe)
  assert.equal(neu.stand, alt.stand)
})

test('exportieren lässt einen jüngeren Stand stehen und datiert nichts um', async () => {
  const neu = await exportieren({ vault, ziel, probelauf: true, heute: '2099-01-01', log: still })
  assert.equal(neu.stand, bisher.stand, 'kein Lauf ist jünger als der Stand der Daten')
  assert.deepEqual(neu.prueflaeufe.laeufe, bisher.prueflaeufe.laeufe)
  assert.equal(neu.herkunft.arbeitsordner, bisher.herkunft.arbeitsordner)
  assert.equal(neu.herkunft.verfahren, bisher.herkunft.verfahren)
})

test('findeNotizordner findet den Ordner aus dem Übergabedokument', async () => {
  assert.equal(await findeNotizordner(vault), join(vault, '00_Vault', '10_KI-Mitarbeiter'))
})

test('findeNotizordner nimmt auch den Notizordner selbst', async () => {
  const ordner = join(vault, '00_Vault', '10_KI-Mitarbeiter')
  assert.equal(await findeNotizordner(ordner), ordner)
})

test('findeNotizordner sucht den Ordner, wenn er woanders liegt', async () => {
  assert.equal(
    await findeNotizordner(vaultFlach),
    join(vaultFlach, 'Notizen', 'KI-Mitarbeiter'),
  )
})

test('findeNotizordner meldet einen Ordner ohne Notizen als leer', async () => {
  assert.equal(await findeNotizordner(vaultLeer), null)
})

test('findeDatei nimmt den ersten Treffer und achtet nicht auf Grossschreibung', async () => {
  const ordner = join(vault, '00_Vault', '10_KI-Mitarbeiter')
  assert.equal(await findeDatei(['entscheidungen.md'], [ordner]), join(ordner, 'Entscheidungen.md'))
  assert.equal(await findeDatei(['Fehlt.md'], [ordner]), null)
})

test('exportieren liest einen Vault mit abweichendem Aufbau', async () => {
  const neu = await exportieren({ vault: vaultFlach, ziel: standAlt, probelauf: true, log: still })
  assert.deepEqual(
    neu.prueflaeufe.laeufe.map((l) => l.id),
    ['2026-08-27-usecases', '2026-09-08-stichprobe'],
  )
  assert.equal(neu.stand, '2026-09-08')
  assert.deepEqual(neu.entscheidungen.map((e) => e.entscheidung), [
    'Eine Entscheidung, die der Vault nicht mehr führt',
    'Der Reviewer heißt Fritz',
    'Der Notizordner liegt außerhalb von 00_Vault',
  ])
  assert.equal(neu.herkunft.notizordner, 'Notizen/KI-Mitarbeiter')
  assert.deepEqual(neu.offenePunkte, alt.offenePunkte, 'ohne Datei bleibt der bisherige Stand')
})
