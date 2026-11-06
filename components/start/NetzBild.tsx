'use client'

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

/** Das Netz der Ablage zum Anfassen. Eine Notiz oder ein Bereich unter der Maus wird
 *  hervorgehoben; eine Notiz lässt sich ziehen, ihre Nachbarn federn mit und alles kehrt an
 *  seinen Platz zurück, wie in der Graphansicht von Obsidian. Zoomen über die Knöpfe, damit
 *  das Mausrad die Seite scrollt. Auf dem Handy genügt Antippen. */

export type NetzBereich = {
  id: string
  name: string
  kurz: string
  gruppe: string
  erklaerung: string
  anzahl: number
  mitte: [number, number]
  /** Wo der Name im Bild steht, auseinandergeschoben, damit sich keiner überdeckt; null ohne Namen */
  schild: [number, number] | null
}

type Fokus = { art: 'bereich'; b: number } | { art: 'knoten'; i: number } | null

const STUFEN = [1, 1.6, 2.6, 4]
const groesse = (grad: number) => Math.min(9, 2.2 + Math.sqrt(grad) * 0.9)
const strecken = (p: number[][], liste: number[][]) =>
  liste.map(([a, b]) => `M${p[a][0].toFixed(1)} ${p[a][1].toFixed(1)}L${p[b][0].toFixed(1)} ${p[b][1].toFixed(1)}`).join('')

export function NetzBild({
  punkte,
  kanten,
  rahmen,
  bereiche,
}: {
  punkte: number[][]
  kanten: number[][]
  rahmen: [number, number, number, number]
  bereiche: NetzBereich[]
}) {
  const bild = useRef<SVGSVGElement>(null)
  const kreise = useRef<(SVGCircleElement | null)[]>([])
  const grund = useRef<SVGPathElement>(null)
  const hell = useRef<SVGPathElement>(null)
  const pos = useRef(punkte.map((p) => [p[0], p[1]]))
  const tempo = useRef(punkte.map(() => [0, 0]))
  const gezogen = useRef<number | null>(null)
  const schwenk = useRef<{ x: number; y: number; mx: number; my: number } | null>(null)
  const lauf = useRef<number | null>(null)
  const [fokus, setFokus] = useState<Fokus>(null)
  const [fest, setFest] = useState<number | null>(null)
  const [stufe, setStufe] = useState(0)
  const [mitte, setMitte] = useState<[number, number]>([rahmen[0] + rahmen[2] / 2, rahmen[1] + rahmen[3] / 2])
  const [tipp, setTipp] = useState<{ x: number; y: number; i: number } | null>(null)

  const nachbarn = useMemo(() => {
    const n = punkte.map(() => [] as number[])
    for (const [a, b] of kanten) {
      n[a].push(b)
      n[b].push(a)
    }
    return n
  }, [punkte, kanten])
  const ruhe = useMemo(() => kanten.map(([a, b]) => Math.hypot(punkte[a][0] - punkte[b][0], punkte[a][1] - punkte[b][1])), [punkte, kanten])
  const reihenfolge = useMemo(() => bereiche.map((_, b) => b).sort((a, b) => bereiche[b].anzahl - bereiche[a].anzahl), [bereiche])

  // Was hervorgehoben ist: der Bereich, die Notiz mit ihren Nachbarn, oder der fest gewählte Bereich
  const aktiv = fokus ?? (fest !== null ? ({ art: 'bereich', b: fest } as const) : null)
  const an = useMemo(() => {
    if (!aktiv) return null
    if (aktiv.art === 'knoten') return new Set([aktiv.i, ...nachbarn[aktiv.i]])
    return new Set(punkte.map((p, i) => (p[2] === aktiv.b ? i : -1)).filter((i) => i >= 0))
  }, [aktiv, nachbarn, punkte])
  const hellKanten = useMemo(() => {
    if (!aktiv) return []
    if (aktiv.art === 'knoten') return kanten.filter(([a, b]) => a === aktiv.i || b === aktiv.i)
    return kanten.filter(([a, b]) => punkte[a][2] === aktiv.b && punkte[b][2] === aktiv.b)
  }, [aktiv, kanten, punkte])
  const bereichImBlick = aktiv ? (aktiv.art === 'bereich' ? aktiv.b : punkte[aktiv.i][2]) : null

  // Ausschnitt: um die Mitte, je Stufe kleiner, nie über den Rahmen hinaus
  const k = STUFEN[stufe]
  const b = rahmen[2] / k
  const h = rahmen[3] / k
  const x = Math.min(Math.max(mitte[0] - b / 2, rahmen[0]), rahmen[0] + rahmen[2] - b)
  const y = Math.min(Math.max(mitte[1] - h / 2, rahmen[1]), rahmen[1] + rahmen[3] - h)

  const imBild = (e: ReactPointerEvent) => {
    const s = bild.current
    const m = s?.getScreenCTM()
    if (!s || !m) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }

  const zeichne = () => {
    const p = pos.current
    kreise.current.forEach((c, i) => {
      if (!c) return
      c.setAttribute('cx', p[i][0].toFixed(1))
      c.setAttribute('cy', p[i][1].toFixed(1))
    })
    grund.current?.setAttribute('d', strecken(p, kanten))
    hell.current?.setAttribute('d', strecken(p, hellKanten))
  }

  // Federn entlang der Verweise, dazu ein Zug zurück an den eigenen Platz
  const schritt = () => {
    const p = pos.current
    const v = tempo.current
    kanten.forEach(([a, c], n) => {
      const dx = p[c][0] - p[a][0]
      const dy = p[c][1] - p[a][1]
      const l = Math.hypot(dx, dy) || 1
      const f = (0.018 * (l - ruhe[n])) / l
      v[a][0] += dx * f
      v[a][1] += dy * f
      v[c][0] -= dx * f
      v[c][1] -= dy * f
    })
    let bewegt = 0
    p.forEach((q, i) => {
      if (i === gezogen.current) {
        v[i][0] = 0
        v[i][1] = 0
        return
      }
      v[i][0] = (v[i][0] + (punkte[i][0] - q[0]) * 0.02) * 0.8
      v[i][1] = (v[i][1] + (punkte[i][1] - q[1]) * 0.02) * 0.8
      q[0] += v[i][0]
      q[1] += v[i][1]
      bewegt += Math.abs(v[i][0]) + Math.abs(v[i][1])
    })
    zeichne()
    lauf.current = gezogen.current !== null || bewegt > 0.3 ? requestAnimationFrame(schritt) : null
  }
  const anstossen = () => {
    if (lauf.current === null) lauf.current = requestAnimationFrame(schritt)
  }

  const fassen = (e: ReactPointerEvent, i: number) => {
    if (e.pointerType === 'touch') return
    e.stopPropagation()
    bild.current?.setPointerCapture(e.pointerId)
    gezogen.current = i
    setTipp(null)
    anstossen()
  }
  const bewegen = (e: ReactPointerEvent) => {
    const q = imBild(e)
    if (!q) return
    if (gezogen.current !== null) {
      pos.current[gezogen.current] = q
      return
    }
    if (schwenk.current) {
      const s = schwenk.current
      setMitte([s.mx - (e.clientX - s.x) * (b / (bild.current?.clientWidth || 1)), s.my - (e.clientY - s.y) * (h / (bild.current?.clientHeight || 1))])
    }
  }
  const loslassen = () => {
    gezogen.current = null
    schwenk.current = null
  }
  const greifen = (e: ReactPointerEvent) => {
    if (stufe === 0 || e.pointerType === 'touch') return
    bild.current?.setPointerCapture(e.pointerId)
    schwenk.current = { x: e.clientX, y: e.clientY, mx: x + b / 2, my: y + h / 2 }
  }
  const zeige = (e: ReactPointerEvent, i: number) => {
    if (gezogen.current !== null) return
    const r = bild.current?.parentElement?.getBoundingClientRect()
    setFokus({ art: 'knoten', i })
    if (r) setTipp({ x: e.clientX - r.left, y: e.clientY - r.top, i })
  }

  const p = pos.current
  const gewaehlt = bereichImBlick !== null ? bereiche[bereichImBlick] : null
  return (
    <div className="lb-netz-bedienung">
      <div className="lb-netz-flaeche">
        <svg
          ref={bild}
          viewBox={`${x.toFixed(1)} ${y.toFixed(1)} ${b.toFixed(1)} ${h.toFixed(1)}`}
          role="img"
          aria-label={`Das Netz der Ablage in Obsidian: ${punkte.length} Notizen und ${kanten.length} Verweise in ${bereiche.length} Bereichen`}
          className={[an ? 'mit-fokus' : '', stufe > 0 ? 'gezoomt' : ''].join(' ')}
          onPointerDown={greifen}
          onPointerMove={bewegen}
          onPointerUp={loslassen}
          onPointerCancel={loslassen}
          onPointerLeave={() => {
            if (gezogen.current === null) {
              setFokus(null)
              setTipp(null)
            }
          }}
        >
          <path ref={grund} className="lb-netz-kanten" d={strecken(p, kanten)} />
          <path ref={hell} className="lb-netz-hell" d={strecken(p, hellKanten)} />
          {punkte.map((q, i) => (
            <circle
              key={i}
              ref={(c) => {
                kreise.current[i] = c
              }}
              className={`${bereiche[q[2]]?.gruppe ?? 'werkstatt'}${an?.has(i) ? ' an' : ''}${aktiv?.art === 'knoten' && aktiv.i === i ? ' ich' : ''}`}
              cx={p[i][0]}
              cy={p[i][1]}
              r={groesse(q[3])}
              onPointerDown={(e) => fassen(e, i)}
              onPointerEnter={(e) => zeige(e, i)}
              onPointerLeave={() => {
                if (gezogen.current === null) {
                  setFokus(null)
                  setTipp(null)
                }
              }}
              onClick={() => setFokus({ art: 'knoten', i })}
            />
          ))}
          {bereiche.map((bb, n) =>
            bb.schild ? (
              <text
                key={bb.id}
                className={`lb-netz-name${bereichImBlick === n ? ' an' : ''}`}
                x={bb.schild[0]}
                y={bb.schild[1]}
                textAnchor="middle"
              >
                {bb.kurz}
              </text>
            ) : null,
          )}
        </svg>
        {tipp ? (
          <p className="lb-netz-tipp" style={{ left: tipp.x, top: tipp.y }}>
            <b>{bereiche[punkte[tipp.i][2]]?.name}</b>
            {punkte[tipp.i][3] === 1 ? '1 Verweis' : `${punkte[tipp.i][3]} Verweise`}
          </p>
        ) : null}
        <div className="lb-netz-zoom">
          <button type="button" onClick={() => setStufe((s) => Math.min(STUFEN.length - 1, s + 1))} disabled={stufe === STUFEN.length - 1} aria-label="Näher heran">
            +
          </button>
          <button type="button" onClick={() => setStufe((s) => Math.max(0, s - 1))} disabled={stufe === 0} aria-label="Weiter weg">
            −
          </button>
          <button
            type="button"
            onClick={() => {
              setStufe(0)
              setMitte([rahmen[0] + rahmen[2] / 2, rahmen[1] + rahmen[3] / 2])
            }}
            disabled={stufe === 0}
            aria-label="Ganzes Netz"
          >
            ⤢
          </button>
        </div>
      </div>

      <div className="lb-netz-seite">
        <div className="lb-netz-erklaerung" aria-live="polite">
          {gewaehlt ? (
            <>
              <p className={`lb-netz-gruppe ${gewaehlt.gruppe}`}>
                {gewaehlt.gruppe === 'wissen' ? 'Wissen' : gewaehlt.gruppe === 'gedaechtnis' ? 'Gedächtnis' : 'Werkstatt'}
              </p>
              <h4>{gewaehlt.name}</h4>
              <p>{gewaehlt.erklaerung}</p>
              <p className="lb-netz-zahl">{gewaehlt.anzahl === 1 ? '1 Notiz' : `${gewaehlt.anzahl} Notizen`}</p>
            </>
          ) : (
            <>
              <h4>Was in der Ablage liegt</h4>
              <p>Ein Bereich in der Liste oder eine Notiz im Netz wird hervorgehoben, sobald die Maus darauf zeigt. Notizen lassen sich ziehen.</p>
            </>
          )}
        </div>
        <ul className="lb-netz-liste">
          {reihenfolge.map((n) => {
            const bb = bereiche[n]
            return (
              <li key={bb.id}>
                <button
                  type="button"
                  className={`${bb.gruppe}${bereichImBlick === n ? ' an' : ''}`}
                  aria-pressed={fest === n}
                  onPointerEnter={() => setFokus({ art: 'bereich', b: n })}
                  onPointerLeave={() => setFokus(null)}
                  onFocus={() => setFokus({ art: 'bereich', b: n })}
                  onBlur={() => setFokus(null)}
                  onClick={() => setFest((f) => (f === n ? null : n))}
                >
                  <span>{bb.name}</span>
                  <b>{bb.anzahl}</b>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
