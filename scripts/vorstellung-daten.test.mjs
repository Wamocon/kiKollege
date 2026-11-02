import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { uebersetze } from './figuren-svg.mjs'
import { vergleicheVorstellung } from './pruefe-film.mjs'
import { dauer, fingerabdruck, kompositionen, vorstellungDaten } from './vorstellung-daten.mjs'

const daten = () => JSON.parse(readFileSync('data/projektstand.json', 'utf8'))
const figuren = (w) => Object.fromEntries(w.stopps.map((s) => [s.kopf, { linie: '<svg></svg>', kopf: '<svg></svg>' }]))

test('jeder Halt gehört zu einem Kopf der Mannschaft, der schon arbeitet', () => {
  const d = daten()
  for (const s of vorstellungDaten(d).stopps) {
    const k = d.mannschaft.koepfe.find((x) => x.id === s.kopf)
    assert.ok(k, s.kopf)
    assert.equal(k.zustand, 'arbeitet', `${s.kopf} arbeitet noch nicht`)
    assert.ok(s.rolle)
  }
})

test('Pakete und Trainingsstand kommen aus den Daten, nicht aus dem Text des Films', () => {
  const d = daten()
  d.entstanden.projekte.find((p) => p.id === 'wmc-inventar').status = 'im Bau, 20 von 25 Paketen'
  const w = vorstellungDaten(d)
  const bau = w.stopps.find((s) => s.beispiel.art === 'projekte').beispiel.bau
  assert.equal(bau.fertig, 20)
  assert.equal(bau.gesamt, 25)
  const letzter = d.training.laeufe.zeilen.at(-1).gelernt
  assert.match(w.stopps.find((s) => s.beispiel.art === 'chat').beispiel.training, new RegExp(`^Noch im Training: ${letzter} von `))
})

test('die Prüfung meldet den Film als veraltet, sobald sich eine gezeigte Zahl ändert', () => {
  const d = daten()
  const stand = { stand: d.stand, fingerabdruck: fingerabdruck(vorstellungDaten(d)) }
  assert.equal(vergleicheVorstellung(stand, d).aktuell, true)
  d.entstanden.projekte.find((p) => p.id === 'wmc-inventar').status = 'im Bau, 20 von 25 Paketen'
  assert.equal(vergleicheVorstellung(stand, d).aktuell, false)
})

test('der Film schreibt je Halt eine Komposition und nennt keinen Menschen', () => {
  const w = vorstellungDaten(daten())
  const dateien = kompositionen(w, figuren(w))
  assert.ok(dateien['index.html'].includes(`data-duration="${dauer(w)}"`))
  w.stopps.forEach((_, i) => assert.ok(dateien[`compositions/stopp${i + 1}.html`]))
  for (const inhalt of Object.values(dateien)) assert.doesNotMatch(inhalt, /Erwin/)
})

test('die Figuren lassen sich ohne Next.js übersetzen', () => {
  const js = uebersetze(`import './kollegen.css'\nimport { LINIE } from './basis'\nexport const X = () => <g {...LINIE} />`)
  assert.doesNotMatch(js, /kollegen\.css/)
  assert.match(js, /from '\.\/basis\.mjs'/)
  assert.match(js, /jsx/)
})
