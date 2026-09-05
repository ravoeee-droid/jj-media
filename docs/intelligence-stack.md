# JJ Media Intelligence Stack

## Ziel
Ein operatives Growth-Cockpit für JJ Media: Search Console zeigt Nachfrage und Rankings, PostHog misst Funnel/Attribution, Microsoft Clarity erklärt Nutzerverhalten, und die CI-Schicht überwacht technische Qualität.

## Enthalten
- Microsoft Clarity mit consent-gesteuertem Laden und Funnel-Events
- PostHog-Forwarding über `/api/conversion-event` (keine Namen, E-Mails, Telefonnummern oder Formularwerte)
- Search Console OAuth 2.0 (read-only) mit internem Dashboard `/intelligence`
- Search Console Opportunity Engine für Keywords auf Position 4–20
- Wöchentliche Lychee Broken-Link-Prüfung
- Wöchentlicher Unlighthouse Full-Site-Audit
- Bestehendes Lighthouse/Playwright Quality Gate
- AI-/Organic-/Paid-/Social-Attribution in Analytics Events

## Benötigte Runtime-Secrets (Vercel)
- `GOOGLE_OAUTH_CLIENT_SECRET` – aus dem Google OAuth Web Client
- `POSTHOG_PROJECT_KEY` – optional, aktiviert PostHog
- `POSTHOG_HOST` – optional, Standard `https://eu.i.posthog.com`
- `GSC_PROPERTY` – optional; Standard `sc-domain:jj-media-design.de`
- `GSC_REFRESH_TOKEN` – optional; nur für serverseitige/daily Automationen ohne Browser-Session

Die Google OAuth Client-ID ist ein öffentlicher Identifier und im Code als Fallback hinterlegt. Der Client-Secret wird niemals committed.

## Google Cloud
Aktiviere die Google Search Console API und trage als erlaubte Redirect URI exakt ein:
`https://www.jj-media-design.de/api/google/oauth/callback`

Scope:
`https://www.googleapis.com/auth/webmasters.readonly`

## Einmalige Verbindung
Nach Deployment `/intelligence` öffnen und „Google verbinden“ wählen. Der OAuth-Callback speichert den Refresh Token verschlüsselt als HttpOnly-Cookie. Damit kann das interne Dashboard Search-Console-Daten lesen, ohne den Token im Browser-JavaScript offenzulegen.

Für die tägliche GitHub-Automation zusätzlich `GOOGLE_OAUTH_CLIENT_SECRET` und `GSC_REFRESH_TOKEN` als GitHub Actions Secrets hinterlegen. Ohne diese Secrets überspringt der Workflow den Sync sicher.

## Datenschutz
Analytics läuft nur nach Zustimmung. Microsoft Clarity wird erst nach Statistik-Einwilligung geladen. Der Analyse-Funnel sendet nur pseudonyme Analytics-Ereignisse. PostHog erhält über die Conversion-Schnittstelle keine Kontakt- oder Formularwerte.
