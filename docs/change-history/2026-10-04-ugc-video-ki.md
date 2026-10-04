# 04.10.2026 – UGC-Vorschauen und KI-Option

Ausgangscommit / Wiederherstellung: cca31a8baca06ddf183b7fa3b5837782f8022f7d.

1. social-audit-bridge.js und growth-layer-v2.js: Hero-CTA und Analyse-Microtrust ausschließlich im Homepage-Hero bearbeiten. Leistungsseite wurde irrtümlich am ersten hero-actions-Block im UGC-Bereich umgeschrieben. UGC-Projekt anfragen bleibt jetzt Kontakt-CTA.
2. index.html und services.html: drei echte Portfolio-Videos mit Original-Postern aus dem öffentlichen Brkaway-Portfolio eingebaut. Native Controls, kein Autoplay, preload none. Original-Portfolio-Link bleibt als Alternative. Medien liegen weiterhin extern bei Brkaway/S3.
3. Kleiner KI-Abschnitt direkt darunter: echte Menschen und authentische Inhalte als Schwerpunkt, KI-Stimmen und ähnliche Avatare nur auf ausdrücklichen Wunsch und mit Zustimmung; Abstimmung vor Veröffentlichung. Keine Ergebnisgarantie formuliert.
4. content-review.css: responsive Vorschau-Raster und zentrierter KI-Bereich.
5. viral-nav.js: Analyse-Sticky ausblenden, während UGC/KI sichtbar ist.
6. app.js: Script-/CSS-Versionen erneuert.

Prüfung: JS Syntaxchecks erfolgreich. Original-Portfolio im Browser geöffnet; Poster sichtbar und MP4-Quellen durch Abspielinteraktion ausgelesen. Einige Originalvideos melden dort Unable to play media im Prüfbrowser. Daher noch keine Zusage vollständiger Abspielbarkeit; Poster-Vorschauen und Portfolio-Fallback vorhanden.

Rollback: Änderungscommit revertieren oder Ausgangscommit deployen.
