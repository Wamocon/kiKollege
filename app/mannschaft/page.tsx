import type { Metadata } from 'next'

import { Kopf } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Hinweis, Marker } from '@/components/bausteine'
import { daten, datum } from '@/lib/daten'
import { istIntern, nurSichtbare, sichtbar } from '@/lib/freigabe'
import { pfad } from '@/lib/pfad'

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

  /** Die ids in „wer“ als Namen, in der Reihenfolge der Daten. */
  const werNamen = (wer: string[]) =>
    wer
      .map((id) => koepfe.find((k) => k.id === id)?.name ?? id)
      .join(', ')

  const sichtbareMitarbeiter = nurSichtbare(s.mitarbeiter)

  return (
    <>
      <Kopf />

      <div className="rumpf">
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
            <p className="fussnote">
              Ein Steckbrief, der hier fehlt, ist in dieser Fassung nicht sichtbar.
            </p>
          </section>

          {/* 02 ------------------------------------------------------------ */}
          {sichtbareMitarbeiter.map((m) => {
            const intern = m.freigabe === 'intern'
            return (
              <section key={m.kopf} id={m.kopf}>
                <h2>{titel(m.kopf)}</h2>
                <div className="prosa">
                  <p>{m.satz}</p>
                  {intern && istIntern ? <Marker art="intern">nur intern</Marker> : null}
                </div>

                <h3 style={{ marginTop: '1.8rem' }}>Aufgaben</h3>
                <ul className="liste">
                  {m.aufgaben.map((p, i) => (
                    <li key={i}>
                      {p.was}
                      {p.beispiel ? (
                        <>
                          {' '}
                          Beispiel: {p.beispiel}
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <h3 style={{ marginTop: '1.8rem' }}>Ziele</h3>
                <ul className="liste">
                  {m.ziele.map((z, i) => (
                    <li key={i}>
                      {z.bis ? (
                        <>
                          Bis {datum(z.bis)}.
                        </>
                      ) : null}{' '}
                      {z.was}{' '}
                      {z.erreicht ? (
                        <Marker art="gemessen">erreicht</Marker>
                      ) : (
                        <Marker art="offen">offen</Marker>
                      )}
                    </li>
                  ))}
                </ul>

                <h3 style={{ marginTop: '1.8rem' }}>Werkzeuge</h3>
                <ul className="liste">
                  {m.werkzeuge.map((p, i) => (
                    <li key={i}>
                      {p.was}
                      {p.beispiel ? (
                        <>
                          {' '}
                          Beispiel: {p.beispiel}
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>

                <div className="prosa" style={{ marginTop: '1.3rem' }}>
                  <p>
                    Tut nie: <b>{m.tutNie}</b>
                  </p>
                </div>
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
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '12rem' }}>Werkzeug</th>
                    <th>Was es tut</th>
                    <th>Beispiel</th>
                    <th style={{ width: '14rem' }}>Wer es hat</th>
                  </tr>
                </thead>
                <tbody>
                  {nurSichtbare(s.werkzeuge.inBetrieb).map((w) => (
                    <tr key={w.name}>
                      <td>
                        <b>{w.name}</b>
                      </td>
                      <td>{w.was}</td>
                      <td>{w.beispiel}</td>
                      <td>{werNamen(w.wer)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ marginTop: '1.8rem' }}>Gesperrt</h3>
            <div className="tabellenrahmen">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '12rem' }}>Werkzeug</th>
                    <th>Was es täte</th>
                    <th>Warum gesperrt</th>
                  </tr>
                </thead>
                <tbody>
                  {nurSichtbare(s.werkzeuge.gesperrt).map((w) => (
                    <tr key={w.name}>
                      <td>
                        <b>{w.name}</b>
                      </td>
                      <td>{w.was}</td>
                      <td>{w.warum}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
