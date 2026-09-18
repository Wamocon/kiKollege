import { ImageResponse } from 'next/og'

import { VORSCHAU } from '@/lib/vorschau'

/** Vorschaubild für geteilte Links, beim Bauen als vorschau.png geschrieben.
 *  Die Dateikonvention opengraph-image schreibt im statischen Export eine Datei
 *  ohne Endung, und GitHub Pages liefert die nicht als Bild aus.
 *
 *  Das Bild trägt keine Zahl und kein Datum, damit es nicht veraltet, wenn die
 *  Daten sich ändern. Farben aus dem CI-Profil: Weiß, Ink, Rot nur für die
 *  Kante. */

export const dynamic = 'force-static'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFFFF',
          color: '#140B0B',
          borderTop: '14px solid #F40E0E',
          padding: '64px 80px 56px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 1, color: '#864A4A' }}>
          WAMOCON / KI-Mitarbeiter
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 84, lineHeight: 1.02, letterSpacing: -3 }}>
          <span>Der KI-Mitarbeiter bewertet.</span>
          <span>Ein Mensch gibt frei.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#452626' }}>
          Wie bei WAMOCON ein KI-Mitarbeiter entsteht und gemessen wird
        </div>
      </div>
    ),
    { width: VORSCHAU.breite, height: VORSCHAU.hoehe },
  )
}
