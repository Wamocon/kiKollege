# Pflege der Seiten

Für alle, die kiKollege pflegen oder weiterbauen, Mensch oder KI-Mitarbeiter.
Gregor Dev liest diese Datei bei jedem Start. Sie sagt, was heute gilt und was man
wissen muss, bevor man etwas ändert. Wie die Seite gebaut ist, steht im README,
was wann geschah, in `UEBERGABE.md`.

Stand: 05.11.2026.

## Die Seite heute

| Adresse | Was | Code |
|---|---|---|
| `/` | Startseite, die Produktseite. Unter dem Einstieg die Kästen Management Summary und Version, dann Szenen bis zu den Begriffen, unter jeder Szene die Einzelheiten aus der früheren Landing Page und aus `/stand/`. | `app/page.tsx`, `components/start/`; die Einzelheiten aus `components/landing/LandingAbschnitte.tsx` und `components/stand/StandAbschnitte.tsx` |
| `/stand/` | das Archiv: Plan, Risiken, Stufen, Messung, dazu Chronik, Entscheidungen, offene Punkte, Beobachtungen und Quellen | `components/stand/StandAbschnitte.tsx` |
| `/mannschaft/` | Steckbriefe der KI-Mitarbeiter | `app/mannschaft/page.tsx` |
| `/labor/` | Weiterleitung auf die Startseite samt Sprungmarke, für alte Links. Dort stand bis zum 05.11.2026 der Entwurf. | `app/labor/page.tsx` |
| `/film/kikollege-30s.mp4` | Film „kiKollege in 30 Sekunden“, mit Stimme | `film/`, `scripts/film-*.mjs`, `scripts/baue-film.mjs` |
| `/impressum/`, `/datenschutz/` | Entwürfe, rechtlich nicht geprüft | `app/impressum/`, `app/datenschutz/` |

Am 05.11.2026 hat der Projektverantwortliche die Produktseite aus dem Labor als
Startseite freigegeben. `/stand/` ist seitdem das Archiv, alte Sprungmarken wie
`/#messung` führen weiter an ihre Stelle. Noch nicht entschieden ist der Abbau der
öffentlichen Fassung; bis dahin wird sie weiter gebaut und geprüft.

## Eine Quelle, drei Fassungen

- Alles Sichtbare kommt aus `data/projektstand.json`, die Typen stehen in
  `lib/daten.ts`. Die Datei ist über 300 KB groß. Wer mit knappem Kontext
  arbeitet, liest sie in Abschnitten.
- Die Texte der Startseite stehen unter `produktseite`. Zahlen und Termine gehören
  nicht dorthin; die rechnet der Code aus den übrigen Daten.
- `FREIGABE` wählt die Fassung: `intern` (ohne Angabe), `oeffentlich` oder
  `alles`. GitHub Pages baut bei jedem Push auf `main` die Fassung `alles` unter
  dem Pfad `/kiKollege`. Die öffentliche Fassung wird weiter gebaut und geprüft,
  bis ihr Abbau entschieden ist.
- Eigene Dateien wie Bilder oder den Film verlinkt der Code über `pfad()` aus
  `lib/pfad.ts`. Ohne die Funktion fehlt auf Pages der Pfad `/kiKollege`.
- Die gebaute Seite in `out/` braucht zum Ansehen einen Server. Über `file://`
  fehlen Stile und Skripte, weil die Dateien absolut verlinkt sind.

## Ändern, ohne etwas zu verlieren

- **Ändern ist erlaubt, entfernen nicht.** `pruefe:bestand` vergleicht bei jedem
  Pull Request die Daten mit dem Zielzweig. Bekommt ein Eintrag mit Kennung oder
  Titel einen neuen Namen, steht der alte in `umbenanntVon` daneben. So geschah
  es am 29.10., als die Szene `fortschritt` in `ueberblick` aufging.
- **Keine Zahl in der Prosa im Code**, auch nicht auf der Startseite. Dort stand einmal
  „drei Phasen“ fest im Text und wäre mit dem nächsten Plan falsch gewesen; jetzt
  zählt der Code.
- **`stand` mitziehen.** Wer etwas nachträgt, setzt `stand` und
  `herkunft.erzeugt` auf den Tag. Die Startseite zeigt `stand` als „Stand der Daten“
  auf dem Zeitstrahl und im Film.
- **Einzelheiten auf der Startseite.** Welche Abschnitte unter welcher Szene stehen,
  legt `EINZELHEITEN` in `app/page.tsx` fest. Was früher Landing Page und `/stand/`
  beide zeigten, lässt `DOPPELT` an einer Stelle weg. Ein neuer Abschnitt in
  `lib/lpAbschnitte.ts` oder auf `/stand/` braucht dort einen Platz, sonst meldet
  `pruefe:start` ihn als fehlend.
- **Nur die Startseite geändert?** Dann liefert `/stand/` danach dasselbe HTML wie
  vorher. Keine Prüfung sieht das von selbst: vor und nach der Änderung bauen und
  `out/stand/index.html` vergleichen.

## Version 1.0

Am 06.11.2026 wird das Vorhaben als Version 1.0 vorgestellt, vor der
Geschäftsführung und dem Team. Sie ist ein Gesamtstand, kein erreichter
Meilenstein: Das Team kommt weiter erst nach dem Prüfstand dazu.

- `version` in den Daten trägt Nummer, Datum und den Text „Was heute steht“. Die
  Spalte „Was noch fehlt“ rechnet `app/page.tsx` aus den offenen Meilensteinen und
  aus `entstanden.projekte[].offen`. Das hält niemand von Hand nach.
- Die Nummer im Kopf und im Einstieg kommt aus `version.nummer`, die Nummer des
  Pakets in `package.json` wird von Hand mitgezogen.
- Eine neue Version entscheidet der Projektverantwortliche. Weder Gregor Dev noch der
  Standwächter ändern `version`.

## Management Summary

Ein Kasten auf der Startseite direkt unter dem Einstieg, für die Geschäftsführung,
in der Anrede „du“ wie der Rest der Seite. Er zeigt Ampel, Status, hohe Risiken, was die
Geschäftsführung entscheiden muss, Nutzen und Aufwand. Bis auf die Ampel und die
Auswahl der offenen Punkte kommt alles aus Daten, die schon da sind.

- **Die Ampel** (`ampel`) setzt nur der Projektverantwortliche, von Hand: Farbe
  (`gruen`, `gelb`, `rot`), ein Satz Begründung, Datum. Sie ist ein Urteil,
  keine Rechnung. Gregor Dev und der Standwächter ändern sie nie, auch nicht ihr
  Datum. Ist sie älter als vierzehn Tage, steht im Browser des Lesers „nicht
  aktuell“ daneben.
- **Was die Geschäftsführung entscheiden muss**, sind die offenen Punkte mit
  `geschaeftsfuehrung: true`. Ein erledigter Punkt fällt von selbst heraus. Wer
  einen Punkt neu markiert, fragt vorher den Projektverantwortlichen.
- Kosten in Euro sind nicht erfasst; der Kasten sagt das.

## Was schon entstanden ist

Seit dem 02.11.2026 zeigt die Seite, was mit den KI-Mitarbeitern gebaut wurde:
auf der Startseite als Szene Ergebnisse mit den Köpfen von Gregor Dev und Theo,
unter ihren Einzelheiten als Abschnitt `entstanden` und in der Management Summary
als kurze Liste. Alles kommt aus
`entstanden` in den Daten.

- **Ein Projekt je Eintrag** in `entstanden.projekte`: `art` ist `laeuft`, `bau` oder
  `pflege`, dazu Status als kurzes Wort, was es ist, wer es gebaut hat, wie weit es
  ist und was fehlt.
- **Ehrlich nach Beitrag:** Was die Werkbank übernommen hat, steht bei `wer`, auch
  wenn es den KI-Mitarbeiter schlechter aussehen lässt.
- **Zahlen nachziehen:** Status und Stand von WMC Inventar ändern sich mit jedem
  Paket und jedem Lauf von Theo. Dazu gehören die Chronik und `meilensteinplanAktuell.heute`.
- **Keine Adressen und keine Nummern:** keine Rechnernamen, keine Ports, keine
  Jira-Vorgänge und keine Commits, wie überall.
- **Fertig heißt abgenommen.** „Läuft“ sagt nur, dass es im Einsatz ist. Abgenommen
  hat es erst der Projektverantwortliche.

## Was nicht auf die Seite darf

Das Repository ist öffentlich. Commit-Nachrichten, Zweignamen und Texte von Pull
Requests sind sofort sichtbar, auch vor dem Merge.

- Nie auf die Seite, in die Daten, in einen Commit oder einen Pull Request:
  Befunde zur Sicherheit, Rechnernamen, Adressen, Ports, Versionen von Diensten,
  Schlüssel, Benutzer, Pfade, Einzelheiten der technischen Grenze, Profilnamen,
  fremde Kennungen wie Ticketnummern, Auftragsnummern, Zweignamen und Befehle.
  Produktnamen sind seit dem 23.10. erlaubt.
- Die KI-Mitarbeiter stehen mit ihren Namen auf der Seite, Menschen aus dem Team
  nicht. Im Fuß steht der Geschäftsführer als Pflichtangabe.
- Der Name des Projektverantwortlichen steht in keiner gebauten Seite,
  `pruefe:ausgabe` schlägt sonst an. Auf der Seite heißt er „der
  Projektverantwortliche“.
- Prüfstandläufe stehen in `training.laeufe`, eine Zeile je Lauf, nur Kennzahlen
  und Bereiche. Keine Fallnummern, keine Einzelheiten der Grenze, keine Namen von
  Menschen, keine Pfade.
- `gelernt` der letzten Zeile speist die Startseite und beide Filme. Ein Lauf im
  Übungsprofil ändert es nicht, dort bleibt der Stand des Betriebs stehen. Ein
  gestoppter Lauf trägt richtige Antworten als `wackelig`, weil erfüllt drei von
  drei verlangt; die Zahlen je Bereich stehen dann in `was`.
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
npm run pruefe:start
npm run pruefe:film
FREIGABE=oeffentlich npm run build
npm run pruefe:oeffentlich
npm run pruefe:ausgabe
```

- `pruefe:start` und `pruefe:film` lesen den Bau mit `FREIGABE=alles`. Ein
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

## Bewegung auf der Startseite

`components/start/Bewegung.tsx`, mit GSAP und ScrollTrigger, Lenis glättet das
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

- Rund 30 Sekunden, mit Stimme, 1920 × 1080, möglichst unter 3 MB, gebaut mit
  HyperFrames: HTML und GSAP, Bild für Bild gerendert. Weicht die Länge um mehr als
  eine Sekunde ab, bricht `baue:film` ab. `scripts/film-daten.mjs` nimmt jeden Satz
  und jede Zahl aus den Daten. Drehbuch, Prüfung und was aus dem früheren Labor
  übernommen wurde, steht in `film/`.
- **Die Stimme** kommt lokal von Piper, seit dem 05.11.2026. Kein Text geht an einen
  fremden Dienst. Nur Thorsten und Kerstin, beide CC0; andere deutsche Modelle sind
  nicht kommerziell lizenziert oder ungeklärt. Keine Musik, keine Geräusche.
- **Die Stimme ist die Uhr:** Wörter und Karten kommen, wenn sie gesprochen werden,
  die Zeiten kommen aus den gemessenen Sprachdateien. Die Sätze stehen in
  `filmDaten().stimme`, die Aussprache in `AUSSPRACHE` in `scripts/stimme.mjs`, nur
  für die Stimme und nie für das Bild.
- **Auf der Seite** startet ein Film stumm, solange er zu sehen ist. Der Knopf „Mit Ton
  von vorn abspielen“ spielt ihn einmal ganz mit Ton. Die Untertitel stehen in
  `film/*.vtt` und im Feld `untertitel` der `stand.json`.
- Rot trägt je Bild genau ein Motiv.
- Ändern sich die gezeigten Daten, meldet `pruefe:film` das als Hinweis.
- Der Fingerabdruck erfasst auch den gesprochenen Text, seine Aussprache und die
  Einstellung der Stimme. Bis zum nächsten Rendern zeigt der Film den alten Stand.
- Gerendert wird mit `npm run baue:film` auf einem Rechner mit ffmpeg, Chrome und
  Piper: `KIKOLLEGE_STIMMEN` nennt den Ordner, sonst gilt ein Ordner `stimmen`
  oberhalb des Repositorys. Die Stimmen liegen nicht im Repository.
  Das Skript ruft HyperFrames in fester Version über npx auf, ohne Telemetrie.
- **Erst zeigen, dann einbauen** (seit 30.10.2026): Ein neuer oder neu
  gerenderter Film geht zuerst als Datei an den Projektverantwortlichen in den
  Chat. Erst nach seinem Okay werden Film, Standbild, Untertitel und
  `film/stand.json` committet und auf der Seite eingebaut.
- Der Standwächter und Gregor Dev rendern nicht. Sie erwähnen einen veralteten
  Film in ihrer Meldung.
- In der öffentlichen Fassung fehlt der Film, weil er den intern freigegebenen
  Plan zeigt.

## Die Szene Aufbau

- Seit dem 05.11.2026 zeigt sie fünf Darstellungen auf dunkler Bühne: die Ringe um das
  Sprachmodell (`anatomie`), die Akte als Datei (`schichten`, `beschreibungsdatei`), die zwei
  Orte mit der Ablage (`landschaft`), den Weg eines Auftrags (`techstack.ablauf`) und die
  Bausteine (`techstack.gruppen`). Alles kommt aus den Daten.
- **Was dort steht, fehlt in den Einzelheiten.** `DOPPELT` in `app/page.tsx` nimmt Stapel,
  Quelltext, Landschaft und Ablauf dort heraus. Auf `/stand/` stehen die alten Grafiken weiter.
- **Der Weg** kennt genau sieben Schritte in fester Reihenfolge (`AufbauWeg.tsx`). Kommt ein
  Schritt dazu, braucht er einen Platz in der Zeichnung.

## Der Film der Mannschaft

- „Ein Tag mit der Mannschaft“: rund 93 Sekunden, Grenze unter 100, mit Stimme,
  gebaut wie der erste Film. Die Länge kommt aus den Sprachdateien. Die
  KI-Mitarbeiter, die schon arbeiten, stellen sich in Ich-Form vor, zeigen ein
  Beispiel und sagen, was sie nie tun. Er steht auf der Startseite unter der Galerie.
- **Stimmen** stehen in der Tabelle `SPRECHER`: die Kollegen mit Thorsten, durch Tempo
  und Tonhöhe unterschieden, julia-trend mit Kerstin.
- **Die Figuren leben:** Sie atmen, blinzeln und nicken, der Mund läuft im Takt der
  Satzlänge. Der Film gruppiert nur die Teile der Zeichnung (Tabelle `TEILE`). Ändert
  jemand eine Zeichnung, schlägt ein Test an, dann `TEILE` nachziehen.
- **Sätze** stehen in `produktseite.vorstellung`. Paketzahl und Trainingsstand kommen
  aus `entstanden` und `training.laeufe`, die Zeichnungen aus dem Code der Figuren.
- **Die Uhr** ist nur bei Arnold, Gregor Dev und julia-trend eine echte Zeit. Bei den
  anderen zeigt sie, dass der Tag vergeht; ihr Text nennt den wahren Anlass. Der große
  Zeiger kriecht beim Sprechen weiter.
- **Er veraltet schnell**, denn jede neue Paketzahl von WMC Inventar und jeder neue
  Trainingsstand ändert ihn. `pruefe:film` meldet das als Hinweis. Neu gerendert wird
  mit `npm run baue:vorstellung`, nicht bei jedem Paket, sondern wenn es sich lohnt.
- **Erst zeigen, dann einbauen** gilt auch hier: erst in den Chat, nach dem Okay
  Film, Standbild, Untertitel und `film/vorstellung/stand.json` committen.
- Die öffentliche Fassung zeigt ihn nicht, weil julia-trend darin vorkommt; nur ihr
  Abschnitt ist in den Daten intern. Drehbuch und Prüfung stehen in `film/vorstellung/`.

## Die Systemdemo

- „Ein Auftrag, einmal ganz durch“: rund 74 Sekunden, mit Stimme, 1920 × 1080, gebaut wie
  der Film der Mannschaft. Ein Prüfauftrag geht vom Handy über Hermes Agent, Qwen und den
  Zaun aufs Board, Fritz prüft, der Befund kommt unverändert zurück. Er steht in der Szene
  Anwenden, seit dem 06.11.2026.
- **Woher alles kommt** steht in `film/systemdemo/DREHBUCH.md`, Titel und Satz darunter in
  `produktseite.systemdemo`. Nachgestellt und im Film so gekennzeichnet sind der Wortlaut
  der Nachricht, Telegram, das Board und die übrigen Fragen des Quiz.
- **Neu rendern** mit `npm run baue:systemdemo`, wenn `pruefe:film` einen Hinweis meldet,
  etwa nach einem neuen Beispielbefund oder geänderten Schritten des Wegs. Der Stand der
  Daten allein macht ihn nicht veraltet, er steht nicht im Bild.
- **Erst zeigen, dann einbauen** gilt auch hier: erst in den Chat, nach dem Okay in einen Commit.

## Figuren der KI-Kollegen

Seit dem 31.10.2026 hat jeder KI-Mitarbeiter fünf Zeichnungen. Sie stehen als SVG
im Code unter `components/figuren/kollegen/`, eine Datei je Kollege, die
gemeinsamen Bausteine in `basis.tsx`. `index.ts` ordnet sie den Kennungen in
`mannschaft.koepfe` zu.

- **Die fünf Grafiken:** bei der Arbeit (Strichzeichnung), Arbeitsplatz
  (isometrisch, ohne Figur), was er nie tut, Sinnbild und Kopf.
- **Auf der Startseite** steht in jeder Karte der Galerie die Zeichnung bei der Arbeit, im
  Chat der Szene Anwenden der Kopf von Hermes. Die übrigen Grafiken sind
  gezeichnet, aber noch nicht eingebaut.
- **Niedrige Bildschirme:** In der angehefteten Galerie wird das Bild mit der
  Fensterhöhe kleiner und fällt unter 720 Pixeln Höhe weg, damit die Karte ganz
  zu sehen ist. Wer Text in den Karten verlängert, prüft das bei 1300 × 720.
- **Rot** trägt in jedem Bild genau ein Motiv: das, was der Kollege weitergibt.
  In der Grenze ist es die rote gestrichelte Linie, die er nicht überschreitet.
- **Gesichter liegen auf Papier** (`papier` an `Bild`, `Rund` für den Kopf). Im
  dunklen Thema bleiben sie hell, sonst bekämen sie weißes Haar und ein dunkles
  Gesicht. Isometrische Bilder kehren sich mit dem Thema um.
- **Kein Text in den Zeichnungen**, und nichts aus „Was nicht auf die Seite darf“.
- Jede Figur muss sich auf den ersten Blick von den anderen unterscheiden.
  Welche Merkmale vergeben sind, steht im Kopfkommentar jeder Datei.
- Die Kennungen von `clipPath` und `mask` sind je Grafik fest. Steht dieselbe
  Grafik zweimal auf einer Seite, gibt es sie doppelt. Das vermeiden.
- **Erst zeigen, dann einbauen:** Neue oder geänderte Figuren gehen wie der Film
  zuerst als Bild an den Projektverantwortlichen in den Chat.
- Gregor Dev und der Standwächter ändern an den Figuren nichts ohne Bauauftrag.

## Wer was tut

- **Gregor Dev** pflegt die Seite: montags und donnerstags ein Pflegelauf, der nur
  `data/projektstand.json` ändert, dazu Bauaufträge auf Karte. Seine Akte liegt in
  der Ablage. Bis er ein eigenes Konto auf GitHub hat, stellt die Werkbank seine
  Pull Requests.
- **Die Werkbank** (Claude Code) übernimmt größere Umbauten: die Startseite, die
  Bewegung, den Film.
- **Der Standwächter** folgt `.claude/skills/standwaechter/SKILL.md`. Dort steht
  auch, welche Änderung in welches Feld gehört.
- **Der Projektverantwortliche** gibt frei und führt zusammen. Niemand sonst
  merged, auch nicht automatisch. Baut ein Zweig auf einem offenen auf, geht sein
  Pull Request gegen diesen Zweig.

## Offen am 05.11.2026

- Der Film der Mannschaft ist vom 05.11. Ändert sich der Stand von WMC Inventar, meldet
  `pruefe:film` das als Hinweis. Neu gerendert wird wieder zuerst für den Chat.
- Die Stimmen hat beim Bau niemand gehört, sie sind nur gemessen. Die Aussprache steht
  bis zum ersten Abhören unter Vorbehalt.
- In den Stopps des Films der Mannschaft unter `produktseite.vorstellung` stehen Zahlen
  und Termine, entgegen der Regel für `produktseite`.
- Zahlen, die nicht zueinander passen (Lesetest vom 29.10.): zehn oder elf
  Themenkomplexe, eine von 10 oder eine von 26 Regeln. Der Pflegelauf um 7 und um
  9 Uhr ist kein Widerspruch: Gregor Dev läuft um 7, die Werkbank prüft um 9.
- Wen ein neuer Mitarbeiter ansprechen soll, sagt die Seite nicht, weil sie den
  Namen des Projektverantwortlichen nicht nennt.
- Wie die Filme in Teams oder in einer Präsentation wirken, hat noch niemand
  gesehen.
- Der Abbau der öffentlichen Fassung.
- Wo Arbeitsplatz, Grenze, Sinnbild und Kopf der KI-Kollegen auf die Seite
  kommen. Reporter und Entwickler haben schon ein Gesicht, laufen aber noch
  nicht. Die Grenze von Gregor Dev zeigt „nichts entfernen“, nicht „nicht
  zusammenführen“; dafür fand sich kein Bild ohne Worte.
