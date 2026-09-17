'use client'

import { useEffect, useRef, useState } from 'react'
import type { AnatomieTeil } from '@/lib/daten'

/* Masse der Zeichnung. Der Kern steht in der Mitte, die vier Teile an den
   Ecken; jede Verbindung laeuft von der Innenkante des Teils zur Kernkante. */
const B = 760
const H = 320
const TEIL = { breite: 200, hoehe: 60 }
const KERN = { x: 280, y: 122, breite: 200, hoehe: 76 }
const PLATZ = [
  { x: 0, y: 20, von: [200, 50], nach: [KERN.x, 135] },
  { x: 560, y: 20, von: [560, 50], nach: [KERN.x + KERN.breite, 135] },
  { x: 0, y: 240, von: [200, 270], nach: [KERN.x, 185] },
  { x: 560, y: 240, von: [560, 270], nach: [KERN.x + KERN.breite, 185] },
]

export function HeroAnatomie({
  kern,
  satz,
  teile,
}: {
  kern: { titel: string; zusatz: string }
  satz: string
  teile: AnatomieTeil[]
}) {
  // null heisst: kein Scrollbezug. So rendert der Server, so bleibt es bei
  // abgeschalteter Bewegung, und so ist im Ruhezustand alles gleich hell.
  const [aktiv, setAktiv] = useState<number | null>(null)
  const bahn = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let angefordert = false
    function messen() {
      angefordert = false
      const el = bahn.current
      if (!el) return
      const kasten = el.getBoundingClientRect()
      const weg = kasten.height - window.innerHeight
      if (weg <= 0) return
      const anteil = Math.min(1, Math.max(0, -kasten.top / weg))
      setAktiv(Math.min(teile.length - 1, Math.floor(anteil * teile.length)))
    }
    function beiScroll() {
      if (angefordert) return
      angefordert = true
      requestAnimationFrame(messen)
    }
    messen()
    window.addEventListener('scroll', beiScroll, { passive: true })
    window.addEventListener('resize', beiScroll)
    return () => {
      window.removeEventListener('scroll', beiScroll)
      window.removeEventListener('resize', beiScroll)
    }
  }, [teile.length])

  const hell = (i: number) => aktiv === null || aktiv === i

  return (
    <div className="lp-bahn" ref={bahn}>
      <div className="lp-bahn-halt">
        <figure className="lp-anatomie">
          {/* Auf schmalen Schirmen seitlich verschiebbar, auch mit der Tastatur */}
          <div className="lp-anatomie-bild" tabIndex={0}>
          <svg
            viewBox={`0 0 ${B} ${H}`}
            role="img"
            aria-label={`Ein Sprachmodell wird zum KI-Mitarbeiter durch vier Dinge: ${teile
              .map((t) => t.titel)
              .join(', ')}.`}
          >
            <defs>
              <marker id="an-spitze" viewBox="0 0 10 10" refX="9" refY="5"
                      markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--signal)" />
              </marker>
            </defs>

            {teile.map((teil, i) => {
              const p = PLATZ[i]
              return (
                <g key={teil.id} className={hell(i) ? 'teil hell' : 'teil'}>
                  <line
                    x1={p.von[0]} y1={p.von[1]} x2={p.nach[0]} y2={p.nach[1]}
                    stroke={hell(i) ? 'var(--signal)' : 'var(--wmc-border)'}
                    strokeWidth="1.5"
                    markerEnd={hell(i) ? 'url(#an-spitze)' : undefined}
                  />
                  <rect
                    x={p.x} y={p.y} width={TEIL.breite} height={TEIL.hoehe}
                    fill="var(--wmc-bg)"
                    stroke={hell(i) ? 'var(--signal)' : 'var(--wmc-border)'}
                    strokeWidth={hell(i) ? 1.5 : 1}
                  />
                  <text x={p.x + TEIL.breite / 2} y={p.y + 26} textAnchor="middle"
                        fontSize="13" fontWeight="700" fill="var(--wmc-ink)">
                    {teil.titel}
                  </text>
                  <text x={p.x + TEIL.breite / 2} y={p.y + 44} textAnchor="middle"
                        fontSize="11" fill="var(--wmc-muted)">
                    {teil.kurz}
                  </text>
                </g>
              )
            })}

            <rect x={KERN.x} y={KERN.y} width={KERN.breite} height={KERN.hoehe}
                  fill="var(--wmc-ink)" />
            <text x={KERN.x + KERN.breite / 2} y={KERN.y + 34} textAnchor="middle"
                  fontSize="14" fontWeight="800" fill="var(--wmc-bg)">
              {kern.titel}
            </text>
            <text x={KERN.x + KERN.breite / 2} y={KERN.y + 54} textAnchor="middle"
                  fontSize="11" fill="var(--wmc-bg)" opacity="0.75">
              {kern.zusatz}
            </text>
          </svg>
          </div>

          <figcaption>
            <p className="lp-anatomie-satz">{satz}</p>
            {aktiv === null ? (
              <ol className="lp-anatomie-alle">
                {teile.map((t) => (
                  <li key={t.id}>
                    <b>{t.titel}.</b> {t.text}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="lp-anatomie-text" key={teile[aktiv].id}>
                <b>{teile[aktiv].titel}.</b> {teile[aktiv].text}
              </p>
            )}
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
