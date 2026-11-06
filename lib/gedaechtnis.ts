/** Die zwei Speicher eines KI-Mitarbeiters. Die Startseite zeigt sie in der Szene Aufbau,
 *  der Abschnitt „Wissen und Ablage“ in den Einzelheiten nutzt dieselben Sätze. */

export const WISSEN = {
  titel: 'Wissen',
  untertitel: 'Was gilt. Schreiben Menschen, ändert sich selten und nie von allein.',
  punkte: [
    'Norm von außen: Gesetze, Verordnungen, wörtlich abgeschrieben',
    'Maßstab des Hauses: Checklisten, Vorlagen, Corporate Design',
    'Begriffe: was ein Wort hier bedeutet',
    'Entscheidungen: was einmal festgelegt wurde, mit Datum',
  ],
}

export const GEDAECHTNIS = {
  titel: 'Gedächtnis',
  untertitel: 'Was herauskam. Fällt beim Arbeiten an und wächst mit jedem Auftrag.',
  punkte: [
    'Einzelergebnis: hunderte je Lauf, maschinell geschrieben',
    'Regel: wenige, langlebig. Zweck, Testfälle und die gemessene Fehlalarmquote',
    'Lauf: eine Notiz je Durchgang, mit Kennzahlen für den Vergleich über die Zeit',
  ],
}

/** Was in den Bereichen der Ablage liegt, für das Netz in der Szene Aufbau. Die Zuordnung der
 *  Notizen zu den Bereichen steht in bereichVon() in scripts/abbild-vault.mjs. */
export const BEREICHE_ERKLAERT: Record<string, string> = {
  konventionen: 'Wie Notizen aufgebaut sind, wer wo schreiben darf und was ein Wort hier bedeutet.',
  entscheidungen: 'Jede Entscheidung des Projektverantwortlichen als eigene Notiz: Frage, Antwort, Datum und was daraus folgt.',
  unternehmen: 'Werte, Leitplanken, Leistungen, Markt und Auftreten der WAMOCON, für alle KI-Mitarbeiter gleich.',
  bauplan: 'Akten, Steckbriefe, Prüfstände und das Trainingskonzept: wie jeder KI-Mitarbeiter gebaut ist.',
  normbasis: 'Die Ordnung des Berufs Kaufleute für Büromanagement, wörtlich abgeschrieben, als Norm von außen.',
  massstab: 'Kriterien einer guten Unterlage, Schweregrade und Berichtsvorlagen: wogegen Fritz prüft.',
  quellen: 'Nachweise, woher das übrige Wissen stammt.',
  prueflaeufe: 'Das Gedächtnis: eine Notiz je Prüflauf mit Kennzahlen, dazu die Regeln mit Testfällen und gemessener Fehlalarmquote.',
  arbeitsstand: 'Pläne, Berichte und Übergaben: woran gerade gearbeitet wird und was offen ist.',
  protokoll: 'Was an jedem Tag in den Sitzungen geschah, nachgetragen vom Archivar.',
  einstiege: 'Einstiegsseiten der Ablage und neu Eingegangenes, das noch einsortiert wird.',
  archiv: 'Was nicht mehr gilt, aber nachvollziehbar bleiben soll.',
}
