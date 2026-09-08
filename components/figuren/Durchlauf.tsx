import { daten } from '@/lib/daten'
import { Figur, Kasten } from './gemeinsam'

const BREITE = 168
const LUECKE = 30
const OBEN = 26
const HOEHE = 68

/** Der Weg eines Auftrags, und der Rückweg, über den aus einer Bewertung eine
 *  schärfere Regel wird. Der Rückweg ist das einzige rote Element: Er ist der
 *  Mechanismus, durch den der Mitarbeiter über die Zeit besser wird. */
export function Durchlauf() {
  const s = daten.durchlauf.schritte
  const x = (i: number) => i * (BREITE + LUECKE)
  const mitte = (i: number) => x(i) + BREITE / 2
  const unten = OBEN + HOEHE

  return (
    <Figur
      viewBox="0 0 960 210"
      titel={`Ein Auftrag läuft in ${s.length} Schritten durch: ${s.map((t) => t.name).join(', ')}. Die Bewertung des Menschen geht zurück an die maschinelle Stufe und schärft die Regel.`}
      beschriftung="Zwei Prüfstufen hintereinander, weil sie Verschiedenes finden. Der gestrichelte Weg zurück ist der einzige Mechanismus, durch den der Maßstab besser wird."
    >
      {s.map((schritt, i) => (
        <g key={schritt.name}>
          <Kasten
            x={x(i)} y={OBEN} breite={BREITE} hoehe={HOEHE}
            titel={schritt.name} zusatz={schritt.zusatz}
            gefuellt={i === s.length - 1}
          />
          {i < s.length - 1 ? (
            <line
              x1={x(i) + BREITE + 4} y1={OBEN + HOEHE / 2}
              x2={x(i + 1) - 4} y2={OBEN + HOEHE / 2}
              stroke="var(--wmc-ink)" strokeWidth="1.5" markerEnd="url(#spitze)"
            />
          ) : null}
        </g>
      ))}

      {/* Rückweg: von der Entscheidung zurück an die maschinelle Stufe */}
      <path
        d={`M ${mitte(4)} ${unten + 6} V 160 H ${mitte(1)} V ${unten + 10}`}
        fill="none" stroke="var(--wmc-primary)" strokeWidth="1.5"
        strokeDasharray="5 4" markerEnd="url(#spitze-rot)"
      />
      <text x={mitte(2) + BREITE / 2} y={176} textAnchor="middle" fontSize="11"
            fill="var(--wmc-primary-text)" fontWeight="700">
        berechtigt oder Fehlalarm? Die Bewertung schärft die Regel
      </text>
    </Figur>
  )
}
