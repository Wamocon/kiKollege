import { Enthuellen } from '@/components/Enthuellen'
import { EnablerRaster } from '@/components/figuren/EnablerRaster'
import { Durchlauf } from '@/components/figuren/Durchlauf'
import { Pruefpunkte } from '@/components/figuren/Pruefpunkte'
import { Steuerung } from '@/components/figuren/Steuerung'
import { Wissensablagen } from '@/components/figuren/Wissensablagen'
import { Fussleiste } from '@/components/landing/Fussleiste'
import { Kopfleiste } from '@/components/landing/Kopfleiste'
import { Sektion } from '@/components/landing/Sektion'
import { daten, datum, harteRegel, tageZwischen, zahl } from '@/lib/daten'
import { istIntern, nurSichtbare } from '@/lib/freigabe'

export default function Landing() {
  const d = daten
  const gmbh = d.gesellschaften[0]
  const fachreview = d.prueflaeufe.laeufe.find((l) => l.art === 'urteilend')!
  const rechenlauf = d.prueflaeufe.laeufe.find((l) => l.zusatz != null)
  const wiederholung = d.prueflaeufe.laeufe.find((l) => l.art === 'wiederholung')
  const fehlalarmquote = d.messluecken.find((m) => m.id === 'fehlalarmquote')!
  const stufen = nurSichtbare(d.stufen)

  return (
    <>
      <Kopfleiste />
      <Enthuellen />

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

          <dl className="lp-spec" data-enthuellen>
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
              <dt>Nicht gemessen</dt>
              <dd>
                <b>die Fehlalarmquote.</b> {d.standSatz}
              </dd>
            </div>
          </dl>
        </Sektion>

        {/* 02 Kein Chatbot -------------------------------------------------- */}
        <Sektion id="chatbot">
          <p className="lp-aussage" data-enthuellen>
            {d.abgrenzung.satz}
          </p>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.abgrenzung.erklaerung}</p>
          </div>

          <div className="lp-gegen-rahmen" data-enthuellen>
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
          <p className="lp-aussage breit" data-enthuellen>
            Vier Merkmale entscheiden, ob eine Aufgabe in Frage kommt.
          </p>

          <div className="lp-paar" data-enthuellen>
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

          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.eignung.nachsatz}</p>
          </div>

          <p className="lp-aussage lp-luft-oben" data-enthuellen>
            {harteRegel('rollengrenze').grund}
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
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
          <p className="lp-aussage breit" data-enthuellen>
            Was dabei herauskommt, das anders nicht zu haben ist.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>{d.ertrag.einleitung}</p>
          </div>
          <div className="lp-zellen" data-enthuellen>
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
          <p className="lp-aussage breit" data-enthuellen>
            Acht Fragen, die auch ein neuer Kollege beantwortet bekommt.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>{d.schichtenErklaerung}</p>
          </div>

          <div className="lp-gegen-rahmen" data-enthuellen>
            <table className="lp-gegen">
              <thead>
                <tr>
                  <th style={{ width: '3rem' }}>Nr.</th>
                  <th className="stark">Schicht</th>
                  <th>Frage</th>
                  <th>Wo es in seiner Datei steht</th>
                </tr>
              </thead>
              <tbody>
                {d.schichten.map((s) => (
                  <tr key={s.nr}>
                    <td className="merkmal" style={{ width: '3rem' }}>
                      {String(s.nr).padStart(2, '0')}
                    </td>
                    <td>
                      <b>{s.name}</b>
                    </td>
                    <td className="leise">{s.frage}</td>
                    <td className="merkmal" style={{ width: '13rem' }}>
                      {s.datei}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.schichtenDatei}</p>
            <p>
              Die beiden untersten Schichten tragen den Rest. Ohne bewertete Ergebnisse gibt es
              keine Messung, und ohne Messung keinen Grund, dem Werkzeug zu glauben.{' '}
              {d.schichtenErbe}
            </p>
          </div>

          <div className="lp-quelltext" data-enthuellen>
            <p className="lp-quelltext-kopf">
              <b>{d.beschreibungsdatei.name}</b>
              <span>{d.beschreibungsdatei.stand}</span>
            </p>
            <pre>{d.beschreibungsdatei.auszug}</pre>
          </div>

          <div className="lp-zellen lp-luft-oben" data-enthuellen>
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
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.beschreibungsdatei.einzigeQuelle}</p>
          </div>
        </Sektion>

        {/* 06 Wissen -------------------------------------------------------- */}
        <Sektion id="wissen">
          <p className="lp-aussage breit" data-enthuellen>
            Zwei Wissensablagen, nicht eine.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>{d.wissensablagen.satz}</p>
          </div>

          <div data-enthuellen>
            <Wissensablagen />
          </div>

          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.wissensablagen.gemeinsam.hinweis}</p>
          </div>

          <div className="lp-paar" data-enthuellen>
            <div>
              <h3>Wissen — was gilt</h3>
              <p className="lp-untertitel">Schreiben Menschen. Ändert sich selten, und nie von allein.</p>
              <ul>
                <li>Norm von außen: Gesetze, Verordnungen, wörtlich abgeschrieben</li>
                <li>Maßstab des Hauses: Checklisten, Vorlagen, Corporate Design</li>
                <li>Begriffe: was ein Wort hier bedeutet</li>
                <li>Entscheidungen: was einmal festgelegt wurde, mit Datum</li>
              </ul>
            </div>
            <div>
              <h3>Gedächtnis — was herauskam</h3>
              <p className="lp-untertitel">Fällt beim Arbeiten an. Wächst mit jedem Auftrag.</p>
              <ul>
                <li>Einzelergebnis: hunderte je Lauf, maschinell geschrieben</li>
                <li>
                  Regel: wenige, langlebig. Zweck, Testfälle und die gemessene Fehlalarmquote
                </li>
                <li>Lauf: eine Notiz je Durchgang, mit Kennzahlen für den Vergleich über die Zeit</li>
              </ul>
            </div>
          </div>

          <div className="lp-text lp-luft-oben" data-enthuellen>
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
        </Sektion>

        {/* 07 Durchlauf ------------------------------------------------------ */}
        <Sektion id="durchlauf">
          <p className="lp-aussage breit" data-enthuellen>
            Zwei Stufen, weil sie Verschiedenes finden.
          </p>

          <div data-enthuellen>
            <Durchlauf />
          </div>

          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.durchlauf.zweiStufen}</p>
            <p>{d.durchlauf.rueckweg}</p>
            <p>{d.durchlauf.verdichtung}</p>
          </div>

          <div data-enthuellen>
            <Pruefpunkte />
          </div>
        </Sektion>

        {/* 08 Messung -------------------------------------------------------- */}
        <Sektion id="messung">
          <p className="lp-aussage" data-enthuellen>
            Ein KI-Mitarbeiter, dem man nicht glauben kann, ist schlimmer als keiner.
          </p>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Dann muss man seine Arbeit zusätzlich nachprüfen. Zwei Zahlen entscheiden, und beide
              muss man tatsächlich erheben.
            </p>
          </div>

          <div className="lp-zellen" data-enthuellen>
            <div className="lp-zelle">
              <span className="kopf">
                Frage 1 · {wiederholung ? 'gemessen' : 'offen'}
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
              <span className="kopf">Frage 2 · offen</span>
              <h3>Wie oft meldet er etwas, das keins ist?</h3>
              <p>
                Die härtere Zahl. Sie lässt sich nur erheben, wenn Fachleute eine Stichprobe
                durchsehen und Stück für Stück sagen: berechtigt oder Fehlalarm.
              </p>
              <p className="stark">Bis heute nicht gemessen. Das ist der nächste Schritt.</p>
            </div>
          </div>

          <div className="lp-hero-zahl lp-luft-oben" data-enthuellen>
            <p className="wert">0</p>
            <p className="beschriftung">
              von {zahl(fehlalarmquote.unbewertet!)} Befunden und Hinweisen sind bisher von einem
              Menschen bewertet worden.
            </p>
          </div>

          <p className="lp-klein lp-luft-oben" data-enthuellen>
            Entschieden am {datum(d.massstab.kalibrierung.entschiedenAm)}
          </p>
          <p className="lp-aussage lp-luft-oben-klein" data-enthuellen>
            {d.massstab.kalibrierung.satz}
          </p>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Wer dreimal einen falschen Alarm bekommt, sieht beim vierten Mal nicht mehr hin. Dann
              nützt auch das nichts mehr, was richtig gefunden wurde. Deshalb gilt die Regel, im
              Zweifel zu schweigen. Und jede Regel braucht zwei Testfälle, einen bekannt richtigen
              und einen bekannt falschen, bevor sie eingesetzt wird.
            </p>
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
                  {f.ursache ?? ''} Heute liegen {zahl(f.testfaelle)} Testfälle daraus vor, jeder
                  mit seiner Fundstelle.
                </dd>
              </div>
            ))}
          </dl>
        </Sektion>

        {/* 09 Der erste ------------------------------------------------------ */}
        <Sektion id="erster">
          <p className="lp-klein" data-enthuellen>
            Seit Ende August im Einsatz
          </p>
          <p className="lp-aussage breit lp-luft-oben-klein" data-enthuellen>
            Fritz, Reviewer für Schulungsunterlagen.
          </p>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>
              Er prüft die Unterlagen der WAMOCON Academy für die Ausbildung zu Kaufleuten für
              Büromanagement gegen die Checklisten des Hauses und die Ausbildungsverordnung, und
              schreibt einen Bericht. {zahl(d.gegenstand.dateien)} Dateien liegen dort. Jede müsste
              vollständig und jedes Mal gleich geprüft werden. Die Aufgabe ist nicht schwer, sie ist
              zu viel.
            </p>
          </div>

          <div className="lp-kpi" data-enthuellen>
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

          <div className="lp-zellen lp-luft-oben" data-enthuellen>
            <div className="lp-zelle traegt">
              <span className="kopf">So sieht ein Befund aus · {d.beispielbefund.stufe}</span>
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

        {/* 10 Steuerung ------------------------------------------------------ */}
        <Sektion id="steuerung">
          <p className="lp-aussage breit" data-enthuellen>
            Wie er gesteuert wird, und was er selbst steuert.
          </p>

          <div data-enthuellen>
            <Steuerung />
          </div>

          <div className="lp-zellen lp-luft-oben" data-enthuellen>
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

        {/* 11 Stand ---------------------------------------------------------- */}
        <Sektion id="stand">
          <p className="lp-aussage breit" data-enthuellen>
            {tageZwischen(d.arbeitstage.beginn, d.stand)} Tage, mit Datum.
          </p>
          <div className="lp-zeit" data-enthuellen>
            {d.arbeitstage.eintraege.map((e) => (
              <div className="lp-zeit-zeile" key={e.datum}>
                <span className="wann">{datum(e.datum)}</span>
                <span className="was">{e.text}</span>
              </div>
            ))}
          </div>

          <p className="lp-aussage lp-luft-oben" data-enthuellen>
            Von vier Gruppen ist genau eine technisch.
          </p>
          <div className="lp-zellen vier" data-enthuellen>
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
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.hemmnisse.satz}</p>
          </div>
        </Sektion>

        {/* 12 Stufen --------------------------------------------------------- */}
        <Sektion id="stufen">
          <p className="lp-aussage breit" data-enthuellen>
            {stufen.length} Stufen, jede an eine Bedingung geknüpft.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>
              Der erste KI-Mitarbeiter ist ein Pilot.{' '}
              {stufen[0]?.bedingungsart === 'termin'
                ? 'Die erste Stufe ist ein Termin, die übrigen hängen an Zahlen.'
                : 'Jede Stufe hängt an einer Zahl, nicht an einem Wunschdatum.'}{' '}
              Dieselbe Reihenfolge gilt für jeden weiteren.
            </p>
          </div>
          <div className="lp-luft-oben" data-enthuellen>
            {stufen.map((s) => (
              <div className="lp-stufe" key={s.titel}>
                <span className="wann">{s.wann}</span>
                <div>
                  <h3>{s.titel}</h3>
                  <p>{s.text}</p>
                  <p className="bedingung">{s.bedingung}</p>
                </div>
              </div>
            ))}
          </div>
        </Sektion>

        {/* 13 Aufwand -------------------------------------------------------- */}
        <Sektion id="arbeit">
          <p className="lp-aussage" data-enthuellen>
            {d.arbeitsschwerpunkt.satz}
          </p>
          <div className="lp-zellen lp-luft-oben" data-enthuellen>
            <div className="lp-zelle">
              <span className="kopf">Was es braucht</span>
              <p className="stark">{d.arbeitsschwerpunkt.brauchtEs}</p>
            </div>
            <div className="lp-zelle traegt">
              <span className="kopf">Was für die Auswahl folgt</span>
              <p className="stark">{d.arbeitsschwerpunkt.auswahl}</p>
            </div>
          </div>
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.arbeitsschwerpunkt.schluss}</p>
            <p>{d.uebertragbarkeit.auswahlregel}</p>
          </div>
        </Sektion>

        {/* 14 Betrieb, nur intern -------------------------------------------- */}
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
              {datum(d.plattform.entschiedenAm)} entschieden: {d.plattform.dauerbetrieb}.
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
          <div className="lp-text lp-luft-oben" data-enthuellen>
            <p>{d.plattform.nichtBeantwortet}</p>
          </div>
        </Sektion>

        {/* 15 Entscheidungen -------------------------------------------------- */}
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

        {/* 16 Abgleich, nur intern -------------------------------------------- */}
        <Sektion id="beobachtungen">
          <p className="lp-intern" data-enthuellen>
            nur intern
          </p>
          <p className="lp-aussage lp-luft-oben-klein" data-enthuellen>
            Stellen, die nicht aufgehen.
          </p>
          <div className="lp-text lp-luft-oben-klein" data-enthuellen>
            <p>
              Beim Übertragen der Zahlen aus den drei Quellen sind sie aufgefallen. Sie stehen hier,
              statt beim Übertragen geglättet zu werden.
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
