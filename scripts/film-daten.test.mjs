import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { DAUER, SZENEN, anfang, filmDaten, fingerabdruck, kompositionen } from './film-daten.mjs'
import { vergleiche } from './pruefe-film.mjs'

const daten = () => JSON.parse(readFileSync('data/projektstand.json', 'utf8'))

test('anfang nimmt ganze Sätze, bis fünf Wörter beisammen sind, und schneidet kein Datum', () => {
  assert.equal(anfang('Fertig. Fritz meldet, wo die Befunde liegen. Noch ein Satz.'), 'Fertig. Fritz meldet, wo die Befunde liegen.')
  assert.equal(
    anfang('Nachschärfen am 30.10., 06.11. und 13.11., nach jeder Runde ein Lauf. Am 20.11. müssen alle halten'),
    'Nachschärfen am 30.10., 06.11. und 13.11., nach jeder Runde ein Lauf.',
  )
  assert.equal(anfang('Ohne Punkt am Ende'), 'Ohne Punkt am Ende.')
})

test('Die Einstellungen schließen lückenlos aneinander und füllen den Film', () => {
  let ende = 0
  for (const s of SZENEN) {
    assert.equal(Number(s.start.toFixed(3)), Number(ende.toFixed(3)), `${s.id} beginnt bei ${s.start}`)
    ende = s.start + s.dauer
  }
  assert.equal(Number(ende.toFixed(3)), DAUER)
})

test('filmDaten liest Meilensteine, Prüfstand und Risiko aus den Daten', () => {
  const w = filmDaten(daten())
  const plan = daten().meilensteinplanAktuell
  assert.equal(w.zeitstrahl.meilensteine.length, plan.meilensteine.length)
  for (const m of w.zeitstrahl.meilensteine) assert.ok(m.x >= 0 && m.x <= 100, `${m.id} liegt auf dem Strahl`)
  assert.ok(w.pruefstand.gelernt <= w.pruefstand.faelle)
  assert.ok(plan.risiken.some((r) => r.nr === w.risiko.nr && r.stufe === 'hoch'))
  assert.equal(w.nachrichten.length, daten().anleitung.schritte.length)
})

test('Der Fingerabdruck ändert sich, wenn sich eine gezeigte Zahl ändert', () => {
  const d = daten()
  const vorher = fingerabdruck(filmDaten(d))
  assert.equal(fingerabdruck(filmDaten(daten())), vorher)
  d.training.laeufe.zeilen.at(-1).gelernt += 1
  assert.notEqual(fingerabdruck(filmDaten(d)), vorher)
})

test('vergleiche meldet einen veralteten und einen fehlenden Film', () => {
  const d = daten()
  const abdruck = fingerabdruck(filmDaten(d))
  assert.equal(vergleiche({ stand: d.stand, fingerabdruck: abdruck }, d).aktuell, true)
  assert.equal(vergleiche({ stand: d.stand, fingerabdruck: 'anders' }, d).aktuell, false)
  assert.equal(vergleiche({ stand: d.stand, fingerabdruck: '' }, d).aktuell, false)
})

test('Jede Komposition registriert ihre Zeitleiste unter ihrer Kennung', () => {
  const dateien = kompositionen(filmDaten(daten()))
  assert.match(dateien['index.html'], new RegExp(`data-duration="${DAUER}"`))
  for (const s of SZENEN) {
    const html = dateien[`compositions/${s.id}.html`]
    assert.ok(html, `${s.id} fehlt`)
    assert.match(html, new RegExp(`data-composition-id="${s.id}"`))
    assert.match(html, new RegExp(`window.__timelines\\["${s.id}"\\] = tl`))
    assert.match(dateien['index.html'], new RegExp(`data-composition-src="compositions/${s.id}.html"`))
  }
})

test('Text aus den Daten kommt maskiert in den Film', () => {
  const d = daten()
  d.produktseite.name = 'ki<Kollege>'
  const html = kompositionen(filmDaten(d))['compositions/vorhang.html']
  assert.ok(html.includes('ki&lt;Kollege&gt;'))
  assert.ok(!html.includes('ki<Kollege>'))
})
