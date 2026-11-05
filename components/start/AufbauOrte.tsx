import { daten, datum, type LandschaftZustand } from '@/lib/daten'
import { nurSichtbare } from '@/lib/freigabe'

/** Die zwei Orte und die Ablage dazwischen. Die Ablage ist weiß wie das Sprachmodell in
 *  den Ringen, weil nur über sie etwas von einem Ort zum anderen kommt. Alles kommt aus
 *  data/projektstand.json. */

const l = daten.landschaft
const beschriftung = (id: string) => l.verbindungen.find((v) => v.id === id)?.zeilen.join(' ') ?? ''

const LEGENDE: { zustand: LandschaftZustand; text: string }[] = [
  { zustand: 'laeuft', text: 'läuft' },
  { zustand: 'vorhanden', text: 'vorhanden, noch nicht im Einsatz' },
  { zustand: 'geplant', text: 'entschieden, nicht gebaut' },
]

export function AufbauOrte() {
  const bausteine = nurSichtbare(l.bausteine)
  return (
    <figure className="lb-orte">
      <div className="lb-orte-bild">
        <div className="lb-orte-mensch">
          <b>{l.mensch.name}</b>
          <span>{l.mensch.zusatz}</span>
        </div>
        <div className="lb-orte-bogen links">
          <span>{beschriftung('sitzung')}</span>
        </div>
        <div className="lb-orte-bogen rechts">
          <span>{beschriftung('chat')}</span>
        </div>
        {l.orte.map((o) => (
          <section className={`lb-orte-ort ${o.id}`} key={o.id}>
            <h4>{o.name}</h4>
            <p className="lb-orte-produkt">{o.produkt}</p>
            <p className="lb-orte-rolle">{o.rolle}</p>
            <ul>
              {bausteine
                .filter((b) => b.ort === o.id)
                .map((b) => (
                  <li className={b.traegt ? `${b.zustand} traegt` : b.zustand} key={b.id}>
                    {b.name}
                  </li>
                ))}
            </ul>
          </section>
        ))}
        <div className="lb-orte-weg links">
          <span>{beschriftung('direkt')}</span>
          <i aria-hidden="true" />
        </div>
        <div className="lb-orte-weg rechts">
          <span>{beschriftung('bus')}</span>
          <i aria-hidden="true" />
        </div>
        <div className="lb-orte-zur-seite">
          <span>{beschriftung('seite')}</span>
        </div>
        <div className="lb-orte-seite">
          <b>{l.seite.name}</b>
          <span>
            {l.seite.produkt}, seit {datum(l.seite.seit)}
          </span>
        </div>
        <div className="lb-orte-vergleich">
          <span>{beschriftung('vergleich')}</span>
        </div>
      </div>
      <figcaption>
        <ul className="lb-orte-legende">
          {LEGENDE.map((e) => (
            <li className={e.zustand} key={e.zustand}>
              {e.text}
            </li>
          ))}
          <li className="laeuft traegt">der Baustein, an dem der Rest hängt</li>
        </ul>
        <p>
          {`Gefüllt: läuft. Leer: vorhanden, noch nicht im Einsatz. Gestrichelt: entschieden, nicht gebaut. Stand ${datum(l.stand)}. Die eigene Hardware ist am ${datum(l.rechnerAufgenommen)} aufgenommen und am ${datum(l.rechnerBestaetigt)} als unverändert bestätigt.`}
        </p>
      </figcaption>
    </figure>
  )
}
