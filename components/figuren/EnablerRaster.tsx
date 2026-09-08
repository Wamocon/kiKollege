import { daten, zahl } from '@/lib/daten'

const SPALTEN = 24
const KANTE = 10
const LUECKE = 4
const SCHRITT = KANTE + LUECKE

/**
 * Ein Feld aus einer Zelle je Enabler. Gefüllt heißt vollständig ausgestattet.
 * Die Zellen stehen in fester Reihenfolge, gefüllte zuerst: Eine gestreute
 * Anordnung würde eine Verteilung über die Themenkomplexe behaupten, die nicht
 * gemessen ist.
 */
export function EnablerRaster() {
  const { enabler, enablerVollstaendig, themenkomplexe, dateien } = daten.gegenstand
  const zeilen = Math.ceil(enabler / SPALTEN)
  const breite = SPALTEN * SCHRITT - LUECKE
  const hoehe = zeilen * SCHRITT - LUECKE

  return (
    <figure className="lp-figur">
      <svg
        viewBox={`0 0 ${breite} ${hoehe}`}
        role="img"
        aria-label={`${enabler} Enabler, davon ${enablerVollstaendig} vollständig ausgestattet.`}
      >
        {Array.from({ length: enabler }, (_, i) => {
          const voll = i < enablerVollstaendig
          return (
            <rect
              key={i}
              x={(i % SPALTEN) * SCHRITT}
              y={Math.floor(i / SPALTEN) * SCHRITT}
              width={KANTE}
              height={KANTE}
              rx="1"
              fill={voll ? 'var(--wmc-ink)' : 'none'}
              stroke={voll ? 'none' : 'var(--ui300)'}
              strokeWidth="1"
            />
          )
        })}
      </svg>

      <p className="lp-legende">
        <span>
          <i className="voll" /> {zahl(enablerVollstaendig)} vollständig
        </span>
        <span>
          <i /> {zahl(enabler - enablerVollstaendig)} unvollständig
        </span>
      </p>

      <figcaption>
        Eine Zelle je Enabler. {zahl(enabler)} Enabler in {zahl(themenkomplexe)} Themenkomplexen,
        zusammen {zahl(dateien)} Dateien. Die Reihenfolge ist fest, nicht gestreut: Über die
        Verteilung der Lücken sagt das Feld nichts.
      </figcaption>
    </figure>
  )
}
