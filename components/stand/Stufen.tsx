import { Block, Marker } from '@/components/bausteine'
import { inWorten } from '@/lib/alter'
import { daten } from '@/lib/daten'
import { istIntern, nurSichtbare, sichtbar } from '@/lib/freigabe'

/** Die Stufen bis zum Dauerbetrieb. Standen bis zum 17.09. auf der Landing
 *  Page und sind mit ihrer Kürzung hierher gezogen. */
export function StufenAbschnitt() {
  const stufen = nurSichtbare(daten.stufen)
  const plan = daten.stufenPlan

  return (
    <>
      <div className="prosa">
        <p>
          Es sind {inWorten(stufen.length)} Stufen, jede mit einer Abnahme. Ohne Abnahme beginnt die nächste nicht.{' '}
          {stufen[0]?.bedingungsart === 'termin'
            ? 'Die erste hängt an einem Termin, die übrigen an einem Ergebnis.'
            : 'Jede hängt an einem Ergebnis, keine an einem Wunschdatum.'}{' '}
          Die Fehlalarmquote steht in keiner Stufe. Sie entsteht beim Bewerten, gebaut wird dafür
          nichts.
        </p>
      </div>
      {stufen.map((s) => (
        <Block key={s.titel} titel={`${s.wann}: ${s.titel}`}>
          <p>
            {s.text}{' '}
            {istIntern && s.freigabe === 'intern' ? <Marker art="intern">nur intern</Marker> : null}
          </p>
          <p className="fussnote" style={{ marginTop: '0.5rem' }}>
            {s.bedingung}
          </p>
          {s.stand ? (
            <p className="fussnote" style={{ marginTop: '0.3rem' }}>
              {s.stand}
            </p>
          ) : null}
        </Block>
      ))}
      {sichtbar(plan) ? (
        <div className="prosa" style={{ marginTop: '1.3rem' }}>
          <p>
            {istIntern ? (
              <>
                <Marker art="intern">nur intern</Marker>{' '}
              </>
            ) : null}
            {plan.text}
          </p>
        </div>
      ) : null}
    </>
  )
}
