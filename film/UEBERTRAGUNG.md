# Was aus dem Labor in den Film übertragen ist

Nach dem Skill `remotion-to-hyperframes` (dort `TRANSLATION_NOTES.md`). Die Vorlage ist keine Remotion-Komposition, sondern die Bewegung des Labors (`components/labor/Bewegung.tsx`, GSAP mit ScrollTrigger). Übertragen ist auf der Stufe „nativ“: HTML und GSAP, jedes Element in HyperFrames bearbeitbar.

| Im Labor | Im Film | Stufe |
| --- | --- | --- |
| Vorhang: Wort steigt, zwei Türen öffnen sich (0,35 s und 0,45 s, power4.inOut) | Einstellung 1, gleiche Zeiten und Kurven; Türen rot statt schwarz, damit sie sich vom dunklen Grund abheben | nativ |
| Überschriften Wort für Wort aus der Maske (yPercent 110, 0,9 s, 0,06 s versetzt) | Wortmarke und Kernsatz in Einstellung 1 | nativ |
| Zeitstrahl, der sich beim Scrollen zieht; Punkte in der Reihenfolge ihrer Daten | Einstellung 3, an der Zeit statt am Scrollen; Lage der Punkte nach derselben Rechnung wie auf der Seite | nativ |
| Zähler, der hochzählt (1,4 s, power2.out) | Einstellung 4, 1,2 s, dazu je Prüffall ein Kästchen | nativ |
| Stapel der eingetretenen Risiken | Einstellung 5 zeigt nur das erste; ein Stapel mit drei Karten wäre in 4,6 s nicht zu lesen | nativ, gekürzt |

## Was nicht übertragen ist

- Scrollen, Lenis, Parallaxe, Mauszeiger, magnetische Knöpfe und das Kippen der Karten hängen an der Hand des Lesers. Ein Film hat keine; sie fehlen.
- Die Einzelheiten zum Aufklappen, die Läufe des Orchestrators, die Phasen des Risikoplans und die Gegenmaßnahmen stehen nur auf der Seite. Im Film wären sie in der Zeit nicht zu lesen.
- Die Kompositionen sind erzeugt, nicht von Hand geschrieben: `scripts/film-daten.mjs` schreibt sie aus den Daten neu. Wer im HyperFrames-Studio etwas ändert, verliert es beim nächsten `npm run baue:film`. Änderungen gehören in das Skript.
- Ton: Der Skill rät bei Filmen über 15 Sekunden zu Musik. Der Film läuft auf der Seite stumm und bleibt ohne Ton.
