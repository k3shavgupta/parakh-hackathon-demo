# AI Summary and synthetic report layout

Goal: implement the supplied summary, report/PDF structure, then merge and deploy only after all release checks pass.

Architecture: a server-owned report request resolves the allowlisted fixture, awaits each attribution result (including failure states), and makes one structured summary request. The browser receives both sets of results; no client-supplied evidence enters the prompt. Web, text, and PDF share presentation data and AI states. PDF remains a local export with embedded Modern Grad fonts.

Constraints: demo repo/project only; no auth, payments, production systems, or real identifiers. Descriptive summary only. Footer disclaimer remains outside the summary feature. Existing per-IP limiter and provider configuration are shared. No deployment while checks fail.

- [ ] Add service/route tests for aggregation order, schema, invalid output, unavailable evidence, partial failures, zero records, and rate limits.
- [ ] Implement shared server configuration, summary service, and report endpoint; preserve standalone attribution endpoint.
- [ ] Add explicit fictional subject, registration, court role and metadata to fixtures and normalized report. Share filing counts and section labels.
- [ ] Put AI Summary first; render subject/facts, filing grid/counts, disclosures, next check, and individual attribution blocks.
- [ ] Rebuild A4 export with Onest/Instrument Serif, pagination, repeated headers/footers, and matching AI state treatment.
- [ ] Run complete tests, expanded lint, build, browser desktop/mobile scenarios, PDF extraction/render inspection, and credential bundle scan.
- [ ] Review diff, merge to main, run checks on merged tree, deploy demo project, and verify live summary/download flow.
