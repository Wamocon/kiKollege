import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { fuerStimme, woerterVon } from './stimme.mjs'
import { HOECHSTENS, fingerabdruck, kompositionen, systemdemoDaten, zeitplan } from './systemdemo-daten.mjs'

const daten = () => JSON.parse(readFileSync('data/projektstand.json', 'utf8'))
/** Gemessene Zeiten wie von Piper, hier aus der Wortzahl geschätzt */
const geschaetzt = (w) => Object.fromEntries(w.stimme.map((z) => [z.id, { dauer: woerterVon(z).length / 2.2, anker: {} }]))
const koepfe = { orchestrator: { kopf: '<svg id="k"><use href="#k"/></svg>' }, reviewer: { kopf: '<svg id="k"><use href="#k"/></svg>' } }

test('der Befund kommt aus den Daten und trägt Fundstelle, Frage und Option', () => {
  const d = daten()
  const w = systemdemoDaten(d)
  assert.equal(w.befund.stufe, d.beispielbefund.stufe)
  assert.equal(`${w.befund.falsch} ${w.befund.richtig}`, d.beispielbefund.text)
  assert.ok(d.beispielbefund.fundstelle.includes(`Frage ${w.befund.frage}, Option ${w.befund.option}`))
  assert.ok(w.befund.falsch.includes(w.befund.markiert))
})

test('Weg, Pflichtangaben und Profil stehen so in den Daten', () => {
  const d = daten()
  const w = systemdemoDaten(d)
  const profil = d.techstack.ablauf.schritte.find((s) => s.titel === 'Profil').text
  assert.equal(w.stimme.find((z) => z.id === 'profil-1').sichtbar, profil)
  for (const t of w.teile) assert.ok(profil.includes(t), t)
  assert.equal(w.angaben.join(', '), d.anleitung.zeilen.find((z) => z.wer === 'Fritz').angaben)
})

test('ändert sich ein Schritt, ändert sich der Fingerabdruck', () => {
  const d = daten()
  const vorher = fingerabdruck(systemdemoDaten(d))
  d.techstack.ablauf.schritte.find((s) => s.titel === 'Zurück').text = 'Das Ergebnis steht auf der Karte. Der Orchestrator reicht es weiter.'
  assert.notEqual(fingerabdruck(systemdemoDaten(d)), vorher)
})

test('passt der Befund nicht mehr ins Muster, bricht der Bau ab, statt etwas zu erfinden', () => {
  const d = daten()
  d.beispielbefund.fundstelle = 'irgendwo'
  assert.throws(() => systemdemoDaten(d), /Fundstelle/)
})

test('der Film bleibt unter der Grenze, schreibt jede Station und nennt keinen Menschen beim Namen', () => {
  const w = systemdemoDaten(daten())
  const plan = zeitplan(w, geschaetzt(w))
  assert.ok(plan.dauer < HOECHSTENS)
  const dateien = kompositionen(w, koepfe, plan)
  for (const s of w.stationen) assert.ok(dateien[`compositions/${s.id}.html`], s.id)
  assert.ok(dateien['index.html'].includes(`data-duration="${plan.dauer}"`))
  for (const inhalt of Object.values(dateien)) assert.doesNotMatch(inhalt, /Erwin/)
})

test('die Stimme liest Paragraf, Gesetzbuch und Qwen aus', () => {
  assert.equal(fuerStimme('§ 168 SGB IX'), 'Paragraf 168 Sozialgesetzbuch neun')
  assert.equal(fuerStimme('an Qwen.'), 'an Kwenn.')
})
