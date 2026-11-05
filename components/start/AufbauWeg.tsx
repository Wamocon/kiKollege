/** Der Weg eines Auftrags: von der Nachricht über die Schleife aus Qwen, Zaun und Werkzeug
 *  zur Karte und zurück. Beim Scrollen läuft ein Punkt ihn ab (Bewegung.tsx); ohne Bewegung
 *  stehen alle Schritte untereinander. Die Plätze gelten für die sieben Schritte der Daten,
 *  in ihrer Reihenfolge. */

const PLAETZE: { x: number; y: number; anker: 'middle' | 'start' | 'end'; dx: number; dy: number }[] = [
  { x: 90, y: 190, anker: 'middle', dx: 0, dy: -24 },
  { x: 300, y: 190, anker: 'middle', dx: 0, dy: -24 },
  { x: 600, y: 70, anker: 'middle', dx: 0, dy: -24 },
  { x: 704, y: 250, anker: 'start', dx: 20, dy: 6 },
  { x: 496, y: 250, anker: 'end', dx: -20, dy: 6 },
  { x: 900, y: 190, anker: 'middle', dx: 0, dy: -24 },
  { x: 1110, y: 190, anker: 'middle', dx: 0, dy: -24 },
]

/** Die Stücke des Wegs in der Reihenfolge, in der der Punkt sie abläuft. Auf dem letzten
 *  bleibt „Zurück“ dran: Das Ergebnis ist auf dem Weg zum Menschen. */
const STUECKE: { von: number; zu: number; d: string }[] = [
  { von: 0, zu: 1, d: 'M90 190 L300 190' },
  { von: 1, zu: 2, d: 'M300 190 C420 190 470 70 600 70' },
  { von: 2, zu: 3, d: 'M600 70 A120 120 0 0 1 704 250' },
  { von: 3, zu: 4, d: 'M704 250 A120 120 0 0 1 496 250' },
  { von: 4, zu: 2, d: 'M496 250 A120 120 0 0 1 600 70' },
  { von: 2, zu: 5, d: 'M600 70 C730 70 780 190 900 190' },
  { von: 5, zu: 6, d: 'M900 190 L1110 190' },
  { von: 6, zu: 6, d: 'M1110 190 C1110 420 90 420 90 190' },
]

export function AufbauWeg({
  schritte,
  beschriftung,
}: {
  schritte: { titel: string; text: string }[]
  beschriftung: string
}) {
  return (
    <figure className="lb-weg" data-lb-weg>
      <svg
        viewBox="0 0 1200 400"
        role="img"
        aria-label={`Der Weg eines Auftrags: ${schritte.map((s) => s.titel).join(', ')}`}
      >
        {STUECKE.map((s) => (
          <path className="lb-weg-linie" d={s.d} key={s.d} data-lb-weg-stueck data-von={s.von} data-zu={s.zu} />
        ))}
        {STUECKE.map((s) => (
          <path className="lb-weg-spur" d={s.d} key={s.d} pathLength={1} data-lb-weg-spur />
        ))}
        <text className="lb-weg-schleife" x={600} y={196}>
          Schleife
        </text>
        {schritte.map((s, i) => (
          <g className="lb-weg-knoten" key={s.titel} data-lb-weg-knoten={i}>
            <circle cx={PLAETZE[i].x} cy={PLAETZE[i].y} r={9} />
            <text x={PLAETZE[i].x + PLAETZE[i].dx} y={PLAETZE[i].y + PLAETZE[i].dy} textAnchor={PLAETZE[i].anker}>
              {s.titel}
            </text>
          </g>
        ))}
        <g className="lb-weg-punkt" transform={`translate(${PLAETZE[0].x} ${PLAETZE[0].y})`}>
          <circle r={18} />
          <circle r={7} />
        </g>
      </svg>
      <ol className="lb-weg-schritte">
        {schritte.map((s, i) => (
          <li key={s.titel} data-lb-weg-schritt={i}>
            <span className="lb-teil-nr">{String(i + 1).padStart(2, '0')}</span>
            <b>{s.titel}</b>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
      <figcaption>{beschriftung}</figcaption>
    </figure>
  )
}
