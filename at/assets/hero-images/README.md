# Hero-Video für die Startseite (at/)

Lege hier ab:

- `hero.mp4` – das Video (H.264, ohne Ton, 10–20 s Schleife, 1920×1080, Ziel: unter 5 MB)
- `hero.jpg` – optional, Standbild als Poster (wird angezeigt, bis das Video lädt)

Danach `node tools/build-at.cjs` ausführen. Fehlt `hero.mp4`, bleibt der Hero mit Farbverlauf.
Das Video läuft stumm, in Schleife, hinter Text und Buttons (abgedunkelt).
Bei „Bewegung reduzieren“ im Betriebssystem wird es ausgeblendet.
