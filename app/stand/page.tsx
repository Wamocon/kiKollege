import type { Metadata } from 'next'

import { Kopf } from '@/components/Kopf'
import { Nav } from '@/components/Nav'
import { Fuss } from '@/components/Fuss'
import { StandAbschnitte } from '@/components/stand/StandAbschnitte'

export const metadata: Metadata = {
  title: 'Archiv und ausführlicher Stand',
  description: 'Alle Prüfläufe, Tabellen, Stufen, Entscheidungen und offenen Punkte zum Vorhaben KI-Mitarbeiter.',
}

export default function Seite() {
  return (
    <>
      <Kopf titel="Archiv: alle Tabellen, Prüfläufe und Entscheidungen" />

      <div className="rumpf">
        <Nav />

        <main className="inhalt" id="inhalt">
          <StandAbschnitte />
        </main>
      </div>

      <Fuss />
    </>
  )
}
