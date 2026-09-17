import { daten, datum } from '@/lib/daten'
import { istIntern } from '@/lib/freigabe'
import { StandAlter } from '@/components/StandAlter'
import { ThemaSchalter } from '@/components/ThemaSchalter'
import { Navigation } from '@/components/landing/Navigation'
import { sichtbareAbschnitte, lpAbschnitt } from '@/lib/lpAbschnitte'

export function Kopfleiste() {
  const abschnitte = sichtbareAbschnitte.map((a) => lpAbschnitt(a.id)!)

  return (
    <header className="lp-bar">
      <div className="lp-bar-innen">
        <a className="lp-marke" href="#vorhaben">
          WAMOCON
          <span className="lp-weg-eng">
            {' '}
            <span className="strich">/</span> KI-Mitarbeiter
          </span>
        </a>
        <nav className="lp-bar-meta" aria-label="Seiteninformationen">
          <span className="lp-weg-schmal">
            Stand <b>{datum(daten.stand)}</b> <StandAlter stand={daten.stand} fristTage={daten.herkunft.fristTage} />
          </span>
          {istIntern ? (
            <span className="lp-weg-schmal">
              Fassung <b>intern</b>
            </span>
          ) : null}
          <a href="/stand/" className="lp-weg-eng">
            <span className="lp-weg-schmal">Ausführlicher </span>Stand
          </a>
          <ThemaSchalter />
          <Navigation abschnitte={abschnitte} />
        </nav>
      </div>
    </header>
  )
}
