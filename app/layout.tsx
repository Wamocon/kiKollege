import type { Metadata, Viewport } from 'next'
import { daten } from '@/lib/daten'
import { istIntern } from '@/lib/freigabe'
import './globals.css'

export const metadata: Metadata = {
  title: 'KI-Mitarbeiter bei WAMOCON — Projektstand',
  description:
    'Interne Standseite zum Vorhaben KI-Mitarbeiter: Konzept, Massstab, Kennzahlen der Prueflaeufe, offene Messluecke und Entscheidungen mit Datum.',
  robots: istIntern ? { index: false, follow: false } : undefined,
}

export const viewport: Viewport = {
  themeColor: '#140B0B', // CI Block 05: warmes Schwarz statt #101010
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <a className="sprungmarke" href="#inhalt">
          Zum Inhalt springen
        </a>
        {children}
        <span hidden data-stand={daten.stand} />
      </body>
    </html>
  )
}
