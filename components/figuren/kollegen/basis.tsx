import type { ReactNode } from 'react'

import './kollegen.css'

/** Gemeinsame Bausteine der Figuren für die KI-Kollegen.
 *
 *  Zwei Stile: Linie (Strichzeichnung mit Gesicht) und isometrisch (Dinge auf
 *  einem Tisch). Farben nur aus den CI-Tokens. Rot trägt in jedem Bild genau
 *  ein Motiv: das, was der Kollege weitergibt; in der Grenze ist es die rote
 *  gestrichelte Linie, die er nicht überschreitet.
 *
 *  Bilder mit Gesicht liegen auf Papier (`papier`, `Rund`): Im dunklen Thema
 *  behalten sie ihre hellen Farben, sonst bekämen sie weißes Haar und ein
 *  dunkles Gesicht. Isometrische Bilder kehren sich mit dem Thema um. */

export const TINTE = 'var(--k-tinte, var(--wmc-ink))'
export const GRUND = 'var(--k-grund, var(--wmc-bg))'
export const ROT = 'var(--k-rot, var(--signal))'
export const LEISE = 'var(--k-leise, var(--wmc-muted))'
export const FLAECHE = 'var(--k-flaeche, var(--flaeche-stark))'
export const RAND = 'var(--k-rand, var(--wmc-border))'

/** Mit `papier` behält die Figur im dunklen Thema ihre hellen Farben und liegt
 *  auf hellem Papier. Sonst kehren sich Haar und Gesicht um. */
export function Bild({ children, titel, rahmen = '0 0 320 240', papier = false }: { children: ReactNode; titel: string; rahmen?: string; papier?: boolean }) {
  const [x, y, b, h] = rahmen.split(' ').map(Number)
  return (
    <svg viewBox={rahmen} className={papier ? 'k-bild k-papier' : 'k-bild'} role="img" aria-label={titel}>
      {papier ? <rect x={x} y={y} width={b} height={h} rx={b / 22} fill="var(--k-papier)" /> : null}
      {children}
    </svg>
  )
}

/** Umriss des Kopfes, nach rechts gewandt. Alle Figuren teilen ihn. */
export const KOPF =
  'M152 56 C126 46 100 60 98 86 C96 108 108 126 126 132 C136 135 148 134 156 126 C158 124 160 122 162 119 C168 118 171 114 171 108 C174 108 177 106 176 103 L170 90 C172 76 166 62 152 56 Z'

export const LINIE = { fill: 'none', stroke: TINTE, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

/** Kopf mit Ohr; Haar und Bart kommen als Flächen innerhalb des Umrisses dazu. */
export function Kopf({ id, flaechen }: { id: string; flaechen: ReactNode }) {
  return (
    <g>
      <clipPath id={`${id}-kopf`}>
        <path d={KOPF} />
      </clipPath>
      <path d={KOPF} fill={GRUND} stroke="none" />
      <g clipPath={`url(#${id}-kopf)`}>{flaechen}</g>
      <path d={KOPF} />
      <path d="M114 92 C108 86 102 94 106 101 C108 105 113 105 115 102" fill={GRUND} />
    </g>
  )
}

/** Schultern und Oberkörper bis zur Tischkante */
export const RUMPF = 'M126 146 C102 150 86 170 84 198 H196 C196 186 194 178 192 172 C188 158 176 146 156 142 Z'

/** Rund und auf Papier wie die Linie: Im dunklen Thema bleibt das Gesicht hell. */
export function Rund({ titel, id, children }: { titel: string; id: string; children: ReactNode }) {
  return (
    <svg viewBox="75 34 128 128" className="k-bild k-papier" role="img" aria-label={titel}>
      <clipPath id={id}>
        <circle cx="139" cy="98" r="63" />
      </clipPath>
      <circle cx="139" cy="98" r="63" fill="var(--k-papier)" />
      <g clipPath={`url(#${id})`}>
        <circle cx="139" cy="98" r="63" fill={FLAECHE} />
        <g {...LINIE} strokeWidth="2.4">
          {children}
        </g>
      </g>
      <circle cx="139" cy="98" r="62" fill="none" stroke={TINTE} strokeWidth="2.5" />
    </svg>
  )
}

// Isometrie -----------------------------------------------------------------

const MX = 150
const MY = 70
/** Ein Punkt im Raum auf das Blatt: x läuft nach rechts unten, y nach links
 *  unten, z nach oben. */
export function iso(x: number, y: number, z = 0): [number, number] {
  const r = (n: number) => Math.round(n * 10) / 10
  return [r(MX + (x - y) * 0.866), r(MY + (x + y) * 0.5 - z)]
}
export const punkte = (...p: [number, number, number][]) => p.map(([x, y, z]) => iso(x, y, z).join(',')).join(' ')
export const STRICH = { stroke: TINTE, strokeWidth: 1.6, strokeLinejoin: 'round' as const }

/** Ein Quader mit den drei sichtbaren Seiten: oben, vorn links, vorn rechts. */
export function Quader({ x, y, z, b, t, h, oben = GRUND, links = FLAECHE, rechts = RAND }: {
  x: number; y: number; z: number; b: number; t: number; h: number; oben?: string; links?: string; rechts?: string
}) {
  return (
    <g>
      <polygon {...STRICH} fill={links} points={punkte([x, y + t, z], [x + b, y + t, z], [x + b, y + t, z + h], [x, y + t, z + h])} />
      <polygon {...STRICH} fill={rechts} points={punkte([x + b, y, z], [x + b, y + t, z], [x + b, y + t, z + h], [x + b, y, z + h])} />
      <polygon {...STRICH} fill={oben} points={punkte([x, y, z + h], [x + b, y, z + h], [x + b, y + t, z + h], [x, y + t, z + h])} />
    </g>
  )
}

/** Punkte eines Kreises in der Ebene z, von Winkel a bis b */
export function bogen(x: number, y: number, z: number, r: number, a = 0, b = Math.PI * 2, n = 36) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const w = a + ((b - a) * i) / n
    return iso(x + r * Math.cos(w), y + r * Math.sin(w), z)
  })
}
export const liste = (p: [number, number][]) => p.map((q) => q.join(',')).join(' ')

/** Ein stehender Zylinder: sichtbar ist die vordere Hälfte und der Deckel. */
export function Zylinder({ x, y, z, r, h, seite = GRUND, deckel = GRUND }: { x: number; y: number; z: number; r: number; h: number; seite?: string; deckel?: string }) {
  const vorn = [-Math.PI / 4, (Math.PI * 3) / 4] as const
  const oben = bogen(x, y, z + h, r, vorn[0], vorn[1])
  const unten = bogen(x, y, z, r, vorn[0], vorn[1]).reverse()
  return (
    <g {...STRICH}>
      <polygon fill={seite} points={liste([...oben, ...unten])} />
      <polygon fill={deckel} points={liste(bogen(x, y, z + h, r))} />
    </g>
  )
}

export function Strich({ von, bis, z }: { von: [number, number]; bis: [number, number]; z: number }) {
  const [x1, y1] = iso(von[0], von[1], z)
  const [x2, y2] = iso(bis[0], bis[1], z)
  return <line x1={x1} y1={y1} x2={x2} y2={y2} />
}

/** Höhe der Tischplatte, auf der jeder Arbeitsplatz steht */
export const ZT = 12

/** Eine Fläche in der senkrechten Ebene y = konstant (die linke Vorderseite) */
export function flaecheY(y: number, x1: number, x2: number, z1: number, z2: number) {
  return punkte([x1, y, z1], [x2, y, z1], [x2, y, z2], [x1, y, z2])
}