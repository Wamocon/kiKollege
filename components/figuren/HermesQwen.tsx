import { daten } from '@/lib/daten'
import { Figur } from './gemeinsam'

/** Wie ein Auftrag durch Hermes Agent und Qwen läuft. Ein roter Punkt folgt dem
 *  Auftrag: von Telegram in das Profil des Orchestrators, zweimal durch die
 *  Schleife aus Qwen, Zaun und Werkzeug, über das Board zu Fritz und zurück zum
 *  Menschen. Die Nummern gehören zu den Schritten unter der Zeichnung. Bei
 *  reduzierter Bewegung fehlt der Punkt, die Zeichnung steht. Rot trägt nur der
 *  Punkt; der Zaun ist gestrichelt, weil er prüft und nichts selbst tut. */

const DAUER = 16

/** Der Weg des Punkts, Ecke für Ecke, passend zu den Linien der Zeichnung */
const WEG =
  'M 90 182 L 230 182 L 350 137 L 325 232 L 475 232 L 587 232 L 587 296 L 325 296 L 325 232 ' +
  'L 475 232 L 587 232 L 587 95 L 825 95 L 825 245 L 905 245 L 905 95 L 905 40 L 90 40 L 90 182'

function Box({
  x, y, b, h, titel, zeilen = [], art = 'normal',
}: {
  x: number; y: number; b: number; h: number; titel: string; zeilen?: string[]
  art?: 'normal' | 'gefuellt' | 'gestrichelt' | 'rahmen'
}) {
  const gefuellt = art === 'gefuellt'
  return (
    <g>
      <rect
        x={x} y={y} width={b} height={h}
        fill={gefuellt ? 'var(--wmc-ink)' : 'var(--wmc-bg)'}
        stroke={gefuellt ? 'none' : art === 'rahmen' ? 'var(--wmc-ink)' : 'var(--wmc-border)'}
        strokeWidth={art === 'rahmen' ? 1.5 : 1}
        strokeDasharray={art === 'gestrichelt' ? '5 3' : undefined}
      />
      <text x={x + b / 2} y={y + (zeilen.length ? 24 : h / 2 + 5)} textAnchor="middle" fontSize="13.5"
            fontWeight="700" fill={gefuellt ? 'var(--wmc-bg)' : 'var(--wmc-ink)'}>
        {titel}
      </text>
      {zeilen.map((z, i) => (
        <text key={z} x={x + b / 2} y={y + 42 + i * 15} textAnchor="middle" fontSize="11"
              fill={gefuellt ? 'var(--wmc-bg)' : 'var(--wmc-muted)'} opacity={gefuellt ? 0.8 : 1}>
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

export function HermesQwenFigur() {
  const a = daten.techstack.ablauf
  return (
    <Figur
      titel={`Wie ein Auftrag durch Hermes Agent und Qwen läuft, in ${a.schritte.length} Schritten: ${a.schritte
        .map((s, i) => `${i + 1} ${s.titel}`)
        .join(', ')}.`}
      beschriftung={a.beschriftung}
      viewBox="0 0 1000 470"
    >
      {/* Der Rechner im Haus */}
      <rect x={200} y={20} width={780} height={340} fill="none" stroke="var(--wmc-border)" strokeDasharray="6 4" />
      <text x={968} y={350} textAnchor="end" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="var(--wmc-muted)">
        NVIDIA DGX SPARK IM HAUS
      </text>

      {/* Telegram */}
      <Box x={20} y={150} b={140} h={64} titel="Telegram" zeilen={['ein Mensch schreibt']} art="rahmen" />

      {/* Profil des Orchestrators */}
      <rect x={230} y={60} width={420} height={280} fill="var(--wmc-bg)" stroke="var(--wmc-ink)" strokeWidth="1.5" />
      <text x={246} y={84} fontSize="14" fontWeight="800" fill="var(--wmc-ink)">Hermes Agent</text>
      <text x={246} y={101} fontSize="11.5" fill="var(--wmc-muted)">Profil des Orchestrators</text>
      <Box x={250} y={115} b={200} h={46} titel="Akte, Seele, Skills" zeilen={[]} />
      <text x={460} y={142} fontSize="11" fill="var(--wmc-muted)">und Gedächtnis</text>
      <Box x={250} y={200} b={150} h={64} titel="Qwen" zeilen={['Text rein, Text raus']} art="gefuellt" />
      <Box x={440} y={200} b={70} h={64} titel="Zaun" zeilen={['prüft']} art="gestrichelt" />
      <Box x={540} y={200} b={95} h={64} titel="Werkzeug" zeilen={['Notiz, Karte']} />
      <line x1={400} y1={232} x2={438} y2={232} {...pfeil} />
      <line x1={510} y1={232} x2={538} y2={232} {...pfeil} />
      <path d="M 587 264 L 587 296 L 325 296 L 325 266" {...pfeil} />
      <text x={456} y={314} textAnchor="middle" fontSize="11" fill="var(--wmc-muted)">Ergebnis zurück an Qwen</text>
      <path d="M 350 161 L 330 198" {...pfeil} />

      {/* Board und Fritz */}
      <Box x={690} y={60} b={270} h={70} titel="Board" zeilen={['eine Karte je Auftrag, eine zur Zeit']} art="rahmen" />
      <path d="M 587 200 L 587 95 L 688 95" {...pfeil} />
      <text x={600} y={88} fontSize="11" fill="var(--wmc-muted)">Karte</text>
      <rect x={690} y={190} width={270} height={110} fill="var(--wmc-bg)" stroke="var(--wmc-ink)" strokeWidth="1.5" />
      <text x={706} y={214} fontSize="14" fontWeight="800" fill="var(--wmc-ink)">Hermes Agent</text>
      <text x={706} y={231} fontSize="11.5" fill="var(--wmc-muted)">Profil von Fritz, eigene Akte</text>
      <text x={706} y={256} fontSize="11.5" fill="var(--wmc-ink)">dieselbe Schleife:</text>
      <text x={706} y={273} fontSize="11.5" fill="var(--wmc-ink)">Qwen, Zaun, Werkzeug</text>
      <line x1={825} y1={130} x2={825} y2={188} {...pfeil} />
      <line x1={905} y1={190} x2={905} y2={132} {...pfeil} />
      <text x={915} y={165} fontSize="11" fill="var(--wmc-muted)">Ergebnis</text>

      {/* Zurück zum Menschen */}
      <path d="M 905 60 L 905 40 L 90 40 L 90 148" {...leise} />
      <text x={560} y={34} textAnchor="middle" fontSize="11" fill="var(--wmc-muted)">
        unverändert zurück
      </text>

      {/* Die Ablage */}
      <Box x={400} y={395} b={240} h={58} titel="Ablage" zeilen={['als Kopie über Git']} />
      <line x1={520} y1={395} x2={520} y2={342} {...leise} />
      <path d="M 640 424 L 825 424 L 825 302" {...leise} />
      <text x={732} y={416} textAnchor="middle" fontSize="11" fill="var(--wmc-muted)">liest</text>

      {/* Nummern zu den Schritten */}
      <Nummer x={20} y={150} n={1} />
      <Nummer x={250} y={115} n={2} />
      <Nummer x={250} y={200} n={3} />
      <Nummer x={440} y={200} n={4} />
      <Nummer x={635} y={200} n={5} />
      <Nummer x={690} y={60} n={6} />
      <Nummer x={200} y={40} n={7} />

      {/* Der Auftrag als Punkt */}
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
