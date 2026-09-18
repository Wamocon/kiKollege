# kiKollege

Zwei Seiten zum Vorhaben KI-Mitarbeiter der WAMOCON GmbH, gespeist aus derselben
Datenquelle.

| Route | Was sie ist |
|---|---|
| `/` | Landing Page. Erzählt das Vorhaben in dreizehn Abschnitten, vom Hero bis zum Meilensteinplan. |
| `/stand/` | Dichte Standseite mit Ankernavigation, allen Tabellen, Prüfläufen, Stufen und dem Meilensteinplan im Einzelnen. |
| `/impressum/`, `/datenschutz/` | Entwürfe, rechtlich nicht geprüft. Siehe „Impressum und Datenschutz“. |

Bis zum 17.09.2026 hatte die Landing Page neunzehn Abschnitte und rund 9.500
Wörter. Nach dem Kürzen waren es zwölf und rund 6.300, mit dem Abschnitt Ablage
sind es dreizehn: Ertrag und Aufwand stehen unter
Eignung, die Steuerung unter Arbeitsweise. Stufen, Betrieb, Entscheidungen und
Abgleich stehen nur noch unter `/stand/`, ebenso Zieltabelle, Zeit je Woche und
Risiken des Meilensteinplans. Unter dem Hero steht „Auf einen Blick“: nächste
Abnahme, nächste Frist, Bewertungen, Rollen und verbindliche Notizen, alles aus
den Daten gerechnet.

Der Abschnitt **Ablage** zeigt, wie der Vault heute aussieht: das Abbild mit einem
Kästchen je Notiz, den Graphen der Bereiche und die Rubriken des
Unternehmenswissens mit einer kurzen Erklärung und der Stufe, in der ein
KI-Mitarbeiter sie liest.

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

Dreizehn Abschnitte brauchen eine. Sie besteht aus drei Teilen, alle in
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

Zwölf Zeichnungen, alle aus `data/projektstand.json` gespeist, elf davon in
`components/figuren/`. Sie sind eigene SVG in den CI-Farben, keine Kopien der
Vorlagen aus der Einführung. Farben kommen aus den Tokens, damit sie in beiden Themen
mitwandern; Rot trägt in jeder Figur genau ein Element, nämlich das, worum es geht.

Weil die Beschriftungen eine feste Größe im `viewBox` haben, behalten die Zeichnungen
eine Mindestbreite von 880 px und scrollen darunter waagerecht im eigenen Kasten. Ohne
das wäre die Beschriftung auf Handybreite unleserlich. Unter 900 px steht darüber
ein Hinweis, dass sich die Figur verschieben lässt, und der Kasten ist mit der
Tastatur erreichbar. Keine Beschriftung ist kleiner als 10,5, ausgenommen die
Tageszahlen im Zeitplan mit 10, weil ein Tag dort 22 Einheiten breit ist.

Jede Aussage, die einen Abschnitt eröffnet, ist eine h2, jede weitere eine h3. Das
Aussehen setzt die Klasse `lp-aussage`.

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
- **Mannschaft** — das Organigramm. Durchgezogen ist, wer arbeitet oder eingerichtet
  ist, gestrichelt, was entschieden und nicht gebaut ist. Die Kästen werden schmaler,
  wenn mehr Rollen dazukommen.
- **Landschaft** — die Systemlandschaft mit Ist und Soll: Werkbank, Ablage und
  KI-Rechner im Haus nebeneinander, in jedem die Bausteine mit ihrem Zustand
  (gefüllt läuft, leer vorhanden, gestrichelt entschieden). Rot trägt die eine
  Verbindung, an der der Rest hängt: die Ablage über Git auf dem KI-Rechner.
  Daneben steht dieselbe Aufzählung als Text, für Leser ohne Bild.
- **Zeitplan** — der Meilensteinplan über seine vier Wochen: oben die
  Entscheidungen mit Frist, darunter je Meilenstein die Arbeiten als Balken,
  unten Erwins Zeit je Woche. Rot trägt der kritische Pfad, leere Balken sind
  Bewertungszeit, grau hinterlegt sind die Wochenenden. Die gestrichelte Linie
  ist der Stand des Plans, nicht der heutige Tag, weil die Seite statisch gebaut
  ist.
- **Ablage** — das Abbild des Vaults: jede Notiz ein Kästchen, gefärbt nach ihrem
  Freigabestand, je Bereich eine Zeile, rechts der Bereich, auf den am häufigsten
  verwiesen wird. Rot trägt das Verbindliche. Die Zahlen kommen aus
  `scripts/abbild-vault.mjs`, siehe unten. Darunter stehen sie noch einmal als
  aufklappbare Tabelle, für alle, die das Bild nicht sehen.
- **Graph der Ablage** — der Vault-Graph in einfacher Form: jeder Bereich ein Kreis,
  der mit der Zahl seiner Notizen wächst, auf einer Ellipse in der Reihenfolge des
  Abbilds. Linien verbinden Bereiche, die sich zusammen mindestens zehnmal
  verweisen, je dicker, desto öfter. Rot ist der Bereich, auf den am meisten
  verwiesen wird, am 17.09. der Bauplan. Einzelne Notizen zeigt er nicht: 141
  Punkte und über 1.200 Linien wären ein Knäuel, und Dateinamen gehören nicht auf
  die Seite. Alle Verbindungen stehen darunter als Liste.
- **Anatomie** — die Zeichnung im Hero, die einzige mit Scrollbindung.

Dazu zwei Entscheidungen zur Darstellung:

**Das Enabler-Feld** im Hero hat eine Zelle je Enabler, gefüllt heißt vollständig
ausgestattet. Die Zellen stehen in fester Reihenfolge, gefüllte zuerst. Eine gestreute
Anordnung würde eine Verteilung über die Themenkomplexe behaupten, die nicht gemessen
ist.

**Die Zahl der bewerteten Befunde** im Abschnitt zur Messung ist die einzige
Hero-Zahl der Seite. Bis zum 09.09. stand dort eine Null. Seit es Bewertungen gibt,
steht die Zahl nie allein: Daneben stehen, wie viele davon einzeln angesehen wurden,
und die drei Gründe, warum das noch keine Abnahme ist. Die Übergabe vom 11.09.
verlangt das ausdrücklich; die Zahl ohne ihre Einschränkungen wäre genau die Art
Aussage, die das Projekt sich verbietet.

## Drei Fassungen aus einer Quelle

Jedes Datenelement in `data/projektstand.json` trägt ein Feld `freigabe`, das
`intern` oder `oeffentlich` sein kann. Das setzt um, was das Übergabedokument
empfiehlt: Die Grenze zwischen internem und öffentlichem Inhalt ist eine Eigenschaft
der Notiz und keine Erinnerungsleistung.

```bash
npm run build                        # interne Fassung: alles, Internes markiert
FREIGABE=alles npm run build         # vollständige Fassung: alles, ohne Markierung
FREIGABE=oeffentlich npm run build   # öffentliche Fassung: nur Freigegebenes
```

**Auf GitHub Pages steht seit dem 17.09.2026 die vollständige Fassung.** Erwin
Moretz hat entschieden, vorerst keinen Unterschied zwischen intern und öffentlich
zu machen. Die Felder bleiben gepflegt, und `pruefen.yml` baut und prüft die
öffentliche Fassung weiter. Wer die Trennung zurückwill, ändert in
`veroeffentlichen.yml` eine Zeile und nimmt den Prüfschritt wieder auf; der
Kommentar am Kopf des Workflows sagt, wie.

Unabhängig davon gilt: Was auch intern nicht öffentlich lesbar sein darf, kommt
gar nicht in die Daten. Das Repository ist öffentlich.

Die öffentliche Fassung lässt auf der Landing Page die Meilensteine weg, auf der
Standseite den Meilensteinplan, den Betrieb, den Abgleich und die Quellen. Dazu entfallen auf beiden
Seiten die internen Entscheidungen, die Befunddichte je Themenkomplex und alle
Pfadangaben. Die Abschnittsnummern der Landing Page rücken nach, damit die Zählung
keine Lücke zeigt. Was ohne Angabe bleibt, gilt als öffentlich, damit die Datenpflege
nicht stillschweigend Inhalt verliert.

Die interne und die vollständige Fassung setzen zusätzlich `robots: noindex`.
Eine Seite mit internem Inhalt gehört in keinen Suchindex, und Pages zeigt die
vollständige. Wer den Link teilt, bekommt trotzdem eine Vorschau, siehe „Vorschau
für geteilte Links“.

Eigennamen hält eine Liste am Kopf von `scripts/pruefe-oeffentlich.mjs` aus der
öffentlichen Fassung heraus, gleich in welchem Datenfeld sie stehen. Am 17.09.2026
hat Erwin Moretz entschieden, dass Claude Code, Hermes Agent und DGX Spark
öffentlich genannt werden dürfen; diese Namen sind aus der Liste gestrichen. Das
Modell, sein Anbieter, der Messenger, die Ablagesoftware und Pfade bleiben darin.

## Woher die Zahlen kommen

Die Prosa im Code enthält keine Zahlen. Alles Zählbare steht in
`data/projektstand.json` und wird von dort gerendert. Das ist der Grund, warum die
Seite altern kann, ohne falsch zu werden.

`scripts/export-vault.mjs` schreibt diese Datei aus dem Vault fort:

```bash
npm run export:vault -- --vault "D:\WAMOCON\KFBM" --probelauf   # nur anzeigen
npm run export:vault -- --vault "D:\WAMOCON\KFBM"               # schreiben
```

Das Skript liest das Frontmatter der Laufnotizen (`geprueft`, `blocker`, `major`,
`minor`, `hinweis`, `bewertet`, `enabler`, `stand` und einige weitere), die
Entscheidungstabelle und die Liste der offenen Punkte. Es ergänzt und entfernt
nichts:

- **Läufe:** Die Liste in den Daten ist von Hand kuratiert, etwa die zehn
  Fachreviews vom 03.09. als ein Eintrag. Dazu kommen nur Läufe, die neuer sind als
  das Ende des bisherigen Zeitraums und nicht schon mit Datum und Zahl dastehen.
- **Entscheidungen:** Neue kommen dazu, bestehende bleiben.
- **Offene Punkte:** Ein Punkt mit bekannter Nummer bekommt den neuen Wortlaut und
  behält `erledigt` und `freigabe`. Neue Nummern kommen dazu.
- **`stand`** ist das jüngere von bisherigem Stand und jüngstem Lauf.
- **`herkunft.erzeugt`** ändert sich nur, wenn sich etwas geändert hat.
  Arbeitsordner und Verfahren bleiben.

Begriffe, Maßstab, Übertragbarkeit und alles andere von Hand Geschriebene bleibt
stehen. Ein bereits gesetztes `freigabe` wird übernommen.

Den Ordner mit den Laufnotizen sucht das Skript, statt ihn vorauszusetzen: erst die
aus dem Übergabedokument bekannten Lagen (`00_Vault/10_KI-Mitarbeiter` und
Ähnliches), dann den angegebenen Ordner selbst, dann bis drei Ebenen tief nach einem
Ordner, der KI-Mitarbeiter heißt. `--vault` darf deshalb auf den Vault oder gleich
auf den Notizordner zeigen. Der Probelauf schreibt nichts und sagt, was er gefunden
hat:

```
Gefunden
  Vault            D:\WAMOCON\KFBM
  Notizordner      D:\WAMOCON\KFBM\00_Vault\10_KI-Mitarbeiter
  Entscheidungen   nicht gefunden, bisheriger Stand bleibt
  Offene Punkte    nicht gefunden, bisheriger Stand bleibt
Gelesen
  Laufnotizen      27, davon als Prüflauf erkannt: 20
Übernommen
  Neue Läufe       0
```

Fehlt eine Zeile, heißt die Datei im Vault anders. Weitere Namen trägt man in
`ORTE` am Kopf des Skripts nach.

**Was der erste Blick in den echten Vault am 17.09.2026 gezeigt hat, und was
seitdem behoben ist.** Die Laufnotizen liegen unter `KFBM`, nicht unter
`KI-Mitarbeiter`; das ist jetzt der Vorgabepfad. Die Notizen schreiben `hinweis`
statt `hinweise`, und `bewertet` wurde nicht gelesen; beides liest das Skript
jetzt. Die Liste der Läufe wurde ganz ersetzt, `stand` konnte rückwärts springen,
Arbeitsordner und Verfahren wurden überschrieben; das Zusammenführen oben
verhindert alle drei. Ein Probelauf gegen den Vault erkennt 20 Läufe, fügt keinen
hinzu und lässt den Stand beim 17.09. Die Tests laufen gegen einen festen alten
Stand in `scripts/__fixtures__/stand-alt.json`, nicht gegen die echten Daten.

## Das Abbild der Ablage

`scripts/abbild-vault.mjs` zählt den Vault durch und schreibt das Ergebnis unter
`ablage` in `data/projektstand.json`:

```bash
npm run abbild:vault -- --vault "D:\WAMOCON" --probelauf   # nur anzeigen
npm run abbild:vault -- --vault "D:\WAMOCON"               # schreiben
```

`--vault` zeigt auf den Ordner, den Obsidian als Ganzes öffnet. Ausgelassen wird,
was Obsidian selbst aus dem Index nimmt (`userIgnoreFilters` in
`.obsidian/app.json`), und jeder Ordner mit Punkt am Anfang. Jede Notiz fällt in
einen von zwölf Bereichen: die sieben Ebenen der Wissensschicht, die Prüfläufe als
Gedächtnis und vier Bereiche der Werkstatt. Die Zuordnung steht in `bereichVon`,
nach Ordner und bei Arbeitsständen nach `typ:`.

Gezählt werden je Bereich die Notizen, ihr Freigabestand aus `verbindlichkeit:` und
die Wikilinks in jeden anderen Bereich. Ein Verweis auf einen Namen, der zweimal
vorkommt, zählt nicht, weil er mehrdeutig ist. Aus derselben Zählung kommt die
Kennzahl der verbindlichen Notizen; sonst ändert das Skript nichts.

Das Repository ist öffentlich. Ins Abbild gehen deshalb nur Zahlen je Bereich,
keine Dateinamen und keine Pfade.

Dieselbe Zählung liefert die Anzahlen für die **Rubriken des
Unternehmenswissens**, die Ordner direkt unter `KI-Mitarbeiter/`. Wofür eine
Rubrik da ist und in welcher Stufe ein KI-Mitarbeiter sie liest, steht von Hand
unter `unternehmenswissen` in den Daten, übertragen aus der Ordnertabelle und der
Kontextstrategie im Einstieg jenes Repositorys. Das Skript setzt nur `notizen` und
`verbindlich`. Eine Rubrik legt es nie selbst an und nimmt keine weg; findet es
einen Ordner ohne Eintrag, meldet es ihn, damit ein Mensch die Beschreibung
nachträgt. Tiefer als diese oberste Ebene gehen keine Ordnernamen in die Daten.

## Der Stand aktualisiert sich nicht von selbst

Der Vault liegt auf einem Rechner im Haus, das Repository liegt bei GitHub. Der
Export läuft also dort, wo der Vault liegt, und schiebt nur `data/projektstand.json`
weiter — Notizen, Testfälle und Ausbildungsunterlagen bleiben liegen. Ein Durchgang
steht als Windows-Skript bereit:

```bat
scripts\stand-aktualisieren.cmd "D:\WAMOCON\KFBM" "D:\WAMOCON"
```

Es exportiert, zählt das Abbild der Ablage neu und sagt, ob die Ablage weiter ist
als die Seite. Hat sich etwas geändert, prüft es, dass der neue Stand nichts
verliert (`pruefe:bestand` gegen `HEAD`) und nichts Heikles enthält
(`pruefe:daten`), und committet und pusht erst dann. Es pusht auf den Zweig, der
gerade ausgecheckt ist; steht dort `main`, geht der Stand direkt auf Pages.

Ob die Ablage weiter ist, sagt `scripts/pruefe-aktualitaet.mjs`:

```bash
npm run pruefe:aktualitaet -- --ablage "D:\WAMOCON"
```

Es zählt Notizen, deren Dateiname oder Frontmatter (`stand`, `datum`,
`aktualisiert`) ein Datum nach `herkunft.erzeugt` trägt, je Ordner, und sagt, ob
`herkunft.fristTage` überschritten ist. Dateinamen gibt es nicht aus. Was es
findet, trägt kein Skript nach: Logbuch, Protokolle und Pläne liest der
Standwächter oder ein Mensch.
Für den regelmäßigen Teil hängt man es in die Aufgabenplanung, hier täglich um sieben:

```bat
schtasks /create /tn "KI-Mitarbeiter Stand" /tr "\"C:\Pfad\zum\kiKollege\scripts\stand-aktualisieren.cmd\" \"D:\WAMOCON\KFBM\"" /sc daily /st 07:00
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

`.github/workflows/pruefen.yml` prüft zuerst das Repository auf heikle Angaben,
baut dann bei jedem Push alle drei Fassungen und prüft sie. Die vollständige baut
es mit demselben `BASE_PATH` wie Pages.

| Prüfung | Was sie findet |
|---|---|
| `pruefe:daten` | IPv4-Adressen, Rechnernamen im Hausnetz, Ports, Schlüssel und Tokens, private Schlüssel, Zugangsdateien und E-Mail-Adressen außer den beiden Kontaktadressen, in Daten, Code und Doku. Die Ausgabe zeigt von jedem Fund nur den Anfang. |
| `pruefe:oeffentlich` | Internes in der öffentlichen Fassung, siehe unten. |
| `pruefe:ausgabe` | Doppelte Satzzeichen im sichtbaren Text, interne Links ohne `basePath` oder ohne Ziel, fehlende Anker, `lang`, genau eine h1, übersprungene Überschriftenebenen, Grafiken ohne Beschriftung, Bilder ohne `alt`. |
| `pruefe:figuren` | Im installierten Chrome oder Edge über `playwright-core`: Beschriftungen, die sich überdecken oder aus dem Bild ragen, Schrift unter 10, seitliches Scrollen bei 375 px, Skriptfehler. Es wird kein Browser heruntergeladen; `BROWSER_PFAD` zeigt auf einen anderen. |
| `pruefe:bestand` | Bei einem Pull Request: ob der neue Stand weniger enthält als der Zielzweig. |

`pruefe:ausgabe` hat beim ersten Lauf vier Fehler gefunden, die kein Compiler
meldet: „Stand 11.09..“, Fußleisten mit h4 ohne h3 davor, eine h3 direkt unter der
h1 der Rechtsseiten und eine englische 404-Seite ohne Sprungziel.

Zu `pruefe:oeffentlich`: Die Prüfung pflegt keine
Wortliste, sondern zieht aus `data/projektstand.json` jeden Text aus einem Objekt
mit `freigabe: "intern"` und sucht ihn in allem, was ausgeliefert wird: HTML, die
RSC-Dateien daneben und JavaScript. Findet sie etwas, schlägt der Lauf fehl. Gegen
die interne Fassung meldet sie Hunderte Stellen, gegen die öffentliche keine. Damit
belegt sie, dass die Grenze im Build tatsächlich greift und nicht nur im Datenmodell
steht.

Bis zum 17.09.2026 hat sie nur HTML gelesen, und genau dort lag eine Lücke:
`StandAlter` ist eine Client-Komponente und importierte die Daten selbst. Damit stand
der ganze Datensatz, das Interne eingeschlossen, im ausgelieferten JavaScript der
öffentlichen Seite. Seitdem bekommt die Komponente nur die drei Werte, die sie
braucht, als Props. Die Regel dahinter: **Eine Komponente mit `'use client'`
importiert nie `lib/daten`**, höchstens dessen Typen mit `import type`.

`.github/workflows/veroeffentlichen.yml` stellt die Seite auf GitHub Pages: bei
jedem Push auf `main` und zusätzlich von Hand, jeweils erst nach den Tests. In den
Repository-Einstellungen steht Pages dazu auf "GitHub Actions".

Bis zum 17.09.2026 hat der Workflow ausdrücklich `FREIGABE=oeffentlich` gebaut und
abgebrochen, wenn die Prüfung etwas Internes fand. Seitdem baut er
`FREIGABE=alles`, siehe „Drei Fassungen aus einer Quelle“. Die Organisation hat
den Tarif GitHub Free, dort ist eine Pages-Seite immer öffentlich lesbar.

Jedes Skript unter `scripts/` hat seine Tests daneben, die Auswertung des Vaults
gegen drei Fixture-Vaults und einen festen alten Stand, das Abbild gegen einen
vierten. Der Test der Figurenprüfung braucht einen Browser und wird ohne ihn
übersprungen. `npm test` läuft über alle, am 17.09.2026 sind es 77.

## Der Standwächter

Die Seite zieht sich nicht selbst nach. Das tut ein Auftrag, der als Skill im
Repository liegt: `.claude/skills/standwaechter/SKILL.md`. Er liest die Quellen
zum Vorhaben, vergleicht sie mit `data/projektstand.json`, trägt ein, was neu
ist, und stellt die Änderung als Pull Request. Er führt nichts zusammen und gibt
nichts frei; das bleibt bei einem Menschen.

Vier Regeln tragen ihn, und sie sind dieselben wie die des Vorhabens selbst:
keine Zahl ohne Quelle, kein geglätteter Widerspruch, nichts wandert von selbst
aus der internen in die öffentliche Fassung, und **ändern ist erlaubt, entfernen
nicht**. Vor jedem Pull Request laufen `npm run pruefe:daten`, `npm test`,
beide Builds, `npm run pruefe:oeffentlich` und `npm run pruefe:bestand`;
schlägt eines an, wird nichts gestellt.

Die letzte Regel hängt nicht an gutem Willen. `scripts/pruefe-bestand.mjs`
vergleicht zwei Stände von `data/projektstand.json` und schlägt an, sobald ein
Schlüssel fehlt, eine Liste kürzer wird, ein Eintrag mit Kennung verschwindet
oder ein Satz geleert wird. Bei jedem Pull Request läuft diese Prüfung gegen den
Zielzweig. Was eine neue Quelle nicht mehr nennt, bleibt deshalb stehen und
bekommt eine Beobachtung; gelöscht wird nur, was ein Mensch löschen will.

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
belegorientiert**. Die Landing Page spricht den Leser nirgends an. Die
Datenschutzseite tut es und siezt. Wen die Landing Page am Ende ansprechen soll und
womit sie schließt, ist offen; das entscheidet ein Mensch, nicht die Seite.

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

## Auf GitHub Pages

Die Seite ist als statischer Export gebaut und läuft ohne Umbau auf GitHub Pages,
seit dem 17.09.2026 unter <https://wamocon.github.io/kiKollege/>. Weil sie dort
nicht in der Wurzel liegt, ist `BASE_PATH` gesetzt:

```bash
FREIGABE=alles BASE_PATH=/kiKollege npm run build
```

Genau das tut `.github/workflows/veroeffentlichen.yml`, siehe oben. Jeder Push auf
`main` stellt die Seite ins offene Netz; Änderungen kommen deshalb über einen Pull
Request, den ein Mensch zusammenführt.

Interne Links sind schlichte `<a href>`. Next.js setzt den `basePath` dort nicht
davor, deshalb gehen alle über `pfad()` aus `lib/pfad.ts`. Bis zum 17.09.2026
führten die Links auf `/stand/` auf Pages auf eine 404. `pruefe:ausgabe` fängt
das jetzt ab.

## Impressum und Datenschutz

Beide Seiten sind **Entwürfe** und tragen oben den Hinweis „Rechtlich nicht
geprüft“, solange `recht.geprueft` in den Daten `false` ist. Die Angaben kommen
aus `gesellschaften`; welche Gesellschaft als Anbieterin gilt, steht in
`recht.anbieter`. Erfunden ist nichts: Was fehlt, steht in
`recht.impressumFehlt` und `recht.datenschutzFehlt` und auf den Seiten unten,
unter anderem die Umsatzsteuer-Identifikationsnummer, die Frage nach einer
verantwortlichen Person nach § 18 Abs. 2 MStV und die Rechtsgrundlagen.

Die Angabe, dass GitHub Pages die IP-Adressen der Besucher protokolliert, ist
gegen die Dokumentation von GitHub geprüft und dorthin verlinkt. Die Seite selbst
setzt keine Cookies und lädt nichts von fremden Servern; im Browser liegt nur die
Themenwahl unter `wmc-thema`.

Vor einem Merge auf `main` gehören beide Texte in eine rechtliche Prüfung. Danach
wird `recht.geprueft` auf `true` gesetzt, und der Hinweis verschwindet.

## Vorschau für geteilte Links

`app/layout.tsx` setzt Open-Graph- und Twitter-Angaben, `app/vorschau.png/route.tsx`
baut das Bild dazu beim Export als PNG. Die Dateikonvention `opengraph-image`
schreibt im statischen Export eine Datei ohne Endung, die GitHub Pages nicht als
Bild ausliefert. Das Bild trägt keine Zahl und kein Datum.

Für eine absolute Bildadresse braucht der Build die volle Adresse der Seite in
`SEITE_URL`; `veroeffentlichen.yml` setzt sie. Lokal fehlt sie, dann bleibt die
Adresse relativ.

## Aufbau

```
app/
  page.tsx          Landing Page
  stand/page.tsx    dichte Standseite
  impressum/, datenschutz/     Entwürfe, rechtlich nicht geprüft
  not-found.tsx     die 404-Seite, auf Deutsch
  vorschau.png/     Vorschaubild für geteilte Links
  globals.css       CI-Tokens, gemeinsame Bausteine, Landing-Layout (lp-)
  icon.svg          Favicon
components/
  landing/          Kopfleiste, Navigation, Hero, Sektion, Rubriken, Fußleiste
  figuren/          elf gezeichnete Diagramme, alle aus den Daten
  stand/            Stufen und Meilensteinplan für die Standseite
  ThemaSchalter     Hell, Dunkel, System
  Kopf, Nav, Fuss, bausteine   Bausteine der Standseite
  Rechtsseite       Rahmen für Impressum und Datenschutz
data/             projektstand.json, die einzige Zahlenquelle beider Seiten
lib/              Typen, Datumsformat, Freigabelogik, Abschnittslisten
scripts/
  export-vault.mjs         schreibt die Daten aus dem Vault fort
  abbild-vault.mjs         zählt die Ablage für das Abbild
  pruefe-oeffentlich.mjs   sucht Internes in einer öffentlichen Ausgabe
  pruefe-bestand.mjs       schlägt an, wenn ein Stand weniger enthält als der alte
  pruefe-daten.mjs         sucht heikle Angaben im Repository
  pruefe-aktualitaet.mjs   sagt, ob die Ablage weiter ist als die Seite
  pruefe-ausgabe.mjs       prüft Links, Gliederung und Satzzeichen der gebauten Seite
  pruefe-figuren.mjs       prüft die Figuren und die Handybreite im Browser
  stand-aktualisieren.cmd  ein Durchgang für die Aufgabenplanung
  __fixtures__/            Vaults und ein alter Stand für die Tests
.claude/skills/
  standwaechter/SKILL.md   zieht den Stand nach und stellt ihn als Pull Request
.github/workflows/
  pruefen.yml              prüft Daten, baut alle drei Fassungen und prüft sie
  veroeffentlichen.yml     stellt die vollständige Fassung auf Pages
```
