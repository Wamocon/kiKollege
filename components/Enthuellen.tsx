'use client'

import { useEffect } from 'react'

/** Blendet Elemente mit data-enthuellen ein, sobald sie ins Bild kommen.
 *  Rendert selbst nichts. Wer weniger Bewegung eingestellt hat, sieht alles
 *  sofort, darum kuemmert sich das Stylesheet. */
export function Enthuellen() {
  useEffect(() => {
    const elemente = Array.from(document.querySelectorAll('[data-enthuellen]'))
    if (!elemente.length) return

    const sparsam = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (sparsam || !('IntersectionObserver' in window)) {
      elemente.forEach((el) => el.classList.add('sichtbar'))
      return
    }

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        for (const eintrag of eintraege) {
          if (!eintrag.isIntersecting) continue
          eintrag.target.classList.add('sichtbar')
          beobachter.unobserve(eintrag.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.06 },
    )
    elemente.forEach((el) => beobachter.observe(el))
    return () => beobachter.disconnect()
  }, [])

  return null
}
