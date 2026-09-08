'use client'

import { useEffect, useState } from 'react'

type Thema = 'system' | 'light' | 'dark'
const SCHLUESSEL = 'wmc-thema'
const FOLGE: Thema[] = ['system', 'light', 'dark']
const NAME: Record<Thema, string> = { system: 'System', light: 'Hell', dark: 'Dunkel' }

function lesen(): Thema {
  try {
    const t = localStorage.getItem(SCHLUESSEL)
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

export function ThemaSchalter() {
  // Der Serverstand kennt die Wahl des Lesers nicht. Bis der erste Effekt
  // gelaufen ist, bleibt der Knopf deshalb leer und wird erst dann beschriftet.
  const [thema, setThema] = useState<Thema | null>(null)

  useEffect(() => setThema(lesen()), [])

  function weiter() {
    const jetzt = thema ?? lesen()
    const naechstes = FOLGE[(FOLGE.indexOf(jetzt) + 1) % FOLGE.length]
    setThema(naechstes)
    try {
      if (naechstes === 'system') localStorage.removeItem(SCHLUESSEL)
      else localStorage.setItem(SCHLUESSEL, naechstes)
    } catch {
      // Privater Modus oder gesperrter Speicher: die Wahl gilt dann nur für diese Sitzung.
    }
    const wurzel = document.documentElement
    if (naechstes === 'system') wurzel.removeAttribute('data-theme')
    else wurzel.setAttribute('data-theme', naechstes)
  }

  return (
    <button type="button" className="thema" onClick={weiter} aria-live="polite">
      <span aria-hidden="true">Thema </span>
      <span className="thema-wert">{thema ? NAME[thema] : ' '}</span>
      <span className="nur-vorlesen"> umschalten</span>
    </button>
  )
}
