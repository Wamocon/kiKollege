/**
 * Die Systemdemo „Ein Auftrag, einmal ganz durch“: Ein Prüfauftrag geht vom Handy über
 * Hermes Agent, Qwen und den Zaun aufs Board, Fritz prüft, der Befund kommt unverändert
 * zurück, und am Ende entscheidet ein Mensch.
 *
 * Jede Station ist eine eigene Welt; jedes Bild endet mit dem, was das nächste öffnet.
 * Die Stimme ist die Uhr: Jede Zeit im Bild kommt aus der gemessenen Länge der
 * Sprachdateien. Weg und Schritte stehen in techstack.ablauf, der Befund in
 * beispielbefund, die Pflichtangaben in der Zeile von Fritz in anleitung.zeilen.
 * Nachgestellt und im Bild so gekennzeichnet sind der Wortlaut der Nachricht, die
 * Oberflächen von Telegram und Board und die übrigen Fragen des Quiz.
 * Gerendert wird mit scripts/baue-systemdemo.mjs, zuerst für den Chat.
 */

import { createHash } from 'node:crypto'

import { woerterVon, wortZeiten, zeile } from './stimme.mjs'

export const BREITE = 1920
export const HOEHE = 1080
/** Grenze für die Länge; was darüber geht, wird gekürzt, nicht gehetzt */
export const HOECHSTENS = 100

/** Kamerawechsel zwischen zwei Welten */
const WECHSEL = 0.8
/** Vom Ende des Wechsels bis zur ersten Stimme der Station */
const VOR = 0.35
const VOR_ERSTER = 0.9
/** Zwischen zwei Sätzen einer Station */
const LUFT = 0.3
/** Nach dem letzten Satz bis zum Wechsel */
const NACH = 0.7
/** Am Ende steht das letzte Bild */
const HALT = 2.8

const FARBE = {
  weiss: '#FFFFFF',
  tief: '#140B0B',
  weich: '#241414',
  rot: '#F40E0E',
  flaeche: '#F4EFEF',
  rand: '#DDD3D3',
  leise: '#6B5F5F',
  leiseHell: 'rgba(255, 255, 255, 0.72)',
  linieHell: 'rgba(255, 255, 255, 0.16)',
}
const ERZAEHLER = { stimme: 'thorsten', tempo: 1, tonhoehe: 1 }
const NACHRICHT = 'Prüf bitte das Quiz „{quiz}“.'

const zahl = (n) => Number(n.toFixed(3))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const kurz = (iso) => {
  const [, m, t] = iso.split('-')
  return `${t}.${m}.`
}
/** Ein Satz endet vor einem Leerzeichen und einem Großbuchstaben, damit Daten ihn nicht zerschneiden */
const saetze = (text) => text.trim().split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/)
const pruefe = (wert, was) => {
  if (!wert) throw new Error(`Systemdemo: ${was} passt nicht mehr zu den Daten.`)
  return wert
}

// ---------------------------------------------------------------------------
// Daten
// ---------------------------------------------------------------------------

export function systemdemoDaten(d) {
  const schritt = (titel) => pruefe(d.techstack.ablauf.schritte.find((s) => s.titel === titel), `Schritt „${titel}“`).text
  const fritz = pruefe(d.anleitung.zeilen.find((z) => z.wer === 'Fritz'), 'die Zeile von Fritz in der Anleitung')
  const b = d.beispielbefund
  const ort = pruefe(b.fundstelle.match(/^Quiz „(.+?)["“], Frage (\d+), Option ([A-Z])$/), 'die Fundstelle des Beispielbefunds')
  const [falsch, richtig] = saetze(b.text)
  const markiert = pruefe(falsch.match(/ist die (.+) markiert/), 'der Text des Beispielbefunds')[1]
  const profil = schritt('Profil')
  const teile = pruefe(profil.match(/mit (.+) des Orchestrators/), 'der Schritt Profil')[1].split(/, | und /)
  const [ergebnis, zurueck] = saetze(schritt('Zurück'))
  const plan = d.meilensteinplanAktuell
  const m1 = pruefe(plan.meilensteine.find((m) => m.id === 'M1' && m.abgenommen), 'die Abnahme von Meilenstein 1')
  const m2 = pruefe(plan.meilensteine.find((m) => m.id === 'M2'), 'Meilenstein 2')
  const quiz = ort[1]
  const stationen = [
    { id: 'nachricht', saetze: [
      ['Ein Auftrag an Fritz beginnt mit einer Nachricht an den Orchestrator.', ['Nachricht']],
      ['Sie nennt alles, was Fritz zum Prüfen braucht.', ['alles']],
    ] },
    { id: 'profil', saetze: [[profil, teile]] },
    { id: 'qwen', saetze: [
      ['Das Ganze geht als Text an Qwen.', ['Text']],
      ['Qwen wünscht sich ein Werkzeug: eine Karte für Fritz.', ['Karte']],
      [saetze(schritt('Zaun'))[0], ['Zaun', 'Grenze']],
    ] },
    { id: 'board', saetze: [
      ['Die Karte liegt auf dem Board.', ['Board']],
      ['Fritz übernimmt, mit seiner eigenen Akte.', ['Fritz', 'Akte']],
    ] },
    { id: 'quiz', saetze: [
      ['Er prüft das Quiz gegen den Maßstab des Hauses.', ['Maßstab']],
      [falsch, [markiert.split(' ').at(-1)]],
    ] },
    { id: 'befund', saetze: [
      [richtig, ['Integrationsamt']],
      [`Ein ${b.stufe}, mit Fundstelle.`, ['Fundstelle']],
    ] },
    { id: 'zurueck', saetze: [
      [ergebnis, ['Karte']],
      [zurueck, ['unverändert']],
    ] },
    { id: 'schluss', saetze: [
      [`Diesen Weg ist ein Auftrag am ${kurz(m1.abgenommen.am)} zum ersten Mal gegangen, bei der Abnahme von Meilenstein 1.`, []],
      [d.produktseite.vorstellung.kern[0], []],
      [d.produktseite.vorstellung.kern[1], []],
      [`Aufträge gibt das Team ab Meilenstein 2, ${m2.fruehestens ? 'frühestens ' : ''}am ${kurz(m2.termin)}`, []],
    ] },
  ]
  const stimme = stationen.flatMap((s) =>
    s.saetze.map(([text, anker], i) => zeile(`${s.id}-${i + 1}`, text, { ...ERZAEHLER, anker, station: s.id })),
  )
  return {
    stand: d.stand,
    name: d.produktseite.name,
    titel: d.produktseite.systemdemo.titel,
    nachricht: NACHRICHT.replace('{quiz}', quiz),
    angaben: fritz.angaben.split(', '),
    teile,
    befund: { stufe: b.stufe, falsch, richtig, fundstelle: b.fundstelle, quiz, frage: Number(ort[2]), option: ort[3], markiert },
    kern: d.produktseite.vorstellung.kern,
    stationen: stationen.map((s) => ({ id: s.id })),
    stimme,
  }
}

/** Über alles, was der Film zeigt und sagt; der Stand der Daten gehört nicht dazu, er steht nicht im Bild */
export function fingerabdruck(werte) {
  const { stand, ...gezeigt } = werte
  void stand
  return createHash('sha256').update(JSON.stringify(gezeigt)).digest('hex').slice(0, 16)
}

// ---------------------------------------------------------------------------
// Zeitplan: aus den gemessenen Längen der Sprachdateien
// ---------------------------------------------------------------------------

export function zeitplan(w, zeiten) {
  const zeilen = {}
  const stationen = []
  let start = 0
  w.stationen.forEach((st, i) => {
    const eigene = w.stimme.filter((z) => z.station === st.id)
    let u = i === 0 ? VOR_ERSTER : start + WECHSEL + VOR
    eigene.forEach((z, n) => {
      const m = zeiten[z.id]
      zeilen[z.id] = { start: zahl(u), dauer: m.dauer, woerter: wortZeiten(z, m).map((t) => zahl(u + t)) }
      u += m.dauer + (n < eigene.length - 1 ? LUFT : 0)
    })
    const letzte = i === w.stationen.length - 1
    const weg = zahl(u + (letzte ? HALT : NACH))
    stationen.push({ id: st.id, start: zahl(start), stimmeEnde: zahl(u), weg, dauer: zahl((letzte ? weg : weg + WECHSEL) - start) })
    start = weg
  })
  return { dauer: stationen.at(-1).weg, stationen, zeilen }
}

/** Ortszeiten einer Station, mit Wörtern als Merkzeichen */
function uhrwerk(plan, w, i) {
  const p = plan.stationen[i]
  const lokal = (t) => zahl(Math.max(0, t - p.start))
  const z = (id) => plan.zeilen[id]
  const text = (id) => woerterVon(w.stimme.find((x) => x.id === id))
  return {
    p,
    lokal,
    raus: zahl(p.weg - p.start),
    an: (id) => lokal(z(id).start),
    ende: (id) => lokal(z(id).start + z(id).dauer),
    woerter: (id) => z(id).woerter.map(lokal),
    bei: (id, wort) => {
      const n = text(id).findIndex((x) => x.startsWith(wort))
      return n < 0 ? lokal(z(id).start + z(id).dauer / 2) : lokal(z(id).woerter[n])
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
      color: ${FARBE.tief};
      --k-tinte: ${FARBE.tief}; --k-grund: #FFFFFF; --k-rot: ${FARBE.rot}; --k-flaeche: #E8E4E4;
      --k-leise: #5F3E3E; --k-rand: #D2C7C7; --k-papier: #FFFFFF;
    }
    .k-bild { display: block; width: 100%; height: auto; overflow: hidden; }
    .welt { position: absolute; left: 0; top: 0; width: ${BREITE}px; height: ${HOEHE}px; }
    .hell { background: ${FARBE.flaeche}; }
    .dunkel { background: ${FARBE.tief}; color: ${FARBE.weiss}; }
    .avatar { display: grid; place-items: center; border-radius: 50%; background: ${FARBE.weiss}; overflow: hidden; }
    .avatar svg { width: 100%; height: auto; }
    .stufe { display: inline-block; padding: 6px 16px; border-radius: 10px; background: ${FARBE.rot}; color: ${FARBE.weiss}; font-weight: 780; }
    .platz { display: block; height: 18px; border-radius: 9px; background: #E6DEDE; }
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
/** Wörter kommen zu ihrer Zeit, leicht von unten */
const wortFuerWort = (auswahl, zeiten) =>
  zeiten.map((t, i) => `tl.fromTo("${auswahl}:nth-of-type(${i + 1})", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.24, ease: "power3.out" }, ${zahl(t - 0.02)});`).join('\n      ')

/** Kennungen in einer Zeichnung eindeutig machen, sie steht in mehreren Bildern */
const eigen = (svg, vor) =>
  svg
    .replace(/\bid="([^"]+)"/g, `id="${vor}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${vor}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${vor}-$1"`)
const avatar = (svg, vor, groesse, stil = '') =>
  `<div class="avatar" style="width: ${groesse}px; height: ${groesse}px; ${stil}">${eigen(svg, vor)}</div>`

/** Wie die Welt hereinkommt und wieder geht. Jede Station hat ihre eigene Kamera. */
const KAMERA_EIN = {
  rechts: { x: BREITE },
  links: { x: -BREITE },
  unten: { y: HOEHE },
  zoom: { scale: 0.32, opacity: 0 },
  blende: { opacity: 0 },
}
const KAMERA_AUS = {
  links: { x: -BREITE },
  rechts: { x: BREITE },
  hoch: { y: -HOEHE },
  zoom: { scale: 3.2, opacity: 0 },
  blende: { opacity: 0 },
}
function kamera(welt, ein, aus, raus, ursprung = '50% 50%') {
  const z = []
  if (ein) z.push(`tl.fromTo("${welt}", ${JSON.stringify({ ...KAMERA_EIN[ein], transformOrigin: ursprung })}, { x: 0, y: 0, scale: 1, opacity: 1, duration: ${WECHSEL}, ease: "power3.inOut" }, 0);`)
  if (aus) z.push(`tl.to("${welt}", ${JSON.stringify({ ...KAMERA_AUS[aus], transformOrigin: ursprung, duration: WECHSEL, ease: 'power3.inOut' })}, ${raus});`)
  return z.join('\n      ')
}

// Telefon: in der ersten und der vorletzten Station an derselben Stelle
const TEL = { x: 250, y: 64, b: 470, h: 952 }
const BLASE = { x: 330, y: 700, b: 350 }

const telefonStil = `
    .telefon { position: absolute; left: ${TEL.x}px; top: ${TEL.y}px; width: ${TEL.b}px; height: ${TEL.h}px; border-radius: 64px; background: ${FARBE.tief}; padding: 16px; box-shadow: 0 24px 60px rgba(20, 11, 11, 0.18); }
    .bildschirm { position: relative; width: 100%; height: 100%; border-radius: 50px; background: ${FARBE.flaeche}; overflow: hidden; }
    .tel-kopf { display: flex; align-items: center; gap: 16px; height: 126px; padding: 34px 26px 0; background: ${FARBE.weiss}; border-bottom: 1px solid ${FARBE.rand}; }
    .tel-kopf b { display: block; font-size: 30px; font-weight: 740; letter-spacing: -0.02em; }
    .tel-kopf span { display: block; font-size: 24px; color: ${FARBE.leise}; }
    .eingabe { position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 12px; height: 118px; padding: 0 20px 18px; background: ${FARBE.weiss}; border-top: 1px solid ${FARBE.rand}; }
    .feld { flex: 1; min-height: 64px; padding: 14px 20px; border-radius: 32px; background: ${FARBE.flaeche}; font-size: 28px; line-height: 1.3; }
    .senden { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: ${FARBE.tief}; }
    .senden svg { width: 30px; height: 30px; }
    .blase { position: absolute; width: ${BLASE.b}px; padding: 20px 24px; border-radius: 26px 26px 8px 26px; background: ${FARBE.weiss}; box-shadow: 0 6px 18px rgba(20, 11, 11, 0.1); font-size: 30px; font-weight: 560; line-height: 1.3; color: ${FARBE.tief}; }
    .nachgestellt { position: absolute; font-size: 28px; color: ${FARBE.leise}; }`

const SENDEN = `<svg viewBox="0 0 24 24"><path d="M3 11.5 21 3l-6.5 18-3-7.5z" fill="#fff"/></svg>`

function telefon(vor, hermes, verlauf = '', eingabe = '') {
  return `<div class="telefon" data-layout-allow-overflow>
        <div class="bildschirm">
          <div class="tel-kopf">${avatar(hermes, `${vor}-h`, 66, `background: ${FARBE.flaeche};`)}<div><b>Orchestrator</b><span data-layout-ignore>Telegram</span></div></div>
          ${verlauf}
          <div class="eingabe"><div class="feld" id="${vor}-feld">${eingabe}</div><div class="senden" id="${vor}-senden">${SENDEN}</div></div>
        </div>
      </div>`
}

// ---------------------------------------------------------------------------
// Die Stationen
// ---------------------------------------------------------------------------

/** 1 Nachricht: Das Handy, die Nachricht wird getippt und gesendet; rechts die Pflichtangaben. */
function nachricht(w, plan, f) {
  const U = uhrwerk(plan, w, 0)
  const tippBeginn = 0.1
  const tippDauer = 1.5
  const senden = zahl(Math.max(U.bei('nachricht-1', 'Nachricht'), tippBeginn + tippDauer + 0.15))
  const alles = U.bei('nachricht-2', 'alles')
  const stil = `${telefonStil}
    .angaben { position: absolute; left: 900px; top: 250px; width: 860px; }
    .angaben-kopf { margin: 0 0 30px; font-size: 30px; font-weight: 650; color: ${FARBE.leise}; }
    .angaben ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 26px; }
    .angaben li { display: flex; align-items: flex-start; gap: 24px; font-size: 44px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; }
    .haken { flex: none; display: grid; place-items: center; width: 46px; height: 46px; margin-top: 2px; border-radius: 12px; border: 3px solid ${FARBE.tief}; }
    .haken svg { width: 28px; height: 28px; opacity: 0; }
    .cursor { display: inline-block; width: 3px; height: 30px; margin-left: 2px; vertical-align: -5px; background: ${FARBE.tief}; }`
  const haken = `<svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6" fill="none" stroke="#140B0B" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  const inhalt = `    <div class="welt hell" id="n-welt" data-layout-allow-overflow>
      ${telefon('n', f.orchestrator, '', `${zeichen(w.nachricht, 'n-z')}<i class="cursor" id="n-cursor"></i>`)}
      <p class="nachgestellt" style="left: ${TEL.x + 24}px; top: ${TEL.y + TEL.h + 10}px">Nachricht nachgestellt</p>
      <div class="angaben">
        <p class="angaben-kopf">Pflichtangaben</p>
        <ul>${w.angaben.map((a) => `<li class="n-angabe"><span class="haken">${haken}</span><span>${esc(a)}</span></li>`).join('')}</ul>
      </div>
    </div>
    <div class="blase" id="n-blase" style="left: ${BLASE.x}px; top: ${BLASE.y}px; opacity: 0" data-layout-allow-overflow>${esc(w.nachricht)}</div>`
  const skript = `
      tl.fromTo(".n-z", { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: ${tippDauer} }, ease: "none" }, ${tippBeginn});
      tl.to("#n-senden", { backgroundColor: "${FARBE.rot}", scale: 1.12, duration: 0.18, ease: "power2.out" }, ${zahl(senden - 0.2)});
      tl.to("#n-senden", { scale: 1, duration: 0.3, ease: "power3.out" }, ${zahl(senden)});
      tl.to(".n-z, #n-cursor", { opacity: 0, duration: 0.12 }, ${senden});
      tl.fromTo("#n-blase", { opacity: 0, y: 150, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, ${senden});
      tl.to("#n-senden", { backgroundColor: "${FARBE.tief}", duration: 0.4 }, ${zahl(senden + 0.9)});
      tl.fromTo(".n-angabe", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out", stagger: 0.2 }, ${zahl(alles - 0.1)});
      tl.to(".n-angabe .haken svg", { opacity: 1, duration: 0.2, stagger: 0.2 }, ${zahl(alles + 0.2)});
      ${kamera('#n-welt', null, 'links', U.raus)}
      tl.to("#n-blase", { x: ${960 - BLASE.b / 2 - BLASE.x}, y: ${540 - 60 - BLASE.y}, scale: 1.15, duration: ${WECHSEL}, ease: "power3.inOut" }, ${U.raus});`
  return szene('nachricht', stil, inhalt, skript)
}

/** 2 Profil: Die Nachricht landet in der Mitte, Hermes Agent legt Ring um Ring dazu. */
function profil(w, plan, f) {
  const U = uhrwerk(plan, w, 1)
  const M = { x: 700, y: 540 }
  const R = [250, 322, 394, 466]
  const bogen = (r) => `M ${M.x - r} ${M.y} A ${r} ${r} 0 0 1 ${M.x + r} ${M.y}`
  const zeiten = w.teile.map((t) => U.bei('profil-1', t))
  const stil = `${telefonStil}
    .ringe { position: absolute; left: 0; top: 0; width: ${BREITE}px; height: ${HOEHE}px; overflow: visible; }
    .ring-grund { fill: none; stroke: rgba(255, 255, 255, 0.07); stroke-width: 60; }
    .ring-zug { fill: none; stroke: rgba(255, 255, 255, 0.28); stroke-width: 60; stroke-dasharray: 1; stroke-dashoffset: 1; }
    .ring-wort { font-size: 34px; font-weight: 760; letter-spacing: 0.16em; text-transform: uppercase; fill: ${FARBE.weiss}; opacity: 0; }
    .kern { fill: ${FARBE.weiss}; }
    .hermes { position: absolute; left: 1340px; top: 360px; width: 480px; }
    .hermes h2 { margin: 34px 0 10px; font-size: 64px; font-weight: 780; letter-spacing: -0.03em; }
    .hermes p { margin: 0; font-size: 30px; line-height: 1.35; color: ${FARBE.leiseHell}; }
    .faden { position: absolute; left: ${M.x - 160}px; top: ${M.y - 38}px; width: 320px; height: 76px; border-radius: 38px; background: ${FARBE.weiss}; color: ${FARBE.tief}; display: grid; place-items: center; font-size: 28px; font-weight: 700; }`
  const inhalt = `    <div class="welt dunkel" id="p-welt" data-layout-allow-overflow>
      <svg class="ringe" viewBox="0 0 ${BREITE} ${HOEHE}" id="p-alles">
        ${R.map((r) => `<circle class="ring-grund" cx="${M.x}" cy="${M.y}" r="${r}"/>`).join('')}
        ${R.map((r, i) => `<circle class="ring-zug" id="p-zug${i}" cx="${M.x}" cy="${M.y}" r="${r}" pathLength="1" transform="rotate(-90 ${M.x} ${M.y})"/>`).join('')}
        ${R.map((r, i) => `<path id="p-bogen${i}" d="${bogen(r - 9)}" fill="none"/><text class="ring-wort" id="p-wort${i}"><textPath href="#p-bogen${i}" startOffset="50%" text-anchor="middle">${esc(w.teile[i])}</textPath></text>`).join('')}
        <circle class="kern" id="p-kern" cx="${M.x}" cy="${M.y}" r="190"/>
      </svg>
      <div class="hermes">${avatar(f.orchestrator, 'p-h', 150)}<h2>Hermes Agent</h2><p>legt das Profil des Orchestrators dazu</p></div>
    </div>
    <div class="blase" id="p-blase" style="left: ${960 - BLASE.b / 2}px; top: ${540 - 60}px" data-layout-allow-overflow>${esc(w.nachricht)}</div>
    <div class="faden" id="p-faden" data-layout-allow-overflow>als Text</div>`
  const skript = `
      // Die Nachricht kommt mit: dieselbe Fahrt wie am Ende der ersten Station, nur obenauf
      tl.fromTo("#p-blase", { x: ${BLASE.x - (960 - BLASE.b / 2)}, y: ${BLASE.y - 480}, scale: 1 }, { x: 0, y: 0, scale: 1.15, duration: ${WECHSEL}, ease: "power3.inOut" }, 0);
      tl.set("#p-faden", { opacity: 0 }, 0);
      tl.fromTo("#p-kern", { scale: 0, svgOrigin: "${M.x} ${M.y}" }, { scale: 1, svgOrigin: "${M.x} ${M.y}", duration: 0.6, ease: "power3.out" }, ${WECHSEL});
      tl.to("#p-blase", { x: ${M.x - 960}, y: 0, scale: 0.92, duration: 0.7, ease: "power2.inOut" }, ${WECHSEL});
      ${zeiten.map((t, i) => `tl.to("#p-zug${i}", { strokeDashoffset: 0, stroke: "${FARBE.rot}", duration: 0.55, ease: "power2.out" }, ${zahl(t - 0.05)});
      tl.to("#p-wort${i}", { opacity: 1, duration: 0.3 }, ${zahl(t)});${i > 0 ? `
      tl.to("#p-zug${i - 1}", { stroke: "rgba(255, 255, 255, 0.28)", duration: 0.3 }, ${zahl(t)});` : ''}`).join('\n      ')}
      tl.to("#p-zug${R.length - 1}", { stroke: "rgba(255, 255, 255, 0.28)", duration: 0.3 }, ${zahl(U.ende('profil-1') + 0.1)});
      tl.to("#p-alles", { scale: 0.12, opacity: 0, transformOrigin: "${M.x}px ${M.y}px", duration: 0.5, ease: "power3.in" }, ${zahl(U.raus - 0.45)});
      tl.to("#p-blase", { scale: 0.1, opacity: 0, duration: 0.5, ease: "power3.in" }, ${zahl(U.raus - 0.45)});
      tl.fromTo("#p-faden", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, ${zahl(U.raus - 0.1)});
      ${kamera('#p-welt', 'rechts', 'links', U.raus)}
      tl.to("#p-faden", { x: ${960 - M.x}, duration: ${WECHSEL}, ease: "power3.inOut" }, ${U.raus});`
  return szene('profil', stil, inhalt, skript)
}

/** 3 Qwen und Zaun: Der Text geht in Qwen, Qwen wünscht ein Werkzeug, der Zaun prüft. */
function qwen(w, plan) {
  const U = uhrwerk(plan, w, 2)
  const karte = U.bei('qwen-2', 'Karte')
  const fahrt = zahl(U.an('qwen-3') - 0.55)
  const zaun = U.bei('qwen-3', 'Zaun')
  const grenze = U.bei('qwen-3', 'Grenze')
  // Nach dem Schwenk steht der Zaun mitten im Bild: Latten links, Tor, Latten rechts
  const SCHWENK = 1320
  const LINKS = [2020, 2080, 2140, 2200]
  const TOR = 2260
  const RECHTS = [2420, 2480, 2540]
  const stil = `
    .weit { width: ${BREITE + SCHWENK}px; }
    .qwen { position: absolute; left: 980px; top: 270px; width: 540px; height: 540px; border-radius: 34px; background: ${FARBE.weiss}; color: ${FARBE.tief}; padding: 56px; display: flex; flex-direction: column; justify-content: flex-end; }
    .qwen b { font-size: 120px; font-weight: 820; letter-spacing: -0.05em; line-height: 0.9; }
    .qwen span { display: block; margin-top: 18px; font-size: 32px; line-height: 1.3; color: ${FARBE.leise}; }
    .zufluss { position: absolute; display: grid; place-items: center; height: 64px; padding: 0 28px; border-radius: 32px; border: 2px solid ${FARBE.linieHell}; font-size: 28px; font-weight: 650; color: ${FARBE.weiss}; }
    .werkzeug { position: absolute; left: 1560px; top: 498px; padding: 22px 32px; border-radius: 18px; background: ${FARBE.weich}; border-left: 6px solid ${FARBE.rot}; font-size: 32px; font-weight: 700; white-space: nowrap; color: ${FARBE.weiss}; }
    .werkzeug span { display: block; font-size: 28px; font-weight: 560; color: ${FARBE.leiseHell}; }
    .latte { position: absolute; top: 170px; width: 22px; height: 740px; border-radius: 6px; background: rgba(255, 255, 255, 0.22); }
    .tor { position: absolute; left: ${TOR}px; top: 170px; width: 120px; height: 740px; }
    .tor i { position: absolute; top: 0; width: 22px; height: 740px; border-radius: 6px; background: rgba(255, 255, 255, 0.5); }
    .zaun-text { position: absolute; left: ${SCHWENK + 1360}px; top: 260px; width: 440px; }
    .zaun-text b { display: block; font-size: 64px; font-weight: 780; letter-spacing: -0.03em; }
    .zaun-text span { display: block; margin-top: 12px; font-size: 30px; line-height: 1.35; color: ${FARBE.leiseHell}; }
    .erlaubt { position: absolute; left: ${TOR - 10}px; top: 930px; font-size: 30px; font-weight: 760; color: ${FARBE.weiss}; }
    .erlaubt i { display: inline-block; width: 14px; height: 14px; margin-right: 12px; border-radius: 50%; background: ${FARBE.rot}; }
    .faden { position: absolute; left: ${960 - 160}px; top: ${540 - 38}px; width: 320px; height: 76px; border-radius: 38px; background: ${FARBE.weiss}; color: ${FARBE.tief}; display: grid; place-items: center; font-size: 28px; font-weight: 700; }`
  const zufluss = ['Nachricht', ...w.teile]
  const inhalt = `    <div class="welt dunkel weit" id="q-welt" data-layout-allow-overflow>
      ${zufluss.map((t, i) => `<div class="zufluss q-zu" style="left: ${420 + (i % 2) * 150}px; top: ${250 + i * 110}px">${esc(t)}</div>`).join('')}
      <div class="qwen" id="q-qwen"><b>Qwen</b><span>das Sprachmodell. Bekommt Text, gibt Text zurück.</span></div>
      <div class="werkzeug" id="q-wz" data-layout-allow-overflow>Karte anlegen<span>Werkzeug, für Fritz</span></div>
      ${[...LINKS, ...RECHTS].map((x) => `<i class="latte" style="left: ${x}px"></i>`).join('')}
      <div class="tor"><i id="q-tor1" style="left: 18px"></i><i id="q-tor2" style="left: 80px"></i></div>
      <div class="zaun-text" id="q-zt"><b>Zaun</b><span>prüft jeden Aufruf gegen die Grenze</span></div>
      <p class="erlaubt" id="q-ok"><i></i>erlaubt</p>
    </div>
    <div class="faden" id="q-faden" data-layout-allow-overflow>als Text</div>`
  const skript = `
      // Der Faden kommt mit: dieselbe Fahrt wie am Ende der Station davor, nur obenauf
      tl.fromTo("#q-faden", { x: ${700 - 960} }, { x: 0, duration: ${WECHSEL}, ease: "power3.inOut" }, 0);
      ${kamera('#q-welt', 'rechts', null, U.raus)}
      tl.to("#q-faden", { scale: 0.8, opacity: 0, duration: 0.35, ease: "power2.in" }, ${zahl(Math.max(WECHSEL, U.an('qwen-1') - 0.1))});
      tl.fromTo(".q-zu", { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out", stagger: 0.07 }, ${zahl(U.an('qwen-1'))});
      tl.to(".q-zu", { x: 520, opacity: 0, duration: 0.7, ease: "power2.in", stagger: 0.08 }, ${zahl(U.bei('qwen-1', 'Qwen') - 0.2)});
      tl.fromTo("#q-qwen", { scale: 0.96 }, { scale: 1, duration: 0.5, ease: "power3.out" }, ${zahl(U.bei('qwen-1', 'Qwen') + 0.35)});
      tl.fromTo("#q-wz", { opacity: 0, x: -140 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, ${zahl(karte - 0.15)});
      tl.to("#q-welt", { x: ${-SCHWENK}, duration: 1.1, ease: "power2.inOut" }, ${fahrt});
      tl.to("#q-wz", { x: ${TOR - 20 - 330 - 1560}, duration: 1.1, ease: "power2.inOut" }, ${fahrt});
      tl.fromTo("#q-zt", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }, ${zahl(zaun - 0.1)});
      tl.to("#q-tor1", { x: -46, duration: 0.5, ease: "power2.inOut" }, ${zahl(grenze)});
      tl.to("#q-tor2", { x: 46, duration: 0.5, ease: "power2.inOut" }, ${zahl(grenze)});
      tl.fromTo("#q-ok", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${zahl(grenze + 0.3)});
      tl.to("#q-wz", { x: ${RECHTS.at(-1) + 60 - 1560}, duration: 0.8, ease: "power2.inOut" }, ${zahl(grenze + 0.45)});
      tl.to("#q-welt", { y: ${-HOEHE}, duration: ${WECHSEL}, ease: "power3.inOut" }, ${U.raus});`
  return szene('qwen', stil, inhalt, skript)
}

/** 4 Board: Die Karte fällt in „Neu“, Fritz kommt dazu, die Karte rückt nach „Läuft“. */
function board(w, plan, f) {
  const U = uhrwerk(plan, w, 3)
  const fritz = U.bei('board-2', 'Fritz')
  const akte = U.bei('board-2', 'Akte')
  const SP = [160, 700, 1240]
  const stil = `
    .board-kopf { position: absolute; left: 160px; top: 92px; font-size: 34px; font-weight: 760; }
    .board-kopf span { margin-left: 18px; font-size: 28px; font-weight: 500; color: ${FARBE.leise}; }
    .spalte { position: absolute; top: 170px; width: 520px; height: 820px; border-radius: 26px; background: ${FARBE.weiss}; padding: 30px; }
    .spalte h3 { margin: 0; font-size: 32px; font-weight: 720; }
    .karte { position: absolute; left: ${SP[0] + 30}px; top: 260px; width: 460px; padding: 28px 30px; border-radius: 20px; background: ${FARBE.flaeche}; box-shadow: 0 10px 28px rgba(20, 11, 11, 0.1); border-left: 6px solid transparent; }
    .karte b { display: block; font-size: 36px; font-weight: 740; letter-spacing: -0.02em; }
    .karte .wer { display: flex; align-items: center; gap: 16px; margin-top: 22px; font-size: 30px; font-weight: 650; }`
  const inhalt = `    <div class="welt hell" id="b-welt" data-layout-allow-overflow>
      <p class="board-kopf">Board<span>nachgebaut</span></p>
      ${['Neu', 'Läuft', 'Fertig'].map((t, i) => `<div class="spalte" style="left: ${SP[i]}px"><h3>${t}</h3></div>`).join('')}
      <div class="karte" id="b-karte" data-layout-allow-overflow>
        <b>Quiz „${esc(w.befund.quiz)}“ prüfen</b>
        <div class="wer" id="b-wer">${avatar(f.reviewer, 'b-f', 70, `background: ${FARBE.weiss};`)}<span>Fritz</span></div>
      </div>
    </div>`
  const skript = `
      ${kamera('#b-welt', 'unten', null, U.raus)}
      tl.fromTo("#b-karte", { y: -560, rotation: -4 }, { y: 0, rotation: 0, duration: 0.9, ease: "power3.out" }, ${zahl(WECHSEL * 0.6)});
      tl.fromTo("#b-wer", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }, ${zahl(fritz - 0.1)});
      tl.to("#b-karte", { x: ${SP[1] - SP[0]}, borderLeftColor: "${FARBE.rot}", duration: 0.8, ease: "power2.inOut" }, ${zahl(akte - 0.2)});
      tl.to("#b-welt", { scale: 3.2, opacity: 0, transformOrigin: "${SP[1] + 260}px 345px", duration: ${WECHSEL}, ease: "power3.in" }, ${U.raus});`
  return szene('board', stil, inhalt, skript)
}

/** 5 Quiz: Fritz liest den Bogen gegen den Maßstab; die markierte Option wird rot umrandet. */
function quiz(w, plan, f) {
  const U = uhrwerk(plan, w, 4)
  const b = w.befund
  const massstab = U.bei('quiz-1', 'Maßstab')
  const markiert = U.bei('quiz-2', b.markiert.split(' ').at(-1))
  /** Mitte der markierten Option auf dem Bogen, aus dem Satzspiegel unten */
  const ZIEL = 745
  const stil = `
    .papier { position: absolute; left: 160px; top: 46px; width: 1180px; height: 988px; border-radius: 10px; background: ${FARBE.weiss}; box-shadow: 0 24px 60px rgba(20, 11, 11, 0.16); padding: 60px 70px; }
    .papier h2 { margin: 0; font-size: 50px; font-weight: 790; letter-spacing: -0.03em; }
    .papier .hinweis { margin: 6px 0 0; font-size: 28px; color: ${FARBE.leise}; }
    .frage { margin-top: 44px; }
    .frage h3 { margin: 0 0 16px; font-size: 32px; font-weight: 740; }
    .opt { display: flex; align-items: center; gap: 20px; height: 70px; }
    .opt i { flex: none; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; border: 2px solid ${FARBE.rand}; font-style: normal; font-size: 28px; font-weight: 700; color: ${FARBE.leise}; }
    .opt.echt { position: relative; }
    .opt.echt span { font-size: 34px; font-weight: 640; }
    .opt.echt i { border-color: ${FARBE.tief}; color: ${FARBE.tief}; }
    .markiert { margin-left: auto; font-size: 28px; font-weight: 650; color: ${FARBE.leise}; }
    .lesen { position: absolute; left: 160px; top: 0; width: 1180px; height: 3px; background: ${FARBE.rot}; }
    .rahmen { position: absolute; left: -18px; top: -8px; width: calc(100% + 36px); height: calc(100% + 16px); overflow: visible; }
    .rahmen rect { fill: none; stroke: ${FARBE.rot}; stroke-width: 4; stroke-dasharray: 1; stroke-dashoffset: 1; }
    .fritz { position: absolute; left: 1430px; top: 250px; width: 400px; }
    .fritz h2 { margin: 30px 0 8px; font-size: 60px; font-weight: 780; letter-spacing: -0.03em; }
    .fritz p { margin: 0; font-size: 30px; line-height: 1.35; color: ${FARBE.leise}; }
    .massstab { position: absolute; left: 1430px; top: 720px; width: 400px; padding: 26px 28px; border-radius: 10px; background: ${FARBE.weiss}; border-top: 6px solid ${FARBE.tief}; font-size: 30px; font-weight: 700; box-shadow: 0 10px 28px rgba(20, 11, 11, 0.1); }
    .massstab span { display: block; margin-top: 12px; }`
  const platz = (breite) => `<span class="platz" style="width: ${breite}px"></span>`
  const option = (buchstabe, breite) => `<div class="opt" data-layout-ignore><i>${buchstabe}</i>${platz(breite)}</div>`
  const optionen = ['A', 'B', 'C', 'D'].map((x, i) =>
    x === b.option
      ? `<div class="opt echt" id="q-echt"><i>${x}</i><span>${esc(b.markiert.replace(/^./, (c) => c.toUpperCase()))}</span><span class="markiert">als richtig markiert</span><svg class="rahmen" viewBox="0 0 1076 86" preserveAspectRatio="none"><rect x="2" y="2" width="1072" height="82" rx="18" pathLength="1" id="z-rahmen" vector-effect="non-scaling-stroke"/></svg></div>`
      : option(x, [520, 0, 460, 600][i]),
  )
  const inhalt = `    <div class="welt hell" id="z-welt" data-layout-allow-overflow>
      <div class="papier">
        <h2>Quiz „${esc(b.quiz)}“</h2>
        <p class="hinweis">Ausschnitt, nachgestellt. Echt sind Frage, Option und Markierung.</p>
        <div class="frage"><h3>Frage ${b.frage - 1}</h3>${platz(900)}<div style="height: 14px"></div>${option('A', 420)}${option('B', 560)}</div>
        <div class="frage"><h3>Frage ${b.frage}</h3>${platz(960)}<div style="height: 12px"></div>${platz(700)}<div style="height: 10px"></div>${optionen.join('')}</div>
      </div>
      <i class="lesen" id="z-lesen"></i>
      <div class="fritz">${avatar(f.reviewer, 'z-f', 200, `background: ${FARBE.weiss};`)}<h2>Fritz</h2><p>prüft Unterlagen, er bewertet nicht und gibt nichts frei</p></div>
      <div class="massstab" id="z-mass">Maßstab des Hauses<span class="platz" style="width: 280px"></span><span class="platz" style="width: 220px"></span></div>
    </div>`
  const skript = `
      ${kamera('#z-welt', 'zoom', 'blende', U.raus, '960px 380px')}
      tl.fromTo("#z-lesen", { y: 230, opacity: 0 }, { y: ${ZIEL}, opacity: 1, duration: ${zahl(Math.max(1.2, markiert - WECHSEL - 0.3))}, ease: "none" }, ${WECHSEL});
      tl.fromTo("#z-mass", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }, ${zahl(massstab - 0.1)});
      tl.to("#z-rahmen", { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" }, ${zahl(markiert - 0.1)});
      tl.to("#z-lesen", { opacity: 0, duration: 0.2 }, ${zahl(markiert)});`
  return szene('quiz', stil, inhalt, skript)
}

/** 6 Befund: Die Karte wächst aus der markierten Option, mit Stufe, Text und Fundstelle. */
function befund(w, plan, f) {
  const U = uhrwerk(plan, w, 5)
  const b = w.befund
  const stil = `
    .befund { position: absolute; left: 160px; top: 200px; width: 1300px; padding: 64px 70px 70px; border-radius: 30px; background: ${FARBE.weich}; border: 1px solid ${FARBE.linieHell}; }
    .befund .stufe { font-size: 34px; }
    .befund .falsch { margin: 40px 0 0; font-size: 36px; font-weight: 560; line-height: 1.35; color: ${FARBE.leiseHell}; }
    .befund .richtig { margin: 22px 0 0; font-size: 60px; font-weight: 790; line-height: 1.12; letter-spacing: -0.03em; }
    .befund .ort { margin: 44px 0 0; padding-top: 30px; border-top: 1px solid ${FARBE.linieHell}; font-size: 32px; font-weight: 650; }
    .befund .ort span { display: block; margin-bottom: 8px; font-size: 28px; font-weight: 600; color: ${FARBE.leiseHell}; }
    .von { position: absolute; left: 1560px; top: 330px; width: 260px; font-size: 30px; line-height: 1.35; color: ${FARBE.leiseHell}; }
    .von b { display: block; margin-top: 24px; font-size: 44px; font-weight: 780; color: ${FARBE.weiss}; }`
  const inhalt = `    <div class="welt dunkel" id="f-welt" data-layout-allow-overflow>
      <div class="befund" id="f-karte">
        <span class="stufe">${esc(b.stufe)}</span>
        <p class="falsch">${esc(b.falsch)}</p>
        <p class="richtig">${woerter(b.richtig, 'f-w')}</p>
        <p class="ort" id="f-ort"><span>Fundstelle</span>${esc(b.fundstelle.replace(/"/, '“'))}</p>
      </div>
      <div class="von" id="f-von">${avatar(f.reviewer, 'f-f', 160)}<b>Fritz</b>Befund aus einem echten Prüflauf</div>
    </div>`
  const skript = `
      ${kamera('#f-welt', 'blende', 'rechts', U.raus)}
      tl.fromTo("#f-karte", { scale: 0.5, x: -120, y: 200 }, { scale: 1, x: 0, y: 0, duration: ${WECHSEL + 0.2}, ease: "power3.out" }, 0);
      tl.set(".f-w", { opacity: 0 }, 0);
      ${wortFuerWort('.f-w', U.woerter('befund-1'))}
      tl.fromTo("#f-von", { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }, ${zahl(U.an('befund-1') + 0.4)});
      tl.fromTo("#f-ort", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, ${zahl(U.bei('befund-2', 'Fundstelle') - 0.1)});`
  return szene('befund', stil, inhalt, skript)
}

/** 7 Zurück: dasselbe Handy, die Antwort kommt an, unverändert. */
function zurueckZumHandy(w, plan, f) {
  const U = uhrwerk(plan, w, 6)
  const b = w.befund
  const karte = U.bei('zurueck-1', 'Karte')
  const unveraendert = U.bei('zurueck-2', 'unverändert')
  const stil = `${telefonStil}
    .antwort { position: absolute; left: ${TEL.x + 40}px; top: 420px; width: 392px; padding: 20px 22px 22px; border-radius: 26px 26px 26px 8px; background: ${FARBE.weiss}; box-shadow: 0 6px 18px rgba(20, 11, 11, 0.1); }
    .antwort .von { font-size: 28px; font-weight: 650; color: ${FARBE.leise}; }
    .antwort .stufe { margin-top: 12px; font-size: 28px; padding: 4px 12px; }
    .antwort p { margin: 12px 0 0; font-size: 29px; font-weight: 640; line-height: 1.28; }
    .antwort small { display: block; margin-top: 10px; font-size: 28px; color: ${FARBE.leise}; }
    .alt { left: ${BLASE.x - TEL.x - 16}px; top: 150px; transform-origin: 100% 0; }
    .fertig { position: absolute; left: 900px; top: 280px; width: 520px; padding: 28px 30px; border-radius: 20px; background: ${FARBE.weiss}; box-shadow: 0 10px 28px rgba(20, 11, 11, 0.1); }
    .fertig b { display: block; font-size: 34px; font-weight: 740; }
    .fertig span { display: block; margin-top: 12px; font-size: 28px; color: ${FARBE.leise}; }
    .wort { position: absolute; left: 900px; top: 560px; font-size: 104px; font-weight: 820; letter-spacing: -0.04em; }
    .wort i { display: block; width: 100%; height: 8px; margin-top: 6px; background: ${FARBE.rot}; transform-origin: 0 50%; }`
  const verlauf = `<div class="blase alt" style="position: absolute; transform: scale(0.94)">${esc(w.nachricht)}</div>`
  const inhalt = `    <div class="welt hell" id="r-welt" data-layout-allow-overflow>
      ${telefon('r', f.orchestrator, verlauf)}
      <div class="antwort" id="r-antwort">
        <div class="von">Befund von Fritz</div>
        <span class="stufe">${esc(b.stufe)}</span>
        <p>${esc(b.richtig)}</p>
        <small>${esc(b.fundstelle.replace(/"/, '“'))}</small>
      </div>
      <div class="fertig" id="r-fertig"><b>Quiz „${esc(b.quiz)}“ prüfen</b><span>Fertig, Ergebnis auf der Karte</span></div>
      <div class="wort" id="r-wort">unverändert<i id="r-strich"></i></div>
    </div>`
  const skript = `
      ${kamera('#r-welt', 'links', null, U.raus)}
      tl.fromTo("#r-fertig", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${zahl(karte - 0.15)});
      tl.fromTo("#r-antwort", { opacity: 0, y: 60, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }, ${zahl(unveraendert - 0.5)});
      tl.fromTo("#r-wort", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, ${zahl(unveraendert - 0.05)});
      tl.fromTo("#r-strich", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" }, ${zahl(unveraendert + 0.25)});`
  return szene('zurueck', stil, inhalt, skript)
}

/** 8 Schluss: rote Fläche, der Kernsatz, der erste Lauf, wer ab wann Aufträge gibt, die Wortmarke. */
function schluss(w, plan) {
  const U = uhrwerk(plan, w, 7)
  const stil = `
    .rot { background: ${FARBE.rot}; color: ${FARBE.weiss}; }
    .erster { position: absolute; left: 160px; top: 150px; width: 1500px; font-size: 40px; font-weight: 600; line-height: 1.35; }
    .kern { position: absolute; left: 160px; font-size: 112px; font-weight: 820; letter-spacing: -0.045em; line-height: 1; }
    .ab { position: absolute; left: 160px; top: 650px; width: 1500px; font-size: 40px; font-weight: 600; line-height: 1.35; }
    .marke { position: absolute; left: 160px; top: 800px; font-size: 150px; font-weight: 850; letter-spacing: -0.055em; line-height: 1; }
    .fuss { position: absolute; left: 160px; top: 990px; font-size: 28px; color: rgba(255, 255, 255, 0.86); }`
  const inhalt = `    <div class="welt rot" id="s-welt" data-layout-allow-overflow>
      <p class="erster" id="s-erster">${woerter(w.stimme.find((z) => z.id === 'schluss-1').sichtbar, 's-e')}</p>
      <p class="kern" id="s-kern1" style="top: 300px">${esc(w.kern[0])}</p>
      <p class="kern" id="s-kern2" style="top: 440px; color: ${FARBE.tief}">${esc(w.kern[1])}</p>
      <p class="ab" id="s-ab">${woerter(w.stimme.find((z) => z.id === 'schluss-4').sichtbar, 's-a')}</p>
      <p class="marke" id="s-marke">${esc(w.name)}</p>
      <p class="fuss">Befund aus einem echten Prüflauf von Fritz. Nachricht, Telegram, Board und Quiz nachgestellt.</p>
    </div>`
  const auf = (sel, t) => `tl.fromTo("${sel}", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, ${zahl(t)});`
  const skript = `
      ${kamera('#s-welt', 'unten', null, U.raus)}
      tl.set(".s-e, .s-a", { opacity: 0 }, 0);
      ${wortFuerWort('.s-e', U.woerter('schluss-1'))}
      ${auf('#s-kern1', U.an('schluss-2') - 0.1)}
      ${auf('#s-kern2', U.an('schluss-3') - 0.1)}
      ${wortFuerWort('.s-a', U.woerter('schluss-4'))}
      tl.fromTo("#s-marke", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, ${zahl(U.ende('schluss-4') + 0.3)});`
  return szene('schluss', stil, inhalt, skript)
}

const BAUE = { nachricht, profil, qwen, board, quiz, befund, zurueck: zurueckZumHandy, schluss }

// ---------------------------------------------------------------------------
// Wurzel
// ---------------------------------------------------------------------------

function wurzel(w, hosts, plan) {
  return `<!doctype html>
<!-- Erzeugt von scripts/systemdemo-daten.mjs aus data/projektstand.json, Stand ${w.stand}. Nicht von Hand ändern. -->
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${BREITE}, height=${HOEHE}" />
    <title>${esc(w.titel)}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${BREITE}px; height: ${HOEHE}px; overflow: hidden; background: ${FARBE.flaeche}; }
      #root { width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${plan.dauer}" data-width="${BREITE}" data-height="${HOEHE}">
${hosts}
      <audio id="stimme" src="assets/stimme.wav" data-start="0" data-duration="${plan.dauer}" data-track-index="9" data-volume="1"></audio>
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
  const hosts = []
  const dateien = {}
  /** Nur die Köpfe: Hermes im Kopf des Chats, Fritz auf Karte, Bogen und Befund */
  const koepfe = { orchestrator: figuren.orchestrator.kopf, reviewer: figuren.reviewer.kopf }
  w.stationen.forEach((s, i) => {
    const p = plan.stationen[i]
    hosts.push(host(s.id, p.start, p.dauer, i % 2, 10 + i))
    dateien[`compositions/${s.id}.html`] = BAUE[s.id](w, plan, koepfe)
  })
  dateien['index.html'] = wurzel(w, hosts.join('\n'), plan)
  return dateien
}
