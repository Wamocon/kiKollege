import type { ReactNode } from 'react'

import { daten, datum, type LandschaftVerbindung, type LandschaftZustand } from '@/lib/daten'
import { nurSichtbare } from '@/lib/freigabe'
import { Figur, Kasten } from './gemeinsam'

/** Die Systemlandschaft mit Ist und Soll. Drei Orte nebeneinander: Werkbank,
 *  Ablage, KI-Rechner. In jedem stehen seine Bausteine mit ihrem Zustand.
 *  Gefüllt heißt läuft, leer heißt vorhanden und noch nicht im Einsatz,
 *  gestrichelt heißt entschieden und nicht gebaut. Rot trägt nur das eine,
 *  woran der Rest hängt: eine Verbindung oder ein Baustein. Alles kommt aus data/projektstand.json. */

const BREITE = 900
const SPALTE = 246
const LUECKE = (BREITE - 3 * SPALTE) / 2
const X = { werkbank: 0, ablage: SPALTE + LUECKE, rechner: 2 * (SPALTE + LUECKE) } as const
const MITTE = {
  werkbank: X.werkbank + SPALTE / 2,
  ablage: X.ablage + SPALTE / 2,
  rechner: X.rechner + SPALTE / 2,
} as const

const OBEN = 80
const KOPF = 62
const ZEILE = 20
const MENSCH = { y: 6, hoehe: 40 }

function Marke({ x, y, zustand, rot = false }: { x: number; y: number; zustand: LandschaftZustand; rot?: boolean }) {
  if (zustand === 'laeuft') return <rect x={x} y={y} width={9} height={9} fill={rot ? 'var(--signal)' : 'var(--wmc-ink)'} />
  return (
    <rect
      x={x + 0.5} y={y + 0.5} width={8} height={8} fill="none"
      stroke={rot ? 'var(--signal)' : zustand === 'geplant' ? 'var(--wmc-muted)' : 'var(--wmc-ink)'}
      strokeWidth="1"
      strokeDasharray={zustand === 'geplant' ? '2 1.5' : undefined}
    />
  )
}

/** Strichart einer Verbindung nach Zustand; die tragende ist rot. */
function strich(v: LandschaftVerbindung) {
  const farbe = v.traegt ? 'var(--signal)' : v.zustand === 'geplant' ? 'var(--wmc-muted)' : 'var(--wmc-ink)'
  return {
    stroke: farbe,
    strokeWidth: 1.5,
    strokeDasharray: v.zustand === 'geplant' ? '5 4' : undefined,
    fill: 'none',
    markerEnd: v.traegt ? 'url(#spitze-rot)' : 'url(#spitze)',
  }
}

function Beschriftung({
  x, y, zeilen, anker = 'middle', rot = false,
}: {
  x: number; y: number; zeilen: string[]; anker?: 'start' | 'middle'; rot?: boolean
}) {
  return (
    <text x={x} y={y} textAnchor={anker} fontSize="10.5"
          fill={rot ? 'var(--wmc-primary-text)' : 'var(--wmc-muted)'}>
      {zeilen.map((z, i) => (
        <tspan key={z} x={x} dy={i === 0 ? 0 : 13}>
          {z}
        </tspan>
      ))}
    </text>
  )
}

export function LandschaftFigur() {
  const l = daten.landschaft
  const bausteine = nurSichtbare(l.bausteine)
  const verbindungen = new Map(nurSichtbare(l.verbindungen).map((v) => [v.id, v]))
  const zeilen = Math.max(...l.orte.map((o) => bausteine.filter((b) => b.ort === o.id).length))
  const unten = OBEN + KOPF + 12 + zeilen * ZEILE
  const seiteY = unten + 40
  const seiteHoehe = 44
  const vergleichY = seiteY + seiteHoehe + 28
  const legendeY = vergleichY + 40
  const teile: ReactNode[] = []

  // Der Mensch und seine beiden Wege
  teile.push(
    <Kasten key="mensch" x={X.ablage} y={MENSCH.y} breite={SPALTE} hoehe={MENSCH.hoehe}
            titel={l.mensch.name} zusatz={l.mensch.zusatz} />,
  )
  const hoehe = MENSCH.y + MENSCH.hoehe / 2
  for (const [id, ziel, von] of [
    ['sitzung', MITTE.werkbank, X.ablage],
    ['chat', MITTE.rechner, X.ablage + SPALTE],
  ] as const) {
    const v = verbindungen.get(id)
    if (!v) continue
    teile.push(
      <g key={id}>
        <path d={`M ${von} ${hoehe} H ${ziel} V ${OBEN - 4}`} {...strich(v)} />
        <Beschriftung x={(von + ziel) / 2} y={hoehe - 6} zeilen={v.zeilen} />
      </g>,
    )
  }

  // Die drei Orte mit ihren Bausteinen
  for (const o of l.orte) {
    const x = X[o.id]
    const eigene = bausteine.filter((b) => b.ort === o.id)
    teile.push(
      <g key={o.id}>
        <rect x={x} y={OBEN} width={SPALTE} height={unten - OBEN}
              fill="var(--wmc-bg)" stroke="var(--wmc-border)" strokeWidth="1" />
        <text x={x + 12} y={OBEN + 22} fontSize="14" fontWeight="700" fill="var(--wmc-ink)">
          {o.name}
        </text>
        <text x={x + 12} y={OBEN + 39} fontSize="11" fontWeight="700" fill="var(--wmc-ink)">
          {o.produkt}
        </text>
        <text x={x + 12} y={OBEN + 54} fontSize="11" fill="var(--wmc-muted)">
          {o.rolle}
        </text>
        <line x1={x} y1={OBEN + KOPF} x2={x + SPALTE} y2={OBEN + KOPF}
              stroke="var(--rand-leise)" strokeWidth="1" />
        {eigene.map((b, i) => {
          const y = OBEN + KOPF + 22 + i * ZEILE
          return (
            <g key={b.id}>
              <Marke x={x + 12} y={y - 8} zustand={b.zustand} rot={b.traegt} />
              <text x={x + 28} y={y} fontSize="11" fontWeight={b.traegt ? 700 : 400}
                    fill={b.traegt ? 'var(--wmc-primary-text)' : b.zustand === 'geplant' ? 'var(--wmc-muted)' : 'var(--wmc-ink)'}>
                {b.name}
              </text>
            </g>
          )
        })}
      </g>,
    )
  }

  // Verbindungen zwischen den Orten, auf Höhe der Köpfe
  const quer = OBEN + 34
  const direkt = verbindungen.get('direkt')
  if (direkt) {
    teile.push(
      <g key="direkt">
        <line x1={SPALTE + 3} y1={quer} x2={X.ablage - 3} y2={quer}
              {...strich(direkt)} markerStart={strich(direkt).markerEnd} />
        <Beschriftung x={SPALTE + LUECKE / 2} y={quer - 18} zeilen={direkt.zeilen} />
      </g>,
    )
  }
  const bus = verbindungen.get('bus')
  if (bus) {
    teile.push(
      <g key="bus">
        <line x1={X.rechner - 3} y1={quer} x2={X.ablage + SPALTE + 3} y2={quer}
              {...strich(bus)} markerStart={strich(bus).markerEnd} />
        <Beschriftung x={X.rechner - LUECKE / 2} y={quer + 16} zeilen={bus.zeilen} rot={bus.traegt} />
      </g>,
    )
  }

  // Von der Ablage zu dieser Seite
  const seite = verbindungen.get('seite')
  if (seite) {
    teile.push(
      <g key="seite">
        <line x1={MITTE.ablage} y1={unten} x2={MITTE.ablage} y2={seiteY - 4} {...strich(seite)} />
        <Beschriftung x={MITTE.ablage + 10} y={unten + 23} zeilen={seite.zeilen} anker="start" />
        <Kasten x={X.ablage} y={seiteY} breite={SPALTE} hoehe={seiteHoehe}
                titel={l.seite.name} zusatz={`${l.seite.produkt}, seit ${datum(l.seite.seit)}`} />
      </g>,
    )
  }

  // Der Vergleich läuft unten herum, von Werkbank zu Rechner
  const vergleich = verbindungen.get('vergleich')
  if (vergleich) {
    teile.push(
      <g key="vergleich">
        <path
          d={`M ${MITTE.werkbank} ${unten} V ${vergleichY} H ${MITTE.rechner} V ${unten + 4}`}
          {...strich(vergleich)}
        />
        <Beschriftung x={BREITE / 2} y={vergleichY + 16} zeilen={vergleich.zeilen} />
      </g>,
    )
  }

  // Legende
  const legende: { zustand: LandschaftZustand; text: string; x: number }[] = [
    { zustand: 'laeuft', text: 'läuft', x: 0 },
    { zustand: 'vorhanden', text: 'vorhanden, noch nicht im Einsatz', x: 70 },
    { zustand: 'geplant', text: 'entschieden, nicht gebaut', x: 300 },
  ]
  legende.forEach(({ x, ...e }) => {
    teile.push(
      <g key={`legende-${e.zustand}`}>
        <Marke x={x} y={legendeY - 8} zustand={e.zustand} />
        <text x={x + 15} y={legendeY} fontSize="11" fill="var(--wmc-muted)">{e.text}</text>
      </g>,
    )
  })
  if (bus?.traegt) {
    teile.push(
      <g key="legende-traegt">
        <line x1={500} y1={legendeY - 4} x2={530} y2={legendeY - 4}
              stroke="var(--signal)" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x={538} y={legendeY} fontSize="11" fill="var(--wmc-muted)">
          die Verbindung, an der der Rest hängt
        </text>
      </g>,
    )
  } else if (bausteine.some((b) => b.traegt)) {
    teile.push(
      <g key="legende-traegt">
        <Marke x={500} y={legendeY - 8} zustand="geplant" rot />
        <text x={515} y={legendeY} fontSize="11" fill="var(--wmc-muted)">
          der Baustein, an dem der Rest hängt
        </text>
      </g>,
    )
  }

  return (
    <Figur
      titel="Systemlandschaft: Werkbank, Ablage und KI-Rechner im Haus, mit dem, was läuft, und dem, was entschieden ist"
      beschriftung={
        `Gefüllt: läuft. Leer: vorhanden, noch nicht im Einsatz. Gestrichelt: entschieden, nicht gebaut. ` +
        `Stand ${datum(l.stand)}. Die eigene Hardware ist am ${datum(l.rechnerAufgenommen)} aufgenommen ` +
        `und am ${datum(l.rechnerBestaetigt)} als unverändert bestätigt.`
      }
      viewBox={`0 0 ${BREITE} ${legendeY + 8}`}
    >
      {teile}
    </Figur>
  )
}
