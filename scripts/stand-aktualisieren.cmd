@echo off
rem Ein Durchgang: Vault lesen, data\projektstand.json fortschreiben und als Pull
rem Request stellen. Gedacht fuer die Aufgabenplanung unter Windows.
rem
rem   scripts\stand-aktualisieren.cmd "D:\WAMOCON\KFBM" "D:\WAMOCON"
rem
rem Der erste Pfad ist der Ordner fuer den Export der Laufnotizen, der zweite der
rem Ordner, den Obsidian als Ganzes oeffnet; aus ihm zaehlt das Abbild der Ablage.
rem Die Laufnotizen liegen seit der Trennung vom 09.09. unter KFBM.
rem
rem Nach main wird nichts gepusht. Der Durchgang legt einen Zweig stand/JJJJ-MM-TT
rem an, stellt einen Pull Request und ueberlaesst das Zusammenfuehren einem
rem Menschen. Vorher prueft er, dass der neue Stand nichts verliert, nichts
rem Heikles enthaelt und die Tests gruen sind. Am Ende sagt er, ob die Ablage
rem weiter ist als die Seite; das traegt kein Skript nach, sondern der
rem Standwaechter oder ein Mensch.
rem
rem Gebraucht werden Node, Git und die GitHub-CLI, einmal mit "gh auth login"
rem angemeldet. Aus dem Vault geht nur die Datei mit den Zahlen. Notizen,
rem Testfaelle und Ausbildungsunterlagen bleiben liegen, wo sie liegen.
setlocal

set "VAULT=%~1"
if "%VAULT%"=="" set "VAULT=D:\WAMOCON\KFBM"
set "ABLAGE=%~2"
if "%ABLAGE%"=="" set "ABLAGE=D:\WAMOCON"

cd /d "%~dp0.."

rem Offene Aenderungen im Arbeitsverzeichnis: nichts anfassen.
for /f "delims=" %%z in ('git status --porcelain') do (
  echo Das Arbeitsverzeichnis ist nicht sauber. Nichts getan.
  exit /b 1
)

rem Nicht selbst auf main wechseln: cmd liest diese Datei waehrend des Laufs von
rem der Platte, ein Zweigwechsel koennte sie unter dem Lauf austauschen.
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "START=%%b"
if not "%START%"=="main" (
  echo Das Arbeitsverzeichnis steht auf %START%, nicht auf main. Nichts getan.
  exit /b 1
)

git pull --ff-only
if errorlevel 1 (
  echo main laesst sich nicht fortschreiben, nichts getan.
  exit /b 1
)

call npm run export:vault -- --vault "%VAULT%"
if errorlevel 1 (
  echo Export fehlgeschlagen, nichts geaendert.
  git checkout -- data/projektstand.json
  exit /b 1
)

call npm run abbild:vault -- --vault "%ABLAGE%"
if errorlevel 1 (
  echo Abbild der Ablage fehlgeschlagen, nichts gestellt.
  git checkout -- data/projektstand.json
  exit /b 1
)

call npm run --silent pruefe:aktualitaet -- --ablage "%ABLAGE%"
if errorlevel 1 echo Die Ablage ist weiter als die Seite. Was der Export nicht kennt, traegt der Standwaechter oder ein Mensch nach.

git diff --quiet -- data/projektstand.json
if not errorlevel 1 (
  echo Kein neuer Stand, nichts zu tun.
  exit /b 0
)

git show "HEAD:data/projektstand.json" > "%TEMP%\projektstand-vorher.json"
call npm run --silent pruefe:bestand -- --alt "%TEMP%\projektstand-vorher.json"
if errorlevel 1 (
  echo Der neue Stand verliert Eintraege, nichts gestellt.
  git checkout -- data/projektstand.json
  exit /b 1
)

call npm run --silent pruefe:daten
if errorlevel 1 (
  echo Der neue Stand enthaelt heikle Angaben, nichts gestellt.
  git checkout -- data/projektstand.json
  exit /b 1
)

call npm test > "%TEMP%\stand-tests.log" 2>&1
if errorlevel 1 (
  echo Die Tests schlagen an, nichts gestellt. Ausgabe: %TEMP%\stand-tests.log
  git checkout -- data/projektstand.json
  exit /b 1
)

for /f "delims=" %%d in ('node scripts\heute.mjs') do set "DATUM=%%d"
set "ZWEIG=stand/%DATUM%"

git rev-parse --verify "%ZWEIG%" > nul 2>&1
if errorlevel 1 (git switch -c "%ZWEIG%") else (git switch "%ZWEIG%")
if errorlevel 1 (
  echo Zweig %ZWEIG% laesst sich nicht anlegen, nichts gestellt.
  exit /b 1
)

git add data/projektstand.json
git commit -m "Stand vom %DATUM% aus dem Vault"
if errorlevel 1 (
  echo Commit fehlgeschlagen.
  git checkout main
  exit /b 1
)

git push -u origin "%ZWEIG%"
if errorlevel 1 (
  echo Push fehlgeschlagen. Der Zweig %ZWEIG% liegt lokal bereit.
  git checkout main
  exit /b 1
)

gh pr view "%ZWEIG%" > nul 2>&1
if errorlevel 1 (
  gh pr create --base main --head "%ZWEIG%" --title "Stand vom %DATUM%" --body "Aus dem Vault fortgeschrieben von scripts\stand-aktualisieren.cmd. Geaendert ist nur data/projektstand.json. Geprueft vor dem Stellen: pruefe:bestand gegen main, pruefe:daten und npm test, alle ohne Fund. Was die Seite daraus macht, prueft die CI. Zusammenfuehren bleibt bei einem Menschen."
  gh pr edit "%ZWEIG%" --add-reviewer erwinmoretz > nul 2>&1
) else (
  echo Pull Request besteht schon, der neue Stand haengt daran.
)

git checkout main
echo Stand vom %DATUM% gestellt. Zusammenfuehren bleibt bei einem Menschen.
