import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { abdecken, pruefeText, pruefen } from './pruefe-daten.mjs'

const still = () => {}
const muster = (text) => pruefeText(text).map((f) => f.muster)

// Schluesselartige Werte werden erst zur Laufzeit zusammengesetzt, damit diese
// Datei selbst keinem Scanner als echter Schluessel auffaellt.
const falsch = (anfang, laenge) => anfang + 'x'.repeat(laenge)

test('findet eine IPv4-Adresse, aber kein Datum und keine Versionsnummer', () => {
  assert.deepEqual(muster('Der Rechner hat 10.1.2.3 im Netz.'), ['IPv4-Adresse'])
  assert.deepEqual(muster('Stand 17.09.2026, Next.js 16.3.4, CTFL 4.0'), [])
})

test('findet Rechnernamen im Hausnetz', () => {
  assert.deepEqual(muster('Er läuft auf rechner.lan'), ['Rechnername im Hausnetz'])
  assert.deepEqual(muster('ssh auf kiste.local'), ['Rechnername im Hausnetz'])
  assert.deepEqual(muster('Die Datei heißt Notiz.md'), [])
})

test('findet einen Port an einem Rechner, nicht aber in einem Link', () => {
  assert.ok(muster('Dienst unter dienst.beispiel.de:8443').includes('Port an einem Rechner'))
  assert.deepEqual(muster('Siehe https://docs.beispiel.de:443/seite'), [])
  assert.deepEqual(muster('npm run dev   # http://localhost:3000'), [])
})

test('findet Schlüssel, Tokens und Zugangsdaten', () => {
  assert.deepEqual(muster(`token ${falsch('gh' + 'p_', 36)}`), ['Schlüssel oder Token'])
  assert.deepEqual(muster(falsch('sk-' + 'ant-', 30)), ['Schlüssel oder Token'])
  assert.deepEqual(muster(`-----BEGIN OPENSSH ${'PRIVATE'} KEY-----`), ['Privater Schlüssel'])
  assert.deepEqual(muster(`123456789:${'A'.repeat(35)}`), ['Bot-Token'])
  assert.deepEqual(muster('api_key = abcdefgh1234'), ['Zugangsdaten als Zuweisung'])
  assert.deepEqual(muster('liegt unter ~/.ssh/config'), ['Zugangsdatei'])
})

test('lässt gewöhnliche Wörter mit Schlüsselbegriffen in Ruhe', () => {
  assert.deepEqual(muster('id-token: write'), [])
  assert.deepEqual(muster('Das Passwort gibt Erwin selbst ein.'), [])
})

test('lässt die Kontaktadressen der Gesellschaften zu, andere nicht', () => {
  assert.deepEqual(muster('info@wamocon.com und info@test-it-academy.com'), [])
  assert.deepEqual(muster('jemand@beispiel.de'), ['E-Mail-Adresse'])
  assert.deepEqual(muster("import { x } from '@/lib/daten'"), [])
})

test('zeigt vom Treffer nur den Anfang', () => {
  assert.equal(abdecken('10.1.2.3'), '10.1…')
  assert.equal(abdecken('a.lan'), '…')
})

test('prüft Daten und Doku, lässt Tests, Beispiele und Abhängigkeiten aus', async () => {
  const wurzel = await mkdtemp(join(tmpdir(), 'pruefe-daten-'))
  await mkdir(join(wurzel, 'data'))
  await mkdir(join(wurzel, 'scripts', '__fixtures__'), { recursive: true })
  await mkdir(join(wurzel, 'data', 'node_modules'))
  await writeFile(join(wurzel, 'data', 'projektstand.json'), '{"ort": "rechner.lan"}\n')
  await writeFile(join(wurzel, 'README.md'), 'Kontakt: jemand@beispiel.de\n')
  await writeFile(join(wurzel, 'scripts', 'x.test.mjs'), "const a = '10.1.2.3'\n")
  await writeFile(join(wurzel, 'scripts', '__fixtures__', 'a.md'), '10.1.2.3\n')
  await writeFile(join(wurzel, 'data', 'node_modules', 'a.json'), '"10.1.2.3"\n')

  const zeilen = []
  const anzahl = await pruefen({ wurzel, log: (z) => zeilen.push(z) })
  assert.equal(anzahl, 2)
  assert.ok(zeilen.includes('data/projektstand.json:1  Rechnername im Hausnetz  rech…'))
  assert.ok(zeilen.some((z) => z.startsWith('README.md:1  E-Mail-Adresse')))
})

test('meldet nichts, wenn nichts da ist', async () => {
  const wurzel = await mkdtemp(join(tmpdir(), 'pruefe-daten-'))
  await mkdir(join(wurzel, 'data'))
  await writeFile(join(wurzel, 'data', 'projektstand.json'), '{"stand": "2026-09-17"}\n')
  assert.equal(await pruefen({ wurzel, log: still }), 0)
})
