import { AblageFigur } from '@/components/figuren/Ablage'
import { AblageGraphFigur } from '@/components/figuren/AblageGraph'
import { EnablerRaster } from '@/components/figuren/EnablerRaster'
import { LandschaftFigur } from '@/components/figuren/Landschaft'
import { TermineFigur } from '@/components/figuren/Termine'
import { MannschaftFigur } from '@/components/figuren/Mannschaft'
import { Schichtenstapel } from '@/components/figuren/Schichtenstapel'
import { Durchlauf } from '@/components/figuren/Durchlauf'
import { Pruefpunkte } from '@/components/figuren/Pruefpunkte'
import { Steuerung } from '@/components/figuren/Steuerung'
import { Wissensablagen } from '@/components/figuren/Wissensablagen'
import { Fussleiste } from '@/components/landing/Fussleiste'
import { HeroAnatomie } from '@/components/landing/HeroAnatomie'
import { Kopfleiste } from '@/components/landing/Kopfleiste'
import { Sektion } from '@/components/landing/Sektion'
import { belastbarBei, daten, datum, harteRegel, tageZwischen, zahl, zielErreicht, type AnleitungAb } from '@/lib/daten'
import { inWorten } from '@/lib/alter'
import { istIntern, nurSichtbare, sichtbar, zeigtInternes } from '@/lib/freigabe'
import { pfad } from '@/lib/pfad'

export default function Landing() {
  const d = daten
  const gmbh = d.gesellschaften[0]
  const fachreview = d.prueflaeufe.laeufe.find((l) => l.art === 'urteilend')!
  const rechenlauf = d.prueflaeufe.laeufe.find((l) => l.zusatz != null)
  const wiederholung = d.prueflaeufe.laeufe.find((l) => l.art === 'wiederholung')
  const fehlalarmquote = d.messluecken.find((m) => m.id === 'fehlalarmquote')!
  const b = d.bewertungen
  const m = d.mannschaft
  const koepfe = nurSichtbare(m.koepfe)
  const l = d.landschaft
  const ortName = new Map(l.orte.map((o) => [o.id, o.name]))
  const zustaende = [
    { zustand: 'laeuft', kopf: 'Läuft' },
    { zustand: 'vorhanden', kopf: 'Vorhanden, noch nicht im Einsatz' },
    { zustand: 'geplant', kopf: 'Entschieden, nicht gebaut' },
  ] as const
  // Der Plan, der gilt. Der vom 17.09. steht als Verlauf unter /stand/.
  const plan = d.meilensteinplanAktuell
  const fachlich = d.ablage.bereiche.filter((a) => a.id === 'normbasis' || a.id === 'massstab')
  const fachlichVerbindlich = fachlich.reduce((s, a) => s + a.verbindlich, 0)
  const verbindlich = d.ablage.bereiche.reduce((s, a) => s + a.verbindlich, 0)

  // Auf einen Blick: was als Nächstes ansteht, gerechnet am Stand der Daten
  const naechsterMeilenstein = plan.meilensteine.find((ms) => ms.termin >= d.stand)
  const teamHeute = plan.heute.find((h) => h.wer === 'Team')

  // Die Anleitung nennt Termine nur, wo der Plan sichtbar ist
  const a = d.anleitung
  const termin = (id: string) => plan.meilensteine.find((ms) => ms.id === id)?.termin
  const kurz = (iso: string) => datum(iso).slice(0, 6)
  const abWann = (ab: AnleitungAb) => {
    if ('nur' in ab) return ab.nur
    if ('nachPlan' in ab) return sichtbar(plan) ? `nach dem ${kurz(plan.bis)}` : 'später'
    const t = termin(ab.meilenstein)
    return sichtbar(plan) && t ? `ab ${kurz(t)}` : 'später'
  }
  const teamAb = termin(a.teamAb)
  const spracheAb = termin(a.spracheAb)
  const erledigtIn = (ms: (typeof plan.meilensteine)[number]) => ms.inhalt.filter((i) => i.erledigt).length
  const imZustand = (z: string) => koepfe.filter((k) => k.zustand === z).length

  return (
    <>
      <Kopfleiste />

      <main id="inhalt">
        {/* 01 Was ein KI-Mitarbeiter ist ------------------------------------- */}
        <Sektion id="vorhaben" klasse="lp-hero">
          <h1 className="lp-display">
            <span className="zeile">Ein KI-Mitarbeiter arbeitet zu.</span>
            <span className="zeile">Ein Mensch entscheidet.</span>
          </h1>

          <p className="lp-lead lp-luft-oben">
            Ein KI-Mitarbeiter ist ein Sprachmodell, also die Technik hinter Chat-Programmen, mit
            einer festen Aufgabe, einem aufgeschriebenen Maßstab und einer Grenze. Er prüft,
            sortiert und bereitet vor; was daraus folgt, entscheidet ein Mensch. Die {gmbh.name}{' '}
            baut solche Rollen seit dem {datum(d.arbeitstage.beginn)}.
          </p>

          <HeroAnatomie
            kern={d.anatomie.kern}
            satz={d.anatomie.satz}
            teile={d.anatomie.teile}
          />

          <div id="chatbot">
            <h2 className="lp-aussage lp-luft-oben">{d.abgrenzung.satz}</h2>
            <div className="lp-gegen-rahmen">
              <table className="lp-gegen">
                <thead>
                  <tr>
                    <th />
                    <th>Ein Chatbot</th>
                    <th className="stark">Ein KI-Mitarbeiter</th>
                  </tr>
                </thead>
                <tbody>
                  {d.abgrenzung.zeilen
                    .filter((z) => ['Auftrag', 'Maßstab', 'Grenze'].includes(z.merkmal))
                    .map((z) => (
                      <tr key={z.merkmal}>
                        <td className="merkmal">{z.merkmal}</td>
                        <td className="leise">{z.chatbot}</td>
                        <td>{z.mitarbeiter}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div id="eignung">
            <h2 className="lp-aussage lp-luft-oben">Wofür er taugt, und wofür nicht.</h2>
            <div className="lp-paar">
              <div>
                <h3>Geeignet, wenn</h3>
                <ul>
                  {d.eignung.geeignet.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="nein">
                <h3>Ungeeignet, wenn</h3>
                <ul>
                  {d.eignung.ungeeignet.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lp-text lp-luft-oben">
              <p>
                {d.eignung.nachsatz} {harteRegel('rollengrenze').grund}
              </p>
            </div>
          </div>
        </Sektion>

        {/* 02 Der erste: Fritz ------------------------------------------------ */}
        <Sektion id="erster">
          <p className="lp-klein">
            Im Einsatz seit dem {datum(d.arbeitstage.beginn)}
          </p>
          <h2 className="lp-aussage breit lp-luft-oben-klein">
            Fritz, Reviewer für Schulungsunterlagen.
          </h2>
          <div className="lp-text lp-luft-oben">
            <p>
              Er prüft die Unterlagen der WAMOCON Academy für die Ausbildung zu Kaufleuten für
              Büromanagement gegen die Checklisten des Hauses und die Ausbildungsverordnung, und
              schreibt einen Bericht. {zahl(d.gegenstand.dateien)} Dateien liegen dort. Jede müsste
              vollständig und jedes Mal gleich geprüft werden. Die Aufgabe ist nicht schwer, sie ist
              zu viel.
            </p>
          </div>

          <dl className="lp-spec">
            <div className="lp-spec-zeile">
              <dt>Grenze</dt>
              <dd>
                <b>bewertet</b>, erstellt keine Unterlagen, erteilt keine Freigabe
              </dd>
            </div>
            <div className="lp-spec-zeile">
              <dt>Maßstab</dt>
              <dd>
                {d.massstab.kriterien.gesamt} Kriterien, {d.pruefpunkte.gesamt} Prüfpunkte,{' '}
                {d.massstab.schweregrade.length} Schweregrade
              </dd>
            </div>
            {sichtbar(b) ? (
              <div className="lp-spec-zeile">
                <dt>Fehlalarmquote</dt>
                <dd>
                  belastbar {belastbarBei(b)}, mehr dazu im <a href="#messung">nächsten Abschnitt</a>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="lp-kpi">
            <div className="lp-kpi-kachel">
              <p className="lp-kpi-wert">{zahl(rechenlauf?.geprueft ?? 0)}</p>
              <p className="lp-kpi-label">
                Übungsfälle in einem Lauf geprüft, Dauer {rechenlauf?.laufzeit}
              </p>
            </div>
            {rechenlauf?.zusatz ? (
              <div className="lp-kpi-kachel">
                <p className="lp-kpi-wert">{zahl(rechenlauf.zusatz.gleichungen)}</p>
                <p className="lp-kpi-label">
                  Rechnungen darin nachgerechnet, {zahl(rechenlauf.zusatz.gleichungenFalsch)} davon
                  falsch
                </p>
              </div>
            ) : null}
            <div className="lp-kpi-kachel">
              <p className="lp-kpi-wert">{zahl(fachreview.fragen!)}</p>
              <p className="lp-kpi-label">
                Quizfragen fachlich geprüft, über {zahl(fachreview.enabler!)} Enabler
              </p>
            </div>
            <div className="lp-kpi-kachel">
              <p className="lp-kpi-wert">{zahl(fachreview.blocker!)}</p>
              <p className="lp-kpi-label">
                schwerwiegende Befunde darunter: Antworten, die fachlich falsch sind
              </p>
            </div>
          </div>

          <h3 className="lp-aussage breit lp-luft-oben">
            Was dabei herauskommt, das anders nicht zu haben ist.
          </h3>
          <div className="lp-text lp-luft-oben-klein">
            <p>{d.ertrag.einleitung}</p>
          </div>
          <div className="lp-zellen">
            {d.ertrag.punkte.map((p) => (
              <div className="lp-zelle" key={p.titel}>
                <span className="kopf">{p.titel}</span>
                <p className="stark">{p.text}</p>
                <p>{p.beleg}</p>
              </div>
            ))}
          </div>

          <div className="lp-zellen lp-luft-oben">
            <div className="lp-zelle traegt">
              <span className="kopf">So sieht ein Befund aus</span>
              <p className="lp-stufe-marke">{d.beispielbefund.stufe}</p>
              <p className="stark">{d.beispielbefund.text}</p>
              <p className="kopf">{d.beispielbefund.fundstelle}</p>
              <p>{d.beispielbefund.nachsatz}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">Der geprüfte Bestand</span>
              <EnablerRaster />
            </div>
          </div>
        </Sektion>

        {/* 03 Verlässlich? ---------------------------------------------------- */}
        <Sektion id="messung">
          <h2 className="lp-aussage">
            Ein KI-Mitarbeiter, dem man nicht glauben kann, ist schlimmer als keiner.
          </h2>
          <div className="lp-text lp-luft-oben">
            <p>
              Dann muss man seine Arbeit zusätzlich nachprüfen. Zwei Zahlen entscheiden, und beide
              muss man tatsächlich erheben.
            </p>
          </div>

          <div className="lp-zellen">
            <div className="lp-zelle">
              <span className="kopf">
                Frage 1, {wiederholung ? 'gemessen' : 'offen'}
              </span>
              <h3>Sagt er zweimal dasselbe?</h3>
              <p>
                Derselbe Vorgang, zweimal geprüft. Kommt etwas anderes heraus, ist das Ergebnis
                wertlos, egal wie gut es klingt.
              </p>
              {wiederholung?.datum && wiederholung.bestaetigt != null ? (
                <p className="stark">
                  Am {datum(wiederholung.datum)} erstmals gemessen:{' '}
                  {zahl(wiederholung.bestaetigt)} von {zahl(wiederholung.bestaetigt)} Befunden
                  bestätigt, an derselben Stelle.
                  {wiederholung.neuGefunden
                    ? ` ${zahl(wiederholung.neuGefunden)} kam hinzu.`
                    : ''}
                </p>
              ) : (
                <p className="stark">Noch kein Wiederholungslauf protokolliert.</p>
              )}
            </div>
            <div className="lp-zelle traegt">
              <span className="kopf">Frage 2, offen</span>
              <h3>Wie oft meldet er etwas, das keins ist?</h3>
              <p>
                Die härtere Zahl. Sie lässt sich nur erheben, wenn Fachleute eine Stichprobe
                durchsehen und Stück für Stück sagen: berechtigt oder Fehlalarm.
              </p>
              {sichtbar(b) ? (
                <p className="stark">
                  Erste Bewertungen seit dem {datum(b.erstmalsAm)}. Belastbar ist die Quote{' '}
                  {b.regelnAmZiel === 0 ? 'noch ' : ''}
                  {belastbarBei(b)}.
                </p>
              ) : (
                <p className="stark">Bis heute nicht gemessen. Das ist der nächste Schritt.</p>
              )}
            </div>
          </div>

          {sichtbar(b) ? (
            <>
              <div className="lp-hero-zahl lp-luft-oben">
                <p className="wert">{zahl(b.bewertet)}</p>
                <p className="beschriftung">
                  Befunde hat ein Mensch bisher bewertet, über {zahl(b.regeln)} Regeln.{' '}
                  {zahl(b.gesehen)} davon hat er einzeln angesehen. Fehlalarme darunter:{' '}
                  {zahl(b.fehlalarme)}.
                </p>
              </div>

              <div className="lp-text lp-luft-oben">
                <p>Das ist ein gutes Zeichen und noch keine Abnahme. Dafür gibt es drei Gründe.</p>
              </div>
              <div className="lp-zellen">
                <div className="lp-zelle">
                  <span className="kopf">In Gruppen bewertet</span>
                  <p className="stark">{b.gruppen}</p>
                  <p>
                    Einzeln angesehen: {zahl(b.gesehen)} von {zahl(b.bewertet)}.
                  </p>
                </div>
                <div className="lp-zelle traegt">
                  <span className="kopf">Zu kleine Stichprobe</span>
                  <p className="stark">
                    Das eigene Ziel sind {zahl(b.zielGesehenJeRegel)} einzeln angesehene Fälle je
                    Regel.
                  </p>
                  <p>
                    {zielErreicht(b)}{' '}
                    {b.ersteRegel
                      ? b.ersteRegel.satz
                      : `Am nächsten kommt ihm eine Regel mit ${zahl(b.hoechstesGesehen)}.`}
                  </p>
                </div>
                <div className="lp-zelle">
                  <span className="kopf">Das Meiste fehlt</span>
                  <p className="stark">{b.ungemessen}</p>
                </div>
              </div>

              <div className="lp-text lp-luft-oben">
                <p>{b.rueckweg}</p>
                <p>{b.umgewichtet}</p>
                <p>
                  Aus den ersten Läufen sind {zahl(fehlalarmquote.unbewertet!)} Befunde und Hinweise
                  weiter ohne Bewertung.
                </p>
              </div>

              <div className="lp-zellen">
                <div className="lp-zelle traegt">
                  <span className="kopf">Was eine Bewertung lehrt</span>
                  <p className="stark">{b.beispiel.satz}</p>
                  <p>{b.beispiel.text}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="lp-hero-zahl lp-luft-oben">
              <p className="wert">0</p>
              <p className="beschriftung">
                von {zahl(fehlalarmquote.unbewertet!)} Befunden und Hinweisen sind bisher von einem
                Menschen bewertet worden.
              </p>
            </div>
          )}

          <p className="lp-klein lp-luft-oben">
            Entschieden am {datum(d.massstab.kalibrierung.entschiedenAm)}
          </p>
          <h3 className="lp-aussage lp-luft-oben-klein">
            {d.massstab.kalibrierung.satz}
          </h3>
          <div className="lp-text lp-luft-oben">
            <p>
              Wer dreimal einen falschen Alarm bekommt, sieht beim vierten Mal nicht mehr hin. Dann
              nützt auch das nichts mehr, was richtig gefunden wurde. Deshalb gilt die Regel, im
              Zweifel zu schweigen. Und jede Regel braucht zwei Testfälle, einen bekannt richtigen
              und einen bekannt falschen, bevor sie eingesetzt wird.
            </p>
          </div>

          <dl className="lp-spec">
            {nurSichtbare(d.fehlalarmBelege).map((f) => (
              <div className="lp-spec-zeile" key={f.id}>
                <dt>{f.titel}</dt>
                <dd>
                  <b>{zahl(f.fehlalarme)} Fehlalarme</b>
                  {f.ausEinerRegel != null
                    ? `, ${zahl(f.ausEinerRegel)} davon aus einer einzigen Regel`
                    : ', kein einziger Treffer war echt'}
                  {'. '}
                  {f.ursache ?? ''} Heute liegen {zahl(f.testfaelle)} Testfälle daraus vor, jeder
                  mit seiner Fundstelle.
                </dd>
              </div>
            ))}
          </dl>
        </Sektion>

        {/* 04 So arbeitest du mit ihm ----------------------------------------- */}
        {sichtbar(a) ? (
          <Sektion id="auftrag">
            <h2 className="lp-aussage breit">{a.satz}</h2>
            <div className="lp-text lp-luft-oben-klein">
              <p>
                {a.wer}
                {sichtbar(plan) && teamAb ? (
                  <>
                    {' '}
                    Fürs Team geht das ab dem {datum(teamAb)}
                    {teamHeute ? `; heute gilt: ${teamHeute.stand.replace(/\.$/, '')}` : ''}.
                  </>
                ) : null}
              </p>
            </div>

            <div className="lp-zellen">
              {a.schritte.map((s, i) => (
                <div className="lp-zelle" key={s.titel}>
                  <span className="kopf">
                    {i + 1}. {s.titel}
                  </span>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
            {sichtbar(plan) && spracheAb ? (
              <div className="lp-text lp-luft-oben-klein">
                <p>Ab dem {datum(spracheAb)} geht ein Auftrag auch als Sprachnachricht.</p>
              </div>
            ) : null}

            <h3 className="lp-aussage lp-luft-oben">Was er annimmt.</h3>
            <div className="lp-gegen-rahmen">
              <table className="lp-gegen">
                <thead>
                  <tr>
                    <th>Auftrag</th>
                    <th>Wer ihn erledigt</th>
                    <th>Was du angibst</th>
                    <th>Ab wann</th>
                  </tr>
                </thead>
                <tbody>
                  {nurSichtbare(a.zeilen).map((z) => (
                    <tr key={z.auftrag}>
                      <td>{z.auftrag}</td>
                      <td>{z.wer}</td>
                      <td className="leise">{z.angaben}</td>
                      <td>{abWann(z.ab)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="lp-aussage lp-luft-oben">Was er ablehnt, und dir sagt, warum.</h3>
            <div className="lp-text lp-luft-oben-klein">
              <ul className="liste">
                {a.ablehnung.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>

            <div className="lp-zellen lp-luft-oben">
              <div className="lp-zelle">
                <span className="kopf">So liest du einen Bericht</span>
                <p>{a.bericht}</p>
              </div>
              <div className="lp-zelle traegt">
                <span className="kopf">Wenn ein Befund falsch ist</span>
                <p>{a.fehlalarm}</p>
              </div>
            </div>
            <dl className="lp-spec">
              {d.massstab.schweregrade.map((s) => (
                <div className="lp-spec-zeile" key={s.stufe}>
                  <dt>{s.stufe}</dt>
                  <dd>{s.bedeutung}</dd>
                </div>
              ))}
            </dl>

            <h3 className="lp-aussage breit lp-luft-oben">{a.mitmachenSatz}</h3>
            <div className="lp-zellen lp-luft-oben-klein">
              {a.mitmachen.map((t) => (
                <div className="lp-zelle" key={t.titel}>
                  <span className="kopf">{t.titel}</span>
                  <p>{t.text}</p>
                </div>
              ))}
            </div>
            <div className="lp-text lp-luft-oben">
              <p>{d.uebertragbarkeit.auswahlregel}</p>
              <p className="lp-klein">Quelle: {a.quelle}</p>
            </div>
          </Sektion>
        ) : null}

        {/* 05 Mannschaft ------------------------------------------------------ */}
        <Sektion id="mannschaft">
          <h2 className="lp-aussage breit">{m.satz}</h2>
          <div className="lp-text lp-luft-oben-klein">
            <p>{m.trennung} Jede Rolle bekommt eine Grenze, und die Grenze steht als Datei neben ihr.</p>
          </div>
          <MannschaftFigur />
          <div className="lp-luft-oben">
            {koepfe.map((k) => (
              <div className="lp-stufe" key={k.id}>
                <span className="wann">
                  {k.zustand}
                  {istIntern && k.freigabe === 'intern' ? ', nur intern' : ''}
                </span>
                <div>
                  <h3>{k.name ? `${k.rolle}, ${k.name}` : k.rolle}</h3>
                  <p>{k.tut}</p>
                  <p className="bedingung">Tut nie: {k.tutNie}</p>
                  <p className="bedingung">{k.hinweis}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="lp-zellen lp-luft-oben">
            <div className="lp-zelle traegt">
              <span className="kopf">Warum nicht mehr auf einmal</span>
              <p className="stark">{m.engpass}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">Die Akte</span>
              <p className="stark">{m.akte}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">Warum ein Programm</span>
              <p className="stark">{d.auftrag.anweisungImDokument.satz}</p>
              <p>{m.grenzeWarum}</p>
            </div>
          </div>
        </Sektion>

        {/* 06 Aufbau ---------------------------------------------------------- */}
        <Sektion id="aufbau">
          <h2 className="lp-aussage breit">
            Acht Fragen, die auch ein neuer Kollege beantwortet bekommt.
          </h2>
          <div className="lp-text lp-luft-oben-klein">
            <p>{d.schichtenErklaerung}</p>
          </div>

          <Schichtenstapel />

          <div className="lp-text lp-luft-oben">
            <p>{d.schichtenDatei}</p>
            <p>
              Die beiden mit einem Balken markierten Schichten tragen den Rest. Ohne bewertete
              Ergebnisse gibt es keine Messung, und ohne Messung keinen Grund, dem Werkzeug zu
              glauben.
            </p>
          </div>

          <div className="lp-quelltext">
            <p className="lp-quelltext-kopf">
              <b>{d.beschreibungsdatei.name}</b>
              <span>{d.beschreibungsdatei.stand}</span>
            </p>
            <pre>{d.beschreibungsdatei.auszug}</pre>
          </div>

          <div className="lp-zellen lp-luft-oben">
            <div className="lp-zelle">
              <span className="kopf">Oben der Kopf</span>
              <p>{d.beschreibungsdatei.kopf}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">Unten der Auftrag</span>
              <p>{d.beschreibungsdatei.rumpf}</p>
            </div>
            <div className="lp-zelle traegt">
              <span className="kopf">Die Grenze</span>
              <p className="stark">{d.beschreibungsdatei.grenze}</p>
            </div>
          </div>
          <div className="lp-text lp-luft-oben">
            <p>{d.beschreibungsdatei.einzigeQuelle}</p>
          </div>
        </Sektion>

        {/* 07 Wissen und Ablage ----------------------------------------------- */}
        <Sektion id="wissen">
          <h2 className="lp-aussage breit">
            Zwei Wissensablagen, nicht eine.
          </h2>
          <div className="lp-text lp-luft-oben-klein">
            <p>{d.wissensablagen.satz}</p>
          </div>

          <Wissensablagen />

          <div className="lp-text lp-luft-oben">
            <p>{d.wissensablagen.gemeinsam.hinweis}</p>
          </div>

          <div className="lp-paar">
            <div>
              <h3>Wissen</h3>
              <p className="lp-untertitel">Was gilt. Schreiben Menschen, ändert sich selten und nie von allein.</p>
              <ul>
                <li>Norm von außen: Gesetze, Verordnungen, wörtlich abgeschrieben</li>
                <li>Maßstab des Hauses: Checklisten, Vorlagen, Corporate Design</li>
                <li>Begriffe: was ein Wort hier bedeutet</li>
                <li>Entscheidungen: was einmal festgelegt wurde, mit Datum</li>
              </ul>
            </div>
            <div>
              <h3>Gedächtnis</h3>
              <p className="lp-untertitel">Was herauskam. Fällt beim Arbeiten an und wächst mit jedem Auftrag.</p>
              <ul>
                <li>Einzelergebnis: hunderte je Lauf, maschinell geschrieben</li>
                <li>
                  Regel: wenige, langlebig. Zweck, Testfälle und die gemessene Fehlalarmquote
                </li>
                <li>Lauf: eine Notiz je Durchgang, mit Kennzahlen für den Vergleich über die Zeit</li>
              </ul>
            </div>
          </div>

          <div className="lp-text lp-luft-oben">
            <p>
              Er liest nicht alles. Zu jedem Auftrag gehört die Angabe, welcher Teil des Wissens
              dafür der Maßstab ist. Deshalb trägt jede Notiz ein Datum: Wissen ohne Stand lässt
              sich nicht einordnen, und falsch eingeordnete Vorschriften erzeugen Fehlalarme.
            </p>
            <p>
              Die Originale bleiben, wo sie sind. Amtliche Dokumente und die Unterlagen selbst
              werden nicht kopiert, das Wissen verweist auf sie. So gibt es keine zweite Fassung,
              die still veraltet. Zu jeder Notiz gehört, woher sie stammt und ob sie bestätigt ist.
            </p>
          </div>

          {sichtbar(d.ablage) ? (
            <div id="ablage" className="lp-luft-oben">
            <h3 className="lp-aussage breit">So sieht die Ablage heute aus.</h3>
            <div className="lp-text lp-luft-oben-klein">
              <p>
                Das Bild ist aus den Notizen selbst gezählt, nicht von Hand gezeichnet. Jedes
                Kästchen ist eine Notiz, gefärbt nach ihrem Freigabestand. Rechts steht, auf
                welchen anderen Bereich ein Bereich am häufigsten verweist. Dateinamen stehen
                nicht darin.
              </p>
            </div>

            <AblageFigur />

            {fachlichVerbindlich === 0 ? (
              <div className="lp-text lp-luft-oben">
                <p>
                  Verbindlich ist bisher nur, was Konventionen und Entscheidungen festhält. Die
                  Normbasis und der Prüfmaßstab, gegen die der Reviewer prüft, hat noch niemand
                  freigegeben. Er muss deshalb in jedem Ergebnis sagen, dass er sich auf
                  Ungeprüftes stützt.
                </p>
              </div>
            ) : null}

            <h3 className="lp-aussage lp-luft-oben">Welcher Bereich auf welchen verweist.</h3>
            <div className="lp-text lp-luft-oben-klein">
              <p>
                Die Ablage kann jede Notiz als Punkt und jeden Verweis als Linie zeigen. Bei{' '}
                {zahl(d.ablage.notizen)} Notizen und {zahl(d.ablage.verweise)} Verweisen wird daraus
                ein Knäuel. Hier ist deshalb jeder Bereich ein Kreis, und gezeichnet sind nur die
                Wege, die oft genommen werden.
              </p>
            </div>

            <AblageGraphFigur />
            <div className="lp-text lp-luft-oben">
              <p>
                Die Zahlen als Tabelle, alle Verbindungen und die Rubriken des Unternehmenswissens
                stehen im <a href={pfad('/stand/#gedaechtnis')}>ausführlichen Stand</a>.
              </p>
            </div>
            </div>
          ) : null}
        </Sektion>

        {/* 08 Arbeitsweise ---------------------------------------------------- */}
        <Sektion id="durchlauf">
          <h2 className="lp-aussage breit">
            Zwei Stufen, weil sie Verschiedenes finden.
          </h2>

          <Durchlauf />

          <div className="lp-text lp-luft-oben">
            <p>{d.durchlauf.zweiStufen}</p>
            <p>{d.durchlauf.rueckweg}</p>
            <p>{d.durchlauf.verdichtung}</p>
          </div>

          <Pruefpunkte />

          <h3 className="lp-aussage breit lp-luft-oben">
            Wie er gesteuert wird, und was er selbst steuert.
          </h3>

          <Steuerung />

          <div className="lp-zellen lp-luft-oben">
            <div className="lp-zelle">
              <span className="kopf">Beauftragt werden</span>
              <p>{d.steuerung.warumSkript}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">Selbst abgeben</span>
              <p>{d.steuerung.helfer}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">An einen zweiten übergeben</span>
              <p>{d.steuerung.uebergabe}</p>
            </div>
          </div>
        </Sektion>

        {/* 09 Landschaft ------------------------------------------------------ */}
        {sichtbar(l) ? (
          <Sektion id="landschaft">
            <h2 className="lp-aussage breit">{l.satz}</h2>
            <div className="lp-text lp-luft-oben-klein">
              <p>{l.erklaerung}</p>
            </div>

            <LandschaftFigur />

            <div className="lp-zellen lp-luft-oben">
              {zustaende.map((z) => (
                <div className={z.zustand === 'geplant' ? 'lp-zelle traegt' : 'lp-zelle'} key={z.zustand}>
                  <span className="kopf">{z.kopf}</span>
                  <ul className="liste" style={{ marginTop: '0.2rem' }}>
                    {nurSichtbare(l.bausteine)
                      .filter((bs) => bs.zustand === z.zustand)
                      .map((bs) => (
                        <li key={bs.id} style={{ fontSize: '0.86rem' }}>
                          {bs.name}, {ortName.get(bs.ort)}
                          {istIntern && bs.freigabe === 'intern' ? ' (nur intern)' : ''}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="lp-text lp-luft-oben">
              <p>{l.rechnerStand}</p>
              <p>{l.vergleich}</p>
            </div>
          </Sektion>
        ) : null}

        {/* 10 Stand ----------------------------------------------------------- */}
        <Sektion id="stand">
          <div className="lp-blick" role="group" aria-labelledby="blick-titel">
            <h2 className="lp-klein" id="blick-titel">
              Auf einen Blick, Stand {datum(d.stand)}
            </h2>
            <div className="lp-kpi">
              {sichtbar(plan) && naechsterMeilenstein ? (
                <div className="lp-kpi-kachel">
                  <p className="lp-kpi-wert">{kurz(naechsterMeilenstein.termin)}</p>
                  <p className="lp-kpi-label">
                    Nächste Abnahme, {naechsterMeilenstein.id}: {naechsterMeilenstein.titel}. Erledigt
                    sind {inWorten(erledigtIn(naechsterMeilenstein))} von{' '}
                    {inWorten(naechsterMeilenstein.inhalt.length)} Arbeiten.
                  </p>
                </div>
              ) : null}
              <div className="lp-kpi-kachel">
                <p className="lp-kpi-wert">
                  {imZustand('arbeitet')} von {koepfe.length}
                </p>
                <p className="lp-kpi-label">
                  Rollen arbeiten. Eingerichtet: {imZustand('eingerichtet')}. Entschieden, noch
                  nicht gebaut: {imZustand('entschieden')}.
                </p>
              </div>
              {sichtbar(plan) && teamAb ? (
                <div className="lp-kpi-kachel">
                  <p className="lp-kpi-wert">{kurz(teamAb)}</p>
                  <p className="lp-kpi-label">
                    Ab dann gibt das Team Aufträge, so wie unter <a href="#auftrag">Beauftragen</a>{' '}
                    beschrieben.{teamHeute ? ` ${teamHeute.stand}` : ''}
                  </p>
                </div>
              ) : null}
              {sichtbar(b) ? (
                <div className="lp-kpi-kachel">
                  <p className="lp-kpi-wert">{zahl(b.bewertet)}</p>
                  <p className="lp-kpi-label">
                    Befunde von einem Menschen bewertet, Fehlalarme darunter: {zahl(b.fehlalarme)}.
                    Belastbar ist die Quote {belastbarBei(b)}.
                  </p>
                </div>
              ) : null}
              {sichtbar(d.ablage) ? (
                <div className="lp-kpi-kachel">
                  <p className="lp-kpi-wert">
                    {zahl(verbindlich)} von {zahl(d.ablage.notizen)}
                  </p>
                  <p className="lp-kpi-label">
                    Notizen der Ablage sind verbindlich.{' '}
                    {fachlichVerbindlich === 0
                      ? 'Normbasis und Prüfmaßstab hat noch niemand freigegeben.'
                      : `Aus Normbasis und Prüfmaßstab: ${zahl(fachlichVerbindlich)}.`}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <h2 className="lp-aussage breit lp-luft-oben">Die letzten Tage, mit Datum.</h2>
          <div className="lp-zeit">
            {nurSichtbare(d.arbeitstage.eintraege).slice(-5).map((e) => (
              <div className="lp-zeit-zeile" key={e.datum + e.text}>
                <span className="wann">{datum(e.datum)}</span>
                <span className="was">
                  {e.text}
                  {istIntern && e.freigabe === 'intern' ? ' (nur intern)' : ''}
                </span>
              </div>
            ))}
          </div>

          <div className="lp-text lp-luft-oben-klein">
            <p>
              Alle {zahl(nurSichtbare(d.arbeitstage.eintraege).length)} Einträge der{' '}
              {tageZwischen(d.arbeitstage.beginn, d.stand)} Tage seit dem {datum(d.arbeitstage.beginn)}{' '}
              stehen in der <a href={pfad('/stand/#chronik')}>Chronik</a>.
            </p>
          </div>

          <h3 className="lp-aussage lp-luft-oben">
            Von vier Gruppen ist genau eine technisch.
          </h3>
          <div className="lp-zellen vier">
            {d.hemmnisse.gruppen.map((g) => (
              <div className="lp-zelle" key={g.titel}>
                <span className="kopf">{g.zusatz}</span>
                <h3>{g.titel}</h3>
                <ul className="liste" style={{ marginTop: '0.2rem' }}>
                  {g.punkte.map((t) => (
                    <li key={t} style={{ fontSize: '0.86rem' }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="lp-text lp-luft-oben">
            <p>{d.hemmnisse.satz}</p>
            <p>
              Im ausführlichen Stand stehen die{' '}
              <a href={pfad('/stand/#stufen')}>Stufen bis zum Dauerbetrieb</a>, alle{' '}
              <a href={pfad('/stand/#entscheidungen')}>Entscheidungen mit Datum</a> und die{' '}
              <a href={pfad('/stand/#offen')}>offenen Punkte</a>
              {zeigtInternes ? (
                <>
                  , dazu der <a href={pfad('/stand/#plattform')}>Betrieb im Haus</a> und die{' '}
                  <a href={pfad('/stand/#beobachtungen')}>Beobachtungen aus dem Abgleich</a>
                </>
              ) : null}
              .
            </p>
          </div>
        </Sektion>

        {/* 11 Meilensteine ---------------------------------------------------- */}
        {sichtbar(plan) ? (
          <Sektion id="plan">
            {istIntern ? <p className="lp-intern">nur intern</p> : null}
            <p className="lp-klein">
              {plan.status}. Er ersetzt den {plan.ersetzt.join(' und den ')}.
            </p>
            <h2 className="lp-aussage breit lp-luft-oben-klein">{plan.satz}</h2>
            <div className="lp-text lp-luft-oben-klein">
              <p>
                <b>{plan.termineSatz}</b>
              </p>
            </div>
            <div className="lp-text lp-luft-oben">
              <p>
                <b>„{plan.ziel}“</b> {plan.zielVon}.
              </p>
              <p>{plan.lauffaehig}</p>
            </div>

            <TermineFigur />

            <div className="lp-luft-oben">
              {plan.meilensteine.map((ms) => (
                <div className="lp-stufe" key={ms.id}>
                  <span className="wann">
                    {ms.id} · {datum(ms.termin).slice(0, 6)}
                    <br />
                    vorher {datum(ms.fruehereFrist).slice(0, 6)}
                  </span>
                  <div>
                    <h3>{ms.titel}</h3>
                    <ul className="liste" style={{ marginTop: '0.2rem', marginBottom: '0.6rem' }}>
                      {ms.inhalt.map((i) => (
                        <li key={i.text} style={{ fontSize: '0.9rem' }}>
                          {i.erledigt ? <b>erledigt {i.erledigt}: </b> : null}
                          {i.text}
                          {i.teilweise ? <>. {i.teilweise}</> : null}
                        </li>
                      ))}
                    </ul>
                    <p className="bedingung">Abnahme: {ms.abnahme}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="lp-aussage lp-luft-oben">Wo es heute steht.</h3>
            <dl className="lp-spec">
              {plan.heute.map((h) => (
                <div className="lp-spec-zeile" key={h.wer}>
                  <dt>{h.wer}</dt>
                  <dd>{h.stand}</dd>
                </div>
              ))}
            </dl>

            <div className="lp-text lp-luft-oben">
              <p>
                Der kritische Pfad, die Entscheidungen mit Frist, die Zeit des
                Projektverantwortlichen, was in diesen Wochen nicht passt, und die Risiken stehen im{' '}
                <a href={pfad('/stand/#plan')}>ausführlichen Stand</a>, dazu der Plan vom 17.09. als
                Verlauf.
              </p>
              <p className="lp-klein">Quelle: {plan.quelle}</p>
            </div>
          </Sektion>
        ) : null}

      </main>

      <Fussleiste />
    </>
  )
}
