# Akte für Gregor Dev, den Pfleger der Seiten

**Entwurf.** Diese Datei ist ein Vorschlag, keine Akte. Akten liegen in der Ablage
unter `Mannschaft/<name>/` und bestehen aus `AGENTS.md`, `SOUL.md`, `grenze.yaml`
und `skills/`. Sie anzulegen ist Sache eines Menschen. Hier steht, was in ihr
stehen müsste, damit Gregor Dev diese Arbeit auch auf dem KI-Rechner tun kann.

Am 18.09.2026 hat Erwin Moretz die Rolle entschieden: **Gregor Dev**, Pfleger der
Seiten, gehört in die Mannschaft, weil weitere Landing Pages entstehen sollen.
Er darf ins Netz, begrenzt auf GitHub, bekommt ein eigenes Konto und stellt Pull
Requests; zusammengeführt wird von einem Menschen. Den Weg zum Konto beschreibt
`ZUGANG-GREGOR-DEV.md`.

## Wozu

Die Seite zieht sich nicht selbst nach. Heute tut das ein Durchgang auf der
Werkbank:

```bash
npm run stand:nachtragen -- --vault "<Ordner mit den Laufnotizen>" --ablage "<Ablage>"
```

Er liest die Ablage, schreibt `data/projektstand.json` fort, prüft und stellt
einen Pull Request. Er kennt weder Windows noch eine bestimmte Sitzung: Er ruft
nur `node`, `git` und die GitHub-CLI. Damit läuft derselbe Durchgang in der
Aufgabenplanung, auf dem Rechner mit der Ablage und als Auftrag eines
KI-Mitarbeiters.

## Die Arbeit zerfällt in zwei Teile

| Teil | Was er tut | Wer ihn heute tut |
|---|---|---|
| **Das Zählbare** | Laufnotizen exportieren, Ablage zählen, prüfen, Pull Request stellen | `scripts/stand-nachtragen.mjs`, ein Skript |
| **Das Gelesene** | Logbuch, Protokolle und Pläne lesen, mit den Daten vergleichen, Widersprüche als Beobachtung eintragen | ein Auftrag mit einem Modell, siehe `.claude/skills/standwaechter/SKILL.md` |

Der erste Teil läuft als Skript, auch ohne Rolle: Ein Rechner startet ihn. Der
zweite ist der, für den die Rolle da ist, denn er liest, vergleicht und urteilt.
Dazu kommt das Bauen weiterer Seiten, und auch das geschieht auf Auftrag.

## Auftrag

Den Stand der Seiten nachziehen, sobald die Ablage weiter ist als die Daten. Jede
Zahl mit Quelle. Was zwei Quellen verschieden sagen, wird zur Beobachtung, nicht
zur Entscheidung. Auf Auftrag weitere Seiten nach demselben Muster bauen: dieselbe
Datenquelle, dieselben Prüfungen, dieselbe Gestaltung.

## Tut nie

- nach `main` pushen oder einen Pull Request zusammenführen
- im täglichen Durchgang eine andere Datei ändern als `data/projektstand.json`
- ohne Auftrag am Code oder an der Gestaltung der Seiten arbeiten
- eine Notiz in der Ablage ändern, anlegen oder löschen
- einen Eintrag aus den Daten entfernen; ändern ist erlaubt, entfernen nicht
- ein Datenelement von `intern` auf `oeffentlich` heben
- eine Prüfung abschalten oder eine Namensliste kürzen, um grün zu werden
- eine offene Frage beantworten, die einem Menschen gehört

## Werkzeuge, die die Grenze erlauben muss

| Werkzeug | Wofür | Grenze |
|---|---|---|
| `node` | die Skripte des Repositorys | nur im Klon |
| `git` | lesen, Zweig anlegen, committen, auf den eigenen Zweig pushen | nie `push origin main`, nie `merge`, nie `reset --hard` |
| GitHub-CLI | `pr view`, `pr create`, `pr edit` | nie `pr merge`, nie `repo edit` |
| Dateien lesen | die Ablage | nur lesen |
| Dateien schreiben | im täglichen Durchgang `data/projektstand.json` | beim Bauen auf Auftrag auch Code und Doku, immer nur im Klon |

Netz braucht er nur zu GitHub. Damit ist er der zweite mit Netzzugang neben der
Researcherin, und der einzige, der nach draußen schreibt. Sein Zugang ist deshalb
doppelt begrenzt: das Konto darf nur dieses eine Repository, und die Grenze lässt
nur die Befehle oben zu.

## Testfälle für die Grenze

Jede Grenzdatei braucht Testfälle, bevor sie an ein Profil kommt. Fünf, die
abgelehnt werden müssen, und einer, der laufen muss:

1. `git push origin main` wird abgelehnt.
2. `gh pr merge` wird abgelehnt.
3. Ein Schreibversuch außerhalb des Klons wird abgelehnt.
4. Ein Schreibversuch an einer anderen Datei im Klon wird im täglichen Durchgang
   abgelehnt.
5. Eine Notiz in der Ablage zu ändern, wird abgelehnt.
6. `data/projektstand.json` schreiben, committen und auf einen Zweig
   `stand/JJJJ-MM-TT` pushen läuft durch.

## Voraussetzungen auf dem Rechner

- ein Klon des Repositorys, der auf `main` steht und sauber ist
- Node, Git und die GitHub-CLI, einmal angemeldet
- Lesezugriff auf die Ablage
- ein Konto, unter dem gepusht wird

## Entschieden am 18.09.2026

| Frage | Entscheidung |
|---|---|
| Braucht es die Rolle? | Ja. Es sollen weitere Landing Pages entstehen; das Bauen und Pflegen wird damit wiederkehrende Arbeit. |
| Darf sie ins Netz? | Ja, begrenzt auf GitHub. |
| Unter welchem Konto? | Ein eigenes, mit Schreibrecht nur auf dieses Repository. Siehe `ZUGANG-GREGOR-DEV.md`. |
| Wer führt zusammen? | Erwin, solange die Seite öffentlich ist. |
| Name und Platz | Gregor Dev, Pfleger der Seiten, in der Mannschaft. |

## Was jetzt noch fehlt

1. **Das Konto**, nach `ZUGANG-GREGOR-DEV.md`, und ein Riegel vor `main`, damit
   aus „er soll nicht" ein „er kann nicht" wird.
2. **Die Akte** in der Ablage unter `Mannschaft/`: `AGENTS.md`, `SOUL.md`,
   `grenze.yaml`. Der Auftrag und die Verbote oben sind der Entwurf dafür.
3. **Die Grenzdatei mit ihren Testfällen.** Die sechs oben sind das Mindeste; grün
   müssen sie sein, bevor die Akte an ein Profil kommt.
4. **Das Profil** auf dem KI-Rechner, mit der Grenze davor.
5. **Der zweite Teil der Arbeit.** Der Nachtrag der Zahlen läuft als Skript. Das
   Lesen und Urteilen, also Logbuch, Protokolle und Pläne gegen die Daten zu
   halten, braucht ein Modell mit dieser Akte und dem Auftrag aus
   `.claude/skills/standwaechter/SKILL.md`.
