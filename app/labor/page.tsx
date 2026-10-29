import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import '@fontsource-variable/inter'
import './labor.css'

import { Fussleiste } from '@/components/landing/Fussleiste'
import { LandingAbschnitte } from '@/components/landing/LandingAbschnitte'
import { StandAbschnitte } from '@/components/stand/StandAbschnitte'
import { Bewegung } from '@/components/labor/Bewegung'
import { abschnitt } from '@/lib/abschnitte'
import { belastbarBei, daten, datum, terminText } from '@/lib/daten'
import { nurSichtbare, sichtbar } from '@/lib/freigabe'
import { pfad } from '@/lib/pfad'

/** Labor vom 29.10.2026: kiKollege als Produktseite. Eine Präsentationsebene
 *  in sieben Szenen, darunter je Szene die Einzelheiten zum Aufklappen. Die
 *  Einzelheiten sind die Abschnitte der heutigen Landing Page und von /stand/,
 *  unverändert, damit nichts verloren geht. Die heutige Seite bleibt, bis der
 *  Projektverantwortliche das Labor freigibt. */

export const metadata: Metadata = {
  title: 'Labor: kiKollege',
  description: 'Entwurf der neuen Produktseite zu kiKollege, den KI-Mitarbeitern bei WAMOCON.',
  robots: { index: false, follow: false },
}

const d = daten
const p = d.produktseite
const plan = d.meilensteinplanAktuell
const kurz = (iso: string) => datum(iso).slice(0, 6)
const szene = (id: string) => p.szenen.find((s) => s.id === id)!

/** Welche Abschnitte der heutigen Seiten unter welcher Szene aufklappen */
const EINZELHEITEN: Record<string, { landing: string[]; stand: string[] }> = {
  start: { landing: ['vorhaben'], stand: ['vorhaben'] },
  funktionen: { landing: ['erster', 'mannschaft'], stand: [] },
  anwenden: { landing: ['auftrag'], stand: [] },
  verlass: { landing: ['messung'], stand: ['fritz', 'massstab', 'gegenstand', 'gemessen', 'luecke'] },
  bauweise: {
    landing: ['aufbau', 'wissen', 'durchlauf', 'landschaft', 'technik'],
    stand: ['schichten', 'gedaechtnis', 'plattform', 'uebertragbarkeit'],
  },
  fortschritt: { landing: ['stand', 'plan'], stand: ['stufen', 'fahrplan', 'plan'] },
  glossar: { landing: ['begriffe'], stand: ['begriffe'] },
}
/** Was in den Einzelheiten doppelt stünde, weil Landing Page und /stand/ dasselbe
 *  Thema je auf ihre Art zeigten. Es bleibt die Fassung, die dort steht, wo das
 *  Thema hingehört; pruefe:labor sichert, dass dabei nichts ganz wegfällt. */
const DOPPELT = [
  // Meilensteine: Stand, Ziel, Termine, Risikoplan und Quelle stehen im Plan von /stand/
  'plan-status', 'plan-ziel', 'plan-termine', 'plan-risikoplan', 'plan-quelle', 'plan-abnahme',
  // Prüfpunkte beim Maßstab, nicht bei der Arbeitsweise
  'durchlauf-pruefpunkte',
  // Warum ein Programm die Grenze hält, steht als Hinweis bei Fritz
  'mannschaft-grenze',
  // Diese Grafiken und Absätze zeigt schon der Abschnitt der Landing Page
  'schichten-stapel', 'gedaechtnis-wissensablagen', 'gedaechtnis-training-satz', 'gedaechtnis-ablagefigur',
  'gedaechtnis-ablagegraph', 'fritz-durchlauf', 'fritz-steuerung', 'gegenstand-enabler', 'luecke-geltung',
  'uebertragbarkeit-auswahlregel', 'uebertragbarkeit-organigramm', 'plattform-landschaft',
]

const ARCHIV = [
  { id: 'chronik', label: 'Chronik' },
  { id: 'entscheidungen', label: 'Entscheidungen mit Datum' },
  { id: 'offen', label: 'Offene Punkte' },
  { id: 'beobachtungen', label: 'Beobachtungen aus dem Abgleich' },
  { id: 'quellen', label: 'Wo die Quellen liegen' },
]

function Einzelheiten({ id, titel }: { id: string; titel: string }) {
  const e = EINZELHEITEN[id]
  return (
    <details className="lb-einzelheiten" id={`einzelheiten-${id}`}>
      <summary data-lb-magnet>
        <span className="lb-einzelheiten-wort">Einzelheiten</span>
        <span className="lb-einzelheiten-was">{titel}</span>
        <span className="lb-einzelheiten-zeichen" aria-hidden="true" />
      </summary>
      <div className="lb-einzelheiten-inhalt">
        {e.landing.length ? <LandingAbschnitte nur={e.landing} rahmen={false} ohne={DOPPELT} /> : null}
        {e.stand.length ? <StandAbschnitte nur={e.stand} rahmen={false} ohne={DOPPELT} /> : null}
      </div>
    </details>
  )
}

function SzenenKopf({ id, nr }: { id: string; nr: string }) {
  const s = szene(id)
  return (
    <header className="lb-szenenkopf">
      <p className="lb-marke" data-lb-reveal>
        <span>{nr}</span> {s.label}
      </p>
      <h2 className="lb-titel" data-lb-split>
        {s.titel}
      </h2>
      <p className="lb-lead" data-lb-reveal>
        {s.text}
      </p>
    </header>
  )
}

function Szene({ id, nr, buehne, children }: { id: string; nr: string; buehne?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={buehne ? 'lb-szene lb-buehne' : 'lb-szene'}>
      <div className="lb-rahmen">
        <SzenenKopf id={id} nr={nr} />
        {children}
        <Einzelheiten id={id} titel={szene(id).label} />
      </div>
    </section>
  )
}

/** Wie weit eine Funktion ist. Der Orchestrator lernt im Prüfstand, bis das
 *  Team dazukommt; beschrieben, aber nicht gebaut, heißt geplant. */
function abzeichen(k: (typeof d.mannschaft.koepfe)[number]): { text: string; art: 'bereit' | 'training' | 'geplant' } {
  if (k.zustand !== 'arbeitet') return { text: 'geplant', art: 'geplant' }
  if (k.id === 'orchestrator') return { text: 'im Training', art: 'training' }
  return { text: 'verfügbar', art: 'bereit' }
}

/** Wer einer Funktion heute Aufträge geben kann, aus der Tabelle der Anleitung.
 *  Verfügbar heißt nicht, dass jeder schon beauftragen darf; das steht hier. */
function auftraege(k: (typeof d.mannschaft.koepfe)[number]): string | null {
  if (k.id === 'orchestrator') return 'nimmt alle Aufträge an und gibt sie weiter'
  const z = d.anleitung.zeilen.find((z) => (k.name && z.wer.startsWith(k.name)) || z.wer.includes(k.kurz))
  if (!z) return null
  if ('nur' in z.ab) return z.ab.nur
  if ('nachPlan' in z.ab) return 'nach dem Ende des Plans'
  const m = plan.meilensteine.find((ms) => ms.id === (z.ab as { meilenstein: string }).meilenstein)
  if (!m || !sichtbar(plan)) return 'später'
  return m.terminOffen ? `mit Meilenstein ${m.id.slice(1)}, Termin offen` : `für alle ab Meilenstein ${m.id.slice(1)}, ${terminText(m, false)}`
}

export default function Labor() {
  const koepfe = nurSichtbare(d.mannschaft.koepfe).filter((k) => !k.passtNicht)
  const laeufe = sichtbar(d.training) ? d.training.laeufe : undefined
  const letzterLauf = laeufe?.zeilen[laeufe.zeilen.length - 1]
  const faelle = laeufe?.bereiche.reduce((s, b) => s + b.faelle, 0) ?? 0
  const planSichtbar = sichtbar(plan)
  const naechster = plan.meilensteine.find((m) => !m.abgenommen)
  const risiko = plan.risiken.find((r) => !r.aufgegangenIn)
  // Ab wann das Team beauftragt, und bis wann der Orchestrator gelernt haben soll
  const teamMs = plan.meilensteine.find((m) => m.id === d.anleitung.teamAb)
  const zielFrist = plan.fristen.find((f) => f.kritisch && f.text.startsWith('Der Orchestrator beherrscht'))?.frist
  const teamHeute = plan.heute.find((h) => h.wer === 'Team')
  const fritzPruefen = d.anleitung.zeilen[0]
  const b = d.bewertungen
  const begriffe = p.kernbegriffe
    .map((id) => d.glossar.eintraege.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => e != null)
  const nav = [{ id: 'start', label: 'Was es ist' }, ...p.szenen.map((s) => ({ id: s.id, label: s.label }))]

  return (
    <div className="lb">
      <div className="lb-vorhang" aria-hidden="true">
        <div className="lb-vorhang-tuer oben" />
        <div className="lb-vorhang-tuer unten" />
        <p className="lb-vorhang-wort">{p.name}</p>
      </div>
      <div className="lb-zeiger" aria-hidden="true">
        <span className="lb-zeiger-ring" />
        <span className="lb-zeiger-punkt" />
      </div>
      <div className="lb-korn" aria-hidden="true" />

      <header className="lb-kopf">
        <a className="lb-kopf-marke" href="#start">
          <b>{p.name}</b>
          <span>WAMOCON · Labor</span>
        </a>
        <button className="lb-kopf-knopf" type="button" aria-expanded="false" aria-controls="lb-menue">
          Menü
        </button>
        <nav id="lb-menue" className="lb-kopf-nav" aria-label="Szenen">
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`}>
              {n.label}
            </a>
          ))}
          <a href="#archiv" className="lb-kopf-archiv">
            Archiv
          </a>
        </nav>
      </header>

      <main id="inhalt">
        {/* Einstieg ----------------------------------------------------------- */}
        <section id="start" className="lb-szene lb-buehne lb-start">
          <div className="lb-glut eins" data-lb-tiefe="0.35" aria-hidden="true" />
          <div className="lb-glut zwei" data-lb-tiefe="-0.25" aria-hidden="true" />
          <div className="lb-rahmen">
            <p className="lb-marke" data-lb-reveal>
              <span>01</span> {p.dach}
            </p>
            <h1 className="lb-wortmarke" data-lb-split>
              {p.name}
            </h1>
            <div className="lb-start-raster">
            <div>
            <p className="lb-kernsatz" data-lb-split>
              <span>Ein KI-Mitarbeiter arbeitet zu.</span> <span>Ein Mensch entscheidet.</span>
            </p>
            <p className="lb-lead lb-start-lead" data-lb-reveal>
              {p.lead}
            </p>
            {planSichtbar && teamMs && !teamMs.terminOffen ? (
              <p className="lb-heute" data-lb-reveal>
                Beauftragen kannst du ab Meilenstein {teamMs.id.slice(1)}, {terminText(teamMs, false)}. Bis dahin lernt
                der Orchestrator.
              </p>
            ) : null}
            <div className="lb-knoepfe" data-lb-reveal>
              <a className="lb-knopf voll" href="#anwenden" data-lb-magnet>
                So gibst du einen Auftrag
              </a>
              <a className="lb-knopf" href="#fortschritt" data-lb-magnet>
                Wo es steht
              </a>
            </div>
            </div>

            <dl className="lb-standleiste" data-lb-staffel>
              {planSichtbar && naechster ? (
                <div className="lb-standzelle">
                  <dt>Nächster Meilenstein</dt>
                  <dd>
                    <span className="lb-gross">{naechster.id}</span>
                    <span className="lb-klein">
                      Meilenstein {naechster.id.slice(1)}, {terminText(naechster, false)}: {naechster.titel}
                    </span>
                  </dd>
                </div>
              ) : null}
              {letzterLauf ? (
                <div className="lb-standzelle">
                  <dt>Prüfstand des Orchestrators</dt>
                  <dd>
                    <span className="lb-gross">
                      <span data-lb-zahl={letzterLauf.gelernt}>{letzterLauf.gelernt}</span>
                      <span className="lb-von"> von {faelle}</span>
                    </span>
                    <span className="lb-klein">
                      Prüffällen gelernt, die er sicher beherrschen muss, bevor das Team dazukommt
                      {planSichtbar && zielFrist ? `; Ziel bis ${kurz(zielFrist)}` : ''}
                    </span>
                  </dd>
                </div>
              ) : null}
              {planSichtbar && risiko ? (
                <div className="lb-standzelle">
                  <dt>Größtes Risiko</dt>
                  <dd>
                    <span className="lb-mittel">{risiko.titel}</span>
                    <span className="lb-klein">
                      {risiko.nr} im Risikoregister, Stufe {risiko.stufe}
                      {risiko.eingetreten ? ', schon eingetreten' : ''}
                    </span>
                  </dd>
                </div>
              ) : null}
              <div className="lb-standzelle">
                <dt>Stand der Daten</dt>
                <dd>
                  <span className="lb-gross">{kurz(d.stand)}</span>
                  <span className="lb-klein">zuletzt nachgezogen, am {datum(d.stand)}</span>
                </dd>
              </div>
            </dl>
            </div>
            <Einzelheiten id="start" titel="Was ein KI-Mitarbeiter ist" />
          </div>
        </section>

        {/* Funktionen --------------------------------------------------------- */}
        <section id="funktionen" className="lb-szene lb-galerie">
          <div className="lb-rahmen">
            <SzenenKopf id="funktionen" nr="02" />
            {planSichtbar && teamHeute ? (
              <p className="lb-heute lb-heute-hell" data-lb-reveal>
                {teamHeute.stand}
              </p>
            ) : null}
          </div>
          <div className="lb-galerie-fenster">
            <ol className="lb-galerie-spur">
              {koepfe.map((k) => {
                const a = abzeichen(k)
                const wer = auftraege(k)
                return (
                  <li className="lb-karte" key={k.id}>
                    <p className={`lb-abzeichen ${a.art}`}>{a.text}</p>
                    <h3>
                      {k.kurz}
                      <span>{k.name ?? 'noch ohne Namen'}</span>
                    </h3>
                    {wer ? (
                      <p className="lb-karte-auftrag">
                        <b>Aufträge:</b> {wer}
                      </p>
                    ) : null}
                    <p>{k.tut}</p>
                    <p className="lb-karte-nie">
                      <b>Nie:</b> {k.tutNie}
                    </p>
                    {k.marke ? <p className="lb-karte-marke">{k.marke}</p> : null}
                  </li>
                )
              })}
            </ol>
          </div>
          <div className="lb-rahmen">
            <p className="lb-hinweis" data-lb-reveal>
              Aufträge gibst du über den Orchestrator.
              {planSichtbar && naechster ? ` Das Team kommt mit ${naechster.id} dazu, ${terminText(naechster, false)}.` : ''}
            </p>
            <Einzelheiten id="funktionen" titel="Fritz und die ganze Mannschaft" />
          </div>
        </section>

        {/* Anwenden ----------------------------------------------------------- */}
        {sichtbar(d.anleitung) ? (
          <Szene id="anwenden" nr="03">
            <div className="lb-anwenden">
              <ol className="lb-schritte">
                {d.anleitung.schritte.map((s, i) => (
                  <li className="lb-schritt" key={s.titel} data-lb-schritt={i}>
                    <span className="lb-schritt-nr">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{s.titel}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
              <figure className="lb-chat" data-lb-reveal>
                <div className="lb-chat-kopf">
                  <b>Hermes</b>
                  <span>Orchestrator</span>
                </div>
                <ul className="lb-chat-verlauf">
                  {p.beispielAuftrag.nachrichten.map((n, i) => (
                    <li key={i} className={n.von === 'du' ? 'lb-nachricht du' : 'lb-nachricht'} data-lb-zu={n.schritt}>
                      <span className="lb-nachricht-von">{n.von}</span>
                      {n.text}
                    </li>
                  ))}
                </ul>
                <figcaption>{p.beispielAuftrag.quelle}</figcaption>
              </figure>
            </div>
            <div className="lb-drei" data-lb-staffel>
              <div>
                <h3>Was du angeben musst</h3>
                <p>
                  Wenn Fritz prüfen soll: {fritzPruefen.angaben}. Fehlt eine Angabe, fragt der Orchestrator nach.
                </p>
              </div>
              <div>
                <h3>Was zurückkommt</h3>
                <p>{d.anleitung.bericht}</p>
              </div>
              <div>
                <h3>Wenn ein Befund falsch ist</h3>
                <p>{d.anleitung.fehlalarm}</p>
              </div>
            </div>
            <p className="lb-hinweis" data-lb-reveal>
              {d.anleitung.wer}
            </p>
          </Szene>
        ) : null}

        {/* Verlässlich -------------------------------------------------------- */}
        <Szene id="verlass" nr="04">
          <dl className="lb-zahlen" data-lb-staffel>
            <div>
              <dt>Punkte auf der Checkliste, nach denen Fritz jede Unterlage prüft</dt>
              <dd data-lb-zahl={d.pruefpunkte.gesamt}>{d.pruefpunkte.gesamt}</dd>
            </div>
            <div>
              <dt>Kriterien einer guten Unterlage, aufgeschrieben im Maßstab</dt>
              <dd data-lb-zahl={d.massstab.kriterien.gesamt}>{d.massstab.kriterien.gesamt}</dd>
            </div>
            <div>
              <dt>Schweregrade, in die jeder Befund eingestuft ist</dt>
              <dd data-lb-zahl={d.massstab.schweregrade.length}>{d.massstab.schweregrade.length}</dd>
            </div>
            {letzterLauf ? (
              <div>
                <dt>Prüffälle, die der Orchestrator sicher beherrschen muss</dt>
                <dd data-lb-zahl={faelle}>{faelle}</dd>
              </div>
            ) : null}
          </dl>
          <div className="lb-paar">
            <div className="lb-grade" data-lb-reveal>
              <h3>Die {d.massstab.schweregrade.length} Schweregrade</h3>
              <dl>
                {d.massstab.schweregrade.map((s) => (
                  <div key={s.stufe}>
                    <dt>{s.stufe}</dt>
                    <dd>{s.bedeutung}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {sichtbar(d.beispielbefund) ? (
              <figure className="lb-befund" data-lb-reveal>
                <h3>So sieht ein Befund aus</h3>
                <p className="lb-befund-stufe">{d.beispielbefund.stufe}</p>
                <p className="lb-befund-text">{d.beispielbefund.text}</p>
                <p className="lb-befund-ort">{d.beispielbefund.fundstelle}</p>
                <figcaption>Beispiel aus einem echten Prüflauf von Fritz. {d.beispielbefund.nachsatz}</figcaption>
              </figure>
            ) : null}
          </div>
          {sichtbar(b) ? (
            <p className="lb-hinweis" data-lb-reveal>
              Wie oft ein Befund falsch ist, die Fehlalarmquote, ist bisher {belastbarBei(b)} belastbar gemessen.
            </p>
          ) : null}
        </Szene>

        {/* Aufbau ------------------------------------------------------------- */}
        <Szene id="bauweise" nr="05">
          <div className="lb-anatomie">
            <div className="lb-kern" data-lb-reveal>
              <b>{d.anatomie.kern.titel}</b>
              <span>{d.anatomie.kern.zusatz}</span>
            </div>
            {d.anatomie.teile.map((t, i) => (
              <div className={`lb-teil t${i + 1}`} key={t.id} data-lb-tiefe={i % 2 ? '0.12' : '-0.12'} data-lb-reveal>
                <span className="lb-teil-nr">{String(i + 1).padStart(2, '0')}</span>
                <h3>{t.titel}</h3>
                <p className="lb-teil-kurz">{t.kurz}</p>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
          {sichtbar(d.techstack) ? (
            <div className="lb-stapel" data-lb-staffel>
              {d.techstack.gruppen.map((g) => (
                <div className="lb-stapel-gruppe" key={g.titel}>
                  <h3>{g.titel}</h3>
                  <p>{g.teile.map((t) => t.name).join(' · ')}</p>
                </div>
              ))}
            </div>
          ) : null}
        </Szene>

        {/* Fortschritt -------------------------------------------------------- */}
        <Szene id="fortschritt" nr="06" buehne>
          {planSichtbar ? (
            <ol className="lb-meilensteine" data-lb-staffel>
              {plan.meilensteine.map((m) => (
                <li key={m.id} className={m.abgenommen ? 'fertig' : m.terminOffen ? 'offen' : 'kommt'}>
                  <span className="lb-ms-id">{m.id}</span>
                  <span className="lb-ms-termin">
                    {m.abgenommen ? `abgenommen am ${kurz(m.abgenommen.am)}` : terminText(m, true)}
                  </span>
                  <span className="lb-ms-titel">{m.titel}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {laeufe ? (
            <div className="lb-laeufe">
              <h3>{laeufe.titel}</h3>
              <p className="lb-lead-klein">{laeufe.satz}</p>
              <ul className="lb-laeufe-liste" data-lb-staffel>
                {laeufe.zeilen.map((z) => (
                  <li key={z.wann}>
                    <span className="lb-lauf-wann">{z.wann}</span>
                    <span className="lb-lauf-balken" aria-hidden="true">
                      <span className="erfuellt" style={{ flexGrow: z.erfuellt }} />
                      <span className="wackelig" style={{ flexGrow: z.wackelig }} />
                      <span className="nie" style={{ flexGrow: z.nie }} />
                    </span>
                    <span className="lb-lauf-text">
                      {z.erfuellt} erfüllt, {z.wackelig} wackelig, {z.nie} nie; <b>{z.gelernt} gelernt</b>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="lb-hinweis">{laeufe.standSatz}</p>
            </div>
          ) : null}
          {planSichtbar ? (
            <div className="lb-risikoplan">
              <h3>So gehen wir die Risiken an</h3>
              <ol data-lb-staffel>
                {plan.risikoplan.schritte.map((s, i) => (
                  <li key={s.name}>
                    <span className="lb-rp-zeit">
                      {kurz(s.von)} bis {kurz(s.bis)}
                    </span>
                    <b>
                      {i + 1}. {s.name}
                    </b>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
              <p className="lb-hinweis">{plan.risikoplan.satz}</p>
            </div>
          ) : null}
        </Szene>

        {/* Begriffe ----------------------------------------------------------- */}
        <Szene id="glossar" nr="07">
          <dl className="lb-begriffe" data-lb-staffel>
            {begriffe.map((e) => (
              <div key={e.id}>
                <dt>{e.begriff}</dt>
                <dd>{e.erklaerung}</dd>
              </div>
            ))}
          </dl>
        </Szene>

        {/* Archiv ------------------------------------------------------------- */}
        <section id="archiv" className="lb-szene lb-archiv">
          <div className="lb-rahmen">
            <p className="lb-marke">
              <span>08</span> Archiv
            </p>
            <h2 className="lb-titel klein">Zum Nachschlagen.</h2>
            <p className="lb-lead">{p.archivSatz}</p>
            <ul className="lb-archiv-liste">
              {ARCHIV.filter((a) => sichtbar(abschnitt(a.id))).map((a) => (
                <li key={a.id}>
                  <a href={pfad(`/stand/#${a.id}`)} data-lb-magnet>
                    {a.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Fussleiste />
      <Bewegung />
    </div>
  )
}
