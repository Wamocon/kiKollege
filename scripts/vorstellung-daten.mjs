/**
 * Der Film „Ein Tag mit der Mannschaft“: Die KI-Mitarbeiter stellen sich vor.
 *
 * Eine Uhr führt durch den Tag, die Kamera fährt von Arbeitsplatz zu Arbeitsplatz.
 * Jeder sagt in Ich-Form, was er kann, zeigt ein Beispiel und sagt, was er nie tut.
 * Die Sätze stehen in produktseite.vorstellung, die Zahlen kommen aus den übrigen
 * Daten. Gerendert wird mit scripts/baue-vorstellung.mjs, zuerst für den Chat.
 */

import { createHash } from 'node:crypto'

export const BREITE = 1920
export const HOEHE = 1080

/** Ein Schwenk von einem Arbeitsplatz zum nächsten, in Sekunden */
const SCHWENK = 0.9
/** Von einem Halt zum nächsten: Lesezeit und Schwenk */
const TAKT = 10.2
const SCHLUSS = 7.8

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

const zahl = (n) => Number(n.toFixed(3))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const datum = (iso) => {
  const [j, m, t] = iso.split('-')
  return `${t}.${m}.${j}`
}

/** Sätze und Zahlen, die der Film zeigt. Ändert sich einer, ist er veraltet. */
export function vorstellungDaten(d) {
  const v = d.produktseite.vorstellung
  const laeufe = d.training.laeufe
  const letzter = laeufe.zeilen.at(-1)
  const faelle = laeufe.bereiche.reduce((s, b) => s + b.faelle, 0)
  const projekt = (id) => d.entstanden.projekte.find((p) => p.id === id)
  const inventar = projekt('wmc-inventar')
  const [, fertig, gesamt] = inventar.status.match(/(\d+) von (\d+)/)
  const stopps = v.stopps.map(({ freigabe: _, ...s }) => {
    const k = d.mannschaft.koepfe.find((x) => x.id === s.kopf)
    const beispiel = { ...s.beispiel }
    if (beispiel.art === 'projekte') {
      beispiel.laeuft = { name: projekt('browser-startseite').name, status: projekt('browser-startseite').status }
      beispiel.bau = { name: inventar.name, status: inventar.status, fertig: Number(fertig), gesamt: Number(gesamt) }
    }
    if (beispiel.art === 'chat') beispiel.training = `Noch im Training: ${letzter.gelernt} von ${faelle} Fällen gelernt`
    return { ...s, beispiel, rolle: s.rolle ?? k.rolle }
  })
  return {
    stand: d.stand,
    name: d.produktseite.name,
    titel: v.titel,
    kern: v.kern,
    nochNicht: v.nochNicht,
    koepfe: stopps.map((s) => ({ id: s.kopf, name: s.name })),
    stopps,
  }
}

export function fingerabdruck(werte) {
  return createHash('sha256').update(JSON.stringify(werte)).digest('hex').slice(0, 16)
}

/** Die Länge des Films in Sekunden */
export const dauer = (w) => zahl(w.stopps.length * TAKT + SCHLUSS)
const beginn = (i) => zahl(i * TAKT)

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
${skript}
      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`
}

/** Der Tag: Hintergrund und Farbe der Uhr wechseln im Schwenk, nie während man liest. */
function boden(w) {
  const ende = dauer(w)
  const wechsel = w.stopps
    .slice(1)
    .map((s, i) => `      tl.to("#boden-flaeche", { backgroundColor: "${s.boden}", duration: ${SCHWENK}, ease: "power2.inOut" }, ${zahl(beginn(i + 1) - SCHWENK)});`)
    .join('\n')
  return szene(
    'boden',
    `    #boden-flaeche { position: absolute; inset: 0; background-color: ${w.stopps[0].boden}; }`,
    `    <div id="boden-flaeche"></div>`,
    `${wechsel}
      tl.to("#boden-flaeche", { backgroundColor: "${FARBE.tief}", duration: ${SCHWENK}, ease: "power2.inOut" }, ${zahl(beginn(w.stopps.length) - SCHWENK)});
      tl.set({}, {}, ${ende});`,
  )
}

/** Die Uhr steht fest, die Kamera fährt an ihr vorbei. Die Zeiger laufen nur im Schwenk. */
function uhr(w) {
  const striche = Array.from({ length: 12 }, (_, i) => {
    const lang = i % 3 === 0 ? 10 : 5
    return `<line x1="60" y1="6" x2="60" y2="${6 + lang}" transform="rotate(${i * 30} 60 60)" />`
  }).join('')
  const drehe = (stunde) => ({ h: zahl(stunde * 30), m: zahl(stunde * 360) })
  const schritte = w.stopps
    .map((s, i) => {
      if (i === 0) return ''
      const { h, m } = drehe(s.stunde)
      const t = zahl(beginn(i) - SCHWENK)
      return `      tl.to("#uhr-h", { rotation: ${h}, svgOrigin: "60 60", duration: ${SCHWENK}, ease: "expo.inOut" }, ${t});
      tl.to("#uhr-m", { rotation: ${m}, svgOrigin: "60 60", duration: ${SCHWENK}, ease: "expo.inOut" }, ${t});
      tl.to("#uhr-ring", { color: "${s.hell ? FARBE.tief : FARBE.weiss}", duration: ${SCHWENK}, ease: "power2.inOut" }, ${t});`
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
    `      tl.set("#uhr-h", { rotation: ${zahl(start.h - 12)}, svgOrigin: "60 60" }, 0);
      tl.set("#uhr-m", { rotation: ${zahl(start.m - 144)}, svgOrigin: "60 60" }, 0);
      tl.to("#uhr-h", { rotation: ${start.h}, svgOrigin: "60 60", duration: 0.45, ease: "back.out(2.2)" }, 0.2);
      tl.to("#uhr-m", { rotation: ${start.m}, svgOrigin: "60 60", duration: 0.45, ease: "back.out(2.2)" }, 0.2);
${schritte}
      tl.to("#uhr-ring", { opacity: 0, duration: 0.3, ease: "power2.in" }, ${zahl(beginn(w.stopps.length) - SCHWENK)});
      tl.set({}, {}, ${dauer(w)});`,
  )
}

// Die Beispiele: jedes hat seine eigene Bewegung ------------------------------

/** Arnold: Der Bericht wird Zeile für Zeile gelesen, die letzte ist auffällig. */
function beispielBericht(b, id, t) {
  const zeilen = b.zeilen
    .map((z, i) => `<li id="${id}-z${i}"><span class="punkt"></span>${esc(z)}</li>`)
    .join('')
  return {
    stil: `    #${id}-bericht { position: absolute; inset: 0; padding: 24px 32px; border: 2px solid ${FARBE.linieHell}; border-radius: 28px; }
    #${id}-bericht h4 { margin: 0 0 12px; font-size: 28px; font-weight: 700; color: ${FARBE.leiseHell}; }
    #${id}-bericht ul { display: grid; grid-template-columns: repeat(4, auto); justify-content: start; gap: 8px 32px; margin: 0; padding: 0; list-style: none; font-size: 30px; font-weight: 600; color: ${FARBE.weiss}; }
    #${id}-bericht li { display: flex; align-items: center; gap: 12px; }
    #${id}-bericht .punkt { width: 16px; height: 16px; border-radius: 50%; background: ${FARBE.leiseHell}; }
    #${id}-auffaellig { margin-top: 22px; font-size: 40px; font-weight: 760; letter-spacing: -0.02em; color: ${FARBE.rot}; }
    #${id}-folge { margin-top: 8px; font-size: 28px; font-weight: 600; color: ${FARBE.leiseHell}; }`,
    html: `<div id="${id}-bericht">
          <h4>${esc(b.titel)}</h4>
          <ul>${zeilen}</ul>
          <div id="${id}-auffaellig">${esc(b.auffaellig)}</div>
          <div id="${id}-folge">${esc(b.folge)}</div>
        </div>`,
    skript: `      tl.fromTo("#${id}-bericht", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${t});
      tl.fromTo("#${id}-bericht li", { opacity: 0.15 }, { opacity: 1, duration: 0.25, stagger: 0.35, ease: "power1.out" }, ${zahl(t + 0.3)});
      tl.fromTo("#${id}-auffaellig", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: "power4.out" }, ${zahl(t + 1.8)});
      tl.fromTo("#${id}-folge", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${zahl(t + 2.5)});`,
  }
}

/** Gregor Dev: Die Pakete füllen sich eins nach dem anderen. */
function beispielProjekte(b, id, t) {
  const kaesten = Array.from({ length: b.bau.gesamt }, (_, i) => `<i class="${i < b.bau.fertig ? 'voll' : ''}"></i>`).join('')
  return {
    stil: `    #${id}-projekte { position: absolute; inset: 0; color: ${FARBE.weiss}; }
    #${id}-projekte .zeile { padding: 18px 0; border-top: 2px solid ${FARBE.linieHell}; }
    #${id}-projekte b { display: block; font-size: 38px; font-weight: 760; letter-spacing: -0.02em; }
    #${id}-projekte span { font-size: 30px; font-weight: 560; color: ${FARBE.leiseHell}; }
    #${id}-kaesten { display: grid; grid-template-columns: repeat(${b.bau.gesamt}, 1fr); gap: 5px; margin-top: 12px; }
    #${id}-kaesten i { display: block; height: 22px; border: 2px solid ${FARBE.linieHell}; border-radius: 4px; }
    #${id}-kaesten i.voll { background: ${FARBE.rot}; border-color: ${FARBE.rot}; }`,
    html: `<div id="${id}-projekte">
          <div class="zeile" id="${id}-laeuft"><b>${esc(b.laeuft.name)}</b><span>${esc(b.laeuft.status)}</span></div>
          <div class="zeile" id="${id}-bau"><b>${esc(b.bau.name)}</b><span>${esc(b.bau.status)}</span>
            <div id="${id}-kaesten">${kaesten}</div>
          </div>
        </div>`,
    skript: `      tl.fromTo("#${id}-laeuft", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, ${t});
      tl.fromTo("#${id}-bau", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, ${zahl(t + 0.5)});
      tl.fromTo("#${id}-kaesten i.voll", { scaleY: 0 }, { scaleY: 1, duration: 0.18, stagger: 0.09, ease: "power2.out" }, ${zahl(t + 0.9)});`,
  }
}

/** julia-trend: Der Bericht kommt als Nachricht an, die Quelle stempelt sich dazu. */
function beispielNachricht(b, id, t) {
  return {
    stil: `    #${id}-nachricht { position: absolute; left: 0; right: 0; top: 0; padding: 26px 32px; border-radius: 28px; background: ${FARBE.tief}; color: ${FARBE.weiss}; }
    #${id}-nachricht h4 { margin: 0 0 8px; font-size: 28px; font-weight: 700; color: ${FARBE.leiseHell}; }
    #${id}-nachricht p { margin: 0; font-size: 34px; font-weight: 620; line-height: 1.22; letter-spacing: -0.015em; }
    #${id}-quelle { display: inline-block; margin-top: 14px; font-size: 28px; font-weight: 760; color: ${FARBE.rot}; }`,
    html: `<div id="${id}-nachricht">
          <h4>${esc(b.kopf)}</h4>
          <p>${esc(b.text)}</p>
          <span id="${id}-quelle">${esc(b.fuss)}</span>
        </div>`,
    skript: `      tl.fromTo("#${id}-nachricht", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, ${t});
      tl.fromTo("#${id}-quelle", { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power4.out" }, ${zahl(t + 1.5)});`,
  }
}

/** Hermes: Du schreibst, er fragt zurück. */
function beispielChat(b, id, t) {
  return {
    stil: `    #${id}-chat { position: absolute; inset: 0; display: flex; flex-direction: column; gap: 10px; }
    #${id}-chat .n { max-width: 86%; padding: 14px 24px; border-radius: 24px; font-size: 32px; font-weight: 600; line-height: 1.22; letter-spacing: -0.012em; }
    #${id}-du { align-self: flex-end; background: ${FARBE.rot}; color: ${FARBE.weiss}; border-bottom-right-radius: 6px; }
    #${id}-er { align-self: flex-start; background: ${FARBE.tief}; color: ${FARBE.weiss}; border-bottom-left-radius: 6px; }
    #${id}-training { margin-top: 2px; font-size: 28px; font-weight: 700; color: ${FARBE.leise}; }`,
    html: `<div id="${id}-chat">
          <div class="n" id="${id}-du">${esc(b.du)}</div>
          <div class="n" id="${id}-er">${esc(b.er)}</div>
          <div id="${id}-training">${esc(b.training)}</div>
        </div>`,
    skript: `      tl.fromTo("#${id}-du", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power4.out" }, ${t});
      tl.fromTo("#${id}-er", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power4.out" }, ${zahl(t + 1.5)});
      tl.fromTo("#${id}-training", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, ${zahl(t + 3)});`,
  }
}

/** Fritz: Die Zahl zählt hoch, der Balken teilt sich auf. */
function beispielZaehler(b, id, t) {
  const teile = b.teile
    .map((x, i) => `<div class="teil" id="${id}-t${i}"><b class="${x.rot ? 'rot' : ''}">${x.zahl}</b> ${esc(x.text)}</div>`)
    .join('')
  const balken = b.teile
    .map((x, i) => `<i id="${id}-b${i}" class="${x.rot ? 'rot' : ''}" style="flex-grow: ${x.zahl}"></i>`)
    .join('')
  return {
    stil: `    #${id}-zaehler { position: absolute; inset: 0; color: ${FARBE.tief}; }
    #${id}-kopf { font-size: 34px; font-weight: 620; letter-spacing: -0.012em; }
    #${id}-kopf b { font-size: 76px; font-weight: 800; letter-spacing: -0.04em; font-variant-numeric: tabular-nums; }
    #${id}-balken { display: flex; gap: 4px; height: 20px; margin: 12px 0 16px; transform-origin: left center; }
    #${id}-balken i { display: block; min-width: 10px; background: ${FARBE.tief}; opacity: 0.85; }
    #${id}-balken i.rot { background: ${FARBE.rot}; opacity: 1; }
    #${id}-teile { display: flex; gap: 32px; font-size: 28px; font-weight: 600; color: ${FARBE.leise}; }
    #${id}-teile b { font-weight: 800; color: ${FARBE.tief}; font-variant-numeric: tabular-nums; }
    #${id}-teile b.rot { color: ${FARBE.rot}; }`,
    html: `<div id="${id}-zaehler">
          <div id="${id}-kopf"><b id="${id}-zahl">${b.gesamt}</b> ${esc(b.was)}</div>
          <div id="${id}-balken">${balken}</div>
          <div id="${id}-teile">${teile}</div>
        </div>`,
    skript: `      const ${id}n = { v: 0 };
      const ${id}z = document.getElementById("${id}-zahl");
      tl.fromTo("#${id}-kopf", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, ${t});
      tl.fromTo(${id}n, { v: 0 }, { v: ${b.gesamt}, duration: 1.3, ease: "power2.out", onUpdate: () => { ${id}z.textContent = String(Math.round(${id}n.v)); } }, ${t});
      tl.fromTo("#${id}-balken", { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: "power2.out" }, ${t});
      tl.fromTo("#${id}-teile .teil", { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.4, ease: "power2.out" }, ${zahl(t + 1.4)});`,
  }
}

/** Theo: Die Balken laufen, grün so weit, wie die Tests grün sind. */
function beispielTests(b, id, t) {
  const zeilen = b.zeilen
    .map((z, i) => {
      const anteil = zahl((z.gruen / z.von) * 100)
      return `<div class="zeile" id="${id}-z${i}">
            <div class="kopf"><b>${esc(z.name)}</b><span><em id="${id}-g${i}">${z.gruen}</em> von ${z.von} grün${z.wann ? `, ${esc(z.wann)}` : ''}</span></div>
            <div class="spur"><i id="${id}-f${i}" style="width: ${anteil}%"></i></div>
          </div>`
    })
    .join('')
  const laeufe = b.zeilen
    .map((z, i) => {
      const s = zahl(t + i * 1.5)
      return `      const ${id}n${i} = { v: 0 };
      const ${id}e${i} = document.getElementById("${id}-g${i}");
      tl.fromTo("#${id}-z${i}", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, ${s});
      tl.fromTo("#${id}-f${i}", { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "none" }, ${zahl(s + 0.1)});
      tl.fromTo(${id}n${i}, { v: 0 }, { v: ${z.gruen}, duration: 1.2, ease: "none", onUpdate: () => { ${id}e${i}.textContent = String(Math.round(${id}n${i}.v)); } }, ${zahl(s + 0.1)});`
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
  }
}

/** Der Archivar: Jedes kommt an seinen Platz. */
function beispielAblage(b, id, t) {
  const zeilen = b.zeilen
    .map((z, i) => `<li id="${id}-z${i}"><span>${esc(z.was)}</span><i></i><b>${esc(z.wohin)}</b></li>`)
    .join('')
  return {
    stil: `    #${id}-ablage { position: absolute; inset: 0; margin: 0; padding: 0; list-style: none; color: ${FARBE.weiss}; }
    #${id}-ablage li { display: grid; grid-template-columns: 300px 1fr auto; align-items: center; gap: 22px; padding: 14px 0; font-size: 36px; border-top: 2px solid ${FARBE.linieHell}; }
    #${id}-ablage span { font-weight: 560; color: ${FARBE.leiseHell}; }
    #${id}-ablage i { display: block; height: 4px; background: ${FARBE.rot}; transform-origin: left center; }
    #${id}-ablage b { font-weight: 760; letter-spacing: -0.02em; }`,
    html: `<ul id="${id}-ablage">${zeilen}</ul>`,
    skript: b.zeilen
      .map((_, i) => {
        const s = zahl(t + i * 0.9)
        return `      tl.fromTo("#${id}-z${i} span", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out" }, ${s});
      tl.fromTo("#${id}-z${i} i", { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "expo.inOut" }, ${zahl(s + 0.2)});
      tl.fromTo("#${id}-z${i} b", { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, ease: "power4.out" }, ${zahl(s + 0.55)});`
      })
      .join('\n'),
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
function stopp(s, i, w, figur) {
  const id = `s${i + 1}`
  const hell = s.hell
  const ink = hell ? FARBE.tief : FARBE.weiss
  const leise = hell ? FARBE.leise : FARBE.leiseHell
  const erster = i === 0
  // Beim ersten Halt fährt nichts herein; ab da trifft der Text kurz nach der Kamera ein
  const an = erster ? 0.35 : SCHWENK
  const gesamt = zahl((erster ? 0 : SCHWENK) + TAKT)
  const weg = zahl(gesamt - SCHWENK)
  const b = BEISPIEL[s.beispiel.art](s.beispiel, id, zahl(an + 1.6))
  const woerter = s.ich
    .split(/\s+/)
    .map((x) => `<span class="m"><span class="w">${esc(x)}</span></span>`)
    .join(' ')
  return szene(
    `stopp${i + 1}`,
    `    #welt { position: absolute; inset: 0; color: ${ink}; }
    #bild { position: absolute; left: 96px; top: 72px; width: 760px; }
    #bild .k-bild { border-radius: 30px; }
    #beispiel { position: absolute; left: 96px; top: 668px; width: 760px; height: 300px; }
    #wann { position: absolute; left: 1080px; top: 118px; width: 660px; margin: 0; font-size: 40px; font-weight: 720; letter-spacing: -0.02em; line-height: 1.12; color: ${leise}; }
    #ich { position: absolute; left: 932px; top: 240px; width: 830px; margin: 0; font-size: 88px; font-weight: 790; letter-spacing: -0.045em; line-height: 1.04; }
    .m { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.14em; margin-bottom: -0.14em; }
    .w { display: inline-block; }
    #rolle { position: absolute; left: 940px; top: 350px; width: 790px; margin: 0; font-size: 34px; font-weight: 620; color: ${leise}; }
    #kann { position: absolute; left: 940px; top: 424px; width: 790px; margin: 0; font-size: 46px; font-weight: 600; line-height: 1.2; letter-spacing: -0.022em; }
    #nie { position: absolute; left: 940px; top: 790px; width: 790px; margin: 0; padding-top: 24px; font-size: 38px; font-weight: 640; line-height: 1.2; letter-spacing: -0.015em; }
    #nie-linie { position: absolute; left: 0; right: 0; top: 0; height: 0; border-top: 4px dashed ${FARBE.rot}; transform-origin: left center; }
${b.stil}`,
    `    <div id="welt" data-layout-allow-overflow>
      <div id="bild">${figur}</div>
      <div id="beispiel">
        ${b.html}
      </div>
      <p id="wann">${esc(s.wann)}</p>
      <h2 id="ich">${woerter}</h2>
      <p id="rolle">${esc(s.rolle)}</p>
      <p id="kann">${esc(s.kann)}</p>
      <p id="nie"><span id="nie-linie"></span><span id="nie-text">${esc(s.nie)}</span></p>
    </div>`,
    `      ${erster ? '' : `tl.fromTo("#welt", { x: ${BREITE} }, { x: 0, duration: ${SCHWENK}, ease: "expo.inOut" }, 0);`}
      tl.fromTo("#bild", { scale: 1 }, { scale: 1.03, duration: ${weg}, ease: "none", transformOrigin: "50% 60%" }, 0);
      tl.fromTo("#wann", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${zahl(an)});
      tl.fromTo("#ich .w", { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.07, ease: "power4.out" }, ${zahl(an + 0.05)});
      tl.fromTo("#rolle", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, ${zahl(an + 0.55)});
      tl.fromTo("#kann", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, ${zahl(an + 0.85)});
      tl.fromTo('#bild [fill^="var(--k-rot"], #bild [stroke^="var(--k-rot"]', { opacity: 0, scale: 0.7, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" }, ${zahl(an + 1)});
${b.skript}
      tl.fromTo("#nie-linie", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.inOut" }, ${zahl(an + 4.9)});
      tl.fromTo("#nie-text", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" }, ${zahl(an + 5.2)});
      tl.fromTo("#welt", { x: 0 }, { x: ${-BREITE}, duration: ${SCHWENK}, ease: "expo.inOut", immediateRender: false }, ${weg});`,
  )
}

/** Schluss: alle zusammen, und wer am Ende entscheidet */
function schluss(w, figuren) {
  const koepfe = w.koepfe
    .map(
      (k, i) => `<li id="kopf${i}"><span class="bild">${figuren[k.id].kopf}</span><span class="name">${esc(k.name)}</span></li>`,
    )
    .join('')
  const maskiert = (text) =>
    esc(text)
      .split(/\s+/)
      .map((x) => `<span class="m"><span class="w">${x}</span></span>`)
      .join(' ')
  const [vorn, hinten] = w.kern
  const [mensch, wort] = hinten.split(/\s(?=\S+$)/)
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
    #marke { position: absolute; left: 192px; bottom: 112px; margin: 0; font-size: 34px; font-weight: 780; letter-spacing: -0.02em; }
    #marke span { font-weight: 560; color: ${FARBE.leiseHell}; }`,
    `    <div id="schluss-welt" data-layout-allow-overflow>
      <ul id="koepfe">${koepfe}</ul>
      <p id="kern">
        <span class="zeile">${maskiert(vorn)}</span>
        <span class="zeile">${maskiert(mensch)} <span class="rot">${maskiert(wort)}</span></span>
      </p>
      <p id="noch">${esc(w.nochNicht)}</p>
      <p id="marke">${esc(w.titel)} <span>· ${esc(w.name)} · Stand der Daten ${datum(w.stand)}</span></p>
    </div>`,
    `      tl.fromTo("#koepfe li", { x: 420, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "expo.out" }, 0.85);
      tl.fromTo("#kern .w", { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.07, ease: "power4.out" }, 2);
      tl.fromTo("#noch", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 3.8);
      tl.fromTo("#marke", { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, 4.4);
      tl.set({}, {}, ${zahl(SCHLUSS + SCHWENK)});`,
  )
}

function wurzel(w, hosts) {
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
    <div id="root" data-composition-id="main" data-start="0" data-duration="${dauer(w)}" data-width="${BREITE}" data-height="${HOEHE}">
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

export function kompositionen(w, figuren) {
  const ende = dauer(w)
  const hosts = [host('boden', 0, ende, 0, 0), host('uhr', 0, ende, 1, 30)]
  const dateien = {
    'compositions/boden.html': boden(w),
    'compositions/uhr.html': uhr(w),
  }
  w.stopps.forEach((s, i) => {
    const id = `stopp${i + 1}`
    const start = i === 0 ? 0 : zahl(beginn(i) - SCHWENK)
    const laenge = zahl((i === 0 ? 0 : SCHWENK) + TAKT)
    hosts.push(host(id, start, laenge, i % 2 === 0 ? 2 : 3, 10))
    dateien[`compositions/${id}.html`] = stopp(s, i, w, figuren[s.kopf].linie)
  })
  const sStart = zahl(beginn(w.stopps.length) - SCHWENK)
  hosts.push(host('schluss', sStart, zahl(ende - sStart), 4, 10))
  dateien['compositions/schluss.html'] = schluss(w, figuren)
  dateien['index.html'] = wurzel(w, hosts.join('\n'))
  return dateien
}
