# Systemdemo: Spezifikation

```text
GOAL:    Wer den Film gesehen hat, kann den Weg eines Auftrags nacherzählen und weiß, dass am Ende ein Mensch entscheidet.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    aus den gemessenen Sprachdateien, Grenze unter 100 s; Ziel etwa 80 s
LOOK:    nur die CI-Farben: Weiß #FFFFFF, Tiefschwarz #140B0B, Rot #F40E0E; Flächen #F4EFEF, #241414.
         Rot trägt je Bild genau eine Sache: das, was gerade geschieht.
         Schrift Inter Variable: Zeilen im Bild 64 px / 760, Spur -3 %; Beschriftungen 30 px / 650;
         Lesetext mindestens 30 px. Monospace nur für Fundstelle und Dateinamen, 28 px.
         Kein Korn, keine Vignette, kein Leuchten. Schatten nur unter Handy und Papier: 0 24 px 60 px, 18 %.
OBJECTS: Handy (Rahmen #140B0B, 44 px Radius, Bildschirm weiß, Kopf „Orchestrator“ mit Hermes' Kopf),
         Ringe (die der Seite: vier Ringe, Mitte weiß, Beschriftung auf den Bögen),
         Qwen (weißer Block, „bekommt Text, gibt Text zurück“), Zaun (senkrechte Latten, ein Tor),
         Board (drei Spalten, eine Karte mit Fritz' Kopf), Quiz (Papierbogen, Frage 7, Option B),
         Befund (Karte mit Stufe, Text, Fundstelle).
MOTION:  Eintritt power3.out 0,5 s; Bewegung power2.inOut 0,8 s; Kamerawechsel zwischen den Welten 0,8 s power3.inOut;
         Staffel 0,08 s. Jede Bewegung landet und steht dann.
SHOTS:   1 Nachricht   weiß    Handy links, Nachricht wird getippt und gesendet; rechts die Pflichtangaben, je mit Haken,
                               wenn die Stimme „alles“ sagt.                         → die Blase fliegt nach rechts hinaus
         2 Profil      dunkel  Die Blase landet in der Mitte der Ringe; je Ring beim gesprochenen Wort.  → alles schrumpft zu Text
         3 Qwen, Zaun  dunkel  Textzeilen fließen in Qwen, Qwen gibt „Karte anlegen · für Fritz“ aus, der Zaun öffnet das Tor.
                                                                                     → die Karte fällt nach unten ins Board
         4 Board       hell    Die Karte landet in „Neu“, Fritz' Kopf kommt dazu, die Karte rückt nach „Läuft“.
                                                                                     → die Kamera fährt in die Karte
         5 Quiz        Papier  Bogen mit Frage 7; eine Lesezeile läuft; Option B wird rot umrandet.  → Option B hebt ab
         6 Befund      dunkel  Die Befundkarte wächst aus Option B: Stufe, Text, Fundstelle.         → die Karte schrumpft zur Blase
         7 Zurück      weiß    Das Handy, die Antwort kommt an, „unverändert“.        → rote Fläche steigt von unten
         8 Schluss     rot     „Ein KI-Mitarbeiter arbeitet zu. / Ein Mensch entscheidet.“, darunter der erste Lauf
                               am 16.10. und wer ab wann Aufträge gibt, zuletzt die Wortmarke.
BANNED:  dunkle Leere mit kleinen Dingen in der Mitte; Leuchten, Partikel; alles mittig; alles blendet zugleich ein;
         Text, der sich beim Lesen bewegt; Karten in einer Reihe; Logo in der Ecke; der Erzähler wiederholt das Bild Wort für Wort;
         erfundene Inhalte: Frage 7 und die übrigen Optionen sind Platzhalter, die Nachricht ist als nachgestellt markiert.
QA:      je Station ein Bild nach dem letzten Wort: Lesbares mindestens 30 px, nichts angeschnitten, das Rot an einer Stelle.
```

## Woher die Inhalte kommen

- Weg und Schritte: `techstack.ablauf.schritte`, teils wörtlich.
- Pflichtangaben: die Zeile von Fritz in `anleitung.zeilen`.
- Befund: `beispielbefund`, aus einem echten Prüflauf von Fritz.
- Erster Lauf: Meilenstein 1, abgenommen am 16.10.2026, in `meilensteinplanAktuell`.
- Schluss: `produktseite.vorstellung.kern`; ab wann das Team Aufträge gibt: die Zeile von Fritz in `anleitung.zeilen` mit dem Termin von Meilenstein 2.
- Nachgestellt: der Wortlaut der Nachricht, die Oberflächen von Telegram und Board, die übrigen Fragen und Optionen des Quiz.
