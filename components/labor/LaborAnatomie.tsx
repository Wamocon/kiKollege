import type { AnatomieTeil } from '@/lib/daten'

/* Dieselbe Zeichnung wie HeroAnatomie, für die rechte Spalte des Heros gestellt
   statt quer: Die vier Teile stehen über und unter dem Kern. Ohne Scrollbezug,
   alle Teile gleich hell, damit sie neben der Überschrift ruhig steht. */
const B = 480
const H = 380
const TEIL = { breite: 190, hoehe: 60 }
const KERN = { x: 140, y: 152, breite: 200, hoehe: 76 }
const PLATZ = [
  { x: 0, y: 0, von: [95, 60], nach: [190, KERN.y] },
  { x: 290, y: 0, von: [385, 60], nach: [290, KERN.y] },
  { x: 0, y: 320, von: [95, 320], nach: [190, KERN.y + KERN.hoehe] },
  { x: 290, y: 320, von: [385, 320], nach: [290, KERN.y + KERN.hoehe] },
]

export function LaborAnatomie({
  kern,
  teile,
}: {
  kern: { titel: string; zusatz: string }
  teile: AnatomieTeil[]
}) {
  return (
    <figure className="lab-anatomie">
      <svg
        viewBox={`0 0 ${B} ${H}`}
        role="img"
        aria-label={`Ein Sprachmodell wird zum KI-Mitarbeiter durch vier Dinge: ${teile
          .map((t) => t.titel)
          .join(', ')}.`}
      >
        <defs>
          <marker id="lab-spitze" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--signal)" />
          </marker>
        </defs>

        {teile.slice(0, PLATZ.length).map((teil, i) => {
          const p = PLATZ[i]
          return (
            <g key={teil.id}>
              <line x1={p.von[0]} y1={p.von[1]} x2={p.nach[0]} y2={p.nach[1]}
                    stroke="var(--signal)" strokeWidth="1.5" markerEnd="url(#lab-spitze)" />
              <rect x={p.x + 0.75} y={p.y + 0.75} width={TEIL.breite - 1.5} height={TEIL.hoehe - 1.5}
                    fill="var(--wmc-bg)" stroke="var(--signal)" strokeWidth="1.5" />
              <text x={p.x + TEIL.breite / 2} y={p.y + 27} textAnchor="middle"
                    fontSize="15" fontWeight="700" fill="var(--wmc-ink)">
                {teil.titel}
              </text>
              <text x={p.x + TEIL.breite / 2} y={p.y + 46} textAnchor="middle"
                    fontSize="12.5" fill="var(--wmc-muted)">
                {teil.kurz}
              </text>
            </g>
          )
        })}

        <rect x={KERN.x} y={KERN.y} width={KERN.breite} height={KERN.hoehe} fill="var(--wmc-ink)" />
        <text x={KERN.x + KERN.breite / 2} y={KERN.y + 34} textAnchor="middle"
              fontSize="16" fontWeight="800" fill="var(--wmc-bg)">
          {kern.titel}
        </text>
        <text x={KERN.x + KERN.breite / 2} y={KERN.y + 55} textAnchor="middle"
              fontSize="12.5" fill="var(--wmc-bg)" opacity="0.75">
          {kern.zusatz}
        </text>
      </svg>
    </figure>
  )
}
