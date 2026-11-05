/**
 * Der Film „kiKollege in 30 Sekunden“ aus den Daten der Seite.
 *
 * Seit dem 29.10.2026 gibt es einen kurzen Film, gebaut mit HyperFrames (HTML mit
 * GSAP, Bild für Bild zu MP4 gerendert). Seit dem 05.11.2026 hat er eine Stimme,
 * und die Stimme ist die Uhr: Jede Zeit im Bild kommt aus der gemessenen Länge der
 * Sprachdateien. Der Film zeigt dasselbe wie die Szene Überblick und nimmt jede Zahl
 * und jeden Satz aus data/projektstand.json. Dieses Modul liest die Werte aus, bildet
 * daraus einen Fingerabdruck und schreibt die Kompositionen. Gerendert wird mit
 * scripts/baue-film.mjs; scripts/pruefe-film.mjs meldet, wenn sich die Daten oder der
 * gesprochene Text seitdem geändert haben.
 *
 * Bewegungen von der Seite sind übernommen (Vorhang, Wörter aus der Maske, der
 * Zeitstrahl, der sich zieht); was nicht übertragbar war, steht in film/UEBERTRAGUNG.md.
 */

import { createHash } from 'node:crypto'

import { woerterVon, wortZeiten, zeile } from './stimme.mjs'

export const BREITE = 1920
export const HOEHE = 1080
/** Die Länge, die der Titel verspricht. Die Stimme muss hineinpassen, Abweichung höchstens eine Sekunde. */
export const SOLL = 30
export const TOLERANZ = 1
/** So lange überlappen sich zwei Einstellungen im Übergang */
const UEBERGANG = 0.6
/** So lange bleibt das Schlussbild nach dem letzten Wort stehen */
const HALT = 2.1

/**
 * Die Einstellungen in ihrer Reihenfolge. `vor` ist die Zeit bis zum ersten Wort,
 * `luft` die Pause zwischen zwei Sätzen, `nach` die Zeit vom letzten Wort bis zum
 * Beginn des Übergangs. Wann was geschieht, rechnet zeitplan() aus den Messungen.
 */
export const REIHE = [
  { id: 'vorhang', vor: 0.3, luft: 0.14, nach: 0.2 },
  { id: 'auftrag', vor: 0.38, luft: 0.1, nach: 0.2 },
  { id: 'zeitstrahl', vor: 0.38, luft: 0.14, nach: 0.4 },
  { id: 'pruefstand', vor: 0.38, luft: 0.14, nach: 0.7 },
  { id: 'risiko', vor: 0.38, luft: 0.14, nach: 0.2 },
  { id: 'schluss', vor: 0.38, luft: 0.14, nach: HALT },
]

const datum = (iso) => {
  const [j, m, t] = iso.split('-')
  return `${t}.${m}.${j}`
}
const kurz = (iso) => datum(iso).slice(0, 6)
const tage = (von, bis) => Math.round((Date.parse(bis) - Date.parse(von)) / 86_400_000)
const terminText = (m, knapp = true) =>
  m.terminOffen ? 'Termin offen' : `${m.fruehestens ? 'frühestens ' : ''}${knapp ? kurz(m.termin) : datum(m.termin)}`

/** Ganze Sätze vom Anfang eines Textes, bis mindestens so viele Wörter
 *  beisammen sind. Ein Satz endet vor einem Leerzeichen und einem Großbuchstaben,
 *  damit Daten wie 30.10. ihn nicht zerschneiden. */
export function anfang(text, woerter = 5) {
  const saetze = text.trim().split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
  let t = ''
  for (const s of saetze) {
    t = t ? `${t} ${s}` : s
    if (t.split(/\s+/).length >= woerter) break
  }
  return /[.!?]$/.test(t) ? t : `${t}.`
}

/** Anteil der Breite für die Tage; dahinter stehen Meilensteine ohne Termin.
 *  Gleich wie im Zeitstrahl der Seite. */
const TAGE_BREITE = 80

/** Alles, was der Film zeigt und sagt, als schlichte Werte. Ändert sich einer, ist
 *  der Film veraltet; dazu gehören der gesprochene Text und die Einstellung der Stimme. */
export function filmDaten(d) {
  const p = d.produktseite
  const plan = d.meilensteinplanAktuell
  const laeufe = d.training.laeufe
  const letzter = laeufe.zeilen.at(-1)
  const faelle = laeufe.bereiche.reduce((s, b) => s + b.faelle, 0)
  const ziel = plan.fristen.find((f) => f.kritisch && f.text.startsWith('Der Orchestrator beherrscht'))?.frist ?? null
  const szene = (id) => p.szenen.find((s) => s.id === id)

  // Zeitstrahl wie auf der Seite: vom Beginn des Plans bis zum spätesten festen Datum
  const fest = plan.meilensteine.filter((m) => !m.terminOffen).map((m) => m.abgenommen?.am ?? m.termin)
  const ende = [...fest, ...plan.risikoplan.schritte.map((s) => s.bis), d.stand, ziel ?? d.stand].sort().at(-1)
  const x = (iso) => (tage(plan.von, iso) / tage(plan.von, ende)) * TAGE_BREITE
  const offen = plan.meilensteine.filter((m) => m.terminOffen)
  const meilensteine = plan.meilensteine.map((m) => {
    if (m.terminOffen) {
      const i = offen.indexOf(m)
      return { id: m.id, titel: m.titel, art: 'offen', wann: 'Termin offen', x: TAGE_BREITE + ((i + 1) * (100 - TAGE_BREITE)) / (offen.length + 1) }
    }
    if (m.abgenommen) return { id: m.id, titel: m.titel, art: 'fertig', wann: `abgenommen ${kurz(m.abgenommen.am)}`, x: x(m.abgenommen.am) }
    return { id: m.id, titel: m.titel, art: 'kommt', wann: terminText(m), x: x(m.termin) }
  })
  const monate = []
  let [jahr, monat] = plan.von.split('-').map(Number)
  for (;;) {
    if (monat === 12) { monat = 1; jahr++ } else monat++
    const erster = `${jahr}-${String(monat).padStart(2, '0')}-01`
    if (erster > ende) break
    monate.push({ name: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'][monat - 1], x: x(erster) })
  }

  // Für jeden Schritt der Anleitung die erste Nachricht aus dem nachgestellten Auftrag
  const nachrichten = d.anleitung.schritte.map((_, i) => {
    const n = p.beispielAuftrag.nachrichten.find((n) => n.schritt === i)
    return n ? { du: n.von === 'du', text: anfang(n.text) } : null
  })

  const hohe = plan.risiken.filter((r) => r.stufe === 'hoch' && !r.aufgegangenIn)
  const eingetreten = hohe.filter((r) => r.eingetreten)
  const risiko = eingetreten[0] ?? hohe[0] ?? plan.risiken.find((r) => !r.aufgegangenIn)
  const team = plan.meilensteine.find((m) => m.id === d.anleitung.teamAb)
  const teamFest = team && !team.terminOffen
  const entscheidet = anfang(p.lead.split(/(?<=[.!?])\s+/).at(-1))
  const schritte = d.anleitung.schritte.map((s) => s.titel)
  const abgenommen = meilensteine.filter((m) => m.art === 'fertig').at(-1)

  // Was gesprochen wird. Jede Zahl und jeder Termin kommt aus den Daten.
  const sprich = (szeneId, id, text, anker) => zeile(`${szeneId}-${id}`, text, { szene: szeneId, anker })
  const stimme = [
    sprich('vorhang', 'name', `${p.name}.`),
    sprich('vorhang', 'kern1', p.vorstellung.kern[0]),
    sprich('vorhang', 'kern2', p.vorstellung.kern[1]),
    sprich('auftrag', 'titel', szene('anwenden').titel),
    ...schritte.map((t, i) => sprich('auftrag', `schritt${i + 1}`, `${t}.`)),
    sprich('auftrag', 'schluss', entscheidet),
    sprich('zeitstrahl', 'titel', szene('ueberblick').titel),
    ...(abgenommen ? [sprich('zeitstrahl', 'fertig', `Meilenstein ${abgenommen.id.slice(1)} ist abgenommen.`)] : []),
    sprich('pruefstand', 'zahl', `Der Orchestrator steht bei ${letzter.gelernt} von ${faelle} Prüffällen.`, [String(letzter.gelernt), 'von', 'Prüffällen']),
    sprich('risiko', 'titel', `Die größte Herausforderung: ${risiko.titel}.`),
    sprich(
      'schluss',
      'team',
      teamFest ? `Das Team kommt ${team.fruehestens ? 'frühestens ' : ''}am ${kurz(team.termin)} dazu.` : 'Wann das Team dazukommt, ist noch offen.',
    ),
    sprich('schluss', 'beauftragen', 'Ab dann kannst du beauftragen.'),
  ]

  return {
    stand: d.stand,
    name: p.name,
    dach: p.dach,
    kern: p.vorstellung.kern,
    entscheidet,
    anwenden: szene('anwenden').titel,
    ueberblick: szene('ueberblick').titel,
    schritte,
    nachrichten,
    zeitstrahl: { stand: x(d.stand), standText: kurz(d.stand), meilensteine, monate },
    pruefstand: { gelernt: letzter.gelernt, faelle, ziel: ziel ? kurz(ziel) : null, lauf: letzter.wann },
    risiko: { nr: risiko.nr, titel: risiko.titel, stufe: risiko.stufe, eingetreten: !!risiko.eingetreten, von: eingetreten.length },
    stimme,
  }
}

/** Kurzer Fingerabdruck der Werte, damit eine Prüfung merkt, wenn der Film
 *  nicht mehr zu den Daten passt. */
export function fingerabdruck(werte) {
  return createHash('sha256').update(JSON.stringify(werte)).digest('hex').slice(0, 16)
}

// ---------------------------------------------------------------------------
// Zeitplan: aus den gemessenen Längen der Sprachdateien
// ---------------------------------------------------------------------------

/**
 * Rechnet aus den Messungen, wann jede Einstellung und jedes Wort kommt.
 * `zeiten` kommt aus messeZeilen(): je Zeile `dauer` und `anker`.
 */
export function zeitplan(werte, zeiten) {
  const szenen = {}
  const zeilen = {}
  let t = 0
  for (const s of REIHE) {
    const start = t
    let u = start + s.vor
    let stimmeEnde = u
    for (const z of werte.stimme.filter((x) => x.szene === s.id)) {
      const m = zeiten[z.id]
      zeilen[z.id] = { start: zahl(u), dauer: m.dauer, woerter: wortZeiten(z, m).map((v) => zahl(u + v)) }
      stimmeEnde = u + m.dauer
      u = stimmeEnde + s.luft
    }
    t = stimmeEnde + s.nach
    szenen[s.id] = { start: zahl(start), ende: zahl(t), stimmeEnde: zahl(stimmeEnde) }
  }
  const dauer = zahl(t)
  const reihe = REIHE.map((s) => s.id)
  reihe.forEach((id, i) => {
    // Die letzte läuft bis zum Schluss, jede andere noch durch den Übergang
    szenen[id].dauer = zahl(szenen[id].ende - szenen[id].start + (i < reihe.length - 1 ? UEBERGANG : 0))
  })
  return { dauer, szenen, zeilen }
}

/** Liegt die Länge im Rahmen dessen, was der Titel verspricht? */
export const laengePasst = (plan) => Math.abs(plan.dauer - SOLL) <= TOLERANZ

// ---------------------------------------------------------------------------
// Kompositionen
// ---------------------------------------------------------------------------

const FARBE = {
  weiss: '#FFFFFF',
  tief: '#140B0B',
  weich: '#241414',
  rot: '#F40E0E',
  leise: '#6B5F5F',
  leiseHell: 'rgba(255, 255, 255, 0.7)',
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
function zahl(n) { return Number(n.toFixed(3)) }

/** Ortszeiten einer Einstellung: alles, was die Komposition aus dem Plan braucht */
function ort(plan, id) {
  const s = plan.szenen[id]
  const lokal = (t) => zahl(Math.max(0, t - s.start))
  return {
    aus: zahl(s.ende - s.start),
    dauer: s.dauer,
    an: (zid) => lokal(plan.zeilen[zid].start),
    ende: (zid) => lokal(plan.zeilen[zid].start + plan.zeilen[zid].dauer),
    wort: (zid, i) => lokal(plan.zeilen[zid].woerter[Math.max(0, i < 0 ? plan.zeilen[zid].woerter.length + i : i)]),
    woerter: (zid) => plan.zeilen[zid].woerter.map(lokal),
  }
}

/** Wörter in Masken, damit sie von unten hereinkommen können wie auf der Seite */
const maskiert = (text, klasse) =>
  esc(text)
    .split(/\s+/)
    .map((w) => `<span class="${klasse}-maske"><span class="${klasse}-w">${w}</span></span>`)
    .join(' ')
const woerter = (text, klasse) =>
  esc(text)
    .split(/\s+/)
    .map((w) => `<span class="${klasse}-w">${w}</span>`)
    .join(' ')
/** Jedes Zeichen einzeln, damit ein Text getippt werden kann; der Platz steht von Anfang an fest */
const zeichen = (text, klasse) =>
  String(text)
    .split(/\s+/)
    .map((w) => `<span style="white-space: nowrap">${[...w].map((c) => `<span class="${klasse}">${esc(c)}</span>`).join('')}</span>`)
    .join(' ')

const maskenStil = (k) => `    .${k}-maske { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.14em; margin-bottom: -0.14em; }
    .${k}-w { display: inline-block; }`

/** Wörter, die zu ihrer Zeit aus der Maske steigen. `name` ist eine Liste im Skript. */
const steigen = (name, zeiten) => zeiten.map((t, i) => `tl.fromTo(${name}[${i}], { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: "power4.out" }, ${zahl(t)});`).join('\n      ')
/** Wörter, die zu ihrer Zeit scharf werden, ohne sich zu bewegen */
const scharf = (name, zeiten) => zeiten.map((t, i) => `tl.fromTo(${name}[${i}], { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.16, ease: "power4.out" }, ${zahl(t)});`).join('\n      ')
/** Wörter, die zu ihrer Zeit von Hellgrau zu Tinte wechseln */
const einfaerben = (name, zeiten, farbe) => zeiten.map((t, i) => `tl.fromTo(${name}[${i}], { color: "#DCD4D4" }, { color: "${farbe}", duration: 0.12, ease: "none" }, ${zahl(t)});`).join('\n      ')

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
    }
    .buehne { position: absolute; inset: 0; overflow: hidden; }
    .kamera { position: absolute; inset: 0; }
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

/** Eine langsame Kamerafahrt, die ganze Einstellung lang */
const kamera = (auswahl, dauer, { scale = 1.045, x = -18, y = -8, ursprung = '35% 55%' } = {}) =>
  `tl.fromTo("${auswahl}", { scale: 1, x: 0, y: 0, transformOrigin: "${ursprung}" }, { scale: ${scale}, x: ${x}, y: ${y}, transformOrigin: "${ursprung}", duration: ${zahl(dauer)}, ease: "none" }, 0);`

/** 1. Vorhang und Kernsatz: rote Türen öffnen sich, wie beim Laden der Seite */
function vorhang(w, plan) {
  const Z = ort(plan, 'vorhang')
  const [kern1, kern2] = w.kern
  const [mensch, wort] = kern2.split(/\s(?=\S+$)/)
  // Die Türen öffnen sich auf der letzten Silbe des Namens
  const offen = zahl(Math.max(0.55, Z.ende('vorhang-name') - 0.32))
  const kernZeiten = [...Z.woerter('vorhang-kern1'), ...Z.woerter('vorhang-kern2')]
  return szene(
    'vorhang',
    `    #vorhang-buehne { background: ${FARBE.tief}; color: ${FARBE.weiss}; }
${maskenStil('vorhang')}
    #vorhang-dach { position: absolute; left: 196px; top: 230px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leiseHell}; }
    #vorhang-dach span { display: inline-block; }
    #vorhang-marke { position: absolute; left: 180px; top: 280px; margin: 0; font-size: 250px; font-weight: 800; line-height: 1; letter-spacing: -0.055em; }
    #vorhang-kern { position: absolute; left: 192px; top: 650px; margin: 0; font-size: 78px; font-weight: 720; line-height: 1.12; letter-spacing: -0.035em; }
    #vorhang-kern .zeile { display: block; }
    #vorhang-kern .rot .vorhang-w { color: ${FARBE.rot}; }
    #vorhang-vorhang { position: absolute; inset: 0; z-index: 5; }
    .vorhang-tuer { position: absolute; left: 0; right: 0; height: 50.5%; background: ${FARBE.rot}; }
    .vorhang-tuer.oben { top: 0; }
    .vorhang-tuer.unten { bottom: 0; }
    #vorhang-wort { position: absolute; left: 0; right: 0; top: 455px; height: 170px; margin: 0; overflow: hidden; text-align: center; font-size: 120px; font-weight: 800; line-height: 150px; letter-spacing: -0.05em; }
    #vorhang-wort span { display: inline-block; }`,
    `    <div id="vorhang-buehne" class="buehne">
      <div id="vorhang-kamera" class="kamera" data-layout-allow-overflow>
        <p id="vorhang-dach">${woerter(w.dach, 'vorhang-d')}</p>
        <h1 id="vorhang-marke">${maskiert(w.name, 'vorhang')}</h1>
        <p id="vorhang-kern">
          <span class="zeile">${maskiert(kern1, 'vorhang')}</span>
          <span class="zeile">${maskiert(mensch, 'vorhang')} <span class="rot">${maskiert(wort, 'vorhang')}</span></span>
        </p>
      </div>
      <div id="vorhang-vorhang" data-layout-allow-overflow data-layout-allow-occlusion>
        <div class="vorhang-tuer oben"></div>
        <div class="vorhang-tuer unten"></div>
        <p id="vorhang-wort" data-layout-allow-overlap><span>${esc(w.name)}</span></p>
      </div>
    </div>`,
    `      ${kamera('#vorhang-kamera', Z.dauer)}
      tl.fromTo("#vorhang-wort span", { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: "power3.out" }, 0.08);
      tl.fromTo("#vorhang-wort span", { scale: 1 }, { scale: 1.06, duration: ${zahl(offen)}, ease: "none" }, 0);
      tl.fromTo("#vorhang-wort span", { opacity: 1 }, { opacity: 0, duration: 0.15, ease: "power1.in" }, ${zahl(offen - 0.05)});
      tl.fromTo("#vorhang-vorhang .oben", { yPercent: 0 }, { yPercent: -100, duration: 0.5, ease: "power4.inOut" }, ${offen});
      tl.fromTo("#vorhang-vorhang .unten", { yPercent: 0 }, { yPercent: 100, duration: 0.5, ease: "power4.inOut" }, ${offen});
      tl.fromTo("#vorhang-marke .vorhang-w", { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "power4.out" }, ${zahl(offen + 0.18)});
      tl.fromTo("#vorhang-dach .vorhang-d-w", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.16, stagger: 0.09, ease: "power4.out" }, ${zahl(offen + 0.32)});
      const kern = alle("#vorhang-kern .vorhang-w");
      ${steigen('kern', kernZeiten)}`,
  )
}

/** 2. So gibst du einen Auftrag: drei Schritte, daneben der Chat */
function auftrag(w, plan) {
  const Z = ort(plan, 'auftrag')
  const schritte = w.schritte
    .map((t, i) => `        <li id="auftrag-schritt-${i + 1}"><i class="linie"></i><span class="nr">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(t)}</span></li>`)
    .join('\n')
  const nachrichten = w.nachrichten
    .map((n, i) => (n ? `          <li id="auftrag-n-${i + 1}" class="auftrag-n${n.du ? ' du' : ''}">${zeichen(n.text, `auftrag-z${i + 1}`)}</li>` : ''))
    .join('\n')
  const [vorn, ...hinten] = w.entscheidet.split(/,\s*/)
  const anStep = (i) => Z.an(`auftrag-schritt${i + 1}`)
  const endeStep = (i) => Z.ende(`auftrag-schritt${i + 1}`)
  const schlussZeiten = Z.woerter('auftrag-schluss')
  return szene(
    'auftrag',
    `    #root { background: ${FARBE.weiss}; }
    #auftrag-buehne { background: ${FARBE.weiss}; color: ${FARBE.tief}; }
    #auftrag-marke { position: absolute; left: 196px; top: 140px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leise}; }
    #auftrag-titel { position: absolute; left: 188px; top: 190px; margin: 0; font-size: 96px; font-weight: 780; line-height: 1; letter-spacing: -0.045em; }
    .auftrag-t-w { display: inline-block; }
    #auftrag-schritte { position: absolute; left: 192px; top: 360px; width: 780px; margin: 0; padding: 0; list-style: none; }
    #auftrag-schritte li { position: relative; display: flex; gap: 28px; align-items: baseline; padding: 24px 0; }
    #auftrag-schritte .linie { position: absolute; left: 0; right: 0; top: 0; height: 2px; background: rgba(20, 11, 11, 0.14); transform-origin: left center; }
    #auftrag-schritte .nr { font-size: 30px; font-weight: 700; color: ${FARBE.leise}; font-variant-numeric: tabular-nums; }
    #auftrag-schritte .t { font-size: 50px; font-weight: 740; letter-spacing: -0.035em; }
    #auftrag-zeiger { position: absolute; left: 160px; top: 372px; width: 10px; height: 76px; border-radius: 5px; background: ${FARBE.rot}; }
    #auftrag-chat { position: absolute; left: 1000px; top: 330px; width: 728px; padding: 28px; border-radius: 36px; background: ${FARBE.tief}; color: ${FARBE.weiss}; box-shadow: 0 60px 120px -60px rgba(20, 11, 11, 0.7); }
    #auftrag-chat .kopf { display: flex; gap: 16px; align-items: baseline; margin: 0; padding: 4px 8px 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); font-size: 32px; font-weight: 700; }
    #auftrag-chat .kopf span { font-size: 28px; font-weight: 500; color: ${FARBE.leiseHell}; }
    #auftrag-chat ul { list-style: none; margin: 0; padding: 24px 0 4px; display: flex; flex-direction: column; gap: 18px; }
    .auftrag-n { max-width: 88%; padding: 18px 24px; border-radius: 26px 26px 26px 8px; background: rgba(255, 255, 255, 0.1); font-size: 28px; line-height: 1.4; }
    .auftrag-n.du { align-self: flex-end; border-radius: 26px 26px 8px 26px; background: rgba(255, 255, 255, 0.22); }
    #auftrag-schluss { position: absolute; left: 192px; top: 790px; width: 760px; margin: 0; font-size: 64px; font-weight: 760; line-height: 1.08; letter-spacing: -0.035em; }
    #auftrag-schluss .rot { color: ${FARBE.rot}; }
    .auftrag-s-w { display: inline-block; }`,
    `    <div id="auftrag-buehne" class="buehne">
      <div id="auftrag-kamera" class="kamera" data-layout-allow-overflow>
        <p id="auftrag-marke">Anwenden</p>
        <h2 id="auftrag-titel">${woerter(w.anwenden, 'auftrag-t')}</h2>
        <i id="auftrag-zeiger"></i>
        <ol id="auftrag-schritte">
${schritte}
        </ol>
        <p id="auftrag-schluss">${woerter(hinten.length ? `${vorn},` : vorn, 'auftrag-s')}${hinten.length ? ` <span class="rot">${woerter(hinten.join(', '), 'auftrag-s')}</span>` : ''}</p>
      </div>
      <div id="auftrag-chat">
        <p class="kopf">Hermes <span>Orchestrator</span></p>
        <ul>
${nachrichten}
        </ul>
      </div>
    </div>`,
    `      // Auftritt: Der Kreis öffnet sich von dem roten Wort aus der Einstellung davor
      tl.fromTo("#root", { clipPath: "circle(0% at 41% 77%)" }, { clipPath: "circle(125% at 41% 77%)", duration: ${UEBERGANG}, ease: "power3.inOut" }, 0);
      ${kamera('#auftrag-kamera', Z.dauer, { scale: 1.03, x: 10, y: -6, ursprung: '25% 50%' })}
      tl.fromTo("#auftrag-chat", { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "expo.out" }, ${zahl(UEBERGANG * 0.6)});
      tl.fromTo("#auftrag-chat", { y: 18 }, { y: -18, duration: ${Z.dauer}, ease: "none" }, 0);
      tl.fromTo("#auftrag-marke", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.3);
      const titel = alle("#auftrag-titel .auftrag-t-w");
      ${einfaerben('titel', Z.woerter('auftrag-titel'), FARBE.tief)}
      ${w.schritte
        .map((_, i) => {
          const s = `#auftrag-schritt-${i + 1}`
          const t = anStep(i)
          return `tl.fromTo("${s} .linie", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out" }, ${zahl(t - 0.12)});
      tl.fromTo("${s} .nr, ${s} .t", { opacity: 0, x: -18, filter: "blur(6px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.28, stagger: 0.04, ease: "power4.out" }, ${zahl(t - 0.03)});`
        })
        .join('\n      ')}
      tl.fromTo("#auftrag-zeiger", { y: 0, opacity: 0, scaleY: 0 }, { y: 0, opacity: 1, scaleY: 1, duration: 0.25, ease: "expo.out" }, ${zahl(anStep(0) - 0.05)});
      ${w.schritte.slice(1).map((_, i) => `tl.to("#auftrag-zeiger", { y: ${(i + 1) * 110}, duration: 0.3, ease: "power3.inOut" }, ${zahl(anStep(i + 1) - 0.14)});`).join('\n      ')}
      tl.to("#auftrag-zeiger", { opacity: 0, duration: 0.15, ease: "power2.in" }, ${zahl(schlussZeiten[0] - 0.2)});
      ${w.nachrichten
        .map((n, i) => {
          if (!n) return ''
          const t = anStep(i)
          const raum = Math.max(0.5, endeStep(i) - t + 0.1)
          return `tl.fromTo("#auftrag-n-${i + 1}", { opacity: 0, y: 24, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "expo.out" }, ${zahl(t - 0.05)});
      tl.fromTo(".auftrag-z${i + 1}", { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: ${zahl(raum)} }, ease: "none" }, ${zahl(t)});`
        })
        .join('\n      ')}
      const satz = alle("#auftrag-schluss .auftrag-s-w");
      ${scharf('satz', schlussZeiten)}
      // Abgang: Peitsche nach links, die nächste Einstellung kommt von rechts
      tl.to("#auftrag-buehne", { x: -320, opacity: 0, filter: "blur(10px)", duration: ${UEBERGANG}, ease: "power3.in" }, ${Z.aus});`,
  )
}

/** 3. Wo kiKollege steht: der Zeitstrahl zieht sich wie auf der Seite, die Kamera fährt zurück */
function zeitstrahl(w, plan) {
  const Z = ort(plan, 'zeitstrahl')
  const z = w.zeitstrahl
  const BEGINN = Z.an('zeitstrahl-titel') + 0.1
  const fertigZeile = plan.zeilen['zeitstrahl-fertig'] ? 'zeitstrahl-fertig' : 'zeitstrahl-titel'
  // M1 kommt, wenn sein Name fällt; der Rest der Linie zieht in der Zeit bis zum Ende nach
  const fertig = z.meilensteine.filter((m) => m.art === 'fertig').at(-1)
  const anFertig = Z.an(fertigZeile) + 0.05
  const endeLinie = Math.max(anFertig + 0.8, Z.ende(fertigZeile) - 0.5)
  const wann = (x) => {
    const x0 = fertig?.x ?? 0
    if (x <= x0) return zahl(BEGINN + (x0 ? x / x0 : 0) * (anFertig - BEGINN))
    return zahl(anFertig + ((Math.min(x, TAGE_BREITE) - x0) / (TAGE_BREITE - x0)) * (endeLinie - anFertig))
  }
  const punkte = z.meilensteine
    .map((m, i) => {
      const rechts = m.x > 70 && m.art !== 'offen'
      const titel = m.art === 'kommt' && rechts ? `<em id="zeitstrahl-m-titel">${esc(m.titel)}</em>` : ''
      return `        <div id="zeitstrahl-m${i + 1}" class="zeitstrahl-punkt ${m.art}${rechts ? ' rechts' : ''}" style="left: ${zahl(m.x)}%">
          <i></i>
          <span class="zeitstrahl-text"><b>${esc(m.id)}</b>${m.art !== 'offen' ? `<span>${esc(m.wann)}</span>` : ''}${titel}</span>
        </div>`
    })
    .join('\n')
  const monate = z.monate
    .map((m, i) => `        <span id="zeitstrahl-monat-${i + 1}" class="zeitstrahl-monat" style="left: ${zahl(m.x)}%">${esc(m.name)}</span>`)
    .join('\n')
  const titelMs = z.meilensteine.findIndex((m) => m.art === 'kommt' && m.x > 70)
  return szene(
    'zeitstrahl',
    `    #zeitstrahl-grund { position: absolute; inset: 0; background: ${FARBE.weiss}; }
    #zeitstrahl-buehne { color: ${FARBE.tief}; }
    #zeitstrahl-marke { position: absolute; left: 196px; top: 140px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leise}; }
    #zeitstrahl-titel { position: absolute; left: 188px; top: 190px; margin: 0; font-size: 96px; font-weight: 780; line-height: 1; letter-spacing: -0.045em; }
    .zeitstrahl-w { display: inline-block; }
    #zeitstrahl-flaeche { position: absolute; left: 192px; top: 640px; width: 1536px; height: 3px; }
    #zeitstrahl-linie { position: absolute; left: 0; top: 0; width: ${TAGE_BREITE}%; height: 3px; background: ${FARBE.tief}; transform-origin: left center; }
    #zeitstrahl-vergangen { position: absolute; left: 0; top: -3px; width: ${zahl(z.stand)}%; height: 9px; border-radius: 5px; background: ${FARBE.rot}; transform-origin: left center; }
    #zeitstrahl-ohne { position: absolute; left: ${TAGE_BREITE}%; right: 0; top: 0; border-top: 3px dashed #8A7E7E; }
    #zeitstrahl-ohne span { position: absolute; left: 0; right: 0; top: 92px; text-align: center; font-size: 28px; color: ${FARBE.leise}; white-space: nowrap; }
    .zeitstrahl-monat { position: absolute; z-index: 2; top: 22px; height: 46px; padding: 6px 12px 0 10px; border-left: 2px solid rgba(20, 11, 11, 0.16); background: ${FARBE.weiss}; font-size: 28px; color: ${FARBE.leise}; white-space: nowrap; }
    .zeitstrahl-punkt { position: absolute; top: 1px; width: 0; height: 0; }
    .zeitstrahl-punkt i { position: absolute; left: -15px; top: -15px; width: 30px; height: 30px; border-radius: 50%; background: ${FARBE.weiss}; border: 3px solid ${FARBE.tief}; box-sizing: border-box; }
    .zeitstrahl-punkt.fertig i { background: ${FARBE.rot}; border-color: ${FARBE.rot}; }
    .zeitstrahl-punkt.kommt i { border-color: ${FARBE.tief}; box-shadow: 0 0 0 10px rgba(20, 11, 11, 0.1); }
    .zeitstrahl-punkt.offen i { border-style: dashed; border-color: #8A7E7E; }
    .zeitstrahl-text { position: absolute; left: -300px; width: 600px; bottom: 34px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; white-space: nowrap; }
    .zeitstrahl-punkt.rechts .zeitstrahl-text { left: auto; right: -24px; align-items: flex-end; text-align: right; }
    .zeitstrahl-text b { font-size: 72px; font-weight: 800; line-height: 1; letter-spacing: -0.045em; }
    .zeitstrahl-punkt.offen .zeitstrahl-text { bottom: auto; top: 30px; }
    .zeitstrahl-punkt.offen .zeitstrahl-text b { font-size: 44px; color: #8A7E7E; }
    .zeitstrahl-text span { font-size: 30px; color: ${FARBE.leise}; }
    .zeitstrahl-punkt.kommt .zeitstrahl-text span { color: ${FARBE.tief}; font-weight: 650; }
    #zeitstrahl-m-titel { order: -1; font-style: normal; font-size: 30px; font-weight: 650; color: ${FARBE.tief}; }
    #zeitstrahl-stand { position: absolute; top: 0; left: ${zahl(z.stand)}%; width: 0; height: 0; }
    #zeitstrahl-stand i { position: absolute; left: -2px; top: -40px; width: 4px; height: 190px; border-radius: 2px; background: ${FARBE.tief}; transform-origin: center top; }
    #zeitstrahl-stand span { position: absolute; left: -250px; width: 500px; top: 162px; text-align: center; font-size: 30px; font-weight: 700; color: ${FARBE.tief}; white-space: nowrap; }`,
    `    <div id="zeitstrahl-grund"></div>
    <div id="zeitstrahl-buehne" class="buehne">
      <p id="zeitstrahl-marke">Überblick</p>
      <h2 id="zeitstrahl-titel">${woerter(w.ueberblick, 'zeitstrahl')}</h2>
      <div id="zeitstrahl-kamera" class="kamera" data-layout-allow-overflow>
        <div id="zeitstrahl-flaeche" data-layout-allow-overflow>
          <span id="zeitstrahl-linie"></span>
          <span id="zeitstrahl-vergangen"></span>
          <span id="zeitstrahl-ohne"><span>Termin offen</span></span>
${monate}
          <div id="zeitstrahl-stand"><i></i><span>Stand der Daten ${esc(z.standText)}</span></div>
${punkte}
        </div>
      </div>
    </div>`,
    `      // Auftritt: von rechts, wie die Peitsche der Einstellung davor es verlangt. Der
      // weiße Grund kommt erst dazu, wenn die Einstellung davor aus dem Bild ist.
      tl.fromTo("#zeitstrahl-grund", { opacity: 0 }, { opacity: 1, duration: 0.05, ease: "none" }, ${zahl(UEBERGANG - 0.06)});
      tl.fromTo("#zeitstrahl-buehne", { x: 420, opacity: 0, filter: "blur(10px)" }, { x: 0, opacity: 1, filter: "blur(0px)", duration: ${UEBERGANG}, ease: "power3.out" }, ${zahl(UEBERGANG * 0.3)});
      // Die Kamera steht nah am Anfang der Linie und fährt zurück, bis alles im Bild ist
      tl.fromTo("#zeitstrahl-kamera", { scale: 1.28, x: 60, transformOrigin: "30% 59%" }, { scale: 1, x: 0, transformOrigin: "30% 59%", duration: ${zahl(endeLinie + 0.2)}, ease: "sine.inOut" }, 0);
      tl.fromTo("#zeitstrahl-marke", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.1);
      const titel = alle("#zeitstrahl-titel .zeitstrahl-w");
      ${einfaerben('titel', Z.woerter('zeitstrahl-titel'), FARBE.tief)}
      tl.fromTo("#zeitstrahl-linie", { scaleX: 0 }, { scaleX: 1, duration: ${zahl(endeLinie - BEGINN)}, ease: "none" }, ${zahl(BEGINN)});
      ${z.monate.map((m, i) => `tl.fromTo("#zeitstrahl-monat-${i + 1}", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, ${wann(m.x)});`).join('\n      ')}
      tl.fromTo("#zeitstrahl-vergangen", { scaleX: 0 }, { scaleX: 1, duration: ${zahl(wann(z.stand) - BEGINN)}, ease: "none" }, ${zahl(BEGINN)});
      tl.fromTo("#zeitstrahl-stand i", { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: "expo.out" }, ${zahl(wann(z.stand))});
      tl.fromTo("#zeitstrahl-stand span", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, ${zahl(wann(z.stand) + 0.12)});
      tl.fromTo("#zeitstrahl-ohne", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${zahl(endeLinie)});
      ${z.meilensteine
        .map((m, i) => {
          const t = m.art === 'offen' ? zahl(endeLinie + 0.08 + i * 0.08) : wann(m.x)
          return `tl.fromTo("#zeitstrahl-m${i + 1} i", { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(2)" }, ${t});
      tl.fromTo("#zeitstrahl-m${i + 1} .zeitstrahl-text b, #zeitstrahl-m${i + 1} .zeitstrahl-text > span", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, stagger: 0.07, ease: "power4.out" }, ${zahl(t + 0.08)});`
        })
        .join('\n      ')}
      ${titelMs >= 0 ? `tl.fromTo("#zeitstrahl-m-titel", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, ${zahl(wann(TAGE_BREITE) + 0.12)});` : ''}`,
  )
}

/** 4. Prüfstand: die Zahl, und je Prüffall ein Kästchen, das sich füllt */
function pruefstand(w, plan) {
  const Z = ort(plan, 'pruefstand')
  const p = w.pruefstand
  const kaestchen = Array.from({ length: p.faelle }, (_, i) => `        <i id="pruefstand-k${i + 1}"${i < p.gelernt ? ' class="gelernt"' : ''}></i>`).join('\n')
  const zid = 'pruefstand-zahl'
  const wortIndex = woerterVonZeile(w, zid)
  const anZahl = Z.wort(zid, wortIndex.indexOf(String(p.gelernt)))
  const anVon = Z.wort(zid, wortIndex.indexOf('von'))
  const anFaelle = Z.wort(zid, wortIndex.findIndex((x) => x.startsWith('Prüffällen')))
  const fuellen = zahl(Math.max(0.45, anVon - anZahl + 0.25))
  return szene(
    'pruefstand',
    `    #pruefstand-buehne { background: ${FARBE.tief}; color: ${FARBE.weiss}; }
    #pruefstand-marke { position: absolute; left: 196px; top: 160px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leiseHell}; }
    #pruefstand-zahl { position: absolute; left: 176px; top: 210px; margin: 0; font-size: 300px; font-weight: 800; line-height: 1; letter-spacing: -0.06em; color: ${FARBE.rot}; font-variant-numeric: tabular-nums; }
    #pruefstand-zahl small { display: inline-block; margin-left: 28px; font-size: 96px; font-weight: 700; letter-spacing: -0.03em; color: ${FARBE.weiss}; }
    #pruefstand-n { display: inline-block; }
    #pruefstand-kaestchen { position: absolute; left: 192px; top: 580px; display: flex; gap: 14px; }
    #pruefstand-kaestchen i { width: 64px; height: 64px; border-radius: 12px; border: 3px solid rgba(255, 255, 255, 0.28); box-sizing: border-box; }
    #pruefstand-kaestchen i.gelernt { background: ${FARBE.weiss}; border-color: ${FARBE.weiss}; }
    #pruefstand-satz { position: absolute; left: 192px; top: 720px; width: 1500px; margin: 0; font-size: 54px; font-weight: 720; line-height: 1.15; letter-spacing: -0.03em; }
    #pruefstand-quelle { position: absolute; left: 192px; top: 900px; margin: 0; font-size: 28px; color: ${FARBE.leiseHell}; }`,
    `    <div id="pruefstand-buehne" class="buehne">
      <div id="pruefstand-kamera" class="kamera" data-layout-allow-overflow>
        <p id="pruefstand-marke">Prüfstand des Orchestrators</p>
        <p id="pruefstand-zahl"><span id="pruefstand-n">0</span><small id="pruefstand-von"> von ${p.faelle}</small></p>
        <div id="pruefstand-kaestchen">
${kaestchen}
        </div>
        <p id="pruefstand-satz">Prüffälle gelernt.${p.ziel ? ` Alle ${p.faelle} sollen es bis ${esc(p.ziel)} sein.` : ''}</p>
        <p id="pruefstand-quelle">Letzter Lauf: ${esc(p.lauf)}</p>
      </div>
    </div>`,
    `      // Auftritt: Die dunkle Fläche öffnet sich aus der Linie des Zeitstrahls
      tl.fromTo("#pruefstand-buehne", { clipPath: "inset(59.2% 0% 40.5% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ${UEBERGANG}, ease: "power3.inOut" }, 0);
      ${kamera('#pruefstand-kamera', Z.dauer, { scale: 1.05, x: -14, y: -10, ursprung: '18% 40%' })}
      tl.fromTo("#pruefstand-marke", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.3);
      tl.fromTo("#pruefstand-kaestchen i", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.016, ease: "expo.out" }, 0.3);
      tl.fromTo("#pruefstand-n", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3, ease: "power4.out" }, ${zahl(anZahl - 0.05)});
      const n = { v: 0 };
      const ziffer = document.querySelector("#pruefstand-n");
      tl.fromTo(n, { v: 0 }, { v: ${p.gelernt}, duration: ${fuellen}, ease: "power2.out", onUpdate: () => { ziffer.textContent = String(Math.round(n.v)); } }, ${zahl(anZahl - 0.05)});
      tl.fromTo("#pruefstand-kaestchen i.gelernt", { backgroundColor: "rgba(255, 255, 255, 0)", borderColor: "rgba(255, 255, 255, 0.28)" }, { backgroundColor: "${FARBE.weiss}", borderColor: "${FARBE.weiss}", duration: 0.12, stagger: ${zahl(fuellen / Math.max(1, p.gelernt))}, ease: "none" }, ${zahl(anZahl - 0.05)});
      tl.fromTo("#pruefstand-von", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "expo.out" }, ${zahl(anVon)});
      tl.fromTo("#pruefstand-satz", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, ${zahl(anFaelle - 0.25)});
      tl.fromTo("#pruefstand-quelle", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${zahl(anFaelle)});
      // Abgang: Das Bild tritt zurück, die Karte der nächsten Einstellung schiebt sich davor
      tl.to("#pruefstand-buehne", { scale: 0.93, opacity: 0.25, filter: "blur(6px)", duration: ${UEBERGANG}, ease: "power2.in" }, ${Z.aus});`,
  )
}

/** Die Wörter einer gesprochenen Zeile nach ihrer Kennung */
const woerterVonZeile = (w, id) => woerterVon(w.stimme.find((z) => z.id === id))

/** 5. Die größte Herausforderung: die Karte des Risikos kommt herein */
function risiko(w, plan) {
  const Z = ort(plan, 'risiko')
  const r = w.risiko
  const zid = 'risiko-titel'
  const alleWoerter = woerterVonZeile(w, zid)
  const start = alleWoerter.findIndex((x) => x.endsWith(':')) + 1
  const titelZeiten = Z.woerter(zid).slice(start)
  return szene(
    'risiko',
    `    #root { background: transparent; }
    #risiko-buehne { color: ${FARBE.weiss}; }
    #risiko-grund { position: absolute; inset: 0; background: ${FARBE.tief}; }
${maskenStil('risiko')}
    #risiko-marke { position: absolute; left: 196px; top: 160px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leiseHell}; }
    #risiko-karte { position: absolute; left: 192px; top: 240px; width: 1536px; padding: 64px 72px 72px; border-radius: 40px; background: ${FARBE.weich}; border: 1px solid rgba(255, 255, 255, 0.12); box-sizing: border-box; box-shadow: 0 70px 140px -70px rgba(0, 0, 0, 0.9); }
    #risiko-kopf { display: flex; align-items: center; gap: 28px; margin: 0 0 40px; font-size: 30px; color: ${FARBE.leiseHell}; }
    #risiko-abzeichen { padding: 10px 24px; border-radius: 999px; background: ${FARBE.rot}; color: ${FARBE.weiss}; font-weight: 700; }
    #risiko-titel { margin: 0; max-width: 1300px; font-size: 92px; font-weight: 780; line-height: 1.04; letter-spacing: -0.045em; }
    #risiko-satz { position: absolute; left: 196px; top: 860px; margin: 0; font-size: 36px; color: ${FARBE.leiseHell}; }`,
    `    <div id="risiko-grund"></div>
    <div id="risiko-buehne" class="buehne">
      <p id="risiko-marke">Die größte Herausforderung</p>
      <div id="risiko-karte">
        <p id="risiko-kopf">${r.eingetreten ? '<span id="risiko-abzeichen">schon eingetreten</span>' : ''}<span id="risiko-nr">${esc(r.nr)} im Risikoregister, Stufe ${esc(r.stufe)}</span></p>
        <h2 id="risiko-titel">${maskiert(r.titel, 'risiko')}</h2>
      </div>
      ${r.von > 1 ? `<p id="risiko-satz">Eines von ${r.von} hohen Risiken, die schon eingetreten sind.</p>` : ''}
    </div>`,
    `      // Auftritt: Der Grund blendet über, die Karte schiebt sich schräg ins Bild
      tl.fromTo("#risiko-grund", { opacity: 0 }, { opacity: 1, duration: ${UEBERGANG}, ease: "power2.inOut" }, 0);
      tl.fromTo("#risiko-marke", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: "expo.out" }, ${zahl(Z.an(zid) - 0.05)});
      tl.fromTo("#risiko-karte", { opacity: 0, y: 620, rotation: 3.5 }, { opacity: 1, y: 0, rotation: 0, duration: 0.85, ease: "expo.out" }, 0.05);
      // Danach driftet sie langsam, damit das Bild nie steht
      tl.fromTo("#risiko-buehne", { scale: 1, y: 8, transformOrigin: "50% 45%" }, { scale: 1.04, y: -8, transformOrigin: "50% 45%", duration: ${Z.dauer}, ease: "none" }, 0);
      ${r.eingetreten ? `tl.fromTo("#risiko-abzeichen", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, ${zahl(Z.wort(zid, Math.max(1, start - 1)))});` : ''}
      tl.fromTo("#risiko-nr", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${zahl(Z.wort(zid, Math.max(1, start - 1)) + 0.2)});
      const titel = alle("#risiko-titel .risiko-w");
      ${steigen('titel', titelZeiten)}
      ${r.von > 1 ? `tl.fromTo("#risiko-satz", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, ${zahl(titelZeiten[0] + 0.3)});` : ''}`,
  )
}

/** 6. Schluss: ab wann du beauftragen kannst, mit Adresse und Stand */
function schluss(w, plan) {
  const Z = ort(plan, 'schluss')
  const teamSatz = woerterVonZeile(w, 'schluss-team').join(' ')
  // Der Termin ist das eine Rote im Schlussbild
  const teile = teamSatz.match(/^(.*?)((?:frühestens )?am \d\d\.\d\d\.)(.*)$/)
  const satz = teile
    ? `${woerter(teile[1].trim(), 'schluss')} <span class="rot">${woerter(teile[2], 'schluss')}</span> ${woerter(teile[3].trim(), 'schluss')}`
    : woerter(teamSatz, 'schluss')
  const beauftragen = woerterVonZeile(w, 'schluss-beauftragen').join(' ')
  return szene(
    'schluss',
    `    #schluss-buehne { background: ${FARBE.weiss}; color: ${FARBE.tief}; }
    #schluss-satz { position: absolute; left: 188px; top: 220px; width: 1540px; margin: 0; font-size: 104px; font-weight: 790; line-height: 1.04; letter-spacing: -0.05em; }
    #schluss-satz .rot { color: ${FARBE.rot}; }
    .schluss-w { display: inline-block; }
    #schluss-ab { position: absolute; left: 192px; top: 590px; width: 1540px; margin: 0; font-size: 64px; font-weight: 720; line-height: 1.1; letter-spacing: -0.035em; color: ${FARBE.tief}; }
    #schluss-fuss { position: absolute; left: 192px; top: 800px; margin: 0; font-size: 34px; font-weight: 700; line-height: 1.5; }
    #schluss-fuss span { display: block; font-size: 30px; font-weight: 500; color: ${FARBE.leise}; }`,
    `    <div id="schluss-buehne" class="buehne">
      <div id="schluss-kamera" class="kamera" data-layout-allow-overflow>
        <p id="schluss-satz">${satz}</p>
        <p id="schluss-ab">${woerter(beauftragen, 'schluss-b')}</p>
        <p id="schluss-fuss">${esc(w.name)} · ${esc(w.dach)}<span>wamocon.github.io/kiKollege · Stand der Daten ${esc(datum(w.stand))}</span></p>
      </div>
    </div>`,
    `      // Auftritt: von links nach rechts aufgezogen, die Karte davor bleibt stehen
      tl.fromTo("#schluss-buehne", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ${UEBERGANG}, ease: "power3.inOut" }, 0);
      // Die Kamera kommt beim letzten Wort zur Ruhe, das Schlussbild steht still
      tl.fromTo("#schluss-kamera", { scale: 1.035, y: 10, transformOrigin: "25% 40%" }, { scale: 1, y: 0, transformOrigin: "25% 40%", duration: ${zahl(Z.ende('schluss-beauftragen'))}, ease: "sine.out" }, 0);
      const satz = alle("#schluss-satz .schluss-w");
      ${scharf('satz', Z.woerter('schluss-team'))}
      const ab = alle("#schluss-ab .schluss-b-w");
      ${scharf('ab', Z.woerter('schluss-beauftragen'))}
      tl.fromTo("#schluss-fuss", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out" }, ${zahl(Z.an('schluss-beauftragen') + 0.3)});`,
  )
}

const BAUER = { vorhang, auftrag, zeitstrahl, pruefstand, risiko, schluss }

/** Die Wurzel: hält nur die Einstellungen und die Tonspur */
function wurzel(w, plan) {
  const hosts = REIHE.map(
    (s, i) => `      <div
        id="${s.id}"
        class="clip"
        data-composition-id="${s.id}"
        data-composition-src="compositions/${s.id}.html"
        data-start="${plan.szenen[s.id].start}"
        data-duration="${plan.szenen[s.id].dauer}"
        data-track-index="${i % 2}"
        data-track-kind="graphics"
        data-width="${BREITE}"
        data-height="${HOEHE}"
        style="z-index: ${i + 1}"
      ></div>`,
  ).join('\n')
  return `<!doctype html>
<!-- Erzeugt von scripts/film-daten.mjs aus data/projektstand.json, Stand ${w.stand}. Nicht von Hand ändern. -->
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${BREITE}, height=${HOEHE}" />
    <title>${esc(w.name)} in ${SOLL} Sekunden</title>
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
      <audio id="stimme" src="assets/stimme.wav" data-start="0" data-duration="${plan.dauer}" data-track-index="2" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`
}

/** Alle Dateien des Projekts als { pfad: inhalt } */
export function kompositionen(werte, plan) {
  const dateien = { 'index.html': wurzel(werte, plan) }
  for (const s of REIHE) dateien[`compositions/${s.id}.html`] = BAUER[s.id](werte, plan)
  return dateien
}
