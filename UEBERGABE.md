# Übergabe

Diese Datei ist für die nächste Sitzung geschrieben, nicht für die Nachwelt. Sie
sagt, wo das Vorhaben steht, was als Erstes zu tun ist und was dabei nicht
verloren gehen darf.

Stand dieser Übergabe: 17.09.2026, nachgetragen am selben Tag nach dem ersten
Stand-Update.

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

Wer den Stand das nächste Mal nachzieht, gleicht das Logbuch gegen die Daten ab
und prüft jede fehlende Entscheidung, bevor er sie nachträgt: Sie kann mit Absicht
fehlen, siehe oben.

**Der Export ist nicht einsatzbereit.** Die Laufnotizen liegen unter
`D:\WAMOCON\KFBM\00_Vault\10_KI-Mitarbeiter\Prüfläufe\`, die Notizen schreiben
`hinweis` statt `hinweise`, und der Export ersetzt die Liste der Läufe, statt sie
zusammenzuführen. Einzelheiten in der README, Abschnitt „Woher die Zahlen
kommen“. Bis das behoben ist, läuft `stand-aktualisieren.cmd` weiter gegen den
alten Pfad und findet dort keine Läufe. Den Pfad bitte erst umstellen, wenn der
Export zusammenführt.

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
| Landing Page, 17 Abschnitte intern, 15 öffentlich | `app/page.tsx` |
| Dichte Zweitseite | `app/stand/page.tsx` |
| Alle Zahlen, einzige Quelle | `data/projektstand.json` |
| Vault-Export | `scripts/export-vault.mjs` |
| Freigabeprüfung | `scripts/pruefe-oeffentlich.mjs` |
| Bestandsprüfung | `scripts/pruefe-bestand.mjs` |
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
- **Die Beobachtungen.** Sechs Einträge halten Widersprüche zwischen den Quellen
  fest: die drei Zahlen für die Normbasis, 63 gegen 64 Befunde, zehn gegen elf
  Themenkomplexe, der Widerspruch im CI-Blatt, siebzehn Laufnotizen gegen den
  letzten datierten Lauf, und die entfallene Begründung für die eigene Hardware.
  Sie werden nicht aufgelöst, solange die Quellen sich widersprechen.
- **Die Freigaben.** Jedes Datenelement trägt `intern` oder `oeffentlich`. Nichts
  wandert von selbst nach öffentlich.
- **Die Eigennamenliste** am Kopf von `scripts/pruefe-oeffentlich.mjs`. Sie wird
  nicht gekürzt, um eine Prüfung grün zu bekommen.

## Woher die Zahlen kommen

Fünf Quellen, alle in `herkunft.quellen` verzeichnet: das Übergabedokument vom
05.09., die Einführung vom 04.09., das CI-Profil 1.0 vom 18.08. sowie die beiden
Blätter vom 09.09. (Systemarchitektur Orchestrator, Organigramm KI-Mitarbeiter).

Die laufende Quelle ist der Obsidian-Vault. Der Pfad, den Erwin genannt hat, ist
`D:\WAMOCON\KI-Mitarbeiter`. **Er wurde nie gegen einen echten Vault geprüft.**
Ein Probelauf zeigt in vier Zeilen, ob die Ordner und Dateinamen stimmen:

```bash
npm run export:vault -- --vault "D:\WAMOCON\KI-Mitarbeiter" --probelauf
```

## Was offen ist

1. **Adressat und Schluss der Seite.** Vertagt. Die Seite hat deshalb keinen
   Schlussabschnitt und keine Anrede.
2. **`/stand` nachziehen.** Die Zweitseite steht auf dem 05.09. und nennt Fritz,
   wo inzwischen Rollen stehen. Das Organigramm fehlt ihr.
3. **Kürzen.** Siebzehn Abschnitte sind viel. Kürzen heißt entscheiden, was
   wegfällt, und das entscheidet ein Mensch.
4. **Die Vault-Pfade** aus Punkt oben.
5. **Ob die Sitzungen, die eine Routine startet, einen Pull Request öffnen
   können.** Sie bekommen laut Warnung keine Connector-Werkzeuge. Zeigt sich beim
   ersten Lauf, der etwas zu melden hat.

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
