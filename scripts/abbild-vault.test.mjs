import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  BEREICHE,
  abbilden,
  ausgelassen,
  bereichVon,
  freigabestand,
  rubrikenZaehlen,
  verweise,
  zaehlen,
} from './abbild-vault.mjs'

const hier = dirname(fileURLToPath(import.meta.url))
const ablage = join(hier, '__fixtures__', 'ablage')
const ziel = join(hier, '..', 'data', 'projektstand.json')
const still = () => {}
const bereich = (abbild, id) => abbild.bereiche.find((b) => b.id === id)

test('bereichVon ordnet nach Ordner, bei Arbeitsständen nach Typ', () => {
  assert.equal(bereichVon('KI-Mitarbeiter/00_Meta/Protokoll/Protokoll 2026-09-11.md', 'meta'), 'protokoll')
  assert.equal(bereichVon('KI-Mitarbeiter/00_Meta/Migrationsplan.md', 'arbeitsplan'), 'konventionen')
  assert.equal(bereichVon('KFBM/00_Vault/10_KI-Mitarbeiter/Prüfläufe/Lauf.md', null), 'prueflaeufe')
  assert.equal(bereichVon('KFBM/00_Vault/10_KI-Mitarbeiter/Severity-Definition.md', 'kriterium'), 'massstab')
  assert.equal(bereichVon('KFBM/00_Vault/10_KI-Mitarbeiter/Reviewer KFBM.md', 'ki-mitarbeiter'), 'bauplan')
  assert.equal(bereichVon('KFBM/00_Vault/15_Academy/Checklisten.md', 'academy'), 'massstab')
  assert.equal(bereichVon('KFBM/00_Vault/20_Ausbildungsberufe/KFBM/Lernfelder/LF01.md', 'lernfeld'), 'normbasis')
  assert.equal(bereichVon('KI-Mitarbeiter/40_Leistungen/Apps.md', 'leistung'), 'unternehmen')
  assert.equal(bereichVon('KI-Mitarbeiter/75_KI-Mitarbeiter/Harness.md', 'architektur'), 'bauplan')
  assert.equal(bereichVon('KI-Mitarbeiter/75_KI-Mitarbeiter/Arbeitsplan.md', 'arbeitsplan'), 'arbeitsstand')
  assert.equal(bereichVon('KI-Mitarbeiter/85_Logbuch/2026-09-12.md', 'logbuch'), 'entscheidungen')
  assert.equal(bereichVon('KI-Mitarbeiter/80_Quellen/Quellen.md', 'quelle'), 'quellen')
  assert.equal(bereichVon('KI-Mitarbeiter/90_Archiv/Alt.md', 'archiv'), 'archiv')
  assert.equal(bereichVon('KI-Mitarbeiter/KI-Mitarbeiter — Wegweiser.md', 'moc'), 'einstiege')
  assert.equal(bereichVon('KI-Mitarbeiter\\01_Inbox\\Neu.md', undefined), 'einstiege')
})

test('bereichVon erkennt den Ordnernamen auch in zerlegter Unicode-Form', () => {
  assert.equal(bereichVon('KFBM/Pru\u0308fla\u0308ufe/Lauf.md', null), 'prueflaeufe')
})

test('freigabestand kennt drei Werte, alles andere ist ohne Feld', () => {
  assert.equal(freigabestand({ verbindlichkeit: 'verbindlich' }), 'verbindlich')
  assert.equal(freigabestand({ verbindlichkeit: 'informativ' }), 'informativ')
  assert.equal(freigabestand({ verbindlichkeit: ' ungeprueft ' }), 'ungeprueft')
  assert.equal(freigabestand({ verbindlichkeit: 'vielleicht' }), 'ohneFeld')
  assert.equal(freigabestand({ verbindlichkeit: null }), 'ohneFeld')
  assert.equal(freigabestand({}), 'ohneFeld')
})

test('verweise liest Ziel ohne Anker und ohne Anzeigetext', () => {
  assert.deepEqual(verweise('[[A]] [[B|b]] [[C#Teil]] [[D#Teil|d]] ![[E]] [[ F ]] [[]]'), [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ])
})

test('ausgelassen versteht Pfadanfänge und reguläre Ausdrücke', () => {
  const filter = ['KFBM/reviewer/', 'CLAUDE.md', '/Entwurf/', '/[/']
  assert.equal(ausgelassen('KFBM/reviewer/README.md', filter), true)
  assert.equal(ausgelassen('KFBM\\reviewer\\README.md', filter), true)
  assert.equal(ausgelassen('CLAUDE.md', filter), true)
  assert.equal(ausgelassen('Ordner/Entwurf 2.md', filter), true)
  assert.equal(ausgelassen('KFBM/00_Vault/Notiz.md', filter), false)
})

test('zaehlen lässt aus, was die Ablage selbst auslässt', async () => {
  const abbild = await zaehlen(ablage, '2026-09-17')
  assert.equal(abbild.gezaehltAm, '2026-09-17')
  // Geheim.md, Notiz.md im Punktordner, Entwurf.md und CLAUDE.md zählen nicht.
  assert.equal(abbild.notizen, 6)
  assert.equal(abbild.bereiche.reduce((s, b) => s + b.verbindlich, 0), 2)
})

test('zaehlen führt jeden Bereich, auch einen leeren, in fester Reihenfolge', async () => {
  const abbild = await zaehlen(ablage, '2026-09-17')
  assert.deepEqual(
    abbild.bereiche.map((b) => b.id),
    BEREICHE.map((b) => b.id),
  )
  const quellen = bereich(abbild, 'quellen')
  assert.equal(quellen.notizen, 0)
  assert.equal(Object.keys(quellen.verweiseNach).length, BEREICHE.length - 1)
  assert.equal(quellen.verweiseNach.quellen, undefined)
})

test('zaehlen zählt Freigabestand und Verweise je Bereich', async () => {
  const abbild = await zaehlen(ablage, '2026-09-17')
  assert.deepEqual(
    { ...bereich(abbild, 'massstab'), verweiseNach: undefined },
    {
      id: 'massstab',
      gruppe: 'wissen',
      name: 'Prüfmaßstab der Academy',
      kurz: 'Prüfmaßstab',
      notizen: 1,
      verbindlich: 0,
      informativ: 1,
      ungeprueft: 0,
      ohneFeld: 0,
      verweiseNach: undefined,
    },
  )
  assert.equal(bereich(abbild, 'unternehmen').ungeprueft, 1)
  assert.equal(bereich(abbild, 'protokoll').ohneFeld, 1)
  assert.equal(bereich(abbild, 'konventionen').verweiseNach.entscheidungen, 2)
  assert.equal(bereich(abbild, 'entscheidungen').verweiseNach.konventionen, 1)
  assert.equal(bereich(abbild, 'protokoll').verweiseNach.konventionen, 1)
  assert.equal(bereich(abbild, 'prueflaeufe').verweiseNach.massstab, 3)
  assert.equal(abbild.verweise, 7)
  assert.equal(abbild.unaufgeloest, 1)
  assert.equal(abbild.regelnotizen, 0)
})

test('zaehlen zählt je Rubrik des Unternehmenswissens, nur die oberste Ebene', async () => {
  const abbild = await zaehlen(ablage, '2026-09-17')
  assert.deepEqual(abbild.rubriken, {
    '30_Werte': { notizen: 1, verbindlich: 0 },
    '85_Logbuch': { notizen: 1, verbindlich: 1 },
  })
})

test('rubrikenZaehlen setzt nur Anzahlen und lässt Dateiordner in Ruhe', () => {
  const bisher = [
    { ordner: '30_Werte', art: 'notizen', wofuer: 'Werte', notizen: 9, verbindlich: 9 },
    { ordner: '01_Inbox', art: 'notizen', wofuer: 'Eingang', notizen: 3, verbindlich: 0 },
    { ordner: 'CI', art: 'dateien', wofuer: 'CI-Profil' },
  ]
  assert.deepEqual(rubrikenZaehlen(bisher, { '30_Werte': { notizen: 1, verbindlich: 0 }, 'Neu': { notizen: 2, verbindlich: 0 } }), [
    { ordner: '30_Werte', art: 'notizen', wofuer: 'Werte', notizen: 1, verbindlich: 0 },
    { ordner: '01_Inbox', art: 'notizen', wofuer: 'Eingang', notizen: 0, verbindlich: 0 },
    { ordner: 'CI', art: 'dateien', wofuer: 'CI-Profil' },
  ])
})

test('abbilden ersetzt nur das Abbild und die Kennzahl der verbindlichen Notizen', async () => {
  const bisher = JSON.parse(readFileSync(ziel, 'utf8'))
  const neu = await abbilden({ vault: ablage, ziel, probelauf: true, heute: '2026-09-17', log: still })

  assert.equal(neu.kennzahlen.find((k) => k.id === 'verbindlich').zahl, 2)
  assert.deepEqual(
    neu.kennzahlen.filter((k) => k.id !== 'verbindlich'),
    bisher.kennzahlen.filter((k) => k.id !== 'verbindlich'),
  )
  for (const schluessel of Object.keys(bisher)) {
    if (['kennzahlen', 'ablage', 'unternehmenswissen'].includes(schluessel)) continue
    assert.deepEqual(neu[schluessel], bisher[schluessel], schluessel)
  }
  const werte = neu.unternehmenswissen.rubriken.find((r) => r.ordner === '30_Werte')
  assert.equal(werte.notizen, 1)
  assert.equal(werte.wofuer, bisher.unternehmenswissen.rubriken.find((r) => r.ordner === '30_Werte').wofuer)
  assert.equal(neu.unternehmenswissen.rubriken.length, bisher.unternehmenswissen.rubriken.length)
  assert.equal(neu.ablage.rubriken, undefined, 'Ordnernamen gehören nicht ins Abbild')
  assert.equal(neu.ablage.notizen, 6)
  assert.equal(neu.ablage.freigabe, bisher.ablage?.freigabe ?? 'oeffentlich')
  assert.match(neu.ablage.verfahren, /abbild-vault\.mjs/)
})

test('abbilden schreibt im Probelauf nichts', async () => {
  const vorher = readFileSync(ziel, 'utf8')
  await abbilden({ vault: ablage, ziel, probelauf: true, heute: '2026-09-17', log: still })
  assert.equal(readFileSync(ziel, 'utf8'), vorher)
})
