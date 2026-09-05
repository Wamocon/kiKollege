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
  frage: string
  traegt: boolean
}

export interface Begriff {
  begriff: string
  erklaerung: string
  anzahl: string
}

export interface HarteRegel {
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
  gegruendet: string | null
  register: string
  sitz: string
  kontakt: string
}

export interface Quelle extends MitFreigabe {
  ort: string
  inhalt: string
}

export interface Projektstand {
  stand: string
  herkunft: {
    arbeitsordner: string
    einstieg: string
    erzeugt: string
    verfahren: string
    freigabe: Freigabe
  }
  kennzahlen: Kennzahl[]
  schichten: Schicht[]
  schichtenEntschieden: string
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

/** Zahlen mit Tausenderpunkt, damit 10752 als 10.752 lesbar bleibt. */
export function zahl(wert: number): string {
  return wert.toLocaleString('de-DE')
}
