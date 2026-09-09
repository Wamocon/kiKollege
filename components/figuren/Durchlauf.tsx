import { daten } from '@/lib/daten'
import { Figur, Kasten } from './gemeinsam'

const BREITE = 168
const LUECKE = 30
const SCHRITT = BREITE + LUECKE
const OBEN = 26
const HOEHE = 68
const UNTEN = OBEN + HOEHE
const RUECKWEG = 160

/** Der Weg eines Auftrags, und der Rückweg, über den aus einer Bewertung eine
 *  schärfere Regel wird. Der Rückweg ist das einzige rote Element: Er ist der
 *  Mechanismus, durch den der Mitarbeiter über die Zeit besser wird.
 *
 *  Alle Masse leiten sich aus der Schrittliste ab. Kommt ein Schritt dazu oder
 *  faellt einer weg, wandert die Zeichnung mit, statt still zu verrutschen. */
export function Durchlauf() {
  const s = daten.durchlauf.schritte
  const x = (i: number) => i * SCHRITT
  const mitte = (i: number) => x(i) + BREITE / 2

  const beiId = (id: string) => s.findIndex((t) => t.id === id)
  const entscheidet = beiId('mensch')
  const maschinell = beiId('maschinell')

  const breite = s.length * SCHRITT - LUECKE
  const hoehe = RUECKWEG + 50

  return (
    <Figur
      viewBox={`0 0 ${breite} ${hoehe}`}
      titel={`Ein Auftrag läuft in ${s.length} Schritten durch: ${s.map((t) => t.name).join(', ')}. Die Bewertung des Menschen geht zurück an die maschinelle Stufe und schärft die Regel.`}
      beschriftung="Zwei Prüfstufen hintereinander, weil sie Verschiedenes finden. Der gestrichelte Weg zurück ist der einzige Mechanismus, durch den der Maßstab besser wird."
    >
      {s.map((schritt, i) => (
        <g key={schritt.id}>
          <Kasten
            x={x(i)} y={OBEN} breite={BREITE} hoehe={HOEHE}
            titel={schritt.name} zusatz={schritt.zusatz}
            gefuellt={i === entscheidet}
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

      {entscheidet >= 0 && maschinell >= 0 ? (
        <g>
          <path
            d={`M ${mitte(entscheidet)} ${UNTEN + 6} V ${RUECKWEG} H ${mitte(maschinell)} V ${UNTEN + 10}`}
            fill="none" stroke="var(--signal)" strokeWidth="1.5"
            strokeDasharray="5 4" markerEnd="url(#spitze-rot)"
          />
          <text
            x={(mitte(maschinell) + mitte(entscheidet)) / 2} y={RUECKWEG + 16}
            textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--wmc-primary-text)"
          >
            berechtigt oder Fehlalarm? Die Bewertung schärft die Regel
          </text>
        </g>
      ) : null}
    </Figur>
  )
}
