import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { REIHE, SOLL, anfang, filmDaten, fingerabdruck, kompositionen, laengePasst, zeitplan } from './film-daten.mjs'
import { vergleiche } from './pruefe-film.mjs'
import { woerterVon } from './stimme.mjs'

const daten = () => JSON.parse(readFileSync('data/projektstand.json', 'utf8'))
/** Messungen ohne Piper: jede Zeile dauert so lange, wie ihre Wörter brauchen */
const messung = (w, jeWort = 0.4) => Object.fromEntries(w.stimme.map((z) => [z.id, { dauer: woerterVon(z).length * jeWort, anker: {} }]))

test('anfang nimmt ganze Sätze, bis fünf Wörter beisammen sind, und schneidet kein Datum', () => {
  assert.equal(anfang('Fertig. Fritz meldet, wo die Befunde liegen. Noch ein Satz.'), 'Fertig. Fritz meldet, wo die Befunde liegen.')
  assert.equal(
    anfang('Nachschärfen am 30.10., 06.11. und 13.11., nach jeder Runde ein Lauf. Am 20.11. müssen alle halten'),
    'Nachschärfen am 30.10., 06.11. und 13.11., nach jeder Runde ein Lauf.',
  )
  assert.equal(anfang('Ohne Punkt am Ende'), 'Ohne Punkt am Ende.')
})

test('Die Einstellungen schließen lückenlos aneinander, die Länge kommt aus den Messungen', () => {
  const w = filmDaten(daten())
  const plan = zeitplan(w, messung(w))
  let ende = 0
  for (const s of REIHE) {
    assert.equal(plan.szenen[s.id].start, Number(ende.toFixed(3)), `${s.id} beginnt bei ${plan.szenen[s.id].start}`)
    ende = plan.szenen[s.id].ende
  }
  assert.equal(plan.dauer, Number(ende.toFixed(3)))
  const laenger = zeitplan(w, messung(w, 0.5))
  assert.ok(laenger.dauer > plan.dauer)
})

test('Jedes Wort kommt nach dem vorigen, und das letzte Wort fällt vor dem Ende', () => {
  const w = filmDaten(daten())
  const plan = zeitplan(w, messung(w))
  let vorher = -1
  for (const z of w.stimme) {
    const p = plan.zeilen[z.id]
    assert.equal(p.woerter.length, woerterVon(z).length, z.id)
    for (const t of p.woerter) {
      assert.ok(t > vorher, `${z.id}: ${t} nach ${vorher}`)
      vorher = t
    }
    assert.ok(p.start + p.dauer <= plan.dauer)
  }
})

test('Die Längenprüfung lässt höchstens eine Sekunde Abweichung zu', () => {
  assert.equal(laengePasst({ dauer: SOLL + 0.9 }), true)
  assert.equal(laengePasst({ dauer: SOLL - 0.9 }), true)
  assert.equal(laengePasst({ dauer: SOLL + 1.5 }), false)
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

test('Gesagt wird, was die Daten sagen: Stand des Orchestrators und Termin des Teams', () => {
  const d = daten()
  const text = filmDaten(d).stimme.map((z) => z.sichtbar).join(' ')
  const letzter = d.training.laeufe.zeilen.at(-1)
  const faelle = d.training.laeufe.bereiche.reduce((s, b) => s + b.faelle, 0)
  assert.ok(text.includes(`${letzter.gelernt} von ${faelle}`), text)
  const team = d.meilensteinplanAktuell.meilensteine.find((m) => m.id === d.anleitung.teamAb)
  const [, monat, tag] = team.termin.split('-')
  assert.ok(text.includes(`am ${tag}.${monat}.`), text)
})

test('Die Stimme hat eine eigene Schreibweise, das Bild und die Untertitel behalten die sichtbare', () => {
  const w = filmDaten(daten())
  const name = w.stimme.find((z) => z.id === 'vorhang-name')
  assert.equal(name.sichtbar, 'kiKollege.')
  assert.equal(name.gesprochen, 'Ka-I-Kollege.')
  const plan = zeitplan(w, messung(w))
  for (const html of Object.values(kompositionen(w, plan))) assert.doesNotMatch(html, /Ka-I|Wamokon|dreiundzwanzig/)
})

test('Der Fingerabdruck ändert sich, wenn sich eine gezeigte Zahl ändert', () => {
  const d = daten()
  const vorher = fingerabdruck(filmDaten(d))
  assert.equal(fingerabdruck(filmDaten(daten())), vorher)
  d.training.laeufe.zeilen.at(-1).gelernt += 1
  assert.notEqual(fingerabdruck(filmDaten(d)), vorher)
})

test('Der Fingerabdruck ändert sich, wenn sich der gesprochene Text ändert', () => {
  const d = daten()
  const vorher = fingerabdruck(filmDaten(d))
  d.produktseite.vorstellung.kern[0] = 'Ein anderer Satz.'
  assert.notEqual(fingerabdruck(filmDaten(d)), vorher)
  const w = filmDaten(daten())
  const anders = { ...w, stimme: w.stimme.map((z) => ({ ...z, gesprochen: `${z.gesprochen} ` })) }
  assert.notEqual(fingerabdruck(anders), fingerabdruck(w))
})

test('vergleiche meldet einen veralteten und einen fehlenden Film', () => {
  const d = daten()
  const abdruck = fingerabdruck(filmDaten(d))
  assert.equal(vergleiche({ stand: d.stand, fingerabdruck: abdruck }, d).aktuell, true)
  assert.equal(vergleiche({ stand: d.stand, fingerabdruck: 'anders' }, d).aktuell, false)
  assert.equal(vergleiche({ stand: d.stand, fingerabdruck: '' }, d).aktuell, false)
})

test('Jede Komposition registriert ihre Zeitleiste unter ihrer Kennung, die Wurzel trägt die Tonspur', () => {
  const w = filmDaten(daten())
  const plan = zeitplan(w, messung(w))
  const dateien = kompositionen(w, plan)
  assert.match(dateien['index.html'], new RegExp(`data-duration="${plan.dauer}"`))
  assert.match(dateien['index.html'], /<audio id="stimme" src="assets\/stimme\.wav"/)
  for (const s of REIHE) {
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
  const w = filmDaten(d)
  const html = kompositionen(w, zeitplan(w, messung(w)))['compositions/vorhang.html']
  assert.ok(html.includes('ki&lt;Kollege&gt;'))
  assert.ok(!html.includes('ki<Kollege>'))
})

test('Im Bild und in der Stimme kommt das Wort Labor nicht vor, die Adresse ist die Startseite', () => {
  const w = filmDaten(daten())
  const dateien = kompositionen(w, zeitplan(w, messung(w)))
  for (const z of w.stimme) assert.doesNotMatch(`${z.sichtbar} ${z.gesprochen}`, /labor/i)
  for (const [pfad, html] of Object.entries(dateien)) {
    assert.doesNotMatch(html.replace(/<!--[\s\S]*?-->/g, ''), /labor/i, pfad)
  }
  assert.match(dateien['compositions/schluss.html'], /wamocon\.github\.io\/kiKollege ·/)
})

test('Der Film enthält keinen Zufall und keine Uhrzeit', () => {
  const w = filmDaten(daten())
  for (const html of Object.values(kompositionen(w, zeitplan(w, messung(w))))) {
    assert.doesNotMatch(html, /Math\.random|Date\.now|repeat:\s*-1|setTimeout|setInterval/)
  }
})
