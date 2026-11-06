import { daten } from '@/lib/daten'

/** So trainiert der Orchestrator wirklich: zwei Fassungen, der Betrieb und die Übung; der
 *  Prüfstand mit seinen 18 Fällen, Lauf für Lauf beim Scrollen (Bewegung.tsx); der Ablauf mit
 *  den Beteiligten und den Ebenen, an denen nachgeschärft wird. Alles aus training. */

const t = daten.training
const orchestrator = daten.mannschaft.koepfe.find((k) => k.id === 'orchestrator')

export function Training() {
  const l = t.laeufe
  if (!l) return null
  const faelle = l.bereiche.reduce((s, b) => s + b.faelle, 0)
  const z = l.zeilen
  const letzte = z.at(-1)!
  const erster = (text: string) => text.split(/(?<=\.)\s/)[0]
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

      <div className="lb-fassungen" data-lb-reveal>
        <div className="lb-fassung">
          <p className="lb-fassung-name">Im Betrieb</p>
          <p className="lb-fassung-zahl">
            {letzte.gelernt}
            <span>von {faelle}</span>
          </p>
          <p>gelernt. Mit dieser Fassung arbeitet heute der Projektverantwortliche.</p>
        </div>
        <div className="lb-fassungen-wege">
          <p className="hin">{erster(t.kreis[0].text)}</p>
          <p className="zurueck">Übernommen nach zwei Läufen mit allen {faelle} und dem Ja des Projektverantwortlichen</p>
        </div>
        <div className="lb-fassung uebung">
          <p className="lb-fassung-name">In der Übungsfassung</p>
          <p className="lb-fassung-zahl">
            {l.uebung?.gelernt ?? '–'}
            <span>von {faelle}</span>
          </p>
          <p>gelernt, in einem eigenen Übungsprofil, getrennt vom Betrieb.</p>
        </div>
      </div>

      <figure className="lb-pruefstand" data-lb-pruefstand={JSON.stringify(z.map((r) => [r.wann, r.was, r.erfuellt, r.wackelig, r.nie, r.gelernt, r.bereiche]))}>
        <div className="lb-ps-kopf">
          <p className="lb-ps-name">Der Prüfstand, Lauf für Lauf</p>
          <p className="lb-ps-wann" data-ps="wann">
            {letzte.wann}
          </p>
          <p className="lb-ps-zahl">
            <b data-ps="erfuellt">{letzte.erfuellt}</b> von {faelle} Fällen dreimal erfüllt
          </p>
          <p className="lb-ps-rest">
            wackelig <b data-ps="wackelig">{letzte.wackelig}</b>, nie <b data-ps="nie">{letzte.nie}</b>, im Betrieb gelernt{' '}
            <b data-ps="gelernt">{letzte.gelernt}</b>
          </p>
          <p className="lb-ps-was" data-ps="was">
            {letzte.was}
          </p>
        </div>
        <div className="lb-ps-felder">
          {l.bereiche.map((b, i) => (
            <div className="lb-ps-bereich" key={b.name}>
              <p>{b.name}</p>
              <div className="lb-ps-kacheln" data-ps-bereich={i}>
                {Array.from({ length: b.faelle }, (_, n) => (
                  <i key={n} className={n < letzte.bereiche[i] ? 'erfuellt' : undefined} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <ol className="lb-ps-leiste" aria-hidden="true">
          {z.map((r, i) => (
            <li key={r.wann} className={i === z.length - 1 ? 'aktiv' : undefined} data-ps-lauf={i}>
              <span>{tag(r.wann) !== tag(z[i - 1]?.wann ?? '') ? tag(r.wann) : ''}</span>
            </li>
          ))}
        </ol>
        <figcaption>
          {l.satz} Rot ist ein Fall, der in diesem Lauf dreimal richtig war.
        </figcaption>
      </figure>

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
