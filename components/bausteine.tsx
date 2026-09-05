import type { ReactNode } from 'react'
import { abschnitt } from '@/lib/abschnitte'
import { zahl as formatZahl } from '@/lib/daten'
import { istIntern } from '@/lib/freigabe'

/** Abschnittskopf. Nummer und Titel kommen aus lib/abschnitte.ts, damit sie
 *  nicht von der Navigation abweichen koennen. */
export function Kopfzeile({ id }: { id: string }) {
  const a = abschnitt(id)
  const nurIntern = a.freigabe === 'intern'
  return (
    <>
      <p className="eyebrow">
        {a.nr}
        {nurIntern && istIntern ? ' · nur intern' : ''}
      </p>
      <h2>{a.titel}</h2>
    </>
  )
}

/** Marker fuer Inhalte, die in einer oeffentlichen Fassung entfielen.
 *  Block 07 des CI-Blatts verlangt Klartext neben der Farbe, deshalb steht
 *  das Wort im Marker und nicht nur ein Farbton. */
export function Marker({ art, children }: { art: 'intern' | 'gemessen' | 'offen'; children: ReactNode }) {
  return <span className={`marker ${art}`}>{children}</span>
}

export interface KachelDaten {
  id: string
  zahl: number
  label: string
  art?: 'warnung'
  einheit?: string
}

export function Kachelband({ kacheln }: { kacheln: readonly KachelDaten[] }) {
  return (
    <div className="kacheln">
      {kacheln.map((k) => (
        <div key={k.id} className={k.art === 'warnung' ? 'kachel warnung' : 'kachel'}>
          <p className="zahl">
            {formatZahl(k.zahl)}
            {k.einheit ? <span className="einheit"> {k.einheit}</span> : null}
          </p>
          <p className="label">{k.label}</p>
        </div>
      ))}
    </div>
  )
}

/** Hinweisblock. Traegt immer ein Zeichen und ein Statuswort, nie nur eine Farbe.
 *  `wort` ist ein kurzes Label und wird per CSS in Grossbuchstaben gesetzt;
 *  alles Satzfoermige gehoert in `titel`. */
export function Hinweis({
  art = 'offen',
  wort,
  titel,
  children,
}: {
  art?: 'offen' | 'wichtig' | 'gut'
  wort: string
  titel?: string
  children: ReactNode
}) {
  const zeichen = art === 'gut' ? '✓' : art === 'wichtig' ? '!' : '○'
  const klasse = art === 'offen' ? 'hinweis' : `hinweis ${art}`
  return (
    <aside className={klasse}>
      <p className="hinweis-kopf">
        <span className="zeichen" aria-hidden="true">
          {zeichen}
        </span>
        <span>{wort}</span>
      </p>
      {titel ? <h3 className="hinweis-titel">{titel}</h3> : null}
      <div className="prosa">{children}</div>
    </aside>
  )
}

export function Block({ titel, children }: { titel: string; children: ReactNode }) {
  return (
    <div className="block">
      <h3>{titel}</h3>
      <div className="prosa">{children}</div>
    </div>
  )
}
