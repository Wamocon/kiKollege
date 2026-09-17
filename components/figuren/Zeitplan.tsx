import type { ReactNode } from 'react'

import { daten, datum, dauer, spanne } from '@/lib/daten'
import { Figur } from './gemeinsam'

/** Der Meilensteinplan als Zeitplan: oben die Entscheidungen mit Frist, darunter
 *  je Meilenstein seine Arbeiten als Balken, unten Erwins Zeit je Woche. Rot
 *  trägt der kritische Pfad. Die senkrechte Linie ist der Stand des Plans,
 *  nicht der heutige Tag: Die Seite ist statisch gebaut. */

const BREITE = 900
/** Links stehen die Beschriftungen, ab hier die Tage. */
const X0 = 240
const TAG_MS = 24 * 60 * 60 * 1000

const zeit = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

/** Bricht einen Titel in Zeilen von höchstens `max` Zeichen um. */
function umbrechen(text: string, max: number): string[] {
  const zeilen: string[] = []
  let zeile = ''
  for (const wort of text.split(' ')) {
    if (zeile && (zeile + ' ' + wort).length > max) {
      zeilen.push(zeile)
      zeile = wort
    } else {
      zeile = zeile ? `${zeile} ${wort}` : wort
    }
  }
  if (zeile) zeilen.push(zeile)
  return zeilen
}

function Raute({ x, y, r = 5, rot = false }: { x: number; y: number; r?: number; rot?: boolean }) {
  return (
    <path
      d={`M ${x} ${y - r} L ${x + r} ${y} L ${x} ${y + r} L ${x - r} ${y} Z`}
      fill={rot ? 'var(--signal)' : 'var(--wmc-ink)'}
    />
  )
}

export function ZeitplanFigur() {
  const p = daten.meilensteinplan
  const start = zeit(p.von)
  const tage = Math.round((zeit(p.bis) - start) / TAG_MS) + 1
  const tag = (BREITE - X0) / tage
  const index = (iso: string) => Math.round((zeit(iso) - start) / TAG_MS)
  const mitte = (iso: string) => X0 + (index(iso) + 0.5) * tag
  const teile: ReactNode[] = []

  // Wochen und Tage
  for (const w of p.wochen) {
    const x = X0 + index(w.von) * tag
    const b = (index(w.bis) - index(w.von) + 1) * tag
    teile.push(
      <g key={w.id}>
        <line x1={x} y1={4} x2={x + b} y2={4} stroke="var(--wmc-ink)" strokeWidth="2" />
        <text x={x + 2} y={17} fontSize="10" fontWeight="700" fill="var(--wmc-ink)">
          {w.id} · {spanne(w.von, w.bis)}
        </text>
      </g>,
    )
  }
  let balkenEnde = 0
  const wochenende: { x: number }[] = []
  for (let i = 0; i < tage; i++) {
    const d = new Date(start + i * TAG_MS)
    const frei = d.getUTCDay() === 0 || d.getUTCDay() === 6
    if (frei) wochenende.push({ x: X0 + i * tag })
    teile.push(
      <text key={`t-${i}`} x={X0 + (i + 0.5) * tag} y={31} textAnchor="middle" fontSize="8.5"
            fill={frei ? 'var(--rand-leise)' : 'var(--wmc-muted)'}>
        {String(d.getUTCDate()).padStart(2, '0')}
      </text>,
    )
  }

  // Entscheidungen mit Frist, je Tag gebündelt
  let y = 58
  teile.push(
    <text key="l-entsch" x={0} y={y + 4} fontSize="11" fontWeight="700" fill="var(--wmc-ink)">
      Entscheidungen mit Frist
    </text>,
  )
  const jeTag = new Map<string, { nr: string; rot: boolean }[]>()
  for (const e of p.entscheidungen) {
    for (const t of e.termine ?? [e.bis]) {
      if (index(t) < 0 || index(t) >= tage) continue
      const liste = jeTag.get(t) ?? []
      liste.push({ nr: e.nr, rot: Boolean(e.kritisch) && !e.erledigtAm })
      jeTag.set(t, liste)
    }
  }
  for (const [t, liste] of jeTag) {
    const x = mitte(t)
    const rot = liste.some((e) => e.rot)
    teile.push(
      <g key={`e-${t}`}>
        <Raute x={x} y={y} r={4.5} rot={rot} />
        <text x={x} y={y - 9} textAnchor="middle" fontSize="9.5" fontWeight="700"
              fill={rot ? 'var(--wmc-primary-text)' : 'var(--wmc-ink)'}>
          {liste.map((e) => e.nr).join(' ')}
        </text>
      </g>,
    )
  }
  for (const e of p.entscheidungen) {
    if (e.erledigtAm) {
      teile.push(
        <text key={'erledigt-' + e.nr} x={mitte(e.bis) + 8} y={y + 14} fontSize="9" fill="var(--wmc-muted)">
          {e.nr} erledigt am {datum(e.erledigtAm).slice(0, 6)}
        </text>,
      )
    } else if (e.ueberfaelligSeit) {
      teile.push(
        <text key={'ueberfaellig-' + e.nr} x={mitte(e.bis) + 8} y={y + 14} fontSize="9"
              fill="var(--wmc-primary-text)">
          {e.nr} überfällig seit {datum(e.ueberfaelligSeit).slice(0, 6)}
        </text>,
      )
    }
  }
  y += 26

  // Meilensteine mit ihren Balken
  for (const m of p.meilensteine) {
    const kopfZeilen = umbrechen(m.titel, 38)
    const kopfHoehe = 16 + kopfZeilen.length * 13
    teile.push(
      <g key={m.id}>
        <line x1={0} y1={y} x2={BREITE} y2={y} stroke="var(--wmc-border)" strokeWidth="1" />
        <text x={0} y={y + 15} fontSize="11" fontWeight="700" fill="var(--wmc-ink)">
          {m.id} · Abnahme {datum(m.datum).slice(0, 6)}
        </text>
        {kopfZeilen.map((z, i) => (
          <text key={z} x={0} y={y + 29 + i * 13} fontSize="10.5" fill="var(--wmc-muted)">
            {z}
          </text>
        ))}
        <Raute x={mitte(m.datum)} y={y + 12} r={6} rot />
        <text x={mitte(m.datum) - 9} y={y + 16} textAnchor="end" fontSize="10" fontWeight="700"
              fill="var(--wmc-primary-text)">
          {m.id}
        </text>
      </g>,
    )
    y += kopfHoehe
    for (const b of p.balken.filter((x) => x.meilenstein === m.id)) {
      const x = X0 + index(b.von) * tag + 1
      const w = b.tage * tag - 2
      teile.push(
        <g key={`${m.id}-${b.text}`}>
          <text x={12} y={y + 12} fontSize="10.5" fill="var(--wmc-ink)" opacity={b.erledigt ? 0.45 : 1}>
            {b.text}
            {b.erledigt ? ', erledigt' : ''}
          </text>
          {b.art === 'bewerten' ? (
            <rect x={x + 0.5} y={y + 4.5} width={w - 1} height={9} fill="none"
                  stroke="var(--wmc-ink)" strokeWidth="1" />
          ) : (
            <rect x={x} y={y + 4} width={w} height={10} opacity={b.erledigt ? 0.35 : 1}
                  fill={b.kritisch ? 'var(--signal)' : 'var(--wmc-ink)'} />
          )}
        </g>,
      )
      y += 18
    }
    y += 6
  }
  balkenEnde = y

  // Erwins Zeit je Woche
  y += 10
  teile.push(
    <g key="zeit">
      <line x1={0} y1={y - 4} x2={BREITE} y2={y - 4} stroke="var(--wmc-border)" strokeWidth="1" />
      <text x={0} y={y + 12} fontSize="11" fontWeight="700" fill="var(--wmc-ink)">
        Erwins Zeit je Woche
      </text>
      <text x={0} y={y + 25} fontSize="10.5" fill="var(--wmc-muted)">
        Rahmen: unter {dauer(p.budgetMinutenJeWoche)}
      </text>
    </g>,
  )
  for (const w of p.wochen) {
    const z = p.zeit.find((e) => e.woche === w.id)
    if (!z) continue
    const summe = z.entscheiden + z.lesen + z.bewerten
    const x = X0 + index(w.von) * tag + 2
    teile.push(
      <g key={`z-${w.id}`}>
        <text x={x} y={y + 12} fontSize="12" fontWeight="700" fill="var(--wmc-ink)">{dauer(summe)}</text>
        <text x={x} y={y + 25} fontSize="9.5" fill="var(--wmc-muted)">
          {z.bewerten ? `davon ${dauer(z.bewerten)} bewerten` : 'keine Bewertung'}
        </text>
      </g>,
    )
  }
  y += 44

  // Legende
  const legende: { art: 'rot' | 'bau' | 'bewerten' | 'abnahme' | 'frist' | 'stand'; text: string; x: number }[] = [
    { art: 'rot', text: 'kritischer Pfad', x: 0 },
    { art: 'bau', text: 'bauen', x: 120 },
    { art: 'bewerten', text: 'Erwin bewertet', x: 200 },
    { art: 'abnahme', text: 'Abnahme', x: 320 },
    { art: 'frist', text: 'Entscheidung mit Frist', x: 410 },
    { art: 'stand', text: 'Stand des Plans', x: 580 },
  ]
  for (const l of legende) {
    const marke =
      l.art === 'rot' ? <rect x={l.x} y={y - 8} width={18} height={9} fill="var(--signal)" />
      : l.art === 'bau' ? <rect x={l.x} y={y - 8} width={18} height={9} fill="var(--wmc-ink)" />
      : l.art === 'bewerten' ? <rect x={l.x + 0.5} y={y - 7.5} width={17} height={8} fill="none" stroke="var(--wmc-ink)" />
      : l.art === 'abnahme' ? <Raute x={l.x + 6} y={y - 3.5} r={5} rot />
      : l.art === 'frist' ? <Raute x={l.x + 6} y={y - 3.5} r={4.5} />
      : <line x1={l.x + 6} y1={y - 10} x2={l.x + 6} y2={y + 2} stroke="var(--wmc-muted)" strokeDasharray="3 2" />
    teile.push(
      <g key={`lg-${l.art}`}>
        {marke}
        <text x={l.x + 24} y={y} fontSize="10.5" fill="var(--wmc-muted)">{l.text}</text>
      </g>,
    )
  }
  const hoehe = y + 8

  // Wochenenden und Stand liegen hinter allem
  const hinten = (
    <g key="hinten">
      {wochenende.map((w) => (
        <rect key={w.x} x={w.x} y={36} width={tag} height={balkenEnde - 36}
              fill="var(--wmc-surface-soft)" />
      ))}
      <line x1={mitte(p.stand)} y1={36} x2={mitte(p.stand)} y2={balkenEnde}
            stroke="var(--wmc-muted)" strokeWidth="1" strokeDasharray="3 2" />
    </g>
  )

  return (
    <Figur
      titel={`Zeitplan des Meilensteinplans vom ${spanne(p.von, p.bis)}: Entscheidungen, vier Meilensteine mit ihren Arbeiten, Erwins Zeit je Woche`}
      beschriftung={
        `${p.status}. Rot ist der kritische Pfad, leer ist Erwins Bewertungszeit, blass ist Erledigtes. ` +
        `Die gestrichelte Linie zeigt den Stand des Plans am ${datum(p.stand)}. Grau hinterlegt sind die Wochenenden.`
      }
      viewBox={`0 0 ${BREITE} ${hoehe}`}
    >
      {hinten}
      {teile}
    </Figur>
  )
}
