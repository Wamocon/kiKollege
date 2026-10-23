import { daten } from '@/lib/daten'
import { Figur } from './gemeinsam'

/** Der feste Takt an einem Beispielquartal über 13 Wochen. Eine rote Spalte
 *  wandert Woche für Woche weiter und zeigt, was in welcher Woche ansteht. Die
 *  Läufe nach einer Änderung sind ein Beispiel, sie kommen so oft wie nötig;
 *  alles andere folgt dem Takt aus den Daten. Bei reduzierter Bewegung fehlt die
 *  wandernde Spalte. Nach dem OnePager zum Trainingskonzept vom 22.10. */

const WOCHEN = 13
const X0 = 210
const RECHTS = 20
const W = (1000 - X0 - RECHTS) / WOCHEN
const KOPF = 34
const ZEILE = 52
const mitte = (woche: number) => X0 + (woche - 0.5) * W

/** Beispiel: Läufe nach einer Änderung, unregelmäßig */
const AENDERUNGEN = [1, 1.25, 2, 5, 9, 9.25, 11]
const RUECKBLICK = [4, 9, 13]

export function TaktFigur() {
  const t = daten.training
  const zeile = (wann: string) => t.takt.find((z) => z.wann === wann)
  const rueckblickVorschlag = zeile('Jeden Monat')?.stand === 'Vorschlag'
  const y = (i: number) => KOPF + i * ZEILE
  const unten = y(4)
  const zeilen = [
    { titel: 'Nach jeder Änderung', zusatz: 'ein Lauf, hier ein Beispiel' },
    { titel: 'Jeden Freitag', zusatz: 'die Trainingsrunde' },
    { titel: 'Jeden Monat', zusatz: rueckblickVorschlag ? 'Rückblick, Vorschlag' : 'Rückblick' },
    { titel: 'Alle drei Monate', zusatz: 'das Assessment Center' },
  ]

  return (
    <Figur
      titel={`Der feste Takt an einem Beispielquartal über ${WOCHEN} Wochen: Läufe nach jeder Änderung, jeden Freitag die Trainingsrunde, jeden Monat ein Rückblick, am Ende das Assessment Center.`}
      beschriftung={
        `Ein Beispielquartal über ${WOCHEN} Wochen. Die Läufe nach einer Änderung sind ausgedacht, um den Takt zu zeigen; ` +
        'sie kommen so oft, wie nötig. Die Trainingsrunde liegt jeden Freitag, ' +
        (rueckblickVorschlag ? 'der Rückblick einmal im Monat (gestrichelt, Vorschlag), ' : 'der Rückblick einmal im Monat, ') +
        'das Assessment Center am Ende des Quartals. Die rote Spalte wandert Woche für Woche weiter.'
      }
      viewBox={`0 0 1000 ${unten + 12}`}
    >
      {/* Wochen */}
      <text x={20} y={20} fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="var(--wmc-muted)">
        WOCHE
      </text>
      {Array.from({ length: WOCHEN }, (_, i) => (
        <text key={`w${i}`} x={mitte(i + 1)} y={20} textAnchor="middle" fontSize="11" fill="var(--wmc-muted)">
          {i + 1}
        </text>
      ))}

      {/* Die wandernde Woche */}
      <g className="lp-takt-woche" style={{ ['--takt-weg' as string]: `${(WOCHEN * W).toFixed(1)}px` }}>
        <rect x={X0} y={KOPF - 6} width={W} height={unten - KOPF + 6} fill="var(--signal)" opacity="0.09" />
        <line x1={X0} y1={KOPF - 6} x2={X0} y2={unten} stroke="var(--signal)" strokeWidth="2" />
      </g>

      {zeilen.map((z, i) => (
        <g key={z.titel}>
          <line x1={20} y1={y(i + 1)} x2={1000 - RECHTS} y2={y(i + 1)} stroke="var(--rand-leise)" strokeWidth="1" />
          <text x={20} y={y(i) + 22} fontSize="13" fontWeight="700" fill="var(--wmc-ink)">
            {z.titel}
          </text>
          <text x={20} y={y(i) + 39} fontSize="11" fill="var(--wmc-muted)">
            {z.zusatz}
          </text>
        </g>
      ))}

      {/* Läufe nach einer Änderung */}
      {AENDERUNGEN.map((w) => (
        <rect key={`a${w}`} x={mitte(w) - 2} y={y(0) + 15} width={4} height={22} fill="var(--wmc-ink)" />
      ))}

      {/* Trainingsrunde jeden Freitag */}
      {Array.from({ length: WOCHEN }, (_, i) => (
        <circle key={`f${i}`} cx={mitte(i + 1)} cy={y(1) + 26} r={7} fill="var(--wmc-ink)" />
      ))}

      {/* Rückblick im Monat */}
      {RUECKBLICK.map((w) => (
        <rect key={`r${w}`} x={mitte(w) - 10} y={y(2) + 16} width={20} height={20} fill="var(--wmc-bg)"
              stroke="var(--wmc-ink)" strokeWidth="2" strokeDasharray={rueckblickVorschlag ? '4 3' : undefined} />
      ))}

      {/* Assessment Center am Ende des Quartals */}
      <rect x={mitte(WOCHEN) - 12} y={y(3) + 14} width={24} height={24} fill="var(--wmc-ink)"
            transform={`rotate(45 ${mitte(WOCHEN)} ${y(3) + 26})`} />
    </Figur>
  )
}
