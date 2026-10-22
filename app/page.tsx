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
import { Begriff } from '@/components/landing/Begriff'
import { Sektion } from '@/components/landing/Sektion'
import { arbeitenStand, belastbarBei, daten, datum, harteRegel, tageZwischen, zahl, zielErreicht, type AnleitungAb } from '@/lib/daten'
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
  // Die nächste Abnahme ist die erste, die noch aussteht
  const naechsterMeilenstein = plan.meilensteine.find((ms) => !ms.abgenommen)
  const zuletztAbgenommen = [...plan.meilensteine].reverse().find((ms) => ms.abgenommen)
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
  const arbeitenSatz = (ms: (typeof plan.meilensteine)[number]) => {
    const s = arbeitenStand(ms)
    const erledigt =
      s.erledigt === 0
        ? 'Erledigt ist noch keine'
        : s.erledigt === 1
          ? 'Erledigt ist eine'
          : `Erledigt sind ${inWorten(s.erledigt)}`
    const entfallen =
      s.entfallen === 0 ? '' : s.entfallen === 1 ? ', eine entfällt' : `, ${inWorten(s.entfallen)} entfallen`
    return `${erledigt} von ${inWorten(s.gesamt)} Arbeiten${entfallen}.`
  }
  const rollen = koepfe.filter((k) => !k.passtNicht)
  const laufen = rollen.filter((k) => k.betrieb).length
  const mitGrenze = rollen.filter((k) => k.betrieb === 'mitGrenze').length

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
            Ein KI-Mitarbeiter ist ein <Begriff id="sprachmodell">Sprachmodell</Begriff>, also die
            Technik hinter Chat-Programmen, mit einer festen Aufgabe, einem aufgeschriebenen{' '}
            <Begriff id="massstab">Maßstab</Begriff> und einer <Begriff id="grenze">Grenze</Begriff>. Er prüft,
            sortiert und bereitet vor; was daraus folgt, entscheidet ein Mensch. Die {gmbh.name}{' '}
            baut solche Rollen seit dem {datum(d.arbeitstage.beginn)}. Fachwörter erklärt das
            Verzeichnis der <a href="#begriffe">Begriffe</a> am Ende.
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
                Der letzte Punkt schließt nichts aus: Wo die Entscheidung schwer wiegt, arbeitet der
                KI-Mitarbeiter zu, und ein Mensch entscheidet. {harteRegel('rollengrenze').grund}
              </p>
            </div>
          </div>
        </Sektion>

        {/* 02 Der erste: Fritz ------------------------------------------------ */}
        <Sektion id="erster">
          <p className="lp-klein">
            {d.ersterHinweis.kopf}
          </p>
          <h2 className="lp-aussage breit lp-luft-oben-klein">
            Fritz, Reviewer für Schulungsunterlagen.
          </h2>
          <div className="lp-text lp-luft-oben">
            <p>
              Er prüft die Unterlagen der WAMOCON Academy für die Ausbildung zu Kaufleuten für
              Büromanagement gegen die Checklisten des Hauses und die Ausbildungsordnung, und
              schreibt einen Bericht. {zahl(d.gegenstand.dateien)} Dateien liegen dort. Jede müsste
              vollständig und jedes Mal gleich geprüft werden. Die Aufgabe ist nicht schwer, sie ist
              zu viel.
            </p>
            <p>{d.ersterHinweis.text}</p>
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
                {d.massstab.kriterien.gesamt} <Begriff id="kriterium">Kriterien</Begriff>,{' '}
                {d.pruefpunkte.gesamt} <Begriff id="pruefpunkt">Prüfpunkte</Begriff>,{' '}
                {d.massstab.schweregrade.length} <Begriff id="schweregrad">Schweregrade</Begriff>
              </dd>
            </div>
            {sichtbar(b) ? (
              <div className="lp-spec-zeile">
                <dt>
                  <Begriff id="fehlalarmquote">Fehlalarmquote</Begriff>
                </dt>
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
                schwerwiegende Befunde darunter, etwa Antworten, die fachlich falsch sind
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
                <p>
                  Das ist ein gutes Zeichen und noch keine Abnahme. Das eigene Ziel sind{' '}
                  {zahl(b.zielGesehenJeRegel)} einzeln angesehene Fälle je Regel. {zielErreicht(b)}
                </p>
                {b.geltung ? <p>{b.geltung}</p> : null}
              </div>

              <div className="lp-text lp-luft-oben">
                <p>
                  Aus den protokollierten Läufen sind {zahl(fehlalarmquote.unbewertet!)} Befunde und
                  Hinweise weiter ohne Bewertung. Ein Beispiel, was eine Bewertung lehrt, steht im{' '}
                  <a href={pfad('/stand/#luecke')}>ausführlichen Stand</a>.
                </p>
              </div>

              {sichtbar(d.tests) ? (
                <>
                  <div className="lp-text lp-luft-oben">
                    <p>{d.tests.satz}</p>
                  </div>
                  <div className="lp-zellen">
                    {nurSichtbare(d.tests.punkte).map((t) => (
                      <div className="lp-zelle" key={t.titel}>
                        <span className="kopf">{t.titel}</span>
                        <p>{t.text}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
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

          <div className="lp-text">
            <p>
              Wie zwei frühe Regeln danebenlagen und was daraus wurde, steht im{' '}
              <a href={pfad('/stand/#luecke')}>ausführlichen Stand</a>.
            </p>
          </div>
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
              <table className="lp-gegen lp-stapel">
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
                      <td data-kopf="Auftrag">{z.auftrag}</td>
                      <td data-kopf="Wer ihn erledigt">{z.wer}</td>
                      <td data-kopf="Was du angibst" className="leise">{z.angaben}</td>
                      <td data-kopf="Ab wann">{abWann(z.ab)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="lp-klein lp-luft-oben">Was die Angaben zu einer Prüfung bedeuten</p>
            <dl className="lp-spec">
              {a.angaben.map((g) => (
                <div className="lp-spec-zeile" key={g.angabe}>
                  <dt>{g.angabe}</dt>
                  <dd>{g.erklaerung}</dd>
                </div>
              ))}
            </dl>

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
                <span className="kopf">Was du zurückbekommst</span>
                <p>{a.bericht}</p>
              </div>
              <div className="lp-zelle traegt">
                <span className="kopf">Wenn ein Befund falsch ist</span>
                <p>{a.fehlalarm}</p>
              </div>
            </div>
            <p className="lp-klein lp-luft-oben">Die vier Schweregrade</p>
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
                  {k.passtNicht ? 'nicht im Plan' : k.zustand}
                  {istIntern && k.freigabe === 'intern' ? ', nur intern' : ''}
                </span>
                <div>
                  <h3>{k.name ? `${k.rolle}, ${k.name}` : k.rolle}</h3>
                  <p>{k.tut}</p>
                  <p className="bedingung">Tut nie: {k.tutNie}</p>
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
              <span className="kopf">Warum ein Programm</span>
              <p className="stark">{d.auftrag.anweisungImDokument.satz}</p>
              <p>{m.grenzeWarum}</p>
            </div>
          </div>
          {sichtbar(d.aufnahme) ? (
            <>
              <h3 className="lp-aussage lp-luft-oben">Wie ein neuer dazukommt.</h3>
              <div className="lp-text lp-luft-oben-klein">
                <p>{d.aufnahme.satz}</p>
              </div>
              <div className="lp-zellen lp-luft-oben-klein">
                {d.aufnahme.schritte.map((s, i) => (
                  <div className="lp-zelle" key={s.titel}>
                    <span className="kopf">
                      {i + 1}. {s.titel}
                    </span>
                    <p>{s.text}</p>
                    {s.tor ? (
                      <p className="stark">
                        <Begriff id="tor">{s.tor}</Begriff>
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="lp-zellen">
                <div className="lp-zelle traegt">
                  <span className="kopf">
                    <Begriff id="assessment-center">{d.aufnahme.assessment.titel}</Begriff>
                  </span>
                  <p className="stark">{d.aufnahme.assessment.text}</p>
                </div>
              </div>
              <p className="lp-klein lp-luft-oben-klein">Quelle: {d.aufnahme.quelle}</p>
            </>
          ) : null}
          {sichtbar(d.training) ? (
            <>
              <h3 className="lp-aussage lp-luft-oben">Wie ein KI-Mitarbeiter besser wird.</h3>
              <div className="lp-text lp-luft-oben-klein">
                <p>{d.training.satz}</p>
                <p className="lp-klein">{d.training.hinweis}</p>
              </div>
              <p className="lp-klein lp-luft-oben">
                Der <Begriff id="pruefstand">Lernkreis</Begriff>, entschieden am{' '}
                {datum(d.training.kreisSeit).slice(0, 6)}
              </p>
              <div className="lp-zellen vier lp-luft-oben-klein">
                {d.training.kreis.map((s, i) => (
                  <div className="lp-zelle" key={s.titel}>
                    <span className="kopf">
                      {i + 1}. {s.titel}
                    </span>
                    <p>{s.text}</p>
                  </div>
                ))}
              </div>
              <div className="lp-zellen">
                <div className="lp-zelle traegt">
                  <span className="kopf">
                    Wann ein Fall gelernt ist, entschieden am {datum(d.training.gelernt.seit).slice(0, 6)}
                  </span>
                  <p className="stark">{d.training.gelernt.text}</p>
                  <p>{d.training.gelernt.warum}</p>
                </div>
              </div>

              <p className="lp-klein lp-luft-oben">Der feste Takt</p>
              <div className="lp-gegen-rahmen">
                <table className="lp-gegen lp-stapel">
                  <thead>
                    <tr>
                      <th>Wann</th>
                      <th>Was</th>
                      <th>Stand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.training.takt.map((t) => (
                      <tr key={t.wann}>
                        <td data-kopf="Wann">{t.wann}</td>
                        <td data-kopf="Was">{t.was}</td>
                        <td data-kopf="Stand" className="leise">{t.stand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="lp-klein lp-luft-oben">
                Woran <Begriff id="nachschaerfen">nachgeschärft</Begriff> wird, in dieser Reihenfolge
              </p>
              <ol className="lp-punkte">
                {d.training.ebenen.map((e, i) => (
                  <li key={e.titel}>
                    <span className="nr">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="punkt">{e.titel}</p>
                      <p className="grund">{e.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="lp-text lp-luft-oben-klein">
                <p>{d.training.ebenenSatz}</p>
              </div>

              <dl className="lp-spec">
                {d.training.wer.map((w) => (
                  <div className="lp-spec-zeile" key={w.wer}>
                    <dt>{w.wer}</dt>
                    <dd>{w.tut}</dd>
                  </div>
                ))}
              </dl>
              <div className="lp-text lp-luft-oben">
                <p>{d.training.regel}</p>
                <p>{d.training.pruefstaende}</p>
                <p>
                  Die Messlatte des <Begriff id="assessment-center">Assessment Centers</Begriff>, Stufe für
                  Stufe, und woher neue Fälle kommen, stehen im{' '}
                  <a href={pfad('/stand/#gedaechtnis')}>ausführlichen Stand</a>.
                </p>
              </div>
              <p className="lp-klein lp-luft-oben-klein">Quelle: {d.training.quelle}</p>
            </>
          ) : null}
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
          </div>

          {sichtbar(d.ablage) ? (
            <div id="ablage" className="lp-luft-oben">
            <h3 className="lp-aussage breit">So sieht die Ablage heute aus.</h3>
            <div className="lp-text lp-luft-oben-klein">
              <p>
                Aus den Notizen selbst gezählt: Jedes Kästchen ist eine Notiz, gefärbt nach ihrem
                Freigabestand.
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
                Jeder Bereich ist ein Kreis; gezeichnet sind nur die Wege, die oft genommen werden.
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
                    {zuletztAbgenommen?.abgenommen
                      ? `${zuletztAbgenommen.id} ist am ${kurz(zuletztAbgenommen.abgenommen.am)} abgenommen. `
                      : ''}
                    Nächste Abnahme, {naechsterMeilenstein.id}: {naechsterMeilenstein.titel}.{' '}
                    {arbeitenSatz(naechsterMeilenstein)}
                    {teamAb === naechsterMeilenstein.termin && teamHeute ? ` ${teamHeute.stand}` : ''}
                  </p>
                </div>
              ) : null}
              <div className="lp-kpi-kachel">
                <p className="lp-kpi-wert">
                  {laufen} von {rollen.length}
                </p>
                <p className="lp-kpi-label">
                  Rollen laufen, {inWorten(mitGrenze)} davon mit Grenze. Entschieden und noch nicht in
                  Betrieb: {rollen.length - laufen}.
                </p>
              </div>
              {sichtbar(plan) && teamAb && teamAb !== naechsterMeilenstein?.termin ? (
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
                <p>{inWorten(g.punkte.length)} Punkte</p>
              </div>
            ))}
          </div>
          <div className="lp-text lp-luft-oben">
            <p>{d.hemmnisse.satz}</p>
            <p>
              Die Punkte je Gruppe stehen bei den{' '}
              <a href={pfad('/stand/#offen')}>offenen Punkten</a> im ausführlichen Stand, dazu die{' '}
              <a href={pfad('/stand/#stufen')}>Stufen bis zum Dauerbetrieb</a>, alle{' '}
              <a href={pfad('/stand/#entscheidungen')}>Entscheidungen mit Datum</a>
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
              {plan.status}.
            </p>
            <h2 className="lp-aussage breit lp-luft-oben-klein">{plan.satz}</h2>
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
                  </span>
                  <div>
                    <h3>{ms.titel}</h3>
                    {ms.abgenommen ? (
                      <p>
                        <b>Abgenommen am {datum(ms.abgenommen.am)}</b>, {ms.abgenommen.text}.
                      </p>
                    ) : null}
                    <p>{arbeitenSatz(ms)}</p>
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
                Die Arbeiten je Meilenstein, der kritische Pfad, die Entscheidungen mit Frist, die
                Zeit des Projektverantwortlichen, was in diesen Wochen nicht passt, und die Risiken
                stehen im{' '}
                <a href={pfad('/stand/#plan')}>ausführlichen Stand</a>, dazu der Plan vom 17.09. als
                Verlauf.
              </p>
              <p className="lp-klein">Quelle: {plan.quelle}</p>
            </div>
          </Sektion>
        ) : null}

        {/* 12 Begriffe -------------------------------------------------------- */}
        {sichtbar(d.glossar) ? (
          <Sektion id="begriffe">
            <h2 className="lp-aussage breit">{d.glossar.satz}</h2>
            <dl className="lp-spec lp-luft-oben">
              {[...d.glossar.eintraege]
                .sort((x, y) => x.begriff.localeCompare(y.begriff, 'de'))
                .map((e) => (
                  <div className="lp-spec-zeile" key={e.id} id={`begriff-${e.id}`}>
                    <dt>{e.begriff}</dt>
                    <dd>{e.erklaerung}</dd>
                  </div>
                ))}
            </dl>
            <p className="lp-klein lp-luft-oben">
              Quellen: {[...new Set(d.glossar.eintraege.map((e) => e.quelle))].join('; ')}
            </p>
          </Sektion>
        ) : null}

      </main>

      <Fussleiste />
    </>
  )
}
