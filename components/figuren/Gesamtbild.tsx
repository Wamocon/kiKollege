import { daten } from '@/lib/daten'
import { Figur } from './gemeinsam'

/** Das Gesamtbild: Menschen, Jira, die Werkbank mit Claude Code, die Ablage,
 *  GitHub und der KI-Rechner mit Hermes Agent und Qwen. Die Nummern gehören zu
 *  den Wegen unter der Zeichnung. Ein roter Punkt folgt einem
 *  Entwicklungsauftrag aus Jira bis zum Pull Request; bei reduzierter Bewegung
 *  ist er ausgeblendet. Rot trägt nur der Punkt. */

const DAUER = 14
const WEG =
  'M 120 228 L 460 228 L 460 160 L 660 160 L 660 80 L 835 80 L 835 260 L 972 260 L 972 523 L 460 523'

function Box({
  x, y, b, h, titel, zeilen = [], rahmen = false,
}: {
  x: number; y: number; b: number; h: number; titel: string; zeilen?: string[]; rahmen?: boolean
}) {
  return (
    <g>
      <rect x={x} y={y} width={b} height={h} fill="var(--wmc-bg)"
            stroke={rahmen ? 'var(--wmc-ink)' : 'var(--wmc-border)'} strokeWidth={rahmen ? 1.5 : 1} />
      <text x={x + b / 2} y={y + 24} textAnchor="middle" fontSize="13.5" fontWeight="700" fill="var(--wmc-ink)">
        {titel}
      </text>
      {zeilen.map((z, i) => (
        <text key={z} x={x + b / 2} y={y + 42 + i * 15} textAnchor="middle" fontSize="11" fill="var(--wmc-muted)">
          {z}
        </text>
      ))}
    </g>
  )
}

function Nummer({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill="var(--wmc-bg)" stroke="var(--wmc-ink)" strokeWidth="1.3" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--wmc-ink)">
        {n}
      </text>
    </g>
  )
}

const pfeil = { stroke: 'var(--wmc-ink)', strokeWidth: 1.3, fill: 'none', markerEnd: 'url(#spitze)' }
const leise = { stroke: 'var(--wmc-muted)', strokeWidth: 1.2, fill: 'none', strokeDasharray: '4 3', markerEnd: 'url(#spitze)' }

export function GesamtbildFigur() {
  const g = daten.techstack.gesamtbild
  const werkbank = [
    'Sitzungen mit dem Projektverantwortlichen',
    'baut Akten, Zaun und Prüfskripte',
    'fährt Prüfstände und Trainingsläufe',
    'Archivar am Ende jeder Sitzung',
    'geplant: Stand werktags um 18 Uhr',
    'acht Werkzeugmacher',
  ]
  return (
    <Figur
      titel={`Das Gesamtbild in ${g.schritte.length} Wegen: ${g.schritte.map((s, i) => `${i + 1} ${s.titel}`).join(', ')}.`}
      beschriftung={g.beschriftung}
      viewBox="0 0 1000 570"
    >
      {/* Der KI-Rechner */}
      <rect x={690} y={16} width={290} height={380} fill="none" stroke="var(--wmc-border)" strokeDasharray="6 4" />
      <text x={968} y={386} textAnchor="end" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="var(--wmc-muted)">
        NVIDIA DGX SPARK
      </text>
      <Box x={710} y={36} b={250} h={64} titel="Hermes Agent mit Qwen" zeilen={['der Orchestrator verteilt']} rahmen />
      <Box x={710} y={130} b={250} h={50} titel="Board" zeilen={['eine Karte zur Zeit']} />
      <Box x={710} y={210} b={250} h={100} titel="Mannschaft"
           zeilen={['Fritz, julia-trend, Arnold,', 'Gregor Dev, Theo', 'je mit Akte und Zaun']} rahmen />
      <line x1={835} y1={100} x2={835} y2={128} {...pfeil} />
      <line x1={835} y1={180} x2={835} y2={208} {...pfeil} />

      {/* Menschen, Telegram, Jira */}
      <Box x={20} y={30} b={200} h={66} titel="Menschen" zeilen={['Projektverantwortlicher, Team']} rahmen />
      <Box x={400} y={38} b={140} h={50} titel="Telegram" zeilen={['Aufträge im Alltag']} />
      <Box x={20} y={200} b={200} h={90} titel="Jira" zeilen={['Epics und Stories', 'Tagesstatus fürs Team']} />

      {/* Die Werkbank */}
      <rect x={300} y={130} width={320} height={200} fill="var(--wmc-bg)" stroke="var(--wmc-ink)" strokeWidth="1.5" />
      <text x={316} y={154} fontSize="14" fontWeight="800" fill="var(--wmc-ink)">Werkbank: Claude Code</text>
      <text x={316} y={171} fontSize="11.5" fill="var(--wmc-muted)">mit Claude von Anthropic</text>
      {werkbank.map((z, i) => (
        <text key={z} x={316} y={198 + i * 18} fontSize="11.5" fill="var(--wmc-ink)">
          {z}
        </text>
      ))}

      {/* Ablage und GitHub */}
      <Box x={300} y={380} b={260} h={60} titel="Ablage" zeilen={['Obsidian-Vault, Git-Repositories']} />
      <Box x={300} y={490} b={320} h={66} titel="GitHub" zeilen={['Pull Requests, diese Seite auf Pages']} />

      {/* Die Wege */}
      <line x1={220} y1={63} x2={398} y2={63} {...pfeil} markerStart="url(#spitze)" />
      <line x1={540} y1={63} x2={708} y2={63} {...pfeil} markerStart="url(#spitze)" />
      <path d="M 170 96 L 170 165 L 298 165" {...pfeil} />
      <line x1={220} y1={228} x2={298} y2={228} {...pfeil} />
      <line x1={300} y1={268} x2={222} y2={268} {...leise} />
      <line x1={430} y1={330} x2={430} y2={378} {...pfeil} />
      <path d="M 560 410 L 835 410 L 835 312" {...pfeil} />
      <path d="M 620 160 L 660 160 L 660 80 L 708 80" {...pfeil} />
      <path d="M 960 280 L 972 280 L 972 523 L 622 523" {...pfeil} />

      <Nummer x={310} y={63} n={1} />
      <Nummer x={235} y={165} n={2} />
      <Nummer x={259} y={228} n={3} />
      <Nummer x={259} y={268} n={4} />
      <Nummer x={430} y={354} n={5} />
      <Nummer x={700} y={410} n={6} />
      <Nummer x={660} y={120} n={7} />
      <Nummer x={862} y={195} n={8} />
      <Nummer x={972} y={450} n={9} />

      {/* Ein Entwicklungsauftrag als Punkt */}
      <g className="lp-hq-punkt">
        <circle r={13} fill="var(--signal)" opacity="0.2">
          <animateMotion dur={`${DAUER}s`} repeatCount="indefinite" path={WEG} />
        </circle>
        <circle r={6.5} fill="var(--signal)">
          <animateMotion dur={`${DAUER}s`} repeatCount="indefinite" path={WEG} />
        </circle>
      </g>
    </Figur>
  )
}
