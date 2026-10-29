/**
 * Der Film „kiKollege in 30 Sekunden“ aus den Daten der Seite.
 *
 * Seit dem 29.10.2026 steht im Labor ein kurzer Film, gebaut mit HyperFrames
 * (HTML mit GSAP, Bild für Bild zu MP4 gerendert). Er zeigt dasselbe wie die
 * Szene Überblick und nimmt jede Zahl und jeden Satz aus data/projektstand.json.
 * Dieses Modul liest die Werte aus, bildet daraus einen Fingerabdruck und
 * schreibt die Kompositionen. Gerendert wird mit scripts/baue-film.mjs;
 * scripts/pruefe-film.mjs meldet, wenn sich die Daten seitdem geändert haben.
 *
 * Bewegungen aus dem Labor sind übernommen (Vorhang, Wörter aus der Maske,
 * der Zeitstrahl, der sich zieht); was nicht übertragbar war, steht in
 * film/UEBERTRAGUNG.md.
 */

import { createHash } from 'node:crypto'

export const BREITE = 1920
export const HOEHE = 1080
export const DAUER = 30

/** Die sechs Einstellungen, in Sekunden. Jede hat eine Komposition. */
export const SZENEN = [
  { id: 'vorhang', start: 0, dauer: 4.6 },
  { id: 'auftrag', start: 4.6, dauer: 5.8 },
  { id: 'zeitstrahl', start: 10.4, dauer: 6 },
  { id: 'pruefstand', start: 16.4, dauer: 5.2 },
  { id: 'risiko', start: 21.6, dauer: 4.6 },
  { id: 'schluss', start: 26.2, dauer: 3.8 },
]
/** Wann eine Einstellung abblendet: kurz vor ihrem Ende */
const aus = (id) => zahl(SZENEN.find((s) => s.id === id).dauer - 0.25)

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
 *  Gleich wie im Zeitstrahl der Seite (app/labor/page.tsx). */
const TAGE_BREITE = 80

/** Alles, was der Film zeigt, als schlichte Werte. Ändert sich einer, ist der
 *  Film veraltet. */
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

  return {
    stand: d.stand,
    name: p.name,
    dach: p.dach,
    entscheidet: anfang(p.lead.split(/(?<=[.!?])\s+/).at(-1)),
    anwenden: szene('anwenden').titel,
    ueberblick: szene('ueberblick').titel,
    schritte: d.anleitung.schritte.map((s) => s.titel),
    nachrichten,
    zeitstrahl: { stand: x(d.stand), standText: kurz(d.stand), meilensteine, monate },
    pruefstand: { gelernt: letzter.gelernt, faelle, ziel: ziel ? kurz(ziel) : null, lauf: letzter.wann },
    risiko: { nr: risiko.nr, titel: risiko.titel, stufe: risiko.stufe, eingetreten: !!risiko.eingetreten, von: eingetreten.length },
    team: team && !team.terminOffen ? { nr: team.id.slice(1), wann: terminText(team, false) } : null,
  }
}

/** Kurzer Fingerabdruck der Werte, damit eine Prüfung merkt, wenn der Film
 *  nicht mehr zu den Daten passt. */
export function fingerabdruck(werte) {
  return createHash('sha256').update(JSON.stringify(werte)).digest('hex').slice(0, 16)
}

// ---------------------------------------------------------------------------
// Kompositionen
// ---------------------------------------------------------------------------

const FARBE = {
  weiss: '#FFFFFF',
  tief: '#140B0B',
  weich: '#241414',
  rot: '#F40E0E',
  rotTief: '#B80B0B',
  leise: '#6B5F5F',
  leiseHell: 'rgba(255, 255, 255, 0.7)',
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
function zahl(n) { return Number(n.toFixed(3)) }

/** Wörter in Masken, damit sie von unten hereinkommen können wie im Labor */
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
${stil}
  </style>
  <div id="root" data-composition-id="${id}" data-width="${BREITE}" data-height="${HOEHE}">
${inhalt}
  </div>
  <script>
    (() => {
      const tl = gsap.timeline({ paused: true });
${skript}
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`
}

/** 1. Vorhang und Kernsatz: rote Türen öffnen sich, wie beim Laden des Labors */
function vorhang(w) {
  return szene(
    'vorhang',
    `    #root { background: ${FARBE.tief}; color: ${FARBE.weiss}; }
    .vorhang-maske { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.14em; margin-bottom: -0.14em; }
    .vorhang-w { display: inline-block; }
    #vorhang-dach { position: absolute; left: 196px; top: 230px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leiseHell}; }
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
    `    <div id="vorhang-inhalt">
      <p id="vorhang-dach">${esc(w.dach)}</p>
      <h1 id="vorhang-marke">${maskiert(w.name, 'vorhang')}</h1>
      <p id="vorhang-kern">
        <span class="zeile">${maskiert('Ein KI-Mitarbeiter arbeitet zu.', 'vorhang')}</span>
        <span class="zeile">${maskiert('Ein Mensch', 'vorhang')} <span class="rot">${maskiert('entscheidet.', 'vorhang')}</span></span>
      </p>
    </div>
    <div id="vorhang-vorhang" data-layout-allow-overflow data-layout-allow-occlusion>
      <div class="vorhang-tuer oben"></div>
      <div class="vorhang-tuer unten"></div>
      <p id="vorhang-wort" data-layout-allow-overlap><span>${esc(w.name)}</span></p>
    </div>`,
    `      tl.fromTo("#vorhang-wort span", { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: "power3.out" }, 0.15);
      tl.fromTo("#vorhang-wort span", { opacity: 1 }, { opacity: 0, duration: 0.15, ease: "power1.in" }, 0.8);
      tl.fromTo("#vorhang-vorhang .oben", { yPercent: 0 }, { yPercent: -100, duration: 0.5, ease: "power4.inOut" }, 0.85);
      tl.fromTo("#vorhang-vorhang .unten", { yPercent: 0 }, { yPercent: 100, duration: 0.5, ease: "power4.inOut" }, 0.85);
      tl.fromTo("#vorhang-marke .vorhang-w", { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "power4.out" }, 1.05);
      tl.fromTo("#vorhang-dach", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 1.25);
      tl.fromTo("#vorhang-kern .vorhang-w", { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.07, ease: "power4.out" }, 1.35);
      tl.fromTo("#vorhang-inhalt", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, ${aus('vorhang')});`,
  )
}

/** 2. So gibst du einen Auftrag: drei Schritte, daneben der Chat */
function auftrag(w) {
  const schritte = w.schritte
    .map((t, i) => `        <li id="auftrag-schritt-${i + 1}"><span class="nr">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(t)}</span></li>`)
    .join('\n')
  const nachrichten = w.nachrichten
    .map((n, i) => (n ? `          <li id="auftrag-n-${i + 1}" class="auftrag-n${n.du ? ' du' : ''}">${esc(n.text)}</li>` : ''))
    .join('\n')
  const [vorn, ...hinten] = w.entscheidet.split(/,\s*/)
  return szene(
    'auftrag',
    `    #root { background: ${FARBE.weiss}; color: ${FARBE.tief}; }
    #auftrag-flut { position: absolute; inset: 0; background: ${FARBE.tief}; }
    #auftrag-inhalt { position: absolute; inset: 0; }
    #auftrag-marke { position: absolute; left: 196px; top: 140px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leise}; }
    #auftrag-titel { position: absolute; left: 188px; top: 190px; margin: 0; font-size: 96px; font-weight: 780; line-height: 1; letter-spacing: -0.045em; }
    #auftrag-schritte { position: absolute; left: 192px; top: 360px; width: 780px; margin: 0; padding: 0; list-style: none; }
    #auftrag-schritte li { display: flex; gap: 28px; align-items: baseline; padding: 24px 0; border-top: 2px solid rgba(20, 11, 11, 0.14); }
    #auftrag-schritte .nr { font-size: 30px; font-weight: 700; color: ${FARBE.leise}; font-variant-numeric: tabular-nums; }
    #auftrag-schritte .t { font-size: 50px; font-weight: 740; letter-spacing: -0.035em; }
    #auftrag-chat { position: absolute; left: 1000px; top: 330px; width: 728px; padding: 28px; border-radius: 36px; background: ${FARBE.tief}; color: ${FARBE.weiss}; box-shadow: 0 60px 120px -60px rgba(20, 11, 11, 0.7); }
    #auftrag-chat .kopf { display: flex; gap: 16px; align-items: baseline; margin: 0; padding: 4px 8px 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); font-size: 32px; font-weight: 700; }
    #auftrag-chat .kopf span { font-size: 28px; font-weight: 500; color: ${FARBE.leiseHell}; }
    #auftrag-chat ul { list-style: none; margin: 0; padding: 24px 0 4px; display: flex; flex-direction: column; gap: 18px; }
    .auftrag-n { max-width: 88%; padding: 18px 24px; border-radius: 26px 26px 26px 8px; background: rgba(255, 255, 255, 0.1); font-size: 28px; line-height: 1.4; }
    .auftrag-n.du { align-self: flex-end; border-radius: 26px 26px 8px 26px; background: ${FARBE.rotTief}; }
    #auftrag-schluss { position: absolute; left: 192px; top: 790px; width: 760px; margin: 0; font-size: 64px; font-weight: 760; line-height: 1.08; letter-spacing: -0.035em; }
    #auftrag-schluss .rot { color: ${FARBE.rot}; }`,
    `    <div id="auftrag-flut"></div>
    <div id="auftrag-inhalt">
      <p id="auftrag-marke">Anwenden</p>
      <h2 id="auftrag-titel">${esc(w.anwenden)}</h2>
      <ol id="auftrag-schritte">
${schritte}
      </ol>
      <div id="auftrag-chat">
        <p class="kopf">Hermes <span>Orchestrator</span></p>
        <ul>
${nachrichten}
        </ul>
      </div>
      <p id="auftrag-schluss">${esc(vorn)}${hinten.length ? `, <span class="rot">${esc(hinten.join(', '))}</span>` : ''}</p>
    </div>`,
    `      tl.fromTo("#auftrag-flut", { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "power2.inOut" }, 0);
      tl.fromTo("#auftrag-marke", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.3);
      tl.fromTo("#auftrag-titel", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, 0.35);
      tl.fromTo("#auftrag-chat", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" }, 0.55);
      ${w.schritte.map((_, i) => `tl.fromTo("#auftrag-schritt-${i + 1}", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, ${zahl(0.9 + i * 0.6)});`).join('\n      ')}
      ${w.nachrichten.map((n, i) => (n ? `tl.fromTo("#auftrag-n-${i + 1}", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, ${zahl(1.0 + i * 0.6)});` : '')).join('\n      ')}
      tl.fromTo("#auftrag-schluss", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, 3.0);
      tl.fromTo("#auftrag-inhalt", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, ${aus('auftrag')});`,
  )
}

/** 3. Wo kiKollege steht: der Zeitstrahl zieht sich wie auf der Seite */
function zeitstrahl(w) {
  const z = w.zeitstrahl
  const LINIE = 1.8
  const BEGINN = 0.6
  const wann = (x) => zahl(BEGINN + (Math.min(x, TAGE_BREITE) / TAGE_BREITE) * LINIE)
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
    `    #root { background: ${FARBE.weiss}; color: ${FARBE.tief}; }
    #zeitstrahl-inhalt { position: absolute; inset: 0; }
    #zeitstrahl-marke { position: absolute; left: 196px; top: 140px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leise}; }
    #zeitstrahl-titel { position: absolute; left: 188px; top: 190px; margin: 0; font-size: 96px; font-weight: 780; line-height: 1; letter-spacing: -0.045em; }
    #zeitstrahl-flaeche { position: absolute; left: 192px; top: 640px; width: 1536px; height: 3px; }
    #zeitstrahl-linie { position: absolute; left: 0; top: 0; width: ${TAGE_BREITE}%; height: 3px; background: ${FARBE.tief}; transform-origin: left center; }
    #zeitstrahl-vergangen { position: absolute; left: 0; top: -3px; width: ${zahl(z.stand)}%; height: 9px; border-radius: 5px; background: ${FARBE.rot}; transform-origin: left center; }
    #zeitstrahl-ohne { position: absolute; left: ${TAGE_BREITE}%; right: 0; top: 0; border-top: 3px dashed #8A7E7E; }
    #zeitstrahl-ohne span { position: absolute; left: 0; right: 0; top: 92px; text-align: center; font-size: 28px; color: ${FARBE.leise}; white-space: nowrap; }
    .zeitstrahl-monat { position: absolute; top: 22px; height: 46px; padding: 6px 0 0 10px; border-left: 2px solid rgba(20, 11, 11, 0.16); font-size: 28px; color: ${FARBE.leise}; white-space: nowrap; }
    .zeitstrahl-punkt { position: absolute; top: 1px; width: 0; height: 0; }
    .zeitstrahl-punkt i { position: absolute; left: -15px; top: -15px; width: 30px; height: 30px; border-radius: 50%; background: ${FARBE.weiss}; border: 3px solid ${FARBE.tief}; box-sizing: border-box; }
    .zeitstrahl-punkt.fertig i { background: ${FARBE.rot}; border-color: ${FARBE.rot}; }
    .zeitstrahl-punkt.kommt i { border-color: ${FARBE.rot}; box-shadow: 0 0 0 10px rgba(244, 14, 14, 0.16); }
    .zeitstrahl-punkt.offen i { border-style: dashed; border-color: #8A7E7E; }
    .zeitstrahl-text { position: absolute; left: -300px; width: 600px; bottom: 34px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; white-space: nowrap; }
    .zeitstrahl-punkt.rechts .zeitstrahl-text { left: auto; right: -24px; align-items: flex-end; text-align: right; }
    .zeitstrahl-text b { font-size: 72px; font-weight: 800; line-height: 1; letter-spacing: -0.045em; }
    .zeitstrahl-punkt.offen .zeitstrahl-text { bottom: auto; top: 30px; }
    .zeitstrahl-punkt.offen .zeitstrahl-text b { font-size: 44px; color: #8A7E7E; }
    .zeitstrahl-text span { font-size: 30px; color: ${FARBE.leise}; }
    .zeitstrahl-punkt.kommt .zeitstrahl-text span { color: ${FARBE.rotTief}; font-weight: 650; }
    #zeitstrahl-m-titel { order: -1; font-style: normal; font-size: 30px; font-weight: 650; color: ${FARBE.tief}; }
    #zeitstrahl-stand { position: absolute; top: 0; left: ${zahl(z.stand)}%; width: 0; height: 0; }
    #zeitstrahl-stand i { position: absolute; left: -2px; top: -40px; width: 4px; height: 190px; border-radius: 2px; background: ${FARBE.rot}; transform-origin: center top; }
    #zeitstrahl-stand span { position: absolute; left: -250px; width: 500px; top: 162px; text-align: center; font-size: 30px; font-weight: 700; color: ${FARBE.rotTief}; white-space: nowrap; }`,
    `    <div id="zeitstrahl-inhalt">
      <p id="zeitstrahl-marke">Überblick</p>
      <h2 id="zeitstrahl-titel">${woerter(w.ueberblick, 'zeitstrahl')}</h2>
      <div id="zeitstrahl-flaeche" data-layout-allow-overflow>
        <span id="zeitstrahl-linie"></span>
        <span id="zeitstrahl-vergangen"></span>
        <span id="zeitstrahl-ohne"><span>Termin offen</span></span>
${monate}
        <div id="zeitstrahl-stand"><i></i><span>Stand der Daten ${esc(z.standText)}</span></div>
${punkte}
      </div>
    </div>`,
    `      tl.fromTo("#zeitstrahl-marke", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.1);
      tl.fromTo("#zeitstrahl-titel .zeitstrahl-w", { color: "#DCD4D4" }, { color: "${FARBE.tief}", duration: 0.12, stagger: 0.09, ease: "none" }, 0.15);
      tl.fromTo("#zeitstrahl-linie", { scaleX: 0 }, { scaleX: 1, duration: ${LINIE}, ease: "none" }, ${BEGINN});
      ${z.monate.map((m, i) => `tl.fromTo("#zeitstrahl-monat-${i + 1}", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, ${wann(m.x)});`).join('\n      ')}
      tl.fromTo("#zeitstrahl-vergangen", { scaleX: 0 }, { scaleX: 1, duration: ${zahl((z.stand / TAGE_BREITE) * LINIE)}, ease: "none" }, ${BEGINN});
      tl.fromTo("#zeitstrahl-stand i", { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: "expo.out" }, ${zahl(wann(z.stand) + 0.05)});
      tl.fromTo("#zeitstrahl-stand span", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, ${zahl(wann(z.stand) + 0.2)});
      tl.fromTo("#zeitstrahl-ohne", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${zahl(BEGINN + LINIE)});
      ${z.meilensteine
        .map((m, i) => {
          const t = m.art === 'offen' ? zahl(BEGINN + LINIE + 0.25 + i * 0.12) : wann(m.x)
          return `tl.fromTo("#zeitstrahl-m${i + 1} i", { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(2)" }, ${t});
      tl.fromTo("#zeitstrahl-m${i + 1} .zeitstrahl-text b, #zeitstrahl-m${i + 1} .zeitstrahl-text > span", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, stagger: 0.07, ease: "power4.out" }, ${zahl(t + 0.1)});`
        })
        .join('\n      ')}
      ${titelMs >= 0 ? `tl.fromTo("#zeitstrahl-m-titel", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, 3.6);` : ''}
      tl.fromTo("#zeitstrahl-inhalt", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, ${aus('zeitstrahl')});`,
  )
}

/** 4. Prüfstand: die Zahl, und je Prüffall ein Kästchen, das sich füllt */
function pruefstand(w) {
  const p = w.pruefstand
  const kaestchen = Array.from({ length: p.faelle }, (_, i) => `        <i id="pruefstand-k${i + 1}"${i < p.gelernt ? ' class="gelernt"' : ''}></i>`).join('\n')
  const fuellen = 1.2
  return szene(
    'pruefstand',
    `    #root { background: ${FARBE.tief}; color: ${FARBE.weiss}; }
    #pruefstand-flut { position: absolute; inset: 0; background: ${FARBE.weiss}; }
    #pruefstand-inhalt { position: absolute; inset: 0; }
    #pruefstand-marke { position: absolute; left: 196px; top: 160px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leiseHell}; }
    #pruefstand-zahl { position: absolute; left: 176px; top: 210px; margin: 0; font-size: 300px; font-weight: 800; line-height: 1; letter-spacing: -0.06em; color: ${FARBE.rot}; font-variant-numeric: tabular-nums; }
    #pruefstand-zahl small { font-size: 96px; font-weight: 700; letter-spacing: -0.03em; color: ${FARBE.weiss}; }
    #pruefstand-kaestchen { position: absolute; left: 192px; top: 580px; display: flex; gap: 14px; }
    #pruefstand-kaestchen i { width: 64px; height: 64px; border-radius: 12px; border: 3px solid rgba(255, 255, 255, 0.28); box-sizing: border-box; }
    #pruefstand-kaestchen i.gelernt { background: ${FARBE.rot}; border-color: ${FARBE.rot}; }
    #pruefstand-satz { position: absolute; left: 192px; top: 720px; width: 1500px; margin: 0; font-size: 54px; font-weight: 720; line-height: 1.15; letter-spacing: -0.03em; }
    #pruefstand-quelle { position: absolute; left: 192px; top: 900px; margin: 0; font-size: 28px; color: ${FARBE.leiseHell}; }`,
    `    <div id="pruefstand-flut"></div>
    <div id="pruefstand-inhalt">
      <p id="pruefstand-marke">Prüfstand des Orchestrators</p>
      <p id="pruefstand-zahl"><span id="pruefstand-n">0</span><small> von ${p.faelle}</small></p>
      <div id="pruefstand-kaestchen">
${kaestchen}
      </div>
      <p id="pruefstand-satz">Prüffälle gelernt.${p.ziel ? ` Alle ${p.faelle} sollen es bis ${esc(p.ziel)} sein.` : ''}</p>
      <p id="pruefstand-quelle">Letzter Lauf: ${esc(p.lauf)}</p>
    </div>`,
    `      tl.fromTo("#pruefstand-flut", { opacity: 1 }, { opacity: 0, duration: 0.4, ease: "power2.inOut" }, 0);
      tl.fromTo("#pruefstand-marke", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.35);
      tl.fromTo("#pruefstand-zahl", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.4);
      tl.fromTo("#pruefstand-kaestchen i", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.02, ease: "expo.out" }, 0.4);
      const n = { v: 0 };
      const ziffer = document.querySelector("#pruefstand-n");
      tl.fromTo(n, { v: 0 }, { v: ${p.gelernt}, duration: ${fuellen}, ease: "power2.out", onUpdate: () => { ziffer.textContent = String(Math.round(n.v)); } }, 0.5);
      tl.fromTo("#pruefstand-kaestchen i.gelernt", { backgroundColor: "rgba(244, 14, 14, 0)", borderColor: "rgba(255, 255, 255, 0.28)" }, { backgroundColor: "${FARBE.rot}", borderColor: "${FARBE.rot}", duration: 0.15, stagger: ${zahl(fuellen / Math.max(1, p.gelernt))}, ease: "none" }, 0.5);
      tl.fromTo("#pruefstand-satz", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, 1.25);
      tl.fromTo("#pruefstand-quelle", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 1.45);
      tl.fromTo("#pruefstand-inhalt", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, ${aus('pruefstand')});`,
  )
}

/** 5. Die größte Herausforderung: die Karte des Risikos kommt herein */
function risiko(w) {
  const r = w.risiko
  return szene(
    'risiko',
    `    #root { background: ${FARBE.tief}; color: ${FARBE.weiss}; }
    #risiko-inhalt { position: absolute; inset: 0; }
    #risiko-marke { position: absolute; left: 196px; top: 160px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${FARBE.leiseHell}; }
    #risiko-karte { position: absolute; left: 192px; top: 240px; width: 1536px; padding: 64px 72px 72px; border-radius: 40px; background: ${FARBE.weich}; border: 1px solid rgba(255, 255, 255, 0.12); box-sizing: border-box; box-shadow: 0 70px 140px -70px rgba(0, 0, 0, 0.9); }
    #risiko-kopf { display: flex; align-items: center; gap: 28px; margin: 0 0 40px; font-size: 30px; color: ${FARBE.leiseHell}; }
    #risiko-abzeichen { padding: 10px 24px; border-radius: 999px; background: ${FARBE.rot}; color: ${FARBE.weiss}; font-weight: 700; }
    #risiko-titel { margin: 0; max-width: 1300px; font-size: 92px; font-weight: 780; line-height: 1.04; letter-spacing: -0.045em; }
    #risiko-satz { position: absolute; left: 196px; top: 860px; margin: 0; font-size: 36px; color: ${FARBE.leiseHell}; }`,
    `    <div id="risiko-inhalt">
      <p id="risiko-marke">Die größte Herausforderung</p>
      <div id="risiko-karte">
        <p id="risiko-kopf">${r.eingetreten ? '<span id="risiko-abzeichen">schon eingetreten</span>' : ''}<span>${esc(r.nr)} im Risikoregister, Stufe ${esc(r.stufe)}</span></p>
        <h2 id="risiko-titel">${esc(r.titel)}</h2>
      </div>
      ${r.von > 1 ? `<p id="risiko-satz">Eines von ${r.von} hohen Risiken, die schon eingetreten sind.</p>` : ''}
    </div>`,
    `      tl.fromTo("#risiko-marke", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.1);
      tl.fromTo("#risiko-karte", { opacity: 0, y: 220, rotation: 2.5 }, { opacity: 1, y: 0, rotation: 0, duration: 0.8, ease: "expo.out" }, 0.2);
      ${r.von > 1 ? 'tl.fromTo("#risiko-satz", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power4.out" }, 1.1);' : ''}
      tl.fromTo("#risiko-inhalt", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.2, ease: "power2.in" }, ${aus('risiko')});`,
  )
}

/** 6. Schluss: ab wann du beauftragen kannst, mit Adresse und Stand */
function schluss(w) {
  const satz = w.team
    ? `${woerter(`Beauftragen kannst du ab Meilenstein ${w.team.nr},`, 'schluss')} <span class="rot">${woerter(`${w.team.wann}.`, 'schluss')}</span>`
    : woerter('Beauftragen kannst du, sobald das Team angebunden ist.', 'schluss')
  return szene(
    'schluss',
    `    #root { background: ${FARBE.weiss}; color: ${FARBE.tief}; }
    #schluss-flut { position: absolute; inset: 0; background: ${FARBE.tief}; }
    #schluss-satz { position: absolute; left: 188px; top: 300px; width: 1540px; margin: 0; font-size: 104px; font-weight: 790; line-height: 1.04; letter-spacing: -0.05em; }
    #schluss-satz .rot { color: ${FARBE.rot}; }
    .schluss-w { display: inline-block; }
    #schluss-fuss { position: absolute; left: 192px; top: 780px; margin: 0; font-size: 34px; font-weight: 700; line-height: 1.5; }
    #schluss-fuss span { display: block; font-size: 30px; font-weight: 500; color: ${FARBE.leise}; }`,
    `    <div id="schluss-flut"></div>
    <p id="schluss-satz">${satz}</p>
    <p id="schluss-fuss">${esc(w.name)} · ${esc(w.dach)}<span>wamocon.github.io/kiKollege · Stand der Daten ${esc(datum(w.stand))}</span></p>`,
    `      tl.fromTo("#schluss-flut", { opacity: 1 }, { opacity: 0, duration: 0.35, ease: "power2.inOut" }, 0);
      tl.fromTo("#schluss-satz .schluss-w", { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.13, stagger: 0.067, ease: "power4.out" }, 0.35);
      tl.fromTo("#schluss-fuss", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.85);`,
  )
}

const BAUER = { vorhang, auftrag, zeitstrahl, pruefstand, risiko, schluss }

/** Die Wurzel: hält nur die sechs Einstellungen */
function wurzel(w) {
  const hosts = SZENEN.map(
    (s) => `      <div
        id="${s.id}"
        class="clip"
        data-composition-id="${s.id}"
        data-composition-src="compositions/${s.id}.html"
        data-start="${s.start}"
        data-duration="${s.dauer}"
        data-track-index="0"
        data-track-kind="graphics"
        data-width="${BREITE}"
        data-height="${HOEHE}"
      ></div>`,
  ).join('\n')
  return `<!doctype html>
<!-- Erzeugt von scripts/film-daten.mjs aus data/projektstand.json, Stand ${w.stand}. Nicht von Hand ändern. -->
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${BREITE}, height=${HOEHE}" />
    <title>${esc(w.name)} in ${DAUER} Sekunden</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${BREITE}px; height: ${HOEHE}px; overflow: hidden; background: ${FARBE.tief}; }
      #root { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DAUER}" data-width="${BREITE}" data-height="${HOEHE}">
${hosts}
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
export function kompositionen(werte) {
  const dateien = { 'index.html': wurzel(werte) }
  for (const s of SZENEN) dateien[`compositions/${s.id}.html`] = BAUER[s.id](werte)
  return dateien
}
