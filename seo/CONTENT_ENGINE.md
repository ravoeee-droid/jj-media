# JJ-Media SEO & Content Engine

## Ziel

Die Engine soll langfristigen organischen Traffic und qualifizierte Anfragen aufbauen, ohne tägliche Veröffentlichungsmenge mit Qualität zu verwechseln. Ein Beitrag wird nur veröffentlicht, wenn er einen eigenständigen Nutzen hat und das Qualitätsgate besteht.

## Content-Mix

- ca. 55 % Evergreen-SEO: Suchfragen mit langfristigem Bedarf und klarer Nähe zu JJ-Media.
- ca. 25 % News/Trends: nur relevante Plattformänderungen mit echten Konsequenzen für Unternehmen.
- ca. 20 % Proof/Opinion: Cases, Experimente, Learnings und begründete Perspektiven.

Das Verhältnis ist ein Steuerungswert, kein starres Veröffentlichungsziel.

## Täglicher Entscheidungsprozess

1. **Demand Scan** – bestehende Rankings, Search-Console-Impressionen, Keywords und Fragen prüfen.
2. **News Scan** – offizielle Newsrooms/Produktblogs von Meta, Instagram, YouTube und LinkedIn zuerst prüfen; Sekundärquellen nur ergänzend.
3. **Cannibalization Check** – existiert bereits eine Seite, die dieselbe Suchintention bedient? Dann aktualisieren statt duplizieren.
4. **Topic Score** – Kandidaten nach `seo/content-manifest.json` bewerten.
5. **Evidence Gate** – aktuelle Behauptungen brauchen Primärquellen; JJ-Media-Ergebnisse brauchen echte Nachweise.
6. **Story Gate** – Leser/Kunde ist der Hero, JJ-Media/Jessica der Guide. Ausgangslage, Problem, Stakes und gewünschte Veränderung müssen konkret erkennbar sein.
7. **Headline Sprint** – mindestens fünf Headline-Varianten entwickeln; Gewinner nach Suchintention, Klarheit, Spezifität, Glaubwürdigkeit und Neugier wählen. Kein Clickbait, der der Seite nicht entspricht.
8. **UX Gate** – geringe kognitive Last: klare H2-Struktur, kurze Sinnabschnitte, Beispiele, Tabellen/Checklisten nur wenn sie Verständnis verbessern.
9. **Conversion Gate** – genau ein primäres sinnvolles nächstes Ziel: Analyse, Case, Virale Posts oder Leistung. Kein aggressiver Pitch mitten in der Informationssuche.
10. **Technical Gate** – `node scripts/seo-quality.mjs` muss grün sein.

## Qualitätsprinzipien aus den bereitgestellten Arbeitsunterlagen

Die hochgeladenen Pip-Decks und Verkaufsunterlagen werden als Denk- und QA-Hilfe genutzt, nicht als Textquelle zum Kopieren.

- **Hero & Guide:** Die Zielperson trägt die Geschichte; JJ-Media hilft als Guide.
- **Story statt Abstraktion:** konkrete Situationen, Handlungen und Konsequenzen vor leeren Marketingbegriffen.
- **Proof:** Behauptungen mit nachvollziehbarer Realität verbinden.
- **Konflikt mit Maß:** Überraschung oder Gegenposition nur, wenn sie inhaltlich trägt; kein künstliches Drama.
- **Avatar:** Werte, Ziele, Wünsche, Einwände und Kaufsituation der Zielgruppe vor dem Schreiben klären.
- **Headline Testing:** Varianten erzeugen und reale CTR-/Conversion-Signale nutzen; keine Vorlage als garantiert behandeln.
- **UX:** sichtbare Struktur, eindeutige Signale, klare nächste Handlung und möglichst geringe mentale Reibung.

## News-Regeln

- Primärquelle und Veröffentlichungsdatum prüfen.
- Rollout-Region, Eligibility und Einschränkungen explizit nennen.
- Keine alte News als neu verkaufen.
- News nur veröffentlichen, wenn eine konkrete Auswirkung, Entscheidung oder strategische Lektion für JJ-Media-Zielgruppen ableitbar ist.
- Bei schnelllebigen Themen Review-Datum im Manifest maximal 30 Tage später setzen.

## Evergreen-Regeln

- Eine Suchintention pro URL.
- Pillar-Page zuerst, Cluster danach.
- Bestehende starke Seite aktualisieren, bevor eine nahezu identische neue URL entsteht.
- Interne Links in beide Richtungen: Pillar → Cluster und Cluster → Pillar; zusätzlich Proof/Leistung/Analyse, wenn kontextuell sinnvoll.
- Keine erfundenen Suchvolumina. Solange keine belastbare Keywordquelle verbunden ist, bleibt `search_volume` im Manifest `null`.

## Standardstruktur eines starken Artikels

1. konkreter Einstieg in die Situation des Lesers
2. Problem/Frage klar benennen
3. neue Perspektive oder Entscheidungskriterium
4. Lösung/Framework mit Beispielen
5. Proof oder nachvollziehbare Quelle
6. konkrete nächste Schritte
7. passender interner Vertiefungslink
8. ein primärer CTA

## Technische Pflichtfelder

- eindeutiger `<title>`
- Meta Description
- absolute Canonical-URL
- genau eine H1
- Article/NewsArticle JSON-LD für Artikel
- interne Links
- sinnvolle Alt-Texte bei Bildern
- Sitemap-Eintrag
- Manifest-Eintrag
- `datePublished`, `dateModified`, Review-Datum

## Review-Loop

Monatlich bzw. anhand Search Console:

- Impressionen ohne Klicks → Snippet/Title/Search-Intent prüfen.
- Position 4–15 → Inhalt, Proof, interne Links und Aktualität verbessern.
- gute Rankings ohne Anfragen → Conversion-Bridge prüfen.
- veraltete News → aktualisieren, zusammenführen oder sauber als historisch kennzeichnen.
- Seiten mit gleicher Intention → konsolidieren.

## Erfolgskriterien

Nicht nur Sessions zählen. Beobachtet werden:

- nicht-brandbezogene organische Impressionen
- Klickrate aus der Suche
- Wachstum relevanter Keyword-Cluster
- Einstiege in Cases/Virale Posts/Analyse
- qualifizierte Analyse-Anfragen aus organischem Traffic
- Anteil aktualisierter vs. nur neu produzierter Inhalte

Die Engine ist erfolgreich, wenn sie mit der Zeit bessere Entscheidungen und mehr qualifizierte Nachfrage erzeugt – nicht wenn lediglich die URL-Zahl steigt.
