import { daten, datum } from '@/lib/daten'
import { istIntern } from '@/lib/freigabe'

export function Kopf() {
  return (
    <>
      <div className="kopfkante" />
      <header className="kopf">
        <div className="kopf-innen">
          <div>
            <p className="claim">Projektstand</p>
            <h1>KI-Mitarbeiter: Fritz prüft, ein Mensch gibt frei</h1>
          </div>
          <div className="kopf-meta">
            Stand <b>{datum(daten.stand)}</b>
            <br />
            Fassung <b>{istIntern ? 'intern' : 'öffentlich'}</b>
            {istIntern ? (
              <>
                <br />
                Zahlen aus <b>{daten.herkunft.arbeitsordner}</b>
              </>
            ) : null}
          </div>
        </div>
      </header>
    </>
  )
}
