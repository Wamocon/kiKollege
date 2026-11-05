# Prüfung des Films vom 05.11.2026

Nach dem HyperFrames-Skill (dort `REVIEW.md`). Diese Fassung hat eine Stimme und mehr Bewegung; die Prüfung vom 29.10. galt dem stummen Film. Den Film hat noch niemand gehört: Der Projektverantwortliche sieht ihn zuerst, erst danach kommen Film, Standbild, Untertitel und `stand.json` ins Repository.

## Gemessen

- `npx hyperframes check`: keine Fehler. Diese Hinweise bleiben mit Absicht:
  - `content_overlap` und Kontrast bei 4,6 s und 15,2 s: Mitten im Übergang liegen zwei Einstellungen übereinander, das ist der Übergang.
  - `line_unread` für die drei Nachrichten im Chat: Die Prüfung zählt die getippten Zeichen als Wörter. Sie gehören zur Szenerie; lesen soll man die Schritte daneben.
  - `line_unread` für „Prüffälle gelernt …“ (1,4 s von gewünschten 2,6 s) und „Letzter Lauf …“: Mehr Zeit gibt die Länge nicht her. Gesagt wird die Zahl, die Zeile ist Zugabe.
- `snapshot --review`: je Einstellung Anfang und Mitte, jeder Übergang, Handybreite.
- Die fertige Datei, mit ffprobe: H.264 und AAC, 1920 x 1080, 30 Bilder je Sekunde, 30,5 s, 2,6 MB.
- Länge der Stimme: Die letzte Silbe fällt bei 28,4 s, danach steht das Schlussbild 2,1 s.
- Lautheit im fertigen Film, mit ebur128: -15,9 LUFS, höchste Spitze -3,5 dBFS.
- Gleichlauf: die 14 geplanten Satzanfänge gegen die Sprechpausen in der Tonspur des fertigen Films (silencedetect). Im Mittel 8 ms Abstand, höchstens 16 ms.
- Standbilder, mit freezedetect: Länger als 1,5 s steht nur das Schlussbild, ab 28,0 s.
- Aussprache: die Lautschrift aller Sätze gelesen, die Piper aus dem Text bildet. Unsichere Wörter stehen unten.

## Angesehen und behoben

Einzelbilder aus dem fertigen Film, mehrere je Einstellung.

- Anwenden: Das Komma des Schlusssatzes stand schon im Bild, bevor der Satz kam. Es hängt jetzt am Wort.
- Anwenden: Die Nachricht „du“ war rot wie der Schlusssatz. Sie ist jetzt grau, das Rot läuft als Zeiger von Schritt zu Schritt.
- Überblick: Auf dem Strahl war vieles rot. Rot ist jetzt nur das Stück bis zum Stand der Daten. „November“ kreuzte die Marke des Stands; die Marke läuft jetzt dahinter durch.
- Übergang zum Überblick: An den Rändern erschien in der Peitsche ein grauer Streifen. Der weiße Grund bleibt jetzt stehen, bis das alte Bild weg ist.
- Prüfstand: „6von 18“ ohne Abstand, die Zeile mit dem Ziel stand nur eine halbe Sekunde.
- Lautheit: Der Film war mit -13,1 LUFS 3 dB zu laut, weil die einkanalige Spur im Film zweikanalig wird. Gemessen wird jetzt zweikanalig.

## Nicht geprüft

- **Gehört hat den Film niemand, auch nicht beim Bau.** Betonung, Sprechmelodie und ob die Stimme angenehm klingt, sind nicht geprüft, nur Längen, Lautheit und Lautschrift.
- Unsicher bleiben in diesem Film: „kiKollege“ (gesprochen „Ka-I-Kollege“) und die englischen Wörter „Team“ und „Orchestrator“, die Piper aus seinem Wörterbuch liest.
- Innerhalb eines Satzes sind die Wortzeiten abgeleitet: gemessen sind die Längen der Satzanfänge bis zu den Merkwörtern, dazwischen verteilt nach Wortlänge. Wort und Bild können um rund 0,2 s auseinanderliegen.
- Der Film ist nicht in Echtzeit angeschaut, nur als Einzelbilder und Messwerte.
- Wie er in Teams oder in einer Präsentation wirkt, hat niemand gesehen.
- Der schwächste Moment ist der Überblick: 3,7 s für den ganzen Zeitstrahl. M2 steht lesbar im Bild, M3 und M4 sind eher Ahnung als Text.
