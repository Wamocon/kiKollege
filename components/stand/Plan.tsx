import { Block } from '@/components/bausteine'
import { daten, datum, dauer, spanne } from '@/lib/daten'

/** Die Einzelheiten des Meilensteinplans: das Ziel in Teilen, Erwins Zeit je
 *  Woche, der kritische Pfad, was nicht hineinpasst, die Risiken. Die Landing
 *  Page zeigt den Zeitplan und die Fristen und verweist für den Rest hierher. */
export function PlanAbschnitt() {
  const p = daten.meilensteinplan
  const woche = new Map(p.wochen.map((w) => [w.id, w]))
  const summe = (z: (typeof p.zeit)[number]) => z.entscheiden + z.lesen + z.bewerten
  const gesamt = p.zeit.reduce((s, z) => s + summe(z), 0)
  const bewerten = p.zeit.reduce((s, z) => s + z.bewerten, 0)
  const offen = p.entscheidungen.filter((e) => !e.erledigtAm)

  return (
    <>
      <div className="prosa">
        <p>
          <b>{p.status}.</b> Er gilt vom {datum(p.von)} bis zum {datum(p.bis)} und ersetzt den{' '}
          {p.ersetzt}
          {/[.?!]$/.test(p.ersetzt) ? '' : '.'} Das Ziel: „{p.ziel}“ {p.zielVon}. Der Rahmen: {p.rahmen}.
        </p>
        <p>
          Die Landing Page zeigt den Zeitplan, die vier Meilensteine und die Entscheidungen mit
          Frist. Offen sind davon {offen.length} von {p.entscheidungen.length}. Hier steht der Rest.
        </p>
      </div>

      <h3 style={{ marginTop: '1.8rem' }}>Was am {datum(p.bis)} erfüllt sein soll</h3>
      <div className="tabellenrahmen">
        <table>
          <thead>
            <tr>
              <th style={{ width: '12rem' }}>Teil des Ziels</th>
              <th>Erfüllt, wenn</th>
              <th>Was davon übrig bleibt</th>
            </tr>
          </thead>
          <tbody>
            {p.zielteile.map((z) => (
              <tr key={z.teil}>
                <td>
                  <b>{z.teil}</b>
                </td>
                <td>{z.erfuellt}</td>
                <td>{z.uebrig}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: '1.8rem' }}>Erwins Zeit je Woche</h3>
      <div className="raster">
        {p.zeit.map((z) => {
          const w = woche.get(z.woche)
          return (
            <div className="karte" key={z.woche}>
              <h3>
                {z.woche}
                {w ? `, ${spanne(w.von, w.bis)}` : ''}: {dauer(summe(z))}
              </h3>
              <p>
                entscheiden {dauer(z.entscheiden)}, lesen {dauer(z.lesen)},{' '}
                {z.bewerten ? `bewerten ${dauer(z.bewerten)}` : 'keine Bewertung'}
              </p>
            </div>
          )
        })}
      </div>
      <div className="prosa" style={{ marginTop: '1.3rem' }}>
        <p>
          Zusammen {dauer(gesamt)}, davon {dauer(bewerten)} Bewerten. Der Rahmen liegt unter{' '}
          {dauer(p.budgetMinutenJeWoche)} je Woche. {p.zeitVorher} {p.zeitPreis}
        </p>
        {p.zeitArbeitsplan ? (
          <p>
            {p.zeitArbeitsplan.text} Er kommt auf {dauer(p.zeitArbeitsplan.minuten)} statt{' '}
            {dauer(gesamt)}, bis zur Abnahme von M1 auf {dauer(p.zeitArbeitsplan.bisM1)}.
          </p>
        ) : null}
      </div>

      <Block titel="Der kritische Pfad">
        <p>{p.pfad.join(' → ')}.</p>
        <p>{p.pfadSatz}</p>
        <p>{p.daneben}</p>
      </Block>

      <Block titel="Was in diesen Wochen nicht passt">
        <ul>
          {p.nichtDrin.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Block>

      <h3 style={{ marginTop: '1.8rem' }}>Risiken nach Eintritt und Auswirkung</h3>
      <div className="tabellenrahmen">
        <table>
          <thead>
            <tr>
              <th style={{ width: '3.5rem' }}>Nr.</th>
              <th>Risiko</th>
              <th style={{ width: '10rem' }}>Stufe</th>
              <th>Was dagegen hilft</th>
            </tr>
          </thead>
          <tbody>
            {p.risiken.map((r) => (
              <tr key={r.nr}>
                <td>{r.nr}</td>
                <td>
                  <b>{r.titel}.</b> {r.text}
                </td>
                <td>
                  {r.erledigt ? (
                    <>
                      <b>aufgelöst am {datum(r.erledigt.am).slice(0, 6)}</b>, war {r.stufe}
                    </>
                  ) : (
                    <>
                      {r.stufe === 'kritisch' ? <b>kritisch</b> : r.stufe}, Eintritt {r.eintritt},
                      Auswirkung {r.auswirkung}
                    </>
                  )}
                </td>
                <td>
                  {r.erledigt ? <b>{r.erledigt.text} </b> : null}
                  {r.gegenmassnahme}
                  {/[.?!]$/.test(r.gegenmassnahme) ? '' : '.'} Frühwarnzeichen: {r.warnzeichen}.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="prosa" style={{ marginTop: '1.3rem' }}>
        <p>{p.risikenKern}</p>
        <p>{p.risikenHinweis}</p>
      </div>
      <p className="fussnote" style={{ marginTop: '1rem' }}>
        Quelle: {p.quelle}
      </p>
    </>
  )
}
