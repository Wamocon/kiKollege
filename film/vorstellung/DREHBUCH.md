# Drehbuch: Ein Tag mit der Mannschaft

Die Kompositionen schreibt `scripts/vorstellung-daten.mjs` aus `data/projektstand.json`, gerendert wird mit `npm run baue:vorstellung`. Seit dem 05.11.2026 sprechen die KI-Mitarbeiter selbst, und das Bild folgt ihren Stimmen; das ersetzt „ohne Ton“ vom 02.11.

```text
ZIEL:      Wer den Film gesehen hat, kennt die KI-Mitarbeiter, die schon arbeiten, weiß,
           was jeder kann und was keiner tut, und dass am Ende ein Mensch entscheidet.
AUSGABE:   HyperFrames, 1920 x 1080, 30 Bilder je Sekunde, MP4 (H.264, CRF 29, AAC)
ZEIT:      So lang, wie die Sätze brauchen, unter 100 s; darüber bricht baue:vorstellung
           ab. Die Länge kommt aus den gemessenen Sprachdateien.
STIMME:    Piper, lokal. Jeder spricht in Ich-Form: `ich`, `kann`, `nie` aus den Daten.
           Die Kollegen mit Thorsten, unterschieden durch Sprechtempo und kleine
           Tonhöhe (Tabelle SPRECHER im Code), julia-trend mit Kerstin. Den Schluss spricht
           Thorsten ohne Änderung. Keine Musik, keine Geräusche. Rund -16 LUFS.
           Zwei Stellen sagen mehr als die drei Felder, gebaut aus den Daten: Gregor Dev
           sagt den Status von WMC Inventar im Wortlaut, Hermes seinen Trainingsstand und
           wann das Team dazukommt.
LOOK:      Die CI der Seite wie im ersten Film. Grund Tiefschwarz #140B0B, Dämmerung
           #241414, Morgen #F4EFEF, Tag #FFFFFF; Rot #F40E0E. Inter Variable, Ich-Satz
           88 px, Lesetext mindestens 28 px. Zeichnungen auf weißem Papier.
ROT:       Genau eine Sache je Bild, und es wandert mit dem Gesagten: von der Zeichnung
           zum Beispiel oder zurück, zuletzt zur gestrichelten Linie vor dem, was er nie
           tut. Bei Gregor Dev bleibt es auf „nicht abnahmefähig“, bis er aus dem Bild ist.
DINGE:     die Uhr, deren großer Zeiger beim Sprechen kriecht und im Schwenk zur nächsten
           Stunde springt; je Kollege seine Zeichnung bei der Arbeit und ein eigenes
           Beispiel; die gestrichelte Linie vor dem, was er nie tut.
BEWEGUNG:  Die Stimme ist die Uhr: Wörter, Zahlen und Karten kommen, wenn sie gesprochen
           werden. Schwenk expo.inOut 0,9 s von Arbeitsplatz zu Arbeitsplatz; Ich-Satz aus
           der Maske power4.out; Lesetext Wort für Wort. Das Bild schiebt sich in seinem
           Rahmen langsam heran, die ganze Welt treibt ein wenig.
FIGUREN:   Die Zeichnungen kommen unverändert aus components/figuren/; der Film legt nur
           Gruppen darum (Tabelle TEILE). Alle atmen, blinzeln, nicken beim Satzanfang und
           bewegen den Mund beim Sprechen, alles mit fester Saat. Das Werkzeug arbeitet:
           Arnolds Wippe kippt auf „Empfehlung“, Gregor Dev geht die Seite durch, der
           Anhänger von julia-trend schwingt, Hermes reicht den Auftrag weiter und der Weg
           zum Fach zieht sich, Fritz' Lupe bleibt auf der Fundstelle stehen, Theo hakt ab
           und zuletzt kommt das Kreuz, die Karte des Archivars sinkt in den Kasten.
EINSTELLUNGEN (gemessen am 05.11., ändert sich mit dem Text):
  1   0,0 bis 10,2 s  Arnold: Der Zustandsbericht entsteht Zeile für Zeile, eine fällt auf.
  2  10,2 bis 24,9 s  Gregor Dev: Browser-Startseite läuft, die Pakete füllen sich, der
                      Zähler läuft. Sobald er es sagt, steht groß und rot, was hinter
                      der Zahl steht; die vollen Kästen treten zurück.
  3  24,9 bis 36,3 s  julia-trend: Der Bericht kommt als Nachricht an und schreibt sich,
                      die Quelle stempelt sich dazu.
  4  36,3 bis 54,1 s  Hermes: Du tippst, er fragt zurück. Darunter Trainingsstand und Termin.
  5  54,1 bis 64,2 s  Fritz: Die Zahl der Use-Cases zählt hoch, der Balken teilt sich.
  6  64,2 bis 73,3 s  Theo: Die Testbalken laufen, grün so weit, wie die Tests grün sind.
                      Die Zahl von WMC Inventar kommt aus dem jüngsten Lauf in `entstanden`.
  7  73,3 bis 83,3 s  Der Archivar: Jedes kommt an seinen Platz.
  8  83,3 bis 92,7 s  Schluss: alle Köpfe, „Ein Mensch entscheidet.“, wer noch in Arbeit
                      ist. Steht nach dem letzten Wort still.
VERBOTEN:  Zahlen, die nicht aus den Daten kommen; Namen von Rechnern, Kennungen,
           Auftragsnummern; der Name des Projektverantwortlichen; der Eindruck, WMC Inventar
           sei fertig.
```
