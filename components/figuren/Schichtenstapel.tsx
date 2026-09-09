import { daten } from '@/lib/daten'
import { Figur } from './gemeinsam'

const KOPF = 34
const ZEILE = 40
const LUECKE = 6
const SCHRITT = ZEILE + LUECKE
const GRUPPE_BIS = 178
const KLAMMER = 188
const INHALT = 204
const RECHTS = 960

/**
 * Die acht Schichten als Stapel, links nach Gruppen geklammert. Rot trägt genau
 * ein Element: die Gruppe, die ein zweiter KI-Mitarbeiter neu bauen muss. Die
 * anderen drei erbt er fast unverändert, und das ist der Ertrag des ersten.
 */
export function Schichtenstapel() {
  const schichten = daten.schichten
  const gruppen = daten.schichtenGruppen
  const y = (nr: number) => KOPF + (nr - 1) * SCHRITT
  const hoehe = KOPF + schichten.length * SCHRITT + 4

  return (
    <Figur
      viewBox={`0 0 ${RECHTS} ${hoehe}`}
      titel={`Acht Schichten in vier Gruppen. Ein zweiter KI-Mitarbeiter erbt ${gruppen.filter((g) => g.erbt).length} Gruppen fast unverändert; neu zu bauen ist ${gruppen.find((g) => !g.erbt)?.name}.`}
      beschriftung={daten.schichtenErbe}
    >
      <text x={0} y={14} fontSize="10" fontWeight="700" letterSpacing="1.4" fill="var(--wmc-muted)">
        GRUPPE
      </text>
      <text x={INHALT} y={14} fontSize="10" fontWeight="700" letterSpacing="1.4" fill="var(--wmc-muted)">
        SCHICHT UND FRAGE
      </text>
      <text x={RECHTS} y={14} textAnchor="end" fontSize="10" fontWeight="700" letterSpacing="1.4"
            fill="var(--wmc-muted)">
        WO ES IN DER DATEI STEHT
      </text>
      <line x1={0} y1={22} x2={RECHTS} y2={22} stroke="var(--wmc-border)" strokeWidth="1" />

      {gruppen.map((g) => {
        const oben = y(g.schichten[0])
        const unten = y(g.schichten[g.schichten.length - 1]) + ZEILE
        const farbe = g.erbt ? 'var(--wmc-border)' : 'var(--signal)'
        return (
          <g key={g.name}>
            <line x1={KLAMMER} y1={oben} x2={KLAMMER} y2={unten}
                  stroke={farbe} strokeWidth={g.erbt ? 1 : 2} />
            <text x={GRUPPE_BIS} y={oben + 15} textAnchor="end" fontSize="11" fontWeight="700"
                  fill="var(--wmc-ink)">
              {g.name}
            </text>
            <text x={GRUPPE_BIS} y={oben + 31} textAnchor="end" fontSize="10"
                  fontWeight={g.erbt ? 400 : 700}
                  fill={g.erbt ? 'var(--wmc-muted)' : 'var(--wmc-primary-text)'}>
              {g.erbt ? 'ein zweiter erbt sie' : 'neu zu bauen'}
            </text>
          </g>
        )
      })}

      {schichten.map((s) => {
        const oben = y(s.nr)
        const neu = gruppen.some((g) => !g.erbt && g.schichten.includes(s.nr))
        return (
          <g key={s.nr}>
            <rect x={INHALT} y={oben} width={RECHTS - INHALT} height={ZEILE}
                  fill={neu ? 'var(--wmc-surface-soft)' : 'var(--flaeche)'} />
            <text x={INHALT + 14} y={oben + 25} fontSize="11" fontWeight="700"
                  fill="var(--wmc-primary-text)" fontFamily="monospace">
              {String(s.nr).padStart(2, '0')}
            </text>
            <text x={INHALT + 44} y={oben + 25} fontSize="12.5" fontWeight="700" fill="var(--wmc-ink)">
              {s.name}
            </text>
            <text x={INHALT + 216} y={oben + 25} fontSize="11.5" fill="var(--wmc-muted)">
              {s.frage}
            </text>
            <text x={RECHTS - 14} y={oben + 25} textAnchor="end" fontSize="10.5"
                  fill="var(--wmc-ink)" fontFamily="monospace">
              {s.datei}
            </text>
            {s.traegt ? (
              <line x1={INHALT} y1={oben} x2={INHALT} y2={oben + ZEILE}
                    stroke="var(--wmc-ink)" strokeWidth="3" />
            ) : null}
          </g>
        )
      })}
    </Figur>
  )
}
