# Prüfung des Films der Mannschaft vom 05.11.2026

Nach dem HyperFrames-Skill. Diese Fassung hat Stimmen und mehr Bewegung; die Prüfung vom 02.11. galt dem stummen Film. Den Film hat noch niemand gehört: Der Projektverantwortliche sieht ihn zuerst, erst danach kommen Film, Standbild, Untertitel und `stand.json` ins Repository.

## Gemessen

- `hyperframes check`: keine Fehler. Diese Warnungen bleiben:
  - `gsap_repeated_fromto_without_baseline`: betrifft die Zählanimation; auf den Einzelbildern hat sie nichts Sichtbares ergeben.
  - `line_unread` für zwei getippte Nachrichten: Die Prüfung zählt die Zeichen als Wörter. Sie stehen 9 und 12 s im Bild.
- `snapshot --review`: Standbilder je Einstellung, die Schnitte und die Handybreite.
- Die fertige Datei, mit ffprobe: H.264 und AAC, 1920 x 1080, 30 Bilder je Sekunde, 92,7 s, 11,3 MB.
- Lautheit im fertigen Film, mit ebur128: -15,9 LUFS, höchste Spitze -2,3 dBFS.
- Gleichlauf: die 31 geplanten Satzanfänge gegen die Sprechpausen in der Tonspur des fertigen Films. Im Mittel 8 ms Abstand, höchstens 18 ms.
- Standbilder, mit freezedetect: Länger als 1,5 s steht nur das Schlussbild, von 89,7 s bis zum Ende.
- Stimmen, gemessen an den Sprachdateien: Der mittlere Grundton reicht von rund 102 Hz (Archivar) bis rund 138 Hz (Theo), julia-trend liegt bei rund 174 Hz. Am engsten liegen Hermes und Fritz, die direkt aufeinander folgen: rund 125 und 116 Hz. Das ist eine grobe Schätzung aus der Autokorrelation.
- Aussprache: die Lautschrift aller Sätze gelesen, die Piper aus dem Text bildet.

## Angesehen und behoben

Einzelbilder aus dem fertigen Film, mehrere je Einstellung.

- Rot: Zeichnung, Beispiel und Linie waren oft gleichzeitig rot. Jetzt wandert das Rot mit dem Gesagten, je Bild genau ein Motiv.
- Gregor Dev: Die vollen Kästen sahen aus wie „fertig“. Sie sind jetzt weiß und treten zurück, sobald „nicht abnahmefähig“ gesagt wird; das steht groß und rot im Bild, bis er aus dem Bild ist.
- Archivar: Die Punkte der Ablage standen im Bild, bevor ihre Zeile kam.
- julia-trend: Der Anhänger lief beim Schwingen aus dem Rahmen. Arm und Schub sind geändert.
- Fritz: Zwei Teile trugen dieselbe Kennung, die Zahl im Beispiel und der Kopf der Figur. Daher kamen Warnungen der Prüfung.
- Lautheit: Der erste Stand war 3 dB zu laut, siehe die Prüfung des kurzen Films.

## Weicht von den Daten ab

Theo zeigt bei WMC Inventar 110 von 186 grün, Lauf vom 05.11. In `produktseite.vorstellung` steht noch 112 von 186 vom 04.11. Der Film nimmt die Zahl aus `entstanden` und lässt das Feld, wie es ist.

## Nicht geprüft

- **Gehört hat den Film niemand, auch nicht beim Bau.** Ob man die Kollegen wirklich auseinanderhält, ist nur gemessen. Tonhöhe und Tempo sind leicht geändert, das kann künstlich klingen. Kerstin ist ein Modell niedriger Qualität und dürfte dumpfer klingen als Thorsten.
- Unsichere Aussprache: „Gregor Dev“ (gesprochen „Deff“), „julia-trend“ („Julia Trend“), „Academy“ („Äkäddemi“), „Archivar“ („Archi Var“, damit die Betonung hinten liegt), „Reporter“ („Re-Porter“), „KI“ („Ka-I“).
- Innerhalb eines Satzes sind die Wortzeiten abgeleitet, siehe die Prüfung des kurzen Films.
- Die Lippen bewegen sich im Takt der Satzlänge, nicht lautgetreu.
- Der Film ist nicht in Echtzeit angeschaut, nur als Einzelbilder und Messwerte.
- Wie er in Teams oder in einer Präsentation wirkt, hat niemand gesehen.
- Der schwächste Punkt: Auf dem Handy ist die Schrift der Beispiele kaum zu lesen. Für die große Leinwand reicht sie.
