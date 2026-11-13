import type { CSSProperties } from 'react'
import { daten } from '@/lib/daten'

/** So trainiert der Orchestrator wirklich: der Prüfstand mit einer Zahl und dem Verlauf aller
 *  Läufe, beim Scrollen läuft er durch (Bewegung.tsx); ein Satz zur Übernahme in den Betrieb;
 *  der Ablauf mit den Beteiligten und den Ebenen, an denen nachgeschärft wird. Alles aus training.
 *  Die Einzelwerte je Lauf (erfüllt, wackelig, nie, Bereiche) stehen in den Daten und in der langen Fassung. */

const t = daten.training
const orchestrator = daten.mannschaft.koepfe.find((k) => k.id === 'orchestrator')

export function Training() {
  const l = t.laeufe
  if (!l) return null
  const faelle = l.bereiche.reduce((s, b) => s + b.faelle, 0)
  const z = l.zeilen
  const letzte = z.at(-1)!
  const tag = (wann: string) => wann.match(/\d{2}\.\d{2}\./)?.[0] ?? wann
  const name = orchestrator?.name ?? 'Der Orchestrator'
  return (
    <div className="lb-training">
      <h3 className="lb-teilkopf" data-lb-reveal>
        So trainiert {name}.
      </h3>
      <p className="lb-aufbau-text" data-lb-reveal>
        {t.satz}
      </p>

      <figure className="lb-pruefstand" data-lb-pruefstand={JSON.stringify(z.map((r) => [tag(r.wann), r.gelernt]))}>
        <p className="lb-ps-name">Der Prüfstand</p>
        <p className="lb-ps-zahl">
          <b data-ps="gelernt">{letzte.gelernt}</b> von {faelle} Prüffällen gelernt
          <span className="lb-ps-wann">
            Stand <span data-ps="wann">{tag(letzte.wann)}</span>
          </span>
        </p>
        <ol className="lb-ps-verlauf" aria-hidden="true">
          {z.map((r, i) => (
            <li
              key={r.wann}
              className={i === z.length - 1 ? 'erreicht aktiv' : 'erreicht'}
              data-ps-lauf={i}
              style={{ '--h': r.gelernt / faelle } as CSSProperties}
            >
              <i />
            </li>
          ))}
        </ol>
        <p className="lb-ps-achse" aria-hidden="true">
          <span>{tag(z[0].wann)}</span>
          <span>{tag(letzte.wann)}</span>
        </p>
        {l.kurz ? <figcaption>{l.kurz}</figcaption> : null}
      </figure>

      <p className="lb-fassung-satz" data-lb-reveal>
        Neue Fassungen üben getrennt vom Betrieb und gehen erst nach vier Läufen hintereinander mit höchstens zwei Prozent falschen
        Antworten und mit dem Ja des Projektverantwortlichen in den Betrieb.
      </p>

      <ol className="lb-ablauf" data-lb-staffel>
        {t.kreis.map((s, i) => (
          <li key={s.titel}>
            <span className="lb-teil-nr">{String(i + 1).padStart(2, '0')}</span>
            <b>{s.titel}</b>
            <span className="lb-teil-kurz">{s.kurz}</span>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="lb-training-unten">
        <div data-lb-reveal>
          <h4>Nachgeschärft wird, wo die Schwäche liegt</h4>
          <ol className="lb-ebenen">
            {t.ebenen.map((e, i) => (
              <li key={e.titel} className={i === t.ebenen.length - 1 ? 'zuletzt' : undefined}>
                <b>{e.titel}</b>
                <span>{e.text}</span>
              </li>
            ))}
          </ol>
          <p className="lb-training-klein">{t.ebenenSatz}</p>
        </div>
        <div data-lb-reveal>
          <h4>Wer was tut</h4>
          <dl className="lb-wer">
            {t.wer.map((x) => (
              <div key={x.wer}>
                <dt>{x.wer}</dt>
                <dd>{x.tut}</dd>
              </div>
            ))}
          </dl>
          <p className="lb-training-klein">{t.regel}</p>
        </div>
      </div>
    </div>
  )
}
