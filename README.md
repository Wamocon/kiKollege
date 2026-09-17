# kiKollege

Zwei Seiten zum Vorhaben KI-Mitarbeiter der WAMOCON GmbH, gespeist aus derselben
Datenquelle.

| Route | Was sie ist |
|---|---|
| `/` | Landing Page. Erzählt das Vorhaben vom Hero bis zu den offenen Punkten. |
| `/stand/` | Dichte Standseite mit Ankernavigation, allen Tabellen und Prüfläufen. |

Drei Quellen liegen zugrunde, alle aus dem Arbeitsordner `D:\KFBM`, den das
Übergabedokument nennt:

| Quelle | Was daraus kommt |
|---|---|
| KI-Mitarbeiter — Einführung, 04.09.2026 | Die Argumentation der Landing Page: Abgrenzung zum Chatbot, Eignungskriterien, die acht Fragen mit Dateizuordnung, die zwei Wissensablagen, der Durchlauf, die Steuerung, die drei Stufen |
| Übergabedokument, 05.09.2026 | Kennzahlen der Prüfläufe, Entscheidungen mit Datum, offene Punkte, die Angaben zu beiden Gesellschaften |
| CI-Profil Version 1.0, 18.08.2026 | Farben, Skalen, Kontrastregeln, Typografie, Logoregeln, Leistungslinien, Anredeform |

Wo die Quellen sich widersprechen, steht der Widerspruch im Abschnitt „Abgleich" der
internen Fassung, statt beim Übertragen geglättet zu werden.

## Die Gestaltung der Landing Page

Das Vorbild war der Auftritt von Nous Research. Die Seite selbst war beim Bauen nicht
erreichbar, der Netzzugang dieser Umgebung lässt nur Paket-Registries durch. Gebaut ist
deshalb die Gestaltungssprache, die mit diesem Vorbild verbunden ist, und nicht ein
Abbild davon:

- Monospace trägt Labels, Metadaten, Abschnittsindizes und Datumsangaben. Fließtext und
  Überschriften bleiben bei Inter.
- Haarlinien bilden ein sichtbares Raster. Abschnitte, Zellen und Spezifikationszeilen
  sitzen in einer Struktur wie in einer technischen Zeichnung.
- Aussagen stehen sehr groß und eng, Abschnitte haben viel Luft.
- Rot erscheint selten. Auf der ganzen Seite trägt es die Abschnittsindizes, die beiden
  tragenden Schichten und den Strich unter der einen Zahl, um die es geht.

## Was bewusst nicht gemacht ist

Der Skill `anthropics/skills@frontend-design` führt eine Liste von Mustern, die
unabhängig vom Thema auftauchen und deshalb als Voreinstellung statt als
Entscheidung lesen. Drei davon standen hier drin und sind raus:

- **Einblenden beim Scrollen auf jedem Block.** Das gab es an 68 Stellen. Bewegung
  gibt es jetzt an genau einer: dem Hero. Nebeneffekt: Im Ruhezustand steht alles
  da, statt auf einen Beobachter zu warten.
- **Großbuchstaben auf jedem Label.** Sie bleiben, wo sie strukturell tragen: Marke,
  Tabellenköpfe, Navigationsschiene, Statusabzeichen. Überall sonst sind sie weg.
  Im Deutschen kommt ein handfester Grund dazu: `text-transform: uppercase` macht
  aus „Maßstab" ein „MASSSTAB" und aus „Schließen" ein „SCHLIESSEN".
- **Mittelpunkte als Bindeglied** („A · B · C") und **Label mit Gedankenstrich**
  („Wissen — was gilt"). Beide durch Kommas, eigene Elemente oder schlichte
  Überschriften ersetzt.

Was aus der Liste stehen bleibt, steht auf Ansage: die Monospace für Labels und das
Haarlinien-Raster sind die gewünschte Richtung, das warme Schwarz #140B0B steht so
im CI-Blatt, und die Abschnittsnummern spiegeln die Blocknummerierung der
Einführung.

Zwei Abweichungen vom CI-Blatt sind bewusst:

**Monospace** kommt im CI-Blatt nicht vor. Block 08 legt nur die neogroteske Sans für
Überschrift und Fließtext fest. Die Monospace ist eine Ergänzung für Labels und Zahlen,
kein Ersatz.

**Die weiße Grundfläche** bleibt die Voreinstellung, weil Block 01 sie als Grundfläche
aller Medien mit rund 60 Prozent Anteil setzt. Die dunkle Fassung steht gleichwertig
daneben und lässt sich über den Schalter in der Kopfleiste wählen. Wer die Seite
dunkel-zuerst will, dreht in `app/globals.css` die beiden Token-Blöcke um.

## Starten

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # statischer Export nach out/
npm test             # Tests der Skripte
```

Der Build erzeugt einen statischen Export ohne Server. Zum Ansehen des Ergebnisses
braucht es einen kleinen Webserver, weil die Seite absolute Pfade nutzt:

```bash
npx serve out
```

## Navigation

Sechzehn Abschnitte brauchen eine. Sie besteht aus drei Teilen, alle in
`components/landing/Navigation.tsx`:

- **Die Schiene** am linken Rand, ab 1240 px. Sie listet alle Abschnitte und
  markiert den aktuellen. Auf breiten Bildschirmen übernimmt sie die Rolle des
  Abschnittsindex, der dort ausgeblendet wird.
- **Das Verzeichnis**, das sich aus der Kopfleiste aufklappt. Es trägt auf jeder
  Breite und ist unterhalb von 1240 px der einzige Weg zum Springen.
- **Die Fortschrittslinie** an der Unterkante der Kopfleiste.

Welcher Abschnitt gerade gilt, bestimmt ein IntersectionObserver mit einem Band
zwischen 20 und 30 Prozent der Fensterhöhe, nicht eine Scroll-Rechnung. Bei
mehreren Treffern gewinnt der oberste, damit die Marke beim Zurückscrollen nicht
springt.

Die Kopfleiste ist deckend und nicht weichgezeichnet. `backdrop-filter` macht ein
Element zum Bezugsrahmen für `position: fixed` — die Schiene hing damit in einer
52 Pixel hohen Box statt am Fenster.

## Der Hero

Die Zeichnung zeigt, was aus einem Sprachmodell einen Mitarbeiter macht: Auftrag
und Grenze, Maßstab, Gedächtnis, Aufsicht. Beim Scrollen tritt eines nach dem
anderen hervor, die Erklärung darunter wechselt mit.

Die Bahn (`.lp-bahn`) gibt den Scrollweg her, der Halt darin bleibt stehen. Beides
hängt an der Klasse `js`:

- **Ohne JavaScript** entfällt der Scrollweg. Die Zeichnung steht einmal da, alle
  vier Teile gleich hell, alle vier Erklärungen untereinander.
- **Bei `prefers-reduced-motion`** gilt dasselbe, zusätzlich ohne Übergänge.

So ist im Ruhezustand alles lesbar, was gelesen werden soll. Nichts wartet auf
einen Beobachter.

## Der Themenschalter

Die Kopfleiste schaltet zwischen System, Hell und Dunkel. Die Wahl liegt in
`localStorage` und wird von einem kurzen Skript im `<head>` gesetzt, bevor der Browser
das erste Mal zeichnet, sonst blitzt die falsche Fassung auf. Ohne Wahl gilt die
Systemeinstellung.

Dasselbe Skript setzt die Klasse `js` auf das Dokument. Die Einblend-Animation beim
Scrollen startet nur unter dieser Klasse unsichtbar, damit ohne JavaScript kein Inhalt
verborgen bleibt.

## Die Figuren

Fünf Zeichnungen, alle aus `data/projektstand.json` gespeist und in
`components/figuren/`. Sie sind eigene SVG in den CI-Farben, keine Kopien der
Vorlagen aus der Einführung. Farben kommen aus den Tokens, damit sie in beiden Themen
mitwandern; Rot trägt in jeder Figur genau ein Element, nämlich das, worum es geht.

Weil die Beschriftungen eine feste Größe im `viewBox` haben, behalten die Zeichnungen
eine Mindestbreite von 880 px und scrollen darunter waagerecht im eigenen Kasten. Ohne
das wäre die Beschriftung auf Handybreite unleserlich.

- **Durchlauf** — die beiden Prüfstufen und der gestrichelte Rückweg, über den aus einer
  Bewertung eine schärfere Regel wird.
- **Prüfpunkte** — wie die 26 Zeilen der Checkliste zwischen Skript und Mensch
  aufgeteilt sind, mit dem Satz, dass die Freigabe in keiner davon steht.
- **Wissensablagen** — warum es zwei braucht und welche davon alle teilen.
- **Steuerung** — wer ihn anstößt, was er an Helfer abgibt, wie eine Übergabe an einen
  zweiten läuft.
- **Enabler-Feld** — der geprüfte Bestand, eine Zelle je Enabler.
- **Schichtenstapel** — die acht Schichten in vier Gruppen, mit der Dateizuordnung
  und der Markierung, welche Gruppen ein zweiter KI-Mitarbeiter erbt. Rot trägt
  hier die eine Gruppe, die neu zu bauen ist.
- **Anatomie** — die Zeichnung im Hero, die einzige mit Scrollbindung.

Dazu zwei Entscheidungen zur Darstellung:

**Das Enabler-Feld** im Hero hat eine Zelle je Enabler, gefüllt heißt vollständig
ausgestattet. Die Zellen stehen in fester Reihenfolge, gefüllte zuerst. Eine gestreute
Anordnung würde eine Verteilung über die Themenkomplexe behaupten, die nicht gemessen
ist.

**Die Null** im Abschnitt zur Messlücke ist die einzige Hero-Zahl der Seite. Ein Balken
mit Nullfüllung wäre ein Ein-Balken-Diagramm; die Zahl ist hier die Figur.

## Zwei Fassungen aus einer Quelle

Jedes Datenelement in `data/projektstand.json` trägt ein Feld `freigabe`, das
`intern` oder `oeffentlich` sein kann. Das setzt um, was das Übergabedokument
empfiehlt: Die Grenze zwischen internem und öffentlichem Inhalt ist eine Eigenschaft
der Notiz und keine Erinnerungsleistung.

```bash
npm run build                    # interne Fassung, zeigt alles
FREIGABE=oeffentlich npm run build   # öffentliche Fassung
```

Die öffentliche Fassung lässt auf der Landing Page die Abschnitte zum Betrieb und zum
Abgleich weg, auf der Standseite zusätzlich die Quellen. Dazu entfallen auf beiden
Seiten die internen Entscheidungen, die Befunddichte je Themenkomplex und alle
Pfadangaben. Die Abschnittsnummern der Landing Page rücken nach, damit die Zählung
keine Lücke zeigt. Was ohne Angabe bleibt, gilt als öffentlich, damit die Datenpflege
nicht stillschweigend Inhalt verliert.

Die interne Fassung setzt zusätzlich `robots: noindex`.

## Woher die Zahlen kommen

Die Prosa im Code enthält keine Zahlen. Alles Zählbare steht in
`data/projektstand.json` und wird von dort gerendert. Das ist der Grund, warum die
Seite altern kann, ohne falsch zu werden.

`scripts/export-vault.mjs` schreibt diese Datei aus dem Vault fort:

```bash
npm run export:vault -- --vault "D:\WAMOCON\KI-Mitarbeiter" --probelauf   # nur anzeigen
npm run export:vault -- --vault "D:\WAMOCON\KI-Mitarbeiter"               # schreiben
```

Das Skript liest das Frontmatter der Laufnotizen (`geprueft`, `blocker`, `major`,
`minor`, `enabler`, `stand` und einige weitere), die Entscheidungstabelle und die
Liste der offenen Punkte. Es ersetzt nur diese Abschnitte; Begriffe, Maßstab,
Übertragbarkeit und alles andere von Hand Geschriebene bleibt stehen. Ein bereits
gesetztes `freigabe` wird übernommen.

Den Ordner mit den Laufnotizen sucht das Skript, statt ihn vorauszusetzen: erst die
aus dem Übergabedokument bekannten Lagen (`00_Vault/10_KI-Mitarbeiter` und
Ähnliches), dann den angegebenen Ordner selbst, dann bis drei Ebenen tief nach einem
Ordner, der KI-Mitarbeiter heißt. `--vault` darf deshalb auf den Vault oder gleich
auf den Notizordner zeigen. Der Probelauf schreibt nichts und sagt, was er gefunden
hat:

```
Gefunden
  Vault            D:\WAMOCON\KI-Mitarbeiter
  Notizordner      D:\WAMOCON\KI-Mitarbeiter
  Entscheidungen   D:\WAMOCON\KI-Mitarbeiter\Entscheidungen.md
  Offene Punkte    nicht gefunden, bisheriger Stand bleibt
```

Fehlt eine Zeile, heißt die Datei im Vault anders. Weitere Namen trägt man in
`ORTE` am Kopf des Skripts nach.

## Der Stand aktualisiert sich nicht von selbst

Der Vault liegt auf einem Rechner im Haus, das Repository liegt bei GitHub. Der
Export läuft also dort, wo der Vault liegt, und schiebt nur `data/projektstand.json`
weiter — Notizen, Testfälle und Ausbildungsunterlagen bleiben liegen. Ein Durchgang
steht als Windows-Skript bereit:

```bat
scripts\stand-aktualisieren.cmd "D:\WAMOCON\KI-Mitarbeiter"
```

Es exportiert, prüft ob sich etwas geändert hat, und committet und pusht nur dann.
Für den regelmäßigen Teil hängt man es in die Aufgabenplanung, hier täglich um sieben:

```bat
schtasks /create /tn "KI-Mitarbeiter Stand" /tr "\"C:\Pfad\zum\kiKollege\scripts\stand-aktualisieren.cmd\" \"D:\WAMOCON\KI-Mitarbeiter\"" /sc daily /st 07:00
```

Voraussetzungen: Node und Git auf dem Rechner, ein Klon des Repositories, eine
Push-Berechtigung für den angemeldeten Benutzer und ein Branch mit Upstream.

Solange das nicht läuft, altert die Seite still. Deshalb weist sie ihr eigenes
Alter aus: neben dem Stand steht, wie alt die Zahlen sind, und überschreiten sie
`herkunft.fristTage`, wird die Angabe rot und der Fußbereich sagt, wann zuletzt
fortgeschrieben wurde. Gerechnet wird das im Browser gegen die Uhr des Lesers,
nicht beim Bauen — sonst hinge "heute" am Tag des Builds und die Seite behauptete
eine Frische, die sie nicht hat. Ohne JavaScript bleibt es beim Datum, das immer
stimmt. Die Formulierungen liegen in `lib/alter.ts`, geprüft in
`lib/alter.test.mjs`.

## Was der Build prüft

`.github/workflows/pruefen.yml` baut bei jedem Push beide Fassungen und lässt
`npm run pruefe:oeffentlich` über die öffentliche laufen. Die Prüfung pflegt keine
Wortliste, sondern zieht aus `data/projektstand.json` jeden Text aus einem Objekt
mit `freigabe: "intern"` und sucht ihn in den erzeugten HTML-Dateien. Findet sie
etwas, schlägt der Lauf fehl. Gegen die interne Fassung meldet sie 42 Stellen,
gegen die öffentliche keine — damit belegt sie, dass die Grenze im Build
tatsächlich greift und nicht nur im Datenmodell steht.

`.github/workflows/veroeffentlichen.yml` stellt die öffentliche Fassung auf GitHub
Pages: bei jedem Push auf `main` und zusätzlich von Hand, jeweils erst nach
derselben Prüfung. In den Repository-Einstellungen muss Pages dazu auf
"GitHub Actions" stehen.

Was dort landet, ist immer die öffentliche Fassung. Pages ist bei einem privaten
Repository ohne Enterprise-Tarif öffentlich lesbar, und die interne Fassung nennt
Hersteller, Modelle, Pfade und Termine. Der Workflow baut deshalb ausdrücklich
`FREIGABE=oeffentlich` und bricht ab, wenn die Prüfung etwas Internes findet.

Die Auswertung des Vaults ist durch `scripts/export-vault.test.mjs` gegen drei
Fixture-Vaults abgedeckt, die Prüfung durch `scripts/pruefe-oeffentlich.test.mjs`.
`npm test` läuft über beide.

## Der Standwächter

Die Seite zieht sich nicht selbst nach. Das tut ein Auftrag, der als Skill im
Repository liegt: `.claude/skills/standwaechter/SKILL.md`. Er liest die Quellen
zum Vorhaben, vergleicht sie mit `data/projektstand.json`, trägt ein, was neu
ist, und stellt die Änderung als Pull Request. Er führt nichts zusammen und gibt
nichts frei; das bleibt bei einem Menschen.

Drei Regeln tragen ihn, und sie sind dieselben wie die des Vorhabens selbst:
keine Zahl ohne Quelle, kein geglätteter Widerspruch, und nichts wandert von
selbst aus der internen in die öffentliche Fassung. Vor jedem Pull Request laufen
`npm test`, beide Builds und `npm run pruefe:oeffentlich`; schlägt eines an, wird
nichts gestellt.

Geweckt wird er von einer Routine. Ein leerer Lauf ist ein guter Lauf: Hat sich
nichts geändert, gibt es keinen Pull Request und keine Nachricht.

## Logo

Beide Seiten suchen beim Bauen unter `public/` nach `logo.svg`, `logo.png`,
`wamocon-logo.svg` oder `wamocon-logo.png`. Liegt eine dieser Dateien da, erscheint sie
im Fußbereich. Bis dahin steht dort die gesetzte Wortmarke, so wie es auch das CI-Blatt
selbst hält.

Block 09 des CI-Profils stellt drei Bedingungen an die Platzierung, alle drei sind im
Stylesheet umgesetzt und in `data/projektstand.json` unter `auftreten` festgehalten:

- **Mindestbreite 120 px am Bildschirm.** Das Logo wird deshalb über die Breite
  skaliert, nicht über die Höhe, und die Regel nutzt `box-sizing: content-box`, damit
  der Schutzraum nicht gegen das Mindestmaß zählt.
- **Zulässige Untergründe sind Weiß, Ink 950 und Rot 600.** Beide Fußbereiche stehen
  deshalb auf der Grundfläche und nicht auf einem Grauton; getrennt werden sie durch
  eine rote Kante.
- **Schutzraum rundum mindestens die Höhe des W der Wortmarke.** Der Wert steht als
  `--logo-schutzraum` an einer Stelle und ist mit 14 px eine Näherung. Er ist am
  Original nachzumessen, sobald die Datei vorliegt.

Nicht im Markup stehen feste Bildmaße: Eine dort eingetragene Höhe staucht jede Datei,
deren Seitenverhältnis nicht zufällig passt.

Für Bildmaterial gilt Block 09 weiter: echte Aufnahmen von Team und Arbeit,
KI-Grafik nur abstrakt und gekennzeichnet. Das Enabler-Feld im Hero ist eine
Datenfigur und fällt nicht darunter.

Das Favicon liegt als `app/icon.svg` und zeigt drei weiße Zellen auf Rot 600, ein
Anklang an das Enabler-Feld.

## Anrede

Block 02 des CI-Profils setzt für die WAMOCON GmbH **Sie, sachlich und
belegorientiert**. Die Seite spricht den Leser bisher nirgends an, verletzt die Regel
also nicht. Sobald ein Abschluss dazukommt, der jemanden anspricht, gilt sie.

Für die Academy führt das CI-Blatt die Anrede in Block 05 ausdrücklich als offenen
Widerspruch: Der Teaser duzt, test-it-academy.com siezt. Da die Landing Page eine Seite
der GmbH ist, greift hier die Sie-Form ohne Zweifelsfall.

## Farben und Typografie

`app/globals.css` übernimmt die Werte aus dem CI-Profil unverändert: beide Skalen
zu elf Stufen, die Semantikfarben und die Rollen aus Block 11. Die Regeln aus
Block 10 sind umgesetzt:

- Rot 600 trägt Flächen und große Zahlen, nie Kleintext. Für kleinen roten Text
  gilt Rot 700.
- Der Fokusrahmen ist 2 px Rot 700 mit 2 px Abstand.
- Zustände sind nie allein über Farbe kodiert. Jeder Hinweisblock trägt ein Zeichen
  und ein Wort.
- Keine Fremdgraus, keine Verläufe, kein zweiter Markenfarbton.

Für dunkle Flächen belegt das CI-Blatt genau eine Paarung: Rot 300 auf Ink 950.
Der Dark Mode nutzt sie und bleibt sonst in denselben Skalen.

Die Schrift ist Inter mit dem Fallback aus dem CI-Blatt. Eingebunden wird sie nicht,
damit die Seite ohne Netzzugriff läuft; wo Inter installiert ist, greift sie, sonst
Helvetica oder Arial. Soll Inter mitgeliefert werden, gehören die Dateien nach
`public/` und ein `@font-face` in `globals.css`.

## Später öffentlich stellen

Die Seite ist als statischer Export gebaut und läuft ohne Umbau auf GitHub Pages.
Liegt sie nicht in der Wurzel, ist `BASE_PATH` zu setzen:

```bash
FREIGABE=oeffentlich BASE_PATH=/kiKollege npm run build
npm run pruefe:oeffentlich
```

Genau das tut `.github/workflows/veroeffentlichen.yml`, siehe oben. Vor einem
öffentlichen Auftritt fehlen noch Impressum und Datenschutzerklärung. Beides ist
hier nicht angelegt, weil die Seite zunächst intern bleibt.

Zu bedenken: Pages ist bei einem privaten Repository ohne Enterprise-Tarif immer
öffentlich. Wer den Workflow auslöst, stellt die Seite ins offene Netz. Deshalb
läuft er nur von Hand und erst nach der Prüfung.

## Aufbau

```
app/
  page.tsx          Landing Page
  stand/page.tsx    dichte Standseite
  globals.css       CI-Tokens, gemeinsame Bausteine, Landing-Layout (lp-)
  icon.svg          Favicon
components/
  landing/          Kopfleiste, Navigation, Hero, Sektion, Fußleiste
  figuren/          sechs gezeichnete Diagramme, alle aus den Daten
  ThemaSchalter     Hell, Dunkel, System
  Kopf, Nav, Fuss, bausteine   Bausteine der Standseite
data/             projektstand.json, die einzige Zahlenquelle beider Seiten
lib/              Typen, Datumsformat, Freigabelogik, Abschnittslisten
scripts/
  export-vault.mjs         schreibt die Daten aus dem Vault fort
  pruefe-oeffentlich.mjs   sucht Internes in einer öffentlichen Ausgabe
  stand-aktualisieren.cmd  ein Durchgang für die Aufgabenplanung
  __fixtures__/            drei Vaults mit verschiedenem Aufbau
.claude/skills/
  standwaechter/SKILL.md   zieht den Stand nach und stellt ihn als Pull Request
.github/workflows/
  pruefen.yml              baut beide Fassungen, prüft die öffentliche
  veroeffentlichen.yml     stellt die öffentliche Fassung auf Pages
```
