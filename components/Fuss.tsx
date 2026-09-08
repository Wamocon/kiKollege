import { daten, datum } from '@/lib/daten'
import { nurSichtbare, istIntern } from '@/lib/freigabe'
import { logoPfad } from '@/lib/logo'

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
            <h4>{g.rolle}</h4>
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
          <h4>Diese Seite</h4>
          <p>
            Stand <b>{datum(daten.stand)}</b>
          </p>
          <p>
            Pflege: <b>{daten.ansprechpartner.name}</b>
          </p>
          {istIntern ? (
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
