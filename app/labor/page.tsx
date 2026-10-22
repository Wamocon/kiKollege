import type { Metadata } from 'next'
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
import { Kopfleiste } from '@/components/landing/Kopfleiste'
import { Begriff } from '@/components/landing/Begriff'
import { LaborAnatomie } from '@/components/labor/LaborAnatomie'
import { LaborSektion } from '@/components/labor/LaborSektion'
import { arbeitenStand, belastbarBei, daten, datum, harteRegel, tageZwischen, zahl, zielErreicht, type AnleitungAb } from '@/lib/daten'
import { inWorten } from '@/lib/alter'
import { istIntern, nurSichtbare, sichtbar, zeigtInternes } from '@/lib/freigabe'
import { pfad } from '@/lib/pfad'
import './labor.css'

/* Labor, Entwurf zur Freigabe: dieselben Daten und Texte wie die Landing Page,
   in neuer Form nach dem Taste-Skill (design-taste-frontend), Stand 22.10.2026.
   Die Landing Page unter / bleibt bis zur Entscheidung unverändert. Wird die
   Form freigegeben, ersetzt diese Datei app/page.tsx, und labor.css geht in
   globals.css auf. */

export const metadata: Metadata = {
  title: 'Labor',
  robots: { index: false, follow: false },
}

export default function Labor() {
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
  const plan = d.meilensteinplanAktuell
  const fachlich = d.ablage.bereiche.filter((a) => a.id === 'normbasis' || a.id === 'massstab')
  const fachlichVerbindlich = fachlich.reduce((s, a) => s + a.verbindlich, 0)
  const verbindlich = d.ablage.bereiche.reduce((s, a) => s + a.verbindlich, 0)

  const naechsterMeilenstein = plan.meilensteine.find((ms) => !ms.abgenommen)
  const zuletztAbgenommen = [...plan.meilensteine].reverse().find((ms) => ms.abgenommen)
  const teamHeute = plan.heute.find((h) => h.wer === 'Team')

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

  // Was jeder im Team beauftragen kann, steht offen; was vorerst nur der
  // Projektverantwortliche gibt, klappt auf.
  const auftraege = nurSichtbare(a.zeilen)
  const fuerAlle = auftraege.filter((z) => !('nur' in z.ab))
  const vorerstNur = auftraege.filter((z) => 'nur' in z.ab)
  const hemmnisSumme = d.hemmnisse.gruppen.reduce((s, g) => s + g.punkte.length, 0)
  const schwereTon = ['var(--r700)', 'var(--r500)', 'var(--r300)', 'var(--r100)']

  const auftragTabelle = (zeilen: typeof auftraege) => (
    <div className="lp-gegen-rahmen">
      <table className="lp-gegen lp-stapel lab-tabelle">
        <thead>
          <tr>
            <th>Auftrag</th>
            <th>Wer ihn erledigt</th>
            <th>Was du angibst</th>
            <th>Ab wann</th>
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
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
  )

  return (
    <>
      <Kopfleiste />

      <main id="inhalt" className="lab">
        <div className="lab-hinweis" role="note">
          <div className="lab-hinweis-innen">
            <b>Labor, Entwurf zur Freigabe.</b> Gleicher Inhalt wie die{' '}
            <a href={pfad('/')}>Landing Page</a>, neue Form nach dem Taste-Skill. Längere Teile
            klappen auf.
          </div>
        </div>

        {/* 01 Was ein KI-Mitarbeiter ist ------------------------------------- */}
        <LaborSektion id="vorhaben" klasse="lab-hero">
          <h1 className="lab-display">
            <span>Ein KI-Mitarbeiter arbeitet zu.</span>
            <span>Ein Mensch entscheidet.</span>
          </h1>
          <div className="lab-hero-raster">
            <div>
              <p className="lab-hero-satz">
                Ein Sprachmodell mit fester Aufgabe, aufgeschriebenem Maßstab und einer Grenze.
                Gebaut bei der {gmbh.name} seit dem {datum(d.arbeitstage.beginn)}.
              </p>
              <div className="lab-knoepfe">
                <a className="lab-knopf" href="#auftrag">Auftrag geben</a>
                <a className="lab-knopf zweit" href="#stand">Stand ansehen</a>
              </div>
            </div>
            <LaborAnatomie kern={d.anatomie.kern} teile={d.anatomie.teile} />
          </div>

          <div className="lab-zweispalt lab-luft">
            <p className="lab-lead">
              Ein KI-Mitarbeiter ist ein <Begriff id="sprachmodell">Sprachmodell</Begriff>, also die
              Technik hinter Chat-Programmen, mit einer festen Aufgabe, einem aufgeschriebenen{' '}
              <Begriff id="massstab">Maßstab</Begriff> und einer <Begriff id="grenze">Grenze</Begriff>.
              Er prüft, sortiert und bereitet vor; was daraus folgt, entscheidet ein Mensch. Die{' '}
              {gmbh.name} baut solche Rollen seit dem {datum(d.arbeitstage.beginn)}. Fachwörter erklärt
              das Verzeichnis der <a href="#begriffe">Begriffe</a> am Ende.
            </p>
            <div>
              <p className="lab-satz">{d.anatomie.satz}</p>
              <dl className="lab-vier">
                {d.anatomie.teile.map((t) => (
                  <div key={t.id}>
                    <dt>{t.titel}</dt>
                    <dd>{t.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div id="chatbot" className="lab-luft">
            <h2 className="lab-aussage">{d.abgrenzung.satz}</h2>
            <div className="lab-gegen">
              <p className="lab-gegen-kopf" aria-hidden="true">
                <span />
                <span>Ein Chatbot</span>
                <span>Ein KI-Mitarbeiter</span>
              </p>
              {d.abgrenzung.zeilen
                .filter((z) => ['Auftrag', 'Maßstab', 'Grenze'].includes(z.merkmal))
                .map((z) => (
                  <p className="lab-gegen-zeile" key={z.merkmal}>
                    <span className="merkmal">{z.merkmal}</span>
                    <span className="chatbot">
                      <span className="nur-vorlesen">Ein Chatbot: </span>
                      {z.chatbot}
                    </span>
                    <span className="mitarbeiter">
                      <span className="nur-vorlesen">Ein KI-Mitarbeiter: </span>
                      {z.mitarbeiter}
                    </span>
                  </p>
                ))}
            </div>
          </div>

          <div id="eignung" className="lab-luft">
            <h2 className="lab-aussage">Wofür er taugt, und wofür nicht.</h2>
            <div className="lab-eignung">
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
            <p className="lab-text lab-luft-klein">
              Der letzte Punkt schließt nichts aus: Wo die Entscheidung schwer wiegt, arbeitet der
              KI-Mitarbeiter zu, und ein Mensch entscheidet. {harteRegel('rollengrenze').grund}
            </p>
          </div>
        </LaborSektion>

        {/* 02 Der erste: Fritz ------------------------------------------------ */}
        <LaborSektion id="erster">
          <h2 className="lab-aussage">Fritz, Reviewer für Schulungsunterlagen.</h2>
          <p className="lab-unterzeile">{d.ersterHinweis.kopf}</p>

          <div className="lab-zweispalt lab-luft-klein">
            <p className="lab-text">
              Er prüft die Unterlagen der WAMOCON Academy für die Ausbildung zu Kaufleuten für
              Büromanagement gegen die Checklisten des Hauses und die Ausbildungsordnung, und schreibt
              einen Bericht. {zahl(d.gegenstand.dateien)} Dateien liegen dort. Jede müsste vollständig
              und jedes Mal gleich geprüft werden. Die Aufgabe ist nicht schwer, sie ist zu viel.
            </p>
            <aside className="lab-notiz">
              <p>{d.ersterHinweis.text}</p>
            </aside>
          </div>

          <dl className="lab-fakten">
            <div>
              <dt>Grenze</dt>
              <dd>
                <b>bewertet</b>, erstellt keine Unterlagen, erteilt keine Freigabe
              </dd>
            </div>
            <div>
              <dt>Maßstab</dt>
              <dd>
                {d.massstab.kriterien.gesamt} <Begriff id="kriterium">Kriterien</Begriff>,{' '}
                {d.pruefpunkte.gesamt} <Begriff id="pruefpunkt">Prüfpunkte</Begriff>,{' '}
                {d.massstab.schweregrade.length} <Begriff id="schweregrad">Schweregrade</Begriff>
              </dd>
            </div>
            {sichtbar(b) ? (
              <div>
                <dt>
                  <Begriff id="fehlalarmquote">Fehlalarmquote</Begriff>
                </dt>
                <dd>
                  belastbar {belastbarBei(b)}, mehr dazu im <a href="#messung">nächsten Abschnitt</a>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="lab-zahlen">
            <div>
              <p className="wert">{zahl(rechenlauf?.geprueft ?? 0)}</p>
              <p className="was">Übungsfälle in einem Lauf geprüft, Dauer {rechenlauf?.laufzeit}</p>
            </div>
            {rechenlauf?.zusatz ? (
              <div>
                <p className="wert">{zahl(rechenlauf.zusatz.gleichungen)}</p>
                <p className="was">
                  Rechnungen darin nachgerechnet, {zahl(rechenlauf.zusatz.gleichungenFalsch)} davon falsch
                </p>
              </div>
            ) : null}
            <div>
              <p className="wert">{zahl(fachreview.fragen!)}</p>
              <p className="was">Quizfragen fachlich geprüft, über {zahl(fachreview.enabler!)} Enabler</p>
            </div>
            <div>
              <p className="wert signal">{zahl(fachreview.blocker!)}</p>
              <p className="was">schwerwiegende Befunde darunter, etwa Antworten, die fachlich falsch sind</p>
            </div>
          </div>

          <h3 className="lab-aussage klein lab-luft">Was dabei herauskommt, das anders nicht zu haben ist.</h3>
          <p className="lab-text lab-luft-klein">{d.ertrag.einleitung}</p>
          <div className="lab-bento">
            <div className="lab-bento-befund">
              <h4>So sieht ein Befund aus</h4>
              <p className="lp-stufe-marke">{d.beispielbefund.stufe}</p>
              <p className="stark">{d.beispielbefund.text}</p>
              <p className="fundstelle">{d.beispielbefund.fundstelle}</p>
              <p>{d.beispielbefund.nachsatz}</p>
            </div>
            {d.ertrag.punkte.map((p) => (
              <div className="lab-bento-punkt" key={p.titel}>
                <h4>{p.titel}</h4>
                <p className="stark">{p.text}</p>
                <p>{p.beleg}</p>
              </div>
            ))}
            <div className="lab-bento-raster">
              <h4>Der geprüfte Bestand</h4>
              <EnablerRaster />
            </div>
          </div>
        </LaborSektion>

        {/* 03 Verlässlich? ---------------------------------------------------- */}
        <LaborSektion id="messung">
          <h2 className="lab-aussage">Ein KI-Mitarbeiter, dem man nicht glauben kann, ist schlimmer als keiner.</h2>
          <p className="lab-text lab-luft-klein">
            Dann muss man seine Arbeit zusätzlich nachprüfen. Zwei Zahlen entscheiden, und beide muss
            man tatsächlich erheben.
          </p>

          <div className="lab-fragen">
            <div>
              <p className="lab-zustand">{wiederholung ? 'gemessen' : 'offen'}</p>
              <h3>Sagt er zweimal dasselbe?</h3>
              <p>
                Derselbe Vorgang, zweimal geprüft. Kommt etwas anderes heraus, ist das Ergebnis wertlos,
                egal wie gut es klingt.
              </p>
              {wiederholung?.datum && wiederholung.bestaetigt != null ? (
                <p className="stark">
                  Am {datum(wiederholung.datum)} erstmals gemessen: {zahl(wiederholung.bestaetigt)} von{' '}
                  {zahl(wiederholung.bestaetigt)} Befunden bestätigt, an derselben Stelle.
                  {wiederholung.neuGefunden ? ` ${zahl(wiederholung.neuGefunden)} kam hinzu.` : ''}
                </p>
              ) : (
                <p className="stark">Noch kein Wiederholungslauf protokolliert.</p>
              )}
            </div>
            <div className="offen">
              <p className="lab-zustand">offen</p>
              <h3>Wie oft meldet er etwas, das keins ist?</h3>
              <p>
                Die härtere Zahl. Sie lässt sich nur erheben, wenn Fachleute eine Stichprobe durchsehen
                und Stück für Stück sagen: berechtigt oder Fehlalarm.
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
              <div className="lp-hero-zahl lab-luft">
                <p className="wert">{zahl(b.bewertet)}</p>
                <p className="beschriftung">
                  Befunde hat ein Mensch bisher bewertet, über {zahl(b.regeln)} Regeln. {zahl(b.gesehen)}{' '}
                  davon hat er einzeln angesehen. Fehlalarme darunter: {zahl(b.fehlalarme)}.
                </p>
              </div>

              <div className="lab-text lab-luft-klein">
                <p>
                  Das ist ein gutes Zeichen und noch keine Abnahme. Das eigene Ziel sind{' '}
                  {zahl(b.zielGesehenJeRegel)} einzeln angesehene Fälle je Regel. {zielErreicht(b)}
                </p>
                {b.geltung ? <p>{b.geltung}</p> : null}
                <p>
                  Aus den protokollierten Läufen sind {zahl(fehlalarmquote.unbewertet!)} Befunde und
                  Hinweise weiter ohne Bewertung. Ein Beispiel, was eine Bewertung lehrt, steht im{' '}
                  <a href={pfad('/stand/#luecke')}>ausführlichen Stand</a>.
                </p>
              </div>

              {sichtbar(d.tests) ? (
                <details className="lab-mehr">
                  <summary>Prüfstand und Nutzentest: was seit dem 18.10. geübt und gemessen wird</summary>
                  <p className="lab-text">{d.tests.satz}</p>
                  <dl className="lab-reihen">
                    {nurSichtbare(d.tests.punkte).map((t) => (
                      <div key={t.titel}>
                        <dt>{t.titel}</dt>
                        <dd>{t.text}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ) : null}
            </>
          ) : (
            <div className="lp-hero-zahl lab-luft">
              <p className="wert">0</p>
              <p className="beschriftung">
                von {zahl(fehlalarmquote.unbewertet!)} Befunden und Hinweisen sind bisher von einem
                Menschen bewertet worden.
              </p>
            </div>
          )}

          <blockquote className={`lab-zitat lab-luft${d.massstab.kalibrierung.satz.length > 160 ? ' lang' : ''}`}>
            <p>{d.massstab.kalibrierung.satz}</p>
            <footer>Entschieden am {datum(d.massstab.kalibrierung.entschiedenAm)}</footer>
          </blockquote>
          <div className="lab-text lab-luft-klein">
            <p>
              Wer dreimal einen falschen Alarm bekommt, sieht beim vierten Mal nicht mehr hin. Dann
              nützt auch das nichts mehr, was richtig gefunden wurde. Deshalb gilt die Regel, im Zweifel
              zu schweigen. Und jede Regel braucht zwei Testfälle, einen bekannt richtigen und einen
              bekannt falschen, bevor sie eingesetzt wird.
            </p>
            <p>
              Wie zwei frühe Regeln danebenlagen und was daraus wurde, steht im{' '}
              <a href={pfad('/stand/#luecke')}>ausführlichen Stand</a>.
            </p>
          </div>
        </LaborSektion>

        {/* 04 So arbeitest du mit ihm ----------------------------------------- */}
        {sichtbar(a) ? (
          <LaborSektion id="auftrag" kapitel="Arbeiten">
            <h2 className="lab-aussage lang">{a.satz}</h2>
            <p className="lab-text lab-luft-klein">
              {a.wer}
              {sichtbar(plan) && teamAb ? (
                <>
                  {' '}
                  Fürs Team geht das ab dem {datum(teamAb)}
                  {teamHeute ? `; heute gilt: ${teamHeute.stand.replace(/\.$/, '')}` : ''}.
                </>
              ) : null}
            </p>

            <ol className="lab-ablauf">
              {a.schritte.map((s) => (
                <li key={s.titel}>
                  <h3>{s.titel}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
            {sichtbar(plan) && spracheAb ? (
              <p className="lab-text lab-luft-klein">
                Ab dem {datum(spracheAb)} geht ein Auftrag auch als Sprachnachricht.
              </p>
            ) : null}

            <h3 className="lab-aussage klein lab-luft">Was er annimmt.</h3>
            {auftragTabelle(fuerAlle)}
            {vorerstNur.length > 0 ? (
              <details className="lab-mehr">
                <summary>
                  {vorerstNur.length === 1 ? 'Ein weiterer Auftrag' : `${vorerstNur.length} weitere Aufträge`},
                  vorerst nur für den Projektverantwortlichen
                </summary>
                {auftragTabelle(vorerstNur)}
              </details>
            ) : null}

            <h4 className="lab-zwischen lab-luft">Was die Angaben zu einer Prüfung bedeuten</h4>
            <dl className="lab-raster-dl">
              {a.angaben.map((g) => (
                <div key={g.angabe}>
                  <dt>{g.angabe}</dt>
                  <dd>{g.erklaerung}</dd>
                </div>
              ))}
            </dl>

            <div className="lab-zweispalt lab-luft">
              <div>
                <h3 className="lab-aussage klein">Was er ablehnt, und dir sagt, warum.</h3>
                <ul className="lab-liste">
                  {a.ablehnung.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="lab-stapel">
                <div>
                  <h4>Was du zurückbekommst</h4>
                  <p>{a.bericht}</p>
                </div>
                <div className="traegt">
                  <h4>Wenn ein Befund falsch ist</h4>
                  <p>{a.fehlalarm}</p>
                </div>
              </div>
            </div>

            <h4 className="lab-zwischen lab-luft">Die vier Schweregrade</h4>
            <ol className="lab-skala">
              {d.massstab.schweregrade.map((s, i) => (
                <li key={s.stufe} style={{ ['--ton' as string]: schwereTon[i] ?? 'var(--r100)' }}>
                  <span className="lab-stufe-name">{s.stufe}</span>
                  <span className="bedeutung">{s.bedeutung}</span>
                </li>
              ))}
            </ol>

            <div className="lab-band lab-luft">
              <h3 className="lab-aussage klein">{a.mitmachenSatz}</h3>
              <dl className="lab-reihen">
                {a.mitmachen.map((t) => (
                  <div key={t.titel}>
                    <dt>{t.titel}</dt>
                    <dd>{t.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="lab-text">{d.uebertragbarkeit.auswahlregel}</p>
            </div>
            <p className="lab-quelle">Quelle: {a.quelle}</p>
          </LaborSektion>
        ) : null}

        {/* 05 Mannschaft ------------------------------------------------------ */}
        <LaborSektion id="mannschaft">
          <h2 className="lab-aussage lang">{m.satz}</h2>
          <p className="lab-text lab-luft-klein">
            {m.trennung} Jede Rolle bekommt eine Grenze, und die Grenze steht als Datei neben ihr.
          </p>
          <MannschaftFigur />

          <div className="lab-zweispalt lab-luft">
            <div>
              <h3 className="lab-titel">Warum nicht mehr auf einmal</h3>
              <p className="lab-gross">{m.engpass}</p>
            </div>
            <div>
              <h3 className="lab-titel">Warum ein Programm</h3>
              <p className="lab-gross">{d.auftrag.anweisungImDokument.satz}</p>
              <p className="lab-leise">{m.grenzeWarum}</p>
            </div>
          </div>

          <details className="lab-mehr">
            <summary>Alle Rollen: was sie tun, und was nie</summary>
            <div className="lab-rollen">
              {koepfe.map((k) => (
                <div key={k.id}>
                  <p className="lab-zustand">
                    {k.passtNicht ? 'nicht im Plan' : k.zustand}
                    {istIntern && k.freigabe === 'intern' ? ', nur intern' : ''}
                  </p>
                  <h3>{k.name ? `${k.rolle}, ${k.name}` : k.rolle}</h3>
                  <p>{k.tut}</p>
                  <p className="lab-leise">Tut nie: {k.tutNie}</p>
                </div>
              ))}
            </div>
            <p className="lab-text">
              Jede Rolle im Einzelnen, mit Aufgaben, Zielen und Werkzeugen, steht in den{' '}
              <a href={pfad('/mannschaft/')}>Steckbriefen</a>.
            </p>
          </details>
        </LaborSektion>

        {/* 06 Aufbau ---------------------------------------------------------- */}
        <LaborSektion id="aufbau" kapitel="Bauen">
          <h2 className="lab-aussage breit">Acht Fragen, die auch ein neuer Kollege beantwortet bekommt.</h2>
          <p className="lab-text lab-luft-klein">{d.schichtenErklaerung}</p>

          <Schichtenstapel />

          <div className="lab-text lab-luft-klein">
            <p>{d.schichtenDatei}</p>
            <p>
              Die beiden mit einem Balken markierten Schichten tragen den Rest. Ohne bewertete Ergebnisse
              gibt es keine Messung, und ohne Messung keinen Grund, dem Werkzeug zu glauben.
            </p>
          </div>

          <blockquote className={`lab-zitat lab-luft${d.beschreibungsdatei.grenze.length > 160 ? ' lang' : ''}`}>
            <p>{d.beschreibungsdatei.grenze}</p>
            <footer>Die Grenze</footer>
          </blockquote>

          <details className="lab-mehr">
            <summary>
              Ein Auszug aus der Akte: {d.beschreibungsdatei.name}, {d.beschreibungsdatei.stand}
            </summary>
            <div className="lp-quelltext">
              <p className="lp-quelltext-kopf">
                <b>{d.beschreibungsdatei.name}</b>
                <span>{d.beschreibungsdatei.stand}</span>
              </p>
              <pre>{d.beschreibungsdatei.auszug}</pre>
            </div>
          </details>
          <p className="lab-text lab-luft-klein">{d.beschreibungsdatei.einzigeQuelle}</p>
        </LaborSektion>

        {/* 07 Wissen und Ablage ----------------------------------------------- */}
        <LaborSektion id="wissen">
          <h2 className="lab-aussage breit">Zwei Wissensablagen, nicht eine.</h2>
          <p className="lab-text lab-luft-klein">{d.wissensablagen.satz}</p>

          <Wissensablagen />

          <p className="lab-text lab-luft-klein">{d.wissensablagen.gemeinsam.hinweis}</p>

          <div className="lab-eignung lab-ohne-rahmen">
            <div>
              <h3>Wissen</h3>
              <p className="lab-leise">Was gilt. Schreiben Menschen, ändert sich selten und nie von allein.</p>
              <ul>
                <li>Norm von außen: Gesetze, Verordnungen, wörtlich abgeschrieben</li>
                <li>Maßstab des Hauses: Checklisten, Vorlagen, Corporate Design</li>
                <li>Begriffe: was ein Wort hier bedeutet</li>
                <li>Entscheidungen: was einmal festgelegt wurde, mit Datum</li>
              </ul>
            </div>
            <div>
              <h3>Gedächtnis</h3>
              <p className="lab-leise">Was herauskam. Fällt beim Arbeiten an und wächst mit jedem Auftrag.</p>
              <ul>
                <li>Einzelergebnis: hunderte je Lauf, maschinell geschrieben</li>
                <li>Regel: wenige, langlebig. Zweck, Testfälle und die gemessene Fehlalarmquote</li>
                <li>Lauf: eine Notiz je Durchgang, mit Kennzahlen für den Vergleich über die Zeit</li>
              </ul>
            </div>
          </div>

          <p className="lab-text lab-luft-klein">
            Er liest nicht alles. Zu jedem Auftrag gehört die Angabe, welcher Teil des Wissens dafür der
            Maßstab ist. Deshalb trägt jede Notiz ein Datum: Wissen ohne Stand lässt sich nicht
            einordnen, und falsch eingeordnete Vorschriften erzeugen Fehlalarme.
          </p>

          {sichtbar(d.ablage) ? (
            <div id="ablage" className="lab-luft">
              <h3 className="lab-aussage klein">So sieht die Ablage heute aus.</h3>
              <p className="lab-text lab-luft-klein">
                Aus den Notizen selbst gezählt: Jedes Kästchen ist eine Notiz, gefärbt nach ihrem
                Freigabestand.
              </p>

              <AblageFigur />

              {fachlichVerbindlich === 0 ? (
                <p className="lab-text lab-luft-klein">
                  Verbindlich ist bisher nur, was Konventionen und Entscheidungen festhält. Die Normbasis
                  und der Prüfmaßstab, gegen die der Reviewer prüft, hat noch niemand freigegeben. Er
                  muss deshalb in jedem Ergebnis sagen, dass er sich auf Ungeprüftes stützt.
                </p>
              ) : null}

              <details className="lab-mehr">
                <summary>Welcher Bereich auf welchen verweist.</summary>
                <p className="lab-text">
                  Jeder Bereich ist ein Kreis; gezeichnet sind nur die Wege, die oft genommen werden.
                </p>
                <AblageGraphFigur />
              </details>
              <p className="lab-text lab-luft-klein">
                Die Zahlen als Tabelle, alle Verbindungen und die Rubriken des Unternehmenswissens stehen
                im <a href={pfad('/stand/#gedaechtnis')}>ausführlichen Stand</a>.
              </p>
            </div>
          ) : null}
        </LaborSektion>

        {/* 08 Arbeitsweise ---------------------------------------------------- */}
        <LaborSektion id="durchlauf">
          <h2 className="lab-aussage breit">Zwei Stufen, weil sie Verschiedenes finden.</h2>

          <Durchlauf />

          <div className="lab-text lab-luft-klein">
            <p>{d.durchlauf.zweiStufen}</p>
            <p>{d.durchlauf.verdichtung}</p>
          </div>

          <Pruefpunkte />

          <details className="lab-mehr">
            <summary>Wie er gesteuert wird, und was er selbst steuert.</summary>
            <Steuerung />
            <dl className="lab-reihen">
              <div>
                <dt>Beauftragt werden</dt>
                <dd>{d.steuerung.warumSkript}</dd>
              </div>
              <div>
                <dt>Selbst abgeben</dt>
                <dd>{d.steuerung.helfer}</dd>
              </div>
              <div>
                <dt>An einen zweiten übergeben</dt>
                <dd>{d.steuerung.uebergabe}</dd>
              </div>
            </dl>
          </details>
        </LaborSektion>

        {/* 09 Landschaft ------------------------------------------------------ */}
        {sichtbar(l) ? (
          <LaborSektion id="landschaft">
            <h2 className="lab-aussage breit">{l.satz}</h2>
            <p className="lab-text lab-luft-klein">{l.erklaerung}</p>

            <LandschaftFigur />

            <details className="lab-mehr">
              <summary>Alle Bausteine nach ihrem Zustand</summary>
              <div className="lab-spalten">
              {zustaende.map((z) => {
                const bausteine = nurSichtbare(l.bausteine).filter((bs) => bs.zustand === z.zustand)
                return (
                  <div className={z.zustand === 'geplant' ? 'traegt' : undefined} key={z.zustand}>
                    <h3 className="lab-titel">
                      {z.kopf} <span className="anzahl">{bausteine.length}</span>
                    </h3>
                    <ul>
                      {bausteine.map((bs) => (
                        <li key={bs.id}>
                          {bs.name}, {ortName.get(bs.ort)}
                          {istIntern && bs.freigabe === 'intern' ? ' (nur intern)' : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
              </div>
            </details>

            <div className="lab-text lab-luft-klein">
              <p>{l.rechnerStand}</p>
              <p>{l.vergleich}</p>
            </div>
          </LaborSektion>
        ) : null}

        {/* 10 Stand ----------------------------------------------------------- */}
        <LaborSektion id="stand" kapitel="Stand">
          <h2 className="lab-aussage">Auf einen Blick.</h2>
          <p className="lab-unterzeile">Stand {datum(d.stand)}</p>
          <div className="lab-tafel">
            {sichtbar(plan) && naechsterMeilenstein ? (
              <div className="lab-tafel-haupt">
                <p className="wert">{kurz(naechsterMeilenstein.termin)}</p>
                <p>
                  {zuletztAbgenommen?.abgenommen
                    ? `${zuletztAbgenommen.id} ist am ${kurz(zuletztAbgenommen.abgenommen.am)} abgenommen. `
                    : ''}
                  Nächste Abnahme, {naechsterMeilenstein.id}: {naechsterMeilenstein.titel}.{' '}
                  {arbeitenSatz(naechsterMeilenstein)}
                  {teamAb === naechsterMeilenstein.termin && teamHeute ? ` ${teamHeute.stand}` : ''}
                </p>
              </div>
            ) : null}
            <dl className="lab-tafel-rest">
              <div>
                <dt>
                  {laufen} von {rollen.length}
                </dt>
                <dd>
                  Rollen laufen, {inWorten(mitGrenze)} davon mit Grenze. Entschieden und noch nicht in
                  Betrieb: {rollen.length - laufen}.
                </dd>
              </div>
              {sichtbar(plan) && teamAb && teamAb !== naechsterMeilenstein?.termin ? (
                <div>
                  <dt>{kurz(teamAb)}</dt>
                  <dd>
                    Ab dann gibt das Team Aufträge, so wie unter <a href="#auftrag">Beauftragen</a>{' '}
                    beschrieben.{teamHeute ? ` ${teamHeute.stand}` : ''}
                  </dd>
                </div>
              ) : null}
              {sichtbar(b) ? (
                <div>
                  <dt>{zahl(b.bewertet)}</dt>
                  <dd>
                    Befunde von einem Menschen bewertet, Fehlalarme darunter: {zahl(b.fehlalarme)}.
                    Belastbar ist die Quote {belastbarBei(b)}.
                  </dd>
                </div>
              ) : null}
              {sichtbar(d.ablage) ? (
                <div>
                  <dt>
                    {zahl(verbindlich)} von {zahl(d.ablage.notizen)}
                  </dt>
                  <dd>
                    Notizen der Ablage sind verbindlich.{' '}
                    {fachlichVerbindlich === 0
                      ? 'Normbasis und Prüfmaßstab hat noch niemand freigegeben.'
                      : `Aus Normbasis und Prüfmaßstab: ${zahl(fachlichVerbindlich)}.`}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <h3 className="lab-aussage klein lab-luft">Die letzten Tage, mit Datum.</h3>
          <ol className="lab-zeitleiste">
            {nurSichtbare(d.arbeitstage.eintraege).slice(-5).map((e) => (
              <li key={e.datum + e.text}>
                <time dateTime={e.datum}>{datum(e.datum)}</time>
                <p>
                  {e.text}
                  {istIntern && e.freigabe === 'intern' ? ' (nur intern)' : ''}
                </p>
              </li>
            ))}
          </ol>
          <p className="lab-text lab-luft-klein">
            Alle {zahl(nurSichtbare(d.arbeitstage.eintraege).length)} Einträge der{' '}
            {tageZwischen(d.arbeitstage.beginn, d.stand)} Tage seit dem {datum(d.arbeitstage.beginn)} stehen
            in der <a href={pfad('/stand/#chronik')}>Chronik</a>.
          </p>

          <h3 className="lab-aussage klein lab-luft">Von vier Gruppen ist genau eine technisch.</h3>
          <div className="lab-anteile" aria-hidden="true">
            {d.hemmnisse.gruppen.map((g) => (
              <span
                key={g.titel}
                className={g.titel.startsWith('Technisch') ? 'technisch' : undefined}
                style={{ flexGrow: g.punkte.length }}
              />
            ))}
          </div>
          <dl
            className="lab-anteile-legende"
            style={{ ['--spalten' as string]: d.hemmnisse.gruppen.map((g) => `minmax(0, ${g.punkte.length}fr)`).join(' ') }}
          >
            {d.hemmnisse.gruppen.map((g) => (
              <div key={g.titel} className={g.titel.startsWith('Technisch') ? 'technisch' : undefined}>
                <dt>
                  {g.titel}
                  <span className="anzahl">
                    {inWorten(g.punkte.length)} von {inWorten(hemmnisSumme)} Punkten
                  </span>
                </dt>
                <dd>{g.zusatz}</dd>
              </div>
            ))}
          </dl>
          <div className="lab-text lab-luft-klein">
            <p>{d.hemmnisse.satz}</p>
            <p>
              Die Punkte je Gruppe stehen bei den <a href={pfad('/stand/#offen')}>offenen Punkten</a> im
              ausführlichen Stand, dazu die <a href={pfad('/stand/#stufen')}>Stufen bis zum Dauerbetrieb</a>,
              alle <a href={pfad('/stand/#entscheidungen')}>Entscheidungen mit Datum</a>
              {zeigtInternes ? (
                <>
                  , dazu der <a href={pfad('/stand/#plattform')}>Betrieb im Haus</a> und die{' '}
                  <a href={pfad('/stand/#beobachtungen')}>Beobachtungen aus dem Abgleich</a>
                </>
              ) : null}
              .
            </p>
          </div>
        </LaborSektion>

        {/* 11 Meilensteine ---------------------------------------------------- */}
        {sichtbar(plan) ? (
          <LaborSektion id="plan">
            {istIntern ? <p className="lp-intern">nur intern</p> : null}
            <h2 className="lab-aussage lang">{plan.satz}</h2>
            <p className="lab-unterzeile">{plan.status}.</p>
            <div className="lab-text lab-luft-klein">
              <p>
                <b>„{plan.ziel}“</b> {plan.zielVon}.
              </p>
              <p>{plan.lauffaehig}</p>
            </div>

            <TermineFigur />

            <ol className="lab-meilensteine">
              {plan.meilensteine.map((ms) => (
                <li key={ms.id} className={ms.abgenommen ? 'abgenommen' : undefined}>
                  <p className="wann">
                    {ms.id}, {datum(ms.termin).slice(0, 6)}
                  </p>
                  <h3>{ms.titel}</h3>
                  {ms.abgenommen ? (
                    <p>
                      <b>Abgenommen am {datum(ms.abgenommen.am)}</b>, {ms.abgenommen.text}.
                    </p>
                  ) : null}
                  <p>{arbeitenSatz(ms)}</p>
                  <p className="lab-leise">Abnahme: {ms.abnahme}</p>
                </li>
              ))}
            </ol>

            <details className="lab-mehr">
              <summary>Wo es heute steht, Rolle für Rolle.</summary>
              <dl className="lab-raster-dl">
                {plan.heute.map((h) => (
                  <div key={h.wer}>
                    <dt>{h.wer}</dt>
                    <dd>{h.stand}</dd>
                  </div>
                ))}
              </dl>
            </details>

            <p className="lab-text lab-luft-klein">
              Die Arbeiten je Meilenstein, der kritische Pfad, die Entscheidungen mit Frist, die Zeit des
              Projektverantwortlichen, was in diesen Wochen nicht passt, und die Risiken stehen im{' '}
              <a href={pfad('/stand/#plan')}>ausführlichen Stand</a>, dazu der Plan vom 17.09. als Verlauf.
            </p>
            <p className="lab-quelle">Quelle: {plan.quelle}</p>
          </LaborSektion>
        ) : null}

        {/* 12 Begriffe -------------------------------------------------------- */}
        {sichtbar(d.glossar) ? (
          <LaborSektion id="begriffe">
            <h2 className="lab-aussage breit">{d.glossar.satz}</h2>
            <dl className="lab-begriffe">
              {[...d.glossar.eintraege]
                .sort((x, y) => x.begriff.localeCompare(y.begriff, 'de'))
                .map((e) => (
                  <div key={e.id} id={`begriff-${e.id}`}>
                    <dt>{e.begriff}</dt>
                    <dd>{e.erklaerung}</dd>
                  </div>
                ))}
            </dl>
            <p className="lab-quelle">
              Quellen: {[...new Set(d.glossar.eintraege.map((e) => e.quelle))].join('; ')}
            </p>
          </LaborSektion>
        ) : null}
      </main>

      <Fussleiste />
    </>
  )
}
