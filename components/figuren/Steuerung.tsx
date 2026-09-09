import { daten } from '@/lib/daten'
import { Bereich, Figur, Kasten } from './gemeinsam'

/** Wer den Mitarbeiter anstößt, was er selbst abgibt, und wie eine Übergabe an
 *  einen zweiten läuft. Rot trägt nur die Datei: Sie ist der Grund, warum eine
 *  Übergabe nachvollziehbar bleibt. */
export function Steuerung() {
  const s = daten.steuerung

  return (
    <Figur
      viewBox="0 0 960 306"
      titel="Ein Mensch, ein Zeitplan oder ein Ablaufskript stößt den KI-Mitarbeiter an. Teilaufgaben gibt er an abgeschottete Helfer ab. Die Übergabe an einen zweiten läuft über eine Datei."
      beschriftung={s.abwaegung}
    >
      <Bereich x={0} y={12} breite={250} text="wer ihn beauftragt" />
      {s.beauftragt.map((b, i) => (
        <g key={b.wer}>
          <Kasten x={0} y={34 + i * 66} breite={250} hoehe={54} titel={b.wer} zusatz={b.wie} />
          <line
            x1={254} y1={61 + i * 66} x2={326} y2={130}
            stroke="var(--wmc-ink)" strokeWidth="1.5" markerEnd="url(#spitze)"
          />
        </g>
      ))}

      <Kasten x={332} y={100} breite={252} hoehe={62}
              titel="KI-Mitarbeiter" zusatz="arbeitet den Auftrag ab" gefuellt />

      {/* gibt Teile ab */}
      <Bereich x={332} y={196} breite={252} text="gibt Teile ab" />
      {[0, 1].map((i) => (
        <g key={i}>
          <line x1={396 + i * 128} y1={166} x2={396 + i * 128} y2={222}
                stroke="var(--wmc-ink)" strokeWidth="1.5" markerEnd="url(#spitze)" />
          <Kasten x={340 + i * 128} y={228} breite={112} hoehe={44}
                  titel="Helfer" zusatz="abgeschottet" />
        </g>
      ))}

      {/* Übergabe an einen zweiten */}
      <Bereich x={632} y={12} breite={328} text="übergabe an einen zweiten" />
      <line x1={588} y1={131} x2={644} y2={131}
            stroke="var(--signal)" strokeWidth="1.5" markerEnd="url(#spitze-rot)" />
      <rect x={648} y={100} width={130} height={62}
            fill="var(--wmc-surface-soft)" stroke="var(--signal)" strokeWidth="1" />
      <text x={713} y={126} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--wmc-ink)">
        Datei
      </text>
      <text x={713} y={144} textAnchor="middle" fontSize="11" fill="var(--wmc-muted)">
        kein Gespräch
      </text>
      <line x1={782} y1={131} x2={824} y2={131}
            stroke="var(--signal)" strokeWidth="1.5" markerEnd="url(#spitze-rot)" />
      <Kasten x={828} y={100} breite={132} hoehe={62} titel="Zweiter" zusatz="andere Aufgabe" gestrichelt />
    </Figur>
  )
}
