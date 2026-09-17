import { inWorten } from '@/lib/alter'
import { daten, datum } from '@/lib/daten'
import { nurSichtbare } from '@/lib/freigabe'
import { Bereich, Figur, Kasten } from './gemeinsam'

/** Eine kleine Zahl als Wort, passend zu "Rolle": eine, zwei, drei. */
function rollen(n: number): string {
  return n === 1 ? 'eine' : inWorten(n)
}

const gross = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Die Mannschaft als Organigramm. Durchgezogen heisst: arbeitet oder ist
 *  eingerichtet. Gestrichelt heisst: entschieden und nicht gebaut. Rot ist nur
 *  der Strich zu dem, der arbeitet. Die Kaesten kommen aus den Daten, die
 *  Reihenfolge auch: der Orchestrator steht oben, weil er verteilt. */
export function MannschaftFigur() {
  const koepfe = nurSichtbare(daten.mannschaft.koepfe)
  const oben = koepfe[0]
  const unten = koepfe.slice(1)

  // Bei vielen Rollen werden die Kaesten schmaler, damit die Zeile in die
  // Figur passt. Breiter als 126 Einheiten wird keiner.
  const lueck = 18
  const breite = Math.min(126, Math.floor((880 - (unten.length - 1) * lueck) / unten.length))
  const gesamt = unten.length * breite + (unten.length - 1) * lueck
  const links = (900 - gesamt) / 2
  const mitte = (i: number) => links + i * (breite + lueck) + breite / 2
  const arbeiten = koepfe.filter((k) => k.zustand === 'arbeitet').length
  const eingerichtet = koepfe.filter((k) => k.zustand === 'eingerichtet').length

  return (
    <Figur
      titel="Organigramm der Mannschaft"
      beschriftung={
        `Durchgezogen: arbeitet oder eingerichtet. Gestrichelt: entschieden, nicht gebaut. ` +
        `${gross(rollen(arbeiten))} von ${inWorten(koepfe.length)} Rollen ${arbeiten === 1 ? 'arbeitet' : 'arbeiten'}` +
        (eingerichtet
          ? `, ${rollen(eingerichtet)} ${eingerichtet === 1 ? 'ist' : 'sind'} eingerichtet`
          : '') +
        `, gezählt am ${datum(daten.mannschaft.gezaehltAm)}.`
      }
      viewBox="0 0 900 300"
    >
      {/* Der Kopf steht links, nicht mittig: auf schmalen Bildschirmen scrollt
          das Diagramm, und dann soll das Wichtigste zuerst im Bild sein. */}
      <Kasten x={links} y={6} breite={240} hoehe={38} titel="Der Mensch" zusatz="beauftragt, gibt frei, bewertet" />
      <line x1={links + 120} y1={44} x2={links + 120} y2={62} stroke="var(--signal)" strokeWidth="1.5" markerEnd="url(#spitze-rot)" />

      <Kasten
        x={links} y={66} breite={240} hoehe={48} titel={oben.kurz} zusatz={oben.kern}
        gestrichelt={oben.zustand === 'entschieden'}
      />
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
            gestrichelt={k.zustand === 'entschieden'}
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
