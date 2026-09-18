import test from 'node:test'
import assert from 'node:assert/strict'

import { nachtragen } from './stand-nachtragen.mjs'

/** Eine Werkbank, die Befehle nur aufschreibt und die Antworten stellt, die der
 *  Test braucht. So laeuft der ganze Durchgang ohne Git, ohne Netz und ohne
 *  Vault. */
function werkbank(antworten = {}) {
  const rufe = []
  const lauf = (befehl, args) => {
    const schluessel = [befehl, ...args].join(' ')
    rufe.push(schluessel)
    for (const [muster, antwort] of Object.entries(antworten)) {
      if (schluessel.startsWith(muster)) return { status: 0, aus: '', ...antwort }
    }
    return { status: 0, aus: '' }
  }
  return { lauf, rufe }
}

const sauberAufMain = {
  'git status --porcelain': { aus: '' },
  'git rev-parse --abbrev-ref HEAD': { aus: 'main' },
}
/** git diff --quiet endet mit 1, wenn es einen Unterschied gibt. */
const geaendert = { 'git diff --quiet': { status: 1 } }
const lauf = (w, mehr = {}) =>
  nachtragen({ vault: 'V', ablage: 'A', heute: '2026-09-18', lauf: w.lauf, schreibe: () => {}, log: () => {}, ...mehr })

test('bricht ab, wenn das Arbeitsverzeichnis nicht sauber ist', async () => {
  const w = werkbank({ ...sauberAufMain, 'git status --porcelain': { aus: ' M data/projektstand.json' } })
  const e = await lauf(w)
  assert.equal(e.ende, 'abgebrochen')
  assert.ok(!w.rufe.some((r) => r.startsWith('git pull')), 'nichts angefasst')
})

test('bricht ab, wenn ein anderer Zweig ausgecheckt ist', async () => {
  const w = werkbank({ ...sauberAufMain, 'git rev-parse --abbrev-ref HEAD': { aus: 'stand/2026-09-17' } })
  const e = await lauf(w)
  assert.equal(e.ende, 'abgebrochen')
  assert.match(e.satz, /nicht auf main/)
})

test('tut nichts, wenn sich der Stand nicht geändert hat', async () => {
  const w = werkbank(sauberAufMain)
  const e = await lauf(w)
  assert.equal(e.ende, 'nichts')
  assert.ok(!w.rufe.some((r) => r.startsWith('git commit')), 'kein Commit')
  assert.ok(w.rufe.some((r) => r.startsWith('node scripts/abbild-vault.mjs --vault A')), 'Ablage gezählt')
})

test('verwirft die Änderung, wenn der Bestand kleiner würde', async () => {
  const w = werkbank({
    ...sauberAufMain,
    ...geaendert,
    'node scripts/pruefe-bestand.mjs': { status: 1, aus: 'Im neuen Stand fehlt etwas' },
  })
  const e = await lauf(w)
  assert.equal(e.ende, 'abgebrochen')
  assert.match(e.satz, /verliert Einträge/)
  assert.ok(w.rufe.includes('git checkout -- data/projektstand.json'), 'zurückgenommen')
  assert.ok(!w.rufe.some((r) => r.startsWith('git push')), 'nichts gepusht')
})

test('verwirft die Änderung, wenn die Tests anschlagen', async () => {
  const w = werkbank({ ...sauberAufMain, ...geaendert, 'node --test': { status: 1 } })
  const e = await lauf(w)
  assert.equal(e.ende, 'abgebrochen')
  assert.ok(w.rufe.includes('git checkout -- data/projektstand.json'))
})

test('der Probelauf schreibt nichts und stellt nichts', async () => {
  const w = werkbank({ ...sauberAufMain, ...geaendert })
  const e = await lauf(w, { probelauf: true })
  assert.equal(e.ende, 'probelauf')
  assert.ok(w.rufe.includes('git checkout -- data/projektstand.json'))
  assert.ok(!w.rufe.some((r) => r.startsWith('git switch')), 'kein Zweig')
})

test('stellt den neuen Stand als Pull Request und geht zurück auf main', async () => {
  const w = werkbank({
    ...sauberAufMain,
    ...geaendert,
    'git rev-parse --verify stand/2026-09-18': { status: 1 },
    'gh pr view': { status: 1 },
    'gh pr create': { aus: 'https://github.com/Wamocon/kiKollege/pull/9' },
  })
  const e = await lauf(w)
  assert.equal(e.ende, 'gestellt')
  assert.equal(e.zweig, 'stand/2026-09-18')
  assert.ok(w.rufe.includes('git switch -c stand/2026-09-18'))
  assert.ok(w.rufe.includes('git commit -m Stand vom 2026-09-18 aus dem Vault'))
  assert.ok(w.rufe.includes('git push -u origin stand/2026-09-18'))
  assert.ok(w.rufe.some((r) => r.startsWith('gh pr create --base main --head stand/2026-09-18')))
  assert.ok(w.rufe.includes('gh pr edit stand/2026-09-18 --add-reviewer erwinmoretz'))
  assert.equal(w.rufe.at(-1), 'git checkout main')
  assert.ok(!w.rufe.some((r) => r.includes('push -u origin main')), 'niemals main')
})

test('hängt einen zweiten Lauf an den bestehenden Pull Request', async () => {
  const w = werkbank({
    ...sauberAufMain,
    ...geaendert,
    'git rev-parse --verify stand/2026-09-18': { status: 0 },
    'gh pr view': { status: 0, aus: 'Stand vom 2026-09-18' },
  })
  const e = await lauf(w)
  assert.equal(e.ende, 'gestellt')
  assert.ok(w.rufe.includes('git switch stand/2026-09-18'), 'vorhandener Zweig')
  assert.ok(!w.rufe.some((r) => r.startsWith('gh pr create')), 'kein zweiter Pull Request')
})
