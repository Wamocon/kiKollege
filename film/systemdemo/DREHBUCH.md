# Systemdemo: Drehbuch

„Ein Auftrag, einmal ganz durch“, Stand 06.11.2026, rund 74 Sekunden, 1920 × 1080, mit Stimme (Thorsten, lokal mit Piper), ohne Musik. Gebaut mit `npm run baue:systemdemo`, die Bilder schreibt `scripts/systemdemo-daten.mjs` aus `data/projektstand.json`.

Die Stimme ist die Uhr: Jede Station dauert so lange, wie ihre Sätze gesprochen sind, und was im Bild erscheint, erscheint bei dem Wort, das es nennt.

| Station | Welt | Gesprochen | Im Bild | Quelle |
| --- | --- | --- | --- | --- |
| 1 Nachricht | hell | „Ein Auftrag an Fritz beginnt mit einer Nachricht an den Orchestrator. Sie nennt alles, was Fritz zum Prüfen braucht.“ | Handy mit Telegram, die Nachricht wird getippt und gesendet; rechts die Pflichtangaben mit Haken | Pflichtangaben: Zeile von Fritz in `anleitung.zeilen`. Nachricht nachgestellt, im Bild gekennzeichnet |
| 2 Profil | dunkel | der Schritt „Profil“ wörtlich | Die Nachricht landet in der Mitte, je Ring Akte, Seele, Skills, Gedächtnis beim gesprochenen Wort | `techstack.ablauf.schritte`, „Profil“; die vier Teile aus demselben Satz |
| 3 Qwen und Zaun | dunkel | „Das Ganze geht als Text an Qwen. Qwen wünscht sich ein Werkzeug: eine Karte für Fritz.“ und der erste Satz des Schritts „Zaun“ | Die Teile fließen in Qwen, Qwen gibt „Karte anlegen“ aus, die Kamera fährt zum Zaun, das Tor öffnet sich | `techstack.ablauf.schritte`, „Qwen“ und „Zaun“ |
| 4 Board | hell | „Die Karte liegt auf dem Board. Fritz übernimmt, mit seiner eigenen Akte.“ | Die Karte fällt in „Neu“, Fritz kommt dazu, die Karte rückt nach „Läuft“ | „Karte“ in `techstack.ablauf.schritte`. Board nachgebaut, im Bild gekennzeichnet |
| 5 Quiz | Papier | „Er prüft das Quiz gegen den Maßstab des Hauses.“ und der erste Satz des Befunds | Der Bogen mit Frage 7, eine Lesezeile, die markierte Option wird rot umrandet | `beispielbefund`. Frage und übrige Optionen sind Platzhalter, im Bild gekennzeichnet |
| 6 Befund | dunkel | der zweite Satz des Befunds und „Ein Blocker, mit Fundstelle.“ | Die Befundkarte mit Stufe, Text und Fundstelle | `beispielbefund`, aus einem echten Prüflauf von Fritz |
| 7 Zurück | hell | der Schritt „Zurück“ wörtlich | Dasselbe Handy, die Antwort kommt an; „unverändert“ | `techstack.ablauf.schritte`, „Zurück“ |
| 8 Schluss | rot | der erste Lauf am 16.10., der Kernsatz, ab wann das Team Aufträge gibt | Zeilen im Takt der Stimme, zuletzt die Wortmarke | Abnahme von Meilenstein 1 und Termin von Meilenstein 2 in `meilensteinplanAktuell`, Kernsatz in `produktseite.vorstellung.kern` |

## Aussprache

Nur für die Stimme, nie für das Bild, in `AUSSPRACHE` in `scripts/stimme.mjs`: „§ 168“ als „Paragraf 168“, „SGB IX“ als „Sozialgesetzbuch neun“, „Qwen“ als „Kwenn“. Die beiden anderen Filme enthalten diese Wörter nicht.

## Was veraltet

Der Film ändert sich, wenn sich einer dieser Werte ändert: die Schritte in `techstack.ablauf`, der Beispielbefund, die Pflichtangaben von Fritz, die Termine von Meilenstein 1 und 2, der Kernsatz. Dann meldet `pruefe:film` einen Hinweis, und der Film wird neu gerendert, wieder zuerst im Chat.
