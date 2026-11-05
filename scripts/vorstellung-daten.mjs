/**
 * Der Film „Ein Tag mit der Mannschaft“: Die KI-Mitarbeiter stellen sich vor.
 *
 * Eine Uhr führt durch den Tag, die Kamera fährt von Arbeitsplatz zu Arbeitsplatz.
 * Jeder sagt in Ich-Form, was er kann, zeigt ein Beispiel und sagt, was er nie tut.
 * Seit dem 05.11.2026 sagt er es wirklich: Die Stimme ist die Uhr, jede Zeit im Bild
 * kommt aus der gemessenen Länge der Sprachdateien, und die Länge des Films kommt von
 * dort auch. Die Sätze stehen in produktseite.vorstellung, die Zahlen kommen aus den
 * übrigen Daten. Gerendert wird mit scripts/baue-vorstellung.mjs, zuerst für den Chat.
 */

import { createHash } from 'node:crypto'

import { woerterVon, wortZeiten, zeile } from './stimme.mjs'

export const BREITE = 1920
export const HOEHE = 1080
/** Länger darf der Film nicht werden */
export const HOECHSTENS = 100

/** Ein Schwenk von einem Arbeitsplatz zum nächsten, in Sekunden */
const SCHWENK = 0.9
/** Die erste Silbe fällt kurz bevor die Kamera ganz angekommen ist */
const VOR_STIMME = SCHWENK - 0.3
const VOR_ERSTER = 0.5
/** Pausen zwischen den Sätzen eines Kollegen */
const LUFT = { ich: 0.2, kann: 0.22, zusatz: 0.26, nie: 0 }
const VOR_NIE = 0.34
/** Vom letzten Wort bis zum nächsten Schwenk */
const NACH = 0.42
/** Das Schlussbild steht nach dem letzten Wort noch so lange */
const HALT = 2.4

const FARBE = {
  weiss: '#FFFFFF',
  tief: '#140B0B',
  weich: '#241414',
  rot: '#F40E0E',
  gruen: '#0A6E37',
  leise: '#6B5F5F',
  leiseHell: 'rgba(255, 255, 255, 0.72)',
  linie: 'rgba(20, 11, 11, 0.16)',
  linieHell: 'rgba(255, 255, 255, 0.22)',
  dunst: '#F4EFEF',
}

/**
 * Wer wie klingt. Die Kollegen sprechen alle mit Thorsten und unterscheiden sich in
 * Sprechtempo (tempo über 1 ist langsamer) und einer kleinen Änderung der Tonhöhe;
 * julia-trend spricht mit Kerstin. Der Schluss hat die Erzählstimme.
 */
export const SPRECHER = {
  architekt: { stimme: 'thorsten', tempo: 1.03, tonhoehe: 0.93 },
  seiten: { stimme: 'thorsten', tempo: 0.97, tonhoehe: 1.04 },
  researcherin: { stimme: 'kerstin', tempo: 1, tonhoehe: 1 },
  orchestrator: { stimme: 'thorsten', tempo: 0.94, tonhoehe: 1.08 },
  reviewer: { stimme: 'thorsten', tempo: 1.06, tonhoehe: 0.98 },
  tester: { stimme: 'thorsten', tempo: 0.92, tonhoehe: 1.12 },
  archivar: { stimme: 'thorsten', tempo: 1.08, tonhoehe: 0.88 },
}
const ERZAEHLER = { stimme: 'thorsten', tempo: 1, tonhoehe: 1 }

const zahl = (n) => Number(n.toFixed(3))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const datum = (iso) => {
  const [j, m, t] = iso.split('-')
  return `${t}.${m}.${j}`
}
const kurz = (iso) => datum(iso).slice(0, 6)
/** Ein Satz endet vor einem Leerzeichen und einem Großbuchstaben, damit Daten ihn nicht zerschneiden */
const saetze = (text) => text.trim().split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
/** Eine Pseudozufallszahl aus einer Saat, immer dieselbe */
const saat = (n) => {
  const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453
  return x - Math.floor(x)
}

/** Die Sätze eines Halts, in der Reihenfolge des Sprechens */
function saetzeDesHalts(s, i, zusatz, anker) {
  const id = `s${i + 1}`
  const wie = SPRECHER[s.kopf] ?? ERZAEHLER
  const z = (teil, n, text, a = []) => zeile(`${id}-${teil}${n}`, text, { ...wie, stopp: i, teil, anker: a })
  return [
    z('ich', '', s.ich),
    ...saetze(s.kann).map((t, n) => z('kann', n + 1, t, anker)),
    ...zusatz.map(([t, a], n) => z('zusatz', n + 1, t, a)),
    z('nie', '', s.nie),
  ]
}

/** Wörter, zu denen das Bild etwas tut. Fehlt eines im Text, wird es übersprungen. */
const ANKER = {
  architekt: ['IT-Infrastruktur', 'bereite', 'Empfehlung'],
  seiten: ['Theo'],
  researcherin: ['Neuigkeiten', 'vergleiche'],
  orchestrator: ['prüfe', 'gebe', 'frage'],
  reviewer: ['Maßstab', 'Fundstelle'],
  tester: ['führe', 'beantworte'],
  archivar: ['Platz', 'Entscheidungen'],
}

/** Sätze und Zahlen, die der Film zeigt und sagt. Ändert sich einer, ist er veraltet. */
export function vorstellungDaten(d) {
  const v = d.produktseite.vorstellung
  const plan = d.meilensteinplanAktuell
  const laeufe = d.training.laeufe
  const letzter = laeufe.zeilen.at(-1)
  const faelle = laeufe.bereiche.reduce((s, b) => s + b.faelle, 0)
  const projekt = (id) => d.entstanden.projekte.find((p) => p.id === id)
  const inventar = projekt('wmc-inventar')
  const [, fertig, gesamt] = inventar.status.match(/(\d+) von (\d+)/)
  // „gebaut, 41 von 41 Paketen, Abnahme steht aus“: was hinter der Zahl steht, gehört in den Blick
  const hinterZahl = inventar.status.split(/(?<=\d+ von \d+[^,]*),\s*/)
  const team = plan.meilensteine.find((m) => m.id === d.anleitung.teamAb)
  const teamSatz = team && !team.terminOffen ? `Das Team kommt ${team.fruehestens ? 'frühestens ' : ''}am ${kurz(team.termin)} dazu.` : null
  const inventarLauf = inventar.stand.match(/Theos Lauf vom (\d\d\.\d\d\.)[^.]*?(\d+) von (\d+) Tests grün/)
  const stopps = v.stopps.map(({ freigabe: _, ...s }) => {
    const k = d.mannschaft.koepfe.find((x) => x.id === s.kopf)
    const beispiel = { ...s.beispiel }
    if (beispiel.art === 'projekte') {
      beispiel.laeuft = { name: projekt('browser-startseite').name, status: projekt('browser-startseite').status }
      beispiel.bau = {
        name: inventar.name,
        status: inventar.status,
        fertig: Number(fertig),
        gesamt: Number(gesamt),
        stand: hinterZahl[0],
        warnung: hinterZahl[1] ?? null,
      }
    }
    if (beispiel.art === 'chat') {
      beispiel.training = `Noch im Training: ${letzter.gelernt} von ${faelle} Fällen gelernt`
      beispiel.team = teamSatz
    }
    // Der jüngste Lauf steht in entstanden; die Zeile im Text des Films wird damit nachgezogen
    if (beispiel.art === 'tests' && inventarLauf) {
      beispiel.zeilen = beispiel.zeilen.map((z) =>
        z.name === inventar.name ? { ...z, gruen: Number(inventarLauf[2]), von: Number(inventarLauf[3]), wann: `Lauf vom ${inventarLauf[1]}` } : z,
      )
    }
    return { ...s, beispiel, rolle: s.rolle ?? k.rolle }
  })
  const stimme = stopps.flatMap((s, i) => {
    const zusatz = []
    if (s.beispiel.art === 'projekte') {
      const { bau, nachsatz } = s.beispiel
      zusatz.push([`${bau.name}: ${bau.status}.`, [String(bau.gesamt), 'Paketen', ...(bau.warnung ? [bau.warnung.split(/\s+/)[0]] : [])]])
      if (nachsatz) zusatz.push([nachsatz, []])
    }
    if (s.beispiel.art === 'chat') {
      zusatz.push([`Noch bin ich im Training: ${letzter.gelernt} von ${faelle} Fällen gelernt.`, [String(letzter.gelernt)]])
      if (teamSatz) zusatz.push([teamSatz, ['frühestens', 'am']])
    }
    return saetzeDesHalts(s, i, zusatz, ANKER[s.kopf] ?? [])
  })
  stimme.push(
    zeile('schluss-kern1', v.kern[0], { ...ERZAEHLER, stopp: stopps.length, teil: 'kern' }),
    zeile('schluss-kern2', v.kern[1], { ...ERZAEHLER, stopp: stopps.length, teil: 'kern' }),
    zeile('schluss-noch', v.nochNicht, { ...ERZAEHLER, stopp: stopps.length, teil: 'noch' }),
  )
  return {
    stand: d.stand,
    name: d.produktseite.name,
    titel: v.titel,
    kern: v.kern,
    nochNicht: v.nochNicht,
    koepfe: stopps.map((s) => ({ id: s.kopf, name: s.name })),
    stopps,
    stimme,
  }
}

export function fingerabdruck(werte) {
  return createHash('sha256').update(JSON.stringify(werte)).digest('hex').slice(0, 16)
}

// ---------------------------------------------------------------------------
// Zeitplan: aus den gemessenen Längen der Sprachdateien
// ---------------------------------------------------------------------------

/**
 * Rechnet aus den Messungen, wann jeder Halt und jedes Wort kommt.
 * `zeiten` kommt aus messeZeilen(): je Zeile `dauer` und `anker`.
 */
export function zeitplan(w, zeiten) {
  const zeilen = {}
  const stopps = []
  let schwenkBeginn = 0
  w.stopps.forEach((_, i) => {
    const eigene = w.stimme.filter((z) => z.stopp === i)
    const start = schwenkBeginn
    let u = i === 0 ? VOR_ERSTER : start + VOR_STIMME
    eigene.forEach((z, n) => {
      if (z.teil === 'nie') u += VOR_NIE
      const m = zeiten[z.id]
      zeilen[z.id] = { start: zahl(u), dauer: m.dauer, woerter: wortZeiten(z, m).map((t) => zahl(u + t)) }
      u += m.dauer
      if (n < eigene.length - 1) u += LUFT[z.teil]
    })
    const weg = zahl(u + NACH)
    stopps.push({ start: zahl(start), landet: zahl(i === 0 ? 0 : start + SCHWENK), stimmeEnde: zahl(u), weg, dauer: zahl(weg + SCHWENK - start) })
    schwenkBeginn = weg
  })
  const sStart = schwenkBeginn
  let u = sStart + SCHWENK + 0.35
  for (const z of w.stimme.filter((x) => x.stopp === w.stopps.length)) {
    const m = zeiten[z.id]
    if (z.teil === 'noch') u += 0.3
    zeilen[z.id] = { start: zahl(u), dauer: m.dauer, woerter: wortZeiten(z, m).map((t) => zahl(u + t)) }
    u += m.dauer + 0.16
  }
  const dauer = zahl(u - 0.16 + HALT)
  return { dauer, stopps, schluss: { start: zahl(sStart), dauer: zahl(dauer - sStart), stimmeEnde: zahl(u - 0.16) }, zeilen }
}

/** Ortszeiten eines Bildes, mit Wörtern als Merkzeichen */
function uhrwerk(plan, w, start) {
  const lokal = (t) => zahl(Math.max(0, t - start))
  const z = (id) => plan.zeilen[id]
  const text = (id) => woerterVon(w.stimme.find((x) => x.id === id))
  return {
    lokal,
    an: (id) => lokal(z(id).start),
    ende: (id) => lokal(z(id).start + z(id).dauer),
    woerter: (id) => z(id).woerter.map(lokal),
    /** Wann das Wort fällt; kommt es im Satz nicht vor, die Mitte des Satzes */
    bei: (id, wort) => {
      const i = text(id).findIndex((x) => x.startsWith(wort))
      return i < 0 ? lokal(z(id).start + z(id).dauer / 2) : lokal(z(id).woerter[i])
    },
  }
}

// ---------------------------------------------------------------------------
// Bausteine
// ---------------------------------------------------------------------------

function szene(id, stil, inhalt, skript) {
  return `<template>
  <style>
    @font-face {
      font-family: 'Inter Variable';
      src: url('assets/fonts/inter.woff2') format('woff2');
      font-weight: 100 900;
      font-style: normal;
    }
    #root {
      position: absolute;
      inset: 0;
      overflow: hidden;
      font-family: 'Inter Variable', sans-serif;
      font-feature-settings: 'ss01', 'cv11';
      --k-tinte: ${FARBE.tief}; --k-grund: #FFFFFF; --k-rot: ${FARBE.rot}; --k-flaeche: #E8E4E4;
      --k-leise: #5F3E3E; --k-rand: #D2C7C7; --k-papier: #FFFFFF;
    }
    .k-bild { display: block; width: 100%; height: auto; overflow: hidden; }
${stil}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${BREITE}" data-height="${HOEHE}">
${inhalt}
  </div>
  <script>
    (() => {
      const tl = gsap.timeline({ paused: true });
      const alle = (s) => gsap.utils.toArray(document.querySelectorAll(s));
${skript}
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`
}

/** Jedes Zeichen einzeln, damit ein Text getippt werden kann; der Platz steht von Anfang an fest */
const zeichen = (text, klasse) =>
  String(text)
    .split(/\s+/)
    .map((x) => `<span style="white-space: nowrap">${[...x].map((c) => `<span class="${klasse}">${esc(c)}</span>`).join('')}</span>`)
    .join(' ')
const woerter = (text, klasse) =>
  esc(text)
    .split(/\s+/)
    .map((x) => `<span class="${klasse}">${x}</span>`)
    .join(' ')
const tippen = (auswahl, an, raum) =>
  `tl.fromTo("${auswahl}", { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: ${zahl(raum)} }, ease: "none" }, ${zahl(an)});`
/** Wörter kommen zu ihrer Zeit, leicht von unten, mit Ausklang */
const wortFuerWort = (name, zeiten) =>
  zeiten.map((t, i) => `tl.fromTo(${name}[${i}], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.26, ease: "power3.out" }, ${zahl(t - 0.02)});`).join('\n      ')
/** Ein Zähler. Der Wert hängt allein an der Zeitleiste. */
const zaehler = (name, ziel, an, dauer, von = 0) => `const ${name}n = { v: ${von} };
      const ${name}e = document.getElementById("${name}");
      tl.fromTo(${name}n, { v: ${von} }, { v: ${ziel}, duration: ${zahl(dauer)}, ease: "power2.out", onUpdate: () => { ${name}e.textContent = String(Math.round(${name}n.v)); } }, ${zahl(an)});`
/** Das eine Rot wird abgegeben: Das Element wechselt die Farbe, wenn das nächste Rot kommt. */
const rotWeg = (auswahl, nach, an, eigenschaft = 'color') => `tl.to("${auswahl}", { ${eigenschaft}: "${nach}", duration: 0.25, ease: "power2.inOut" }, ${zahl(an)});`

/** Der Tag: Hintergrund und Farbe der Uhr wechseln im Schwenk, nie während man liest. */
function boden(w, plan) {
  const wechsel = w.stopps
    .slice(1)
    .map((s, i) => `      tl.to("#boden-flaeche", { backgroundColor: "${s.boden}", duration: ${SCHWENK}, ease: "power2.inOut" }, ${plan.stopps[i + 1].start});`)
    .join('\n')
  return szene(
    'boden',
    `    #boden-flaeche { position: absolute; inset: 0; background-color: ${w.stopps[0].boden}; }`,
    `    <div id="boden-flaeche"></div>`,
    `${wechsel}
      tl.to("#boden-flaeche", { backgroundColor: "${FARBE.tief}", duration: ${SCHWENK}, ease: "power2.inOut" }, ${plan.schluss.start});
      tl.set({}, {}, ${plan.dauer});`,
  )
}

/** Die Uhr steht fest, die Kamera fährt an ihr vorbei. Der große Zeiger kriecht beim
 *  Sprechen weiter, im Schwenk springt der Tag zur nächsten Stunde. */
function uhr(w, plan) {
  const striche = Array.from({ length: 12 }, (_, i) => {
    const lang = i % 3 === 0 ? 10 : 5
    return `<line x1="60" y1="6" x2="60" y2="${6 + lang}" transform="rotate(${i * 30} 60 60)" />`
  }).join('')
  const drehe = (stunde) => ({ h: zahl(stunde * 30), m: zahl(stunde * 360) })
  const schritte = w.stopps
    .map((s, i) => {
      const { h, m } = drehe(s.stunde)
      const p = plan.stopps[i]
      const kriechen = `      tl.fromTo("#uhr-m", { rotation: ${m} }, { rotation: ${zahl(m + 42)}, duration: ${zahl(p.weg - p.landet - 0.5)}, ease: "none", immediateRender: false }, ${zahl(p.landet + 0.5)});`
      if (i === 0) return kriechen
      return `      tl.to("#uhr-h", { rotation: ${h}, duration: ${SCHWENK}, ease: "expo.inOut" }, ${p.start});
      tl.to("#uhr-m", { rotation: ${m}, duration: ${SCHWENK}, ease: "expo.inOut" }, ${p.start});
      tl.to("#uhr-ring", { color: "${s.hell ? FARBE.tief : FARBE.weiss}", duration: ${SCHWENK}, ease: "power2.inOut" }, ${p.start});
${kriechen}`
    })
    .join('\n')
  const start = drehe(w.stopps[0].stunde)
  return szene(
    'uhr',
    `    #uhr-ring { position: absolute; left: 940px; top: 92px; width: 116px; height: 116px; color: ${w.stopps[0].hell ? FARBE.tief : FARBE.weiss}; }
    #uhr-ring svg { display: block; width: 100%; height: 100%; }`,
    `    <div id="uhr-ring">
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-linecap="round">
        <circle cx="60" cy="60" r="56" stroke-width="4" />
        <g stroke-width="3">${striche}</g>
        <line id="uhr-h" x1="60" y1="60" x2="60" y2="30" stroke-width="7" />
        <line id="uhr-m" x1="60" y1="60" x2="60" y2="17" stroke-width="4" />
        <circle cx="60" cy="60" r="5" fill="currentColor" stroke="none" />
      </svg>
    </div>`,
    `      gsap.set("#uhr-h, #uhr-m", { svgOrigin: "60 60" });
      tl.fromTo("#uhr-h", { rotation: ${zahl(start.h - 12)} }, { rotation: ${start.h}, duration: 0.45, ease: "back.out(2.2)" }, 0);
      tl.fromTo("#uhr-m", { rotation: ${zahl(start.m - 144)} }, { rotation: ${start.m}, duration: 0.45, ease: "back.out(2.2)" }, 0);
${schritte}
      tl.to("#uhr-ring", { opacity: 0, duration: 0.3, ease: "power2.in" }, ${plan.schluss.start});
      tl.set({}, {}, ${plan.dauer});`,
  )
}

// Die Figuren leben -----------------------------------------------------------

/**
 * Wo in der fertigen Zeichnung die beweglichen Teile liegen. Die Zeichnung kommt
 * unverändert aus components/figuren/; hier wird sie nur gruppiert. Je Teil steht
 * der Anfang des ersten Elements und der Anfang dessen, was danach kommt. `mund`
 * ist der Anfang des Pfads, der den Mund zeichnet.
 */
const TEILE = {
  architekt: {
    mund: 'M160 112.2',
    gruppen: {
      rumpf: ['<g><path d="M126 146 C102', '<g><g><clipPath id="k-li-arnold-kopf"'],
      kopf: ['<g><g><clipPath id="k-li-arnold-kopf"', '<path d="M230 198'],
      brett: ['<g transform="rotate(11 244 158)"><rect x="200"', '<circle cx="244" cy="161"'],
      arm: ['<path d="M186 197', '</g><g transform="rotate(11 244 158)"><rect x="262"'],
      last: ['<g transform="rotate(11 244 158)"><rect x="262"', '</svg>'],
    },
  },
  seiten: {
    mund: 'M157 119',
    gruppen: {
      rumpf: ['<path d="M126 146 C102', '<g><clipPath id="k-li-gregor-kopf"'],
      kopf: ['<g><clipPath id="k-li-gregor-kopf"', '<path d="M178 156'],
      arm: ['<path d="M178 156', '</g><g transform="rotate(8 292 44)">'],
      zettel: ['<g transform="rotate(8 292 44)">', '</svg>'],
    },
  },
  researcherin: {
    mund: 'M160 115',
    gruppen: {
      rumpf: ['<path d="M126 146 C102', '<g><g><clipPath id="k-li-julia-kopf"'],
      kopf: ['<g><g><clipPath id="k-li-julia-kopf"', '<path d="M218 146'],
      arm: ['<path d="M218 146', '</g><g transform="translate(285 76) rotate(-16)">'],
      faden: ['<g transform="translate(285 76) rotate(-16)">', '</svg>'],
      anhaenger: ['<g id="@faden">', '</svg>'],
    },
  },
  orchestrator: {
    mund: 'M155 113',
    gruppen: {
      rumpf: ['<path d="M126 146 C102', '<g><clipPath id="k-li-hermes-kopf"'],
      kopf: ['<g><clipPath id="k-li-hermes-kopf"', '<g transform="rotate(-10 263 139)"><rect x="240"'],
      arm: ['<g transform="rotate(-10 263 139)"><rect x="240"', '</g><g fill="none" stroke="var(--k-rot'],
    },
  },
  reviewer: {
    mund: 'M161 115',
    gruppen: {
      rumpf: ['<path d="M126 146 C102', '<clipPath id="k-li-fritz-kopf"'],
      kopf: ['<clipPath id="k-li-fritz-kopf"', '<path d="M200 197'],
      lupe: ['<path d="M222 186', '</g><g fill="none" stroke="var(--k-rot'],
      lupenrot: ['<path d="M235 154 h-3', '<path d="M246 183'],
    },
  },
  tester: {
    mund: 'M158.5 114.5',
    gruppen: {
      rumpf: ['<g><path d="M96 170', '<g><g><clipPath id="k-li-theo-kopf"'],
      kopf: ['<g><g><clipPath id="k-li-theo-kopf"', '<path d="M187.9 191.9'],
      arm: ['<path d="M187.9 191.9', '</g><g transform="rotate(-8 220 136)" stroke='],
      kreuz: ['<g transform="rotate(-8 220 136)" stroke=', '</svg>'],
    },
  },
  archivar: {
    mund: 'M159 116',
    gruppen: {
      karte: ['<path d="M229.2 186 V124', '<path d="M227 186'],
      rumpf: ['<g><path d="M126 146 C102', '<g><g><clipPath id="k-li-archivar-kopf"'],
      kopf: ['<g><g><clipPath id="k-li-archivar-kopf"', '<path d="M214 140'],
      hand: ['<path d="M214 140', '</g></svg>'],
    },
  },
}

/** Legt eine Gruppe mit Kennung um einen Abschnitt der Zeichnung. */
function umhuelle(svg, gruppe, von, bis) {
  const a = svg.indexOf(von)
  const b = a < 0 ? -1 : svg.indexOf(bis, a + 1)
  if (a < 0 || b < 0) throw new Error(`Figur: Der Abschnitt „${von}“ passt nicht mehr zur Zeichnung (${gruppe}). Die Tabelle TEILE nachziehen.`)
  const teil = svg.slice(a, b)
  const auf = (teil.match(/<g[\s>]/g) ?? []).length
  const zu = (teil.match(/<\/g>/g) ?? []).length
  if (auf !== zu) throw new Error(`Figur: Der Abschnitt „${gruppe}“ schneidet eine Gruppe durch (${auf} auf, ${zu} zu).`)
  return `${svg.slice(0, a)}<g id="${gruppe}">${teil}</g>${svg.slice(b)}`
}

/** Die Zeichnung mit Gruppen für alles, was sich bewegt. Kennungen beginnen mit der des Halts. */
export function figurGegliedert(svg, kopf, id) {
  const t = TEILE[kopf]
  if (!t) throw new Error(`Figur: Für ${kopf} fehlt die Tabelle TEILE.`)
  let aus = svg
  for (const [name, [von, bis]] of Object.entries(t.gruppen)) {
    aus = umhuelle(aus, `${id}-${name}`, von.replace('@', `${id}-`), bis)
  }
  return aus
}

/** Atmen, Blinzeln, Nicken beim Satzanfang, und der Mund arbeitet beim Sprechen. Für alle gleich gebaut. */
function figurLebt(s, i, id, Z, zeilenIds, gesamt) {
  const t = TEILE[s.kopf]
  const takt = 1.5 + saat(i + 1) * 0.5
  const atemzuege = Math.ceil(gesamt / takt)
  const auge = `#${id}-kopf ellipse[rx='2.3']`
  const mund = `#${id}-bild path[d^='${t.mund}']`
  const blinzeln = []
  for (let b = 1.1 + saat(i + 2) * 1.4, n = 0; b < gesamt - 0.5; n++, b += 2.4 + saat(i * 7 + n) * 2.2) blinzeln.push(zahl(b))
  const zeilen = []
  zeilenIds.forEach((zid, n) => {
    const an = Z.an(zid)
    const ende = Z.ende(zid)
    const lippe = 0.1 + saat(n + i * 3) * 0.035
    const schlaege = Math.max(1, Math.floor((ende - an) / (lippe * 2)))
    zeilen.push(`tl.to("#${id}-kopf", { rotation: ${n % 2 ? 1.5 : -1.6}, duration: 0.22, ease: "power2.out" }, ${zahl(an - 0.04)});
      tl.to("#${id}-kopf", { rotation: 0, duration: 0.6, ease: "power2.inOut" }, ${zahl(an + 0.2)});
      tl.to("${mund}", { scaleY: 2, y: 0.5, duration: ${zahl(lippe)}, ease: "sine.inOut", repeat: ${schlaege * 2 - 1}, yoyo: true }, ${zahl(an)});`)
  })
  return `gsap.set("#${id}-rumpf", { svgOrigin: "140 198" });
      gsap.set("#${id}-kopf", { svgOrigin: "138 132" });
      gsap.set("${auge}", { transformOrigin: "50% 50%" });
      gsap.set("${mund}", { transformOrigin: "50% 50%" });
      tl.fromTo("#${id}-rumpf", { scaleY: 1 }, { scaleY: 1.016, duration: ${zahl(takt)}, ease: "sine.inOut", repeat: ${atemzuege}, yoyo: true }, 0);
      tl.fromTo("#${id}-kopf", { y: 0 }, { y: -1.1, duration: ${zahl(takt)}, ease: "sine.inOut", repeat: ${atemzuege}, yoyo: true }, 0);
      ${blinzeln.map((b) => `tl.to("${auge}", { scaleY: 0.08, duration: 0.06, ease: "none", repeat: 1, yoyo: true }, ${b});`).join('\n      ')}
      ${zeilen.join('\n      ')}`
}

/** Das Werkzeug jedes Kollegen arbeitet, abgestimmt auf seine Sätze. */
const WERKZEUG = {
  // Arnold: Die Wippe steht waagerecht und kippt, wenn die eine Empfehlung fällt.
  architekt: (id, Z, S) => {
    const kipp = Z.bei(S.kann[0], 'Empfehlung')
    return `gsap.set("#${id}-brett, #${id}-last", { svgOrigin: "244 158" });
      gsap.set("#${id}-arm", { svgOrigin: "196 192" });
      tl.fromTo("#${id}-brett, #${id}-last", { rotation: -11 }, { rotation: -14, duration: 0.5, ease: "sine.inOut" }, ${zahl(Z.an(S.kann[0]))});
      tl.to("#${id}-brett, #${id}-last", { rotation: -8, duration: 0.5, ease: "sine.inOut" }, ${zahl(Z.an(S.kann[0]) + 0.5)});
      tl.to("#${id}-brett, #${id}-last", { rotation: -11, duration: 0.5, ease: "sine.inOut" }, ${zahl(Z.an(S.kann[0]) + 1)});
      tl.to("#${id}-brett, #${id}-last", { rotation: 0, duration: 0.8, ease: "back.out(2.4)" }, ${zahl(kipp)});
      tl.fromTo("#${id}-arm", { rotation: -5 }, { rotation: 0, duration: 0.6, ease: "power2.out" }, ${zahl(Math.max(0, kipp - 0.3))});`
  },
  // Gregor Dev: Er geht die Seite Zeile für Zeile durch und tippt mit dem Stift darauf.
  seiten: (id, Z, S) => {
    const an = Z.an(S.kann[0])
    return `gsap.set("#${id}-arm", { svgOrigin: "182 168" });
      gsap.set("#${id}-zettel", { svgOrigin: "292 36" });
      tl.fromTo("#${id}-bild g[stroke-width='1.4'] > *", { opacity: 0.12 }, { opacity: 1, duration: 0.3, stagger: 0.2, ease: "power2.out" }, ${zahl(an)});
      tl.fromTo("#${id}-arm", { rotation: 0 }, { rotation: -3.5, duration: 0.45, ease: "sine.inOut", repeat: 7, yoyo: true }, ${zahl(an)});
      tl.fromTo("#${id}-zettel", { rotation: -2.5 }, { rotation: 2.5, duration: 0.9, ease: "sine.inOut", repeat: 3, yoyo: true }, ${zahl(an)});`
  },
  // julia-trend: Sie hebt den Ausschnitt, der Anhänger mit der Quelle schwingt.
  researcherin: (id, Z, S) => {
    const an = Z.bei(S.kann[0], 'Neuigkeiten')
    return `gsap.set("#${id}-arm, #${id}-faden", { svgOrigin: "206 190" });
      gsap.set("#${id}-anhaenger", { svgOrigin: "285 80" });
      tl.fromTo("#${id}-arm, #${id}-faden", { rotation: -6, y: 6 }, { rotation: 0, y: 0, duration: 0.8, ease: "back.out(1.8)" }, ${zahl(an - 0.5)});
      tl.fromTo("#${id}-anhaenger", { rotation: -9 }, { rotation: 9, duration: 0.7, ease: "sine.inOut", repeat: 5, yoyo: true }, ${zahl(an)});`
  },
  // Hermes: Er reicht den Auftrag weiter, der Weg zum Fach zieht sich.
  orchestrator: (id, Z, S) => {
    const an = Z.bei(S.kann[0], 'gebe')
    return `gsap.set("#${id}-arm", { svgOrigin: "180 165" });
      tl.fromTo("#${id}-arm", { rotation: 3.5, x: -6 }, { rotation: 0, x: 0, duration: 0.7, ease: "back.out(1.8)" }, ${zahl(an - 0.25)});
      tl.fromTo('#${id}-bild path[stroke-dasharray="4 4"]', { clipPath: "inset(100% -20% -20% -20%)" }, { clipPath: "inset(-20% -20% -20% -20%)", duration: 0.7, ease: "power2.inOut" }, ${zahl(an)});
      tl.fromTo('#${id}-bild path[d^="M279 79"]', { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, ${zahl(an + 0.6)});
      tl.fromTo('#${id}-bild rect[x="275"]', { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(2.4)" }, ${zahl(an + 0.7)});`
  },
  // Fritz: Die Lupe wandert über das Blatt und bleibt auf der Fundstelle stehen.
  reviewer: (id, Z, S) => {
    const an = Z.an(S.kann[0])
    const fund = Z.bei(S.kann.at(-1), 'Fundstelle')
    const mitte = zahl(an + (fund - an) * 0.5)
    return `tl.fromTo("#${id}-lupe, #${id}-lupenrot", { x: -30, y: 2 }, { x: -12, y: -3, duration: ${zahl(mitte - an)}, ease: "sine.inOut" }, ${zahl(an)});
      tl.to("#${id}-lupe, #${id}-lupenrot", { x: 0, y: 0, duration: ${zahl(fund - mitte)}, ease: "sine.inOut" }, ${mitte});
      tl.fromTo("#${id}-lupenrot > path, #${id}-bild path[d^='M246 183']", { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.04, ease: "power2.out" }, ${zahl(fund)});`
  },
  // Theo: Die Haken kommen einer nach dem anderen, zuletzt das rote Kreuz.
  tester: (id, Z, S) => {
    const an = Z.an(S.kann[0])
    const kreuz = Z.bei(S.kann[0], 'führe')
    return `gsap.set("#${id}-arm, #${id}-kreuz", { svgOrigin: "196 190" });
      tl.fromTo("#${id}-arm, #${id}-kreuz", { rotation: -1.6 }, { rotation: 1.2, duration: 0.8, ease: "sine.inOut", repeat: 7, yoyo: true }, ${zahl(an)});
      tl.fromTo('#${id}-bild path[d^="M205.6 122"]', { clipPath: "inset(-10% -10% 100% -10%)" }, { clipPath: "inset(-10% -10% -10% -10%)", duration: 1.2, ease: "steps(3)" }, ${zahl(an)});
      tl.fromTo('#${id}-bild path[d^="M247.5 175"]', { opacity: 0.15 }, { opacity: 0.7, duration: 0.3, ease: "none", repeat: 11, yoyo: true }, ${zahl(an)});
      tl.fromTo("#${id}-kreuz path", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, ${zahl(kreuz + 0.3)});`
  },
  // Der Archivar: Die neue Karte sinkt an ihren Platz im Kasten, die Hand zieht sich zurück.
  archivar: (id, Z, S) => {
    const an = Z.an(S.kann[0])
    const platz = Z.bei(S.kann[0], 'Platz')
    return `tl.fromTo("#${id}-karte, #${id}-hand", { y: -26 }, { y: -26, duration: 0.01, ease: "none" }, 0);
      tl.to("#${id}-karte, #${id}-hand", { y: 0, duration: 0.9, ease: "power3.inOut" }, ${zahl(Math.max(an, platz - 0.5))});
      tl.to("#${id}-hand", { x: -9, y: 3, duration: 0.6, ease: "power2.out" }, ${zahl(Math.max(an, platz - 0.5) + 1)});`
  },
}

// Die Beispiele: jedes hat seine eigene Bewegung ------------------------------

/** Arnold: Der Bericht entsteht Zeile für Zeile, eine fällt auf. */
function beispielBericht(b, id, Z, S) {
  const zeilen = b.zeilen.map((z, i) => `<li id="${id}-z${i}"><span class="punkt"></span>${esc(z)}</li>`).join('')
  const an = Z.an(S.kann[0])
  const fallAuf = Z.bei(S.kann[0], 'bereite')
  const rotWeiter = Z.bei(S.kann[0], 'Empfehlung')
  return {
    stil: `    #${id}-bericht { position: absolute; inset: 0; padding: 24px 32px; border: 2px solid ${FARBE.linieHell}; border-radius: 28px; }
    #${id}-bericht h4 { margin: 0 0 12px; font-size: 28px; font-weight: 700; color: ${FARBE.leiseHell}; }
    #${id}-bericht ul { display: grid; grid-template-columns: repeat(4, auto); justify-content: start; gap: 8px 32px; margin: 0; padding: 0; list-style: none; font-size: 30px; font-weight: 600; color: ${FARBE.weiss}; }
    #${id}-bericht li { display: flex; align-items: center; gap: 12px; }
    #${id}-bericht .punkt { width: 16px; height: 16px; border-radius: 50%; background: ${FARBE.leiseHell}; }
    #${id}-auffaellig { margin-top: 22px; font-size: 40px; font-weight: 760; letter-spacing: -0.02em; color: ${FARBE.rot}; }
    #${id}-folge { margin-top: 8px; font-size: 28px; font-weight: 600; color: ${FARBE.leiseHell}; }`,
    html: `<div id="${id}-bericht">
          <h4 id="${id}-kopfzeile">${esc(b.titel)}</h4>
          <ul>${zeilen}</ul>
          <div id="${id}-auffaellig">${esc(b.auffaellig)}</div>
          <div id="${id}-folge">${esc(b.folge)}</div>
        </div>`,
    skript: `      tl.fromTo("#${id}-bericht", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, ${zahl(an - 0.5)});
      tl.fromTo("#${id}-kopfzeile", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% -2% 0% 0%)", duration: 0.5, ease: "none" }, ${zahl(an - 0.3)});
      tl.fromTo("#${id}-bericht li", { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, stagger: ${zahl(Math.max(0.2, (fallAuf - an - 0.4) / b.zeilen.length))}, ease: "power3.out" }, ${zahl(an + 0.2)});
      tl.fromTo("#${id}-bericht .punkt", { scale: 0.2 }, { scale: 1, duration: 0.3, stagger: ${zahl(Math.max(0.2, (fallAuf - an - 0.4) / b.zeilen.length))}, ease: "back.out(2.6)" }, ${zahl(an + 0.2)});
      tl.fromTo("#${id}-auffaellig", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: "power4.out" }, ${zahl(fallAuf)});
      tl.fromTo("#${id}-folge", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% -2% 0% 0%)", duration: 0.9, ease: "none" }, ${zahl(fallAuf + 0.7)});`,
    rot: { an: fallAuf, aus: rotWeiter, weg: rotWeg(`#${id}-auffaellig`, FARBE.weiss, rotWeiter) },
  }
}

/** Gregor Dev: Die Pakete füllen sich, der Zähler läuft, und dann steht da, was es noch nicht ist. */
function beispielProjekte(b, id, Z, S) {
  const kaesten = Array.from({ length: b.bau.gesamt }, (_, i) => `<i class="${i < b.bau.fertig ? 'voll' : ''}"></i>`).join('')
  const sagt = S.zusatz[0]
  const [vor, nach] = b.bau.stand.split(/(?<=\D)\d+(?= von )/)
  const stand = nach === undefined ? esc(b.bau.stand) : `${esc(vor)}<em id="${id}_pakete">0</em>${esc(nach)}`
  const anBau = Z.an(sagt)
  const voll = Z.bei(sagt, 'Paketen')
  const warnung = Z.bei(sagt, b.bau.warnung ? b.bau.warnung.split(/\s+/)[0] : 'Paketen')
  return {
    stil: `    #${id}-projekte { position: absolute; inset: 0; color: ${FARBE.weiss}; }
    #${id}-projekte .zeile { position: relative; padding: 12px 0 10px; }
    #${id}-projekte .zeile > hr { position: absolute; left: 0; right: 0; top: 0; height: 2px; margin: 0; border: 0; background: ${FARBE.linieHell}; transform-origin: left center; }
    #${id}-projekte b { display: block; font-size: 34px; font-weight: 760; letter-spacing: -0.02em; line-height: 1.2; }
    #${id}-projekte span { font-size: 28px; font-weight: 560; color: ${FARBE.leiseHell}; }
    #${id}-projekte em { font-style: normal; font-weight: 800; color: ${FARBE.weiss}; font-variant-numeric: tabular-nums; }
    #${id}-kaesten { display: grid; grid-template-columns: repeat(${b.bau.gesamt}, 1fr); gap: 4px; margin-top: 10px; }
    #${id}-kaesten i { display: block; height: 20px; border: 2px solid ${FARBE.linieHell}; border-radius: 4px; }
    #${id}-kaesten u { display: block; height: 100%; background: ${FARBE.weiss}; transform-origin: center bottom; }
    #${id}-warnung { display: block; margin-top: 10px; font-size: 58px; font-weight: 820; line-height: 1.05; letter-spacing: -0.03em; color: ${FARBE.rot}; }`,
    html: `<div id="${id}-projekte">
          <div class="zeile" id="${id}-laeuft"><hr/><b>${esc(b.laeuft.name)}</b><span>${esc(b.laeuft.status)}</span></div>
          <div class="zeile" id="${id}-bau"><hr/><b>${esc(b.bau.name)}</b><span>${stand}</span>
            <div id="${id}-kaesten">${kaesten.replace(/<i class="voll"><\/i>/g, '<i><u></u></i>')}</div>
            ${b.bau.warnung ? `<strong id="${id}-warnung">${esc(b.bau.warnung)}</strong>` : ''}
          </div>
        </div>`,
    skript: `      tl.fromTo("#${id}-laeuft", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, ${zahl(Z.an(S.kann[0]))});
      tl.fromTo("#${id}-bau", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, ${zahl(Z.an(S.kann.at(-1)))});
      tl.fromTo("#${id}-kaesten u", { scaleY: 0 }, { scaleY: 1, duration: 0.12, stagger: { amount: ${zahl(Math.max(0.5, voll - anBau))} }, ease: "power2.out" }, ${zahl(anBau)});
      ${nach === undefined ? '' : zaehler(`${id}_pakete`, b.bau.fertig, anBau, Math.max(0.5, voll - anBau))}
      ${b.bau.warnung ? `tl.fromTo("#${id}-kaesten", { opacity: 1 }, { opacity: 0.4, duration: 0.3, ease: "power2.out" }, ${zahl(warnung)});
      tl.fromTo("#${id}-warnung", { opacity: 0, y: 26, scale: 0.92, transformOrigin: "0% 50%" }, { opacity: 1, y: 0, scale: 1, transformOrigin: "0% 50%", duration: 0.5, ease: "expo.out" }, ${zahl(warnung - 0.04)});` : ''}`,
    rot: { an: warnung, bleibt: !!b.bau.warnung },
  }
}

/** julia-trend: Der Bericht kommt als Nachricht an und schreibt sich, die Quelle stempelt sich dazu. */
function beispielNachricht(b, id, Z, S) {
  const an = Z.bei(S.kann[0], 'Neuigkeiten')
  const stempel = Z.bei(S.kann[0], 'vergleiche')
  return {
    stil: `    #${id}-nachricht { position: absolute; left: 0; right: 0; top: 0; padding: 26px 32px; border-radius: 28px; background: ${FARBE.tief}; color: ${FARBE.weiss}; }
    #${id}-nachricht h4 { margin: 0 0 8px; font-size: 28px; font-weight: 700; color: ${FARBE.leiseHell}; }
    #${id}-nachricht p { margin: 0; font-size: 34px; font-weight: 620; line-height: 1.22; letter-spacing: -0.015em; }
    #${id}-quelle { display: inline-block; margin-top: 14px; font-size: 28px; font-weight: 760; color: ${FARBE.rot}; }`,
    html: `<div id="${id}-nachricht">
          <h4>${esc(b.kopf)}</h4>
          <p>${zeichen(b.text, `${id}-tz`)}</p>
          <span id="${id}-quelle">${esc(b.fuss)}</span>
        </div>`,
    skript: `      tl.fromTo("#${id}-nachricht", { y: 70, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" }, ${zahl(an - 0.5)});
      ${tippen(`.${id}-tz`, an - 0.1, Math.max(0.8, stempel - an))}
      tl.fromTo("#${id}-quelle", { opacity: 0, scale: 1.5, transformOrigin: "0% 50%" }, { opacity: 1, scale: 1, transformOrigin: "0% 50%", duration: 0.32, ease: "power4.out" }, ${zahl(stempel)});`,
    rot: { an: stempel, aus: Z.an(S.nie), weg: rotWeg(`#${id}-quelle`, FARBE.weiss, Z.an(S.nie) - 0.1) },
  }
}

/** Hermes: Du tippst, er fragt zurück, darunter steht, wie weit er wirklich ist. */
function beispielChat(b, id, Z, S) {
  const an = Z.an(S.kann[0])
  const frage = S.kann.at(-1)
  const anFrage = Z.an(frage)
  const training = S.zusatz[0]
  const team = S.zusatz[1]
  return {
    stil: `    #${id}-chat { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; }
    #${id}-chat .n { max-width: 94%; padding: 14px 24px; border-radius: 24px; font-size: 30px; font-weight: 600; line-height: 1.2; letter-spacing: -0.012em; }
    #${id}-du { align-self: flex-end; background: ${FARBE.dunst}; color: ${FARBE.tief}; border: 2px solid ${FARBE.linie}; border-bottom-right-radius: 6px; }
    #${id}-er { align-self: flex-start; background: ${FARBE.tief}; color: ${FARBE.weiss}; border-bottom-left-radius: 6px; }
    #${id}-training { margin-top: 2px; font-size: 30px; font-weight: 720; color: ${FARBE.tief}; }
    #${id}-team { font-size: 30px; font-weight: 720; color: ${FARBE.tief}; }`,
    html: `<div id="${id}-chat">
          <div class="n" id="${id}-du">${zeichen(b.du, `${id}-duz`)}</div>
          <div class="n" id="${id}-er">${zeichen(b.er, `${id}-erz`)}</div>
          <div id="${id}-training">${esc(b.training)}</div>
          ${b.team ? `<div id="${id}-team">${esc(b.team)}</div>` : ''}
        </div>`,
    skript: `      tl.fromTo("#${id}-du", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power4.out" }, ${zahl(an - 0.1)});
      ${tippen(`.${id}-duz`, an + 0.1, Math.max(0.8, anFrage - an - 1))}
      tl.fromTo("#${id}-er", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power4.out" }, ${zahl(anFrage - 0.15)});
      ${tippen(`.${id}-erz`, anFrage, Math.max(0.7, Z.ende(frage) - anFrage + 0.2))}
      tl.fromTo("#${id}-training", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, ${zahl(Z.an(training) - 0.05)});
      ${b.team && team ? `tl.fromTo("#${id}-team", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, ${zahl(Z.an(team) - 0.05)});` : ''}`,
    rot: {},
  }
}

/** Fritz: Die Zahl zählt hoch, der Balken teilt sich auf. */
function beispielZaehler(b, id, Z, S) {
  const teile = b.teile.map((x, i) => `<div class="teil" id="${id}-t${i}"><b class="${x.rot ? 'rot' : ''}">${x.zahl}</b> ${esc(x.text)}</div>`).join('')
  const balken = b.teile.map((x, i) => `<i id="${id}-b${i}" class="${x.rot ? 'rot' : ''}" style="flex-grow: ${x.zahl}"></i>`).join('')
  const an = Z.an(S.kann[0])
  const teileAn = Z.ende(S.kann[0]) - 0.8
  const fund = Z.bei(S.kann.at(-1), 'Fundstelle')
  const nameZahl = `${id}_zahl`
  return {
    stil: `    #${id}-zaehler { position: absolute; inset: 0; color: ${FARBE.tief}; }
    #${id}-zahlkopf { font-size: 34px; font-weight: 620; letter-spacing: -0.012em; }
    #${id}-zahlkopf b { font-size: 76px; font-weight: 800; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
    #${id}-balken { display: flex; gap: 4px; height: 20px; margin: 12px 0 16px; transform-origin: left center; }
    #${id}-balken i { display: block; min-width: 10px; background: ${FARBE.tief}; opacity: 0.85; }
    #${id}-balken i.rot { background: ${FARBE.rot}; opacity: 1; }
    #${id}-teile { display: flex; gap: 32px; font-size: 28px; font-weight: 600; color: ${FARBE.leise}; }
    #${id}-teile b { font-weight: 800; color: ${FARBE.tief}; font-variant-numeric: tabular-nums; }
    #${id}-teile b.rot { color: ${FARBE.rot}; }`,
    html: `<div id="${id}-zaehler">
          <div id="${id}-zahlkopf"><b id="${nameZahl}">0</b> ${esc(b.was)}</div>
          <div id="${id}-balken">${balken}</div>
          <div id="${id}-teile">${teile}</div>
        </div>`,
    skript: `      tl.fromTo("#${id}-zahlkopf", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, ${zahl(an - 0.1)});
      ${zaehler(nameZahl, b.gesamt, an, Math.max(1, teileAn - an))}
      tl.fromTo("#${id}-balken", { scaleX: 0 }, { scaleX: 1, duration: ${zahl(Math.max(1, teileAn - an))}, ease: "power2.out" }, ${zahl(an)});
      tl.fromTo("#${id}-teile .teil", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.32, ease: "power3.out" }, ${zahl(teileAn)});`,
    // Bis der letzte Teil steht, ist nichts rot; dann trägt ihn das Beispiel, bis die Fundstelle fällt
    rot: {
      an: teileAn,
      aus: fund,
      weg: `tl.fromTo("#${id}-balken i.rot", { backgroundColor: "${FARBE.tief}" }, { backgroundColor: "${FARBE.rot}", duration: 0.2, ease: "none" }, ${zahl(teileAn + 0.6)});
      tl.fromTo("#${id}-teile b.rot", { color: "${FARBE.tief}" }, { color: "${FARBE.rot}", duration: 0.2, ease: "none" }, ${zahl(teileAn + 0.6)});
      tl.to("#${id}-balken i.rot", { backgroundColor: "${FARBE.tief}", duration: 0.25, ease: "power2.inOut" }, ${zahl(fund - 0.05)});
      tl.to("#${id}-teile b.rot", { color: "${FARBE.tief}", duration: 0.25, ease: "power2.inOut" }, ${zahl(fund - 0.05)});`,
    },
  }
}

/** Theo: Die Balken laufen, grün so weit, wie die Tests grün sind. */
function beispielTests(b, id, Z, S) {
  const zeilen = b.zeilen
    .map((z, i) => {
      const anteil = zahl((z.gruen / z.von) * 100)
      return `<div class="zeile" id="${id}-z${i}">
            <div class="kopf"><b>${esc(z.name)}</b><span><em id="${id}_g${i}">0</em> von ${z.von} grün${z.wann ? `, ${esc(z.wann)}` : ''}</span></div>
            <div class="spur"><i id="${id}-f${i}" style="width: ${anteil}%"></i></div>
          </div>`
    })
    .join('')
  const beginn = Z.an(S.kann[0])
  const ende = Z.ende(S.kann.at(-1))
  const je = Math.max(1, (ende - beginn) / b.zeilen.length)
  const laeufe = b.zeilen
    .map((z, i) => {
      const s = zahl(beginn + i * je)
      return `      tl.fromTo("#${id}-z${i}", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, ${zahl(s - 0.1)});
      tl.fromTo("#${id}-f${i}", { scaleX: 0 }, { scaleX: 1, duration: ${zahl(je - 0.2)}, ease: "none" }, ${zahl(s + 0.1)});
      ${zaehler(`${id}_g${i}`, z.gruen, s + 0.1, je - 0.2)}`
    })
    .join('\n')
  return {
    stil: `    #${id}-tests { position: absolute; inset: 0; color: ${FARBE.tief}; }
    #${id}-tests .zeile { margin-bottom: 20px; }
    #${id}-tests .kopf { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
    #${id}-tests b { font-size: 36px; font-weight: 760; letter-spacing: -0.02em; }
    #${id}-tests span { font-size: 28px; font-weight: 600; color: ${FARBE.leise}; }
    #${id}-tests em { font-style: normal; font-weight: 800; color: ${FARBE.gruen}; font-variant-numeric: tabular-nums; }
    #${id}-tests .spur { height: 24px; margin-top: 10px; border-radius: 6px; background: ${FARBE.linie}; overflow: hidden; }
    #${id}-tests .spur i { display: block; height: 100%; background: ${FARBE.gruen}; transform-origin: left center; }`,
    html: `<div id="${id}-tests">
          ${zeilen}
        </div>`,
    skript: laeufe,
    rot: {},
  }
}

/** Der Archivar: Jedes kommt an seinen Platz. */
function beispielAblage(b, id, Z, S) {
  const zeilen = b.zeilen.map((z, i) => `<li id="${id}-z${i}"><span>${esc(z.was)}</span><i></i><u></u><b>${esc(z.wohin)}</b></li>`).join('')
  const beginn = Z.an(S.kann[0])
  const ende = Z.ende(S.kann.at(-1))
  const je = Math.max(0.7, (ende - beginn) / b.zeilen.length)
  return {
    stil: `    #${id}-ablage { position: absolute; inset: 0; margin: 0; padding: 0; list-style: none; color: ${FARBE.weiss}; }
    #${id}-ablage li { position: relative; display: grid; grid-template-columns: 300px 1fr auto; align-items: center; gap: 22px; padding: 14px 0; font-size: 36px; border-top: 2px solid ${FARBE.linieHell}; }
    #${id}-ablage span { font-weight: 560; color: ${FARBE.leiseHell}; }
    #${id}-ablage i { display: block; height: 4px; background: ${FARBE.weiss}; opacity: 0.55; transform-origin: left center; }
    #${id}-ablage u { position: absolute; left: 322px; top: 50%; width: 18px; height: 18px; margin-top: -9px; border-radius: 3px; background: ${FARBE.weiss}; }
    #${id}-ablage b { font-weight: 760; letter-spacing: -0.02em; }`,
    html: `<ul id="${id}-ablage">${zeilen}</ul>`,
    skript: b.zeilen
      .map((_, i) => {
        const s = zahl(beginn + i * je)
        return `      tl.fromTo("#${id}-z${i}", { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, ${s});
      tl.fromTo("#${id}-z${i} i", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "expo.inOut" }, ${zahl(s + 0.2)});
      tl.fromTo("#${id}-z${i} u", { x: 0, opacity: 1 }, { x: 150, opacity: 0, duration: 0.5, ease: "power2.in" }, ${zahl(s + 0.2)});
      tl.fromTo("#${id}-z${i} b", { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, ease: "power4.out" }, ${zahl(s + 0.55)});`
      })
      .join('\n'),
    rot: {},
  }
}

const BEISPIEL = {
  bericht: beispielBericht,
  projekte: beispielProjekte,
  nachricht: beispielNachricht,
  chat: beispielChat,
  zaehler: beispielZaehler,
  tests: beispielTests,
  ablage: beispielAblage,
}

/** Ein Halt: links die Zeichnung und das Beispiel, rechts der Text. */
function stopp(s, i, w, figur, plan) {
  const id = `s${i + 1}`
  const P = plan.stopps[i]
  const Z = uhrwerk(plan, w, P.start)
  const hell = s.hell
  const ink = hell ? FARBE.tief : FARBE.weiss
  const leise = hell ? FARBE.leise : FARBE.leiseHell
  const erster = i === 0
  const eigene = w.stimme.filter((z) => z.stopp === i)
  const nimm = (teil) => eigene.filter((z) => z.teil === teil).map((z) => z.id)
  const S = { ich: nimm('ich')[0], kann: nimm('kann'), zusatz: nimm('zusatz'), nie: nimm('nie')[0] }
  const weg = zahl(P.weg - P.start)
  const gesamt = P.dauer
  const b = BEISPIEL[s.beispiel.art](s.beispiel, id, Z, S)
  const anLand = zahl(P.landet - P.start)
  const ichWoerter = s.ich.split(/\s+/).map((x) => `<span class="${id}-m"><span class="${id}-w">${esc(x)}</span></span>`).join(' ')
  const kannWoerter = S.kann.flatMap((k) => woerterVon(eigene.find((z) => z.id === k)))
  const kannZeiten = S.kann.flatMap((k) => Z.woerter(k))
  const nieWoerter = woerterVon(eigene.find((z) => z.id === S.nie))
  // Das eine Rot wandert: erst die Zeichnung oder das Beispiel, zuletzt die Linie vor dem, was er nie tut.
  const rotBleibt = !!b.rot.bleibt
  const rotFigurAus = rotBleibt ? zahl(b.rot.an - 0.1) : Z.an(S.nie)
  return szene(
    `stopp${i + 1}`,
    `    #${id}-welt { position: absolute; inset: 0; color: ${ink}; }
    #${id}-kamera { position: absolute; inset: 0; }
    #${id}-rahmen { position: absolute; left: 96px; top: 72px; width: 760px; height: 570px; border-radius: 30px; overflow: hidden; }
    #${id}-bild { position: absolute; inset: 0; --k-rot: ${FARBE.rot}; }
    #${id}-beispiel { position: absolute; left: 96px; top: 668px; width: 760px; height: 300px; }
    #${id}-wann { position: absolute; left: 1080px; top: 118px; width: 660px; margin: 0; font-size: 40px; font-weight: 720; letter-spacing: -0.02em; line-height: 1.12; color: ${leise}; }
    #${id}-ich { position: absolute; left: 932px; top: 240px; width: 830px; margin: 0; font-size: 88px; font-weight: 790; letter-spacing: -0.045em; line-height: 1.04; }
    .${id}-m { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.14em; margin-bottom: -0.14em; }
    .${id}-w { display: inline-block; }
    #${id}-rolle { position: absolute; left: 940px; top: 350px; width: 790px; margin: 0; font-size: 34px; font-weight: 620; color: ${leise}; }
    #${id}-kann { position: absolute; left: 940px; top: 424px; width: 790px; margin: 0; font-size: 46px; font-weight: 600; line-height: 1.2; letter-spacing: -0.022em; }
    .${id}-kw, .${id}-nw { display: inline-block; }
    #${id}-nie { position: absolute; left: 940px; top: 790px; width: 790px; margin: 0; padding-top: 24px; font-size: 38px; font-weight: 640; line-height: 1.2; letter-spacing: -0.015em; }
    #${id}-nie-linie { position: absolute; left: 0; right: 0; top: 0; height: 0; border-top: 4px dashed ${rotBleibt ? ink : FARBE.rot}; transform-origin: left center; }
${b.stil}`,
    `    <div id="${id}-welt" data-layout-allow-overflow>
      <div id="${id}-kamera" data-layout-allow-overflow>
        <div id="${id}-rahmen" data-layout-allow-overflow><div id="${id}-bild">${figurGegliedert(figur, s.kopf, id)}</div></div>
        <div id="${id}-beispiel">
          ${b.html}
        </div>
        <p id="${id}-wann">${esc(s.wann)}</p>
        <h2 id="${id}-ich">${ichWoerter}</h2>
        <p id="${id}-rolle">${esc(s.rolle)}</p>
        <p id="${id}-kann">${kannWoerter.map((x) => `<span class="${id}-kw">${esc(x)}</span>`).join(' ')}</p>
        <p id="${id}-nie"><span id="${id}-nie-linie"></span><span id="${id}-nie-text">${nieWoerter.map((x) => `<span class="${id}-nw">${esc(x)}</span>`).join(' ')}</span></p>
      </div>
    </div>`,
    `      ${erster ? '' : `tl.fromTo("#${id}-welt", { x: ${BREITE} }, { x: 0, duration: ${SCHWENK}, ease: "expo.inOut" }, 0);`}
      // Kamera: das Bild schiebt sich langsam heran, die ganze Welt treibt ein wenig
      tl.fromTo("#${id}-bild", { scale: 1, transformOrigin: "94% 6%" }, { scale: 1.055, transformOrigin: "94% 6%", duration: ${zahl(gesamt)}, ease: "none" }, 0);
      tl.fromTo("#${id}-kamera", { x: ${i % 2 ? -10 : 10}, y: 4 }, { x: ${i % 2 ? 10 : -10}, y: -6, duration: ${zahl(gesamt)}, ease: "none" }, 0);
      tl.fromTo("#${id}-wann", { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.45, ease: "expo.out" }, ${zahl(Math.max(0.1, anLand - 0.2))});
      const ich = alle("#${id}-ich .${id}-w");
      ${Z.woerter(S.ich).map((t, n) => `tl.fromTo(ich[${n}], { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "power4.out" }, ${zahl(t - 0.03)});`).join('\n      ')}
      tl.fromTo("#${id}-rolle", { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" }, ${zahl(Z.ende(S.ich) - 0.12)});
      const kann = alle("#${id}-kann .${id}-kw");
      ${wortFuerWort('kann', kannZeiten)}
      ${figurLebt(s, i, id, Z, eigene.map((z) => z.id), gesamt)}
      ${WERKZEUG[s.kopf](id, Z, S)}
      // Das Rot der Zeichnung kommt mit der Pop-Bewegung und geht, wenn das nächste Rot kommt
      ${s.beispiel.art === 'bericht' ? `tl.fromTo("#${id}-bild", { "--k-rot": "${FARBE.tief}" }, { "--k-rot": "${FARBE.tief}", duration: 0.01, ease: "none" }, 0);
      tl.to("#${id}-bild", { "--k-rot": "${FARBE.rot}", duration: 0.25, ease: "none" }, ${zahl(b.rot.aus)});` : ''}
      ${s.beispiel.art === 'zaehler' ? `tl.fromTo("#${id}-bild", { "--k-rot": "${FARBE.tief}" }, { "--k-rot": "${FARBE.rot}", duration: 0.25, ease: "none" }, ${zahl(b.rot.aus)});` : ''}
      ${s.beispiel.art === 'nachricht' ? `tl.to("#${id}-bild", { "--k-rot": "${FARBE.tief}", duration: 0.25, ease: "power2.inOut" }, ${zahl(b.rot.an - 0.1)});` : ''}
      ${s.beispiel.art === 'nachricht' ? '' : `tl.to("#${id}-bild", { "--k-rot": "${FARBE.tief}", duration: 0.25, ease: "power2.inOut" }, ${rotFigurAus});`}
${b.skript}
      ${b.rot.weg ?? ''}
      tl.fromTo("#${id}-nie-linie", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.inOut" }, ${zahl(Z.an(S.nie) - 0.26)});
      const nie = alle("#${id}-nie .${id}-nw");
      ${wortFuerWort('nie', Z.woerter(S.nie))}
      tl.fromTo("#${id}-welt", { x: 0 }, { x: ${-BREITE}, duration: ${SCHWENK}, ease: "expo.inOut", immediateRender: false }, ${weg});`,
  )
}

/** Schluss: alle zusammen, und wer am Ende entscheidet */
function schluss(w, figuren, plan) {
  const Z = uhrwerk(plan, w, plan.schluss.start)
  const koepfe = w.koepfe.map((k, i) => `<li id="kopf${i}"><span class="bild">${figuren[k.id].kopf}</span><span class="name">${esc(k.name)}</span></li>`).join('')
  const maskiert = (text) =>
    esc(text)
      .split(/\s+/)
      .map((x) => `<span class="m"><span class="w">${x}</span></span>`)
      .join(' ')
  const [vorn, hinten] = w.kern
  const [mensch, wort] = hinten.split(/\s(?=\S+$)/)
  const zeiten = [...Z.woerter('schluss-kern1'), ...Z.woerter('schluss-kern2')]
  const letztes = zahl(plan.schluss.stimmeEnde - plan.schluss.start)
  return szene(
    'schluss',
    `    #schluss-welt { position: absolute; inset: 0; color: ${FARBE.weiss}; }
    #koepfe { position: absolute; left: 192px; right: 192px; top: 96px; margin: 0; padding: 0; list-style: none; display: flex; justify-content: space-between; }
    #koepfe li { width: 188px; text-align: center; }
    #koepfe .bild { display: block; width: 188px; }
    #koepfe .name { display: block; margin-top: 16px; font-size: 30px; font-weight: 700; letter-spacing: -0.015em; }
    #kern { position: absolute; left: 192px; top: 420px; margin: 0; font-size: 92px; font-weight: 780; line-height: 1.1; letter-spacing: -0.045em; }
    #kern .zeile { display: block; }
    #kern .rot .w { color: ${FARBE.rot}; }
    .m { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.14em; margin-bottom: -0.14em; }
    .w { display: inline-block; }
    #noch { position: absolute; left: 196px; top: 690px; margin: 0; font-size: 38px; font-weight: 600; color: ${FARBE.leiseHell}; }
    .nw { display: inline-block; }
    #marke { position: absolute; left: 192px; bottom: 112px; margin: 0; font-size: 34px; font-weight: 780; letter-spacing: -0.02em; }
    #marke span { font-weight: 560; color: ${FARBE.leiseHell}; }`,
    `    <div id="schluss-welt" data-layout-allow-overflow>
      <ul id="koepfe">${koepfe}</ul>
      <p id="kern">
        <span class="zeile">${maskiert(vorn)}</span>
        <span class="zeile">${maskiert(mensch)} <span class="rot">${maskiert(wort)}</span></span>
      </p>
      <p id="noch">${woerter(w.nochNicht, 'nw')}</p>
      <p id="marke">${esc(w.titel)} <span>· ${esc(w.name)} · Stand der Daten ${datum(w.stand)}</span></p>
    </div>`,
    `      tl.fromTo("#koepfe li", { x: 420, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "expo.out" }, ${zahl(SCHWENK - 0.05)});
      // Die Kamera kommt beim letzten Wort zur Ruhe, das Schlussbild steht still
      tl.fromTo("#schluss-welt", { scale: 1.03, transformOrigin: "30% 45%" }, { scale: 1, transformOrigin: "30% 45%", duration: ${letztes}, ease: "sine.out" }, 0);
      ${w.koepfe.map((_, i) => `tl.to('#kopf${i} ellipse[rx="2.3"]', { scaleY: 0.08, transformOrigin: "50% 50%", duration: 0.06, ease: "none", repeat: 1, yoyo: true }, ${zahl(SCHWENK + 1 + saat(i + 20) * Math.max(0.5, letztes - SCHWENK - 1))});`).join('\n      ')}
      const kern = alle("#kern .w");
      ${zeiten.map((t, n) => `tl.fromTo(kern[${n}], { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power4.out" }, ${zahl(t - 0.03)});`).join('\n      ')}
      const noch = alle("#noch .nw");
      ${wortFuerWort('noch', Z.woerter('schluss-noch'))}
      tl.fromTo("#marke", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, ${zahl(Z.an('schluss-noch'))});
      tl.set({}, {}, ${zahl(plan.schluss.dauer)});`,
  )
}

function wurzel(w, hosts, plan) {
  return `<!doctype html>
<!-- Erzeugt von scripts/vorstellung-daten.mjs aus data/projektstand.json, Stand ${w.stand}. Nicht von Hand ändern. -->
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${BREITE}, height=${HOEHE}" />
    <title>${esc(w.titel)}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${BREITE}px; height: ${HOEHE}px; overflow: hidden; background: ${FARBE.tief}; }
      #root { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${plan.dauer}" data-width="${BREITE}" data-height="${HOEHE}">
${hosts}
      <audio id="stimme" src="assets/stimme.wav" data-start="0" data-duration="${plan.dauer}" data-track-index="5" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`
}

const host = (id, start, laenge, spur, z) => `      <div
        id="${id}"
        class="clip"
        data-composition-id="${id}"
        data-composition-src="compositions/${id}.html"
        data-start="${start}"
        data-duration="${laenge}"
        data-track-index="${spur}"
        data-track-kind="graphics"
        data-width="${BREITE}"
        data-height="${HOEHE}"
        style="z-index: ${z}"
      ></div>`

export function kompositionen(w, figuren, plan) {
  const hosts = [host('boden', 0, plan.dauer, 0, 0), host('uhr', 0, plan.dauer, 1, 30)]
  const dateien = {
    'compositions/boden.html': boden(w, plan),
    'compositions/uhr.html': uhr(w, plan),
  }
  w.stopps.forEach((s, i) => {
    const id = `stopp${i + 1}`
    const p = plan.stopps[i]
    hosts.push(host(id, p.start, p.dauer, i % 2 === 0 ? 2 : 3, 10))
    dateien[`compositions/${id}.html`] = stopp(s, i, w, figuren[s.kopf].linie, plan)
  })
  hosts.push(host('schluss', plan.schluss.start, plan.schluss.dauer, 4, 10))
  dateien['compositions/schluss.html'] = schluss(w, figuren, plan)
  dateien['index.html'] = wurzel(w, hosts.join('\n'), plan)
  return dateien
}
