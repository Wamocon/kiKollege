@echo off
rem Ein Durchgang: Vault lesen, data\projektstand.json fortschreiben, Aenderung
rem ins Repository schieben. Gedacht fuer die Aufgabenplanung unter Windows.
rem
rem   scripts\stand-aktualisieren.cmd "D:\WAMOCON\KFBM" "D:\WAMOCON"
rem
rem Der erste Pfad ist der Ordner fuer den Export der Laufnotizen, der zweite der
rem Ordner, den Obsidian als Ganzes oeffnet; aus ihm zaehlt das Abbild der Ablage.
rem Die Laufnotizen liegen seit der Trennung vom 09.09. unter KFBM.
rem
rem Vor dem Commit prueft der Durchgang, dass der neue Stand nichts verliert und
rem nichts Heikles enthaelt. Am Ende sagt er, ob die Ablage weiter ist als die
rem Seite; das traegt kein Skript nach, sondern der Standwaechter oder ein Mensch.
rem
rem Aus dem Vault geht nur die Datei mit den Zahlen. Notizen, Testfaelle und
rem Ausbildungsunterlagen bleiben liegen, wo sie liegen.
setlocal

set "VAULT=%~1"
if "%VAULT%"=="" set "VAULT=D:\WAMOCON\KFBM"
set "ABLAGE=%~2"
if "%ABLAGE%"=="" set "ABLAGE=D:\WAMOCON"

cd /d "%~dp0.."

call npm run export:vault -- --vault "%VAULT%"
if errorlevel 1 (
  echo Export fehlgeschlagen, nichts geaendert.
  exit /b 1
)

call npm run abbild:vault -- --vault "%ABLAGE%"
if errorlevel 1 (
  echo Abbild der Ablage fehlgeschlagen, nichts geschoben.
  git checkout -- data/projektstand.json
  exit /b 1
)

call npm run --silent pruefe:aktualitaet -- --ablage "%ABLAGE%"
if errorlevel 1 echo Die Ablage ist weiter als die Seite. Das traegt der Standwaechter nach.

git diff --quiet -- data/projektstand.json
if not errorlevel 1 (
  echo Kein neuer Stand, nichts zu tun.
  exit /b 0
)

git show "HEAD:data/projektstand.json" > "%TEMP%\projektstand-vorher.json"
call npm run --silent pruefe:bestand -- --alt "%TEMP%\projektstand-vorher.json"
if errorlevel 1 (
  echo Der neue Stand verliert Eintraege, nichts geschoben.
  git checkout -- data/projektstand.json
  exit /b 1
)

call npm run --silent pruefe:daten
if errorlevel 1 (
  echo Der neue Stand enthaelt heikle Angaben, nichts geschoben.
  git checkout -- data/projektstand.json
  exit /b 1
)

git add data/projektstand.json
git commit -m "Stand aus dem Vault" || exit /b 1
git push || exit /b 1
echo Stand aktualisiert und geschoben.
