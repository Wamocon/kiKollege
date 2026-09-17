import type { Metadata } from 'next'

import { Fuss } from '@/components/Fuss'
import { Kopf } from '@/components/Kopf'
import { pfad } from '@/lib/pfad'

export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
}

/** Die Seite, die GitHub Pages für jede unbekannte Adresse zeigt. Ohne sie
 *  zeigt Next.js eine englische Fehlerseite, und die Sprungmarke „Zum Inhalt
 *  springen“ führte dort ins Leere. */
export default function NichtGefunden() {
  return (
    <>
      <Kopf titel="Diese Seite gibt es nicht" />
      <div className="rumpf einspaltig">
        <main className="inhalt" id="inhalt">
          <section>
            <h2>Weiter geht es hier</h2>
            <div className="prosa">
              <p>
                Die Adresse führt auf keine Seite. Vielleicht ist sie veraltet oder falsch
                abgeschrieben.
              </p>
              <p>
                <a href={pfad('/')}>Zur Startseite</a> · <a href={pfad('/stand/')}>Zum ausführlichen Stand</a>
              </p>
            </div>
          </section>
        </main>
      </div>
      <Fuss />
    </>
  )
}
