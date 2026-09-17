@echo off
rem Ein Durchgang: Vault lesen, data\projektstand.json fortschreiben, Aenderung
rem ins Repository schieben. Gedacht fuer die Aufgabenplanung unter Windows.
rem
rem   scripts\stand-aktualisieren.cmd "D:\WAMOCON\KI-Mitarbeiter" "D:\WAMOCON"
rem
rem Der erste Pfad ist der Ordner fuer den Export der Laufnotizen, der zweite der
rem Ordner, den Obsidian als Ganzes oeffnet; aus ihm zaehlt das Abbild der Ablage.
rem
rem Aus dem Vault geht nur die Datei mit den Zahlen. Notizen, Testfaelle und
rem Ausbildungsunterlagen bleiben liegen, wo sie liegen.
setlocal

set "VAULT=%~1"
if "%VAULT%"=="" set "VAULT=D:\WAMOCON\KI-Mitarbeiter"
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

git diff --quiet -- data/projektstand.json
if not errorlevel 1 (
  echo Kein neuer Stand, nichts zu tun.
  exit /b 0
)

git add data/projektstand.json
git commit -m "Stand aus dem Vault" || exit /b 1
git push || exit /b 1
echo Stand aktualisiert und geschoben.
