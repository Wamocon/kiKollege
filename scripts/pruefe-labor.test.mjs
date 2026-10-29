import { test } from 'node:test'
import assert from 'node:assert/strict'

import { fehlende, ohneArchiv, stuecke } from './pruefe-labor.mjs'

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
