import type { ReactNode } from 'react'

import { daten, datum } from '@/lib/daten'
import { Figur } from './gemeinsam'

/** Die vier Meilensteine des Plans vom 29.09. auf einer Zeitachse: offen die
 *  Frist, die der Plan selbst gesetzt hatte, gefüllt der Termin nach der
 *  Entscheidung vom 16.10. Der Strich dazwischen ist die Verschiebung. Rot
 *  trägt nur der gültige Termin. Ein Tageskalender wie im Plan vom 17.09. passt
 *  hier nicht: Die Arbeiten haben nach dem 16.10. keine eigenen Daten mehr,
 *  nur die vier Termine sind festgelegt. */

const BREITE = 900
const X0 = 250
const RECHTS = 24
const KOPF = 46
const ZEILE = 58
const TAG_MS = 24 * 60 * 60 * 1000

const zeit = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const kurz = (iso: string) => datum(iso).slice(0, 6)

/** Bricht einen Titel in Zeilen von höchstens `max` Zeichen um. */
function umbrechen(text: string, max: number): string[] {
  const zeilen: string[] = []
  let zeile = ''
  for (const wort of text.split(' ')) {
    if (zeile && `${zeile} ${wort}`.length > max) {
      zeilen.push(zeile)
      zeile = wort
    } else {
      zeile = zeile ? `${zeile} ${wort}` : wort
    }
  }
  if (zeile) zeilen.push(zeile)
  return zeilen
}

function Raute({ x, y, r, gefuellt }: { x: number; y: number; r: number; gefuellt: boolean }) {
  const d = `M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`
  return gefuellt ? (
    <path d={d} fill="var(--signal)" />
  ) : (
    <path d={d} fill="var(--wmc-bg)" stroke="var(--wmc-muted)" strokeWidth="1.5" />
  )
}

export function TermineFigur() {
  const p = daten.meilensteinplanAktuell
  const start = zeit(p.von)
  const tage = Math.round((zeit(p.bis) - start) / TAG_MS) + 1
  const tag = (BREITE - X0 - RECHTS) / tage
  const x = (iso: string) => X0 + (Math.round((zeit(iso) - start) / TAG_MS) + 0.5) * tag
  const unten = KOPF + p.meilensteine.length * ZEILE
  const teile: ReactNode[] = []

  // Montage als Wochenraster
  for (let i = 0; i < tage; i++) {
    const t = new Date(start + i * TAG_MS)
    if (t.getUTCDay() !== 1) continue
    const iso = t.toISOString().slice(0, 10)
    const xi = X0 + i * tag
    teile.push(
      <g key={`w-${iso}`}>
        <line x1={xi} y1={22} x2={xi} y2={unten} stroke="var(--rand-leise)" strokeWidth="1" />
        <text x={xi + 3} y={16} fontSize="10.5" fill="var(--wmc-muted)">
          {kurz(iso)}
        </text>
      </g>,
    )
  }

  // Der Stand der Daten
  const xs = x(p.stand)
  teile.push(
    <g key="stand">
      <line x1={xs} y1={28} x2={xs} y2={unten} stroke="var(--wmc-muted)" strokeWidth="1" strokeDasharray="3 2" />
      <text x={xs + 4} y={38} fontSize="10.5" fontWeight="700" fill="var(--wmc-ink)">
        Stand {kurz(p.stand)}
      </text>
    </g>,
  )

  p.meilensteine.forEach((m, i) => {
    const y = KOPF + i * ZEILE
    const mitte = y + ZEILE / 2
    const xa = x(m.fruehereFrist)
    const xn = x(m.termin)
    const zeilen = umbrechen(m.titel, 34)
    teile.push(
      <g key={m.id}>
        <line x1={0} y1={y} x2={BREITE} y2={y} stroke="var(--wmc-border)" strokeWidth="1" />
        <text x={0} y={y + 18} fontSize="11.5" fontWeight="700" fill="var(--wmc-ink)">
          {m.id}
        </text>
        {zeilen.slice(0, 3).map((z, j) => (
          <text key={z} x={30} y={y + 18 + j * 14} fontSize="11" fill="var(--wmc-ink)">
            {z}
          </text>
        ))}
        <line x1={xa + 8} y1={mitte} x2={xn - 9} y2={mitte} stroke="var(--wmc-muted)"
              strokeWidth="1" strokeDasharray="4 3" />
        <Raute x={xa} y={mitte} r={6} gefuellt={false} />
        <text x={xa} y={mitte + 20} textAnchor="middle" fontSize="10.5" fill="var(--wmc-muted)">
          {kurz(m.fruehereFrist)}
        </text>
        <Raute x={xn} y={mitte} r={7} gefuellt />
        <text x={xn} y={mitte + 21} textAnchor="middle" fontSize="11.5" fontWeight="700"
              fill="var(--wmc-primary-text)">
          {kurz(m.termin)}
        </text>
      </g>,
    )
  })

  // Legende
  const ly = unten + 26
  teile.push(
    <g key="legende">
      <line x1={0} y1={unten} x2={BREITE} y2={unten} stroke="var(--wmc-border)" strokeWidth="1" />
      <Raute x={7} y={ly - 4} r={6} gefuellt={false} />
      <text x={20} y={ly} fontSize="11" fill="var(--wmc-muted)">
        Frist im Plan vom {kurz(p.von)}
      </text>
      <Raute x={232} y={ly - 4} r={7} gefuellt />
      <text x={246} y={ly} fontSize="11" fill="var(--wmc-muted)">
        Termin seit dem {kurz(p.termineAm)}
      </text>
      <line x1={452} y1={ly - 11} x2={452} y2={ly + 2} stroke="var(--wmc-muted)" strokeDasharray="3 2" />
      <text x={462} y={ly} fontSize="11" fill="var(--wmc-muted)">
        Stand der Daten
      </text>
    </g>,
  )

  const verschoben = p.meilensteine.map((m) => Math.round((zeit(m.termin) - zeit(m.fruehereFrist)) / TAG_MS))
  const wochen = Math.round(Math.max(...verschoben) / 7)

  return (
    <Figur
      titel={`Die vier Meilensteine des Plans vom ${datum(p.von)}: Termine vom ${kurz(p.termineAm)} gegen die ursprünglichen Fristen`}
      beschriftung={
        `Jeder Meilenstein ist um rund ${wochen} Wochen gerückt: offen die Frist, die der Plan vom ` +
        `${kurz(p.von)} gesetzt hatte, gefüllt der Termin, den Erwin am ${datum(p.termineAm)} ` +
        `freigegeben hat. Die gestrichelte Linie zeigt den Stand dieser Daten.`
      }
      viewBox={`0 0 ${BREITE} ${ly + 10}`}
    >
      {teile}
    </Figur>
  )
}
