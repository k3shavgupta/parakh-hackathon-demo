## Design Summary

Build a new, public, static TypeScript prototype that demonstrates a trader's cautious public-record research journey using only five curated synthetic scenarios. The journey is intentionally complete but narrow: select a known synthetic identifier, run a visibly simulated local check, inspect a local report, print it through the browser, and try another scenario. The design uses an independently implemented light-first, plum-accented Modern Grad direction and makes synthetic data, limitations, and non-decision language unavoidable.

## Alternatives Considered

### Alternative A: Static Vite + React + TypeScript site
- **Approach**: Keep fixtures, validation, journey state, report rendering, and print styling in one browser-delivered application.
- **Pros**: Fast deployment; no backend or credentials; no possibility of live data calls; easiest fresh-browser judging; browser print is sufficient.
- **Cons**: Does not prove production-grade integrations or stored reports.
- **Why not chosen**: Chosen. The omitted features are explicit non-goals and reduce hackathon risk.

### Alternative B: Minimal Next.js app with local API routes
- **Approach**: Create server routes that return the same fixture data.
- **Pros**: Resembles a future production architecture.
- **Cons**: Adds deployment/runtime surface without creating judge value; makes an external-call boundary harder to audit.
- **Why not chosen**: It optimises for an unneeded backend rather than a reliable prototype.

### Alternative C: Re-skin or fork the production Parakh application
- **Approach**: Reuse existing production UI and replace integrations with mocks.
- **Pros**: Faster familiarity with the domain.
- **Cons**: Violates strict separation, risks production worktree contamination, and could appear to be an old project with minor changes.
- **Why not chosen**: The independent repository, new fixtures, and new citizen journey are non-negotiable safety and compliance boundaries.

## Agreed Approach

Alternative A is approved. Use Vite, React, TypeScript, Vitest, Testing Library, and local fixture modules. Deploy a new Vercel project without importing production code, configuration, or assets. Use `build.parakh.biz` only as an alias for this new project and retain a public Vercel URL if DNS configuration is unavailable.

## Key Decisions

- Use only the five IDs `DEMO-ID-101`, `DEMO-FILING-202`, `DEMO-COURT-303`, `DEMO-CLEAR-404`, and `DEMO-STATUS-505`.
- Maintain exactly 12 filing events per scenario and 60 total, with 8–12 fictional court entries.
- Restrict observation labels to `FLAG`, `CLEAR`, `NOTE`; restrict candidate confidence to `STRONG`, `POSSIBLE`, `NO MATCH`.
- Never show a score, rating, verdict, creditworthiness decision, government logo, real case, real business, live integration, account, or payment flow.
- Make browser printing the report export mechanism; do not build a PDF backend.
- Document the production boundary, safety model, demo script, methodology, and actual Codex contribution.

## Open Questions

None. Domain configuration is non-blocking because a public Vercel fallback is an agreed delivery condition.
