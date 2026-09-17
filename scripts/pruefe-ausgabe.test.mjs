import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { linkZiel, pruefeAufbau, pruefeSatzzeichen, pruefen, sichtbarerText } from './pruefe-ausgabe.mjs'

const still = () => {}
const seite = (rumpf, lang = 'de') => `<!DOCTYPE html><html lang="${lang}"><body>${rumpf}</body></html>`

test('sichtbarerText lässt Skripte und Grafiken weg und klebt Inline-Elemente zusammen', () => {
  const text = sichtbarerText('<p>Stand <b>17.09.</b><!-- -->.</p><script>a..b</script><svg><text>x..y</text></svg>')
  assert.equal(text.trim(), 'Stand 17.09..')
})

test('pruefeSatzzeichen findet doppelte Zeichen, nicht aber Datum mit Komma oder Auslassung', () => {
  assert.equal(pruefeSatzzeichen('Stand 11.09.. Das Ziel').length, 1)
  assert.equal(pruefeSatzzeichen('eins,, zwei').length, 1)
  assert.equal(pruefeSatzzeichen('Stand,. Weiter').length, 1)
  assert.equal(pruefeSatzzeichen('Moretz . Weiter').length, 1)
  assert.deepEqual(pruefeSatzzeichen('am 17.09., danach … und so weiter...'), [])
})

test('pruefeAufbau verlangt lang, eine h1, lückenlose Ebenen und beschriftete Grafiken', () => {
  assert.deepEqual(pruefeAufbau(seite('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>')), [])
  assert.ok(pruefeAufbau(seite('<h1>A</h1>', 'en')).includes('<html> ohne lang="de"'))
  assert.ok(pruefeAufbau(seite('<h2>A</h2>')).includes('0 h1 statt genau einer'))
  assert.ok(pruefeAufbau(seite('<h1>A</h1><h3>B</h3>')).includes('Überschrift springt von h1 auf h3'))
  assert.equal(pruefeAufbau(seite('<h1>A</h1><svg viewBox="0 0 1 1"></svg>')).length, 1)
  assert.deepEqual(pruefeAufbau(seite('<h1>A</h1><svg role="img" aria-label="Bild"></svg><svg aria-hidden="true"></svg>')), [])
  assert.equal(pruefeAufbau(seite('<h1>A</h1><img src="a.png">')).length, 1)
})

test('linkZiel verlangt den basePath und löst Seite und Anker auf', () => {
  assert.deepEqual(linkZiel('/stand/', '/kiKollege'), { fehler: 'ohne basePath /kiKollege' })
  assert.deepEqual(linkZiel('/kiKollege/stand/#plan', '/kiKollege'), { seite: 'stand/index.html', anker: 'plan' })
  assert.deepEqual(linkZiel('/kiKollege/', '/kiKollege'), { seite: 'index.html', anker: null })
  assert.deepEqual(linkZiel('#oben', '/kiKollege'), { seite: null, anker: 'oben' })
  assert.deepEqual(linkZiel('/stand/', ''), { seite: 'stand/index.html', anker: null })
})

test('pruefen findet tote Links und fehlende Anker in einer gebauten Seite', async () => {
  const ausgabe = await mkdtemp(join(tmpdir(), 'pruefe-ausgabe-'))
  await mkdir(join(ausgabe, 'stand'))
  await mkdir(join(ausgabe, '_next'))
  await writeFile(
    join(ausgabe, 'index.html'),
    seite(
      '<h1>Start</h1><a href="#fehlt">x</a><a href="/k/stand/#plan">y</a>' +
        '<a href="/k/weg/">z</a><a href="/stand/">w</a><a href="https://example.org/">e</a>',
    ),
  )
  await writeFile(join(ausgabe, 'stand', 'index.html'), seite('<h1>Stand</h1><section id="plan"></section>'))
  await writeFile(join(ausgabe, '_next', 'x.html'), 'kein Dokument')

  const zeilen = []
  const anzahl = await pruefen({ ausgabe, basis: '/k', log: (z) => zeilen.push(z) })
  assert.equal(anzahl, 3)
  assert.ok(zeilen.includes('index.html: Anker #fehlt fehlt auf der Seite'))
  assert.ok(zeilen.includes('index.html: Link /k/weg/ führt ins Leere'))
  assert.ok(zeilen.includes('index.html: Link /stand/ ohne basePath /k'))
  assert.equal(await pruefen({ ausgabe: join(ausgabe, 'stand'), log: still }), 0)
})
