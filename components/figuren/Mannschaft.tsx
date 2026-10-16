import type { ReactNode } from 'react'

import { inWorten } from '@/lib/alter'
import { daten, datum, zahl, type AblageBereich, type Kopf } from '@/lib/daten'
import { nurSichtbare, sichtbar } from '@/lib/freigabe'
import { Figur } from './gemeinsam'

/** Das Organigramm der Mannschaft, im Stil des Blatts vom 16.10.: oben der
 *  Mensch und das Team, darunter der Orchestrator und die Rollen, dann die
 *  Werkbank mit ihren Helfern, die Wissensschicht und die gemeinsame Basis.
 *
 *  Eine Farbregel für alles: rot gefüllt läuft mit Grenze, rot gestrichelt
 *  läuft ohne Grenze am Profil, grau gestrichelt ist entschieden und nicht in
 *  Betrieb oder als Wissen ungeprüft. Das Band unten ist, was alle teilen.
 *  Alles kommt aus den Daten; Angaben zum Betrieb des KI-Rechners,
 *  Profilnamen und Versionen stehen bewusst nicht darin. */

const BREITE = 1000
const RAND = 20
const INNEN = BREITE - 2 * RAND

type Art = 'mitGrenze' | 'ohneGrenze' | 'geplant' | 'passtNicht' | 'neutral'
type Farbe = 'text' | 'leise' | 'marke'

interface Stil {
  fill: string
  fillOpacity: number
  stroke: string
  strokeWidth: number
  dash?: string
  text: string
  leise: string
  marke: string
}

function stil(art: Art): Stil {
  switch (art) {
    case 'mitGrenze':
      return { fill: 'var(--signal)', fillOpacity: 0.1, stroke: 'var(--signal)', strokeWidth: 2.2, text: 'var(--wmc-ink)', leise: 'var(--wmc-ink)', marke: 'var(--wmc-primary-text)' }
    case 'ohneGrenze':
      return { fill: 'var(--signal)', fillOpacity: 0.1, stroke: 'var(--wmc-primary-text)', strokeWidth: 2, dash: '5 3', text: 'var(--wmc-ink)', leise: 'var(--wmc-ink)', marke: 'var(--wmc-primary-text)' }
    case 'geplant':
      return { fill: 'var(--wmc-surface-soft)', fillOpacity: 1, stroke: 'var(--wmc-border)', strokeWidth: 1.6, dash: '5 3', text: 'var(--wmc-muted)', leise: 'var(--wmc-muted)', marke: 'var(--wmc-muted)' }
    case 'passtNicht':
      return { fill: 'var(--wmc-bg)', fillOpacity: 1, stroke: 'var(--wmc-border)', strokeWidth: 1.4, dash: '3 3', text: 'var(--wmc-muted)', leise: 'var(--wmc-muted)', marke: 'var(--wmc-muted)' }
    default:
      return { fill: 'var(--wmc-bg)', fillOpacity: 1, stroke: 'var(--wmc-ink)', strokeWidth: 1.5, text: 'var(--wmc-ink)', leise: 'var(--wmc-muted)', marke: 'var(--wmc-muted)' }
  }
}

function artVon(k: Kopf): Art {
  if (k.passtNicht) return 'passtNicht'
  if (k.betrieb === 'mitGrenze') return 'mitGrenze'
  if (k.betrieb === 'ohneGrenze') return 'ohneGrenze'
  return 'geplant'
}

/** Bricht einen Text in Zeilen von höchstens `max` Zeichen um. */
function umbrechen(text: string, max: number): string[] {
  const zeilen: string[] = []
  let zeile = ''
  for (const wort of text.split(' ')) {
    if (zeile && `${zeile} ${wort}`.length > max) {
      zeilen.push(zeile)
      zeile = wort
    } else {
      zeile = zeile ? `${zeile} ${wort}` : wort
    }
  }
  if (zeile) zeilen.push(zeile)
  return zeilen
}

interface Zeile {
  text: string
  groesse: number
  fett?: boolean
  farbe: Farbe
}

function Kasten({ x, y, b, h, art, zeilen }: { x: number; y: number; b: number; h: number; art: Art; zeilen: Zeile[] }) {
  const s = stil(art)
  const mitte = x + b / 2
  let yy = y + 6
  return (
    <g>
      <rect x={x} y={y} width={b} height={h} fill={s.fill} fillOpacity={s.fillOpacity}
            stroke={s.stroke} strokeWidth={s.strokeWidth} strokeDasharray={s.dash} />
      {zeilen.map((z, i) => {
        yy += z.groesse + 4
        return z.text ? (
          <text key={i} x={mitte} y={yy} textAnchor="middle" fontSize={z.groesse}
                fontWeight={z.fett ? 700 : 400} fill={s[z.farbe]}>
            {z.text}
          </text>
        ) : null
      })}
    </g>
  )
}

function Kopfzeile({ y, links, rechts }: { y: number; links: string; rechts?: string }) {
  return (
    <g>
      <text x={RAND} y={y} fontSize="11.5" fontWeight="700" fill="var(--wmc-muted)">
        {links}
      </text>
      {rechts ? (
        <text x={BREITE - RAND} y={y} fontSize="10.5" fill="var(--wmc-muted)" textAnchor="end">
          {rechts}
        </text>
      ) : null}
      <line x1={RAND} y1={y + 8} x2={BREITE - RAND} y2={y + 8} stroke="var(--wmc-border)" strokeWidth="1" />
    </g>
  )
}

/** Die Wissensschicht in sieben Feldern, zusammengezählt aus dem Abbild. */
function wissensfelder(bereiche: AblageBereich[]) {
  const summe = (ids: string[]) => {
    const auswahl = bereiche.filter((b) => ids.includes(b.id))
    return {
      notizen: auswahl.reduce((s, b) => s + b.notizen, 0),
      verbindlich: auswahl.reduce((s, b) => s + b.verbindlich, 0),
    }
  }
  return [
    { titel: ['Konventionen,', 'Entscheidungen'], gedaechtnis: false, ...summe(['konventionen', 'entscheidungen']) },
    { titel: ['Wissen über das', 'Unternehmen'], gedaechtnis: false, ...summe(['unternehmen']) },
    { titel: ['Bauplan der', 'Mitarbeiter'], gedaechtnis: false, ...summe(['bauplan']) },
    { titel: ['Normbasis', 'des Berufs'], gedaechtnis: false, ...summe(['normbasis']) },
    { titel: ['Prüfmaßstab', 'der Academy'], gedaechtnis: false, ...summe(['massstab']) },
    { titel: ['Quellen'], gedaechtnis: false, ...summe(['quellen']) },
    { titel: ['Gedächtnis'], gedaechtnis: true, ...summe(['prueflaeufe']) },
  ]
}

export function MannschaftFigur() {
  const m = daten.mannschaft
  const koepfe = nurSichtbare(m.koepfe)
  const [oben, ...unten] = koepfe
  const teile: ReactNode[] = []
  const lueck = 10

  // Oben: das Team, der Mensch
  const team = { x: RAND, y: 14, b: 280, h: 50 }
  const mensch = { x: 330, y: 14, b: 340, h: 50 }
  const orch = { x: 330, y: 96, b: 340, h: 66 }
  teile.push(
    <Kasten key="team" {...team} art="geplant" zeilen={[
      { text: m.team.titel, groesse: 13.5, fett: true, farbe: 'text' },
      { text: m.team.zusatz, groesse: 11, farbe: 'leise' },
    ]} />,
    <path key="team-pfeil" d={`M ${team.x + team.b / 2} ${team.y + team.h} V 129 H ${orch.x - 4}`}
          fill="none" stroke="var(--wmc-border)" strokeWidth="1.6" strokeDasharray="5 3" markerEnd="url(#spitze-grau)" />,
    <Kasten key="mensch" {...mensch} art="neutral" zeilen={[
      { text: m.mensch.titel, groesse: 14.5, fett: true, farbe: 'text' },
      { text: m.mensch.zusatz, groesse: 10.5, farbe: 'leise' },
    ]} />,
    <line key="mensch-pfeil" x1={500} y1={64} x2={500} y2={92} stroke="var(--signal)" strokeWidth="2" markerEnd="url(#spitze-rot)" />,
    <Kasten key={oben.id} {...orch} art={artVon(oben)} zeilen={[
      { text: oben.name ?? oben.kurz, groesse: 16, fett: true, farbe: 'text' },
      { text: `${oben.rolle}, ${oben.kern}`, groesse: 12, farbe: 'leise' },
      { text: oben.marke ?? '', groesse: 10.5, fett: true, farbe: 'marke' },
    ]} />,
  )

  // Die Rollen darunter
  const b = (INNEN - (unten.length - 1) * lueck) / unten.length
  const xVon = (i: number) => RAND + i * (b + lueck)
  const mitte = (i: number) => xVon(i) + b / 2
  const yVerteiler = 190
  const laufende = unten.map((k, i) => (k.betrieb ? i : -1)).filter((i) => i >= 0)
  teile.push(
    <line key="v-ab" x1={500} y1={orch.y + orch.h} x2={500} y2={yVerteiler} stroke="var(--signal)" strokeWidth="2" />,
    <line key="v-quer" x1={mitte(0)} y1={yVerteiler} x2={mitte(unten.length - 1)} y2={yVerteiler}
          stroke="var(--wmc-border)" strokeWidth="1.6" />,
  )
  if (laufende.length) {
    const links = Math.min(500, ...laufende.map(mitte))
    const rechts = Math.max(500, ...laufende.map(mitte))
    teile.push(
      <line key="v-rot" x1={links} y1={yVerteiler} x2={rechts} y2={yVerteiler} stroke="var(--signal)" strokeWidth="2" />,
    )
  }
  unten.forEach((k, i) => {
    const art = artVon(k)
    const laeuft = art === 'mitGrenze' || art === 'ohneGrenze'
    const unter = umbrechen(k.name ? `${k.kurz}, ${k.kern}` : k.kern, 17).slice(0, 2)
    const marke = umbrechen(k.marke ?? '', 17).slice(0, 2)
    const zeilen: Zeile[] = [
      { text: k.name ?? k.kurz, groesse: 14, fett: true, farbe: 'text' },
      ...unter.map((t): Zeile => ({ text: t, groesse: 10.5, farbe: 'leise' })),
      ...(unter.length < 2 ? [{ text: '', groesse: 10.5, farbe: 'leise' as Farbe }] : []),
      { text: '', groesse: 6, farbe: 'leise' },
      ...marke.map((t): Zeile => ({ text: t, groesse: 10.5, fett: true, farbe: 'marke' })),
    ]
    teile.push(
      <g key={k.id}>
        <line x1={mitte(i)} y1={yVerteiler} x2={mitte(i)} y2={214}
              stroke={laeuft ? 'var(--signal)' : 'var(--wmc-border)'} strokeWidth={laeuft ? 2 : 1.6}
              markerEnd={laeuft ? 'url(#spitze-rot)' : 'url(#spitze-grau)'} />
        <Kasten x={xVon(i)} y={218} b={b} h={112} art={art} zeilen={zeilen} />
      </g>,
    )
  })

  // Die Werkbank
  let y = 364
  const w = m.werkbank
  if (sichtbar(w)) {
    teile.push(
      <Kopfzeile key="wb-kopf" y={y}
                 links={`Werkbank: ${inWorten(w.helfer.length)} Werkzeugmacher in Claude Code, seit dem ${datum(w.seit).slice(0, 6)}`}
                 rechts="bauen, prüfen selbst nichts" />,
    )
    const spalten = 4
    const hb = (INNEN - (spalten - 1) * lueck) / spalten
    w.helfer.forEach((hf, i) => {
      const reihe = Math.floor(i / spalten)
      const spalte = i % spalten
      teile.push(
        <Kasten key={hf.name} x={RAND + spalte * (hb + lueck)} y={y + 20 + reihe * 50} b={hb} h={42} art="neutral" zeilen={[
          { text: hf.name, groesse: 11.5, fett: true, farbe: 'text' },
          { text: hf.aufgabe, groesse: 10.5, farbe: 'leise' },
        ]} />,
      )
    })
    y += 20 + Math.ceil(w.helfer.length / spalten) * 50 + 26
  }

  // Die Wissensschicht
  const a = daten.ablage
  if (sichtbar(a)) {
    teile.push(
      <Kopfzeile key="ws-kopf" y={y} links="Wissensschicht: worauf sich ein KI-Mitarbeiter stützen darf"
                 rechts="farbig: verbindlich, grau: ungeprüft" />,
    )
    const felder = wissensfelder(a.bereiche)
    // Das Gedächtnis zählt Läufe, nicht Notizen: Im Bereich liegen auch Notizen, die kein Lauf sind
    const laeufe = daten.kennzahlen.find((k) => k.id === 'prueflaeufe')?.zahl ?? 0
    const fb = (INNEN - (felder.length - 1) * lueck) / felder.length
    felder.forEach((f, i) => {
      const art: Art = f.gedaechtnis ? 'neutral' : f.verbindlich ? 'mitGrenze' : 'geplant'
      const zahlzeile = f.gedaechtnis
        ? `${zahl(laeufe)} Läufe`
        : f.verbindlich
          ? `${zahl(f.verbindlich)} von ${zahl(f.notizen)} verbindlich`
          : `${zahl(f.notizen)}, ungeprüft`
      const zeilen: Zeile[] = [
        ...f.titel.map((t): Zeile => ({ text: t, groesse: 11, fett: true, farbe: 'text' })),
        ...(f.titel.length < 2 ? [{ text: '', groesse: 11, farbe: 'text' as Farbe }] : []),
        { text: zahlzeile, groesse: 10.5, fett: true, farbe: 'marke' },
      ]
      if (f.gedaechtnis) {
        zeilen.push({ text: `${zahl(a.regelnotizen)} von ${zahl(daten.pruefpunkte.gesamt)} gemessen`, groesse: 10.5, farbe: 'leise' })
      }
      teile.push(<Kasten key={`ws-${i}`} x={RAND + i * (fb + lueck)} y={y + 20} b={fb} h={72} art={art} zeilen={zeilen} />)
    })
    const verbindlich = a.bereiche.reduce((s, x) => s + x.verbindlich, 0)
    teile.push(
      <text key="ws-fuss" x={BREITE / 2} y={y + 112} textAnchor="middle" fontSize="10.5" fill="var(--wmc-muted)">
        Gezählt am {datum(a.gezaehltAm)}: {zahl(verbindlich)} von {zahl(a.notizen)} Notizen verbindlich. Ein Mensch gibt
        frei, kein KI-Mitarbeiter hebt eine Notiz.
      </text>,
    )
    y += 130
  }

  // Die gemeinsame Basis
  const basisY = y
  const bb = (INNEN - 2 * 16 - (m.basis.length - 1) * 14) / m.basis.length
  teile.push(
    <g key="basis">
      <rect x={RAND} y={basisY} width={INNEN} height={152} fill="var(--band)" stroke="var(--wmc-border)" strokeWidth="1" />
      <text x={RAND + 16} y={basisY + 24} fontSize="11.5" fontWeight="700" fill="var(--band-text)">
        Gemeinsam: was alle lesen und worüber alle übergeben
      </text>
      {m.basis.map((t, i) => {
        const x = RAND + 16 + i * (bb + 14)
        return (
          <g key={t.titel}>
            <rect x={x} y={basisY + 38} width={bb} height={98} fill="var(--band-text)" fillOpacity="0.08"
                  stroke="var(--band-text)" strokeOpacity="0.35" strokeWidth="1" />
            <text x={x + bb / 2} y={basisY + 60} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--band-text)">
              {t.titel}
            </text>
            {t.zeilen.map((z, j) => (
              <text key={z} x={x + bb / 2} y={basisY + 80 + j * 15} textAnchor="middle" fontSize="10.5"
                    fill="var(--band-text)" fillOpacity="0.85">
                {z}
              </text>
            ))}
          </g>
        )
      })}
    </g>,
  )

  const laufen = koepfe.filter((k) => k.betrieb).length
  return (
    <Figur
      titel={`Organigramm der Mannschaft: ${inWorten(laufen)} von ${inWorten(koepfe.length)} Rollen laufen. Darunter die Werkbank, die Wissensschicht und die gemeinsame Basis`}
      beschriftung={
        'Rot gefüllt: läuft mit Grenze. Rot gestrichelt: läuft, die Grenze am Profil folgt. Grau gestrichelt: ' +
        'entschieden und nicht in Betrieb, in der Wissensschicht ungeprüft. Das Band unten ist, was alle teilen. ' +
        `Gezählt am ${datum(m.gezaehltAm)}.`
      }
      viewBox={`0 0 ${BREITE} ${basisY + 162}`}
    >
      <defs>
        <marker id="spitze-grau" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--wmc-border)" />
        </marker>
      </defs>
      {teile}
    </Figur>
  )
}
