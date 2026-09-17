import type { ReactNode } from 'react'

import { Fuss } from '@/components/Fuss'
import { Hinweis } from '@/components/bausteine'
import { Kopf } from '@/components/Kopf'
import { daten, datum, type Gesellschaft } from '@/lib/daten'

/** Rahmen für Impressum und Datenschutz: eine Spalte ohne Navigation, oben der
 *  Hinweis auf den Entwurf, solange niemand die Texte rechtlich geprüft hat. */
export function Rechtsseite({ titel, children }: { titel: string; children: ReactNode }) {
  const r = daten.recht
  return (
    <>
      <Kopf titel={titel} />
      <div className="rumpf einspaltig">
        <main className="inhalt" id="inhalt">
          {r.geprueft ? null : (
            <section>
              <Hinweis art="wichtig" wort="Entwurf">
                <p>
                  <b>Rechtlich nicht geprüft.</b> Dieser Text ist am {datum(r.entwurfVom)} aus den
                  Firmenangaben dieser Seite entworfen worden. Er ersetzt keine rechtliche Prüfung. Was noch fehlt, steht am
                  Ende.
                </p>
              </Hinweis>
            </section>
          )}
          {children}
        </main>
      </div>
      <Fuss />
    </>
  )
}

/** Die Gesellschaft, die das Impressum als Anbieterin nennt. */
export function anbieterin(): Gesellschaft {
  const g = daten.gesellschaften.find((x) => x.name === daten.recht.anbieter)
  if (!g) throw new Error(`Anbieterin ${daten.recht.anbieter} fehlt in gesellschaften`)
  return g
}

export function Fehlt({ punkte }: { punkte: string[] }) {
  if (!punkte.length) return null
  return (
    <section id="fehlt">
      <h2>Was in diesem Entwurf fehlt</h2>
      <ul className="prosa" style={{ marginTop: '0.75rem' }}>
        {punkte.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </section>
  )
}
