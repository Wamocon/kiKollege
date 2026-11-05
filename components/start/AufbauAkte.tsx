'use client'

import { useEffect, useRef, useState } from 'react'

/** Die Akte als Datei: links die acht Fragen, rechts die Datei mit den Zeilen, in denen
 *  die gewählte Antwort steht. Im Bild läuft die Auswahl langsam von selbst durch; wer
 *  eine Frage anfasst, behält sie. */

type Schicht = { nr: number; name: string; frage: string; datei: string }
type Gruppe = { name: string; schichten: number[]; erbt: boolean }
type Datei = { name: string; stand: string; kopf: string; rumpf: string; auszug: string }
type Zeile = { text: string; teil: 'strich' | 'kopf' | 'rumpf'; feld: string }

const TAKT = 2600

/** Zerlegt den Auszug in Kopf und Rumpf; eingerückte Zeilen gehören zum Feld davor. */
function zerlege(auszug: string): Zeile[] {
  let imKopf = false
  let striche = 0
  let feld = ''
  return auszug.split('\n').map((text) => {
    if (text.trim() === '---') {
      striche += 1
      imKopf = striche === 1
      return { text, teil: 'strich', feld: '' }
    }
    if (!imKopf) return { text, teil: 'rumpf', feld: '' }
    feld = text.match(/^([a-zA-Z]+):/)?.[1] ?? feld
    return { text, teil: 'kopf', feld }
  })
}

/** Steht die Antwort dieser Schicht in dieser Zeile? */
function trifft(z: Zeile, s: Schicht) {
  return s.datei.split(' · ').some((wo) => (wo.startsWith('im Auftragstext') ? z.teil === 'rumpf' : wo === z.feld))
}

export function AufbauAkte({
  schichten,
  gruppen,
  datei,
  erbe,
}: {
  schichten: Schicht[]
  gruppen: Gruppe[]
  datei: Datei
  erbe: string
}) {
  const [aktiv, setAktiv] = useState(schichten[0].nr)
  const [gefasst, setGefasst] = useState(false)
  const wurzel = useRef<HTMLDivElement>(null)
  const zeilen = zerlege(datei.auszug)
  const gewaehlt = schichten.find((s) => s.nr === aktiv) ?? schichten[0]

  useEffect(() => {
    if (gefasst || matchMedia('(prefers-reduced-motion: reduce)').matches || !wurzel.current) return
    let uhr: number | undefined
    const beobachter = new IntersectionObserver(([e]) => {
      window.clearInterval(uhr)
      if (!e.isIntersecting) return
      uhr = window.setInterval(() => setAktiv((a) => (a % schichten.length) + 1), TAKT)
    })
    beobachter.observe(wurzel.current)
    return () => {
      window.clearInterval(uhr)
      beobachter.disconnect()
    }
  }, [gefasst, schichten.length])

  const fasse = (nr: number) => {
    setGefasst(true)
    setAktiv(nr)
  }

  return (
    <div className="lb-akte" ref={wurzel}>
      <div className="lb-akte-fragen">
        {gruppen.map((g) => (
          <div className="lb-akte-gruppe" key={g.name}>
            <p className="lb-akte-gruppe-name">
              {g.name}
              <span className={g.erbt ? undefined : 'neu'}>{g.erbt ? 'ein zweiter erbt sie' : 'neu zu bauen'}</span>
            </p>
            <ol>
              {schichten
                .filter((s) => g.schichten.includes(s.nr))
                .map((s) => (
                  <li key={s.nr}>
                    <button
                      type="button"
                      className={s.nr === aktiv ? 'lb-akte-frage aktiv' : 'lb-akte-frage'}
                      aria-pressed={s.nr === aktiv}
                      onMouseEnter={() => fasse(s.nr)}
                      onFocus={() => fasse(s.nr)}
                      onClick={() => fasse(s.nr)}
                    >
                      <span className="lb-teil-nr">{String(s.nr).padStart(2, '0')}</span>
                      <b>{s.name}</b>
                      <span className="lb-akte-text">{s.frage}</span>
                      <code>{s.datei}</code>
                    </button>
                  </li>
                ))}
            </ol>
          </div>
        ))}
        <p className="lb-akte-erbe">{erbe}</p>
      </div>
      <figure className="lb-akte-datei">
        <p className="lb-akte-datei-kopf">
          <b>{datei.name}</b>
          <span>{datei.stand}</span>
        </p>
        <pre>
          {zeilen.map((z, i) => (
            <span className={`lb-akte-${z.teil}${trifft(z, gewaehlt) ? ' aktiv' : ''}`} key={i}>
              {z.text}
              {'\n'}
            </span>
          ))}
        </pre>
        <figcaption>
          <p>
            <b>Kopf</b> {datei.kopf}
          </p>
          <p>
            <b>Rumpf</b> {datei.rumpf}
          </p>
        </figcaption>
      </figure>
    </div>
  )
}
