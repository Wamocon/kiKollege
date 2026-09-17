---
name: standwaechter
description: Zieht den Projektstand KI-Mitarbeiter auf der Seite nach und stellt jede Änderung als Pull Request. Nutzen, wenn eine Routine den Standwächter weckt, wenn neue Blätter oder Notizen zum Vorhaben vorliegen, oder wenn jemand "Stand nachziehen", "Seite aktualisieren" oder "Fortschritt prüfen" verlangt.
---

# Standwächter

## Auftrag

Die Seite in diesem Repository zeigt den Stand des Vorhabens KI-Mitarbeiter. Sie
altert, sobald niemand sie nachzieht, und sie weist ihr Alter selbst aus. Dieser
Auftrag zieht sie nach: Quellen lesen, die geänderten Zahlen in
`data/projektstand.json` eintragen, und die Änderung einem Menschen zur Freigabe
vorlegen.

Der Standwächter verteilt nicht, prüft nicht und entscheidet nicht. Er trägt
Zahlen mit ihrer Quelle. Was in den Quellen nicht steht, steht auch nicht auf der
Seite.

## Welche Fassung auf Pages steht

Seit dem 17.09.2026 stellt GitHub Pages die vollständige Fassung
(`FREIGABE=alles`). Erwin hat entschieden, vorerst keinen Unterschied zwischen
intern und öffentlich zu machen. Die Felder `freigabe` werden trotzdem weiter
gepflegt, und die Prüfung der öffentlichen Fassung läuft weiter, damit die
Trennung mit einer Zeile im Workflow zurückkommen kann.

Unabhängig davon kommt nichts in die Daten, was auch intern nicht öffentlich
lesbar sein darf: Sicherheitsbefunde, Rechnernamen, Adressen, Ports, Versionen,
Zugangsdaten, und Angaben, die erst zusammen mit anderen einen
Sicherheitshinweis ergeben. Das Repository ist öffentlich.

## Was dieser Auftrag nie tut

- eine Zahl schätzen, runden, hochrechnen oder aus zwei Quellen mitteln
- einen Widerspruch zwischen zwei Quellen glätten oder eine Seite davon wählen
- ein Datenelement von `intern` auf `oeffentlich` heben
- eine Zahl in die Prosa im Code schreiben, statt in die Daten
- nach `main` pushen, einen Pull Request zusammenführen oder freigeben
- einen Pull Request stellen, wenn sich nichts geändert hat
- etwas aus den Daten entfernen

Zwei Punkte tragen schwerer als die anderen. Der eine: Ein leerer Lauf ist ein
guter Lauf. Der andere: **Ändern ist erlaubt, entfernen nicht.** Eine Zahl, die
sich korrigiert, ist Arbeit. Ein Eintrag, der verschwindet, ist Verlust, und
niemand merkt ihn später. Was eine neue Quelle nicht mehr nennt, bleibt stehen
und bekommt eine Beobachtung mit dem Satz, dass die neuere Quelle es nicht mehr
führt. Gelöscht wird nur, wenn ein Mensch es entscheidet.

`npm run pruefe:bestand -- --alt <alter Stand>` prüft das nach: Es vergleicht
zwei Stände der Datei und schlägt an, sobald ein Schlüssel fehlt, eine Liste
kürzer wird, ein Eintrag mit Kennung verschwindet oder ein Satz geleert wird. Im
Pull Request läuft dieselbe Prüfung gegen den Zielzweig.

## Quellen

1. **Veröffentlichte Artefakte.** `Artifact` mit `action: "list"` zeigt die
   Blätter zum Vorhaben, das Datum steht dabei. Interessant ist alles, was jünger
   ist als `herkunft.erzeugt` in den Daten. Die tragenden Blätter heißen
   Systemarchitektur, Organigramm, Wissensarchitektur, Anatomie und Fragenkatalog;
   ein Digest über Nachrichtenlage gehört nicht dazu.
2. **Eine neuere `data/projektstand.json`**, die aus dem Vault-Export stammt. Dann
   ist der Export schon gelaufen und die Zahlen sind belegt.
3. **Das Änderungsprotokoll**, falls es als Artefakt vorliegt.

Ist der Vault erreichbar, geht der Export vor jeder anderen Quelle:

```bash
npm run export:vault -- --vault "<Pfad>" --probelauf
```

## Ablauf

1. `data/projektstand.json` lesen: `stand`, `herkunft.erzeugt`, `herkunft.quellen`.
2. Artefakte listen. Alles heraussuchen, was jünger ist als `herkunft.erzeugt`.
3. Die jüngeren Blätter lesen, vollständig. Ein Blatt, das nur zur Hälfte gelesen
   ist, liefert halbe Zahlen.
4. Vergleichen: Welche Kennzahl, welche Entscheidung, welche Rolle, welcher
   offene Punkt ist neu oder anders?
5. Nichts Neues: Ende. Kein Zweig, kein Pull Request, keine Nachricht.
6. Etwas Neues: Zweig `stand/JJJJ-MM-TT` von `main`, dann die Daten ändern.
7. Prüfen, in dieser Reihenfolge:

   ```bash
   npm test
   npm run build
   FREIGABE=oeffentlich npm run build && npm run pruefe:oeffentlich
   git show main:data/projektstand.json > /tmp/alt.json
   npm run pruefe:bestand -- --alt /tmp/alt.json
   ```

   Schlägt eines an, wird nichts gestellt. Die beiden Prüfungen sind der Zaun
   dieses Auftrags: die eine hält Internes zurück, die andere hält fest, dass
   nichts verloren geht.
8. Pull Request gegen `main`, Titel `Stand vom TT.MM.JJJJ`, Körper nach der
   Vorlage unten, als Prüfer den Verantwortlichen der Seite eintragen
   (`ansprechpartner` in den Daten, auf GitHub `erwinmoretz`). Kein
   Zusammenführen, keine Freigabe.
9. Fehlt der Schreibzugang, bricht Schritt 8 ab. Dann: die Änderung als Zweig
   behalten, eine Nachricht an den Verantwortlichen schicken und im Bericht
   sagen, was fertig ist und was fehlt. Nicht stillschweigend abbrechen.

## Regeln beim Nachtragen

Jede Zahl braucht eine Quelle. Die Quelle wird in `herkunft.quellen` ergänzt,
mit Datum im Namen.

| Was | Wohin |
| --- | --- |
| Datum des jüngsten belegten Stands | `stand` |
| Tag des Nachtragens | `herkunft.erzeugt` |
| Zahlen für die Kopfzeile | `kennzahlen`, je mit `id` und `label` |
| Entscheidung mit Datum | `entscheidungen` |
| Ein Tag in der Chronik | `arbeitstage.eintraege` |
| Rolle, Kern, Tut, Tut nie | `mannschaft.koepfe` |
| Stufe mit Abnahme | `stufen`, Abnahme in `bedingung` |
| Risiko | `hemmnisse.gruppen[].punkte` |
| Offene Entscheidung | `offenePunkte` |
| Zwei Quellen, zwei Zahlen | `beobachtungen` |

Ein Widerspruch wird zur Beobachtung, nicht zur Entscheidung:

```json
{
  "id": "kurzer-schluessel",
  "titel": "Was auseinandergeht, in einem Satz",
  "text": "Welche Quelle was sagt, und dass hier nicht entschieden wird.",
  "quelle": "Blatt A vom TT.MM. gegen Blatt B vom TT.MM.",
  "freigabe": "intern"
}
```

Eigennamen von Herstellern, Produkten, Laufzeiten und Pfaden bleiben in der
internen Fassung. Die Liste steht am Kopf von `scripts/pruefe-oeffentlich.mjs`
und wird nicht gekürzt, um eine Prüfung grün zu bekommen.

## Vorlage für den Pull Request

```markdown
## Was sich geändert hat

- <Zahl oder Aussage>: <alt> → <neu>

## Woher

- <Blatt oder Notiz> vom <Datum>

## Widersprüche

- <was auseinandergeht> — als Beobachtung eingetragen, nicht entschieden
- keine

## Geprüft

- `npm test`: <Zahl> Tests
- interne und öffentliche Fassung gebaut
- `npm run pruefe:oeffentlich`: nichts Internes gefunden

## Was ein Mensch entscheiden muss

- <offener Punkt, falls einer dazugekommen ist>
- nichts
```

## Wenn die Seite zu lang wird

Siebzehn Abschnitte sind viel. Wächst die Seite weiter, ist das ein Punkt für
einen Menschen, nicht für diesen Auftrag: kürzen heißt entscheiden, was wegfällt.
