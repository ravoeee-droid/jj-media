# 04.10.2026 – UGC Player-Vorschau und neues mittleres Video

Ausgangscommit: 1a6733ea211f393cdd519700cfc07a829d26a38d.

Nutzer wünscht Vorschau wie im Screenshot des eingebetteten YouTube-Players. Drei UGC-Cards in index.html/services.html zeigen nun native YouTube-Player mit dessen Vorschaubild statt separater hqdefault-Thumbnails. Lazy iframe, kein Autoplay. Das ändert bewusst die vorherige Click-to-load-Vorgabe gemäß neuem Vorschaubild-Wunsch.

Mittleres Video GBj6VgQvUFQ ersetzt durch d4jo0smu1f4, einschließlich direktem YouTube-Link. Links/rechts 7l7bpJrQcII/lKhnRX75n9Q bleiben. Altersbeschränkung des neuen Videos vom Nutzer als behoben angegeben; tatsächliche Wiedergabe noch im Browser zu prüfen.

Prüfung: alle sechs Player-Einbettungen und mittlere Video-ID auf beiden Seiten abgeglichen. Rollback durch Revert.
