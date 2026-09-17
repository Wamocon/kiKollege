import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { browserStarten, pruefen, starteServer } from './pruefe-figuren.mjs'

const still = () => {}

test('starteServer liefert unter dem basePath aus und sonst nichts', async () => {
  const ausgabe = await mkdtemp(join(tmpdir(), 'figuren-server-'))
  await writeFile(join(ausgabe, 'index.html'), '<p>da</p>')
  const server = await starteServer(ausgabe, '/k')
  const wurzel = `http://127.0.0.1:${server.address().port}`
  try {
    const da = await fetch(`${wurzel}/k/`)
    assert.equal(da.status, 200)
    assert.match(da.headers.get('content-type'), /text\/html/)
    assert.equal((await fetch(`${wurzel}/`)).status, 404)
    assert.equal((await fetch(`${wurzel}/k/fehlt/`)).status, 404)
  } finally {
    server.close()
  }
})

test('pruefen findet Überdeckung, Überstand, kleine Schrift und seitliches Scrollen', async (t) => {
  const browser = await browserStarten(false, still)
  if (!browser) {
    t.skip('kein Browser installiert')
    return
  }
  await browser.close()

  const ausgabe = await mkdtemp(join(tmpdir(), 'figuren-'))
  await writeFile(
    join(ausgabe, 'index.html'),
    `<!DOCTYPE html><html lang="de"><body><main>
      <svg viewBox="0 0 200 60" role="img" aria-label="Probe" width="200" height="60">
        <text x="10" y="20" font-size="12">Erste Zeile</text>
        <text x="14" y="22" font-size="12">Zweite Zeile</text>
        <text x="150" y="50" font-size="12">ragt weit hinaus</text>
        <text x="10" y="50" font-size="8">klein</text>
      </svg>
      <div style="width: 2000px">breit</div>
    </main></body></html>`,
  )
  const zeilen = []
  const anzahl = await pruefen({ ausgabe, seiten: ['/'], log: (z) => zeilen.push(z) })
  assert.equal(anzahl, 5)
  assert.ok(zeilen.includes('/ bei 1280 px: Probe: „Erste Zeile“ überdeckt „Zweite Zeile“'))
  assert.ok(zeilen.includes('/ bei 1280 px: Probe: „ragt weit hinaus“ ragt aus dem Bild'))
  assert.ok(zeilen.includes('/ bei 1280 px: Probe: Schrift 8 bei „klein“'))
  assert.ok(zeilen.some((z) => z.startsWith('/ bei 375 px: scrollt seitlich um')))
})
