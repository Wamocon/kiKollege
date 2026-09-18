import { daten, zahl } from '@/lib/daten'
import { Figur } from './gemeinsam'

const X = 0
const BREITE = 960
const Y = 44
const HOEHE = 52
const SPALT = 3

/** Wie die 26 Prüfpunkte der Checkliste zwischen Skript und Mensch aufgeteilt
 *  sind. Rot trägt nur den Satz, dass die Freigabe in keiner der Zeilen steht. */
export function Pruefpunkte() {
  const p = daten.pruefpunkte
  const links = ((BREITE - SPALT) * p.skript) / p.gesamt
  const rechts = BREITE - SPALT - links

  return (
    <Figur
      viewBox="0 0 960 176"
      titel={`Von ${p.gesamt} Prüfpunkten entscheidet ein Skript über ${p.skript}, ${p.mensch} bleiben bei Menschen.`}
      beschriftung={p.hinweisSkript}
    >
      <text x={X} y={16} fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="var(--wmc-muted)">
        DIE {zahl(p.gesamt)} PRÜFPUNKTE DER CHECKLISTE
      </text>

      <rect x={X} y={Y} width={links} height={HOEHE} fill="var(--wmc-ink)" />
      <text x={X + 16} y={Y + 33} fontSize="22" fontWeight="800" fill="var(--wmc-bg)">
        {p.skript}
      </text>
      <text x={X + 48} y={Y + 32} fontSize="12" fontWeight="700" fill="var(--wmc-bg)" opacity="0.85">
        entscheidet ein Skript
      </text>

      <rect x={X + links + SPALT} y={Y} width={rechts} height={HOEHE}
            fill="var(--wmc-bg)" stroke="var(--wmc-border)" strokeWidth="1" />
      <text x={X + links + SPALT + 16} y={Y + 33} fontSize="22" fontWeight="800" fill="var(--wmc-ink)">
        {p.mensch}
      </text>
      <text x={X + links + SPALT + 46} y={Y + 32} fontSize="12" fontWeight="700" fill="var(--wmc-ink)">
        bleiben bei Menschen
      </text>

      <text x={X} y={Y + HOEHE + 22} fontSize="11" fill="var(--wmc-muted)">
        {p.skriptBeispiele}
      </text>
      <text x={X + links + SPALT} y={Y + HOEHE + 22} fontSize="11" fill="var(--wmc-muted)">
        {p.menschBeispiele}
      </text>

      <line x1={X} y1={Y + HOEHE + 42} x2={BREITE} y2={Y + HOEHE + 42}
            stroke="var(--rand-leise)" strokeWidth="1" />
      <text x={X} y={Y + HOEHE + 62} fontSize="12" fontWeight="700" fill="var(--wmc-primary-text)">
        {p.hinweisFreigabe}
      </text>
    </Figur>
  )
}
