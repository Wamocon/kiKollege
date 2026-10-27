import type { ReactNode } from 'react'

import { daten, datum } from '@/lib/daten'
import { sichtbar } from '@/lib/freigabe'
import { Figur } from './gemeinsam'

/** Der Fahrplan seit dem 26.08. auf einer Zeitachse: je Abschnitt ein Balken von
 *  Beginn bis Ende, darunter die Termine, die noch kommen. Die gestrichelte Linie
 *  ist der Stand der Daten. Rot trägt nur, was noch kommt. */

const BREITE = 1000
const X0 = 330
const RECHTS = 30
const KOPF = 44
const ZEILE = 40
const TAG_MS = 24 * 60 * 60 * 1000
const zeit = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const kurz = (iso: string) => datum(iso).slice(0, 6)

export function FahrplanFigur() {
  const f = daten.fahrplan
  const plan = daten.meilensteinplanAktuell
  const kommt = sichtbar(plan) ? plan.meilensteine.filter((m) => !m.abgenommen && !m.terminOffen) : []
  const offen = sichtbar(plan) ? plan.meilensteine.filter((m) => !m.abgenommen && m.terminOffen) : []
  const beginn = zeit(f.phasen[0].von)
  const ende = kommt.length ? zeit(kommt[kommt.length - 1].termin) : zeit(daten.stand)
  const tage = Math.round((ende - beginn) / TAG_MS) + 1
  const tag = (BREITE - X0 - RECHTS) / tage
  const x = (iso: string) => X0 + Math.round((zeit(iso) - beginn) / TAG_MS) * tag
  const zeilen = f.phasen.length + (kommt.length ? 1 : 0)
  const unten = KOPF + zeilen * ZEILE
  const teile: ReactNode[] = []

  // Wochenraster an den Montagen
  for (let i = 0; i < tage; i++) {
    const t = new Date(beginn + i * TAG_MS)
    if (t.getUTCDay() !== 1) continue
    const iso = t.toISOString().slice(0, 10)
    teile.push(
      <g key={`w-${iso}`}>
        <line x1={x(iso)} y1={KOPF - 8} x2={x(iso)} y2={unten} stroke="var(--rand-leise)" strokeWidth="1" />
        <text x={x(iso)} y={KOPF - 14} textAnchor="middle" fontSize="10.5" fill="var(--wmc-muted)">
          {kurz(iso)}
        </text>
      </g>,
    )
  }

  f.phasen.forEach((p, i) => {
    const y = KOPF + i * ZEILE
    const x1 = x(p.von)
    const x2 = Math.max(x(p.bis) + tag, x1 + 6)
    teile.push(
      <g key={`p-${p.von}`}>
        <line x1={20} y1={y + ZEILE} x2={BREITE - RECHTS} y2={y + ZEILE} stroke="var(--rand-leise)" strokeWidth="1" />
        <text x={20} y={y + 24} fontSize="12.5" fontWeight="700" fill="var(--wmc-ink)">
          {p.titel}
        </text>
        <rect x={x1} y={y + 12} width={x2 - x1} height={16} fill="var(--wmc-ink)" />
        <text x={x2 + 6} y={y + 24} fontSize="10.5" fill="var(--wmc-muted)">
          {p.von === p.bis ? kurz(p.von) : `${kurz(p.von)} bis ${kurz(p.bis)}`}
        </text>
      </g>,
    )
  })

  if (kommt.length) {
    const y = KOPF + f.phasen.length * ZEILE
    teile.push(
      <text key="kommt" x={20} y={y + 24} fontSize="12.5" fontWeight="700" fill="var(--wmc-ink)">
        Was noch kommt
      </text>,
    )
    for (const m of kommt) {
      const mx = x(m.termin) + tag / 2
      const r = 7
      teile.push(
        <g key={`m-${m.id}`}>
          <path d={`M ${mx} ${y + 20 - r} L ${mx + r} ${y + 20} L ${mx} ${y + 20 + r} L ${mx - r} ${y + 20} Z`} fill="var(--signal)" />
          <text x={mx} y={y + 38} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--wmc-primary-text)">
            {m.id} {m.fruehestens ? 'ab ' : ''}{kurz(m.termin)}
          </text>
        </g>,
      )
    }
  }

  // Stand der Daten
  const xs = x(daten.stand) + tag / 2
  teile.push(
    <g key="stand">
      <line x1={xs} y1={KOPF - 8} x2={xs} y2={unten} stroke="var(--wmc-ink)" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x={xs + 4} y={unten + 14} fontSize="10.5" fontWeight="700" fill="var(--wmc-ink)">
        Stand {kurz(daten.stand)}
      </text>
    </g>,
  )

  return (
    <Figur
      titel={`Der Fahrplan vom ${datum(f.phasen[0].von)} bis heute in ${f.phasen.length} Abschnitten${
        kommt.length ? `, dazu die Termine ${kommt.map((m) => `${m.id} ${m.fruehestens ? 'frühestens ' : ''}am ${kurz(m.termin)}`).join(', ')}` : ''
      }.`}
      beschriftung={`Jeder Balken ist ein Abschnitt der Arbeit, von seinem ersten bis zu seinem letzten Tag. Die gestrichelte Linie ist der Stand dieser Daten${
        kommt.length ? '; rot sind die Termine, die noch kommen' : ''
      }.${offen.length ? ` Für ${offen.map((m) => m.id).join(' und ')} wird der Termin neu festgelegt.` : ''}`}
      viewBox={`0 0 ${BREITE} ${unten + 22}`}
    >
      {teile}
    </Figur>
  )
}
