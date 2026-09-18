# Akte für die Rolle, die den Stand nachträgt

**Entwurf.** Diese Datei ist ein Vorschlag, keine Akte. Akten liegen in der Ablage
unter `Mannschaft/<name>/` und bestehen aus `AGENTS.md`, `SOUL.md`, `grenze.yaml`
und `skills/`. Angelegt wird eine Akte, wenn ein Mensch die Rolle entscheidet und
freigibt. Hier steht, was in ihr stehen müsste, damit die Rolle diese Arbeit auch
auf dem KI-Rechner tun kann, und was vorher zu entscheiden ist.

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

Für den ersten Teil braucht es keine Rolle, nur einen Rechner, der ihn startet.
Der zweite Teil ist der, für den eine Rolle in Frage kommt: Er liest, vergleicht
und urteilt.

## Auftrag

Den Stand der Seite nachziehen, sobald die Ablage weiter ist als die Daten. Jede
Zahl mit Quelle. Was zwei Quellen verschieden sagen, wird zur Beobachtung, nicht
zur Entscheidung.

## Tut nie

- nach `main` pushen oder einen Pull Request zusammenführen
- eine andere Datei im Repository ändern als `data/projektstand.json`
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
| Dateien schreiben | `data/projektstand.json` im Klon | genau diese eine Datei |

Netz braucht die Rolle nur zu GitHub. Heute hat in der Mannschaft nur die
Researcherin einen Netzzugang; für diese Rolle ist er zu entscheiden.

## Testfälle für die Grenze

Jede Grenzdatei braucht Testfälle, bevor sie an ein Profil kommt. Fünf, die
abgelehnt werden müssen, und einer, der laufen muss:

1. `git push origin main` wird abgelehnt.
2. `gh pr merge` wird abgelehnt.
3. Ein Schreibversuch außerhalb des Klons wird abgelehnt.
4. Ein Schreibversuch an einer anderen Datei im Klon wird abgelehnt.
5. Eine Notiz in der Ablage zu ändern, wird abgelehnt.
6. `data/projektstand.json` schreiben, committen und auf einen Zweig
   `stand/JJJJ-MM-TT` pushen läuft durch.

## Voraussetzungen auf dem Rechner

- ein Klon des Repositorys, der auf `main` steht und sauber ist
- Node, Git und die GitHub-CLI, einmal angemeldet
- Lesezugriff auf die Ablage
- ein Konto, unter dem gepusht wird

## Was vorher ein Mensch entscheidet

1. **Braucht es die Rolle?** Die Auswahlregel des Hauses fragt, welche
   menschliche Tätigkeit knapp ist. Der Nachtrag der Zahlen ist heute nicht
   knapp: Das Skript macht ihn. Knapp ist das Lesen und Urteilen.
2. **Darf sie ins Netz?** Ohne Zugang zu GitHub kann sie keinen Pull Request
   stellen. Dann bleibt der Weg: Sie schreibt die Datei, ein Mensch oder eine
   zweite Stelle stellt den Pull Request.
3. **Unter welchem Konto pusht sie?** Ein eigenes Konto mit Schreibrecht nur auf
   dieses Repository ist sauberer als das Konto eines Menschen.
4. **Wer führt zusammen?** Nach dem heutigen Stand ein Mensch, und dabei sollte
   es bleiben, solange die Seite öffentlich ist.
5. **Wie heißt sie, und gehört sie in die Mannschaft?** Namen vergibt Erwin. Die
   Seite nennt die Aufgabe bisher Standwächter, und das ist ein Auftrag, keine
   Rolle.
