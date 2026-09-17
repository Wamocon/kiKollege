import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'

import { NUR_INTERN, interneTexte, pruefen } from './pruefe-oeffentlich.mjs'

const still = () => {}

test('interneTexte sammelt lange Texte aus internen Objekten', () => {
  const treffer = interneTexte({
    offen: { freigabe: 'oeffentlich', satz: 'Dieser Satz darf nach außen gehen.' },
    geheim: { freigabe: 'intern', satz: 'Dieser Satz bleibt im Haus und ist lang genug.' },
  })
  assert.deepEqual([...treffer], ['Dieser Satz bleibt im Haus und ist lang genug.'])
})

test('interneTexte vererbt die Stufe an verschachtelte Felder', () => {
  const treffer = interneTexte({
    block: {
      freigabe: 'intern',
      tief: { zeilen: [{ text: 'Auch hier drin steht etwas Internes drin.' }] },
    },
  })
  assert.deepEqual([...treffer], ['Auch hier drin steht etwas Internes drin.'])
})

test('interneTexte übergeht kurze Werte und technische Schlüssel', () => {
  const treffer = interneTexte({
    a: { freigabe: 'intern', kurz: 'zu kurz', datei: 'ein-sehr-langer-dateiname.md' },
  })
  assert.equal(treffer.size, 0)
})

test('pruefen findet einen internen Satz in der Ausgabe', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(
    daten,
    JSON.stringify({ a: { freigabe: 'intern', satz: 'Der Umzug auf eigene Hardware bis 11.09.' } }),
  )
  await writeFile(join(ordner, 'index.html'), '<p>Der Umzug auf eigene Hardware bis 11.09.</p>')

  const funde = await pruefen({ ausgabe: ordner, daten, log: still })
  assert.equal(funde.length, 1)
  assert.match(funde[0].satz, /eigene Hardware/)
})

test('pruefen erkennt einen Satz auch hinter HTML-Entitäten', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(
    daten,
    JSON.stringify({ a: { freigabe: 'intern', satz: 'Prüfung & Abnahme laufen getrennt.' } }),
  )
  await writeFile(join(ordner, 'index.html'), '<p>Prüfung &amp; Abnahme laufen getrennt.</p>')

  const funde = await pruefen({ ausgabe: ordner, daten, log: still })
  assert.equal(funde.length, 1)
})

test('pruefen findet einen internen Satz auch im JavaScript und in der RSC-Datei', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(
    daten,
    JSON.stringify({ a: { freigabe: 'intern', satz: 'Die Grenze hängt noch nicht am Profil.' } }),
  )
  await writeFile(join(ordner, 'index.html'), '<p>Nichts zu sehen.</p>')
  // Im JavaScript steht das ä als Unicode-Escape, so wie ein Bundler es schreiben kann.
  await writeFile(join(ordner, 'chunk.js'), 'var a={satz:"Die Grenze h\\u00e4ngt noch nicht am Profil."};')
  await writeFile(join(ordner, 'index.txt'), '1:["Die Grenze hängt noch nicht am Profil."]')

  const funde = await pruefen({ ausgabe: ordner, daten, log: still })
  assert.deepEqual(
    funde.map((f) => basename(f.datei)).sort(),
    ['chunk.js', 'index.txt'],
  )
})

test('pruefen übergeht Dateien, die nicht ausgeliefert werden', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(
    daten,
    JSON.stringify({ a: { freigabe: 'intern', satz: 'Nur in einer Kartendatei zu finden.' } }),
  )
  await writeFile(join(ordner, 'index.html'), '<p>Nichts zu sehen.</p>')
  await writeFile(join(ordner, 'chunk.js.map'), 'Nur in einer Kartendatei zu finden.')

  assert.deepEqual(await pruefen({ ausgabe: ordner, daten, log: still }), [])
})

test('pruefen meldet eine Ausgabe ohne HTML als Fehler', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(daten, JSON.stringify({}))
  await writeFile(join(ordner, 'chunk.js'), 'var a=1;')
  await assert.rejects(() => pruefen({ ausgabe: ordner, daten, log: still }), /Erst bauen/)
})

test('pruefen meldet eine leere Ausgabe als Fehler', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(daten, JSON.stringify({}))
  await assert.rejects(() => pruefen({ ausgabe: ordner, daten, log: still }), /Erst bauen/)
})

test('pruefen schlägt bei einem Eigennamen an, auch ohne internes Datenfeld', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(daten, JSON.stringify({ a: { freigabe: 'oeffentlich', satz: 'Alles harmlos hier.' } }))
  await writeFile(join(ordner, 'index.html'), `<p>Der Dauerbetrieb läuft auf ${NUR_INTERN[0]}.</p>`)

  const funde = await pruefen({ ausgabe: ordner, daten, log: still })
  assert.equal(funde.length, 1)
  assert.match(funde[0].satz, /^Eigenname: /)
})

test('pruefen lässt eine Seite ohne Eigennamen durch', async () => {
  const ordner = await mkdtemp(join(tmpdir(), 'pruefe-'))
  const daten = join(ordner, 'stand.json')
  await writeFile(daten, JSON.stringify({}))
  await writeFile(join(ordner, 'index.html'), '<p>Der Dauerbetrieb läuft auf dem KI-Rechner.</p>')

  assert.deepEqual(await pruefen({ ausgabe: ordner, daten, log: still }), [])
})
