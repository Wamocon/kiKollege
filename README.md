# kiKollege

Interne Standseite zum Vorhaben KI-Mitarbeiter der WAMOCON GmbH. Ein One-Pager mit
Ankernavigation, der Konzept, Maßstab, Kennzahlen der Prüfläufe, die offene Messlücke
und die Entscheidungen mit Datum zeigt.

Grundlage ist das Übergabedokument vom 05.09.2026 aus dem Arbeitsordner `D:\KFBM`.
Gestaltung und Farben folgen dem CI-Profil Version 1.0 vom 18.08.2026.

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

## Zwei Fassungen aus einer Quelle

Jedes Datenelement in `data/projektstand.json` trägt ein Feld `freigabe`, das
`intern` oder `oeffentlich` sein kann. Das setzt um, was das Übergabedokument
empfiehlt: Die Grenze zwischen internem und öffentlichem Inhalt ist eine Eigenschaft
der Notiz und keine Erinnerungsleistung.

```bash
npm run build                    # interne Fassung, zeigt alles
FREIGABE=oeffentlich npm run build   # öffentliche Fassung
```

Die öffentliche Fassung lässt drei Abschnitte weg (Plattform, Beobachtungen,
Quellen), dazu die beiden internen Entscheidungen, die Befunddichte je Themenkomplex
und alle Pfadangaben. Was ohne Angabe bleibt, gilt als öffentlich, damit die
Datenpflege nicht stillschweigend Inhalt verliert.

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

Die Seite sucht beim Bauen unter `public/` nach `logo.svg`, `logo.png`,
`wamocon-logo.svg` oder `wamocon-logo.png`. Liegt eine dieser Dateien da, erscheint
sie im Fußbereich. Bis dahin steht dort die gesetzte Wortmarke, so wie es auch das
CI-Blatt selbst hält.

Im Kopf steht bewusst kein Absender: Die Seite ist ohne Markenführung angelegt.

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
app/            Layout, Seite, Farbsystem
components/     Kopf, Navigation, Fußbereich, Bausteine
data/           projektstand.json, die einzige Zahlenquelle der Seite
lib/            Typen, Datumsformat, Freigabelogik, Abschnittsliste
scripts/        Exportskript für den Vault samt Tests und Fixtures
```
