import { daten, datum } from '@/lib/daten'
import { istIntern } from '@/lib/freigabe'
import { ThemaSchalter } from '@/components/ThemaSchalter'

export function Kopfleiste() {
  return (
    <header className="lp-bar">
      <div className="lp-bar-innen">
        <a className="lp-marke" href="#vorhaben">
          WAMOCON <span>/</span> KI-Mitarbeiter
        </a>
        <nav className="lp-bar-meta" aria-label="Seiteninformationen">
          <span className="lp-weg-schmal">
            Stand <b>{datum(daten.stand)}</b>
          </span>
          {istIntern ? (
            <span className="lp-weg-schmal">
              Fassung <b>intern</b>
            </span>
          ) : null}
          <a href="/stand/">
            <span className="lp-weg-schmal">Ausführlicher </span>Stand
          </a>
          <ThemaSchalter />
        </nav>
      </div>
    </header>
  )
}
