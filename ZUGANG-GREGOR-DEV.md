# Arbeitsplan: Zugang für Gregor Dev

Gregor Dev pflegt die öffentlichen Seiten und trägt ihren Stand nach. Dafür
braucht er ein eigenes Konto bei GitHub, Schreibrecht auf genau dieses
Repository und einen Zugang, der nichts anderes darf. Dieser Plan ist für einen
Menschen geschrieben, nicht für ein Skript: Ein Konto legt niemand für jemand
anderen an.

**In dieses Repository kommt kein Geheimnis.** Der Token aus Schritt 4 wird nur
auf dem Rechner abgelegt, auf dem der Durchgang läuft, und zwar von der
GitHub-CLI. Er gehört nicht in eine Datei, nicht in eine Notiz und nicht in eine
Nachricht.

Dauer: etwa eine halbe Stunde. Bis auf Schritt 6 geht alles im Browser.

## 1. Das Konto anlegen

GitHub erlaubt das ausdrücklich: „User accounts are intended for humans, but you
can create accounts to automate activity on GitHub. This type of account is
called a machine user."

1. In einem privaten Browserfenster <https://github.com/signup> öffnen, damit
   dein eigenes Konto angemeldet bleibt.
2. Eine eigene E-Mail-Adresse verwenden, die dem Haus gehört und nicht einer
   Person, etwa ein Verteiler oder ein Alias. Ohne Zugriff auf dieses Postfach
   lässt sich das Konto später nicht zurückholen.
3. Als Benutzernamen etwas Sprechendes wählen, das nach Maschine aussieht, zum
   Beispiel `wamocon-gregor`. Der Anzeigename kann „Gregor Dev" sein.
4. Zwei-Faktor-Anmeldung einschalten und die Wiederherstellungscodes dort
   ablegen, wo die übrigen Zugänge des Hauses liegen.

## 2. Ins Repository aufnehmen

Als Inhaber der Organisation, im eigenen Konto:

1. <https://github.com/Wamocon/kiKollege/settings/access> öffnen.
2. **Add people**, den neuen Benutzernamen eintragen, Rolle **Write**.
   Nicht Admin: Er soll Einstellungen nicht ändern können.
3. Die Einladung im Postfach aus Schritt 1 annehmen.

## 3. main schützen

Heute kann jeder mit Schreibrecht direkt auf `main` pushen, und jeder Push auf
`main` stellt die Seite ins Netz. Sobald ein zweites Konto Schreibrecht hat,
gehört dort ein Riegel vor:

1. <https://github.com/Wamocon/kiKollege/settings/rules> öffnen, **New ruleset →
   New branch ruleset**.
2. Name etwa `main geschützt`, **Enforcement status: Active**, Target branches:
   **Include default branch**.
3. Anhaken: **Require a pull request before merging** mit einer Freigabe, und
   **Block force pushes**.
4. Dich selbst als Umgehung eintragen (**Bypass list**), falls du im Notfall
   direkt schreiben können musst.

Das ist die Stelle, an der aus „er soll nicht" ein „er kann nicht" wird.

## 4. Einen feingranularen Token erzeugen

Angemeldet als Gregor Dev:

1. **Settings → Developer settings → Personal access tokens → Fine-grained
   tokens → Generate new token**.
2. **Resource owner:** die Organisation `Wamocon`. Verlangt sie eine Freigabe,
   bleibt der Token auf `pending`, bis ein Inhaber ihn bestätigt. Das bist du.
3. **Repository access:** *Only select repositories* → `kiKollege`.
4. **Repository permissions**, nur diese drei:
   - **Contents:** Read and write
   - **Pull requests:** Read and write
   - **Metadata:** Read (setzt GitHub selbst)
5. **Expiration:** ein Datum, das in den Kalender kommt. Unbegrenzt ist bequem
   und eine schlechte Idee; 90 Tage sind ein guter Anfang.
6. Den Token einmal kopieren. GitHub zeigt ihn kein zweites Mal.

Falls die Organisation feingranulare Token nicht erlaubt, steht das unter
**Organisation → Settings → Personal access tokens**. Dort einschalten, sonst
bleibt jeder Token wirkungslos.

## 5. Den Token freigeben

Als Inhaber der Organisation: **Wamocon → Settings → Personal access tokens →
Pending requests**, den Antrag von Gregor Dev ansehen und genehmigen. Steht dort
nichts, verlangt die Organisation keine Freigabe, und Schritt 4 hat schon
gereicht.

## 6. Auf dem Rechner anmelden

Auf dem Rechner, auf dem der Durchgang läuft, im Konto, unter dem die geplante
Aufgabe läuft:

```bat
gh auth login --hostname github.com --git-protocol https --with-token < pfad\zum\token.txt
del pfad\zum\token.txt
gh auth status
```

Die GitHub-CLI legt den Token im Anmeldedienst von Windows ab. Die Datei mit dem
Token wird danach gelöscht, sie war nur der Weg hinein.

Damit die Commits von Gregor Dev seinen Namen tragen, im Klon:

```bat
git config user.name "Gregor Dev"
git config user.email "<die Adresse aus Schritt 1>"
```

## 7. Probelauf

```bat
npm run stand:nachtragen -- --probelauf
```

Der Probelauf liest, prüft und schreibt nichts. Er muss sagen, dass es entweder
nichts zu tun gibt oder einen neuen Stand gäbe. Erst danach einmal ohne
`--probelauf` laufen lassen und nachsehen, ob der Pull Request unter dem Namen
Gregor Dev steht.

## 8. Die tägliche Aufgabe einrichten

```bat
schtasks /create /tn "KI-Mitarbeiter Stand" /tr "\"C:\Pfad\zum\kiKollege\scripts\stand-aktualisieren.cmd\" \"D:\WAMOCON\KFBM\" \"D:\WAMOCON\"" /sc daily /st 07:00
```

Der Klon muss auf `main` stehen und sauber sein. Läuft die Aufgabe unter einem
anderen Windows-Konto, muss dort auch Schritt 6 gemacht sein.

## Was danach noch fehlt

Ein Konto ist noch keine Akte. Was Gregor Dev als KI-Mitarbeiter braucht, steht
in `AKTE-VORSCHLAG.md`: Auftrag, seine Grenze, die Werkzeuge, die sie erlaubt,
und sechs Testfälle, die vor dem ersten Lauf grün sein müssen. Der Zugang aus
diesem Plan ist die äußere Grenze, die Akte die innere.

## Wenn etwas schiefgeht

- **Token verloren oder verraten:** Als Gregor Dev unter **Developer settings →
  Fine-grained tokens** widerrufen, neuen erzeugen, Schritt 6 wiederholen.
- **Konto nicht mehr gewollt:** Unter **Settings → Access** aus dem Repository
  entfernen. Was er gepusht hat, bleibt, und die Pull Requests bleiben lesbar.
- **Pull Requests kommen doppelt:** Der Durchgang hängt einen zweiten Lauf am
  selben Tag an den bestehenden Pull Request. Kommen trotzdem zwei, läuft die
  Aufgabe zweimal, unter verschiedenen Windows-Konten oder aus zwei Klonen.
