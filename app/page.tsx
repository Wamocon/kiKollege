import { Enthuellen } from '@/components/Enthuellen'
import { EnablerRaster } from '@/components/figuren/EnablerRaster'
import { Fussleiste } from '@/components/landing/Fussleiste'
import { Kopfleiste } from '@/components/landing/Kopfleiste'
import { Sektion } from '@/components/landing/Sektion'
import { daten, datum, tageZwischen, zahl } from '@/lib/daten'
import { istIntern, nurSichtbare } from '@/lib/freigabe'

export default function Landing() {
  const d = daten
  const fachreview = d.prueflaeufe.laeufe.find((l) => l.art === 'urteilend')!
  const rechenlauf = d.prueflaeufe.laeufe.find((l) => l.zusatz != null)
  const wiederholung = d.prueflaeufe.laeufe.find((l) => l.art === 'wiederholung')
  const fehlalarmquote = d.messluecken.find((m) => m.id === 'fehlalarmquote')!
  const weitereLuecken = nurSichtbare(d.messluecken).filter((m) => m.id !== 'fehlalarmquote')

  return (
    <>
      <Kopfleiste />
      <Enthuellen />

      <main id="inhalt">
        {/* 01 --------------------------------------------------------------- */}
        <Sektion id="vorhaben" klasse="lp-hero">
          <h1 className="lp-display">
            <span className="zeile">Fritz prüft.</span>
            <span className="zeile">Ein Mensch gibt frei.</span>
          </h1>

          <div className="lp-hero-raster">
            <p className="lp-lead">
              Die WAMOCON GmbH baut KI-Mitarbeiter. Der erste ist ein Reviewer. Er prüft
              Schulungsunterlagen der WAMOCON Academy gegen einen definierten Maßstab und liefert
              einen priorisierten Bericht mit Fundstellen. Wie zuverlässig er dabei ist, ist noch
              nicht gemessen. Auch das steht auf dieser Seite.
            </p>
            <div data-enthuellen>
              <EnablerRaster />
            </div>
          </div>

          <dl className="lp-spec" data-enthuellen>
            <div className="lp-spec-zeile">
              <dt>Rolle</dt>
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
                {d.massstab.kriterien.gesamt} Kriterien, {d.massstab.schweregrade.length}{' '}
                Schweregrade, {zahl(26)} Regeln mit Testfällen
              </dd>
            </div>
            <div className="lp-spec-zeile">
              <dt>Bisher geprüft</dt>
              <dd>
                {zahl(fachreview.fragen!)} Fragen in {zahl(fachreview.enabler!)} Enablern,{' '}
                {d.prueflaeufe.protokolliert} protokollierte Prüfläufe
              </dd>
            </div>
            <div className="lp-spec-zeile">
              <dt>Nicht gemessen</dt>
              <dd>
                <b>die Fehlalarmquote.</b> Kein Befund ist bisher von einem Menschen bewertet
                worden.
              </dd>
            </div>
          </dl>
        </Sektion>

        {/* 02 --------------------------------------------------------------- */}
        <Sektion id="grenze">
          <p className="lp-aussage" data-enthuellen>
            Ein KI-Mitarbeiter, der für sein Ergebnis selbst einsteht, ist keine Rolle, sondern ein
            Haftungsproblem.
          </p>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Fritz bewertet. Er erstellt keine Unterlagen und erteilt keine Freigabe. Die Freigabe
              bleibt bei einem Menschen. Das ist eine Rollengrenze mit einem Grund, keine
              Vorsichtsformel.
            </p>
            <p>
              Dass ein Testhaus seinen ersten KI-Mitarbeiter als Prüfer baut und nicht als
              Ersteller, hat denselben Ursprung wie die Entscheidung zum Fehlalarm weiter unten.
              Die Haltung zum Befund kommt aus dem Kerngeschäft.
            </p>
            <p>
              Daneben steht ein zweites Ziel gleichrangig: Das Vorgehen soll auf weitere Rollen und
              weitere Ausbildungsberufe übertragbar sein. Gebaut wird nichts, was nur für einen
              Beruf funktioniert, wenn es ohne Mehraufwand allgemein geht.
            </p>
          </div>
        </Sektion>

        {/* 03 --------------------------------------------------------------- */}
        <Sektion id="begriffe">
          <p className="lp-aussage breit" data-enthuellen>
            Drei Begriffe, die auseinandergehalten werden.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>
              Wer sie vermischt, hält den Chat-Verlauf für Wissen und das Sprachmodell für den
              Mitarbeiter.
            </p>
          </div>
          <div className="lp-zellen" data-enthuellen>
            {d.begriffe.map((b, i) => (
              <div className="lp-zelle" key={b.begriff}>
                <span className="kopf">{String(i + 1).padStart(2, '0')}</span>
                <h3>{b.begriff}</h3>
                <p>{b.erklaerung}</p>
                <p className="stark">{b.anzahl}</p>
              </div>
            ))}
          </div>
        </Sektion>

        {/* 04 --------------------------------------------------------------- */}
        <Sektion id="schichten">
          <p className="lp-aussage breit" data-enthuellen>
            Acht Schichten. Zwei davon tragen den Rest.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>
              Es gibt keinen Industriestandard dafür, wie ein KI-Mitarbeiter aufgebaut ist. Für
              einzelne Schichten gibt es Konventionen: <span className="mono">AGENTS.md</span> für
              den Auftragstext, das Agent-Skills-Format für Fähigkeiten, MCP für Werkzeuge. Die acht
              Schichten sind die Ordnung dieses Projekts darüber, seit dem{' '}
              {datum(d.schichtenEntschieden)} als Referenzmodell.
            </p>
          </div>

          <div className="lp-zellen vier" data-enthuellen>
            {d.schichten.map((s) => (
              <div className={s.traegt ? 'lp-zelle traegt' : 'lp-zelle'} key={s.nr}>
                <span className="kopf">
                  {String(s.nr).padStart(2, '0')}
                  {s.traegt ? ' · trägt' : ''}
                </span>
                <h3>{s.name}</h3>
                <p>{s.frage}</p>
              </div>
            ))}
          </div>

          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Die beiden tragenden sind nicht die, die man erwartet: das Gedächtnis und die
              Aufsicht. Ohne bewertete Befunde gibt es keine Fehlalarmquote, ohne Quote keine
              Abnahme. Alles andere vergrößert, was ein KI-Mitarbeiter tut, ohne zu klären, wie gut
              er es tut.
            </p>
            <p>
              Wissen ist, was jemand entschieden hat, dass es gilt. Gedächtnis ist, was beim
              Arbeiten herausgekommen ist. Wissen schreiben Menschen, Gedächtnis fällt bei Läufen
              an. Ausdrücklich kein Gedächtnis ist der Verlauf einer Sitzung: Was nicht geschrieben
              wurde, ist nicht passiert.
            </p>
          </div>
        </Sektion>

        {/* 05 --------------------------------------------------------------- */}
        <Sektion id="massstab">
          <p className="lp-klein" data-enthuellen>
            Entschieden am {datum(d.massstab.kalibrierung.entschiedenAm)}
          </p>
          <p className="lp-aussage lp-luft-oben-klein" data-enthuellen>
            {d.massstab.kalibrierung.satz}
          </p>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Diese Entscheidung kalibriert alles andere. Die Begründung ist die eines Testhauses:{' '}
              {d.massstab.kalibrierung.begruendung}
            </p>
            <p>Der Beleg lag zu diesem Zeitpunkt bereits vor.</p>
          </div>

          <dl className="lp-spec" data-enthuellen>
            {nurSichtbare(d.fehlalarmBelege).map((f) => (
              <div className="lp-spec-zeile" key={f.id}>
                <dt>{f.titel}</dt>
                <dd>
                  <b>{zahl(f.fehlalarme)} Fehlalarme</b>
                  {f.ausEinerRegel != null
                    ? `, ${zahl(f.ausEinerRegel)} davon aus einer einzigen Regel`
                    : ', kein einziger Treffer war echt'}
                  {'. '}
                  Heute liegen {zahl(f.testfaelle)} Testfälle daraus vor, jeder mit seiner
                  Fundstelle.
                </dd>
              </div>
            ))}
          </dl>

          <p className="lp-klein lp-luft-oben" data-enthuellen>
            Vier Regeln sind nicht verhandelbar
          </p>
          <div className="lp-zellen vier" data-enthuellen>
            {d.auftrag.harteRegeln.map((r, i) => (
              <div className="lp-zelle" key={r.regel}>
                <span className="kopf">{String(i + 1).padStart(2, '0')}</span>
                <h3>{r.regel}</h3>
                <p>{r.grund}</p>
              </div>
            ))}
          </div>

          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Der Kriterienkatalog hat {d.massstab.kriterien.gesamt} benannte Kriterien,{' '}
              {d.massstab.kriterien.mechanisch} davon mechanisch prüfbar,{' '}
              {d.massstab.kriterien.urteilend} verlangen ein Urteil. Die Gewichtung ist{' '}
              {d.massstab.kriterien.gewichtung}. Die vier Schweregrade und der vollständige Katalog
              stehen im <a href="/stand/#massstab">ausführlichen Stand</a>.
            </p>
          </div>
        </Sektion>

        {/* 06 --------------------------------------------------------------- */}
        <Sektion id="gemessen">
          <p className="lp-aussage breit" data-enthuellen>
            {d.prueflaeufe.protokolliert} Prüfläufe in{' '}
            {tageZwischen(d.prueflaeufe.zeitraum.von, d.prueflaeufe.zeitraum.bis)} Tagen.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>
              Zwischen dem {datum(d.prueflaeufe.zeitraum.von)} und dem{' '}
              {datum(d.prueflaeufe.zeitraum.bis)} protokolliert. Die Zahlen stammen aus dem
              Frontmatter der Laufnotizen, nicht aus dieser Seite.
            </p>
          </div>

          <div className="lp-kpi" data-enthuellen>
            <div className="lp-kpi-kachel">
              <p className="lp-kpi-wert">{zahl(fachreview.fragen!)}</p>
              <p className="lp-kpi-label">Fragen einzeln gegen den Volltext ihres Enablers gehalten</p>
            </div>
            <div className="lp-kpi-kachel">
              <p className="lp-kpi-wert">{zahl(fachreview.befunde!)}</p>
              <p className="lp-kpi-label">
                Befunde daraus, davon {zahl(fachreview.blocker!)} Blocker
              </p>
            </div>
            {rechenlauf?.zusatz ? (
              <div className="lp-kpi-kachel">
                <p className="lp-kpi-wert">{zahl(rechenlauf.zusatz.gleichungen)}</p>
                <p className="lp-kpi-label">
                  nachgerechnete Gleichungen, davon{' '}
                  {zahl(rechenlauf.zusatz.gleichungenFalsch)} falsch
                </p>
              </div>
            ) : null}
            <div className="lp-kpi-kachel">
              <p className="lp-kpi-wert">{zahl(d.gegenstand.dateien)}</p>
              <p className="lp-kpi-label">Dateien im geprüften Bestand, ausschließlich Word</p>
            </div>
          </div>

          <div className="lp-log" data-enthuellen>
            {nurSichtbare(d.prueflaeufe.laeufe).map((l) => (
              <div className="lp-log-zeile" key={l.id}>
                <span className="wann">
                  {l.datum ? datum(l.datum) : `${datum(l.datumVon!)}–${datum(l.datumBis!)}`}
                </span>
                <span className="was">{l.gegenstand}</span>
                <span className="zusatz">{l.art}</span>
              </div>
            ))}
          </div>

          <p className="lp-aussage lp-luft-oben" data-enthuellen>
            {d.prueflaeufe.leitbefund.titel}
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>{d.prueflaeufe.leitbefund.text}</p>
            {wiederholung ? <p>{wiederholung.notiz}</p> : null}
          </div>
        </Sektion>

        {/* 07 --------------------------------------------------------------- */}
        <Sektion id="luecke">
          <div className="lp-hero-zahl" data-enthuellen>
            <p className="wert">0</p>
            <p className="beschriftung">
              von {zahl(fehlalarmquote.unbewertet!)} Befunden und Hinweisen sind bisher von einem
              Menschen bewertet worden.
            </p>
          </div>

          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{fehlalarmquote.text}</p>
            <p>
              Das ist der Engpass des Projekts, und er steht hier ausgeschrieben. Eine Seite, die
              ihn verschweigt, wird unglaubwürdig, sobald jemand nachfragt.
            </p>
          </div>

          <div className="lp-zellen" data-enthuellen>
            {weitereLuecken.map((m) => (
              <div className="lp-zelle" key={m.id}>
                <span className="kopf">nicht gemessen</span>
                <h3>{m.titel}</h3>
                <p>{m.text}</p>
              </div>
            ))}
            <div className="lp-zelle">
              <span className="kopf">Reihenfolge</span>
              <h3>Die Technik wurde vorgezogen</h3>
              <p>{d.entscheidungenNachtrag}</p>
            </div>
          </div>

          <p className="lp-aussage lp-luft-oben" data-enthuellen>
            Was diese Seite von einer üblichen KI-Seite unterscheidet, ist nicht die Technik,
            sondern dass sie ihre eigene Messlücke benennt.
          </p>
        </Sektion>

        {/* 08 --------------------------------------------------------------- */}
        <Sektion id="uebertragbarkeit">
          <p className="lp-aussage" data-enthuellen>
            {d.uebertragbarkeit.satz}
          </p>
          <div className="lp-zellen" data-enthuellen>
            <div className="lp-zelle">
              <span className="kopf">Kern</span>
              <h3>Für jeden Prüfgegenstand gleich</h3>
              <p>{d.uebertragbarkeit.kern}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">Profil</span>
              <h3>Je Gegenstand eigen</h3>
              <p>{d.uebertragbarkeit.profil}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">Auswahl</span>
              <h3>Eine Rolle braucht einen Engpass</h3>
              <p>{d.uebertragbarkeit.auswahlregel}</p>
            </div>
          </div>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.uebertragbarkeit.zweiterMitarbeiter}</p>
            <p>{d.uebertragbarkeit.uebergabe}</p>
          </div>
        </Sektion>

        {/* 09 --------------------------------------------------------------- */}
        <Sektion id="plattform">
          <p className="lp-intern" data-enthuellen>
            nur intern
          </p>
          <p className="lp-aussage lp-luft-oben-klein" data-enthuellen>
            Der Dauerbetrieb läuft im Haus, die Werkbank bleibt außen.
          </p>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Gebaut und gemessen wird auf {d.plattform.werkbank}. Für den Dauerbetrieb ist am{' '}
              {datum(d.plattform.entschiedenAm)} entschieden: {d.plattform.dauerbetrieb}. Dort soll
              ein Klon von Fritz stehen und den Kollegen bereitstehen.
            </p>
            <p>{d.plattform.ablageregel}</p>
          </div>

          <p className="lp-klein lp-luft-oben" data-enthuellen>
            Fünf Schritte bis zum {datum(d.plattform.termin)}
          </p>
          <ol className="lp-punkte" data-enthuellen>
            {d.plattform.schritte.map((s, i) => (
              <li key={s}>
                <span className="nr">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="punkt">{s}</span>
                  {i === 3 ? <p className="grund">{d.plattform.warumAbschaltung}</p> : null}
                </span>
              </li>
            ))}
          </ol>

          <div className="lp-zellen" data-enthuellen>
            <div className="lp-zelle">
              <span className="kopf">erreichbar</span>
              <h3>Was am {datum(d.plattform.termin)} stehen kann</h3>
              <p>{d.plattform.erreichbar}</p>
            </div>
            <div className="lp-zelle">
              <span className="kopf">offen</span>
              <h3>Was damit nicht beantwortet ist</h3>
              <p>{d.plattform.nichtBeantwortet}</p>
            </div>
          </div>
        </Sektion>

        {/* 10 --------------------------------------------------------------- */}
        <Sektion id="entscheidungen">
          <p className="lp-aussage breit" data-enthuellen>
            Jede Entscheidung mit Datum, damit dieselbe Frage nicht alle zwei Wochen neu entschieden
            wird.
          </p>
          <div className="lp-log" data-enthuellen>
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

        {/* 11 --------------------------------------------------------------- */}
        <Sektion id="offen">
          <p className="lp-aussage breit" data-enthuellen>
            Was als Nächstes ansteht, nach Priorität.
          </p>
          <ol className="lp-punkte" data-enthuellen>
            {nurSichtbare(d.offenePunkte).map((p) => (
              <li key={p.nr}>
                <span className="nr">{String(p.nr).padStart(2, '0')}</span>
                <span>
                  <span className="punkt">{p.punkt}</span>
                  {p.grund ? <p className="grund">{p.grund}</p> : null}
                </span>
              </li>
            ))}
          </ol>
        </Sektion>

        {/* 12 --------------------------------------------------------------- */}
        <Sektion id="beobachtungen">
          <p className="lp-intern" data-enthuellen>
            nur intern
          </p>
          <p className="lp-aussage lp-luft-oben-klein" data-enthuellen>
            Drei Stellen, die nicht aufgehen.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>
              Beim Übertragen der Zahlen aus dem Übergabedokument und dem CI-Blatt sind sie
              aufgefallen. Sie stehen hier, statt beim Übertragen geglättet zu werden.
            </p>
          </div>
          <div className="lp-zellen" data-enthuellen>
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
