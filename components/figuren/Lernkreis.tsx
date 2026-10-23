import { daten } from '@/lib/daten'

/** Der Lernkreis in fünf Schritten, im Uhrzeigersinn. Ein Punkt läuft den Kreis
 *  ab, der Schritt, an dem er gerade ist, leuchtet auf: Die Bewegung zeigt die
 *  Reihenfolge und dass es nach dem fünften wieder beim ersten weitergeht. Bei
 *  reduzierter Bewegung steht der Kreis still, alle Schritte gleich hell.
 *  Rot trägt nur, was sich bewegt: der Punkt und der Schritt, an dem er ist.
 *  Nach dem bewegten Lernkreis im OnePager zum Trainingskonzept vom 22.10.,
 *  hier in den Tokens der Seite. */

const MITTE = { x: 300, y: 265 }
const RADIUS = 185
const KASTEN = { breite: 196, hoehe: 62 }

/** Der Mittelpunkt des i-ten von n Schritten, oben beginnend. */
function punkt(i: number, n: number) {
  const winkel = (i / n) * 2 * Math.PI
  return { x: MITTE.x + RADIUS * Math.sin(winkel), y: MITTE.y - RADIUS * Math.cos(winkel) }
}

export function LernkreisFigur() {
  const t = daten.training
  const n = t.kreis.length
  const dauer = n * 2

  return (
    <figure className="lp-figur lp-diagramm lp-lernkreis" tabIndex={0}>
      <p className="lp-diagramm-hinweis" aria-hidden="true">
        Breiter als der Bildschirm: seitlich verschieben.
      </p>
      <svg
        viewBox="0 0 600 500"
        role="img"
        aria-label={`Der Lernkreis in ${n} Schritten im Uhrzeigersinn: ${t.kreis
          .map((s, i) => `${i + 1} ${s.titel}`)
          .join(', ')}, dann wieder ${t.kreis[0].titel}. In der Mitte: ${t.kreisMitte.gross}, ${t.kreisMitte.zeilen.join(' ')}.`}
        style={{ ['--lk-dauer' as string]: `${dauer}s` }}
      >
        <circle cx={MITTE.x} cy={MITTE.y} r={RADIUS} fill="none" stroke="var(--wmc-border)" strokeWidth="1.5" />

        {/* Pfeile in Laufrichtung, je zwischen zwei Schritten */}
        {t.kreis.map((s, i) => {
          const p = punkt(i + 0.5, n)
          const grad = ((i + 0.5) / n) * 360 + 90
          return (
            <path key={`pfeil-${s.titel}`} d="M -5 -6 L 2 0 L -5 6" fill="none"
                  stroke="var(--wmc-muted)" strokeWidth="1.6"
                  transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${grad.toFixed(0)})`} />
          )
        })}

        {/* Der Läufer, unter den Kästen, damit er zwischen ihnen sichtbar wird */}
        <g className="lp-lk-laeufer">
          <circle cx={MITTE.x} cy={MITTE.y - RADIUS} r="15" fill="var(--signal)" opacity="0.18" />
          <circle cx={MITTE.x} cy={MITTE.y - RADIUS} r="7" fill="var(--signal)" />
        </g>

        {t.kreis.map((s, i) => {
          const p = punkt(i, n)
          const x = p.x - KASTEN.breite / 2
          const y = p.y - KASTEN.hoehe / 2
          return (
            <g key={s.titel} className="lp-lk-schritt">
              {/* leuchtet auf, kurz bevor der Punkt ankommt, bis kurz danach */}
              <rect x={x} y={y} width={KASTEN.breite} height={KASTEN.hoehe} style={{ animationDelay: `${i * 2 - 0.6}s` }} />
              <text x={x + 14} y={y + 24} fontSize="13" fontWeight="700" fill="var(--wmc-muted)">
                {i + 1}
              </text>
              <text x={x + 30} y={y + 25} fontSize="15" fontWeight="700" fill="var(--wmc-ink)">
                {s.titel}
              </text>
              <text x={x + 14} y={y + 47} fontSize="12.5" fill="var(--wmc-muted)">
                {s.kurz}
              </text>
            </g>
          )
        })}

        <text x={MITTE.x} y={MITTE.y - 12} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--wmc-ink)">
          {t.kreisMitte.gross}
        </text>
        {t.kreisMitte.zeilen.map((z, i) => (
          <text key={z} x={MITTE.x} y={MITTE.y + 12 + i * 18} textAnchor="middle" fontSize="13" fill="var(--wmc-muted)">
            {z}
          </text>
        ))}
        <text x={MITTE.x} y={MITTE.y + 20 + t.kreisMitte.zeilen.length * 18} textAnchor="middle" fontSize="13"
              fontWeight="700" fill="var(--wmc-ink)">
          {t.kreisMitte.hinweis}
        </text>
      </svg>
      <figcaption>{t.kreisBeschriftung}</figcaption>
    </figure>
  )
}
