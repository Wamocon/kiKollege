import { daten, datum, type AblageBereich } from '@/lib/daten'
import { nurSichtbare, sichtbar } from '@/lib/freigabe'
import { pfad } from '@/lib/pfad'

/** Das Organigramm der Mannschaft, wie das auf /stand/, als Seite gesetzt: oben der Mensch
 *  und das Team, darunter der Orchestrator, darunter alle Rollen in einer Reihe, darunter die
 *  Werkbank, die Wissensschicht und die gemeinsame Basis. Rot ist, was mit Grenze läuft;
 *  gestrichelt, was geplant ist. Alles aus data/projektstand.json. */

const m = daten.mannschaft
const WORTE = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']
const inWorten = (n: number) => WORTE[n] ?? String(n)
const zahl = (n: number) => n.toLocaleString('de-DE')

type Kopf = (typeof m.koepfe)[number]
const laeuft = (k: Kopf) => k.betrieb === 'mitGrenze' || k.betrieb === 'ohneGrenze'

/** Die Wissensschicht in sieben Feldern, zusammengezählt aus dem Abbild der Ablage */
function wissensfelder(bereiche: AblageBereich[]) {
  const summe = (ids: string[]) => {
    const auswahl = bereiche.filter((b) => ids.includes(b.id))
    return { notizen: auswahl.reduce((s, b) => s + b.notizen, 0), verbindlich: auswahl.reduce((s, b) => s + b.verbindlich, 0) }
  }
  return [
    { titel: 'Konventionen, Entscheidungen', gedaechtnis: false, ...summe(['konventionen', 'entscheidungen']) },
    { titel: 'Wissen über das Unternehmen', gedaechtnis: false, ...summe(['unternehmen']) },
    { titel: 'Bauplan der Mitarbeiter', gedaechtnis: false, ...summe(['bauplan']) },
    { titel: 'Normbasis des Berufs', gedaechtnis: false, ...summe(['normbasis']) },
    { titel: 'Prüfmaßstab der Academy', gedaechtnis: false, ...summe(['massstab']) },
    { titel: 'Quellen', gedaechtnis: false, ...summe(['quellen']) },
    { titel: 'Gedächtnis', gedaechtnis: true, ...summe(['prueflaeufe']) },
  ]
}

function Rolle({ k, hatSteckbrief }: { k: Kopf; hatSteckbrief: boolean }) {
  const inhalt = (
    <>
      <b>{k.name ?? k.kurz}</b>
      <span className="lb-org-rolle">{k.name ? `${k.kurz}, ${k.kern}` : k.kern}</span>
      {k.marke ? <span className="lb-org-marke">{k.marke}</span> : null}
    </>
  )
  const klasse = k.betrieb === 'mitGrenze' ? 'lb-org-karte' : k.betrieb === 'ohneGrenze' ? 'lb-org-karte ohne' : 'lb-org-karte geplant'
  return hatSteckbrief ? (
    <a className={klasse} href={pfad(`/mannschaft/#${k.id}`)}>
      {inhalt}
    </a>
  ) : (
    <div className={klasse}>{inhalt}</div>
  )
}

export function Organigramm() {
  const koepfe = nurSichtbare(m.koepfe).filter((k) => !k.passtNicht)
  const [oben, ...unten] = koepfe
  const steckbriefe = new Set(nurSichtbare(daten.steckbriefe.mitarbeiter).map((s) => s.kopf))
  const w = m.werkbank
  const a = daten.ablage
  const laeufe = daten.kennzahlen.find((k) => k.id === 'prueflaeufe')?.zahl ?? 0
  return (
    <figure className="lb-org" style={{ ['--lb-org-rollen' as string]: unten.length }}>
      <div className="lb-org-oben">
        <div className="lb-org-team" data-lb-reveal>
          <b>{m.team.titel}</b>
          <span>{m.team.zusatz}</span>
        </div>
        <div className="lb-org-mensch" data-lb-reveal>
          <b>{m.mensch.titel}</b>
          <span>{m.mensch.zusatz}</span>
        </div>
      </div>
      <div className="lb-org-chef" data-lb-reveal>
        <Rolle k={oben} hatSteckbrief={steckbriefe.has(oben.id)} />
      </div>
      <ol className="lb-org-rollen" data-lb-staffel>
        {unten.map((k) => (
          <li key={k.id} className={laeuft(k) ? 'laeuft' : undefined}>
            <Rolle k={k} hatSteckbrief={steckbriefe.has(k.id)} />
          </li>
        ))}
      </ol>

      {sichtbar(w) ? (
        <section className="lb-org-band">
          <p className="lb-org-band-kopf">
            <b>
              Werkbank: {inWorten(w.helfer.length)} Werkzeugmacher in Claude Code, seit dem {datum(w.seit).slice(0, 6)}
            </b>
            <span>bauen, prüfen selbst nichts</span>
          </p>
          <ul className="lb-org-helfer" data-lb-staffel>
            {w.helfer.map((h) => (
              <li key={h.name}>
                <code>{h.name}</code>
                <span>{h.aufgabe}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sichtbar(a) ? (
        <section className="lb-org-band">
          <p className="lb-org-band-kopf">
            <b>Wissensschicht: worauf sich ein KI-Mitarbeiter stützen darf</b>
            <span>rot: verbindlich, gestrichelt: ungeprüft</span>
          </p>
          <ul className="lb-org-wissen" data-lb-staffel>
            {wissensfelder(a.bereiche).map((f) => (
              <li key={f.titel} className={f.gedaechtnis ? 'gedaechtnis' : f.verbindlich ? 'verbindlich' : 'ungeprueft'}>
                <b>{f.titel}</b>
                <span>
                  {f.gedaechtnis
                    ? `${zahl(laeufe)} Läufe, ${zahl(a.regelnotizen)} von ${zahl(daten.pruefpunkte.gesamt)} gemessen`
                    : f.verbindlich
                      ? `${zahl(f.verbindlich)} von ${zahl(f.notizen)} verbindlich`
                      : `${zahl(f.notizen)}, ungeprüft`}
                </span>
              </li>
            ))}
          </ul>
          <p className="lb-org-fuss">
            Gezählt am {datum(a.gezaehltAm)}: {zahl(a.bereiche.reduce((s, x) => s + x.verbindlich, 0))} von {zahl(a.notizen)} Notizen verbindlich. Ein Mensch gibt frei, kein
            KI-Mitarbeiter hebt eine Notiz.
          </p>
        </section>
      ) : null}

      <section className="lb-org-basis">
        <p className="lb-org-band-kopf">
          <b>Gemeinsam: was alle lesen und worüber alle übergeben</b>
        </p>
        <div data-lb-staffel>
          {m.basis.map((b) => (
            <div key={b.titel}>
              <b>{b.titel}</b>
              <ul>
                {b.zeilen.map((z) => (
                  <li key={z}>{z}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <figcaption>
        <p>
          {`Rot gefüllt: läuft mit Grenze. Rot gestrichelt: läuft, die Grenze am Profil folgt. Grau gestrichelt: entschieden und nicht in Betrieb, in der Wissensschicht ungeprüft. Das Band unten ist, was alle teilen. Gezählt am ${datum(m.gezaehltAm)}.`}
        </p>
        <p>{m.organigrammQuelle}.</p>
      </figcaption>
    </figure>
  )
}
