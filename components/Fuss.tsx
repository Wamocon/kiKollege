import { daten, datum } from '@/lib/daten'
import { nurSichtbare, zeigtInternes } from '@/lib/freigabe'
import { logoPfad } from '@/lib/logo'
import { pfad } from '@/lib/pfad'
import { StandAlter } from '@/components/StandAlter'

export function Fuss() {
  const logo = logoPfad()
  const gesellschaften = nurSichtbare(daten.gesellschaften)

  return (
    <footer className="fuss">
      <div className="fuss-innen">
        <div>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="WAMOCON" />
          ) : (
            <>
              <p className="wortmarke">WAMOCON</p>
              <p className="claim">IT-Testmanagement</p>
            </>
          )}
          <p style={{ marginTop: '0.9rem' }}>
            Geschäftsführer: <b>{daten.geschaeftsfuehrung}</b>
          </p>
        </div>

        {gesellschaften.map((g) => (
          <div key={g.name}>
            <h2>{g.rolle}</h2>
            <p>
              <b>{g.name}</b>
            </p>
            <p>{g.auftrag}</p>
            <p className="leistungen">{g.leistungen.join(' · ')}</p>
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
          <h2>Diese Seite</h2>
          <p>
            Stand <b>{datum(daten.stand)}</b>
          </p>
          <StandAlter satz stand={daten.stand} fristTage={daten.herkunft.fristTage} erzeugt={datum(daten.herkunft.erzeugt)} />
          <p>
            Pflege: <b>{daten.ansprechpartner.name}</b>
          </p>
          <p>
            <a href={pfad('/')}>Startseite</a> · <a href={pfad('/stand/')}>Ausführlicher Stand</a>
          </p>
          <p className="rechtlinks">
            <a href={pfad('/impressum/')}>Impressum</a>
            <a href={pfad('/datenschutz/')}>Datenschutz</a>
            {daten.recht.geprueft ? null : <> (Entwürfe)</>}
          </p>
          {zeigtInternes ? (
            <p>
              Zahlen, Entscheidungen und offene Punkte stammen aus{' '}
              <span className="mono">data/projektstand.json</span>. Die Quelle der Wahrheit bleibt der
              Vault; die Seite wird daraus erzeugt.
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
