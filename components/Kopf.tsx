import { daten, datum } from '@/lib/daten'
import { fassung, istIntern } from '@/lib/freigabe'
import { pfad } from '@/lib/pfad'
import { StandAlter } from '@/components/StandAlter'

export function Kopf({ titel = 'Projektstand: Fritz prüft, ein Mensch gibt frei' }: { titel?: string }) {
  return (
    <>
      <div className="kopfkante" />
      <header className="kopf">
        <div className="kopf-innen">
          <div>
            <p className="claim">
              <a href={pfad('/')} style={{ color: 'inherit', textDecoration: 'none' }}>
                WAMOCON / KI-Mitarbeiter
              </a>
            </p>
            <h1>{titel}</h1>
          </div>
          <div className="kopf-meta">
            Stand <b>{datum(daten.stand)}</b> <StandAlter stand={daten.stand} fristTage={daten.herkunft.fristTage} />
            <br />
            Fassung <b>{{ intern: 'intern', oeffentlich: 'öffentlich', alles: 'vollständig' }[fassung]}</b>
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
