import { inWorten } from '@/lib/alter'
import { daten, datum } from '@/lib/daten'
import { nurSichtbare } from '@/lib/freigabe'
import { Bereich, Figur, Kasten } from './gemeinsam'

/** Die Mannschaft als Organigramm. Durchgezogen heisst: arbeitet. Gestrichelt
 *  heisst: entschieden und nicht gebaut. Die Kaesten kommen aus den Daten, die
 *  Reihenfolge auch: der Orchestrator steht oben, weil er verteilt. */
export function MannschaftFigur() {
  const koepfe = nurSichtbare(daten.mannschaft.koepfe)
  const oben = koepfe[0]
  const unten = koepfe.slice(1)

  const breite = 126
  const lueck = 18
  const gesamt = unten.length * breite + (unten.length - 1) * lueck
  const links = (900 - gesamt) / 2
  const mitte = (i: number) => links + i * (breite + lueck) + breite / 2
  const arbeiten = koepfe.filter((k) => k.zustand === 'arbeitet').length

  return (
    <Figur
      titel="Organigramm der Mannschaft"
      beschriftung={
        `Durchgezogen: arbeitet. Gestrichelt: entschieden, nicht gebaut. ` +
        `${inWorten(arbeiten)} von ${inWorten(koepfe.length)} Rollen arbeiten, ` +
        `gezählt am ${datum(daten.mannschaft.gezaehltAm)}.`
      }
      viewBox="0 0 900 300"
    >
      {/* Der Kopf steht links, nicht mittig: auf schmalen Bildschirmen scrollt
          das Diagramm, und dann soll das Wichtigste zuerst im Bild sein. */}
      <Kasten x={links} y={6} breite={240} hoehe={38} titel="Der Mensch" zusatz="beauftragt, gibt frei, bewertet" />
      <line x1={links + 120} y1={44} x2={links + 120} y2={62} stroke="var(--signal)" strokeWidth="1.5" markerEnd="url(#spitze-rot)" />

      <Kasten x={links} y={66} breite={240} hoehe={48} titel={oben.kurz} zusatz={oben.kern} />
      <line x1={links + 120} y1={114} x2={links + 120} y2={136} stroke="var(--signal)" strokeWidth="1.5" />
      {/* Die Querlinie reicht vom ersten bis zum letzten Kasten, damit der rote
          Abgang des Orchestrators auf ihr endet und kein Strich frei steht. */}
      <line x1={mitte(0)} y1={136} x2={mitte(unten.length - 1)} y2={136} stroke="var(--rand-leise)" strokeWidth="1" />

      {unten.map((k, i) => (
        <g key={k.id}>
          <line
            x1={mitte(i)} y1={136} x2={mitte(i)} y2={152}
            stroke={k.zustand === 'arbeitet' ? 'var(--signal)' : 'var(--rand-leise)'}
            strokeWidth={k.zustand === 'arbeitet' ? 1.5 : 1}
          />
          <Kasten
            x={links + i * (breite + lueck)} y={156} breite={breite} hoehe={54}
            titel={k.kurz} zusatz={k.kern}
            gestrichelt={k.zustand !== 'arbeitet'}
          />
        </g>
      ))}

      <Bereich x={links} y={238} breite={gesamt} text="Gemeinsam, alle lesen dasselbe" />
      <Kasten
        x={links} y={250} breite={gesamt} hoehe={42}
        titel="Eine Ablage" zusatz="Wissen, Entscheidungen, Aufträge, Akten" gefuellt
      />
    </Figur>
  )
}
