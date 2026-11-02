# Drehbuch: Ein Tag mit der Mannschaft

Die Kompositionen schreibt `scripts/vorstellung-daten.mjs` aus `data/projektstand.json`, gerendert wird mit `npm run baue:vorstellung`.

```text
ZIEL:      Wer den Film gesehen hat, kennt die KI-Mitarbeiter, die schon arbeiten, weiß,
           was jeder kann und was keiner tut, und dass am Ende ein Mensch entscheidet.
AUSGABE:   HyperFrames, 1920 x 1080, 30 Bilder je Sekunde, MP4 (H.264, CRF 26)
ZEIT:      79,2 s; ohne Ton, so gewählt am 02.11.
LOOK:      Die CI der Seite wie im ersten Film. Grund Tiefschwarz #140B0B, Dämmerung
           #241414, Morgen #F4EFEF, Tag #FFFFFF; Rot #F40E0E. Inter Variable, Ich-Satz
           88 px, Lesetext mindestens 28 px. Zeichnungen auf weißem Papier.
DINGE:     die Uhr, deren Zeiger nur im Schwenk laufen; je Kollege seine Zeichnung bei
           der Arbeit und ein eigenes Beispiel; die rote gestrichelte Linie vor dem,
           was er nie tut.
BEWEGUNG:  Schwenk expo.inOut 0,9 s von Arbeitsplatz zu Arbeitsplatz; Ich-Satz aus der
           Maske power4.out; das rote Motiv der Zeichnung kommt mit back.out dazu; jedes
           Beispiel hat eine eigene Bewegung.
EINSTELLUNGEN:
  1   0,0 bis 10,2 s  Arnold, 6 Uhr: Der Zustandsbericht wird gelesen, eine Zeile fällt auf.
  2  10,2 bis 20,4 s  Gregor Dev, 7 Uhr: Browser-Startseite läuft, die Pakete füllen sich.
  3  20,4 bis 30,6 s  julia-trend, 9 Uhr: Der Bericht kommt als Nachricht an, mit Quelle.
  4  30,6 bis 40,8 s  Hermes, den ganzen Tag: Du schreibst, er fragt zurück. Noch im Training.
  5  40,8 bis 51,0 s  Fritz, auf Auftrag: 238 Use-Cases zählen hoch, der Balken teilt sich.
  6  51,0 bis 61,2 s  Theo, nach jedem Bauauftrag: Die Testbalken laufen, grün so weit, wie
                      die Tests grün sind.
  7  61,2 bis 71,4 s  Der Archivar, am Ende jeder Sitzung: Jedes kommt an seinen Platz.
  8  71,4 bis 79,2 s  Schluss: alle Köpfe, „Ein Mensch entscheidet.“, wer noch in Arbeit ist.
VERBOTEN:  Zahlen, die nicht aus den Daten kommen; Namen von Rechnern, Kennungen,
           Auftragsnummern; der Name des Projektverantwortlichen.
```
