# Übergabe

Diese Datei ist für die nächste Sitzung geschrieben, nicht für die Nachwelt. Sie
sagt, wo das Vorhaben steht, was als Erstes zu tun ist und was dabei nicht
verloren gehen darf.

Stand dieser Übergabe: 18.09.2026.

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
   Meilensteinplan im Einzelnen. Das Organigramm fehlt ihr weiter.
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
