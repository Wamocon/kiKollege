#!/usr/bin/env node
/**
 * Die Stimme der Filme: aus einem Text wird eine WAV-Datei, lokal mit Piper.
 *
 *   node scripts/stimme.mjs --text "Ein Mensch entscheidet." -o probe.wav
 *   node scripts/stimme.mjs --text "…" --stimme kerstin --tempo 1.05 --tonhoehe 0.97 -o probe.wav
 *
 * Kein Text verlässt den Rechner. Piper und die Modelle liegen außerhalb des
 * Repositorys: im Ordner aus KIKOLLEGE_STIMMEN, sonst im nächsten Ordner „stimmen“
 * oberhalb der Repository-Wurzel. Das trifft aus der Hauptarbeitskopie und aus einem
 * Worktree denselben Ordner. Verwendet werden nur die beiden CC0-Stimmen aus STIMMEN.
 *
 * Das Modul schreibt außerdem die Tonspur eines Films und seine Untertitel. Es ist
 * ohne Piper importierbar, damit Fingerabdruck und Tests überall laufen.
 */

import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
/** Fertige Sprachdateien, je Wortlaut und Stimme einmal. Piper streut ein wenig, so bleibt ein Satz gleich. */
const ZWISCHENLAGER = join(WURZEL, 'node_modules', '.cache', 'kikollege-stimme')

export const STIMMEN = { thorsten: 'de_DE-thorsten-high', kerstin: 'de_DE-kerstin-low' }
export const LAUTHEIT = -16
const SPITZE = 0.84 // rund -1,5 dBFS
const RATE = 44100
const GLEICHZEITIG = 4

// ---------------------------------------------------------------------------
// Aussprache: nur für die Stimme, nie für das Bild
// ---------------------------------------------------------------------------

/**
 * Geprüft an der Lautschrift, die Piper aus dem Text bildet. Zahlen bleiben Ziffern:
 * Piper liest „41“ richtig, ausgeschrieben wird aus „einundvierzig“ ein w statt f.
 * WMC, WMA und IT buchstabiert Piper von selbst richtig.
 */
export const AUSSPRACHE = [
  [/\bkiKollege\b/g, 'Ka-I-Kollege'],
  [/\bKI-Mitarbeiter/g, 'Ka-I-Mitarbeiter'],
  [/\bKI\b/g, 'Ka-I'],
  [/\bWAMOCON\b/g, 'Wamokon'],
  [/\bjulia-trend\b/g, 'Julia Trend'],
  [/\bGregor Dev\b/g, 'Gregor Deff'],
  [/\bUse-Cases\b/g, 'Juhs Kehsis'],
  [/\bAcademy\b/g, 'Äkäddemi'],
  [/\bMaßstab\b/g, 'Mahsstab'],
  [/\bPflichtangaben\b/g, 'Pflicht-Angaben'],
  [/\babnahmefähig\b/g, 'abnahme-fähig'],
  [/\bReporter\b/g, 'Re-Porter'],
  [/\bArchivar\b/g, 'Archi Var'],
  [/\bM(\d+)\b/g, 'Meilenstein $1'],
]

const TAGE = [
  '', 'ersten', 'zweiten', 'dritten', 'vierten', 'fünften', 'sechsten', 'siebten', 'achten', 'neunten', 'zehnten',
  'elften', 'zwölften', 'dreizehnten', 'vierzehnten', 'fünfzehnten', 'sechzehnten', 'siebzehnten', 'achtzehnten',
  'neunzehnten', 'zwanzigsten', 'einundzwanzigsten', 'zweiundzwanzigsten', 'dreiundzwanzigsten', 'vierundzwanzigsten',
  'fünfundzwanzigsten', 'sechsundzwanzigsten', 'siebenundzwanzigsten', 'achtundzwanzigsten', 'neunundzwanzigsten',
  'dreißigsten', 'einunddreißigsten',
]
const MONATE = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']

/** „am 23.11.“ wird „am dreiundzwanzigsten November“, ohne Präposition „dreiundzwanzigster November“. */
function datumGesprochen(text) {
  return text.replace(/(?:\b(am|zum|vom|bis zum|bis)\s+)?\b(\d{1,2})\.(\d{1,2})\.(?:\d{4}\b)?/g, (_, vor, tag, monat) => {
    const t = TAGE[Number(tag)]
    const m = MONATE[Number(monat)]
    if (!t || !m) return _
    const wort = `${t} ${m}`
    if (vor === 'bis') return `bis zum ${wort}`
    return vor ? `${vor} ${wort}` : `${t.replace(/n$/, 'r')} ${m}`
  })
}

/** Schreibt einen sichtbaren Satz so um, dass Piper ihn richtig ausspricht. */
export function fuerStimme(text) {
  let t = datumGesprochen(text)
  for (const [muster, ersatz] of AUSSPRACHE) t = t.replace(muster, ersatz)
  return t
}

// ---------------------------------------------------------------------------
// Piper finden und aufrufen
// ---------------------------------------------------------------------------

/** Der Ordner mit venv und modelle, oder null. */
export function stimmenOrdner(umgebung = process.env, von = WURZEL) {
  if (umgebung.KIKOLLEGE_STIMMEN) return resolve(von, umgebung.KIKOLLEGE_STIMMEN)
  for (let d = resolve(von); ; d = dirname(d)) {
    if (existsSync(join(d, 'stimmen', 'modelle'))) return join(d, 'stimmen')
    if (dirname(d) === d) return null
  }
}

function piperWege(stimme, ordner = stimmenOrdner()) {
  if (!STIMMEN[stimme]) throw new Error(`Unbekannte Stimme „${stimme}“. Erlaubt sind nur: ${Object.keys(STIMMEN).join(', ')}.`)
  const hinweis = 'Piper fehlt. Lege venv und modelle in einen Ordner „stimmen“ oberhalb des Repositorys oder setze KIKOLLEGE_STIMMEN.'
  if (!ordner) throw new Error(`${hinweis} Es wurde kein solcher Ordner gefunden.`)
  const python = join(ordner, 'venv', ...(process.platform === 'win32' ? ['Scripts', 'python.exe'] : ['bin', 'python']))
  const modell = join(ordner, 'modelle', `${STIMMEN[stimme]}.onnx`)
  if (!existsSync(python)) throw new Error(`${hinweis} Es fehlt die Python-Umgebung unter venv.`)
  if (!existsSync(modell)) throw new Error(`${hinweis} Es fehlt das Modell ${STIMMEN[stimme]}.`)
  return { python, modell }
}

function lauf(befehl, args, eingabe = '') {
  return new Promise((gut, schlecht) => {
    // Nie im Ordner der Modelle: das sind Daten, von dort läuft kein Python
    const p = spawn(befehl, args, { cwd: tmpdir(), stdio: ['pipe', 'pipe', 'pipe'] })
    let fehler = ''
    p.stdout.resume()
    p.stderr.on('data', (d) => { fehler += d })
    p.on('error', (e) => schlecht(new Error(e.code === 'ENOENT' ? `${befehl} wurde nicht gefunden.` : e.message)))
    p.on('close', (code) => (code === 0 ? gut(fehler) : schlecht(new Error(`${befehl} endete mit ${code}: ${fehler.slice(-300)}`))))
    p.stdin.end(eingabe, 'utf8')
  })
}

const ffmpeg = (args) => lauf('ffmpeg', ['-hide_banner', '-nostats', '-y', ...args])

/** Integrierte Lautheit in LUFS; -inf bei zu kurzer Probe wird null. */
async function lautheit(datei) {
  const text = await ffmpeg(['-i', datei, '-af', `loudnorm=I=${LAUTHEIT}:print_format=json`, '-f', 'null', '-'])
  const wert = Number(/"input_i"\s*:\s*"(-?[\d.]+|-inf)"/.exec(text)?.[1])
  return Number.isFinite(wert) ? wert : null
}

/** Hebt eine Datei auf die Ziel-Lautheit und begrenzt die Spitzen. */
async function angleichen(von, nach, { davor = '', kanaele = 1 } = {}) {
  const pegel = await lautheit(von)
  const verstaerkung = pegel === null ? 0 : LAUTHEIT - pegel
  const filter = [davor, `volume=${verstaerkung.toFixed(2)}dB`, `alimiter=limit=${SPITZE}:level=false`].filter(Boolean).join(',')
  await ffmpeg(['-i', von, '-af', filter, '-ar', String(RATE), '-ac', String(kanaele), '-c:a', 'pcm_s16le', nach])
}

/**
 * Erzeugt aus einem Text eine WAV-Datei. `text` ist der gesprochene Wortlaut, also
 * schon durch fuerStimme gegangen. `tempo` ist Pipers Lautlänge (über 1 langsamer),
 * `tonhoehe` ein Faktor auf die Tonhöhe, ohne die Länge zu ändern.
 */
export async function sprich({ text, datei, stimme = 'thorsten', tempo = 1, tonhoehe = 1, ordner }) {
  const { python, modell } = piperWege(stimme, ordner)
  const arbeit = mkdtempSync(join(tmpdir(), 'kikollege-stimme-'))
  try {
    const roh = join(arbeit, 'roh.wav')
    // -I: nichts aus Umgebung oder Arbeitsordner; -X utf8: Umlaute kommen über stdin heil an
    await lauf(python, ['-I', '-X', 'utf8', '-m', 'piper', '-m', modell, '-f', roh, '--length-scale', String(tempo)], text)
    const rate = leseWav(roh).rate
    const lage = tonhoehe === 1 ? '' : `asetrate=${Math.round(rate * tonhoehe)},aresample=${rate},atempo=${(1 / tonhoehe).toFixed(5)}`
    mkdirSync(dirname(resolve(datei)), { recursive: true })
    await angleichen(roh, resolve(datei), { davor: lage })
  } finally {
    rmSync(arbeit, { recursive: true, force: true })
  }
  return datei
}

// ---------------------------------------------------------------------------
// Messen
// ---------------------------------------------------------------------------

/** Liest eine WAV-Datei mit 16 Bit. */
export function leseWav(datei) {
  const b = readFileSync(datei)
  if (b.toString('latin1', 0, 4) !== 'RIFF') throw new Error('Keine WAV-Datei.')
  let p = 12
  let rate = 0
  let kanaele = 1
  while (p + 8 <= b.length) {
    const art = b.toString('latin1', p, p + 4)
    const n = b.readUInt32LE(p + 4)
    if (art === 'fmt ') {
      kanaele = b.readUInt16LE(p + 10)
      rate = b.readUInt32LE(p + 12)
    }
    if (art === 'data') {
      const daten = b.subarray(p + 8, Math.min(p + 8 + n, b.length))
      const proben = new Int16Array(daten.buffer.slice(daten.byteOffset, daten.byteOffset + (daten.length & ~1)))
      return { rate, kanaele, proben }
    }
    p += 8 + n + (n % 2)
  }
  throw new Error('WAV-Datei ohne Daten.')
}

/** Wo in den Proben die Stimme beginnt und endet, in Sekunden; Fenster 10 ms, Schwelle -45 dBFS. */
export function stimmlage(proben, rate, schwelle = 184) {
  const fenster = Math.max(1, Math.round(rate / 100))
  let an = -1
  let aus = 0
  for (let i = 0; i + fenster <= proben.length; i += fenster) {
    let summe = 0
    for (let k = i; k < i + fenster; k++) summe += proben[k] * proben[k]
    if (Math.sqrt(summe / fenster) >= schwelle) {
      if (an < 0) an = i
      aus = i + fenster
    }
  }
  return an < 0 ? { an: 0, aus: proben.length / rate } : { an: an / rate, aus: aus / rate }
}

function messe(datei) {
  const { proben, rate } = leseWav(datei)
  const { an, aus } = stimmlage(proben, rate)
  return { datei, an, aus, dauer: Number((aus - an).toFixed(3)) }
}

// ---------------------------------------------------------------------------
// Sätze eines Films
// ---------------------------------------------------------------------------

/** Die Wörter einer Zeile, wie sie im Bild stehen. */
export const woerterVon = (zeile) => zeile.sichtbar.trim().split(/\s+/)

/**
 * Eine Zeile für den Film: sichtbarer Wortlaut, Ausspracheschreibung, Stimme.
 * `anker` nennt Wörter, deren Zeitpunkt gemessen wird; Stellen nach Komma oder
 * Doppelpunkt kommen von selbst dazu.
 */
export function zeile(id, sichtbar, { stimme = 'thorsten', tempo = 1, tonhoehe = 1, anker = [], ...rest } = {}) {
  return { id, sichtbar, gesprochen: fuerStimme(sichtbar), stimme, tempo, tonhoehe, anker, ...rest }
}

/** Welche Wörter einen gemessenen Zeitpunkt bekommen: Index und der Text davor. */
function ankerStellen(z) {
  const w = woerterVon(z)
  const stellen = new Set()
  w.forEach((x, i) => { if (i > 0 && /[,:;]$/.test(w[i - 1])) stellen.add(i) })
  for (const a of z.anker) {
    const i = w.findIndex((x) => x.startsWith(a))
    if (i > 0) stellen.add(i)
  }
  return [...stellen].sort((a, b) => a - b).map((i) => ({ i, davor: w.slice(0, i).join(' ').replace(/[,:;]$/, ''), pause: /[,:;]$/.test(w[i - 1]) }))
}

const schluessel = (text, z) => createHash('sha256').update(JSON.stringify([text, z.stimme, z.tempo, z.tonhoehe])).digest('hex').slice(0, 20)

/**
 * Spricht alle Zeilen und misst sie. Ergebnis je Zeile: Datei, Beginn und Ende der
 * Stimme in der Datei, Dauer und `anker` (Wortindex → Sekunden ab Beginn der Stimme).
 * Der Zeitpunkt eines Worts kommt aus der gemessenen Länge des Satzanfangs davor.
 */
export async function messeZeilen(zeilen, ordner = ZWISCHENLAGER) {
  mkdirSync(ordner, { recursive: true })
  const auftraege = new Map()
  const datei = (text, z) => {
    const pfad = join(ordner, `${schluessel(text, z)}.wav`)
    if (!existsSync(pfad)) auftraege.set(pfad, { text, stimme: z.stimme, tempo: z.tempo, tonhoehe: z.tonhoehe, datei: pfad })
    return pfad
  }
  const plan = zeilen.map((z) => ({
    z,
    voll: datei(z.gesprochen, z),
    stellen: ankerStellen(z).map((s) => ({ ...s, pfad: datei(fuerStimme(s.davor), z) })),
  }))
  const offen = [...auftraege.values()]
  if (offen.length) console.log(`Stimme: ${offen.length} Sprachdateien werden erzeugt.`)
  await Promise.all(
    Array.from({ length: GLEICHZEITIG }, async () => {
      while (offen.length) {
        const a = offen.shift()
        const zwischen = `${a.datei}.${process.pid}.tmp.wav`
        await sprich({ ...a, datei: zwischen })
        renameSync(zwischen, a.datei)
      }
    }),
  )
  const zeiten = {}
  for (const { z, voll, stellen } of plan) {
    const m = messe(voll)
    const anker = {}
    let vorher = 0
    for (const s of stellen) {
      // Ein Satzanfang endet gedehnt wie ein Satzende; nach einem Komma folgt eine kurze Pause
      const d = messe(s.pfad).dauer + (s.pause ? 0.06 : -0.1)
      // Piper streut von Lauf zu Lauf: nie rückwärts und nie über das Satzende
      const t = Math.min(Math.max(d, vorher + 0.05), m.dauer - 0.05)
      anker[s.i] = Number(t.toFixed(3))
      vorher = t
    }
    zeiten[z.id] = { ...m, anker }
  }
  return zeiten
}

/** Gewicht eines Worts für die Zeit, die es beim Sprechen braucht. */
function gewicht(wort) {
  const zahl = wort.match(/\d+/g)?.reduce((s, x) => s + [0, 5, 10, 17, 22][Math.min(x.length, 4)], 0) ?? 0
  const buchstaben = fuerStimme(wort).replace(/[^\p{L}]/gu, '').length
  return buchstaben + zahl + 1 + (/[,:;.!?]$/.test(wort) ? 2 : 0)
}

/** Der Zeitpunkt jedes sichtbaren Worts ab Beginn der Stimme: zwischen zwei gemessenen Stellen nach Gewicht verteilt. */
export function wortZeiten(z, messung) {
  const w = woerterVon(z)
  const stuetzen = [[0, 0], ...Object.entries(messung.anker ?? {}).map(([i, t]) => [Number(i), t]).sort((a, b) => a[0] - b[0]), [w.length, messung.dauer]]
  const zeiten = []
  for (let s = 0; s + 1 < stuetzen.length; s++) {
    const [i0, t0] = stuetzen[s]
    const [i1, t1] = stuetzen[s + 1]
    const summe = w.slice(i0, i1).reduce((a, x) => a + gewicht(x), 0) || 1
    let bisher = 0
    for (let i = i0; i < i1; i++) {
      zeiten.push(Number((t0 + (bisher / summe) * (t1 - t0)).toFixed(3)))
      bisher += gewicht(w[i])
    }
  }
  return zeiten
}

// ---------------------------------------------------------------------------
// Tonspur
// ---------------------------------------------------------------------------

function schreibeWav(datei, proben, rate) {
  const kopf = Buffer.alloc(44)
  kopf.write('RIFF', 0, 'latin1')
  kopf.writeUInt32LE(36 + proben.byteLength, 4)
  kopf.write('WAVEfmt ', 8, 'latin1')
  kopf.writeUInt32LE(16, 16)
  kopf.writeUInt16LE(1, 20)
  kopf.writeUInt16LE(1, 22)
  kopf.writeUInt32LE(rate, 24)
  kopf.writeUInt32LE(rate * 2, 28)
  kopf.writeUInt16LE(2, 32)
  kopf.writeUInt16LE(16, 34)
  kopf.write('data', 36, 'latin1')
  kopf.writeUInt32LE(proben.byteLength, 40)
  writeFileSync(datei, Buffer.concat([kopf, Buffer.from(proben.buffer, proben.byteOffset, proben.byteLength)]))
}

/**
 * Legt die gemessenen Sätze an ihre Zeitpunkte und gleicht die fertige Spur auf
 * rund -16 LUFS an. `start` nennt je Zeile, wann ihre Stimme einsetzt, in Sekunden.
 */
export async function sprachspur(zeiten, start, sekunden, ziel) {
  const spur = new Int16Array(Math.ceil(sekunden * RATE))
  const rand = Math.round(RATE * 0.03)
  for (const [id, t] of Object.entries(start)) {
    const m = zeiten[id]
    const { proben, rate } = leseWav(m.datei)
    if (rate !== RATE) throw new Error(`Sprachdatei mit ${rate} Hz statt ${RATE} Hz.`)
    const von = Math.max(0, Math.round(m.an * RATE) - rand)
    const bis = Math.min(proben.length, Math.round(m.aus * RATE) + rand)
    const beginn = Math.round(t * RATE) - Math.round(m.an * RATE) + von
    for (let i = von, k = Math.max(0, beginn); i < bis && k < spur.length; i++, k++) {
      const blende = Math.min(1, (i - von) / rand, (bis - i) / rand)
      spur[k] = Math.max(-32768, Math.min(32767, spur[k] + proben[i] * blende))
    }
  }
  const pfad = resolve(ziel)
  mkdirSync(dirname(pfad), { recursive: true })
  const roh = `${pfad}.roh.wav`
  const zweikanal = `${pfad}.zwei.wav`
  schreibeWav(roh, spur, RATE)
  // Der Film hat eine Stereospur: Gemessen wird deshalb zweikanalig, einkanalig fiele der Film 3 dB zu laut aus
  await ffmpeg(['-i', roh, '-af', 'pan=stereo|c0=c0|c1=c0', '-c:a', 'pcm_s16le', zweikanal])
  await angleichen(zweikanal, pfad, { kanaele: 2 })
  rmSync(roh, { force: true })
  rmSync(zweikanal, { force: true })
}

// ---------------------------------------------------------------------------
// Untertitel
// ---------------------------------------------------------------------------

const ZEICHEN_JE_TAFEL = 76
const ZEICHEN_JE_ZEILE = 42

/** Teilt einen langen Satz an Satzzeichen, sonst in der Mitte, bis jede Tafel kurz genug ist. */
function teileWoerter(w) {
  if (w.join(' ').length <= ZEICHEN_JE_TAFEL) return [w]
  const mitte = w.join(' ').length / 2
  let beste = Math.ceil(w.length / 2)
  let abstand = Infinity
  let laenge = 0
  for (let i = 1; i < w.length; i++) {
    laenge += w[i - 1].length + 1
    const d = Math.abs(laenge - mitte) * (/[,:;.]$/.test(w[i - 1]) ? 0.4 : 1)
    if (d < abstand) {
      abstand = d
      beste = i
    }
  }
  return [...teileWoerter(w.slice(0, beste)), ...teileWoerter(w.slice(beste))]
}

/** Bricht eine Tafel in höchstens zwei ausgewogene Zeilen. */
function umbruch(text) {
  if (text.length <= ZEICHEN_JE_ZEILE) return text
  const w = text.split(' ')
  let beste = 1
  let abstand = Infinity
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(' ').length
    const d = Math.abs(a - (text.length - a - 1))
    if (d < abstand) {
      abstand = d
      beste = i
    }
  }
  return `${w.slice(0, beste).join(' ')}\n${w.slice(beste).join(' ')}`
}

const zeitstempel = (t) => {
  const ms = Math.round(t * 1000)
  const z = (n, l = 2) => String(n).padStart(l, '0')
  return `${z(Math.floor(ms / 3600000))}:${z(Math.floor(ms / 60000) % 60)}:${z(Math.floor(ms / 1000) % 60)}.${z(ms % 1000, 3)}`
}

/**
 * WebVTT aus den gemessenen Zeiten, mit dem sichtbaren Wortlaut.
 * `saetze` ist eine Liste aus { zeile, start, zeiten }; `zeiten` nennt je Wort die
 * Sekunde ab Beginn der Stimme, `dauer` die gemessene Länge.
 */
export function webvtt(saetze) {
  const tafeln = []
  for (const { zeile: z, start, wortZeit, dauer } of saetze) {
    const w = woerterVon(z)
    let i = 0
    for (const teil of teileWoerter(w)) {
      const j = i + teil.length
      tafeln.push({ von: start + wortZeit[i], bis: start + (j < w.length ? wortZeit[j] : dauer), text: teil.join(' ') })
      i = j
    }
  }
  tafeln.sort((a, b) => a.von - b.von)
  const bloecke = tafeln.map((t, n) => {
    // Eine Tafel bleibt etwas länger stehen als die Stimme, aber nie über die nächste
    const naechste = tafeln[n + 1]?.von ?? Infinity
    const bis = Math.min(t.bis + 0.35, naechste)
    return `${zeitstempel(t.von)} --> ${zeitstempel(bis)}\n${umbruch(t.text)}`
  })
  return `WEBVTT\n\n${bloecke.join('\n\n')}\n`
}

// ---------------------------------------------------------------------------
// Von Hand
// ---------------------------------------------------------------------------

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const wert = (name, sonst) => {
    const i = process.argv.indexOf(name)
    return i >= 0 ? process.argv[i + 1] : sonst
  }
  const text = wert('--text')
  const datei = wert('-o')
  if (!text || !datei) {
    console.error('Aufruf: node scripts/stimme.mjs --text "Satz" -o datei.wav [--stimme thorsten|kerstin] [--tempo 1] [--tonhoehe 1]')
    process.exit(2)
  }
  try {
    await sprich({ text: fuerStimme(text), datei, stimme: wert('--stimme', 'thorsten'), tempo: Number(wert('--tempo', 1)), tonhoehe: Number(wert('--tonhoehe', 1)) })
    console.log(`${datei}: ${messe(datei).dauer} s Stimme`)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}
