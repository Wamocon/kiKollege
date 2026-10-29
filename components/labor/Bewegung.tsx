'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/** Die ganze Bewegung des Labors an einer Stelle: Vorhang, geglättetes
 *  Scrollen, Einblendungen, Zähler, Parallaxe, die waagerechte Galerie, die
 *  Schritte neben dem Chat, Mauszeiger und magnetische Knöpfe. Wer reduzierte
 *  Bewegung eingestellt hat, bekommt nur Kopfleiste, Menü und Anker; ohne
 *  JavaScript bleibt die Seite vollständig lesbar. */
export function Bewegung() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const doc = document.documentElement
    const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches
    const aufraeumen: (() => void)[] = []
    const auf = <K extends keyof WindowEventMap>(ziel: Window | Document | Element, typ: K | string, fn: EventListener, opt?: AddEventListenerOptions | boolean) => {
      ziel.addEventListener(typ, fn, opt)
      aufraeumen.push(() => ziel.removeEventListener(typ, fn, opt))
    }

    // Kopfleiste: beim Abwärtsscrollen weg, beim Aufwärtsscrollen da ----------
    // Über einer dunklen Bühne wird auch die Leiste dunkel
    const kopf = document.querySelector<HTMLElement>('.lb-kopf')
    let zuletzt = window.scrollY
    const kopfLauf = () => {
      const y = window.scrollY
      kopf?.classList.toggle('versteckt', y > zuletzt && y > 140)
      const unter = document
        .elementsFromPoint(window.innerWidth / 2, 32)
        .find((e) => !kopf?.contains(e))
        ?.closest('.lb-szene')
      kopf?.classList.toggle('dunkel', !!unter?.classList.contains('lb-buehne'))
      zuletzt = y
    }
    auf(window, 'scroll', kopfLauf, { passive: true })
    kopfLauf()

    // Menü auf dem Handy -----------------------------------------------------
    const knopf = document.querySelector<HTMLButtonElement>('.lb-kopf-knopf')
    const menue = document.querySelector<HTMLElement>('.lb-kopf-nav')
    if (knopf && menue) {
      auf(knopf, 'click', () => {
        const offen = knopf.getAttribute('aria-expanded') === 'true'
        knopf.setAttribute('aria-expanded', String(!offen))
        menue.classList.toggle('offen', !offen)
      })
      auf(menue, 'click', (e) => {
        if ((e.target as HTMLElement).closest('a')) {
          knopf.setAttribute('aria-expanded', 'false')
          menue.classList.remove('offen')
        }
      })
    }

    // Ein Anker auf etwas in zugeklappten Einzelheiten klappt sie auf ----------
    const oeffneZiel = (hash: string) => {
      if (!hash || hash === '#') return null
      const ziel = document.getElementById(decodeURIComponent(hash.slice(1)))
      const details = ziel?.closest('details')
      if (details && !details.open) details.open = true
      return ziel
    }
    oeffneZiel(location.hash)?.scrollIntoView()
    auf(window, 'hashchange', () => oeffneZiel(location.hash)?.scrollIntoView())

    if (ruhig) {
      document.querySelector('.lb-vorhang')?.remove()
      return () => aufraeumen.forEach((f) => f())
    }

    doc.classList.add('lb-bewegt')
    aufraeumen.push(() => doc.classList.remove('lb-bewegt'))

    // Geglättetes Scrollen, im Takt von GSAP ----------------------------------
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 })
    lenis.on('scroll', ScrollTrigger.update)
    const takt = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(takt)
    gsap.ticker.lagSmoothing(0)
    aufraeumen.push(() => {
      gsap.ticker.remove(takt)
      lenis.destroy()
    })
    auf(document, 'click', (e) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!a) return
      const ziel = oeffneZiel(a.getAttribute('href')!)
      if (!ziel) return
      e.preventDefault()
      history.pushState(null, '', a.getAttribute('href'))
      ScrollTrigger.refresh()
      lenis.scrollTo(ziel, { offset: -72, duration: 1.2 })
    })
    // Einzelheiten ändern die Höhe der Seite; Galerie und Anker rechnen neu
    auf(document, 'toggle', () => {
      lenis.resize()
      ScrollTrigger.refresh()
    }, true)

    const ctx = gsap.context(() => {
      // Wörter einzeln, damit Überschriften gestaffelt hereinkommen
      for (const el of document.querySelectorAll<HTMLElement>('[data-lb-split]')) {
        const teile = el.childElementCount ? [...el.children] as HTMLElement[] : [el]
        for (const t of teile) {
          const woerter = (t.textContent ?? '').split(/(\s+)/)
          t.textContent = ''
          for (const w of woerter) {
            if (/^\s+$/.test(w)) { t.append(w); continue }
            const huelle = document.createElement('span')
            huelle.className = 'lb-wort'
            const innen = document.createElement('span')
            innen.textContent = w
            huelle.append(innen)
            t.append(huelle)
          }
        }
      }

      // Vorhang, höchstens eine Sekunde ----------------------------------------
      const vorhang = document.querySelector<HTMLElement>('.lb-vorhang')
      const start = gsap.timeline({ defaults: { ease: 'power4.inOut' } })
      if (vorhang) {
        start
          .from('.lb-vorhang-wort', { yPercent: 110, duration: 0.35, ease: 'power3.out' })
          .to('.lb-vorhang-wort', { opacity: 0, duration: 0.15 }, '+=0.05')
          .to('.lb-vorhang-tuer.oben', { yPercent: -100, duration: 0.45 }, '<')
          .to('.lb-vorhang-tuer.unten', { yPercent: 100, duration: 0.45 }, '<')
          .add(() => vorhang.remove())
      }
      start.from('#start .lb-wort > span', { yPercent: 110, duration: 0.9, stagger: 0.06, ease: 'power4.out' }, vorhang ? '-=0.3' : 0)

      // Überschriften der übrigen Szenen beim Hereinscrollen
      for (const el of document.querySelectorAll<HTMLElement>('[data-lb-split]')) {
        if (el.closest('#start')) continue
        gsap.from(el.querySelectorAll('.lb-wort > span'), {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.05,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      }

      // Einzelne Elemente und gestaffelte Gruppen
      for (const el of document.querySelectorAll<HTMLElement>('[data-lb-reveal]')) {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        })
      }
      for (const el of document.querySelectorAll<HTMLElement>('[data-lb-staffel]')) {
        gsap.from(el.children, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        })
      }

      // Zahlen zählen hoch
      for (const el of document.querySelectorAll<HTMLElement>('[data-lb-zahl]')) {
        const ziel = Number(el.dataset.lbZahl)
        const wert = { n: 0 }
        gsap.to(wert, {
          n: ziel,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%' },
          onUpdate: () => { el.textContent = String(Math.round(wert.n)) },
        })
      }

      // Parallaxe: Tiefe als Anteil der Szenenhöhe
      for (const el of document.querySelectorAll<HTMLElement>('[data-lb-tiefe]')) {
        const tiefe = Number(el.dataset.lbTiefe)
        gsap.to(el, {
          yPercent: tiefe * -100,
          ease: 'none',
          scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }

      // Balken des Fortschritts wachsen von links
      gsap.from('.lb-lauf-balken', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.1,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.lb-laeufe-liste', start: 'top 85%' },
      })

      const mm = gsap.matchMedia()

      // Waagerechte Galerie der Funktionen, nur auf breiten Bildschirmen -------
      mm.add('(min-width: 900px)', () => {
        const fenster = document.querySelector<HTMLElement>('.lb-galerie-fenster')
        const spur = document.querySelector<HTMLElement>('.lb-galerie-spur')
        if (!fenster || !spur) return
        const weg = () => Math.max(0, spur.scrollWidth - fenster.clientWidth)
        gsap.to(spur, {
          x: () => -weg(),
          ease: 'none',
          scrollTrigger: {
            trigger: fenster,
            start: 'center center',
            end: () => `+=${weg()}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
      })

      // Schritte der Anleitung färben die passenden Nachrichten im Chat
      mm.add('(min-width: 900px)', () => {
        const nachrichten = [...document.querySelectorAll<HTMLElement>('.lb-nachricht')]
        const setze = (i: number) => nachrichten.forEach((n) => n.classList.toggle('aktiv', Number(n.dataset.lbZu) <= i))
        setze(-1)
        for (const s of document.querySelectorAll<HTMLElement>('[data-lb-schritt]')) {
          const i = Number(s.dataset.lbSchritt)
          ScrollTrigger.create({
            trigger: s,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => setze(i),
            onEnterBack: () => setze(i),
            onLeaveBack: () => setze(i - 1),
            toggleClass: { targets: s, className: 'aktiv' },
          })
        }
        return () => nachrichten.forEach((n) => n.classList.add('aktiv'))
      })

      // Mauszeiger und magnetische Knöpfe, nur mit feiner Maus ------------------
      mm.add('(hover: hover) and (pointer: fine)', () => {
        const zeiger = document.querySelector<HTMLElement>('.lb-zeiger')
        if (!zeiger) return
        doc.classList.add('lb-mit-zeiger')
        const ring = zeiger.querySelector<HTMLElement>('.lb-zeiger-ring')!
        const punkt = zeiger.querySelector<HTMLElement>('.lb-zeiger-punkt')!
        const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
        const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })
        const px = gsap.quickTo(punkt, 'x', { duration: 0.08 })
        const py = gsap.quickTo(punkt, 'y', { duration: 0.08 })
        const bewegen = (e: PointerEvent) => {
          zeiger.classList.add('da')
          rx(e.clientX); ry(e.clientY); px(e.clientX); py(e.clientY)
          const ueber = (e.target as HTMLElement).closest('a, button, summary')
          zeiger.classList.toggle('gross', !!ueber)
        }
        window.addEventListener('pointermove', bewegen)

        const magnete = [...document.querySelectorAll<HTMLElement>('[data-lb-magnet]')]
        const weg: (() => void)[] = []
        for (const m of magnete) {
          const mx = gsap.quickTo(m, 'x', { duration: 0.5, ease: 'power3.out' })
          const my = gsap.quickTo(m, 'y', { duration: 0.5, ease: 'power3.out' })
          const ziehen = (e: PointerEvent) => {
            const r = m.getBoundingClientRect()
            mx((e.clientX - (r.left + r.width / 2)) * 0.25)
            my((e.clientY - (r.top + r.height / 2)) * 0.35)
          }
          const loslassen = () => gsap.to(m, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
          m.addEventListener('pointermove', ziehen)
          m.addEventListener('pointerleave', loslassen)
          weg.push(() => {
            m.removeEventListener('pointermove', ziehen)
            m.removeEventListener('pointerleave', loslassen)
          })
        }
        return () => {
          window.removeEventListener('pointermove', bewegen)
          weg.forEach((f) => f())
          doc.classList.remove('lb-mit-zeiger')
        }
      })
      aufraeumen.push(() => mm.revert())
    })
    aufraeumen.push(() => ctx.revert())

    // Schriften und Bilder ändern Maße; danach einmal neu messen
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => aufraeumen.reverse().forEach((f) => f())
  }, [])

  return null
}
