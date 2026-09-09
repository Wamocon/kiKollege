'use client'

import { useEffect, useRef, useState } from 'react'
import type { LpAbschnitt } from '@/lib/lpAbschnitte'

/** Navigation für eine Seite mit sechzehn Abschnitten: eine feste Leiste am
 *  linken Rand auf breiten Bildschirmen, ein aufklappbares Verzeichnis für alle
 *  Breiten und eine Fortschrittslinie. Der aktuelle Abschnitt wird über einen
 *  IntersectionObserver bestimmt, nicht über Scroll-Rechnerei. */
export function Navigation({
  abschnitte,
}: {
  abschnitte: (LpAbschnitt & { nr: string })[]
}) {
  const [aktiv, setAktiv] = useState(abschnitte[0]?.id ?? '')
  const [offen, setOffen] = useState(false)
  const [amFuss, setAmFuss] = useState(false)
  const fortschritt = useRef<HTMLDivElement>(null)

  // Aktiven Abschnitt bestimmen
  useEffect(() => {
    const sichtbare = new Set<string>()
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) sichtbare.add(e.target.id)
          else sichtbare.delete(e.target.id)
        }
        // Der oberste sichtbare Abschnitt gewinnt, damit die Marke beim
        // Zurückscrollen nicht springt.
        const ersteSichtbare = abschnitte.find((a) => sichtbare.has(a.id))
        if (ersteSichtbare) setAktiv(ersteSichtbare.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    for (const a of abschnitte) {
      const el = document.getElementById(a.id)
      if (el) beobachter.observe(el)
    }
    return () => beobachter.disconnect()
  }, [abschnitte])

  // Die Schiene tritt ab, wenn der Fussbereich heraufkommt: er nutzt die volle
  // Breite, die Schiene stuende sonst ueber seinem Text. Der untere Rand des
  // Beobachters liegt ungefaehr dort, wo die Schiene endet.
  useEffect(() => {
    const fuss = document.querySelector('.lp-fuss')
    if (!fuss) return
    const beobachter = new IntersectionObserver(
      ([eintrag]) => setAmFuss(eintrag.isIntersecting),
      { rootMargin: '0px 0px -25% 0px' },
    )
    beobachter.observe(fuss)
    return () => beobachter.disconnect()
  }, [])

  // Fortschrittslinie
  useEffect(() => {
    let angefordert = false
    function messen() {
      angefordert = false
      const el = fortschritt.current
      if (!el) return
      const gesamt = document.documentElement.scrollHeight - window.innerHeight
      const anteil = gesamt > 0 ? Math.min(1, Math.max(0, window.scrollY / gesamt)) : 0
      el.style.transform = `scaleX(${anteil})`
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
  }, [])

  // Verzeichnis mit Escape schließen
  useEffect(() => {
    if (!offen) return
    function beiTaste(e: KeyboardEvent) {
      if (e.key === 'Escape') setOffen(false)
    }
    document.addEventListener('keydown', beiTaste)
    return () => document.removeEventListener('keydown', beiTaste)
  }, [offen])

  return (
    <>
      <div className="lp-fortschritt" aria-hidden="true">
        <div ref={fortschritt} />
      </div>

      <button
        type="button"
        className="lp-inhalt-knopf"
        aria-expanded={offen}
        aria-controls="lp-verzeichnis"
        onClick={() => setOffen((o) => !o)}
      >
        {offen ? 'Schließen' : 'Inhalt'}
      </button>

      <div
        id="lp-verzeichnis"
        className={offen ? 'lp-verzeichnis offen' : 'lp-verzeichnis'}
        hidden={!offen}
      >
        <div className="lp-verzeichnis-innen">
          <p className="lp-verzeichnis-titel">Inhalt</p>
          <ol>
            {abschnitte.map((a) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  onClick={() => setOffen(false)}
                  aria-current={a.id === aktiv ? 'true' : undefined}
                >
                  <span className="nr">{a.nr}</span>
                  <span>{a.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <nav className={amFuss ? 'lp-schiene weg' : 'lp-schiene'} aria-label="Abschnitte">
        <ol>
          {abschnitte.map((a) => (
            <li key={a.id}>
              <a href={`#${a.id}`} aria-current={a.id === aktiv ? 'true' : undefined}>
                <span className="nr">{a.nr}</span>
                <span className="was">{a.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
