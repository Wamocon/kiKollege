import type { Metadata } from 'next'

import { Kopf } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Marker } from '@/components/bausteine'
import { daten, datum } from '@/lib/daten'
import { istIntern, nurSichtbare, sichtbar } from '@/lib/freigabe'
import { WerkzeugSymbol } from '@/components/WerkzeugSymbol'

export const metadata: Metadata = {
  title: 'Mannschaft',
  description: 'Steckbriefe der KI-Mitarbeiter mit Aufgaben, Zielen und Werkzeugen.',
}

export default function Seite() {
  const d = daten
  const s = d.steckbriefe
  const koepfe = d.mannschaft.koepfe

  /** Rolle mit Namen, wie in der Tabelle der Mannschaft auf /stand. */
  const titel = (kopf: string) => {
    const k = koepfe.find((k) => k.id === kopf)
    if (!k) return kopf
    return k.name ? `${k.rolle}, ${k.name}` : k.rolle
  }

  const sichtbareMitarbeiter = nurSichtbare(s.mitarbeiter)

  return (
    <>
      <Kopf titel="Die KI-Mitarbeiter im Steckbrief" />

      <div className="rumpf">
        <nav className="nav" aria-label="Abschnitte dieser Seite">
          <p className="nav-titel">Inhalt</p>
          <ol>
            <li>
              <a href="#ueberblick">
                <span className="nr">01</span>
                <span>Überblick</span>
              </a>
            </li>
            {sichtbareMitarbeiter.map((m, i) => (
              <li key={m.kopf}>
                <a href={`#${m.kopf}`}>
                  <span className="nr">{String(i + 2).padStart(2, '0')}</span>
                  <span>{titel(m.kopf)}</span>
                </a>
              </li>
            ))}
            <li>
              <a href="#werkzeuge">
                <span className="nr">{String(sichtbareMitarbeiter.length + 2).padStart(2, '0')}</span>
                <span>Alle Werkzeuge von Hermes</span>
              </a>
            </li>
          </ol>
        </nav>
        <main className="inhalt" id="inhalt">
          {/* 01 ------------------------------------------------------------ */}
          <section id="ueberblick">
            <h2>Die KI-Mitarbeiter im Steckbrief</h2>
            <div className="prosa">
              <p className="lead">{s.satz}</p>
              <p>{s.lesehilfe}</p>
            </div>

            <div className="tabellenrahmen">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '16rem' }}>Rolle</th>
                    <th style={{ width: '9rem' }}>Zustand</th>
                    <th>Steckbrief</th>
                  </tr>
                </thead>
                <tbody>
                  {sichtbareMitarbeiter.map((m) => (
                    <tr key={m.kopf}>
                      <td>
                        <b>{titel(m.kopf)}</b>
                      </td>
                      <td>{koepfe.find((k) => k.id === m.kopf)?.zustand ?? '—'}</td>
                      <td>
                        <a href={`#${m.kopf}`}>Zum Steckbrief</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 02 ------------------------------------------------------------ */}
          {sichtbareMitarbeiter.map((m) => {
            const k = koepfe.find((kk) => kk.id === m.kopf)!
            const intern = m.freigabe === 'intern'
            const initiale = (k.name ?? k.rolle).charAt(0).toUpperCase()
            /** „Tut nie“ als Teile: ohne den Punkt am Ende, an „, " getrennt,
             *  jeder Teil mit großem Anfangsbuchstaben. */
            const nieTeile = m.tutNie
              .replace(/\.\s*$/, '')
              .split(', ')
              .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
            return (
              <section key={m.kopf} id={m.kopf}>
                <article className="steckbrief">
                  <header className="sb-kopf">
                    <span className="sb-initiale" aria-hidden="true">
                      {initiale}
                    </span>
                    <div>
                      <h2>{k.name ?? k.rolle}</h2>
                      <p className="sb-rolle">
                        {k.rolle} · {k.kern}
                      </p>
                    </div>
                    <span className={`sb-marke ${k.zustand}`}>{k.marke ?? k.zustand}</span>
                  </header>
                  <p className="sb-satz">{m.satz}</p>
                  {intern && istIntern ? <Marker art="intern">nur intern</Marker> : null}
                  <div className="sb-spalten">
                    <div>
                      <h3>Aufgaben</h3>
                      <ul className="sb-aufgaben">
                        {m.aufgaben.map((p, i) => (
                          <li key={i}>
                            <b>{p.titel}</b>
                            {p.was}
                            {p.beispiel ? (
                              <p className="sb-beispiel">
                                <span>Beispiel</span>
                                {p.beispiel}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>Ziele</h3>
                      <ol className="sb-ziele">
                        {m.ziele.map((z, i) => (
                          <li key={i} className={z.erreicht ? 'erreicht' : 'offen'}>
                            <span className="sb-wann">
                              {z.bis ? `bis ${datum(z.bis)}` : 'ohne Datum'} ·{' '}
                              {z.erreicht ? 'erreicht' : 'offen'}
                            </span>
                            {z.was}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  {m.werkzeuge.length > 0 ? (
                    <>
                      <h3>Werkzeuge</h3>
                      <ul className="sb-abzeichen">
                        {m.werkzeuge.map((w, i) => (
                          <li key={i}>
                            <details>
                              <summary>
                                {w.art ? <WerkzeugSymbol art={w.art} /> : null}
                                {w.titel}
                              </summary>
                              <p>
                                {w.was}
                                {w.beispiel ? ` Beispiel: ${w.beispiel}` : ''}
                              </p>
                            </details>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  <h3>Tut nie</h3>
                  <ul className="sb-abzeichen sb-nie">
                    {nieTeile.map((teil, i) => (
                      <li key={i}>
                        <span aria-hidden="true">✕</span>
                        {teil}
                      </li>
                    ))}
                  </ul>
                </article>
              </section>
            )
          })}

          {/* 03 ------------------------------------------------------------ */}
          <section id="werkzeuge">
            <h2>Alle Werkzeuge von Hermes</h2>
            <div className="prosa">
              <p>{s.werkzeuge.satz}</p>
            </div>

            <h3 style={{ marginTop: '1.8rem' }}>In Betrieb</h3>
            <div className="tabellenrahmen">
              {(() => {
                const inBetrieb = nurSichtbare(s.werkzeuge.inBetrieb)
                /** Spalten: die Köpfe, die in irgendeinem „wer“ vorkommen und
                 *  sichtbar sind, in der Reihenfolge von mannschaft.koepfe. */
                const werAlle = new Set(inBetrieb.flatMap((w) => w.wer))
                const spalten = koepfe.filter(
                  (k) => werAlle.has(k.id) && sichtbar(k),
                )
                return (
                  <table className="sb-matrix">
                    <thead>
                      <tr>
                        <th aria-label="Werkzeug"></th>
                        {spalten.map((k) => (
                          <th key={k.id}>{k.name ?? k.rolle}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inBetrieb.map((w) => (
                        <tr key={w.name}>
                          <th scope="row">
                            <details>
                              <summary>
                                <WerkzeugSymbol art={w.art} /> {w.name}
                              </summary>
                              <p>
                                {w.was} Beispiel: {w.beispiel}
                              </p>
                            </details>
                          </th>
                          {spalten.map((k) => (
                            <td key={k.id}>
                              {w.wer.includes(k.id) ? (
                                <span className="sb-ja" aria-label="hat es">
                                  ●
                                </span>
                              ) : (
                                <span className="sb-nein" aria-label="hat es nicht">
                                  –
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
            </div>

            <h3 style={{ marginTop: '1.8rem' }}>Gesperrt</h3>
            <dl className="sb-gesperrt">
              {nurSichtbare(s.werkzeuge.gesperrt).map((w) => (
                <div key={w.name}>
                  <dt>{w.name}</dt>
                  <dd>
                    {w.was} Warum gesperrt: {w.warum}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="prosa" style={{ marginTop: '1.3rem' }}>
              <p>{s.werkzeuge.kanaele}</p>
            </div>
          </section>

          <p className="fussnote" style={{ marginTop: '2rem' }}>
            {s.quelle} Stand {datum(s.stand)}.
          </p>
        </main>
      </div>

      <Fuss />
    </>
  )
}
