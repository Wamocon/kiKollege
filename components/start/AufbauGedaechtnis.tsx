import { daten, datum } from '@/lib/daten'
import { GEDAECHTNIS, WISSEN } from '@/lib/gedaechtnis'

/** Wie das Gedächtnis funktioniert: links das Wissen, das Menschen schreiben, rechts das
 *  Gedächtnis, das beim Arbeiten wächst, dazwischen der Rückweg: Ein Befund geht an einen
 *  Menschen, und was er als Fehlalarm markiert, geht zurück in die Regel. */

const HALTE = ['Befund', 'Mensch bewertet', 'Regel geschärft', 'nächster Lauf']
const X = 260
const Y = 150
const RADIUS = 100

export function AufbauGedaechtnis() {
  const teil = daten.anatomie.teile.find((t) => t.id === 'gedaechtnis')
  const b = daten.bewertungen
  const platz = (i: number) => {
    const w = ((-90 + i * 90) * Math.PI) / 180
    return { x: X + RADIUS * Math.cos(w), y: Y + RADIUS * Math.sin(w) }
  }
  return (
    <div className="lb-gedaechtnis">
      <div className="lb-speicher wissen" data-lb-reveal>
        <p className="lb-speicher-name">{WISSEN.titel}</p>
        <p className="lb-speicher-satz">{WISSEN.untertitel}</p>
        <ul>
          {WISSEN.punkte.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <figure className="lb-rueckweg" data-lb-reveal>
        <svg viewBox="-40 0 600 300" role="img" aria-label={`Der Rückweg: ${HALTE.join(', ')}, und wieder von vorn`}>
          <circle className="lb-rueckweg-bahn" cx={X} cy={Y} r={RADIUS} />
          <circle className="lb-rueckweg-punkt" cx={X} cy={Y - RADIUS} r={9} />
          {HALTE.map((h, i) => {
            const p = platz(i)
            return (
              <g key={h}>
                <circle className="lb-rueckweg-halt" cx={p.x} cy={p.y} r={7} />
                <text x={p.x} y={i === 0 ? p.y - 18 : i === 2 ? p.y + 32 : p.y + 6} dx={i === 1 ? 18 : i === 3 ? -18 : 0} textAnchor={i === 1 ? 'start' : i === 3 ? 'end' : 'middle'}>
                  {h}
                </text>
              </g>
            )
          })}
        </svg>
        <figcaption>{teil ? teil.text.split('. ').slice(1, 2).join('') + '.' : null}</figcaption>
      </figure>
      <div className="lb-speicher gedaechtnis" data-lb-reveal>
        <p className="lb-speicher-name">{GEDAECHTNIS.titel}</p>
        <p className="lb-speicher-satz">{GEDAECHTNIS.untertitel}</p>
        <ul>
          {GEDAECHTNIS.punkte.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <p className="lb-gedaechtnis-zahl" data-lb-reveal>
        Bewertet sind {b.bewertet} Befunde zu {b.regeln} Regeln; belastbar gemessen ist die Fehlalarmquote bei {b.regelnAmZiel === 1 ? 'einer' : b.regelnAmZiel}, Stand {datum(b.stand)}.
      </p>
    </div>
  )
}
