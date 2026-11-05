import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { STIMMEN, fuerStimme, leseWav, sprich, stimmenOrdner, stimmlage, webvtt, woerterVon, wortZeiten, zeile } from './stimme.mjs'

test('Es gibt nur die beiden freigegebenen Stimmen', () => {
  assert.deepEqual(Object.values(STIMMEN).sort(), ['de_DE-kerstin-low', 'de_DE-thorsten-high'])
})

test('Schwierige Wörter werden für die Stimme umgeschrieben', () => {
  assert.equal(fuerStimme('kiKollege'), 'Ka-I-Kollege')
  assert.equal(fuerStimme('Ein KI-Mitarbeiter bei WAMOCON'), 'Ein Ka-I-Mitarbeiter bei Wamokon')
  assert.equal(fuerStimme('rund um KI und Agenten'), 'rund um Ka-I und Agenten')
  assert.equal(fuerStimme('Ich bin julia-trend.'), 'Ich bin Julia Trend.')
  assert.equal(fuerStimme('Ich bin Gregor Dev.'), 'Ich bin Gregor Deff.')
  assert.equal(fuerStimme('ab M2'), 'ab Meilenstein 2')
  assert.equal(fuerStimme('nicht abnahmefähig'), 'nicht abnahme-fähig')
})

test('Daten werden gesprochen, wie man sie sagt', () => {
  assert.equal(fuerStimme('23.11.'), 'dreiundzwanzigster November')
  assert.equal(fuerStimme('frühestens am 23.11. dazu'), 'frühestens am dreiundzwanzigsten November dazu')
  assert.equal(fuerStimme('bis 20.11.'), 'bis zum zwanzigsten November')
  assert.equal(fuerStimme('bis zum 01.12.2026'), 'bis zum ersten Dezember')
  assert.equal(fuerStimme('am 31.13.'), 'am 31.13.')
})

test('Zahlen bleiben Ziffern: Piper liest sie richtig, ausgeschrieben nicht', () => {
  assert.equal(fuerStimme('41 von 41 Paketen'), '41 von 41 Paketen')
  assert.equal(fuerStimme('6 von 18 Fällen'), '6 von 18 Fällen')
})

test('Der Ordner der Stimmen kommt aus der Umgebung oder liegt irgendwo darüber', () => {
  const basis = mkdtempSync(join(tmpdir(), 'stimmen-test-'))
  try {
    mkdirSync(join(basis, 'stimmen', 'modelle'), { recursive: true })
    const repo = join(basis, 'repo', '.claude', 'worktrees', 'zweig')
    mkdirSync(repo, { recursive: true })
    assert.equal(stimmenOrdner({}, repo), join(basis, 'stimmen'))
    assert.equal(stimmenOrdner({}, join(basis, 'repo')), join(basis, 'stimmen'))
    assert.equal(stimmenOrdner({ KIKOLLEGE_STIMMEN: join(basis, 'woanders') }, repo), join(basis, 'woanders'))
  } finally {
    rmSync(basis, { recursive: true, force: true })
  }
})

test('Fehlt Piper, bricht die Stimme mit einer klaren Meldung ab', async () => {
  const leer = mkdtempSync(join(tmpdir(), 'stimmen-leer-'))
  try {
    await assert.rejects(sprich({ text: 'Probe.', datei: join(leer, 'p.wav'), ordner: leer }), /Piper fehlt/)
    await assert.rejects(sprich({ text: 'Probe.', datei: join(leer, 'p.wav'), stimme: 'ramona', ordner: leer }), /Unbekannte Stimme/)
  } finally {
    rmSync(leer, { recursive: true, force: true })
  }
})

test('Die Stimmlage findet Anfang und Ende der Stimme, leiser Rand zählt nicht', () => {
  const rate = 1000
  const proben = new Int16Array(rate)
  for (let i = 200; i < 700; i++) proben[i] = i % 2 ? 3000 : -3000
  const { an, aus } = stimmlage(proben, rate)
  assert.equal(an, 0.2)
  assert.equal(aus, 0.7)
})

test('leseWav liest auch WAV-Dateien mit weiteren Blöcken vor den Daten', () => {
  const ordner = mkdtempSync(join(tmpdir(), 'stimmen-wav-'))
  try {
    const datei = join(ordner, 'x.wav')
    const fmt = Buffer.alloc(24)
    fmt.write('fmt ', 0, 'latin1')
    fmt.writeUInt32LE(16, 4)
    fmt.writeUInt16LE(1, 8)
    fmt.writeUInt16LE(1, 10)
    fmt.writeUInt32LE(8000, 12)
    fmt.writeUInt32LE(16000, 16)
    fmt.writeUInt16LE(2, 20)
    fmt.writeUInt16LE(16, 22)
    const liste = Buffer.concat([Buffer.from('LIST', 'latin1'), Buffer.from([3, 0, 0, 0]), Buffer.from('abc\0', 'latin1')])
    const daten = Buffer.concat([Buffer.from('data', 'latin1'), Buffer.from([4, 0, 0, 0]), Buffer.from([1, 0, 2, 0])])
    const kern = Buffer.concat([Buffer.from('WAVE', 'latin1'), fmt, liste, daten])
    const kopf = Buffer.alloc(8)
    kopf.write('RIFF', 0, 'latin1')
    kopf.writeUInt32LE(kern.length, 4)
    writeFileSync(datei, Buffer.concat([kopf, kern]))
    const w = leseWav(datei)
    assert.equal(w.rate, 8000)
    assert.deepEqual([...w.proben], [1, 2])
  } finally {
    rmSync(ordner, { recursive: true, force: true })
  }
})

test('Wortzeiten laufen vorwärts, treffen die gemessene Stelle und bleiben unter der Dauer', () => {
  const z = zeile('a', 'Der Orchestrator steht bei 6 von 18 Prüffällen.', { anker: ['6'] })
  const zeiten = wortZeiten(z, { dauer: 3, anker: { 4: 1.5 } })
  assert.equal(zeiten.length, woerterVon(z).length)
  assert.equal(zeiten[0], 0)
  assert.equal(zeiten[4], 1.5)
  for (let i = 1; i < zeiten.length; i++) assert.ok(zeiten[i] > zeiten[i - 1])
  assert.ok(zeiten.at(-1) < 3)
})

test('Untertitel tragen den sichtbaren Wortlaut und gemessene Zeiten', () => {
  const z = zeile('a', 'WMC Inventar: im Bau, 41 von 41 Paketen, nicht abnahmefähig, und kiKollege sagt das am 23.11. noch einmal laut.')
  const m = { dauer: 8, anker: {} }
  const vtt = webvtt([{ zeile: z, start: 2, wortZeit: wortZeiten(z, m), dauer: m.dauer }])
  assert.match(vtt, /^WEBVTT\n\n00:00:02\.000 --> /)
  assert.match(vtt, /nicht abnahmefähig/)
  assert.match(vtt, /kiKollege/)
  assert.doesNotMatch(vtt, /abnahme-fähig|Ka-I|dreiundzwanzig/)
  // Lang genug für zwei Tafeln, jede höchstens zwei Zeilen zu höchstens 42 Zeichen
  const bloecke = vtt.trim().split('\n\n').slice(1)
  assert.ok(bloecke.length >= 2)
  let vorher = 0
  for (const b of bloecke) {
    const [zeit, ...text] = b.split('\n')
    assert.ok(text.length <= 2, b)
    for (const t of text) assert.ok(t.length <= 46, t)
    const [, m1, s1] = zeit.match(/^00:(\d\d):(\d\d\.\d{3})/)
    const von = Number(m1) * 60 + Number(s1)
    assert.ok(von >= vorher)
    vorher = von
  }
})
