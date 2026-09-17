import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { fehlendes, kennung, pruefen } from './pruefe-bestand.mjs'

const still = () => {}

test('kennung nimmt das erste tragende Feld', () => {
  assert.equal(kennung({ id: 'a', titel: 'b' }), 'id=a')
  assert.equal(kennung({ nr: 3 }), 'nr=3')
  assert.equal(kennung({ punkt: 'Befunde bewerten' }), 'punkt=Befunde bewerten')
  assert.equal(kennung({ datum: '2026-09-09', entscheidung: 'X' }), 'datum=2026-09-09|X')
  assert.equal(kennung({ zahl: 7 }), null, 'ohne tragendes Feld nur die Anzahl')
  assert.equal(kennung('Text'), null)
})

test('fehlendes schweigt, wenn sich nur ein Wert ändert', () => {
  assert.deepEqual(fehlendes({ stand: '2026-09-05' }, { stand: '2026-09-09' }), [])
  assert.deepEqual(fehlendes({ a: [1, 2] }, { a: [1, 2, 3] }), [], 'länger ist erlaubt')
})

test('fehlendes findet einen entfallenen Schlüssel', () => {
  const funde = fehlendes({ a: 1, b: 2 }, { a: 1 })
  assert.deepEqual(funde, [{ pfad: 'b', art: 'fehlt' }])
})

test('fehlendes findet eine kürzere Liste', () => {
  const funde = fehlendes({ liste: [{ id: 'x' }, { id: 'y' }] }, { liste: [{ id: 'x' }] })
  assert.equal(funde.length, 2)
  assert.deepEqual(funde[0], { pfad: 'liste', art: 'kürzer', alt: 2, neu: 1 })
  assert.deepEqual(funde[1], { pfad: 'liste[id=y]', art: 'entfallen' })
})

test('fehlendes findet einen ausgetauschten Eintrag trotz gleicher Länge', () => {
  const funde = fehlendes({ liste: [{ id: 'x' }, { id: 'y' }] }, { liste: [{ id: 'x' }, { id: 'z' }] })
  assert.deepEqual(funde, [{ pfad: 'liste[id=y]', art: 'entfallen' }])
})

test('fehlendes findet einen geleerten Satz', () => {
  assert.deepEqual(fehlendes({ satz: 'Steht da.' }, { satz: '' }), [{ pfad: 'satz', art: 'geleert' }])
  assert.deepEqual(fehlendes({ satz: 'Steht da.' }, { satz: null }), [{ pfad: 'satz', art: 'geleert' }])
  assert.deepEqual(fehlendes({ satz: null }, { satz: null }), [], 'was leer war, darf leer bleiben')
})

test('fehlendes geht in die Tiefe', () => {
  const alt = { a: { b: { c: [{ nr: 1 }, { nr: 2 }] } } }
  const neu = { a: { b: { c: [{ nr: 1 }] } } }
  const funde = fehlendes(alt, neu)
  assert.ok(funde.some((f) => f.pfad === 'a.b.c[nr=2]' && f.art === 'entfallen'))
})

test('fehlendes merkt, wenn aus einer Liste etwas anderes wird', () => {
  assert.deepEqual(fehlendes({ a: [1] }, { a: 'Text' }), [{ pfad: 'a', art: 'keine Liste mehr' }])
  assert.deepEqual(fehlendes({ a: { b: 1 } }, { a: [1] }), [{ pfad: 'a', art: 'kein Objekt mehr' }])
})

test('pruefen liest zwei Dateien und meldet den Verlust', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'bestand-'))
  const alt = join(ordner, 'alt.json')
  const neu = join(ordner, 'neu.json')
  await writeFile(alt, JSON.stringify({ entscheidungen: [{ id: 'a' }, { id: 'b' }] }))
  await writeFile(neu, JSON.stringify({ entscheidungen: [{ id: 'a' }] }))

  const funde = await pruefen({ alt, neu, log: still })
  assert.ok(funde.some((f) => f.art === 'entfallen'))
})

test('der heutige Stand verliert nichts gegen sich selbst', async () => {
  const datei = join('data', 'projektstand.json')
  assert.deepEqual(await pruefen({ alt: datei, neu: datei, log: still }), [])
})
