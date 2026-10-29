# Drehbuch: kiKollege in 30 Sekunden

Das Drehbuch nach dem HyperFrames-Skill (dort `SPEC.md`). Die Kompositionen schreibt `scripts/film-daten.mjs` aus `data/projektstand.json`, gerendert wird mit `npm run baue:film`.

```text
ZIEL:      Wer den Film gesehen hat, weiß, was kiKollege ist, wo das Projekt steht,
           woran es am meisten hängt und ab wann er selbst beauftragen kann.
AUSGABE:   HyperFrames, 1920 x 1080, 30 Bilder je Sekunde, MP4 (H.264, CRF 26)
ZEIT:      30 s x 30 = 900 Bilder; ohne Ton, so beschlossen am 29.10.
LOOK:      Die CI der Seite. Grund Weiß #FFFFFF oder Tiefschwarz #140B0B, Tinte im
           Gegenteil, Rot #F40E0E für genau eine Sache je Bild (das entscheidende
           Wort, der erledigte Meilenstein, die Zahl, das Abzeichen).
           Inter Variable aus der Seite; Überschriften 96 px, 780, -4,5 %;
           Kernsatz 78 px; Lesetext mindestens 28 px.
           Flache Flächen, 1 px Linien, Radius 36 bis 40 px wie die Karten im Labor,
           ein Schatten nur unter Chat und Risikokarte. Kein Korn, kein Glühen.
DINGE:     der Chat mit Hermes wie im Labor; der Zeitstrahl wie im Labor (Linie,
           Punkte, rotes Stück bis zum Stand der Daten); je Prüffall ein Kästchen;
           die Karte des Risikos mit Abzeichen.
BEWEGUNG:  Ankunft expo.out oder power4.out, 0,2 bis 0,9 s; Farbflut power2.inOut
           0,35 bis 0,4 s; Abgang Unschärfe 8 px in 0,2 s; Wörter 0,07 s versetzt;
           Fortschritt linear. Eine Hauptbewegung je Einstellung.
EINSTELLUNGEN:
  1  0,0 bis  4,6 s  Vorhang: rote Türen öffnen sich, Wortmarke und Kernsatz
                     steigen aus der Maske. „entscheidet.“ in Rot.
  2  4,6 bis 10,4 s  Anwenden: Farbflut auf Weiß, drei Schritte der Anleitung,
                     daneben je Schritt eine Nachricht aus dem nachgestellten
                     Auftrag; zuletzt „Was daraus folgt, entscheidest du.“
  3 10,4 bis 16,4 s  Überblick: die Linie zieht sich, M1 abgenommen, das rote Stück
                     bis zum Stand der Daten, M2 mit Termin und Titel, M3 und M4
                     ohne Termin hinter der Linie.
  4 16,4 bis 21,6 s  Prüfstand: Farbflut auf Schwarz, die Zahl zählt hoch, je
                     gelerntem Fall füllt sich ein Kästchen.
  5 21,6 bis 26,2 s  Größte Herausforderung: die Karte des ersten eingetretenen
                     hohen Risikos kommt herein.
  6 26,2 bis 30,0 s  Schluss: ab wann du beauftragen kannst, Adresse und Stand der
                     Daten; steht bis zum Ende.
VERBOTEN:  alles aus der Liste des Skills, dazu: Zahlen oder Sätze, die nicht aus
           den Daten kommen; Namen von Rechnern, Kennungen, Auftragsnummern;
           der Name des Projektverantwortlichen.
PRÜFEN:    npx hyperframes check; snapshot --review; Standbild bei 15,6 s zeigt den
           ganzen Zeitstrahl.
```
