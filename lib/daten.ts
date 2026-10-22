import rohdaten from '@/data/projektstand.json'
import type { Freigabe, MitFreigabe } from './freigabe'
import type { WerkzeugArt } from './werkzeugart'

export interface Kennzahl extends MitFreigabe {
  id: string
  zahl: number
  label: string
  art?: 'warnung'
}

export interface Schicht {
  nr: number
  name: string
  /** Wortlaut der Einführung vom 04.09., an ein Publikum gerichtet. */
  frage: string
  /** Wortlaut des Übergabedokuments vom 05.09., knapper. */
  frageUebergabe: string
  /** Wo die Antwort in der Beschreibungsdatei steht. */
  datei: string
  gruppe: string
  traegt: boolean
}

export interface AbgrenzungsZeile {
  merkmal: string
  chatbot: string
  mitarbeiter: string
}

export interface ErtragsPunkt {
  titel: string
  text: string
  beleg: string
}

export interface DurchlaufSchritt {
  id: string
  name: string
  zusatz: string
}

export interface HemmnisGruppe {
  titel: string
  zusatz: string
  punkte: string[]
}

export interface Stufe extends MitFreigabe {
  wann: string
  titel: string
  text: string
  bedingung: string
  /** Was von der Stufe erreicht ist, mit Datum im Satz. */
  stand?: string
  /** Haengt die Stufe an einem festen Datum oder an einer Messung? */
  bedingungsart: 'termin' | 'zahl'
}

export interface Arbeitstag extends MitFreigabe {
  datum: string
  text: string
}

export interface AnatomieTeil {
  id: string
  titel: string
  kurz: string
  text: string
}

export interface SchichtenGruppe {
  name: string
  schichten: number[]
  /** Übernimmt ein zweiter KI-Mitarbeiter diese Gruppe fast unverändert? */
  erbt: boolean
}

export interface Begriff {
  begriff: string
  erklaerung: string
  anzahl: string
}

export interface HarteRegel {
  id: string
  regel: string
  grund: string
}

export interface Schweregrad {
  stufe: string
  bedeutung: string
}

export interface Prueflauf extends MitFreigabe {
  id: string
  datum?: string
  datumVon?: string
  datumBis?: string
  art: 'mechanisch' | 'urteilend' | 'wiederholung' | string
  gegenstand: string
  geprueft?: number
  ohneBefund?: number
  blocker?: number | null
  major?: number | null
  minor?: number | null
  hinweise?: number | null
  befunde?: number
  fragen?: number
  enabler?: number
  themenkomplexe?: number
  bestaetigt?: number
  neuGefunden?: number
  /** Befunde dieses Laufs, die ein Mensch bewertet hat, laut Laufnotiz. */
  bewertet?: number
  laufzeit?: string | null
  zusatz?: { gleichungen: number; gleichungenFalsch: number }
  notiz?: string
}

export interface Messluecke extends MitFreigabe {
  id: string
  titel: string
  text: string
  unbewertet?: number
  unbewertetHerkunft?: string
}

export interface FehlalarmBeleg extends MitFreigabe {
  id: string
  titel: string
  /** Woran die Regel danebengriff, falls aufgeklärt. */
  ursache?: string
  /** Zahl der Meldungen, die sich als Fehlalarm erwiesen haben. */
  fehlalarme: number
  /** Wie viele davon aus einer einzigen Regel stammten, falls erhoben. */
  ausEinerRegel: number | null
  testfaelle: number
  text: string
}

export interface Entscheidung extends MitFreigabe {
  datum: string
  entscheidung: string
}

export interface OffenerPunkt extends MitFreigabe {
  nr: number
  punkt: string
  grund: string | null
  /** Gesetzt, sobald der Punkt entschieden ist. Der Punkt bleibt stehen. */
  erledigt?: { am: string; text: string }
}

export interface Beobachtung extends MitFreigabe {
  id: string
  titel: string
  text: string
  quelle: string
}

/** Entwurf für Impressum und Datenschutz. Solange geprueft false ist, tragen
 *  beide Seiten den Hinweis, dass sie rechtlich nicht geprüft sind. */
export interface Recht extends MitFreigabe {
  entwurfVom: string
  geprueft: boolean
  /** Name aus gesellschaften, dessen Angaben das Impressum zeigt. */
  anbieter: string
  anbieterWarum: string
  impressumFehlt: string[]
  datenschutzFehlt: string[]
  hosting: string
  hostingQuelle: string
  datenschutzGithub: string
  aufsicht: string
}

export interface Gesellschaft extends MitFreigabe {
  name: string
  rolle: string
  auftrag: string
  /** Leistungslinien je Marke, aus Block 02 des CI-Profils. */
  leistungen: string[]
  /** Anredeform der Marke. Gilt, sobald die Seite jemanden anspricht. */
  ansprache: string
  quelleLeistungen: string
  gegruendet: string | null
  register: string
  sitz: string
  kontakt: string
}

export interface Quelle extends MitFreigabe {
  ort: string
  inhalt: string
}

export interface Kopf extends MitFreigabe {
  id: string
  rolle: string
  /** Rufname, wenn die Rolle einen hat. Angezeigt wird "Rolle, Name". */
  name?: string
  /** Kurzform für das Diagramm, wo eine Zeile 126 Einheiten breit ist. */
  kurz: string
  kern: string
  tut: string
  tutNie: string
  /** arbeitet: tut seine Aufgabe. eingerichtet: läuft, aber ohne Akte.
   *  entschieden: beschrieben, nicht gebaut. */
  zustand: 'arbeitet' | 'eingerichtet' | 'entschieden'
  seit: string | null
  hinweis: string
  /** Fürs Organigramm: läuft mit Grenze am Profil, oder läuft ohne. */
  betrieb?: 'mitGrenze' | 'ohneGrenze'
  /** Fürs Organigramm: eine kurze Marke mit Datum. */
  marke?: string
  /** Entschieden, aber nach dem Organigramm nicht in der Mannschaft. */
  passtNicht?: boolean
}

export interface Werkbank extends MitFreigabe {
  seit: string
  satz: string
  helfer: { name: string; aufgabe: string }[]
  quelle: string
}

export interface Mannschaft extends MitFreigabe {
  satz: string
  gezaehltAm: string
  trennung: string
  engpass: string
  akte: string
  /** Warum die Grenze in einem Programm steht und nicht nur im Text. */
  grenzeWarum: string
  verlauf: { text: string; freigabe: Freigabe }
  koepfe: Kopf[]
  /** Fürs Organigramm: der Mensch oben, das Team daneben, die Werkbank und
   *  die gemeinsame Basis darunter. */
  mensch: { titel: string; zusatz: string }
  team: { titel: string; zusatz: string }
  werkbank: Werkbank
  basis: { titel: string; zeilen: string[] }[]
  organigrammQuelle: string
}

/** Ein Punkt in den Listen der Steckbriefe: der fette Anfang und der Satz
 *  danach, dazu ein Beispiel, wenn es in der Quelle steht. */
export interface SteckbriefPunkt {
  was: string
  /** Kurzer Titel, der im Abzeichen steht, wenn die Karte ihn zeigt. */
  titel?: string
  /** Art des Werkzeugs, für die Gruppe in der Werkzeugmatrix. */
  art?: WerkzeugArt
  beispiel?: string
}

/** Ein Ziel eines KI-Mitarbeiters, mit dem Tag, bis zu dem es gilt, wenn es
 *  einen gibt, und dem Stand, ob es erreicht ist. */
export interface SteckbriefZiel {
  was: string
  /** Tag im Format JJJJ-MM-TT, null ohne Datum. */
  bis: string | null
  erreicht: boolean
}

/** Der Steckbrief eines KI-Mitarbeiters: Rolle in einem Satz, Aufgaben,
 *  Ziele, Werkzeuge, und was er nie tut. */
export interface Steckbrief extends MitFreigabe {
  /** id eines Kopfes in mannschaft.koepfe */
  kopf: string
  satz: string
  aufgaben: SteckbriefPunkt[]
  ziele: SteckbriefZiel[]
  werkzeuge: SteckbriefPunkt[]
  tutNie: string
}

/** Ein Werkzeug von Hermes Agent, das bei uns in Betrieb ist. */
export interface WerkzeugInBetrieb extends MitFreigabe {
  name: string
  was: string
  beispiel: string
  /** ids der Köpfe, die es haben */
  wer: string[]
  /** Art des Werkzeugs, für die Gruppe in der Werkzeugmatrix. */
  art: WerkzeugArt
}

/** Ein Werkzeug von Hermes Agent, das es gibt, bei uns aber gesperrt ist. */
export interface WerkzeugGesperrt extends MitFreigabe {
  name: string
  was: string
  beispiel?: string
  warum: string
}

/** Die Steckbriefe der KI-Mitarbeiter und die Werkzeuge, die dahinterliegen. */
export interface Steckbriefe extends MitFreigabe {
  stand: string
  quelle: string
  satz: string
  lesehilfe: string
  mitarbeiter: Steckbrief[]
  werkzeuge: {
    satz: string
    inBetrieb: WerkzeugInBetrieb[]
    gesperrt: WerkzeugGesperrt[]
    kanaele: string
  }
}

export interface AblageBereich {
  id: string
  gruppe: 'wissen' | 'gedaechtnis' | 'werkstatt'
  name: string
  /** Kurzform für die Spalte der Verweise. */
  kurz: string
  notizen: number
  verbindlich: number
  informativ: number
  ungeprueft: number
  ohneFeld: number
  /** Verweise aus diesem Bereich in jeden anderen, auch wenn es null sind. */
  verweiseNach: Record<string, number>
}

/** Abbild der Ablage, gezählt von scripts/abbild-vault.mjs. Nur Zahlen je
 *  Bereich, keine Dateinamen und keine Pfade. */
export interface Ablage extends MitFreigabe {
  gezaehltAm: string
  notizen: number
  verweise: number
  unaufgeloest: number
  regelnotizen: number
  bereiche: AblageBereich[]
  verfahren: string
}

/** Eine Rubrik des Unternehmenswissens: ein Ordner direkt unter
 *  KI-Mitarbeiter. Wofür er da ist, steht von Hand in den Daten; die Anzahlen
 *  zählt scripts/abbild-vault.mjs. */
export interface Rubrik {
  ordner: string
  stufe: string
  /** notizen: Notizen der Ablage. dateien: Dateien, die keine Notizen sind. */
  art: 'notizen' | 'dateien'
  wofuer: string
  hinweis?: string
  notizen?: number
  verbindlich?: number
}

export interface Unternehmenswissen extends MitFreigabe {
  satz: string
  erklaerung: string
  stand: string
  stufen: { id: string; name: string; wann: string }[]
  rubriken: Rubrik[]
  gezaehltAm: string
  quelle: string
}

/** läuft: in Betrieb. vorhanden: gebaut oder eingerichtet, noch nicht im
 *  Einsatz. geplant: entschieden, nicht gebaut. */
export type LandschaftZustand = 'laeuft' | 'vorhanden' | 'geplant'

export interface LandschaftOrt {
  id: 'werkbank' | 'ablage' | 'rechner'
  name: string
  produkt: string
  rolle: string
}

export interface LandschaftBaustein extends MitFreigabe {
  id: string
  ort: LandschaftOrt['id']
  name: string
  zustand: LandschaftZustand
  /** Der Baustein, an dem der Rest hängt. Er trägt das Rot. */
  traegt?: boolean
}

export interface LandschaftVerbindung extends MitFreigabe {
  id: string
  von: string
  nach: string
  /** Beschriftung, eine Zeile je Eintrag. */
  zeilen: string[]
  zustand: LandschaftZustand
  /** Die eine Verbindung, an der der Rest hängt. Sie trägt das Rot. */
  traegt?: boolean
}

/** Systemlandschaft mit Ist und Soll. */
export interface Landschaft extends MitFreigabe {
  stand: string
  rechnerAufgenommen: string
  rechnerBestaetigt: string
  satz: string
  erklaerung: string
  rechnerStand: string
  vergleich: string
  mensch: { name: string; zusatz: string }
  orte: LandschaftOrt[]
  bausteine: LandschaftBaustein[]
  verbindungen: LandschaftVerbindung[]
  seite: { name: string; produkt: string; seit: string }
  quelle: string
}

export interface PlanMeilenstein {
  id: string
  woche: string
  /** Tag der Abnahme, die Frist aus dem Plan. */
  datum: string
  /** Zieldatum nach dem Nachtrag vom 18.09., früher als die Frist. */
  ziel?: string
  /** Woran das Zieldatum hängt, wenn es an etwas hängt. */
  zielBedingung?: string
  titel: string
  inhalt: string[]
  abnahme: string
  /** Anteil des Projektverantwortlichen in Worten; die Minuten stehen in `zeit`. */
  erwin: string
  /** Punkte aus `inhalt`, die schon erledigt sind, im selben Wortlaut. */
  erledigt?: string[]
}

export interface PlanBalken {
  meilenstein: string
  text: string
  von: string
  tage: number
  /** Liegt auf dem kritischen Pfad. */
  kritisch: boolean
  /** bauen: Werkbank oder eigene Hardware. bewerten: Zeit des Projektverantwortlichen. */
  art: 'bauen' | 'bewerten'
  erledigt?: boolean
}

export interface PlanEntscheidung {
  nr: string
  bis: string
  /** Mehrere Fristen, wenn die Entscheidung gestaffelt fällt. */
  termine?: string[]
  ueberfaelligSeit?: string
  erledigtAm?: string
  text: string
  blockiert: string
  empfehlung: string
  kritisch?: boolean
}

export interface PlanRisiko {
  nr: string
  titel: string
  text: string
  eintritt: 'hoch' | 'mittel' | 'niedrig'
  auswirkung: 'hoch' | 'mittel' | 'niedrig'
  stufe: 'kritisch' | 'hoch' | 'mittel' | 'niedrig'
  gegenmassnahme: string
  warnzeichen: string
  erledigt?: { am: string; text: string }
}

/** Der Meilensteinplan, wie er im Vault steht, ohne Zugänge und Datenwege. */
export interface Meilensteinplan extends MitFreigabe {
  /** Seit wann ein neuerer Plan gilt, und in einem Satz, wie es dazu kam. */
  ueberholtAm?: string
  ueberholt?: string
  stand: string
  status: string
  /** Was sich nach dem Entwurf getan hat, mit Uhrzeit im Satz. */
  standNachtrag?: string
  /** Der Nachtrag vom 18.09.: Zieldaten vor den Fristen, und warum. */
  nachgezogen?: {
    am: string
    satz: string
    warum: string
    fristen: string
    nichtSchneller: string
    vorgezogen: string
    istZeit: string
    m1Fehlt: string[]
    m1FehltSatz: string
    quelle: string
  }
  von: string
  bis: string
  ersetzt: string
  satz: string
  ziel: string
  zielVon: string
  rahmen: string
  budgetMinutenJeWoche: number
  kurz: string
  lauffaehig: string
  zielteile: { teil: string; erfuellt: string; uebrig: string }[]
  wochen: { id: string; von: string; bis: string; name: string }[]
  meilensteine: PlanMeilenstein[]
  balken: PlanBalken[]
  zeit: { woche: string; entscheiden: number; lesen: number; bewerten: number }[]
  zeitVorher: string
  zeitPreis: string
  /** Zeit des Projektverantwortlichen laut Arbeitsplan, der alle Punkte mitrechnet. */
  zeitArbeitsplan?: { minuten: number; bisM1: number; text: string }
  entscheidungen: PlanEntscheidung[]
  entscheidungenHinweis: string
  pfad: string[]
  pfadSatz: string
  daneben: string
  nichtDrin: string[]
  risiken: PlanRisiko[]
  risikenHinweis: string
  risikenKern: string
  quelle: string
}

/** Die ersten Bewertungen durch einen Menschen, aus den Quoten je Regel. */
export interface Bewertungen extends MitFreigabe {
  erstmalsAm: string
  stand: string
  regeln: number
  bewertet: number
  gesehen: number
  fehlalarme: number
  zielGesehenJeRegel: number
  hoechstesGesehen: number
  regelnAmZiel: number
  gruppen: string
  ungemessen: string
  umgewichtet: string
  rueckweg: string
  beispiel: { satz: string; text: string }
  quelle: string
  /** Die erste Regel, die die Schwelle erreicht hat. */
  ersteRegel?: { regel: string; am: string; gesehen: number; fehlalarme: number; satz: string }
  /** Wofür die Bewertungen gelten und wofür nicht. */
  geltung?: string
}

/** "bei keiner Regel", "bei einer von 10 Regeln", "bei 2 von 10 Regeln" */
export function belastbarBei(b: Bewertungen): string {
  if (b.regelnAmZiel === 0) return 'bei keiner Regel'
  const wie = b.regelnAmZiel === 1 ? 'einer' : zahl(b.regelnAmZiel)
  return `bei ${wie} von ${zahl(b.regeln)} Regeln`
}

/** "Das erreicht bisher keine Regel.", "Das erreicht eine von 10 Regeln." */
export function zielErreicht(b: Bewertungen): string {
  if (b.regelnAmZiel === 0) return 'Das erreicht bisher keine Regel.'
  if (b.regelnAmZiel === 1) return `Das erreicht eine von ${zahl(b.regeln)} Regeln.`
  return `Das erreichen ${zahl(b.regelnAmZiel)} von ${zahl(b.regeln)} Regeln.`
}

/** Ein Meilenstein des Plans vom 29.09.: Termin nach der Entscheidung vom
 *  16.10., daneben die Frist, die der Plan vom 29.09. selbst gesetzt hatte. */
export interface AktuellerMeilenstein {
  id: string
  termin: string
  fruehereFrist: string
  titel: string
  /** erledigt: wann und wie; teilweise: was davon schon gelaufen ist;
   *  entfaellt: seit wann die Arbeit nicht mehr nötig ist. */
  inhalt: { text: string; erledigt?: string; teilweise?: string; entfaellt?: string }[]
  abnahme: string
  /** Gesetzt, sobald der Projektverantwortliche den Meilenstein abgenommen hat. */
  abgenommen?: { am: string; text: string }
  erwinMinuten: number
}

/** Wie weit die Arbeiten eines Meilensteins sind. Eine entfallene Arbeit zählt
 *  nicht mit. */
export function arbeitenStand(m: AktuellerMeilenstein): { erledigt: number; gesamt: number; entfallen: number } {
  const entfallen = m.inhalt.filter((i) => i.entfaellt).length
  return {
    erledigt: m.inhalt.filter((i) => i.erledigt).length,
    gesamt: m.inhalt.length - entfallen,
    entfallen,
  }
}

export interface PlanFrist {
  text: string
  frist: string
  stand: 'offen' | 'erledigt'
  am?: string
  notiz?: string
  kritisch?: boolean
}

export interface AktuellerRisiko {
  nr: string
  titel: string
  eintritt: string
  auswirkung: string
  stufe: string
  gegenmassnahme: string
}

/** Der Plan, der gerade gilt. Der vom 17.09. bleibt unter meilensteinplan
 *  als Verlauf stehen, weil aus den Daten nichts verschwindet. */
export interface AktuellerPlan extends MitFreigabe {
  stand: string
  status: string
  von: string
  bis: string
  termineAm: string
  ersetzt: string[]
  satz: string
  ziel: string
  zielVon: string
  zielteile: { teil: string; festgelegt: string }[]
  lauffaehig: string
  termineSatz: string
  meilensteine: AktuellerMeilenstein[]
  fristen: PlanFrist[]
  fristenHinweis: string
  pfad: string[]
  pfadSatz: string
  daneben: string
  risiken: AktuellerRisiko[]
  risikenHinweis: string
  nichtDrin: string[]
  zeitSatz: string
  heute: { wer: string; stand: string }[]
  quelle: string
}

/** Ab wann ein Auftrag geht: mit einem Meilenstein, nach dem Ende des Plans
 *  oder nur für bestimmte Auftraggeber. */
export type AnleitungAb = { meilenstein: string } | { nachPlan: true } | { nur: string }

export interface AnleitungZeile extends MitFreigabe {
  auftrag: string
  wer: string
  angaben: string
  ab: AnleitungAb
}

/** Wie man einem KI-Mitarbeiter einen Auftrag gibt, aus der Akte des Orchestrators. */
export interface Anleitung extends MitFreigabe {
  stand: string
  satz: string
  wer: string
  /** Meilenstein, ab dem das Team beauftragen kann. */
  teamAb: string
  /** Meilenstein, ab dem Sprachnachrichten gehen. */
  spracheAb: string
  schritte: { titel: string; text: string }[]
  zeilen: AnleitungZeile[]
  /** Was die Pflichtangaben eines Prüfauftrags bedeuten. */
  angaben: { angabe: string; erklaerung: string }[]
  ablehnung: string[]
  bericht: string
  fehlalarm: string
  mitmachenSatz: string
  mitmachen: { titel: string; text: string }[]
  quelle: string
}

/** Ein Fachwort der Seite, erklärt in ein bis zwei Sätzen. */
export interface GlossarEintrag {
  id: string
  begriff: string
  erklaerung: string
  quelle: string
}

export interface Projektstand {
  stand: string
  herkunft: {
    arbeitsordner: string
    /** Vom Export gesetzt: der Ordner mit den Laufnotizen, relativ zum Arbeitsordner. */
    notizordner?: string
    einstieg: string
    /** Tag, an dem die Ablage in zwei Repositories geteilt wurde. Ältere Ortsangaben stammen von davor. */
    getrenntAm: string
    erzeugt: string
    /** Ab wie vielen Tagen der Stand auf der Seite als alt ausgewiesen wird. */
    fristTage: number
    verfahren: string
    quellen: string[]
    freigabe: Freigabe
  }
  kennzahlen: Kennzahl[]
  mannschaft: Mannschaft
  ablage: Ablage
  unternehmenswissen: Unternehmenswissen
  bewertungen: Bewertungen
  /** Was die Zahlen zu Fritz belegen und was nicht. */
  ersterHinweis: { kopf: string; text: string; quelle: string; freigabe: Freigabe }
  /** Prüfstand und Nutzentest: geübt und gemessen seit dem 18.10. */
  tests: { satz: string; punkte: ({ titel: string; text: string } & MitFreigabe)[]; quelle: string; freigabe: Freigabe }
  /** Wie ein neuer KI-Mitarbeiter dazukommt: sechs Schritte, vier Tore, dazu
   *  das geplante Assessment Center. Angenommen am 22.10.2026. */
  aufnahme: {
    stand: string
    satz: string
    schritte: { titel: string; text: string; tor?: string }[]
    assessment: { titel: string; text: string }
    quelle: string
    freigabe: Freigabe
  }
  landschaft: Landschaft
  meilensteinplan: Meilensteinplan
  meilensteinplanAktuell: AktuellerPlan
  schichten: Schicht[]
  schichtenEntschieden: string
  schichtenErklaerung: string
  schichtenDatei: string
  schichtenErbe: string
  abgrenzung: {
    satz: string
    erklaerung: string
    zeilen: AbgrenzungsZeile[]
    freigabe: Freigabe
  }
  eignung: {
    geeignet: string[]
    ungeeignet: string[]
    nachsatz: string
    freigabe: Freigabe
  }
  ertrag: { einleitung: string; punkte: ErtragsPunkt[]; freigabe: Freigabe }
  wissensablagen: {
    satz: string
    eigen: { titel: string; inhalt: string; geteilt: boolean; hinweis: string }
    gemeinsam: {
      titel: string
      inhalt: string
      geteilt: boolean
      bereiche: number
      angelegtAm: string
      stand: string
      offeneFragen: number
      haltenFreigabeAuf: number
      hinweis: string
    }
    freigabe: Freigabe
  }
  durchlauf: {
    schritte: DurchlaufSchritt[]
    rueckweg: string
    zweiStufen: string
    verdichtung: string
    freigabe: Freigabe
  }
  pruefpunkte: {
    gesamt: number
    skript: number
    mensch: number
    skriptBeispiele: string
    menschBeispiele: string
    hinweisSkript: string
    hinweisFreigabe: string
    freigabe: Freigabe
  }
  steuerung: {
    beauftragt: { wer: string; wie: string }[]
    warumSkript: string
    helfer: string
    uebergabe: string
    abwaegung: string
    freigabe: Freigabe
  }
  arbeitstage: { beginn: string; eintraege: Arbeitstag[]; freigabe: Freigabe }
  hemmnisse: { satz: string; gruppen: HemmnisGruppe[]; freigabe: Freigabe }
  stufen: Stufe[]
  stufenPlan: { text: string; freigabe: Freigabe }
  anleitung: Anleitung
  glossar: { satz: string; eintraege: GlossarEintrag[]; freigabe: Freigabe }
  arbeitsschwerpunkt: {
    satz: string
    brauchtEs: string
    auswahl: string
    schluss: string
    freigabe: Freigabe
  }
  standSatz: string
  anatomie: {
    kern: { titel: string; zusatz: string }
    satz: string
    teile: AnatomieTeil[]
    freigabe: Freigabe
  }
  schichtenGruppen: SchichtenGruppe[]
  beschreibungsdatei: {
    name: string
    stand: string
    kopf: string
    rumpf: string
    grenze: string
    einzigeQuelle: string
    auszug: string
    freigabe: Freigabe
  }
  beispielbefund: {
    stufe: string
    text: string
    fundstelle: string
    nachsatz: string
    freigabe: Freigabe
  }
  begriffe: Begriff[]
  auftrag: {
    pflichtangaben: string[]
    ablauf: string[]
    /** Der Ablauf, wie ihn die Akte des Reviewers beschreibt. */
    ablaufAkte: string[]
    ablaufAkteStand: string
    anweisungImDokument: { satz: string; seit: string; grund: string }
    harteRegeln: HarteRegel[]
  }
  massstab: {
    kriterien: {
      gesamt: number
      mechanisch: number
      urteilend: number
      liste: string[]
      gewichtung: string
    }
    schweregrade: Schweregrad[]
    kalibrierung: {
      entschiedenAm: string
      satz: string
      begruendung: string
      offen: string
    }
  }
  gegenstand: {
    gliederung: string
    komponenten: number
    themenkomplexe: number
    enabler: number
    enablerVollstaendig: number
    dateien: number
    format: string
    jeEnabler: string
    wahlqualifikationen: number
    rechtsstand: string
    normbasis: {
      notizen: number
      positionenAbschnittA: number
      wahlqualifikationen: number
      integrativeAbschnittC: number
      lernfelder: number
      weitere: string[]
      primaerquelle: string
    }
    parallellauf: { bis: string; regel: string; folge: string }
  }
  prueflaeufe: {
    zeitraum: { von: string; bis: string }
    protokolliert: number
    imDokumentAusgewiesen: number
    laeufe: Prueflauf[]
    befunddichte: {
      einheit: string
      min: number
      max: number
      buendelung: string
      freigabe: Freigabe
    }
    leitbefund: { titel: string; text: string; freigabe: Freigabe }
  }
  messluecken: Messluecke[]
  fehlalarmBelege: FehlalarmBeleg[]
  uebertragbarkeit: {
    kern: string
    profil: string
    satz: string
    zweiterMitarbeiter: string
    uebergabe: string
    auswahlregel: string
    beleg: string
  }
  plattform: {
    werkbank: string
    dauerbetrieb: string
    entschiedenAm: string
    termin: string
    terminEntschiedenAm: string
    freigabe: Freigabe
    schritte: string[]
    /** Je Schritt, in derselben Reihenfolge: erreicht oder offen. */
    schritteStand: ('erreicht' | 'offen')[]
    /** Was am Termin tatsächlich erreicht war. */
    amTermin: string
    warumAbschaltung: string
    erreichbar: string
    nichtBeantwortet: string
    ablageregel: string
  }
  entscheidungen: Entscheidung[]
  entscheidungenNachtrag: string
  entscheidungenNachtragIntern: { text: string; freigabe: Freigabe }
  offenePunkte: OffenerPunkt[]
  beobachtungen: Beobachtung[]
  gesellschaften: Gesellschaft[]
  recht: Recht
  /** Regeln aus Block 09 des CI-Profils, die beim Einsetzen der Logodatei gelten. */
  auftreten: {
    logoMindestbreiteBildschirm: number
    logoZulaessigeUntergruende: string[]
    logoSchutzraum: string
    bildsprache: string
    quelle: string
    freigabe: Freigabe
  }
  geschaeftsfuehrung: string
  ansprechpartner: { name: string; rolle: string }
  quellen: Quelle[]
  steckbriefe: Steckbriefe
}

export const daten = rohdaten as unknown as Projektstand

/** Datum aus der JSON (ISO) in die im Haus uebliche Schreibweise. */
export function datum(iso: string): string {
  const [jahr, monat, tag] = iso.split('-')
  return `${tag}.${monat}.${jahr}`
}

/** Eine der vier harten Regeln über ihre Kennung. Wirft, statt still eine
 *  falsche Regel zu liefern, wenn die Kennung nicht mehr existiert. */
export function harteRegel(id: string): HarteRegel {
  const treffer = daten.auftrag.harteRegeln.find((r) => r.id === id)
  if (!treffer) throw new Error(`Unbekannte harte Regel: ${id}`)
  return treffer
}

/** Tage zwischen zwei ISO-Daten, beide Enden mitgezaehlt. Haelt Formulierungen
 *  wie "in neun Tagen" an den Daten, statt sie in die Prosa zu schreiben. */
export function tageZwischen(vonIso: string, bisIso: string): number {
  const tag = 24 * 60 * 60 * 1000
  const von = Date.parse(`${vonIso}T00:00:00Z`)
  const bis = Date.parse(`${bisIso}T00:00:00Z`)
  return Math.round((bis - von) / tag) + 1
}

/** Zeitspanne in der Kurzform des Hauses: 17.–25.09. oder 28.09.–02.10. */
export function spanne(vonIso: string, bisIso: string): string {
  const [, vm, vt] = vonIso.split('-')
  const [, bm, bt] = bisIso.split('-')
  return vm === bm ? `${vt}.–${bt}.${bm}.` : `${vt}.${vm}.–${bt}.${bm}.`
}

/** Minuten als Dauer: 105 wird 1 h 45, 40 wird 40 min. */
export function dauer(minuten: number): string {
  const h = Math.floor(minuten / 60)
  const m = minuten % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`
}

/** Zahlen mit Tausenderpunkt, damit 10752 als 10.752 lesbar bleibt. */
export function zahl(wert: number): string {
  return wert.toLocaleString('de-DE')
}
