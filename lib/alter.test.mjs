import test from 'node:test'
import assert from 'node:assert/strict'

import { alterInWorten, tageSeit } from './alter.ts'

const am = (s) => new Date(`${s}T12:00:00Z`)

test('tageSeit zählt ganze Tage, unabhängig von der Uhrzeit', () => {
  assert.equal(tageSeit('2026-09-09', am('2026-09-09')), 0)
  assert.equal(tageSeit('2026-09-05', am('2026-09-09')), 4)
  assert.equal(tageSeit('2026-09-09', new Date('2026-09-09T23:30:00Z')), 0)
  assert.equal(tageSeit('2026-08-27', am('2026-09-09')), 13)
})

test('tageSeit übersteht den Monatswechsel', () => {
  assert.equal(tageSeit('2026-08-31', am('2026-09-01')), 1)
  assert.equal(tageSeit('2025-12-31', am('2026-01-01')), 1)
})

test('alterInWorten wechselt von Tagen über Wochen zu Monaten', () => {
  assert.equal(alterInWorten(0), 'von heute')
  assert.equal(alterInWorten(1), 'von gestern')
  assert.equal(alterInWorten(4), 'vier Tage alt')
  assert.equal(alterInWorten(6), 'sechs Tage alt')
  assert.equal(alterInWorten(7), 'eine Woche alt')
  assert.equal(alterInWorten(13), 'eine Woche alt')
  assert.equal(alterInWorten(14), 'zwei Wochen alt')
  assert.equal(alterInWorten(59), 'acht Wochen alt')
  assert.equal(alterInWorten(60), 'zwei Monate alt')
  assert.equal(alterInWorten(365), 'zwölf Monate alt')
  assert.equal(alterInWorten(400), '13 Monate alt', 'jenseits der Wortliste wieder Ziffern')
})

test('alterInWorten schweigt zu einem Datum in der Zukunft', () => {
  assert.equal(alterInWorten(-1), null)
})

test('alterInWorten passt in den Satz über die Zahlen', () => {
  assert.equal(`Diese Zahlen sind ${alterInWorten(9)}.`, 'Diese Zahlen sind eine Woche alt.')
})
