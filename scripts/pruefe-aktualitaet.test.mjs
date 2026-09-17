import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { bewerten, datumDerNotiz, pruefen } from './pruefe-aktualitaet.mjs'

const still = () => {}

test('datumDerNotiz nimmt das jüngste Datum aus Name und Frontmatter', () => {
  assert.equal(datumDerNotiz('2026-09-10 Logbuch.md', {}), '2026-09-10')
  assert.equal(datumDerNotiz('Plan.md', { stand: '12.09.2026' }), '2026-09-12')
  assert.equal(datumDerNotiz('2026-09-10 Plan.md', { aktualisiert: '2026-09-15' }), '2026-09-15')
  assert.equal(datumDerNotiz('Ohne Datum.md', { typ: 'konzept' }), null)
})

test('bewerten rechnet das Alter und die Frist', () => {
  assert.deepEqual(bewerten({ erzeugt: '2026-09-10', fristTage: 7, heute: '2026-09-17', neuere: 0 }), {
    alter: 7,
    ueberFrist: false,
    nachzutragen: false,
  })
  assert.equal(bewerten({ erzeugt: '2026-09-10', fristTage: 7, heute: '2026-09-18', neuere: 0 }).ueberFrist, true)
  assert.equal(bewerten({ erzeugt: '2026-09-10', fristTage: 7, heute: '2026-09-11', neuere: 2 }).nachzutragen, true)
})

async function ablageMitNotizen() {
  const ablage = await mkdtemp(join(tmpdir(), 'aktualitaet-'))
  await mkdir(join(ablage, 'Logbuch'))
  await mkdir(join(ablage, 'Ignoriert'))
  await mkdir(join(ablage, '.obsidian'))
  await mkdir(join(ablage, '.versteckt'))
  await writeFile(join(ablage, '.obsidian', 'app.json'), JSON.stringify({ userIgnoreFilters: ['Ignoriert/'] }))
  await writeFile(join(ablage, 'Logbuch', '2026-09-09 Alt.md'), '# alt\n')
  await writeFile(join(ablage, 'Logbuch', '2026-09-10 Gleicher Tag.md'), '# gleich\n')
  await writeFile(join(ablage, 'Logbuch', '2026-09-12 Neu.md'), '# neu\n')
  await writeFile(join(ablage, 'Plan.md'), '---\nstand: 2026-09-11\n---\n')
  await writeFile(join(ablage, 'Frist.md'), '---\ndatum: 2026-10-16\n---\n')
  await writeFile(join(ablage, 'Ignoriert', '2026-09-13 Weg.md'), '# weg\n')
  await writeFile(join(ablage, '.versteckt', '2026-09-13 Weg.md'), '# weg\n')
  const daten = join(ablage, 'stand.json')
  await writeFile(daten, JSON.stringify({ stand: '2026-09-10', herkunft: { erzeugt: '2026-09-10', fristTage: 7 } }))
  return { ablage, daten }
}

test('pruefen zählt jüngere Notizen je Ordner und lässt Ausgeschlossenes aus', async () => {
  const { ablage, daten } = await ablageMitNotizen()
  const zeilen = []
  const ergebnis = await pruefen({ ablage, daten, heute: '2026-09-14', log: (z) => zeilen.push(z) })
  assert.equal(ergebnis.neuere, 2, 'gleicher Tag, Zukunft, Ignoriertes und Verstecktes zählen nicht')
  assert.deepEqual([...ergebnis.jeOrdner], [['Logbuch', 1], ['.', 1]])
  assert.equal(ergebnis.nachzutragen, true)
  assert.ok(zeilen.includes('  Logbuch: 1'))
  assert.ok(!zeilen.some((z) => z.includes('Neu.md')), 'keine Dateinamen in der Ausgabe')
})

test('pruefen meldet nichts, wenn nichts Jüngeres da ist und die Frist hält', async () => {
  const { ablage, daten } = await ablageMitNotizen()
  const ergebnis = await pruefen({ ablage, daten, heute: '2026-09-10', log: still })
  assert.equal(ergebnis.neuere, 0)
  assert.equal(ergebnis.nachzutragen, false)
})
