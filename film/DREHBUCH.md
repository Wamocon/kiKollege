# Drehbuch: kiKollege in 30 Sekunden

Das Drehbuch nach dem HyperFrames-Skill (dort `SPEC.md`). Die Kompositionen schreibt `scripts/film-daten.mjs` aus `data/projektstand.json`, gerendert wird mit `npm run baue:film`. Seit dem 05.11.2026 hat der Film eine Stimme und mehr Bewegung; das ersetzt „ohne Ton“ vom 29.10.

```text
ZIEL:      Wer den Film gesehen hat, weiß, was kiKollege ist, wo das Projekt steht,
           woran es am meisten hängt und ab wann er selbst beauftragen kann.
AUSGABE:   HyperFrames, 1920 x 1080, 30 Bilder je Sekunde, MP4 (H.264, CRF 28, AAC)
ZEIT:      Rund 30 s, höchstens 1 s daneben. Die Länge kommt aus den gemessenen
           Sprachdateien; liegt sie daneben, bricht baue:film ab. Dann den Text kürzen,
           nicht hetzen.
STIMME:    Piper, lokal, eine Erzählstimme (Thorsten), Tempo unverändert. Keine Musik,
           keine Geräusche. Rund -16 LUFS. Aussprache nur für die Stimme: Tabelle in
           scripts/stimme.mjs. Gesprochen wird aus den Daten; jeder Satz steht in
           filmDaten() unter `stimme` und zählt zum Fingerabdruck.
LOOK:      Die CI der Seite. Grund Weiß #FFFFFF oder Tiefschwarz #140B0B, Tinte im
           Gegenteil, Rot #F40E0E für genau eine Sache je Bild (die Türen, das
           entscheidende Wort, das Stück bis zum Stand der Daten, die Zahl, das
           Abzeichen, der Termin). In der Anleitung läuft das Rot als Zeiger von Schritt
           zu Schritt und geht an „entscheidest du“ über.
           Inter Variable aus der Seite; Überschriften 96 px, 780, -4,5 %;
           Kernsatz 78 px; Lesetext mindestens 28 px.
           Flache Flächen, 1 px Linien, Radius 36 bis 40 px wie die Karten auf der Seite,
           ein Schatten nur unter Chat und Risikokarte. Kein Korn, kein Glühen.
DINGE:     der Chat mit Hermes wie auf der Seite; der Zeitstrahl wie auf der Seite (Linie,
           Punkte, rotes Stück bis zum Stand der Daten); je Prüffall ein Kästchen;
           die Karte des Risikos mit Abzeichen.
BEWEGUNG:  Die Stimme ist die Uhr: Wörter, Zahlen und Karten kommen, wenn sie gesprochen
           werden. In jeder Einstellung fährt die Kamera, nur das Schlussbild steht nach
           dem letzten Wort still. Ankunft expo.out oder power4.out, 0,2 bis 0,9 s;
           Wörter einzeln zu ihrer gemessenen Zeit; Chat tippt; Fortschritt linear.
ÜBERGÄNGE: Fünf Arten, jede mit einem Anlass im Bild:
           Kreis aus dem roten Wort (Vorhang zu Anwenden, clip-path);
           Peitsche nach links (Anwenden zu Überblick);
           dunkle Fläche öffnet sich aus der Linie des Zeitstrahls (Überblick zu Prüfstand);
           Karte schiebt sich schräg vor das zurücktretende Bild (Prüfstand zu Risiko);
           Wisch von links (Risiko zu Schluss). Dauer je 0,6 s.
EINSTELLUNGEN (gemessen am 05.11., ändert sich mit dem Text):
  1  0,0 bis  4,2 s  Vorhang: Wortmarke im Rot, die Türen öffnen sich auf der letzten
                     Silbe, Kernsatz Wort für Wort, „entscheidet.“ in Rot.
                     Stimme: Name, zwei Sätze Kern.
  2  4,2 bis 10,9 s  Anwenden: Überschrift färbt sich Wort für Wort, drei Schritte der
                     Anleitung mit Zeiger, im Chat tippt je Schritt eine Nachricht;
                     zuletzt „Was daraus folgt, entscheidest du.“
                     Stimme: Überschrift, die drei Schritte, der Schlusssatz.
  3 10,9 bis 14,7 s  Überblick: Die Linie zieht sich, die Kamera fährt zurück, M1 kommt,
                     wenn er genannt wird, dann das rote Stück bis zum Stand der Daten,
                     M2 mit Termin und Titel, M3 und M4 ohne Termin hinter der Linie.
                     Stimme: Überschrift, der abgenommene Meilenstein.
  4 14,7 bis 18,5 s  Prüfstand: Die Zahl zählt hoch, wenn sie fällt, je gelerntem Fall
                     füllt sich ein Kästchen.
                     Stimme: Stand des Orchestrators.
  5 18,5 bis 23,4 s  Größte Herausforderung: Die Karte des ersten eingetretenen hohen
                     Risikos kommt herein, der Titel steigt Wort für Wort.
                     Stimme: das Risiko im Wortlaut.
  6 23,4 bis 30,5 s  Schluss: wann das Team dazukommt, ab wann du beauftragen kannst,
                     Adresse der Startseite und Stand der Daten; steht bis zum Ende.
VERBOTEN:  alles aus der Liste des Skills, dazu: Zahlen oder Sätze, die nicht aus
           den Daten kommen; Namen von Rechnern, Kennungen, Auftragsnummern;
           der Name des Projektverantwortlichen; im Bild und in der Stimme das Wort
           „Labor“.
PRÜFEN:    npx hyperframes check; snapshot --review; Einzelbilder aus dem fertigen Film;
           ffprobe; ebur128 für die Lautheit; freezedetect für Standbilder; das Standbild
           zeigt kurz vor dem Ende von Einstellung 3 den ganzen Zeitstrahl.
```
