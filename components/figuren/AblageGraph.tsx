import type { ReactNode } from 'react'

import { inWorten } from '@/lib/alter'
import { daten, datum, zahl, type AblageBereich } from '@/lib/daten'
import { Figur } from './gemeinsam'

/** Der Graph der Ablage in einfacher Form: nicht jede Notiz als Punkt, sondern
 *  jeder Bereich als Kreis, und eine Linie, wo zwei Bereiche sich oft
 *  verweisen. Die Kreise stehen auf einer Ellipse in der Reihenfolge des
 *  Abbilds, die Linien biegen sich zur Mitte, damit sie sich nicht mit den
 *  Kreisen kreuzen. Rot ist der Bereich, auf den am meisten verwiesen wird.
 *  Alles kommt aus ablage.bereiche, Dateinamen kommen nicht vor. */

const BREITE = 900
const MITTE = { x: 450, y: 250 }
const RADIUS = { x: 250, y: 172 }
/** Weniger Verweise zeigt der Graph nicht als Linie, damit er lesbar bleibt. */
export const SCHWELLE = 10

export interface Verbindung {
  a: AblageBereich
  b: AblageBereich
  anzahl: number
}

/** Verweise zwischen zwei Bereichen, beide Richtungen zusammen. */
export function verbindungen(bereiche: AblageBereich[]): Verbindung[] {
  const liste: Verbindung[] = []
  bereiche.forEach((a, i) => {
    for (const b of bereiche.slice(i + 1)) {
      const anzahl = (a.verweiseNach[b.id] ?? 0) + (b.verweiseNach[a.id] ?? 0)
      if (anzahl) liste.push({ a, b, anzahl })
    }
  })
  return liste.sort((x, y) => y.anzahl - x.anzahl)
}

/** Wie oft auf einen Bereich verwiesen wird, aus allen anderen zusammen. */
export function eingehend(bereiche: AblageBereich[]): Map<string, number> {
  const summe = new Map(bereiche.map((b) => [b.id, 0]))
  for (const b of bereiche) {
    for (const [ziel, n] of Object.entries(b.verweiseNach)) summe.set(ziel, (summe.get(ziel) ?? 0) + n)
  }
  return summe
}

const kreisRadius = (notizen: number) => 6 + Math.sqrt(notizen) * 1.5

function Knoten({ b, x, y, rot }: { b: AblageBereich; x: number; y: number; rot: boolean }) {
  const r = kreisRadius(b.notizen)
  if (rot) return <circle cx={x} cy={y} r={r} fill="var(--signal)" />
  if (b.gruppe === 'gedaechtnis') {
    return <circle cx={x} cy={y} r={r - 0.75} fill="var(--wmc-bg)" stroke="var(--wmc-ink)" strokeWidth="1.5" />
  }
  if (b.gruppe === 'werkstatt') return <circle cx={x} cy={y} r={r} fill="var(--wmc-muted)" opacity="0.45" />
  return <circle cx={x} cy={y} r={r} fill="var(--wmc-ink)" />
}

export function AblageGraphFigur() {
  const a = daten.ablage
  const bereiche = a.bereiche
  const ein = eingehend(bereiche)
  const ziel = [...ein].sort((x, y) => y[1] - x[1])[0]
  const hub = bereiche.find((b) => b.id === ziel[0])!
  const alle = verbindungen(bereiche)
  const gezeigt = alle.filter((v) => v.anzahl >= SCHWELLE)

  const ort = new Map(
    bereiche.map((b, i) => {
      const winkel = -Math.PI / 2 + (i / bereiche.length) * 2 * Math.PI
      return [b.id, { x: MITTE.x + RADIUS.x * Math.cos(winkel), y: MITTE.y + RADIUS.y * Math.sin(winkel), winkel }]
    }),
  )
  const teile: ReactNode[] = []

  // Linien zuerst, damit die Kreise darüber liegen
  for (const v of [...gezeigt].reverse()) {
    const p = ort.get(v.a.id)!
    const q = ort.get(v.b.id)!
    const zug = 0.4
    const cx = MITTE.x + ((p.x + q.x) / 2 - MITTE.x) * zug
    const cy = MITTE.y + ((p.y + q.y) / 2 - MITTE.y) * zug
    teile.push(
      <path
        key={`${v.a.id}-${v.b.id}`}
        d={`M ${p.x} ${p.y} Q ${cx} ${cy} ${q.x} ${q.y}`}
        fill="none"
        stroke="var(--wmc-ink)"
        strokeOpacity="0.32"
        strokeWidth={0.8 + Math.sqrt(v.anzahl) * 0.6}
      />,
    )
  }

  for (const b of bereiche) {
    const { x, y, winkel } = ort.get(b.id)!
    const abstand = kreisRadius(b.notizen) + 8
    const cos = Math.cos(winkel)
    const sin = Math.sin(winkel)
    const anker = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle'
    // Seitlich steht die Beschriftung neben dem Kreis, oben und unten darüber
    // oder darunter, jeweils mit vollem Abstand.
    const lx = anker === 'middle' ? x : x + Math.sign(cos) * abstand
    const ly = anker === 'middle' ? y + Math.sign(sin) * (abstand + 4) + (sin > 0 ? 8 : 0) : y + 4
    const rot = b.id === hub.id
    teile.push(
      <g key={b.id}>
        <Knoten b={b} x={x} y={y} rot={rot} />
        <text x={lx} y={ly} textAnchor={anker} fontSize="12" fill="var(--wmc-ink)"
              fontWeight={rot ? 700 : 400}>
          <tspan fill={rot ? 'var(--wmc-primary-text)' : undefined}>{b.kurz}</tspan>
          <tspan fill="var(--wmc-muted)"> {zahl(b.notizen)}</tspan>
        </text>
      </g>,
    )
  }

  // Legende
  const ly = 478
  const legende: { art: 'wissen' | 'gedaechtnis' | 'werkstatt' | 'rot'; text: string; x: number }[] = [
    { art: 'wissen', text: 'Wissen', x: 0 },
    { art: 'gedaechtnis', text: 'Gedächtnis', x: 90 },
    { art: 'werkstatt', text: 'Werkstatt', x: 205 },
    { art: 'rot', text: 'das häufigste Ziel', x: 310 },
  ]
  for (const l of legende) {
    const probe: AblageBereich = { ...hub, gruppe: l.art === 'rot' ? 'wissen' : l.art, notizen: 4 }
    teile.push(
      <g key={`lg-${l.art}`}>
        <Knoten b={probe} x={l.x + 9} y={ly - 4} rot={l.art === 'rot'} />
        <text x={l.x + 24} y={ly} fontSize="11" fill="var(--wmc-muted)">{l.text}</text>
      </g>,
    )
  }
  teile.push(
    <g key="lg-linie">
      <line x1={480} y1={ly - 4} x2={520} y2={ly - 4} stroke="var(--wmc-ink)" strokeOpacity="0.32"
            strokeWidth={0.8 + Math.sqrt(SCHWELLE) * 0.6} />
      <line x1={530} y1={ly - 4} x2={570} y2={ly - 4} stroke="var(--wmc-ink)" strokeOpacity="0.32"
            strokeWidth={0.8 + Math.sqrt(alle[0]?.anzahl ?? SCHWELLE) * 0.6} />
      <text x={580} y={ly} fontSize="11" fill="var(--wmc-muted)">
        {SCHWELLE} bis {zahl(alle[0]?.anzahl ?? SCHWELLE)} Verweise zwischen zwei Bereichen
      </text>
    </g>,
  )

  return (
    <Figur
      titel={`Graph der Ablage: ${inWorten(bereiche.length)} Bereiche und die Verweise zwischen ihnen. Am häufigsten verwiesen wird auf den Bereich „${hub.name}“.`}
      beschriftung={
        `Jeder Kreis ist ein Bereich der Ablage, er wächst mit der Zahl seiner Notizen. Eine Linie verbindet zwei ` +
        `Bereiche, die sich zusammen mindestens ${SCHWELLE}-mal verweisen, je dicker, desto öfter; ` +
        `das sind ${inWorten(gezeigt.length)} von ${inWorten(alle.length)} Verbindungen. ` +
        `Rot ist der Bereich „${hub.name}“: Auf ihn zeigen ${zahl(ziel[1])} Verweise, mehr als auf jeden anderen. ` +
        `Gezählt am ${datum(a.gezaehltAm)}.`
      }
      viewBox={`0 0 ${BREITE} ${ly + 10}`}
    >
      {teile}
    </Figur>
  )
}

/** Dieselben Verbindungen als Liste, für alle, die das Bild nicht sehen. */
export function AblageGraphListe() {
  const alle = verbindungen(daten.ablage.bereiche)
  return (
    <details className="lp-details lp-luft-oben-klein">
      <summary>Alle Verbindungen als Liste</summary>
      <ol className="liste lp-luft-oben-klein">
        {alle.map((v) => (
          <li key={`${v.a.id}-${v.b.id}`} style={{ fontSize: '0.88rem' }}>
            {v.a.name} und {v.b.name}: {zahl(v.anzahl)}
            {v.anzahl === 1 ? ' Verweis' : ' Verweise'}
          </li>
        ))}
      </ol>
    </details>
  )
}
