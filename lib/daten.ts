import rohdaten from '@/data/projektstand.json'
import type { Freigabe, MitFreigabe } from './freigabe'

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
  /** Haengt die Stufe an einem festen Datum oder an einer Messung? */
  bedingungsart: 'termin' | 'zahl'
}

export interface Arbeitstag {
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
}

export interface Beobachtung extends MitFreigabe {
  id: string
  titel: string
  text: string
  quelle: string
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
  /** Kurzform für das Diagramm, wo eine Zeile 126 Einheiten breit ist. */
  kurz: string
  kern: string
  tut: string
  tutNie: string
  zustand: 'arbeitet' | 'entschieden'
  seit: string | null
  hinweis: string
}

export interface Mannschaft extends MitFreigabe {
  satz: string
  gezaehltAm: string
  trennung: string
  engpass: string
  akte: string
  koepfe: Kopf[]
}

export interface Projektstand {
  stand: string
  herkunft: {
    arbeitsordner: string
    /** Vom Export gesetzt: der Ordner mit den Laufnotizen, relativ zum Arbeitsordner. */
    notizordner?: string
    einstieg: string
    erzeugt: string
    /** Ab wie vielen Tagen der Stand auf der Seite als alt ausgewiesen wird. */
    fristTage: number
    verfahren: string
    quellen: string[]
    freigabe: Freigabe
  }
  kennzahlen: Kennzahl[]
  mannschaft: Mannschaft
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
  }
  plattform: {
    werkbank: string
    dauerbetrieb: string
    entschiedenAm: string
    termin: string
    terminEntschiedenAm: string
    freigabe: Freigabe
    schritte: string[]
    warumAbschaltung: string
    erreichbar: string
    nichtBeantwortet: string
    ablageregel: string
  }
  entscheidungen: Entscheidung[]
  entscheidungenNachtrag: string
  offenePunkte: OffenerPunkt[]
  beobachtungen: Beobachtung[]
  gesellschaften: Gesellschaft[]
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

/** Zahlen mit Tausenderpunkt, damit 10752 als 10.752 lesbar bleibt. */
export function zahl(wert: number): string {
  return wert.toLocaleString('de-DE')
}
