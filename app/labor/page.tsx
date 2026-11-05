import type { Metadata } from 'next'

import { pfad } from '@/lib/pfad'

/** Bis zum 05.11.2026 stand die Produktseite hier. Die Adresse wurde geteilt,
 *  deshalb führt sie weiter auf die Startseite, samt Sprungmarke. GitHub Pages
 *  kennt keine Weiterleitung auf dem Server. */

export const metadata: Metadata = {
  title: 'Umgezogen',
  robots: { index: false, follow: false },
}

const ziel = pfad('/')

export default function Umgezogen() {
  return (
    <main id="inhalt" className="inhalt" style={{ padding: '4rem 1.5rem' }}>
      <meta httpEquiv="refresh" content={`0; url=${ziel}`} />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(ziel)}+location.hash)` }} />
      <h1>Diese Seite ist umgezogen.</h1>
      <p>
        Die Produktseite ist jetzt die <a href={ziel}>Startseite</a>.
      </p>
    </main>
  )
}
