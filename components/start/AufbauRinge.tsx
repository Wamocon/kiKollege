/** Der Aufbau eines KI-Mitarbeiters im Schnitt: in der Mitte das Sprachmodell, darum die
 *  vier Teile, die ein Mensch aufschreibt, ganz außen die Aufsicht. Beim Lesen hebt
 *  Bewegung.tsx den Ring hervor, dessen Zeile gerade dran ist. */

const GROESSE = 560
const MITTE = GROESSE / 2
const RADIEN = [122, 166, 210, 254]

/** Obere Hälfte eines Kreises, an der die Beschriftung entlangläuft */
const bogen = (r: number) => `M ${MITTE - r} ${MITTE} A ${r} ${r} 0 0 1 ${MITTE + r} ${MITTE}`

export function AufbauRinge({
  kern,
  teile,
}: {
  kern: { titel: string; zusatz: string }
  teile: { id: string; titel: string }[]
}) {
  return (
    <figure className="lb-ringe" data-lb-ringe>
      <svg
        viewBox={`0 0 ${GROESSE} ${GROESSE}`}
        role="img"
        aria-label={`${kern.titel} in der Mitte, darum von innen nach außen: ${teile.map((t) => t.titel).join(', ')}`}
      >
        {teile.map((t, i) => (
          <g className="lb-ring" data-lb-ring={i} key={t.id}>
            <circle cx={MITTE} cy={MITTE} r={RADIEN[i]} />
            <path id={`lb-ring-${t.id}`} d={bogen(RADIEN[i] - 4)} fill="none" />
            <text>
              <textPath href={`#lb-ring-${t.id}`} startOffset="50%" textAnchor="middle">
                {String(i + 1).padStart(2, '0')} {t.titel}
              </textPath>
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="lb-ringe-kern">
        <b>{kern.titel}</b>
        <span>{kern.zusatz}</span>
      </figcaption>
    </figure>
  )
}
