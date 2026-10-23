# Übergabe

Diese Datei ist für die nächste Sitzung geschrieben, nicht für die Nachwelt. Sie
sagt, wo das Vorhaben steht, was als Erstes zu tun ist und was dabei nicht
verloren gehen darf.

Stand dieser Übergabe: 23.10.2026.

## Nachtrag 23.10.2026: Stand der Nacht, zur Vorstellung um 16 Uhr

Der Zweig `landing/stand-2026-10-23` steht auf `landing/trainingskonzept` (Pull
Request 22) und zieht den Stand aus dem Morgenbriefing im Tagesprotokoll vom 23.10.
nach. Bestellt hat ihn die Sitzung „Morgenbriefing und Jira“ nach der Entscheidung
des Projektverantwortlichen vom 22.10. abends: Vorschau bis 12 Uhr, gemergt wird
erst nach seinem Okay im Chat, in der Reihenfolge 19, 21, 22 und dieser.

- **Theo, der Tester:** Name nach der Entscheidung vom 22.10.; er läuft auf dem
  KI-Rechner mit Grenze und eigenem Zugang. Erster Prüfstandlauf: 9 von 18
  Pflichtfällen, Grenzen gehalten, noch kein volles Mitglied. Die Mannschaft zählt
  jetzt sieben laufende Rollen.
- **WMC Inventar:** erster Entwicklungsauftrag als Kette in sieben Meilensteinen.
  M1 gebaut, 24 Testfälle geschrieben, noch nicht ausgeführt; bei M2 hält die Kette.
  Neu: Baustein „Auftragsketten über einen Wächter“, Begriff Auftragskette.
- **Hermes:** erster Trainingslauf nach dem neuen Konzept seit 02:08, Ergebnis offen.
- **Daten:** Chronik 23.10., acht Entscheidungen vom 22.10. abends, zwei Beobachtungen
  (Kette und Trainingslauf, Trockenlauf „grün“).
- **Nicht auf der Seite:** Benutzer, Pfade, Ports, Zweige und Commits auf dem
  KI-Rechner, das Risiko aus dem gemeinsamen Benutzer, Einzelheiten des Zauns.

## Nachtrag 22.10.2026: Das Trainingskonzept auf der Seite

Der Zweig `landing/trainingskonzept` steht auf `landing/prozess-neuer-ki-mitarbeiter`
(Pull Request 21) und bringt das Trainingskonzept vom 22.10. auf die Seite, auf
Wunsch des Projektverantwortlichen vom selben Abend, übermittelt von der Sitzung
„KI-Mitarbeiter Training“.

- **Landing Page, Abschnitt 05:** Block „Wie ein KI-Mitarbeiter besser wird.“ direkt
  nach „Wie ein neuer dazukommt.“, in den bestehenden Formen: Lernkreis in fünf
  Schritten, wann ein Fall gelernt ist, der feste Takt mit „entschieden am …“ oder
  „Vorschlag“, die Ebenen beim Nachschärfen, wer was tut, wer schon einen Prüfstand hat.
- **`/stand/`, Abschnitt Gedächtnis:** die Messlatte des Assessment Centers in drei
  Stufen und woher neue Fälle kommen.
- **Daten:** Schlüssel `training`, zwei neue Begriffe (Nachschärfen, Pflichtfall),
  Prüfstand und Training neu erklärt, acht Entscheidungen vom 22.10., Chronik ergänzt.
- **Bewusst nicht auf der Seite:** Einzelheiten zu Zaun und Profilen, die Nutzungs-
  bedingungen, das Modell, Links auf die privaten OnePager.
- **Quelle:** `Trainingskonzept KI-Mitarbeiter.md`, Stand 22.10., ungeprüft und beim
  Lesen noch nicht committet; die Seite sagt, dass es ein Entwurf ist.

## Nachtrag 22.10.2026: Abgleich der Seite mit der Ablage

Drei Prüfer haben die drei Seiten am 22.10. gegen Logbuch, Protokolle, Arbeitsplan
und Akten gelesen; der Zweig `landing/abgleich-2026-10-22` behebt, was sie fanden.
Die Landing Page bleibt für alle Leser; Einzelheiten stehen unter `/stand/`.

- **Beauftragen** war an zwei Stellen falsch: Prüfumfang heißt, welche Kriterien
  gelten, und über den Orchestrator kommt eine Meldung, noch kein Bericht. Dazu:
  nur Unterlagen, die schon auf dem KI-Rechner liegen, keine Unterlagen und keine
  personenbezogenen Daten in den Chat, die Tabelle nach der Akte vom 22.10.
- **Fritz und Verlässlichkeit:** Die Zahlen auf der Seite stammen aus Läufen an der
  Werkbank vor seiner Akte; im Nutzentest fand er auf dem KI-Rechner keinen der
  fachlichen Fehler. Die Bewertungen gelten für Enabler, Szenarien und Bestand, nicht
  für Use-Cases. Prüfstand und Nutzentest stehen jetzt im Abschnitt 03.
- **Meilensteinplan nach dem Arbeitsplan vom 16.10.:** neue Fristen statt „alle
  verstrichen“, Trainingsziel 27.10. im Pfad und als Risiko R31, Zeit 6 h 00.
- **Mannschaft:** Archivar vorgezogen, Tester neu als neunte Rolle, Steckbriefe dazu.
  Der Gestalter steht weiter in den Daten (`passtNicht`), aber nicht im Organigramm
  und nicht in der Zählung „läuft“.
- **Meilenstein 1:** Das eigene Profil des Orchestrators ist anders gelöst; er läuft
  seit dem 18.10. im bestehenden Profil mit Grenze und Akte.
- **Sicherheit:** Einzelheiten zu Profilen, Zugängen, Zaun, Modell und Datenwegen
  stehen nicht mehr auf der Seite. Die Einträge sind umformuliert, nicht gelöscht.
- **Ablage** aus den Repositories gezählt (267 Notizen, 11 verbindlich), nicht aus der
  Kopie auf dem KI-Rechner (296, 14). Eine Beobachtung hält den Unterschied fest.
  Gezählt wurde aus `git archive` der drei Repositories in einen leeren Ordner; der
  lokale Arbeitsordner enthält unversionierte Ordner, die die Zählung verfälschen.
- **Länge:** Die Landing Page hat ohne die Begriffe 5.812 Wörter statt 5.161 (beide
  in der Fassung `alles`, gleich gezählt). Zugelegt haben 03 (Prüfstand und
  Nutzentest), 04 (vier neue Zeilen, zwei Ablehnungen) und 11 (vier Zeilen „Wo es
  heute steht“).
- **Prüfung:** Drei interne Texte lauteten wie öffentliche und schlugen in
  `pruefe:oeffentlich` an; sie sind umformuliert. Werkzeugtitel bleiben unter 24
  Zeichen, wenn derselbe Titel bei einer internen Rolle vorkommt.

Die Werkzeugmatrix auf `/mannschaft/` bleibt, wie bisher entschieden; ob die
Werkzeuge je Rolle öffentlich sein sollen, entscheidet der Projektverantwortliche.

## Nachtrag 22.10.2026: Meilenstein 1 abgenommen

Die Seite rechnete Meilenstein 1 bis zum 22.10. als offen, obwohl der
Projektverantwortliche ihn am 16.10. abgenommen hatte, mit Vorbehalt, und den
Vorbehalt am 19.10. bis auf den Test mit einer fremden Kennung erledigt hat
(Logbuch 2026-10-16 Abnahme Meilenstein 1). Weder der Standwächter noch Gregor
Devs Pflegelauf hatten die Abnahme nachgetragen; die Daten kannten dafür kein Feld.

- Neu: `meilensteine[].abgenommen` und `inhalt[].entfaellt`. Die Landing Page
  zeigt die Abnahme beim Meilenstein, in der Grafik als dunklen Kreis, und nimmt als
  nächste Abnahme den ersten, der noch aussteht.
- Die Linie „Stand der Daten“ in der Grafik der Termine folgt jetzt `stand`, nicht
  dem Stand des Plans; sie stand beim 16.10.
- Meilenstein 2 hat die zwei Arbeiten zum Prüfstand des Orchestrators dazu und die
  Abnahme „eine nicht zugelassene Kennung wird abgewiesen“, beides aus dem
  Arbeitsplan vom 16.10.

Der Arbeitsplan vom 16.10. ist die genauere Quelle für Meilensteine als der
Meilensteinplan vom 29.09.: Er führt jede Arbeit mit Frist und Stand. Ein
Pflegelauf sollte ihn mitlesen.

## Nachtrag 17.10.2026: Umbau für alle Leser

Der Projektverantwortliche hat die Seite neu bewerten lassen. Maßstab: Jeder
Mitarbeiter versteht sie ohne ihn. Entschieden in fünf Fragerunden, umgesetzt auf
dem Zweig `landing/umbau-alle-leser`:

- **Für alle Leser**, in Kapiteln: Verstehen, Arbeiten, Bauen, Stand, Begriffe.
  Abgrenzung und Eignung sind im ersten Abschnitt aufgegangen.
- **Beauftragen** ist neu und zugleich die „Anleitung fürs Team“ aus Meilenstein 2.
  Grundlage ist die freigegebene Akte des Orchestrators, nicht der Entwurf der
  Anleitung vom 16.10.; der nennt Kanäle, Rechner und Bots und ist ungeprüft.
  Einen Weg, auf dem das Team einen Fehlalarm meldet, gibt es nicht; das steht als
  offener Punkt 22. Bis dahin gehen solche Meldungen an den Projektverantwortlichen.
- **Begriffe**: 39 Fachwörter, Daten unter `glossar`. „Prüfpunkt“ war in der
  Ablage nirgends definiert; die Seite trennt Kriterium, Prüfpunkt und Regel.
- **Ohne Namen**: Statt „Erwin“ steht „der Projektverantwortliche“, auf beiden
  Seiten und in den Daten. Die KI-Mitarbeiter behalten ihre Namen.
  `pruefe:ausgabe` hält das, der Standwächter hat die Regel.
- **Kürzer**: Einzelheiten stehen unter `/stand/`, auf der Landing Page je ein Satz
  mit Sprung. Ohne die Begriffe 4.266 Wörter statt 6.896.
- **Widersprüche behoben**: Vier Sätze behaupteten, die Grenze sei auf der eigenen
  Hardware nicht aktiv, und einer, dem Orchestrator fehle die Akte. Sie sagen jetzt,
  was gilt, oder tragen ein Datum.
- `pruefe:bestand` zählt Einträge ohne Kennung je Tag. Vorher galt ein
  umformulierter Tag der Chronik als gelöscht.

Der Lesetest (ein Agent, nur der Text der Seite, sechs Fragen) fand Lücken. Die
Seite hat behoben, was sie selbst lösen kann. Danach am 17.10. entschieden:

- **Kontakt:** Die Seite nennt nur die Rolle. Wer der Projektverantwortliche ist,
  wie man ihn erreicht und welcher Messenger, steht in der Einladung zum
  Freischalten und später auf der internen Seite.
- **Anrede:** Beauftragen duzt und bleibt dabei, obwohl das CI-Profil für die GmbH
  Sie setzt.

Offen: Beispiele für Zielgruppe und Kursformat gibt es in der Ablage nicht. Sobald
die Anleitung fürs Team freigegeben ist, gehören zwei echte Beispielaufträge in
`anleitung`.

## Nachtrag 16.10.2026: vier Wochen nachgetragen

Vom 18.09. bis zum 16.10. hat sich die Seite nicht bewegt: kein Lauf auf GitHub,
keine tägliche Aufgabe, Pull Request #6 offen. Der Zweig `stand/2026-10-16` holt
den Stand nach und nimmt #6 mit.

- **Ein neuer Plan.** Am 29.09. hat Erwin das Ziel vom 17.09. wieder in Kraft
  gesetzt, am 16.10. neue Termine freigegeben: Meilenstein 1 am 23.10., 4 am 13.11.
  Er steht unter `meilensteinplanAktuell`. Der Plan vom 17.09. bleibt unter
  `meilensteinplan` stehen, markiert mit `ueberholt`, weil aus den Daten nichts
  verschwindet. Die Landing Page zeigt den neuen Plan mit der Grafik
  `TermineFigur`, `/stand/` die Einzelheiten und den alten Zeitplan eingeklappt.
- **Die öffentliche Seite ist zurückgestellt.** Am 29.09. ist die Wahl 9.4
  zurückgenommen: Die interne Seite liegt bei claude.ai, diese hier rückt hinter das
  Ende des Plans. Sie steht trotzdem öffentlich und zeigt alles. Eingetragen als
  Beobachtung `oeffentliche-seite-zurueckgestellt`. Am 16.10. hat Erwin
  entschieden: Pages zeigt weiter alles, `FREIGABE=alles` bleibt.
- **Der Reviewer ist abgenommen**, am 15.10. mit Vorbehalt. Die Abnahme enthält
  einen Sicherheitsbefund, der nur in der Ablage steht. Die Seite sagt nur, dass
  zwei Bedingungen offen sind.
- **Regel E13 ist die erste gemessene Regel**, 30 Fälle, kein Fehlalarm. Die
  Bewertungen stehen auf 139, davon 79 einzeln angesehen.
- **Drei Fehler im Zählen behoben:** Eine Laufnotiz mit Status „blockiert“ ist
  kein Prüflauf; Regelnotizen werden am Ordner `Regeln/` erkannt, nicht am Typ
  (den Typ `pruefregel` trägt auch der Alt-Neu-Marker); eine `vorlage` im
  Unternehmensteil ist ein Arbeitsstand, kein Maßstab der Academy.
- **Sechs neue Beobachtungen**, darunter: Gregor Dev steht nicht in der Ablage,
  die Fristen im Plan sind nicht umgeschrieben, die Ablage war vom 29.09. bis
  15.10. still, 11 statt 12 verbindliche Notizen.
- **Das Organigramm der Mannschaft** folgt dem Blatt vom 16.10.: Mensch und Team,
  Orchestrator, acht Rollen, Werkbank, Wissensschicht, das gemeinsame Band. Die
  Reihenfolge der Köpfe ist die des Blatts. Der Gestalter steht als `passtNicht`
  darin, weil das Blatt ihn nicht vorsieht; entfernt ist er nicht. Angaben zum
  Betrieb des KI-Rechners, Profilnamen, Versionen und das Modell stehen nicht
  darin.
- **`/stand/` zeigt die Zeichnungen.** Bis zum 16.10. stand dort keine außer dem
  eingeklappten Zeitplan. Jetzt hängt jede Zeichnung der Landing Page im passenden
  Abschnitt: Schichten, Wissen und Ablage, Ablauf und Steuerung, Prüfpunkte,
  Enabler, das Organigramm unter Übertragbarkeit, die Termine im Plan, die
  Systemlandschaft bei der Plattform. Die Anatomie aus dem Kopf der Landing Page
  fehlt, weil sie an das Scrollen gebunden ist.

**Nicht übernommen, weil es nicht öffentlich werden darf:** Rechnernamen,
Versionen, Dienste, Bots und Kennungen, die Werkzeuge der Researcherin, der
Befund zur Liste der zugelassenen Nutzer, Risiken zur Sicherheit des KI-Rechners,
die Entscheidungen zu Zugängen.

## Nachtrag 18.09.2026: Gregor Dev ist entschieden

Erwin hat am 18.09. eine neunte Rolle entschieden: **Gregor Dev**, Pfleger der
Seiten. Er traegt den Stand der oeffentlichen Seiten nach und baut auf Auftrag
weitere, weil mehr Landing Pages entstehen sollen. Er darf als Zweiter ins Netz,
begrenzt auf GitHub, bekommt ein eigenes Konto und stellt Pull Requests;
zusammengefuehrt wird von Erwin.

Eingetragen in den Daten: die Rolle, die Entscheidung mit Datum, ein Eintrag in
der Chronik und der offene Punkt 21, Konto, Akte und Grenze anzulegen.

- `ZUGANG-GREGOR-DEV.md`: Arbeitsplan fuer das Konto in acht Schritten, vom
  Maschinenkonto ueber den feingranularen Token bis zur taeglichen Aufgabe. Er
  enthaelt kein Geheimnis und soll auch keines aufnehmen.
- `AKTE-VORSCHLAG.md`: der Entwurf seiner Akte, jetzt auf seinen Namen und mit
  den Entscheidungen vom 18.09.

Wichtig fuer die naechste Sitzung: Der Riegel vor `main` fehlt noch. Solange
niemand ihn setzt, kann jedes Konto mit Schreibrecht direkt auf `main` pushen,
und jeder Push dorthin stellt die Seite ins Netz.

## Nachtrag 18.09.2026: der Durchgang ist harnessneutral

Die Arbeit des taeglichen Durchgangs steht in `scripts/stand-nachtragen.mjs`,
nicht mehr in der cmd-Datei. Aufruf: `npm run stand:nachtragen`, dazu
`--probelauf` und `--ohne-pr`. Das Skript ruft nur node, git und die GitHub-CLI,
laeuft also auch auf dem Rechner mit der Ablage und als Auftrag eines
KI-Mitarbeiters. Die cmd-Datei ruft nur noch diesen Befehl.

Acht Tests fahren den Ablauf gegen eine Werkbank, die Befehle nur aufschreibt.

`AKTE-VORSCHLAG.md` ist der Entwurf einer Akte fuer eine Rolle, die den Nachtrag
selbst uebernimmt: Auftrag, was sie nie tut, welche Werkzeuge ihre Grenze erlauben
muss, sechs Testfaelle und die fuenf Fragen, die vorher ein Mensch entscheidet.
Darunter die wichtigste: Der Nachtrag der Zahlen ist heute nicht knapp, das Lesen
und Urteilen ist es.

## Nachtrag 18.09.2026: der Stand stellt sich selbst als Pull Request

`scripts\stand-aktualisieren.cmd` pusht nicht mehr auf `main`. Es legt einen
Zweig `stand/JJJJ-MM-TT` an, committet nur `data/projektstand.json`, stellt einen
Pull Request und geht zurueck auf `main`. Vorher laufen `pruefe:bestand`,
`pruefe:daten` und `npm test`; schlaegt eines an, wird die Aenderung verworfen.
Der Durchgang laeuft nur auf `main` und nur bei sauberem Arbeitsverzeichnis.

Damit traegt sich der Stand taeglich selbst nach, und das Zusammenfuehren bleibt
bei einem Menschen. Eingerichtet wird das mit `schtasks`, siehe README. Gebraucht
wird dafuer die GitHub-CLI, einmal mit `gh auth login` angemeldet.

## Nachtrag 18.09.2026: der Plan hat Zieldaten

Am 17.09. sind zwölf Punkte des Arbeitsplans erledigt worden. Der Meilensteinplan
ist deshalb am 18.09. nachgezogen: Neben den Fristen stehen jetzt Zieldaten, M1 am
19.09. statt am 25.09., M2 am 26.09., M3 am 03.10., M4 am 10.10. Die Fristen
bleiben als äußere Grenze, die Reihenfolge ändert sich nicht.

Der Grund steht in den Daten: Der Plan rechnet die Zeit der Werkbank nicht mit und
nimmt an, dass Erwin selbst am KI-Rechner tippt. Nicht schneller werden die
Bewertungen, die Freigaben der Akten und alles, was von außen kommt. Für die
Abnahme von M1 fehlen die Probe über den Messenger, die Bewertung von Regel E13 an
30 Fällen und die Abnahme selbst; alle drei brauchen Erwin.

Ein Widerspruch steht als Beobachtung `m1-berichte-offen` in den Daten: Der
Nachtrag nennt den technischen Teil von M1 fertig, führt die Berichtsgeneratoren
aber unter dem, was noch vorzuziehen ist.

Die Ablage ist am 18.09. neu gezählt: 143 Notizen, 1.280 Verweise. Neue Prüfläufe
gibt es keine.

## Nachtrag 17.09.2026, abends: Graph und Rubriken der Ablage

Der Zweig `ablage/2026-09-17` baut auf `verbesserungen/2026-09-17` auf und
bringt einen dreizehnten Abschnitt „Ablage“ auf die Landing Page. Das Abbild ist
dorthin umgezogen, dazu kommen:

- **Der Graph der Ablage**, der Vault-Graph in einfacher Form: Bereiche als Kreise,
  Verbindungen ab zehn Verweisen als Linien, der meistverwiesene Bereich rot. Er
  rechnet nur mit `ablage.bereiche`, es wird nichts Neues gezählt.
- **Die Rubriken des Unternehmenswissens** mit einer kurzen Erklärung je Ordner,
  gruppiert nach der Stufe, in der ein KI-Mitarbeiter sie liest. Die Texte stehen
  unter `unternehmenswissen`, die Anzahlen zählt `abbild-vault.mjs` mit.
- Die Zählung vom 17.09. abends ist eingetragen: 141 Notizen, 1.267 Verweise.

Wer die Ordnertabelle im Einstieg von KI-Mitarbeiter ändert, zieht
`unternehmenswissen.rubriken` von Hand nach. Das Skript meldet Ordner ohne
Eintrag, legt aber keine an.

## Nachtrag 17.09.2026, nachmittags: acht Verbesserungen

Der Zweig `stand/2026-09-17` steht als Pull Request #1 gegen `main`. Darauf
baut der Zweig `verbesserungen/2026-09-17` auf, je Verbesserung ein Commit. Sein
Pull Request zielt auf `stand/2026-09-17`, damit er nur die Verbesserungen zeigt.
Wird #1 zusammengeführt, stellt GitHub ihn auf `main` um.

- **Tote Links behoben.** `/stand/` und `/` in Kopf- und Fußleiste hatten keinen
  `basePath` und führten auf Pages auf eine 404. Alle internen Links gehen jetzt
  über `lib/pfad.ts`.
- **Leser:** zwölf Abschnitte statt neunzehn, „Auf einen Blick“ unter dem Hero.
  Stufen und die Einzelheiten des Meilensteinplans stehen unter `/stand/`.
- **Barrierefreiheit:** Aussagen sind Überschriften, keine Figurenschrift unter
  10,5 außer den Tageszahlen, breite Figuren sind mit der Tastatur verschiebbar,
  das Abbild der Ablage gibt es auch als Tabelle.
- **Recht:** `/impressum/` und `/datenschutz/` als gekennzeichnete Entwürfe,
  gespeist aus `gesellschaften` und dem neuen Block `recht`.
- **Sicherheit:** `pruefe:daten` sucht heikle Angaben im ganzen Repository, als
  erster Schritt in der CI.
- **Aktualität:** Der Export führt zusammen, statt zu ersetzen, und liest
  `hinweis` und `bewertet`. `pruefe:aktualitaet` sagt, ob die Ablage weiter ist
  als die Seite. `stand-aktualisieren.cmd` prüft vor dem Commit.
- **Redaktion:** Die 26 heißt jetzt Prüfpunkte, nicht Regeln; die Rollen tragen
  ihre Namen Fritz, Hermes und julia-trend.
- **Zielgruppe:** Vorschau für geteilte Links mit eigenem Bild, Seitentitel je
  Seite. `noindex` bleibt, der Grund steht im Code.
- **Qualität:** `pruefe:ausgabe` und `pruefe:figuren` prüfen die gebaute Seite.
  Die erste hat vier Fehler gefunden, die behoben sind. Die zweite braucht
  `playwright-core` und einen installierten Chrome oder Edge.

**Was ein Mensch entscheiden muss, bevor das auf `main` geht:**

- Impressum und Datenschutz rechtlich prüfen lassen. Was fehlt, steht auf beiden
  Seiten unten. Erst danach `recht.geprueft` auf `true` setzen.
- Ob die Pflichtangabe des Geschäftsführers mit 9.8 zusammengeht. Als
  Beobachtung `impressum-personen` eingetragen.
- Adressat und Schluss der Landing Page bleiben offen. Die Seite spricht
  niemanden an, nur die Datenschutzseite siezt.
- `stand-aktualisieren.cmd` pusht auf den ausgecheckten Zweig. Steht dort
  `main`, geht jeder neue Stand ohne Pull Request auf Pages.

## Nachtrag 17.09.2026: nach dem ersten Stand-Update

**Erledigt:** `main` ist auf GitHub, Pages steht auf GitHub Actions, und die
öffentliche Fassung liegt unter <https://wamocon.github.io/kiKollege/>.
Das Repository ist **öffentlich**, nicht privat, wie der Abschnitt unten annimmt.
Damit ist der ganze Quelltext lesbar, auch was in den Daten als `intern` markiert
ist. Das war eine bewusste Entscheidung beim ersten Push. Für jeden neuen Eintrag
gilt deshalb: Was auch intern nicht öffentlich werden darf, kommt gar nicht in die
Daten. Das betrifft Sicherheitsbefunde, Rechnernamen, Adressen, Ports, Versionen
und Datenwege, und ebenso Einträge, die erst zusammen mit anderen Angaben einen
Sicherheitshinweis ergeben. Einige Entscheidungen aus dem Logbuch fehlen deshalb
mit Absicht, und nicht jeder entschiedene offene Punkt ist als entschieden
markiert. Welche das sind, steht im Vault, nicht hier.

**Der Zweig `stand/2026-09-17`** zieht die Seite auf den 17.09. nach, aus dem Vault
unter `D:\WAMOCON`: Logbuch vom 11., 12., 16. und 17.09., Tagesprotokolle bis
17.09., die Meilensteinpläne vom 11. und 17.09., Bestandsaufnahme vom 16.09.,
Systemarchitektur, Akte des Reviewers, Laufnotizen, Quoten je Regel. Dazu kamen
Dinge, die über das Nachtragen hinausgehen:

- **Das Abbild der Ablage** auf der Landing Page, Abschnitt Wissen, gezählt von
  `scripts/abbild-vault.mjs`.
- **Die Systemlandschaft** als eigener Abschnitt, mit Ist und Soll. Nach Erwins
  Entscheidung vom 17.09. stehen Claude Code, Hermes Agent und DGX Spark auch
  öffentlich darin; die Eigennamenliste der Prüfung ist entsprechend gekürzt.
  Der Stand der eigenen Hardware ist der vom 11.09., von Erwin am 17.09. als
  unverändert bestätigt.
- **Der Meilensteinplan** vom 17.09. als eigener Abschnitt „Meilensteine“: Ziel,
  vier Meilensteine mit Abnahme, Zeitplan als Figur, Erwins Zeit je Woche,
  Entscheidungen mit Frist, kritischer Pfad, was nicht passt, Risiken. Er ist als
  Entwurf gekennzeichnet. Was Zugänge, Grenzen einzelner Profile, Dienste und
  Datenwege betrifft, steht nur im Vault; die Seite sagt, dass es fehlt. Ändert
  sich der Plan, wird `meilensteinplan` in den Daten nachgezogen.
- **Ein Leck ist geschlossen.** `StandAlter` hat als Client-Komponente den ganzen
  Datensatz ins JavaScript der öffentlichen Seite gezogen, das Interne
  eingeschlossen. Die Freigabeprüfung liest jetzt auch JavaScript und
  RSC-Dateien. Seit der nächsten Entscheidung ist das für Pages ohne Belang, für
  die öffentliche Fassung bleibt es richtig.
- **Pages zeigt alles.** Erwin hat am 17.09. entschieden, vorerst keinen
  Unterschied zwischen intern und öffentlich zu machen. Pages baut deshalb
  `FREIGABE=alles`: alle Inhalte, ohne „nur intern“-Markierung, mit `noindex`.
  Die Felder `freigabe` und die öffentliche Fassung samt Prüfung bleiben, damit
  die Trennung mit einer Zeile zurückkommt.
- **Der Datumstest** hing an der Zeitzone des Rechners. Er rechnet jetzt in
  Ortszeit und besteht überall.

**Was ein Mensch entscheiden muss**, steht im Pull Request. Die wichtigsten Punkte:

- Die Übergabe vom 11.09. und die Wahl 9.4 vom 17.09. sehen auf Pages nur einen
  Auszug im Umfang dieser Übergabe vor. Mit „Pages zeigt alles“ steht dort jetzt
  mehr, darunter Entscheidungen zu Datenwegen, Pfade, Termine und die Beobachtungen.
  Das Logbuch sollte die neue Entscheidung nachziehen.
- Aus der Wahl 9.4 folgt laut Logbuch, dass auf der Seite keine Personen
  erscheinen (9.8). Die Seite nennt Erwin Moretz als Zuständigen für die Pflege,
  die Geschäftsführung bei den Gesellschaften und Erwin in mehreren Einträgen.
- Der Plan vom 17.09. sieht für die Seite „nur Rollen, die laufen“ vor. Die Seite
  zeigt alle acht Rollen, die nicht gebauten als „entschieden“.

- **Zwei Historien, ein Repository.** Das Repository `KFBM/reviewer` führt
  `Wamocon/kiKollege` als `origin`. Sein `main` verfolgt `dgx`, passiert ist nichts.
  Ein Push aus `reviewer/` nach `origin` würde aber interne Prüfdaten in dieses
  öffentliche Repository schreiben. Der Remote gehört umbenannt oder entfernt,
  bevor jemand dort pusht (Arbeitsplan vom 17.09., Punkt 2 und 35).
- Der Arbeitsplan vom 17.09. sieht für diese Seite „vorher kein Push und kein
  Pages, bis 14.10.“ vor. Die Seite ist seit dem 17.09. online; der Plan kennt das
  noch nicht.

Wer den Stand das nächste Mal nachzieht, gleicht das Logbuch gegen die Daten ab
und prüft jede fehlende Entscheidung, bevor er sie nachträgt: Sie kann mit Absicht
fehlen, siehe oben.

**Der Export war nicht einsatzbereit** und ist es seit dem Zweig
`verbesserungen/2026-09-17`: Er liest `hinweis`, führt zusammen und sucht die
Laufnotizen unter `D:\WAMOCON\KFBM`. Einzelheiten in der README, Abschnitt
„Woher die Zahlen kommen“. Eine Aufgabenplanung, die noch den alten Pfad
übergibt, bitte auf `D:\WAMOCON\KFBM` umstellen.

**Nicht mehr offen** aus der Liste unten: Punkt 4, die Vault-Pfade, ist geklärt,
siehe oben.

## Die Lage

Das Repository `Wamocon/kiKollege` auf GitHub war bis zu dieser Übergabe **leer**:
kein Commit, kein Zweig. Die gesamte Arbeit entstand in einer Sitzung ohne
Schreibzugang auf GitHub und wurde als Git-Bundle übergeben: 13 Commits auf dem
Zweig `main`.

Zeigt `git remote show origin` einen Zweig `main`, ist der Push gelungen und
dieser Abschnitt ist erledigt.

## Das Erste

1. `git push -u origin main`
2. In den Repository-Einstellungen: **Settings → Pages → Source: GitHub Actions**
3. Nachsehen, ob der Lauf „Veröffentlichen" grün wird und die Seite unter
   `https://wamocon.github.io/kiKollege/` steht

Was dort landet, ist die **öffentliche** Fassung, nicht die interne. Pages ist bei
einem privaten Repository ohne Enterprise-Tarif öffentlich lesbar. Der Workflow
baut deshalb `FREIGABE=oeffentlich` und bricht ab, wenn die Freigabeprüfung etwas
Internes findet.

## Was es gibt

| Was | Wo |
| --- | --- |
| Landing Page, 13 Abschnitte, 12 in der öffentlichen Fassung | `app/page.tsx` |
| Dichte Zweitseite, 17 Abschnitte | `app/stand/page.tsx` |
| Impressum und Datenschutz, Entwürfe | `app/impressum/`, `app/datenschutz/` |
| Alle Zahlen, einzige Quelle | `data/projektstand.json` |
| Vault-Export | `scripts/export-vault.mjs` |
| Abbild der Ablage | `scripts/abbild-vault.mjs` |
| Freigabeprüfung | `scripts/pruefe-oeffentlich.mjs` |
| Bestandsprüfung | `scripts/pruefe-bestand.mjs` |
| Heikle Angaben im Repository | `scripts/pruefe-daten.mjs` |
| Rückstand gegenüber der Ablage | `scripts/pruefe-aktualitaet.mjs` |
| Links, Gliederung, Satzzeichen | `scripts/pruefe-ausgabe.mjs` |
| Figuren und Handybreite im Browser | `scripts/pruefe-figuren.mjs` |
| Ein Durchgang für die Aufgabenplanung | `scripts/stand-aktualisieren.cmd` |
| Auftrag des Standwächters | `.claude/skills/standwaechter/SKILL.md` |
| Bauen und prüfen | `.github/workflows/pruefen.yml` |
| Auf Pages stellen | `.github/workflows/veroeffentlichen.yml` |

Die Vorschau der internen Fassung liegt als Artefakt:
<https://claude.ai/code/artifact/93e22b40-9bfd-479d-a4ca-ca0dfd684c0e>

**Es gibt schon eine Routine**, die den Standwächter montags und donnerstags
weckt: `trig_01HRv1F9xzLx8xXqziPmRFNM`. Keine zweite anlegen. Wer die Zeiten
ändern will, ändert diese.

## Was nicht gelöscht werden darf

Das ist die Auflage dieser Übergabe, und sie gilt für jede Sitzung und für den
Standwächter gleichermaßen: **Ändern ist erlaubt, entfernen nicht.**

- **Nichts aus `data/projektstand.json`.** `npm run pruefe:bestand -- --alt <alter
  Stand>` schlägt an, sobald ein Schlüssel fehlt, eine Liste kürzer wird, ein
  Eintrag mit Kennung verschwindet oder ein Satz geleert wird. Bei jedem Pull
  Request läuft diese Prüfung gegen den Zielzweig.
- **Die Beobachtungen.** Sie halten Widersprüche zwischen den Quellen fest, am
  17.09. sind es sechzehn: angefangen mit den drei Zahlen für die Normbasis, 63
  gegen 64 Befunde und zehn gegen elf Themenkomplexe, zuletzt die 26 als Regeln
  oder Prüfpunkte und die Person im Impressum. Sie werden nicht aufgelöst,
  solange die Quellen sich widersprechen.
- **Die Freigaben.** Jedes Datenelement trägt `intern` oder `oeffentlich`. Nichts
  wandert von selbst nach öffentlich.
- **Die Eigennamenliste** am Kopf von `scripts/pruefe-oeffentlich.mjs`. Sie wird
  nicht gekürzt, um eine Prüfung grün zu bekommen.

## Woher die Zahlen kommen

Fünf Quellen, alle in `herkunft.quellen` verzeichnet: das Übergabedokument vom
05.09., die Einführung vom 04.09., das CI-Profil 1.0 vom 18.08. sowie die beiden
Blätter vom 09.09. (Systemarchitektur Orchestrator, Organigramm KI-Mitarbeiter).

Die laufende Quelle ist der Obsidian-Vault unter `D:\WAMOCON`. Die Laufnotizen
liegen unter `D:\WAMOCON\KFBM`; ein Probelauf dort erkennt am 17.09. 20 Läufe und
ändert keinen:

```bash
npm run export:vault -- --vault "D:\WAMOCON\KFBM" --probelauf
npm run pruefe:aktualitaet -- --ablage "D:\WAMOCON"
```

## Was offen ist

1. **Adressat und Schluss der Seite.** Vertagt. Die Landing Page hat deshalb
   keinen Schlussabschnitt und keine Anrede.
2. **`/stand` nachziehen.** Am 17.09. nachgezogen, mit Stufen und dem
   Meilensteinplan im Einzelnen. Das Organigramm steht seit dem 16.10. unter
   Übertragbarkeit, seine Daten folgen dem Organigramm vom 19.10.
3. **Kürzen.** Am 17.09. von neunzehn auf zwölf Abschnitte gekürzt, ohne Inhalt
   zu verlieren: Was wegfiel, steht unter `/stand/`. Am Abend kam die Ablage als
   dreizehnter dazu. Ob das so bleibt,
   entscheidet ein Mensch.
4. **Die Vault-Pfade.** Geklärt, siehe oben.
5. **Ob die Sitzungen, die eine Routine startet, einen Pull Request öffnen
   können.** Sie bekommen laut Warnung keine Connector-Werkzeuge. Zeigt sich beim
   ersten Lauf, der etwas zu melden hat.
6. **Impressum und Datenschutz** rechtlich prüfen lassen, bevor sie auf `main`
   gehen.

## Konventionen, die nicht verhandelbar sind

- **Keine Zahl in der Prosa im Code.** Alles Zählbare steht in den Daten und wird
  von dort gerendert. Das ist der Grund, warum die Seite altern kann, ohne falsch
  zu werden.
- **Rot 600 trägt keinen Kleintext.** Für kleinen roten Text gilt Rot 700
  (`--wmc-primary-text`), auf dunklem Grund Rot 300. So steht es im CI-Profil,
  Block 10, und das Blatt widerspricht sich in diesem Punkt selbst.
- **Das Logo** ist mindestens 120 px breit, mit `box-sizing: content-box`, damit
  der Schutzraum nicht gegen das Mindestmaß zählt, und steht nur auf Weiß,
  Ink 950 oder Rot 600.
- **Deutsche Texte** folgen den Schreibregeln des `vermenschlichen`-Skills: keine
  Werbesprache, keine Gedankenstrich-Häufung, keine Fazit-Abschnitte.
- **`text-transform: uppercase` zerstört das ß.** Maßstab wird zu MASSSTAB. In
  Feldern, die das CSS in Großbuchstaben setzt, steht deshalb kein ß.
- **Widersprüche bleiben stehen.** Die Seite darf keine Vermutung als Befund
  ausgeben.
