# Pflege der Landing Page

Für alle, die kiKollege pflegen oder weiterbauen, Mensch oder KI-Mitarbeiter.
Gregor Dev liest diese Datei bei jedem Start. Sie sagt, was heute gilt und was man
wissen muss, bevor man etwas ändert. Wie die Seite gebaut ist, steht im README,
was wann geschah, in `UEBERGABE.md`.

Stand: 30.10.2026.

## Die Seite heute

| Adresse | Was | Code |
|---|---|---|
| `/` | Startseite, Abschnitte nach Kapiteln | `components/landing/LandingAbschnitte.tsx`, Reihenfolge in `lib/lpAbschnitte.ts` |
| `/stand/` | dichte Zweitseite: Plan, Risiken, Stufen, Messung und das Archiv mit Chronik, Entscheidungen, offenen Punkten, Beobachtungen und Quellen | `components/stand/StandAbschnitte.tsx` |
| `/mannschaft/` | Steckbriefe der KI-Mitarbeiter | `app/mannschaft/page.tsx` |
| `/labor/` | Produktseite, Entwurf zur Freigabe. Szenen vom Einstieg bis zu den Begriffen, unter jeder Szene die Einzelheiten aus `/` und `/stand/`. Nicht verlinkt, für Suchmaschinen gesperrt. | `app/labor/`, `components/labor/Bewegung.tsx` |
| `/labor/kikollege-30s.mp4` | Film „kiKollege in 30 Sekunden“, stumm | `film/`, `scripts/film-*.mjs`, `scripts/baue-film.mjs` |
| `/impressum/`, `/datenschutz/` | Entwürfe, rechtlich nicht geprüft | `app/impressum/`, `app/datenschutz/` |

Das Labor soll die Startseite ablösen. Bis der Projektverantwortliche das
freigibt, bleiben `/` und `/stand/` Zeichen für Zeichen, wie sie sind. Danach
stehen an: das Labor als Startseite, `/stand/` als Archiv, die alten Anker
umleiten, die öffentliche Fassung abbauen.

## Eine Quelle, drei Fassungen

- Alles Sichtbare kommt aus `data/projektstand.json`, die Typen stehen in
  `lib/daten.ts`. Die Datei ist über 300 KB groß. Wer mit knappem Kontext
  arbeitet, liest sie in Abschnitten.
- Die Texte des Labors stehen unter `produktseite`. Zahlen und Termine gehören
  nicht dorthin; die rechnet der Code aus den übrigen Daten.
- `FREIGABE` wählt die Fassung: `intern` (ohne Angabe), `oeffentlich` oder
  `alles`. GitHub Pages baut bei jedem Push auf `main` die Fassung `alles` unter
  dem Pfad `/kiKollege`. Die öffentliche Fassung wird weiter gebaut und geprüft,
  bis sie mit der Übernahme des Labors wegfällt.
- Eigene Dateien wie Bilder oder den Film verlinkt der Code über `pfad()` aus
  `lib/pfad.ts`. Ohne die Funktion fehlt auf Pages der Pfad `/kiKollege`.
- Die gebaute Seite in `out/` braucht zum Ansehen einen Server. Über `file://`
  fehlen Stile und Skripte, weil die Dateien absolut verlinkt sind.

## Ändern, ohne etwas zu verlieren

- **Ändern ist erlaubt, entfernen nicht.** `pruefe:bestand` vergleicht bei jedem
  Pull Request die Daten mit dem Zielzweig. Bekommt ein Eintrag mit Kennung oder
  Titel einen neuen Namen, steht der alte in `umbenanntVon` daneben. So geschah
  es am 29.10., als die Szene `fortschritt` in `ueberblick` aufging.
- **Keine Zahl in der Prosa im Code**, auch nicht im Labor. Dort stand einmal
  „drei Phasen“ fest im Text und wäre mit dem nächsten Plan falsch gewesen; jetzt
  zählt der Code.
- **`stand` mitziehen.** Wer etwas nachträgt, setzt `stand` und
  `herkunft.erzeugt` auf den Tag. Das Labor zeigt `stand` als „Stand der Daten“
  auf dem Zeitstrahl und im Film.
- **Einzelheiten im Labor.** Welche alten Abschnitte unter welcher Szene stehen,
  legt `EINZELHEITEN` in `app/labor/page.tsx` fest. Was Startseite und `/stand/`
  beide zeigen, lässt `DOPPELT` an einer Stelle weg. Ein neuer Abschnitt auf `/`
  oder `/stand/` braucht dort einen Platz, sonst meldet `pruefe:labor` seinen Text
  als fehlend.
- **Nur das Labor geändert?** Dann liefern `/` und `/stand/` danach dasselbe HTML
  wie vorher. Keine Prüfung sieht das von selbst: vor und nach der Änderung bauen
  und `out/index.html` und `out/stand/index.html` vergleichen.

## Was nicht auf die Seite darf

Das Repository ist öffentlich. Commit-Nachrichten, Zweignamen und Texte von Pull
Requests sind sofort sichtbar, auch vor dem Merge.

- Nie auf die Seite, in die Daten, in einen Commit oder einen Pull Request:
  Befunde zur Sicherheit, Rechnernamen, Adressen, Ports, Versionen von Diensten,
  Schlüssel, Benutzer, Pfade, Einzelheiten der technischen Grenze, Profilnamen,
  fremde Kennungen wie Ticketnummern, Auftragsnummern, Zweignamen und Befehle.
  Produktnamen sind seit dem 23.10. erlaubt.
- Der Name des Projektverantwortlichen steht in keiner gebauten Seite,
  `pruefe:ausgabe` schlägt sonst an. Auf der Seite heißt er „der
  Projektverantwortliche“.
- Prüfstandläufe stehen in `training.laeufe`, eine Zeile je Lauf, nur Kennzahlen
  und Bereiche. Keine Fallnummern, keine Einzelheiten der Grenze, keine Namen von
  Menschen, keine Pfade.
- Ein Pflegelauf am 26.10. hatte eine Auftragsnummer, einen Zweig, Ticketnummern
  und einen Befehl in die Entscheidungen geschrieben. Das ist erst im Review
  aufgefallen und wurde neutral gefasst.

## Prüfen

Vor jedem Pull Request, jeder Befehl für sich, in dieser Reihenfolge:

```bash
npm run pruefe:daten
npm test
npm run build
FREIGABE=alles npm run build
npm run pruefe:ausgabe
npm run pruefe:labor
npm run pruefe:film
FREIGABE=oeffentlich npm run build
npm run pruefe:oeffentlich
npm run pruefe:ausgabe
```

- `pruefe:labor` und `pruefe:film` lesen den Bau mit `FREIGABE=alles`. Ein
  `BASE_PATH` ist dafür nicht nötig, die CI setzt ihn trotzdem.
- `pruefe:figuren -- --streng` braucht einen Browser. Wo keiner ist, übernimmt das
  die CI.
- `pruefe:bestand` braucht den alten Stand als Datei und läuft bei jedem Pull
  Request in der CI gegen den Zielzweig.
- In Git Bash unter Windows `MSYS_NO_PATHCONV=1` vor `BASE_PATH` setzen, sonst
  wird `/kiKollege` zu einem Windows-Pfad.
- `pruefe:film` endet auch dann ohne Fehler, wenn der Film veraltet ist. Der
  Hinweis gehört in die Meldung.

## Ansehen

- Bei 1300 und 375 Pixeln Breite, dazu mit reduzierter Bewegung. Die Seite darf
  nirgends seitlich scrollen, die Konsole bleibt ohne Fehler.
- An das Scrollen gekoppelte Bewegungen zeigen Zwischenzustände. Ein
  Bildschirmfoto mitten im Scrollen kann übereinanderliegende Texte zeigen, die es
  im Stillstand nicht gibt. Erst nach dem Anhalten urteilen.
- Nach einem größeren Umbau lohnt ein Lesetest: Ein Agent ohne Vorwissen liest nur
  den Text der gebauten Seite und beantwortet, was ein neuer Mitarbeiter wissen
  muss. Am 29.10. fand er so ein missverständliches Abzeichen, einen kaputten Satz
  und unerklärte Kürzel.

## Bewegung im Labor

`components/labor/Bewegung.tsx`, mit GSAP und ScrollTrigger, Lenis glättet das
Scrollen.

- Ohne JavaScript und bei reduzierter Bewegung ist alles sofort lesbar. Animiert
  wird nur unter der Klasse `lb-bewegt` am `html`, und die setzt erst das Skript.
- Angeheftete Szenen wie Zeitstrahl, Kartenstapel und Galerie gibt es erst ab 900
  Pixeln Breite (`gsap.matchMedia`). Darunter blendet die Seite nur ein.
- Bewegt werden `transform`, `opacity` und `clip-path`, keine Maße.
- Was am Rechner nebeneinander passt, stößt auf dem Handy zusammen. Auf dem
  Zeitstrahl stehen Meilensteine ohne Termin deshalb unter der Linie und fehlen
  auf dem Handy, Namen von Phasen erscheinen erst ab einer Mindestbreite des
  Bandes.
- Der Film spielt nur, solange er zu sehen ist, und lädt bei reduzierter Bewegung
  nichts vor.

## Der Film

- 30 Sekunden, stumm, 1920 × 1080, unter 1 MB, gebaut mit HyperFrames: HTML und
  GSAP, Bild für Bild gerendert. `scripts/film-daten.mjs` nimmt jeden Satz und
  jede Zahl aus den Daten. Drehbuch, Prüfung und was aus dem Labor übernommen
  wurde, steht in `film/`.
- Ändern sich die gezeigten Daten, meldet `pruefe:film` das als Hinweis. Bis zum
  nächsten Rendern zeigt der Film den alten Stand.
- Gerendert wird mit `npm run baue:film` auf einem Rechner mit ffmpeg und Chrome.
  Das Skript ruft HyperFrames in fester Version über npx auf, ohne Telemetrie.
- **Erst zeigen, dann einbauen** (seit 30.10.2026): Ein neuer oder neu
  gerenderter Film geht zuerst als Datei an den Projektverantwortlichen in den
  Chat. Erst nach seinem Okay werden Film, Standbild und `film/stand.json`
  committet und auf der Seite eingebaut.
- Der Standwächter und Gregor Dev rendern nicht. Sie erwähnen einen veralteten
  Film in ihrer Meldung.
- In der öffentlichen Fassung fehlt der Film, weil er den intern freigegebenen
  Plan zeigt.

## Wer was tut

- **Gregor Dev** pflegt die Seite: montags und donnerstags ein Pflegelauf, der nur
  `data/projektstand.json` ändert, dazu Bauaufträge auf Karte. Seine Akte liegt in
  der Ablage. Bis er ein eigenes Konto auf GitHub hat, stellt die Werkbank seine
  Pull Requests.
- **Die Werkbank** (Claude Code) übernimmt größere Umbauten: das Labor, die
  Bewegung, den Film.
- **Der Standwächter** folgt `.claude/skills/standwaechter/SKILL.md`. Dort steht
  auch, welche Änderung in welches Feld gehört.
- **Der Projektverantwortliche** gibt frei und führt zusammen. Niemand sonst
  merged, auch nicht automatisch. Baut ein Zweig auf einem offenen auf, geht sein
  Pull Request gegen diesen Zweig.

## Offen am 30.10.2026

- `stand` zeigt den 27.10., die Prüfstandläufe reichen bis zum 29.10. Beim
  Nachtrag der Läufe wurde das Datum nicht mitgezogen.
- Zahlen, die nicht zueinander passen (Lesetest vom 29.10.): zehn oder elf
  Themenkomplexe, eine von 10 oder eine von 26 Regeln, der Pflegelauf um 7 oder um
  9 Uhr.
- Wen ein neuer Mitarbeiter ansprechen soll, sagt die Seite nicht, weil sie den
  Namen des Projektverantwortlichen nicht nennt.
- Wie der Film in Teams oder in einer Präsentation wirkt, hat noch niemand
  gesehen.
- Die Übernahme des Labors als Startseite.
