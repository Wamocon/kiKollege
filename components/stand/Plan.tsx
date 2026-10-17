import { Block } from '@/components/bausteine'
import { TermineFigur } from '@/components/figuren/Termine'
import { ZeitplanFigur } from '@/components/figuren/Zeitplan'
import { daten, datum, dauer } from '@/lib/daten'

/** Die Einzelheiten des Plans, der gilt: das Ziel in Teilen, Erwins Zeit, der
 *  kritische Pfad, was nicht hineinpasst, die Risiken. Die Landing Page zeigt
 *  die Termine, die Meilensteine und die Fristen und verweist für den Rest
 *  hierher. Darunter steht der Plan vom 17.09. als Verlauf, eingeklappt. */
export function PlanAbschnitt() {
  const p = daten.meilensteinplanAktuell
  const alt = daten.meilensteinplan
  const gesamt = p.meilensteine.reduce((s, m) => s + m.erwinMinuten, 0)

  return (
    <>
      <div className="prosa">
        <p>
          <b>{p.status}.</b> Er gilt vom {datum(p.von)} bis zum {datum(p.bis)} und ersetzt den{' '}
          {p.ersetzt.join(' und den ')}. Das Ziel: „{p.ziel}“ {p.zielVon}.
        </p>
        <p>{p.termineSatz}</p>
        <p>
          Die Landing Page zeigt die vier Meilensteine mit dem, was erledigt ist, und die
          Entscheidungen mit Frist. Hier stehen die Termine und der Rest.
        </p>
      </div>

      <TermineFigur />

      <h3 style={{ marginTop: '1.8rem' }}>Was das Ziel bis zum {datum(p.bis)} heißt</h3>
      <div className="tabellenrahmen">
        <table>
          <thead>
            <tr>
              <th style={{ width: '14rem' }}>Teil des Ziels</th>
              <th>Festgelegt am {datum(p.von).slice(0, 6)}</th>
            </tr>
          </thead>
          <tbody>
            {p.zielteile.map((z) => (
              <tr key={z.teil}>
                <td>
                  <b>{z.teil}</b>
                </td>
                <td>{z.festgelegt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="prosa" style={{ marginTop: '1.3rem' }}>
        <p>{p.lauffaehig}</p>
      </div>

      <h3 style={{ marginTop: '1.8rem' }}>Erwins Zeit je Meilenstein</h3>
      <div className="raster">
        {p.meilensteine.map((m) => (
          <div className="karte" key={m.id}>
            <h3>
              {m.id}, bis {datum(m.termin).slice(0, 6)}: {dauer(m.erwinMinuten)}
            </h3>
            <p>{m.titel}</p>
          </div>
        ))}
      </div>
      <div className="prosa" style={{ marginTop: '1.3rem' }}>
        <p>
          Zusammen {dauer(gesamt)}. {p.zeitSatz}
        </p>
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
                  <b>{r.titel}</b>
                </td>
                <td>
                  {r.stufe}, Eintritt {r.eintritt}, Auswirkung {r.auswirkung}
                </td>
                <td>
                  {r.gegenmassnahme}
                  {/[.?!]$/.test(r.gegenmassnahme) ? '' : '.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="prosa" style={{ marginTop: '1.3rem' }}>
        <p>{p.risikenHinweis}</p>
      </div>
      <p className="fussnote" style={{ marginTop: '1rem' }}>
        Quelle: {p.quelle}
      </p>

      <details className="verlauf" style={{ marginTop: '2rem' }}>
        <summary>
          <b>Der Plan vom {datum(alt.von).slice(0, 6)} als Verlauf</b>
          {alt.ueberholtAm ? `, überholt seit dem ${datum(alt.ueberholtAm)}` : ''}
        </summary>
        <div className="prosa" style={{ marginTop: '0.8rem' }}>
          <p>
            {alt.status}. {alt.ueberholt}
          </p>
        </div>
        <ZeitplanFigur />
        <p className="fussnote" style={{ marginTop: '0.6rem' }}>
          Quelle: {alt.quelle}
        </p>
      </details>
    </>
  )
}
