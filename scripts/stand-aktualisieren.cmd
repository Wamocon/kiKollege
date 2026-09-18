@echo off
rem Der Einstieg fuer die Aufgabenplanung unter Windows. Die Arbeit selbst macht
rem scripts\stand-nachtragen.mjs, damit derselbe Durchgang auch auf dem Rechner
rem mit der Ablage und als Auftrag eines KI-Mitarbeiters laeuft.
rem
rem   scripts\stand-aktualisieren.cmd "D:\WAMOCON\KFBM" "D:\WAMOCON"
rem
rem Der erste Pfad ist der Ordner fuer den Export der Laufnotizen, der zweite der
rem Ordner, den Obsidian als Ganzes oeffnet; aus ihm zaehlt das Abbild der Ablage.
rem
rem Nach main wird nichts gepusht: Der Durchgang legt einen Zweig
rem stand/JJJJ-MM-TT an, stellt einen Pull Request und ueberlaesst das
rem Zusammenfuehren einem Menschen. Gebraucht werden Node, Git und die
rem GitHub-CLI, einmal mit "gh auth login" angemeldet.
setlocal

set "VAULT=%~1"
if "%VAULT%"=="" set "VAULT=D:\WAMOCON\KFBM"
set "ABLAGE=%~2"
if "%ABLAGE%"=="" set "ABLAGE=D:\WAMOCON"

cd /d "%~dp0.."

node scripts\stand-nachtragen.mjs --vault "%VAULT%" --ablage "%ABLAGE%"
exit /b %errorlevel%
