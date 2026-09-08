# kiKollege

Zwei Seiten zum Vorhaben KI-Mitarbeiter der WAMOCON GmbH, gespeist aus derselben
Datenquelle.

| Route | Was sie ist |
|---|---|
| `/` | Landing Page. Erzählt das Vorhaben vom Hero bis zu den offenen Punkten. |
| `/stand/` | Dichte Standseite mit Ankernavigation, allen Tabellen und Prüfläufen. |

Grundlage ist das Übergabedokument vom 05.09.2026 aus dem Arbeitsordner `D:\KFBM`.
Farben und Typografie folgen dem CI-Profil Version 1.0 vom 18.08.2026.

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
npm run test:export  # Tests des Exportskripts
```

Der Build erzeugt einen statischen Export ohne Server. Zum Ansehen des Ergebnisses
braucht es einen kleinen Webserver, weil die Seite absolute Pfade nutzt:

```bash
npx serve out
```

## Der Themenschalter

Die Kopfleiste schaltet zwischen System, Hell und Dunkel. Die Wahl liegt in
`localStorage` und wird von einem kurzen Skript im `<head>` gesetzt, bevor der Browser
das erste Mal zeichnet, sonst blitzt die falsche Fassung auf. Ohne Wahl gilt die
Systemeinstellung.

Dasselbe Skript setzt die Klasse `js` auf das Dokument. Die Einblend-Animation beim
Scrollen startet nur unter dieser Klasse unsichtbar, damit ohne JavaScript kein Inhalt
verborgen bleibt.

## Die beiden Figuren

Die Landing Page zeigt zwei Datenfiguren, beide aus `data/projektstand.json`:

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
npm run export:vault -- --vault "D:\KFBM" --probelauf   # nur anzeigen
npm run export:vault -- --vault "D:\KFBM"               # schreiben
```

Das Skript liest das Frontmatter der Laufnotizen (`geprueft`, `blocker`, `major`,
`minor`, `enabler`, `stand` und einige weitere), die Entscheidungstabelle und die
Liste der offenen Punkte. Es ersetzt nur diese Abschnitte; Begriffe, Maßstab,
Übertragbarkeit und alles andere von Hand Geschriebene bleibt stehen. Ein bereits
gesetztes `freigabe` wird übernommen.

**Noch zu prüfen:** Die Pfade in `ORTE` am Kopf des Skripts sind aus dem
Übergabedokument abgeleitet und am echten Vault nicht getestet, weil der Vault hier
nicht vorlag. Stimmen die Dateinamen für Entscheidungen und offene Punkte nicht,
sind sie dort anzupassen. Die Auswertung selbst ist durch
`scripts/export-vault.test.mjs` gegen einen Fixture-Vault abgedeckt.

## Logo

Beide Seiten suchen beim Bauen unter `public/` nach `logo.svg`, `logo.png`,
`wamocon-logo.svg` oder `wamocon-logo.png`. Liegt eine dieser Dateien da, erscheint sie
im Fußbereich. Bis dahin steht dort die gesetzte Wortmarke, so wie es auch das CI-Blatt
selbst hält.

Das Favicon liegt als `app/icon.svg` und zeigt drei weiße Zellen auf Rot 600, ein
Anklang an das Enabler-Feld.

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
```

Vor einem öffentlichen Auftritt fehlen noch Impressum und Datenschutzerklärung.
Beides ist hier nicht angelegt, weil die Seite zunächst intern bleibt.

## Aufbau

```
app/
  page.tsx          Landing Page
  stand/page.tsx    dichte Standseite
  globals.css       CI-Tokens, gemeinsame Bausteine, Landing-Layout (lp-)
  icon.svg          Favicon
components/
  landing/          Kopfleiste, Sektion, Fußleiste der Landing Page
  figuren/          Enabler-Feld
  ThemaSchalter     Hell, Dunkel, System
  Enthuellen        blendet Blöcke beim Scrollen ein
  Kopf, Nav, Fuss, bausteine   Bausteine der Standseite
data/             projektstand.json, die einzige Zahlenquelle beider Seiten
lib/              Typen, Datumsformat, Freigabelogik, Abschnittslisten
scripts/          Exportskript für den Vault samt Tests und Fixtures
```
