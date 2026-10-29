import { test } from 'node:test'
import assert from 'node:assert/strict'

import { doppelteGrafiken, fehlende, ohneArchiv, stuecke } from './pruefe-labor.mjs'

test('doppelteGrafiken meldet eine Grafik, die zweimal dasteht', () => {
  const eine = '<svg role="img" aria-label="Termine der Meilensteine"></svg>'
  const andere = '<svg aria-label="Graph der Ablage" role="img"></svg>'
  assert.deepEqual(doppelteGrafiken(eine + andere), [])
  assert.deepEqual(doppelteGrafiken(eine + andere + eine), ['Termine der Meilensteine'])
})

test('stuecke nimmt Text zwischen Tags, ohne Kommentare und kurze Reste', () => {
  const s = stuecke('<p>Ein Satz.<!-- -->Noch einer</p><b>ab</b><i>Fritz &amp; Hermes</i>')
  assert.deepEqual([...s].sort(), ['Ein Satz.', 'Fritz & Hermes', 'Noch einer'])
})

test('fehlende meldet, was im Labor nicht mehr steht', () => {
  assert.deepEqual(fehlende('<p>Bleibt da</p><p>Fällt weg</p>', '<div><p>Bleibt da</p></div>'), ['Fällt weg'])
  assert.deepEqual(fehlende('<p>Bleibt da</p>', '<p>Bleibt da</p><p>Neu dazu</p>'), [])
})

test('ohneArchiv lässt die Abschnitte des Archivs weg', () => {
  const html = '<main><section id="plan"><p>Plan</p></section><section id="chronik"><p>Chronik</p></section></main>'
  const rest = ohneArchiv(html)
  assert.ok(rest.includes('Plan'))
  assert.ok(!rest.includes('Chronik'))
})
