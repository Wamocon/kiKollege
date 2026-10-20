import type { ReactNode } from 'react'

import type { WerkzeugArt } from '@/lib/werkzeugart'

/** Kleine Symbole für die Werkzeuge auf /mannschaft. Eigene Zeichnungen aus
 *  Linien und Grundformen, damit kein Paket dazukommt. Sie erben die Farbe
 *  des Textes (currentColor) und stimmen damit in hell und dunkel. */
const pfade: Record<WerkzeugArt, ReactNode> = {
  dateien: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
    </>
  ),
  kommandozeile: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M7 9l3 3-3 3" />
      <path d="M12 15h5" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
    </>
  ),
  websuche: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  browser: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M3 9h18" />
    </>
  ),
  bilder: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M21 16l-5-5-8 8" />
    </>
  ),
  skills: (
    <>
      <path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 17a3 3 0 0 1 3-3h9" />
    </>
  ),
  gedaechtnis: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  aufgabenliste: (
    <>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </>
  ),
  rueckfrage: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
      <path d="M12 17h.01" />
    </>
  ),
  bot: <path d="M4 5h16v11H9l-5 4z" />,
  verzeichnis: (
    <>
      <rect x="4" y="3" width="16" height="18" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </>
  ),
  modell: (
    <>
      <rect x="7" y="7" width="10" height="10" />
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
    </>
  ),
}

export function WerkzeugSymbol({ art, groesse = 16 }: { art: WerkzeugArt; groesse?: number }) {
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none', verticalAlign: '-0.15em' }}
    >
      {pfade[art]}
    </svg>
  )
}
