import { AblageFigur } from '@/components/figuren/Ablage'
import { EnablerRaster } from '@/components/figuren/EnablerRaster'
import { LandschaftFigur } from '@/components/figuren/Landschaft'
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
import { daten, datum, harteRegel, tageZwischen, zahl } from '@/lib/daten'
import { istIntern, nurSichtbare, sichtbar } from '@/lib/freigabe'

export default function Landing() {
  const d = daten
  const gmbh = d.gesellschaften[0]
  const fachreview = d.prueflaeufe.laeufe.find((l) => l.art === 'urteilend')!
  const rechenlauf = d.prueflaeufe.laeufe.find((l) => l.zusatz != null)
  const wiederholung = d.prueflaeufe.laeufe.find((l) => l.art === 'wiederholung')
  const fehlalarmquote = d.messluecken.find((m) => m.id === 'fehlalarmquote')!
  const b = d.bewertungen
  const stufen = nurSichtbare(d.stufen)
  const m = d.mannschaft
  const koepfe = nurSichtbare(m.koepfe)
  const l = d.landschaft
  const ortName = new Map(l.orte.map((o) => [o.id, o.name]))
  const zustaende = [
    { zustand: 'laeuft', kopf: 'Läuft' },
    { zustand: 'vorhanden', kopf: 'Vorhanden, noch nicht im Einsatz' },
    { zustand: 'geplant', kopf: 'Entschieden, nicht gebaut' },
  ] as const
  const fachlich = d.ablage.bereiche.filter((a) => a.id === 'normbasis' || a.id === 'massstab')
  const fachlichVerbindlich = fachlich.reduce((s, a) => s + a.verbindlich, 0)

  return (
    <>
      <Kopfleiste />

      <main id="inhalt">
        {/* 01 Vorhaben ------------------------------------------------------ */}
        <Sektion id="vorhaben" klasse="lp-hero">
          <h1 className="lp-display">
            <span className="zeile">Der KI-Mitarbeiter bewertet.</span>
            <span className="zeile">Ein Mensch gibt frei.</span>
          </h1>

          <p className="lp-lead lp-luft-oben">
            Ein KI-Mitarbeiter ist eine benannte Rolle mit einer Grenze, einem Maßstab und einem
            Gedächtnis. Nicht jede Aufgabe eignet sich dafür, und ein Sprachmodell allein ist noch
            kein Mitarbeiter. Diese Seite erklärt, worum es geht, woraus so einer besteht und wie
            die {gmbh.name} vorgeht. Einen gibt es seit Ende August im Einsatz.
          </p>

          <HeroAnatomie
            kern={d.anatomie.kern}
            satz={d.anatomie.satz}
            teile={d.anatomie.teile}
          />

          <dl className="lp-spec">
            <div className="lp-spec-zeile">
              <dt>Erste Rolle</dt>
              <dd>
                Reviewer für Schulungsunterlagen der IHK-Ausbildung Kaufleute für Büromanagement
              </dd>
            </div>
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
            <div className="lp-spec-zeile">
              <dt>Seit</dt>
              <dd>
                {datum(d.arbeitstage.beginn)}, also{' '}
                {tageZwischen(d.arbeitstage.beginn, d.stand)} Tage
              </dd>
            </div>
            <div className="lp-spec-zeile">
              <dt>Nicht belastbar</dt>
              <dd>
                <b>die Fehlalarmquote.</b> {d.standSatz}
              </dd>
            </div>
          </dl>
        </Sektion>

        {/* 02 Kein Chatbot -------------------------------------------------- */}
        <Sektion id="chatbot">
          <p className="lp-aussage">
            {d.abgrenzung.satz}
          </p>
          <div className="lp-text lp-luft-oben">
            <p>{d.abgrenzung.erklaerung}</p>
          </div>

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
                {d.abgrenzung.zeilen.map((z) => (
                  <tr key={z.merkmal}>
                    <td className="merkmal">{z.merkmal}</td>
                    <td className="leise">{z.chatbot}</td>
                    <td>{z.mitarbeiter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sektion>

        {/* 03 Eignung ------------------------------------------------------- */}
        <Sektion id="eignung">
          <p className="lp-aussage breit">
            Vier Merkmale entscheiden, ob eine Aufgabe in Frage kommt.
          </p>

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
            <p>{d.eignung.nachsatz}</p>
          </div>

          <p className="lp-aussage lp-luft-oben">
            {harteRegel('rollengrenze').grund}
          </p>
          <div className="lp-text lp-luft-oben-klein">
            <p>
              Dass ein Testhaus seinen ersten KI-Mitarbeiter als Prüfer baut und nicht als
              Ersteller, hat denselben Ursprung wie die Entscheidung zum Fehlalarm weiter unten. Das
              Kerngeschäft der {gmbh.name} ist {gmbh.leistungen.slice(0, -1).join(', ')} und{' '}
              {gmbh.leistungen[gmbh.leistungen.length - 1]}. Die Haltung zum Befund kommt von dort
              und nicht aus einer KI-Strategie.
            </p>
          </div>
        </Sektion>

        {/* 04 Ertrag -------------------------------------------------------- */}
        <Sektion id="ertrag">
          <p className="lp-aussage breit">
            Was dabei herauskommt, das anders nicht zu haben ist.
          </p>
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
        </Sektion>

        {/* 05 Aufbau -------------------------------------------------------- */}
        <Sektion id="aufbau">
          <p className="lp-aussage breit">
            Acht Fragen, die auch ein neuer Kollege beantwortet bekommt.
          </p>
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

        {/* 06 Wissen -------------------------------------------------------- */}
        <Sektion id="wissen">
          <p className="lp-aussage breit">
            Zwei Wissensablagen, nicht eine.
          </p>
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
            <>
              <p className="lp-aussage lp-luft-oben">So sieht die Ablage heute aus.</p>
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
            </>
          ) : null}
        </Sektion>

        {/* 07 Durchlauf ------------------------------------------------------ */}
        <Sektion id="durchlauf">
          <p className="lp-aussage breit">
            Zwei Stufen, weil sie Verschiedenes finden.
          </p>

          <Durchlauf />

          <div className="lp-text lp-luft-oben">
            <p>{d.durchlauf.zweiStufen}</p>
            <p>{d.durchlauf.rueckweg}</p>
            <p>{d.durchlauf.verdichtung}</p>
          </div>

          <Pruefpunkte />
        </Sektion>

        {/* 08 Messung -------------------------------------------------------- */}
        <Sektion id="messung">
          <p className="lp-aussage">
            Ein KI-Mitarbeiter, dem man nicht glauben kann, ist schlimmer als keiner.
          </p>
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
                  Erste Bewertungen seit dem {datum(b.erstmalsAm)}. Belastbar ist die Quote
                  {b.regelnAmZiel === 0
                    ? ' noch bei keiner Regel.'
                    : ` bei ${zahl(b.regelnAmZiel)} von ${zahl(b.regeln)} Regeln.`}
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
                    {b.regelnAmZiel === 0
                      ? 'Das erreicht bisher keine Regel.'
                      : `Das erreichen ${zahl(b.regelnAmZiel)} von ${zahl(b.regeln)} Regeln.`}{' '}
                    Am nächsten kommt ihm eine Regel mit {zahl(b.hoechstesGesehen)}.
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
          <p className="lp-aussage lp-luft-oben-klein">
            {d.massstab.kalibrierung.satz}
          </p>
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

        {/* 09 Der erste ------------------------------------------------------ */}
        <Sektion id="erster">
          <p className="lp-klein">
            Seit Ende August im Einsatz
          </p>
          <p className="lp-aussage breit lp-luft-oben-klein">
            Fritz, Reviewer für Schulungsunterlagen.
          </p>
          <div className="lp-text lp-luft-oben">
            <p>
              Er prüft die Unterlagen der WAMOCON Academy für die Ausbildung zu Kaufleuten für
              Büromanagement gegen die Checklisten des Hauses und die Ausbildungsverordnung, und
              schreibt einen Bericht. {zahl(d.gegenstand.dateien)} Dateien liegen dort. Jede müsste
              vollständig und jedes Mal gleich geprüft werden. Die Aufgabe ist nicht schwer, sie ist
              zu viel.
            </p>
          </div>

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

        {/* 10 Mannschaft ----------------------------------------------------- */}
        <Sektion id="mannschaft">
          <p className="lp-aussage breit">{m.satz}</p>
          <div className="lp-text lp-luft-oben-klein">
            <p>{m.trennung} Jede Rolle hat eine Grenze, und die Grenze steht als Datei neben ihr.</p>
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
                  <h3>{k.rolle}</h3>
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
          {sichtbar(m.verlauf) ? (
            <div className="lp-text lp-luft-oben">
              <p className="lp-intern">nur intern</p>
              <p>{m.verlauf.text}</p>
            </div>
          ) : null}
        </Sektion>

        {/* Landschaft ------------------------------------------------------- */}
        {sichtbar(l) ? (
          <Sektion id="landschaft">
            <p className="lp-aussage breit">{l.satz}</p>
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

        {/* 11 Steuerung ------------------------------------------------------ */}
        <Sektion id="steuerung">
          <p className="lp-aussage breit">
            Wie er gesteuert wird, und was er selbst steuert.
          </p>

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

        {/* 12 Stand ---------------------------------------------------------- */}
        <Sektion id="stand">
          <p className="lp-aussage breit">
            {tageZwischen(d.arbeitstage.beginn, d.stand)} Tage, mit Datum.
          </p>
          <div className="lp-zeit">
            {nurSichtbare(d.arbeitstage.eintraege).map((e) => (
              <div className="lp-zeit-zeile" key={e.datum + e.text}>
                <span className="wann">{datum(e.datum)}</span>
                <span className="was">
                  {e.text}
                  {istIntern && e.freigabe === 'intern' ? ' (nur intern)' : ''}
                </span>
              </div>
            ))}
          </div>

          <p className="lp-aussage lp-luft-oben">
            Von vier Gruppen ist genau eine technisch.
          </p>
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
          </div>
        </Sektion>

        {/* 13 Stufen --------------------------------------------------------- */}
        <Sektion id="stufen">
          <p className="lp-aussage breit">
            {stufen.length} Stufen, jede mit einer Abnahme.
          </p>
          <div className="lp-text lp-luft-oben-klein">
            <p>
              Ohne Abnahme beginnt die nächste Stufe nicht.{' '}
              {stufen[0]?.bedingungsart === 'termin'
                ? 'Die erste hängt an einem Termin, die übrigen an einem Ergebnis.'
                : 'Jede hängt an einem Ergebnis, nicht an einem Wunschdatum.'}{' '}
              Die Fehlalarmquote steht in keiner Stufe: sie ist kein Bauschritt, sondern
              Bewertungsarbeit.
            </p>
          </div>
          <div className="lp-luft-oben">
            {stufen.map((s) => (
              <div className="lp-stufe" key={s.titel}>
                <span className="wann">{s.wann}</span>
                <div>
                  <h3>{s.titel}</h3>
                  <p>{s.text}</p>
                  <p className="bedingung">{s.bedingung}</p>
                  {s.stand ? <p className="bedingung">{s.stand}</p> : null}
                </div>
              </div>
            ))}
          </div>
          {sichtbar(d.stufenPlan) ? (
            <div className="lp-text lp-luft-oben">
              <p className="lp-intern">nur intern</p>
              <p>{d.stufenPlan.text}</p>
            </div>
          ) : null}
        </Sektion>

        {/* 14 Aufwand -------------------------------------------------------- */}
        <Sektion id="arbeit">
          <p className="lp-aussage">
            {d.arbeitsschwerpunkt.satz}
          </p>
          <div className="lp-zellen lp-luft-oben">
            <div className="lp-zelle">
              <span className="kopf">Was es braucht</span>
              <p className="stark">{d.arbeitsschwerpunkt.brauchtEs}</p>
            </div>
            <div className="lp-zelle traegt">
              <span className="kopf">Was für die Auswahl folgt</span>
              <p className="stark">{d.arbeitsschwerpunkt.auswahl}</p>
            </div>
          </div>
          <div className="lp-text lp-luft-oben">
            <p>{d.arbeitsschwerpunkt.schluss}</p>
            <p>{d.uebertragbarkeit.auswahlregel}</p>
          </div>
        </Sektion>

        {/* 15 Betrieb, nur intern -------------------------------------------- */}
        <Sektion id="plattform">
          <p className="lp-intern">
            nur intern
          </p>
          <p className="lp-aussage lp-luft-oben-klein">
            Der Dauerbetrieb läuft im Haus, die Werkbank bleibt außen.
          </p>
          <div className="lp-text lp-luft-oben">
            <p>
              Gebaut und gemessen wird auf {d.plattform.werkbank}. Für den Dauerbetrieb ist am{' '}
              {datum(d.plattform.entschiedenAm)} entschieden: {d.plattform.dauerbetrieb}.
            </p>
            <p>{d.plattform.ablageregel}</p>
          </div>

          <p className="lp-klein lp-luft-oben">
            Fünf Schritte bis zum {datum(d.plattform.termin)}
          </p>
          <ol className="lp-punkte">
            {d.plattform.schritte.map((s, i) => (
              <li key={s}>
                <span className="nr">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="punkt">{s}</span>
                  <p className="grund">{d.plattform.schritteStand[i] ?? 'offen'}</p>
                  {i === 3 ? <p className="grund">{d.plattform.warumAbschaltung}</p> : null}
                </span>
              </li>
            ))}
          </ol>
          <div className="lp-text lp-luft-oben">
            <p>{d.plattform.amTermin}</p>
            <p>{d.plattform.nichtBeantwortet}</p>
          </div>
        </Sektion>

        {/* 16 Entscheidungen -------------------------------------------------- */}
        <Sektion id="entscheidungen">
          <p className="lp-aussage breit">
            Jede Entscheidung mit Datum, damit dieselbe Frage nicht alle zwei Wochen neu entschieden
            wird.
          </p>
          <div className="lp-log">
            {nurSichtbare(d.entscheidungen).map((e) => (
              <div className="lp-log-zeile" key={e.datum + e.entscheidung}>
                <span className="wann">{datum(e.datum)}</span>
                <span className="was">{e.entscheidung}</span>
                {istIntern && e.freigabe === 'intern' ? (
                  <span className="zusatz">nur intern</span>
                ) : (
                  <span className="zusatz" />
                )}
              </div>
            ))}
          </div>
        </Sektion>

        {/* 17 Abgleich, nur intern -------------------------------------------- */}
        <Sektion id="beobachtungen">
          <p className="lp-intern">
            nur intern
          </p>
          <p className="lp-aussage lp-luft-oben-klein">
            Stellen, die nicht aufgehen.
          </p>
          <div className="lp-text lp-luft-oben-klein">
            <p>
              Beim Übertragen der Zahlen aus den drei Quellen sind sie aufgefallen. Sie stehen hier,
              statt beim Übertragen geglättet zu werden.
            </p>
          </div>
          <div className="lp-zellen">
            {nurSichtbare(d.beobachtungen).map((b) => (
              <div className="lp-zelle" key={b.id}>
                <span className="kopf">ungeklärt</span>
                <h3>{b.titel}</h3>
                <p>{b.text}</p>
                <p className="kopf">{b.quelle}</p>
              </div>
            ))}
          </div>
        </Sektion>
      </main>

      <Fussleiste />
    </>
  )
}
