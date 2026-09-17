import { daten, datum } from '@/lib/daten'
import { nurSichtbare, zeigtInternes } from '@/lib/freigabe'
import { logoPfad } from '@/lib/logo'
import { pfad } from '@/lib/pfad'
import { StandAlter } from '@/components/StandAlter'

export function Fussleiste() {
  const logo = logoPfad()
  const gesellschaften = nurSichtbare(daten.gesellschaften)

  return (
    <footer className="lp-fuss">
      <div className="lp-fuss-innen">
        <div>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="WAMOCON" />
          ) : (
            <p className="lp-wortmarke">WAMOCON</p>
          )}
          <p style={{ marginTop: '0.9rem' }}>
            Geschäftsführer: <b>{daten.geschaeftsfuehrung}</b>
          </p>
          <p>
            Stand <b>{datum(daten.stand)}</b>
          </p>
          <StandAlter satz stand={daten.stand} fristTage={daten.herkunft.fristTage} erzeugt={datum(daten.herkunft.erzeugt)} />
          <p>
            Pflege: <b>{daten.ansprechpartner.name}</b>
          </p>
        </div>

        {gesellschaften.map((g) => (
          <div key={g.name}>
            <h4>{g.rolle}</h4>
            <p>
              <b>{g.name}</b>
            </p>
            <p>{g.auftrag}</p>
            <p className="leistungen">{g.leistungen.join(', ')}</p>
            <p>
              {g.register}
              <br />
              {g.sitz}
              <br />
              {g.kontakt}
            </p>
          </div>
        ))}

        <div>
          <h4>Weiter</h4>
          <p>
            <a href={pfad('/stand/')}>Ausführlicher Projektstand</a> mit allen Prüfläufen, Tabellen und
            offenen Punkten.
          </p>
          {zeigtInternes ? (
            <p>
              Zahlen, Entscheidungen und offene Punkte stammen aus{' '}
              <span className="mono">data/projektstand.json</span>. Die Quelle der Wahrheit bleibt
              der Vault.
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
