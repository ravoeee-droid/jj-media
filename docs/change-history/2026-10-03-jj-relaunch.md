# JJ Media – Änderungsprotokoll und Wiederherstellung
Stand: 2026-10-04

## Zielordner
Der vom Nutzer gemeinte gemeinsame Ordner ist noch nicht eindeutig identifiziert. Dieses Protokoll liegt vorläufig im bestehenden Website-Repository. Nach Bestätigung wird es im gewünschten Ordner ergänzt.

## Gesicherte Stände
- Ausgangsstand vor unseren Änderungen: cfbd5673cd676980a77584c98acc8e3e62012d29
- Erste veröffentlichte Änderungen: 1bc3b5b27b689fbb07f512d5f8c0cc777fa6c47f
- Aktuelle geprüfte Vorschau: 316b8db8184a631c035917e0f2c63ad4f19cb859
- Arbeitsbranch: repair/jj-content-20261003
- Vorschau: jj-clone-ggimdtdwt-raphaelo-s-projects.vercel.app
- Production wurde nicht auf diesen Branch umgestellt.

## Einzelne Schritte
1. Bereitgestelltes PNG-Logo als assets/brand/jj-media-uploaded.png ergänzt und HTML-Navigationen auf dieses Logo umgestellt.
2. Instagram- und Facebook-Buttons mit Icons in den Footern ergänzt.
3. Alte Telefonnummer in den bearbeiteten HTML-Dateien durch die bereitgestellte geschäftliche Nummer ersetzt.
4. UGC-Abschnitte auf Start- und Leistungsseite ergänzt; bereitgestellte Portfolio-Verweise aufgenommen.
5. Zwei neue YouTube-Testimonial-Player mit Kundenzuordnung und externen Links ergänzt.
6. Automatische Worttrennung und beliebige Wortumbrüche für normalen Text korrigiert; E-Mail-Umbrüche bleiben erlaubt.
7. Logo-Überschreibung durch brand-runtime.js entfernt und site-quality.js angepasst, damit das bereitgestellte Logo erhalten bleibt.
8. Auf Reel-Karten einen vorhandenen Portfolio-Feed-Ausschnitt als Vorschau ergänzt. Das sind keine individuellen Reel-Thumbnails und keine lokal abspielbaren MP4s.
9. Unbestätigte Balingen-Anbieteradresse auf der Vorschauseite durch Florida, USA mit sichtbarem Entwurfshinweis ersetzt. Unbestätigte Adresse aus Startseiten-Metadaten entfernt.
10. AGB-Entwurf ohne Paketpreise ergänzt: Leistungen, Mitwirkung, Freigaben, Korrekturen, Vergütung, sechs Monate Laufzeit, Kündigung, Nutzungsrechte, Datenschutz, Haftung und Übergabe. Anbieteridentität, Geschäftskundenkreis, Rechtswahl und Gerichtsstand bleiben offen.
11. AGB im Footer verlinkt; Rechtstextseiten von Growth-Funktionen ausgenommen.
12. Vorschau über den freigegebenen GitHub-Branch veröffentlicht. Syntaxprüfung und sichtbare Prüfung durchgeführt. Annika-Testimonial-Button öffnet den vorgesehenen YouTube-Player; tatsächliche vollständige Videowiedergabe nicht nachgewiesen.
13. Logo-Container vergrößert, damit der Schriftzug vollständig sichtbar ist; UGC auf der Startseite nach oben verschoben.

## Prüfung der Instagram-Einschränkung am 2026-10-04
Direkt geprüft: https://www.instagram.com/reel/DbNajc2Rdo4/
Instagram meldet: People under 18 can't see this content. This account has set limits on who can see their profile and content.
Die Sitzung ist nicht angemeldet (Log In sichtbar).
Bestätigt: Instagram weist auf eine Kontoeinschränkung hin.
Nicht bestätigt: die konkrete Mindestalter-/Ländereinstellung des Kontos, das beim Nutzer aktive Instagram-Konto und dessen hinterlegtes Geburtsdatum.
Im Website-Code ist keine eigene Altersprüfung eingebaut. Die Galerie enthält externe Reel-Links. Es wurde keine Altersbeschränkung aufgehoben oder umgangen.

## Wiederherstellung
- Die Originalstände bleiben als Git-Commits erhalten.
- Für vollständige Rückkehr die Vorschau aus dem Ausgangscommit neu veröffentlichen oder die dokumentierten Änderungscommits kontrolliert rückgängig machen.
- Für einzelne Änderungen die betreffende Datei gegen den Ausgangscommit vergleichen und gezielt wiederherstellen.
- Den Protokoll- oder Backup-Ordner zu löschen macht Änderungen an Website-Dateien nicht rückgängig.
- Niemals pauschal assets/, api/ oder Website-Verzeichnisse löschen.
- Vor jeder nächsten Änderung Ausgangscommit, betroffene Dateien, Änderung, Prüfung und Wiederherstellungsschritt dokumentieren; mehrere Änderungen vor einem Deployment bündeln.
