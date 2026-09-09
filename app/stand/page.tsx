import { Kopf } from '@/components/Kopf'
import { Nav } from '@/components/Nav'
import { Fuss } from '@/components/Fuss'
import { Block, Hinweis, Kachelband, Kopfzeile, Marker } from '@/components/bausteine'
import { abschnitt } from '@/lib/abschnitte'
import { daten, datum, harteRegel, zahl } from '@/lib/daten'
import { istIntern, nurSichtbare, sichtbar } from '@/lib/freigabe'

const zeigen = (id: string) => sichtbar(abschnitt(id))

export default function Seite() {
  const d = daten
  const mechanisch = d.prueflaeufe.laeufe.filter((l) => l.art === 'mechanisch')
  const urteilend = d.prueflaeufe.laeufe.filter((l) => l.art === 'urteilend')
  const wiederholung = d.prueflaeufe.laeufe.find((l) => l.art === 'wiederholung')
  const rechenlauf = mechanisch.find((l) => l.zusatz != null)
  const quizlauf = mechanisch.find((l) => l.ohneBefund != null)
  const fachreview = urteilend[0]
  const n = d.gegenstand.normbasis

  return (
    <>
      <Kopf />

      <div className="rumpf">
        <Nav />

        <main className="inhalt" id="inhalt">
          {/* 01 ------------------------------------------------------------ */}
          <section id="vorhaben">
            <Kopfzeile id="vorhaben" />
            <div className="prosa">
              <p className="lead">
                Die WAMOCON GmbH baut KI-Mitarbeiter. Der erste heißt Fritz und ist ein Reviewer. Er prüft
                Schulungsunterlagen der WAMOCON Academy für die IHK-Ausbildung Kaufleute für Büromanagement
                gegen einen definierten Maßstab und liefert einen priorisierten Bericht mit Fundstellen.
              </p>
              <p>
                Fritz bewertet. Er erstellt keine Unterlagen und erteilt keine Freigabe. Die Freigabe
                bleibt bei einem Menschen. Das ist eine Rollengrenze mit einem Grund:{' '}
                {harteRegel('rollengrenze').grund}
              </p>
              <p>
                Das zweite Ziel steht gleichrangig neben dem ersten. Das Vorgehen soll auf weitere Rollen und
                weitere Ausbildungsberufe übertragbar sein. Nichts wird gebaut, was nur für einen Beruf
                funktioniert, wenn es ohne Mehraufwand allgemein geht.
              </p>
            </div>

            <Kachelband kacheln={nurSichtbare(d.kennzahlen)} />

            <p className="fussnote" style={{ marginTop: '1rem' }}>
              Jede Zahl auf dieser Seite stammt aus einer Notiz im Vault oder aus dem Frontmatter eines
              Prüflaufs. Wo etwas nicht gemessen ist, steht das ausdrücklich dabei.
            </p>
          </section>

          {/* 02 ------------------------------------------------------------ */}
          <section id="begriffe">
            <Kopfzeile id="begriffe" />
            <div className="prosa">
              <p>
                Die drei Begriffe gehen im Gespräch leicht durcheinander. Wer sie nicht auseinanderhält, hält
                den Chat-Verlauf für Wissen und das Sprachmodell für den Mitarbeiter.
              </p>
            </div>
            <div className="raster">
              {d.begriffe.map((b) => (
                <div className="karte" key={b.begriff}>
                  <h3>{b.begriff}</h3>
                  <p>{b.erklaerung}</p>
                  <p style={{ marginTop: '0.5rem' }}>
                    <b>{b.anzahl}</b>
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 03 ------------------------------------------------------------ */}
          <section id="schichten">
            <Kopfzeile id="schichten" />
            <div className="prosa">
              <p>
                Es gibt keinen Industriestandard dafür, wie ein KI-Mitarbeiter aufgebaut ist. Für einzelne
                Schichten gibt es Konventionen: <span className="mono">AGENTS.md</span> für den Auftragstext,
                das Agent-Skills-Format für Fähigkeiten, MCP für Werkzeuge. Die acht Schichten sind die
                Ordnung dieses Projekts darüber, seit dem {datum(d.schichtenEntschieden)} als Referenzmodell.
              </p>
            </div>

            <div className="tabellenrahmen">
              <table aria-describedby="schichten-note">
                <thead>
                  <tr>
                    <th style={{ width: '3rem' }}>Nr.</th>
                    <th style={{ width: '14rem' }}>Schicht</th>
                    <th>Frage</th>
                  </tr>
                </thead>
                <tbody>
                  {d.schichten.map((s) => (
                    <tr key={s.nr}>
                      <td className="mono">{s.nr}</td>
                      <td>
                        <b>{s.name}</b>{' '}
                        {s.traegt ? <Marker art="offen">trägt</Marker> : null}
                      </td>
                      <td>{s.frage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="fussnote tabellennote" id="schichten-note">
              Die beiden mit „trägt“ markierten Schichten sind die, an denen der Rest hängt.
            </p>

            <Hinweis art="wichtig" wort="Schwerpunkt">
              <p>
                Zwei Schichten tragen den Rest, und es sind nicht die, die man erwartet: das Gedächtnis und
                die Aufsicht. Ohne bewertete Befunde gibt es keine Fehlalarmquote, ohne Quote keine Abnahme.
                Alles andere vergrößert, was ein KI-Mitarbeiter tut, ohne zu klären, wie gut er es tut.
              </p>
            </Hinweis>

            <div className="prosa" style={{ marginTop: '1.3rem' }}>
              <p>
                Eine ältere Kurzform mit fünf Bausteinen ist weiter gültig, hat aber keinen Baustein für das
                Gedächtnis. Genau das war der Grund, die acht Schichten zur Referenz zu machen: Wer mit fünf
                Bausteinen plant, plant das Lernen nicht mit.
              </p>
            </div>
          </section>

          {/* 04 ------------------------------------------------------------ */}
          <section id="gedaechtnis">
            <Kopfzeile id="gedaechtnis" />
            <div className="prosa">
              <p>
                Wissen ist, was jemand entschieden hat, dass es gilt. Gedächtnis ist, was beim Arbeiten
                herausgekommen ist. Wissen schreiben Menschen, Gedächtnis fällt bei Läufen an. Verwechselt
                werden die beiden regelmäßig, weil sie teilweise am selben Ort liegen.
              </p>
            </div>

            <div className="raster">
              <div className="karte">
                <h3>Wissen: vier Sorten</h3>
                <ul className="liste" style={{ marginTop: '0.6rem' }}>
                  <li>Die Normbasis, amtlicher Wortlaut, wörtlich abgeschrieben. Fehlt sie, kann der Reviewer die Abdeckung nicht beurteilen.</li>
                  <li>Der interne Maßstab aus Checklisten, Systematik, Corporate Design und Schweregraden. Fehlt er, prüft Fritz Konformität statt Qualität.</li>
                  <li>Die Begriffe. Fehlen sie, meinen zwei Sitzungen dasselbe Wort verschieden.</li>
                  <li>Die Entscheidungen mit Datum. Fehlen sie, wird dieselbe Frage alle zwei Wochen neu entschieden.</li>
                </ul>
              </div>
              <div className="karte">
                <h3>Gedächtnis: drei Körnungen</h3>
                <ul className="liste" style={{ marginTop: '0.6rem' }}>
                  <li>Der einzelne Befund, mehrere hundert je Lauf.</li>
                  <li>Die Regel: {zahl(d.kennzahlen.find((k) => k.id === 'regeln')?.zahl ?? 0)} Stück, stabil, mit Zweck, Testfällen und gemessener Fehlalarmquote.</li>
                  <li>Der Lauf, eine Notiz mit Kennzahlen.</li>
                </ul>
                <p style={{ marginTop: '0.7rem' }}>
                  Die mittlere Körnung fehlt heute.
                </p>
              </div>
            </div>

            <Hinweis wort="Lücke">
              <p>
                Zwischen hunderten Einzelbefunden und einer Gesamtkennzahl gibt es nichts, was über eine
                einzelne Regel Auskunft gibt. Das ist genau die Frage, die man stellt, wenn man wissen will,
                ob man einem Befund glauben darf.
              </p>
            </Hinweis>

            <div className="prosa" style={{ marginTop: '1.3rem' }}>
              <p>
                Der Weg, auf dem aus Gedächtnis wieder Wissen wird, ist der einzige Mechanismus, durch den ein
                KI-Mitarbeiter über die Zeit besser wird: Ein Mensch bewertet einen Befund mit Fundstelle,
                über viele Bewertungen ergibt sich je Regel eine Quote, und ein urteilender Prüfpunkt, der
                dreimal gleich ausfällt, wird zu einer mechanischen Regel mit Testfällen aus genau den Fällen,
                die sie ausgelöst haben.
              </p>
              <p>
                Ausdrücklich kein Gedächtnis ist der Verlauf einer Sitzung. Was nicht geschrieben wurde, ist
                nicht passiert.
              </p>
            </div>
          </section>

          {/* 05 ------------------------------------------------------------ */}
          <section id="fritz">
            <Kopfzeile id="fritz" />
            <div className="prosa">
              <p>
                Ohne {d.auftrag.pflichtangaben.length} Angaben kann Fritz nicht sinnvoll prüfen. Fehlt eine
                davon, wird nachgefragt statt geraten.
              </p>
            </div>
            <ul className="liste">
              {d.auftrag.pflichtangaben.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>

            <h3 style={{ marginTop: '1.8rem' }}>Der Ablauf</h3>
            <ol className="schritte">
              {d.auftrag.ablauf.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>

            <h3 style={{ marginTop: '1.8rem' }}>
              Vier Regeln sind nicht verhandelbar
            </h3>
            <div className="raster">
              {d.auftrag.harteRegeln.map((r) => (
                <div className="karte" key={r.regel}>
                  <h3>{r.regel}</h3>
                  <p>{r.grund}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 06 ------------------------------------------------------------ */}
          <section id="massstab">
            <Kopfzeile id="massstab" />
            <div className="prosa">
              <p>
                Der Kriterienkatalog hat {d.massstab.kriterien.gesamt} benannte Kriterien.{' '}
                {d.massstab.kriterien.mechanisch} davon sind mechanisch prüfbar,{' '}
                {d.massstab.kriterien.urteilend} verlangen ein Urteil.
              </p>
            </div>
            <ul className="liste">
              {d.massstab.kriterien.liste.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>

            <Hinweis wort="offen">
              <p>
                Die Gewichtung der Kriterien ist {d.massstab.kriterien.gewichtung}.
              </p>
            </Hinweis>

            <div className="tabellenrahmen">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '9rem' }}>Schweregrad</th>
                    <th>Bedeutung</th>
                  </tr>
                </thead>
                <tbody>
                  {d.massstab.schweregrade.map((s) => (
                    <tr key={s.stufe}>
                      <td>
                        <span className={`stufe ${s.stufe.toLowerCase()}`}>{s.stufe}</span>
                      </td>
                      <td>{s.bedeutung}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Block titel={d.massstab.kalibrierung.satz}>
              <p>
                Am {datum(d.massstab.kalibrierung.entschiedenAm)} entschieden, und diese Entscheidung
                kalibriert alles andere. Die Begründung ist die eines Testhauses:{' '}
                {d.massstab.kalibrierung.begruendung}
              </p>
              <p style={{ marginTop: '0.7rem' }}>{d.massstab.kalibrierung.offen}</p>
            </Block>
          </section>

          {/* 07 ------------------------------------------------------------ */}
          <section id="gegenstand">
            <Kopfzeile id="gegenstand" />
            <div className="prosa">
              <p>
                Die WAMOCON Academy gliedert ihre Unterlagen {d.gegenstand.gliederung}. Drei Ebenen:{' '}
                {d.gegenstand.komponenten} Komponenten entlang der Zeitachse,{' '}
                {d.gegenstand.themenkomplexe} Themenkomplexe, je einer Berufsbildposition entsprechend, und{' '}
                {d.gegenstand.enabler} Enabler, je einem Buchstaben der Position entsprechend. An jedem
                Enabler hängen {d.gegenstand.jeEnabler}. Zusammen {zahl(d.gegenstand.dateien)} Dateien,{' '}
                {d.gegenstand.format}. {d.gegenstand.enablerVollstaendig} der {d.gegenstand.enabler} Enabler
                sind vollständig ausgestattet.
              </p>
              <p>
                Die Academy deckt alle {d.gegenstand.wahlqualifikationen} Wahlqualifikationen ab. Der
                Rechtsstand ist die {d.gegenstand.rechtsstand}.
              </p>
              <p>
                Als Normbasis liegen {n.notizen} verlinkte Notizen im Vault: {n.positionenAbschnittA}{' '}
                Positionen aus Abschnitt A, {n.wahlqualifikationen} Wahlqualifikationen,{' '}
                {n.integrativeAbschnittC} integrative Positionen aus Abschnitt C, {n.lernfelder} Lernfelder,
                dazu {n.weitere.join(', ')}. Primärquelle ist das {n.primaerquelle}.
              </p>
            </div>

            <Hinweis
              wort="Rechtsstand"
              titel={`Zwei Ordnungen laufen parallel bis ${d.gegenstand.parallellauf.bis}`}
            >
              <p>
                {d.gegenstand.parallellauf.regel} Deshalb ist die Standsangabe in jeder Notiz Pflicht.{' '}
                {d.gegenstand.parallellauf.folge}
              </p>
            </Hinweis>
          </section>

          {/* 08 ------------------------------------------------------------ */}
          <section id="gemessen">
            <Kopfzeile id="gemessen" />
            <div className="prosa">
              <p>
                Zwischen dem {datum(d.prueflaeufe.zeitraum.von)} und dem {datum(d.prueflaeufe.zeitraum.bis)}{' '}
                sind {d.prueflaeufe.protokolliert} Prüfläufe protokolliert. Die Zahlen stammen aus dem
                Frontmatter der Laufnotizen. Ausgewiesen sind hier die{' '}
                {d.prueflaeufe.imDokumentAusgewiesen} Läufe, zu denen das Übergabedokument Kennzahlen nennt.
              </p>
            </div>

            <h3 style={{ marginTop: '1.8rem' }}>Mechanische Läufe</h3>
            <div className="tabellenrahmen">
              <table aria-describedby="mechanisch-note">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Gegenstand</th>
                    <th className="num">Geprüft</th>
                    <th className="num">Blocker</th>
                    <th className="num">Major</th>
                    <th className="num">Minor</th>
                    <th className="num">Hinweise</th>
                    <th>Laufzeit</th>
                  </tr>
                </thead>
                <tbody>
                  {mechanisch.map((l) => (
                    <tr key={l.id}>
                      <td className="datum">{l.datum ? datum(l.datum) : '—'}</td>
                      <td>{l.gegenstand}</td>
                      <td className="num">{l.geprueft != null ? zahl(l.geprueft) : '—'}</td>
                      <td className="num">{l.blocker != null ? zahl(l.blocker) : '—'}</td>
                      <td className="num">{l.major != null ? zahl(l.major) : '—'}</td>
                      <td className="num">{l.minor != null ? zahl(l.minor) : '—'}</td>
                      <td className="num">{l.hinweise != null ? zahl(l.hinweise) : '—'}</td>
                      <td>{l.laufzeit ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="fussnote tabellennote" id="mechanisch-note">
              Ein Strich heißt: für diesen Lauf nicht ausgewiesen.
              {rechenlauf?.zusatz ? (
                <>
                  {' '}
                  Beim Lauf vom {datum(rechenlauf.datum!)} wurden zusätzlich{' '}
                  {zahl(rechenlauf.zusatz.gleichungen)} Gleichungen nachgerechnet, davon{' '}
                  {zahl(rechenlauf.zusatz.gleichungenFalsch)} falsch.
                </>
              ) : null}
              {quizlauf?.ohneBefund != null ? (
                <> Beim Quizlauf blieben {zahl(quizlauf.ohneBefund)} Dokumente ohne Befund.</>
              ) : null}
            </p>

            {mechanisch[0].notiz ? (
              <Hinweis wort="Sammelkorrektur">
                <p>{mechanisch[0].notiz}</p>
              </Hinweis>
            ) : null}

            <h3 style={{ marginTop: '1.8rem' }}>Urteilende Läufe</h3>
            <div className="tabellenrahmen">
              <table aria-describedby="urteilend-note">
                <thead>
                  <tr>
                    <th>Zeitraum</th>
                    <th className="num">Themenkomplexe</th>
                    <th className="num">Enabler</th>
                    <th className="num">Fragen</th>
                    <th className="num">Befunde</th>
                    <th className="num">davon Blocker</th>
                  </tr>
                </thead>
                <tbody>
                  {urteilend.map((l) => (
                    <tr key={l.id}>
                      <td className="datum">
                        {datum(l.datumVon!)} bis {datum(l.datumBis!)}
                      </td>
                      <td className="num">{zahl(l.themenkomplexe!)}</td>
                      <td className="num">{zahl(l.enabler!)}</td>
                      <td className="num">{zahl(l.fragen!)}</td>
                      <td className="num">{zahl(l.befunde!)}</td>
                      <td className="num">{zahl(l.blocker!)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="fussnote tabellennote" id="urteilend-note">
              {fachreview.gegenstand}.
            </p>

            <Hinweis wort="ungeklärt" titel="Die Befundzahl geht nicht auf">
              <p>{fachreview.notiz}</p>
            </Hinweis>

            {sichtbar(d.prueflaeufe.befunddichte) ? (
              <Block titel="Wo die Befunde sitzen">
                <p>
                  Die Befunddichte streut deutlich, zwischen {d.prueflaeufe.befunddichte.min} und{' '}
                  {d.prueflaeufe.befunddichte.max} {d.prueflaeufe.befunddichte.einheit}, und sie bündelt sich
                  innerhalb der Kapitel. {d.prueflaeufe.befunddichte.buendelung}
                </p>
                {istIntern ? (
                  <p style={{ marginTop: '0.7rem' }}>
                    <Marker art="intern">nur intern</Marker> Aufschlüsselung je Themenkomplex gehört nicht auf
                    eine öffentliche Seite.
                  </p>
                ) : null}
              </Block>
            ) : null}

            <Hinweis art="wichtig" wort="Leitbefund" titel={d.prueflaeufe.leitbefund.titel}>
              <p>{d.prueflaeufe.leitbefund.text}</p>
            </Hinweis>

            {wiederholung ? (
              <Block titel="Wiederholbarkeit">
                <p>
                  Am {datum(wiederholung.datum!)} wurde {wiederholung.gegenstand}.{' '}
                  {wiederholung.notiz}
                </p>
                <p style={{ marginTop: '0.7rem' }} className="fussnote">
                  Der Lauf war nicht blind. Ein echter Blindtest steht aus.
                </p>
              </Block>
            ) : null}
          </section>

          {/* 09 ------------------------------------------------------------ */}
          <section id="luecke">
            <Kopfzeile id="luecke" />
            <div className="prosa">
              <p className="lead">
                Das ist der Engpass des Projekts, und er steht hier ausgeschrieben. Eine Seite, die ihn
                verschweigt, wird unglaubwürdig, sobald jemand nachfragt.
              </p>
            </div>

            {nurSichtbare(d.messluecken).map((m) => (
              <Hinweis
                key={m.id}
                art={m.id === 'fehlalarmquote' ? 'wichtig' : 'offen'}
                wort="nicht gemessen"
                titel={m.titel}
              >
                <p>{m.text}</p>
                {m.unbewertet != null ? (
                  <p style={{ marginTop: '0.7rem' }} className="fussnote">
                    Unbewertet: {zahl(m.unbewertet)} Befunde und Hinweise. {m.unbewertetHerkunft}.
                  </p>
                ) : null}
              </Hinweis>
            ))}

            <div className="prosa" style={{ marginTop: '1.8rem' }}>
              <p>
                Bekannt ist nur, wie es aussieht, wenn eine Regel danebengreift. Beide Serien liegen heute als
                Testfälle vor, jeweils mit der Fundstelle, aus der sie stammen. Wer die Regel ändert, lässt
                sie vorher laufen.
              </p>
            </div>

            <div className="tabellenrahmen">
              <table>
                <thead>
                  <tr>
                    <th>Serie</th>
                    <th className="num">Fehlalarme</th>
                    <th className="num">davon aus einer Regel</th>
                    <th className="num">Testfälle</th>
                    <th>Befund</th>
                  </tr>
                </thead>
                <tbody>
                  {nurSichtbare(d.fehlalarmBelege).map((f) => (
                    <tr key={f.id}>
                      <td>
                        <b>{f.titel}</b>
                      </td>
                      <td className="num">{zahl(f.fehlalarme)}</td>
                      <td className="num">{f.ausEinerRegel != null ? zahl(f.ausEinerRegel) : '—'}</td>
                      <td className="num">{zahl(f.testfaelle)}</td>
                      <td>{f.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 10 ------------------------------------------------------------ */}
          <section id="uebertragbarkeit">
            <Kopfzeile id="uebertragbarkeit" />
            <div className="prosa">
              <p>
                Der Reviewer besteht aus einem Kern, der für jeden Prüfgegenstand gleich ist ({d.uebertragbarkeit.kern}),
                und aus Profilen je Gegenstand ({d.uebertragbarkeit.profil}).{' '}
                {d.uebertragbarkeit.satz}
              </p>
              <p>{d.uebertragbarkeit.zweiterMitarbeiter}</p>
              <p>{d.uebertragbarkeit.uebergabe}</p>
            </div>

            <Hinweis wort="Auswahlregel">
              <p>{d.uebertragbarkeit.auswahlregel}</p>
            </Hinweis>
          </section>

          {/* 11 ------------------------------------------------------------ */}
          {zeigen('plattform') ? (
            <section id="plattform">
              <Kopfzeile id="plattform" />
              <div className="prosa">
                <p>
                  Gebaut und gemessen wird auf {d.plattform.werkbank}. Für den Dauerbetrieb ist am{' '}
                  {datum(d.plattform.entschiedenAm)} entschieden: {d.plattform.dauerbetrieb}. Dort soll ein
                  Klon von Fritz stehen und den Kollegen bereitstehen. {d.plattform.werkbank} bleibt die
                  Werkbank.
                </p>
                <p>{d.plattform.ablageregel}</p>
              </div>

              <h3 style={{ marginTop: '1.8rem' }}>
                Fünf Schritte bis zum {datum(d.plattform.termin)}
              </h3>
              <ol className="schritte">
                {d.plattform.schritte.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>

              <Hinweis wort="Testfallpflicht" titel="Warum die Abschaltung kein Detail ist">
                <p>{d.plattform.warumAbschaltung}</p>
              </Hinweis>

              <div className="raster">
                <div className="karte">
                  <h3>Was am {datum(d.plattform.termin)} erreicht sein kann</h3>
                  <p>{d.plattform.erreichbar}</p>
                </div>
                <div className="karte">
                  <h3>Was damit nicht beantwortet ist</h3>
                  <p>{d.plattform.nichtBeantwortet}</p>
                </div>
              </div>
            </section>
          ) : null}

          {/* 12 ------------------------------------------------------------ */}
          <section id="entscheidungen">
            <Kopfzeile id="entscheidungen" />
            <div className="tabellenrahmen">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '7rem' }}>Datum</th>
                    <th>Entscheidung</th>
                  </tr>
                </thead>
                <tbody>
                  {nurSichtbare(d.entscheidungen).map((e) => (
                    <tr key={e.datum + e.entscheidung}>
                      <td className="datum">{datum(e.datum)}</td>
                      <td>
                        {e.entscheidung}{' '}
                        {istIntern && e.freigabe === 'intern' ? (
                          <Marker art="intern">nur intern</Marker>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="prosa" style={{ marginTop: '1.3rem' }}>
              <p>{d.entscheidungenNachtrag}</p>
            </div>
          </section>

          {/* 13 ------------------------------------------------------------ */}
          <section id="offen">
            <Kopfzeile id="offen" />
            <div className="prosa">
              <p>Nach Priorität, mit dem Grund für die Reihenfolge.</p>
            </div>
            <ol className="schritte">
              {nurSichtbare(d.offenePunkte).map((p) => (
                <li key={p.nr}>
                  <b>{p.punkt}.</b> {p.grund ?? ''}
                </li>
              ))}
            </ol>
            <p className="fussnote" style={{ marginTop: '1rem' }}>
              Dazu kommt eine längere Liste fachlicher Einzelfragen aus den Prüfläufen. Die wird im
              Änderungsprotokoll geführt und gehört nicht hierher.
            </p>
          </section>

          {/* 14 ------------------------------------------------------------ */}
          {zeigen('beobachtungen') ? (
            <section id="beobachtungen">
              <Kopfzeile id="beobachtungen" />
              <div className="prosa">
                <p>
                  Beim Übertragen der Zahlen aus dem Übergabedokument und dem CI-Blatt sind drei Stellen
                  aufgefallen, die nicht aufgehen. Sie stehen hier, statt beim Übertragen geglättet zu werden.
                </p>
              </div>
              {nurSichtbare(d.beobachtungen).map((b) => (
                <Block key={b.id} titel={b.titel}>
                  <p>{b.text}</p>
                  <p className="fussnote" style={{ marginTop: '0.6rem' }}>
                    Quelle: {b.quelle}
                  </p>
                </Block>
              ))}
            </section>
          ) : null}

          {/* 15 ------------------------------------------------------------ */}
          {zeigen('quellen') ? (
            <section id="quellen">
              <Kopfzeile id="quellen" />
              <div className="prosa">
                <p>
                  Alles auf dieser Seite Zusammengefasste stammt aus dem Arbeitsordner{' '}
                  <span className="mono">{d.herkunft.arbeitsordner}</span>. Der Einstieg für einen Menschen,
                  der den Zusammenhang braucht, ist{' '}
                  <span className="mono">{d.herkunft.einstieg}</span>.
                </p>
                {d.herkunft.notizordner ? (
                  <p>
                    Die Zahlen dieser Seite liest der Export aus{' '}
                    <span className="mono">{d.herkunft.notizordner}</span>.
                  </p>
                ) : null}
              </div>
              <div className="tabellenrahmen">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '20rem' }}>Ort</th>
                      <th>Inhalt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nurSichtbare(d.quellen).map((q) => (
                      <tr key={q.ort}>
                        <td className="mono">{q.ort}</td>
                        <td>{q.inhalt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="fussnote" style={{ marginTop: '1rem' }}>
                {d.herkunft.verfahren}
              </p>
            </section>
          ) : null}
        </main>
      </div>

      <Fuss />
    </>
  )
}
