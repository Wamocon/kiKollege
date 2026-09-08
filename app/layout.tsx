import type { Metadata, Viewport } from 'next'
import { daten } from '@/lib/daten'
import { istIntern } from '@/lib/freigabe'
import './globals.css'

export const metadata: Metadata = {
  title: 'KI-Mitarbeiter bei WAMOCON',
  description:
    'Ein KI-Mitarbeiter bewertet, ein Mensch gibt frei. Konzept, Maßstab, Kennzahlen der Prüfläufe und die offene Messlücke.',
  robots: istIntern ? { index: false, follow: false } : undefined,
}

export const viewport: Viewport = {
  themeColor: '#140B0B', // CI Block 05: warmes Schwarz statt #101010
}

/** Laeuft vor dem ersten Zeichnen. Setzt die gespeicherte Themenwahl, sonst
 *  blitzt beim Laden die falsche Fassung auf, und markiert das Dokument als
 *  skriptfaehig: Die Einblend-Animation startet nur dann unsichtbar, damit ohne
 *  JavaScript kein Inhalt verborgen bleibt. */
const themaSkript =
  `document.documentElement.classList.add('js');` +
  `try{var t=localStorage.getItem('wmc-thema');` +
  `if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themaSkript }} />
      </head>
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
