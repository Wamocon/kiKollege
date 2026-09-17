import type { Metadata } from 'next'

import { Fehlt, Rechtsseite, anbieterin } from '@/components/Rechtsseite'
import { daten } from '@/lib/daten'

export const metadata: Metadata = {
  title: 'Impressum, Entwurf',
}

export default function Impressum() {
  const g = anbieterin()
  const r = daten.recht

  return (
    <Rechtsseite titel="Impressum">
      <section id="anbieter">
        <h2>Angaben nach § 5 DDG</h2>
        <div className="prosa">
          <p>
            <b>{g.name}</b>
            <br />
            {g.sitz}
          </p>
          <p>Vertreten durch den Geschäftsführer {daten.geschaeftsfuehrung}.</p>
          <p>Registereintrag: {g.register}</p>
          <p>Kontakt: {g.kontakt}</p>
          <p className="fussnote">{r.anbieterWarum}</p>
        </div>
      </section>

      <Fehlt punkte={r.impressumFehlt} />
    </Rechtsseite>
  )
}
