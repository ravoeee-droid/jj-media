# 04.10.2026 – UGC YouTube-Videos

Ausgangscommit / Rollback: c1dd2a1e1a193bea7e6767e773078e8fffb1a650.

1. index.html und services.html: drei bisherige externe MP4-Player durch Click-to-play YouTube ersetzt, in vom Nutzer gesendeter Reihenfolge: 7l7bpJrQcII, GBj6VgQvUFQ, lKhnRX75n9Q.
2. Originale Brkaway-Portfolio-Vorschaubilder bleiben erhalten. YouTube-iframe wird ausschließlich beim Klick erzeugt (youtube-nocookie.com); direkte Shorts-Links jeweils als Alternative.
3. content-review.css: responsive Hochformatplayer und klarer Play-Button.
4. app-core.js: passender zugänglicher Video-Titel statt pauschalem Showreel-Titel.
5. app.js: Versionsparameter aktualisiert.

Prüfung: JavaScript-Syntax erfolgreich. Keine MP4-Autoloads mehr in den drei UGC-Beispielen. Live-Prüfung von Vorschau und Klick-Player erfolgt nach Deployment. Kein Upload oder Sichtbarkeitswechsel im YouTube-Konto durch Agent.
