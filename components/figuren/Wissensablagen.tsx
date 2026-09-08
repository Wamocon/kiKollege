import { daten, datum } from '@/lib/daten'
import { Bereich, Figur, Kasten } from './gemeinsam'

/** Warum es zwei Ablagen braucht: Das Fachwissen hängt am Gegenstand und ist
 *  nicht übertragbar, das Wissen über das Unternehmen teilen sich alle. Rot
 *  markiert die gemeinsame Ablage, weil sie der Punkt der Figur ist. */
export function Wissensablagen() {
  const w = daten.wissensablagen
  const links = 0
  const rechts = 500
  const breite = 460

  return (
    <Figur
      viewBox="0 0 960 320"
      titel="Jeder KI-Mitarbeiter baut sein Fachwissen selbst auf. Das Wissen über das Unternehmen liegt einmal und wird von allen geteilt."
      beschriftung={`Die gemeinsame Ablage ist seit dem ${datum(w.gemeinsam.angelegtAm)} angelegt und ${w.gemeinsam.stand}. ${w.gemeinsam.offeneFragen} Fragen warten auf eine Antwort, ${w.gemeinsam.haltenFreigabeAuf} davon halten jede Freigabe auf.`}
    >
      <Kasten x={links} y={20} breite={breite} hoehe={56}
              titel="KI-Mitarbeiter" zusatz="prüft Schulungsunterlagen" gefuellt />
      <Kasten x={rechts} y={20} breite={breite} hoehe={56}
              titel="der nächste" zusatz="andere Aufgabe" gestrichelt />

      {[links, rechts].map((x, i) => (
        <g key={x}>
          <line x1={x + breite / 2} y1={80} x2={x + breite / 2} y2={110}
                stroke="var(--wmc-ink)" strokeWidth="1.5" markerEnd="url(#spitze)" />
          <Kasten x={x} y={116} breite={breite} hoehe={56}
                  titel="sein Fachwissen"
                  zusatz={i === 0 ? w.eigen.hinweis : 'baut er selbst auf'}
                  gestrichelt={i === 1} />
          <line x1={x + breite / 2} y1={176} x2={x + breite / 2} y2={222}
                stroke="var(--wmc-primary)" strokeWidth="1.5" markerEnd="url(#spitze-rot)" />
        </g>
      ))}

      <Bereich x={0} y={206} breite={960} text="teilen sich alle" />

      <rect x={0} y={230} width={960} height={64}
            fill="var(--wmc-surface-soft)" stroke="var(--wmc-primary)" strokeWidth="1" />
      <text x={480} y={258} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--wmc-ink)">
        {w.gemeinsam.titel}
      </text>
      <text x={480} y={277} textAnchor="middle" fontSize="11" fill="var(--wmc-muted)">
        {w.gemeinsam.inhalt}
      </text>
    </Figur>
  )
}
