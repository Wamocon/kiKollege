import { daten, datum } from '@/lib/daten'
import { istIntern } from '@/lib/freigabe'
import { StandAlter } from '@/components/StandAlter'

export function Kopf() {
  return (
    <>
      <div className="kopfkante" />
      <header className="kopf">
        <div className="kopf-innen">
          <div>
            <p className="claim">
              <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                WAMOCON / KI-Mitarbeiter
              </a>
            </p>
            <h1>Projektstand: Fritz prüft, ein Mensch gibt frei</h1>
          </div>
          <div className="kopf-meta">
            Stand <b>{datum(daten.stand)}</b> <StandAlter />
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
