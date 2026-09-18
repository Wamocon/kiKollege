import { daten, datum, zahl, type Rubrik } from '@/lib/daten'

/** Die Rubriken des Unternehmenswissens, nach der Stufe, in der ein
 *  KI-Mitarbeiter sie liest. Die Ordnernamen stehen so da, wie sie in der
 *  Ablage heißen; tiefer geht die Liste nicht. */

function anzahl(r: Rubrik): string {
  if (r.art === 'dateien') return 'Dateien, keine Notizen'
  const n = r.notizen ?? 0
  const text = `${zahl(n)} ${n === 1 ? 'Notiz' : 'Notizen'}`
  return r.verbindlich ? `${text}, ${zahl(r.verbindlich)} verbindlich` : text
}

export function Rubriken() {
  const u = daten.unternehmenswissen
  return (
    <>
      <div className="lp-rubriken">
        {u.stufen.map((s) => {
          const eigene = u.rubriken.filter((r) => r.stufe === s.id)
          if (!eigene.length) return null
          return (
            <div className="lp-rubrik-gruppe" key={s.id}>
              <h4>
                {s.name}
                <span className="wann">, {s.wann}</span>
              </h4>
              <dl>
                {eigene.map((r) => (
                  <div className="lp-rubrik" key={r.ordner}>
                    <dt>{r.ordner}/</dt>
                    <dd className="was">
                      {r.wofuer}
                      {r.hinweis ? <span className="lp-rubrik-hinweis"> {r.hinweis}</span> : null}
                    </dd>
                    <dd className="anzahl">{anzahl(r)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
      <p className="lp-klein lp-luft-oben-klein">
        Quelle: {u.quelle}, gezählt am {datum(u.gezaehltAm)}.
      </p>
    </>
  )
}
