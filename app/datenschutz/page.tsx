import type { Metadata } from 'next'

import { Fehlt, Rechtsseite, anbieterin } from '@/components/Rechtsseite'
import { daten } from '@/lib/daten'

export const metadata: Metadata = {
  title: 'Datenschutz, Entwurf',
}

export default function Datenschutz() {
  const g = anbieterin()
  const r = daten.recht

  return (
    <Rechtsseite titel="Datenschutz">
      <section id="verantwortlich">
        <h2>Verantwortlich</h2>
        <div className="prosa">
          <p>
            {g.name}, {g.sitz}. Kontakt: {g.kontakt}.
          </p>
        </div>
      </section>

      <section id="hosting">
        <h2>Die Seite liegt bei GitHub Pages</h2>
        <div className="prosa">
          <p>
            GitHub Pages ist ein Dienst der GitHub, Inc. in den USA. {r.hosting} So steht es in der{' '}
            <a href={r.hostingQuelle}>Beschreibung von GitHub Pages</a>. Einzelheiten stehen in der{' '}
            <a href={r.datenschutzGithub}>Datenschutzerklärung von GitHub</a>.
          </p>
          <p>Die Seite selbst zählt keine Zugriffe und wertet keine aus.</p>
        </div>
      </section>

      <section id="browser">
        <h2>Was die Seite in Ihrem Browser ablegt</h2>
        <div className="prosa">
          <p>
            Keine Cookies, keine Zählpixel, keine Inhalte fremder Anbieter. Schriften, Bilder und
            Skripte kommen vom selben Server wie die Seite.
          </p>
          <p>
            Wählen Sie auf der Startseite oben das helle oder das dunkle Thema, merkt sich Ihr Browser diese Wahl im
            lokalen Speicher unter dem Schlüssel <span className="mono">wmc-thema</span>. Der Eintrag
            verlässt Ihr Gerät nicht. Mit der Wahl „System“ wird er wieder gelöscht.
          </p>
        </div>
      </section>

      <section id="rechte">
        <h2>Ihre Rechte</h2>
        <div className="prosa">
          <p>
            Sie haben nach den Artikeln 15 bis 21 DSGVO das Recht auf Auskunft, Berichtigung,
            Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Nach
            Artikel 77 DSGVO können Sie sich bei einer Aufsichtsbehörde beschweren. Für Unternehmen
            mit Sitz in Hessen ist das {r.aufsicht}.
          </p>
        </div>
      </section>

      <Fehlt punkte={r.datenschutzFehlt} />
    </Rechtsseite>
  )
}
