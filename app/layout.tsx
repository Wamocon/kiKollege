import type { Metadata, Viewport } from 'next'
import { daten } from '@/lib/daten'
import { zeigtInternes } from '@/lib/freigabe'
import { pfad } from '@/lib/pfad'
import { VORSCHAU } from '@/lib/vorschau'
import './globals.css'

const titel = 'KI-Mitarbeiter bei WAMOCON'
const beschreibung =
  'Ein KI-Mitarbeiter bewertet, ein Mensch gibt frei. Konzept, Maßstab, Kennzahlen der Prüfläufe und die offene Messlücke.'

/** Die volle Adresse der Seite, gesetzt im Workflow. Ohne sie kann Next.js die
 *  Adresse des Vorschaubilds nicht absolut schreiben, und geteilte Links zeigen
 *  kein Bild. Lokal bleibt sie leer. */
const adresse = process.env.SEITE_URL

export const metadata: Metadata = {
  // Die Basis ist nur der Host. Den Pfad des Repositorys traegt die
  // Bildadresse selbst, ueber pfad(), wie jeder andere interne Link.
  metadataBase: adresse ? new URL(new URL(adresse).origin) : undefined,
  title: { default: titel, template: `%s | ${titel}` },
  description: beschreibung,
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'WAMOCON',
    title: titel,
    description: beschreibung,
    images: [{ url: pfad(VORSCHAU.pfad), width: VORSCHAU.breite, height: VORSCHAU.hoehe, alt: VORSCHAU.alt }],
  },
  // Eine Seite mit internem Inhalt gehört in keinen Suchindex. Pages zeigt seit
  // dem 17.09. die vollständige Fassung, also bleibt sie draußen. Wer den Link
  // teilt, bekommt trotzdem die Vorschau: Die lesen Dienste wie Teams oder
  // Slack auch ohne Index.
  robots: zeigtInternes ? { index: false, follow: false } : undefined,
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
