import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { figurenAlsSvg, uebersetze } from './figuren-svg.mjs'
import { vergleicheVorstellung } from './pruefe-film.mjs'
import { woerterVon } from './stimme.mjs'
import { HOECHSTENS, SPRECHER, figurGegliedert, fingerabdruck, kompositionen, vorstellungDaten, zeitplan } from './vorstellung-daten.mjs'

const daten = () => JSON.parse(readFileSync('data/projektstand.json', 'utf8'))
/** Messungen ohne Piper: jede Zeile dauert so lange, wie ihre Wörter brauchen */
const messung = (w, jeWort = 0.36) => Object.fromEntries(w.stimme.map((z) => [z.id, { dauer: woerterVon(z).length * jeWort, anker: {} }]))
const figuren = await figurenAlsSvg()

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
  assert.equal(bau.warnung, null)
  const letzter = d.training.laeufe.zeilen.at(-1).gelernt
  assert.match(w.stopps.find((s) => s.beispiel.art === 'chat').beispiel.training, new RegExp(`^Noch im Training: ${letzter} von `))
})

test('WMC Inventar darf nicht fertig wirken: Was hinter der Zahl steht, wird gezeigt und gesagt', () => {
  const d = daten()
  const inventar = d.entstanden.projekte.find((p) => p.id === 'wmc-inventar')
  assert.match(inventar.status, /(\d+) von (\d+)/)
  inventar.status = 'im Bau, 41 von 41 Paketen, nicht abnahmefähig'
  const w = vorstellungDaten(d)
  const bau = w.stopps.find((s) => s.beispiel.art === 'projekte').beispiel.bau
  assert.equal(bau.warnung, 'nicht abnahmefähig')
  assert.ok(w.stimme.some((z) => z.sichtbar.includes('nicht abnahmefähig')))
  const plan = zeitplan(w, messung(w))
  const html = kompositionen(w, figuren, plan)[`compositions/stopp${w.stopps.findIndex((s) => s.beispiel.art === 'projekte') + 1}.html`]
  assert.match(html, /-warnung">nicht abnahmefähig</)
})

test('Die Warnung hinter der Paketzahl kann jeden Wortlaut haben, der Nachsatz wird gesagt', () => {
  const d = daten()
  const inventar = d.entstanden.projekte.find((p) => p.id === 'wmc-inventar')
  inventar.status = 'gebaut, 41 von 41 Paketen, Abnahme steht aus'
  d.produktseite.vorstellung.stopps.find((s) => s.beispiel.art === 'projekte').beispiel.nachsatz = 'Das hat die Werkbank behoben.'
  const w = vorstellungDaten(d)
  assert.ok(w.stimme.some((z) => z.sichtbar.includes('Abnahme steht aus')))
  assert.ok(w.stimme.some((z) => z.sichtbar === 'Das hat die Werkbank behoben.'))
  const plan = zeitplan(w, messung(w))
  const html = kompositionen(w, figuren, plan)[`compositions/stopp${w.stopps.findIndex((s) => s.beispiel.art === 'projekte') + 1}.html`]
  assert.match(html, /-warnung">Abnahme steht aus</)
})

test('Gesagt wird, was die Daten sagen: Trainingsstand und Termin des Teams', () => {
  const d = daten()
  const text = vorstellungDaten(d).stimme.map((z) => z.sichtbar).join(' ')
  const letzter = d.training.laeufe.zeilen.at(-1)
  const faelle = d.training.laeufe.bereiche.reduce((s, b) => s + b.faelle, 0)
  assert.ok(text.includes(`${letzter.gelernt} von ${faelle}`), text)
  const team = d.meilensteinplanAktuell.meilensteine.find((m) => m.id === d.anleitung.teamAb)
  const [, monat, tag] = team.termin.split('-')
  assert.ok(text.includes(`am ${tag}.${monat}.`), text)
})

test('Jeder Kollege spricht in Ich-Form, julia-trend mit Kerstin, die anderen mit Thorsten und je eigener Einstellung', () => {
  const w = vorstellungDaten(daten())
  for (const [i, s] of w.stopps.entries()) {
    const eigene = w.stimme.filter((z) => z.stopp === i)
    assert.equal(eigene[0].sichtbar, s.ich)
    assert.match(eigene[0].sichtbar, /^Ich bin /)
    for (const z of eigene) assert.equal(z.stimme, s.kopf === 'researcherin' ? 'kerstin' : 'thorsten', z.id)
  }
  const thorsten = Object.values(SPRECHER).filter((s) => s.stimme === 'thorsten')
  assert.equal(new Set(thorsten.map((s) => `${s.tempo}/${s.tonhoehe}`)).size, thorsten.length)
})

test('die Prüfung meldet den Film als veraltet, sobald sich eine gezeigte Zahl oder ein Satz ändert', () => {
  const d = daten()
  const stand = { stand: d.stand, fingerabdruck: fingerabdruck(vorstellungDaten(d)) }
  assert.equal(vergleicheVorstellung(stand, d).aktuell, true)
  d.entstanden.projekte.find((p) => p.id === 'wmc-inventar').status = 'im Bau, 20 von 25 Paketen'
  assert.equal(vergleicheVorstellung(stand, d).aktuell, false)
  const e = daten()
  e.produktseite.vorstellung.stopps[0].nie = 'Ein anderer Satz.'
  assert.equal(vergleicheVorstellung(stand, e).aktuell, false)
})

test('der Film schreibt je Halt eine Komposition und nennt keinen Menschen', () => {
  const w = vorstellungDaten(daten())
  const plan = zeitplan(w, messung(w))
  const dateien = kompositionen(w, figuren, plan)
  assert.ok(dateien['index.html'].includes(`data-duration="${plan.dauer}"`))
  assert.match(dateien['index.html'], /<audio id="stimme" src="assets\/stimme\.wav"/)
  w.stopps.forEach((_, i) => assert.ok(dateien[`compositions/stopp${i + 1}.html`]))
  for (const inhalt of Object.values(dateien)) {
    assert.doesNotMatch(inhalt, /Erwin/)
    assert.doesNotMatch(inhalt, /Math\.random|Date\.now|repeat:\s*-1|setTimeout|setInterval/)
  }
  assert.ok(plan.dauer < HOECHSTENS * 1.5)
})

test('die Halte schließen aneinander: der nächste beginnt mit dem Schwenk des vorigen', () => {
  const w = vorstellungDaten(daten())
  const plan = zeitplan(w, messung(w))
  plan.stopps.forEach((p, i) => {
    if (i > 0) assert.equal(p.start, plan.stopps[i - 1].weg)
    assert.ok(p.stimmeEnde < p.weg)
  })
  assert.equal(plan.schluss.start, plan.stopps.at(-1).weg)
  assert.ok(plan.schluss.stimmeEnde < plan.dauer)
})

test('jede Zeichnung lässt sich gliedern, die Gruppen schneiden nichts durch', () => {
  const w = vorstellungDaten(daten())
  for (const s of w.stopps) {
    const svg = figurGegliedert(figuren[s.kopf].linie, s.kopf, 'x')
    assert.match(svg, /<g id="x-kopf">/, s.kopf)
    assert.match(svg, /<g id="x-rumpf">/, s.kopf)
    assert.match(svg, /ellipse[^>]*rx="2\.3"/, `${s.kopf} hat ein Auge`)
    const auf = (svg.match(/<g[\s>]/g) ?? []).length
    const zu = (svg.match(/<\/g>/g) ?? []).length
    assert.equal(auf, zu, s.kopf)
  }
  assert.throws(() => figurGegliedert('<svg></svg>', 'architekt', 'x'), /passt nicht mehr zur Zeichnung/)
})

test('die Figuren lassen sich ohne Next.js übersetzen', () => {
  const js = uebersetze(`import './kollegen.css'\nimport { LINIE } from './basis'\nexport const X = () => <g {...LINIE} />`)
  assert.doesNotMatch(js, /kollegen\.css/)
  assert.match(js, /from '\.\/basis\.mjs'/)
  assert.match(js, /jsx/)
})
