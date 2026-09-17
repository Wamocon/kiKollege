import type { ReactNode } from 'react'

import { daten, datum, zahl, type AblageBereich } from '@/lib/daten'
import { Bereich, Figur } from './gemeinsam'

/** Abbild der Ablage. Jede Notiz ist ein Kästchen, gefärbt nach ihrem
 *  Freigabestand. Rot bleibt dem Verbindlichen vorbehalten, weil es der Punkt
 *  der Figur ist: wie wenig davon ein Mensch schon freigegeben hat. Rechts
 *  steht, wohin ein Bereich am häufigsten verweist. Alle Zahlen kommen aus
 *  scripts/abbild-vault.mjs, Dateinamen kommen nicht vor. */

const GRUPPEN: { id: AblageBereich['gruppe']; text: string }[] = [
  { id: 'wissen', text: 'Wissen: was gilt' },
  { id: 'gedaechtnis', text: 'Gedächtnis: was beim Prüfen anfällt' },
  { id: 'werkstatt', text: 'Werkstatt: Pläne, Protokolle, Einstiege' },
]

const STAENDE = [
  { feld: 'verbindlich', text: 'verbindlich, von einem Menschen freigegeben' },
  { feld: 'informativ', text: 'informativ' },
  { feld: 'ungeprueft', text: 'ungeprüft' },
  { feld: 'ohneFeld', text: 'ohne Freigabefeld' },
] as const

type Stand = (typeof STAENDE)[number]['feld']

const ZELLE = 9
const SCHRITT = 11
const JE_ZEILE = 44
const LINKS_ZELLEN = 214
const SPALTE_ZAHL = LINKS_ZELLEN + JE_ZEILE * SCHRITT + 10
const SPALTE_VERWEIS = 740
const ZEILENABSTAND = 10
const GRUPPENKOPF = 26
const GRUPPENABSTAND = 18

function Kaestchen({ x, y, stand }: { x: number; y: number; stand: Stand }) {
  if (stand === 'ungeprueft') {
    return (
      <rect x={x + 0.5} y={y + 0.5} width={ZELLE - 1} height={ZELLE - 1}
            fill="none" stroke="var(--wmc-ink)" strokeWidth="1" />
    )
  }
  if (stand === 'ohneFeld') {
    // Ein leiser Ton, der in beiden Themen vom Grund absteht.
    return <rect x={x} y={y} width={ZELLE} height={ZELLE} fill="var(--wmc-muted)" opacity="0.35" />
  }
  const fuellung = stand === 'verbindlich' ? 'var(--signal)' : 'var(--wmc-ink)'
  return <rect x={x} y={y} width={ZELLE} height={ZELLE} fill={fuellung} />
}

/** Die Kästchen eines Bereichs in der Reihenfolge der Freigabestände. */
function kaestchenVon(b: AblageBereich): Stand[] {
  return STAENDE.flatMap((s) => Array.from({ length: b[s.feld] }, () => s.feld))
}

function staerksterVerweis(b: AblageBereich, alle: AblageBereich[]) {
  const [ziel, anzahl] = Object.entries(b.verweiseNach).sort((x, y) => y[1] - x[1])[0] ?? []
  if (!ziel || !anzahl) return null
  const bereich = alle.find((a) => a.id === ziel)
  return bereich ? { name: bereich.kurz, anzahl } : null
}

export function AblageFigur() {
  const a = daten.ablage
  const verbindlich = a.bereiche.reduce((s, b) => s + b.verbindlich, 0)

  let y = 0
  const teile: ReactNode[] = []

  for (const g of GRUPPEN) {
    const bereiche = a.bereiche.filter((b) => b.gruppe === g.id)
    if (!bereiche.length) continue
    y += y === 0 ? 14 : GRUPPENABSTAND
    teile.push(<Bereich key={`g-${g.id}`} x={0} y={y} breite={900} text={g.text} />)
    if (g.id === GRUPPEN[0].id) {
      // Steht auf der Höhe der Gruppenzeile, rechts, wo diese frei ist.
      teile.push(
        <text key="kopf-verweis" x={SPALTE_VERWEIS} y={y} fontSize="10" fill="var(--wmc-muted)">
          verweist am häufigsten auf
        </text>,
      )
    }
    y += GRUPPENKOPF

    for (const b of bereiche) {
      const zellen = kaestchenVon(b)
      const zeilen = Math.max(1, Math.ceil(zellen.length / JE_ZEILE))
      const verweis = staerksterVerweis(b, a.bereiche)
      const mitte = y + ZELLE - 1
      teile.push(
        <g key={b.id}>
          <text x={0} y={mitte} fontSize="12" fontWeight="700" fill="var(--wmc-ink)">
            {b.name}
          </text>
          {zellen.map((stand, i) => (
            <Kaestchen
              key={i}
              x={LINKS_ZELLEN + (i % JE_ZEILE) * SCHRITT}
              y={y + Math.floor(i / JE_ZEILE) * SCHRITT}
              stand={stand}
            />
          ))}
          <text x={SPALTE_ZAHL} y={mitte} fontSize="12" fontWeight="700" fill="var(--wmc-ink)">
            {zahl(b.notizen)}
          </text>
          {verweis ? (
            <text x={SPALTE_VERWEIS} y={mitte} fontSize="11" fill="var(--wmc-muted)">
              {`${verweis.name}, ${zahl(verweis.anzahl)}-mal`}
            </text>
          ) : null}
        </g>,
      )
      y += (zeilen - 1) * SCHRITT + ZELLE + ZEILENABSTAND
    }
  }

  // Legende
  y += 18
  let x = 0
  for (const s of STAENDE) {
    teile.push(
      <g key={`l-${s.feld}`}>
        <Kaestchen x={x} y={y} stand={s.feld} />
        <text x={x + 15} y={y + 8} fontSize="11" fill="var(--wmc-muted)">
          {s.text}
        </text>
      </g>,
    )
    x += s.feld === 'verbindlich' ? 280 : 130
  }
  y += ZELLE + 6

  return (
    <Figur
      titel="Abbild der Ablage: Notizen je Bereich, jede als Kästchen nach ihrem Freigabestand"
      beschriftung={
        `Jedes Kästchen ist eine Notiz. ${zahl(a.notizen)} Notizen mit ${zahl(a.verweise)} Verweisen untereinander, ` +
        `gezählt am ${datum(a.gezaehltAm)}. ${zahl(verbindlich)} davon hat ein Mensch für verbindlich erklärt. ` +
        (a.regelnotizen
          ? `Regelnotizen mit gemessener Quote: ${zahl(a.regelnotizen)}.`
          : 'Regelnotizen mit gemessener Quote gibt es noch keine.')
      }
      viewBox={`0 0 900 ${Math.ceil(y)}`}
    >
      {teile}
    </Figur>
  )
}
