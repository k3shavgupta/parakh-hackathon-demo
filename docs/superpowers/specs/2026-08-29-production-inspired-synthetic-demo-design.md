# Production-Inspired Synthetic Demo Redesign

## Purpose

Refocus the standalone Build What Moves India demo so its public homepage takes its visual hierarchy from the rendered Parakh production homepage: a quiet branded navigation, a central search-first composition, short supporting copy, and a report-preview card. The demo remains a fully isolated synthetic experience and must make that boundary visible at the decision point.

## Source and Boundary

- The current workspace and its separate Sites project are the only editable surface.
- Production `parakh.biz`, `www.parakh.biz`, their source, deployments, authentication, payments, data stores, APIs, secrets, analytics, and integrations remain untouched.
- Production Parakh is a read-only visual and product reference. The implementation may reproduce its visible design language but must not bulk-copy production source.
- No demo route may call an external service, `fetch`, database, authentication, payment, storage, analytics, or provider adapter.

## Homepage

The existing judge-first chapter page becomes a production-inspired, search-first page.

1. Use the production-style navigation, off-white paper background, centered title, plum action, rounded white search slab, and visible report preview as the dominant first-viewport experience.
2. Add the compact label `Built for Build What Moves India` near the search surface.
3. Show the exact synthetic-data disclosure adjacent to the search surface, not in a distant footer.
4. Replace visible `SYN-GSTIN-*` values with these only:
   - `DEMO-2026-0001`
   - `DEMO-2026-0002`
   - `DEMO-2026-0003`
   - `DEMO-2026-0004`
   - `DEMO-2026-0005`
5. The input label and instructions use `Demo reference`, not GSTIN. A valid reference opens its dedicated report route. Unknown or real-looking input remains on the page with a clear error.
6. Keep a small, production-separate handoff at the end: `Want the live Parakh experience?` links to production Parakh and states that login and authorized real-GSTIN workflows belong there, not in this demo.

## Synthetic Data Contract

Each public fixture is deterministic, local, and explicitly synthetic. Fixtures use fictional business names containing a demo qualifier and report IDs such as `PRK-DEMO-2026-0002`. They include registration-style fields, filing rows, public-record examples, provenance, limitations, and unavailable-source statements.

The five cases remain:

- routine available evidence;
- delayed or missing filing markers;
- name-variant confirmation;
- attributable fictional public-record signal;
- incomplete/unavailable evidence.

The engine emits only `FLAG`, `CLEAR`, and `NOTE`. It never emits a score, trust rating, credit decision, composite verdict, live-record claim, or universal clearance. No returned synthetic court record is a `CLEAR` finding merely because it is absent.

## Report and Generation Experience

The report stays the central product destination. It includes the demo reference, synthetic report ID, profile, filing pattern, public-record examples, findings, confidence, attribution, provenance, limitations, generation steps, and unavailable evidence. It keeps browser print, text download, scenario switching, and a report-footer synthetic notice.

Before routing to the report, a short generation sequence explains local fixture loading, filing interpretation, fictional court-candidate resolution, finding assembly, and report rendering. It must not imply a live lookup and must respect reduced-motion settings.

## Synthetic Evidence Lab

Add `/synthetic-data` as an in-app evidence explainer. For every scenario it shows purpose, raw synthetic evidence, normalized engine input, report mappings, derived calculations, unavailable data, label rationale, provenance, a fixture-to-renderer flow, expandable/copyable JSON, and a report link.

## Documentation

Update the existing README, synthetic-data, production-boundary, judges-guide, and submission-summary documents. Add `ENGINE_MAPPING.md` and `SOURCE_MANIFEST.md`. The manifest states that production was used as a read-only rendered visual reference and lists only any explicit allowable assets or logic reused. The submission summary remains under 250 words.

## Verification

Add and run focused checks for demo-reference routing, blocked real-like input, deterministic output, only allowed finding labels, no composite verdict, unavailable-evidence handling, no network access, scenario switching, disclosure visibility, print/download, and leakage of production identifiers or secrets. Validate desktop and mobile presentation and the deployed standalone site. Confirm production domains are read-only and undeployed by this work.
