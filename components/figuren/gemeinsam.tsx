import type { ReactNode } from 'react'

/** Bausteine, die alle vier Diagramme teilen. Farben kommen aus den CI-Tokens,
 *  damit sie in beiden Themen mitwandern; Rot bleibt dem einen Element
 *  vorbehalten, um das es in der jeweiligen Figur geht. */

export const KASTEN = { fuellung: 'var(--wmc-bg)', rand: 'var(--wmc-border)' }

export function Pfeilspitzen() {
  return (
    <defs>
      <marker id="spitze" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--wmc-ink)" />
      </marker>
      <marker id="spitze-rot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--signal)" />
      </marker>
    </defs>
  )
}

export function Kasten({
  x, y, breite, hoehe, titel, zusatz, gefuellt = false, gestrichelt = false,
}: {
  x: number; y: number; breite: number; hoehe: number
  titel: string; zusatz?: string; gefuellt?: boolean; gestrichelt?: boolean
}) {
  const text = gefuellt ? 'var(--wmc-bg)' : 'var(--wmc-ink)'
  const leise = gefuellt ? 'var(--wmc-bg)' : 'var(--wmc-muted)'
  const mitte = x + breite / 2
  return (
    <g>
      <rect
        x={x} y={y} width={breite} height={hoehe}
        fill={gefuellt ? 'var(--wmc-ink)' : KASTEN.fuellung}
        stroke={gefuellt ? 'none' : KASTEN.rand}
        strokeWidth="1"
        strokeDasharray={gestrichelt ? '4 3' : undefined}
      />
      <text x={mitte} y={zusatz ? y + hoehe / 2 - 2 : y + hoehe / 2 + 5}
            textAnchor="middle" fontSize="13" fontWeight="700" fill={text}>
        {titel}
      </text>
      {zusatz ? (
        <text x={mitte} y={y + hoehe / 2 + 16} textAnchor="middle" fontSize="11"
              fill={leise} opacity={gefuellt ? 0.8 : 1}>
          {zusatz}
        </text>
      ) : null}
    </g>
  )
}

export function Figur({
  titel, beschriftung, viewBox, children,
}: {
  titel: string; beschriftung: string; viewBox: string; children: ReactNode
}) {
  return (
    // tabIndex: Auf schmalen Schirmen ist die Figur breiter als der Rahmen und
    // wird seitlich verschoben. Das muss auch ohne Maus gehen.
    <figure className="lp-figur lp-diagramm" tabIndex={0}>
      <p className="lp-diagramm-hinweis" aria-hidden="true">
        Breiter als der Bildschirm: seitlich verschieben.
      </p>
      <svg viewBox={viewBox} role="img" aria-label={titel}>
        <Pfeilspitzen />
        {children}
      </svg>
      <figcaption>{beschriftung}</figcaption>
    </figure>
  )
}

/** Zeilenbeschriftung über einem Bereich, mit Haarlinie darunter. */
export function Bereich({ x, y, breite, text }: { x: number; y: number; breite: number; text: string }) {
  return (
    <g>
      <text x={x} y={y} fontSize="10.5" fontWeight="700" letterSpacing="1.4"
            fill="var(--wmc-muted)">
        {text.toUpperCase()}
      </text>
      <line x1={x} y1={y + 8} x2={x + breite} y2={y + 8} stroke="var(--rand-leise)" strokeWidth="1" />
    </g>
  )
}
