# JJ Media Intelligence Stack

This branch prepares the analytics and quality stack without enabling external credentials by default.

## Included
- Microsoft Clarity funnel events on the Social Media analysis funnel
- Explicit Clarity masking for the lead form
- Weekly Lychee broken-link checks
- Weekly Unlighthouse full-site audits
- Daily Search Console performance sync, automatically skipped until secrets are configured

## Required secrets for Search Console
- `GSC_SERVICE_ACCOUNT_JSON`: complete Google service-account JSON
- `GSC_PROPERTY`: Search Console property, preferably `sc-domain:jj-media-design.de`

Grant the service account read access to the matching Search Console property and enable the Google Search Console API in the Google Cloud project.

PostHog forwarding already exists in `api/conversion-event.js`; it becomes active when `POSTHOG_PROJECT_KEY` is configured in Vercel. `POSTHOG_HOST` is optional and defaults to the EU ingest host.
