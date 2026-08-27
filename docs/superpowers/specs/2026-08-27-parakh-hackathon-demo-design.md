# Parakh Hackathon Demo — Design Specification

## Purpose

Parakh Hackathon Demo is a new, public, browser-based prototype for the Build What Moves India hackathon. It demonstrates how an Indian trader can turn one synthetic counterparty identifier into clear, cautious observations about a fictional entity's simulated registration, filing history, and court-record candidates before extending trade credit.

It is an independent, fixture-only product. It is not a production replacement for Parakh, an official government service, a credit score or report, or legal advice.

## Product outcome

Within one minute, a judge can select a reliable curated scenario, run a visibly simulated check, inspect a full report, print or download it through the browser, understand exactly what is simulated, and return to another scenario without sign-in or setup.

The default demo is `DEMO-CLEAR-404`, a consistent fictional public-record example with explicit limitations. Contrasting scenarios make identity mismatch, filing gaps, possible court candidates, and a suspended registration concrete without claiming a business is safe, unsafe, or creditworthy.

## Architecture

The prototype is a new Vite, React, and TypeScript repository deployed as a static Vercel site. It has no server routes, database, authentication, environment variables, external data calls, analytics, payment systems, production dependencies, or API clients.

All report data lives in a typed local fixture module. A small domain layer validates the fixtures, resolves known synthetic IDs, and produces typed valid, invalid, and unavailable results. React state drives an explicit journey state machine: ready, loading, report, and error. The loading experience is deterministic and local; it must not make fetch/XHR requests. Browser printing provides the report export, with print-specific styling preserving the title, safety disclosure, report evidence, and limitations.

## User journey

1. A visitor opens the public homepage and immediately sees the prototype/synthetic-data disclosure.
2. They understand the problem: scattered public-record journeys make it hard to ask informed questions before trade credit.
3. They select one of five scenario cards or enter one known `DEMO-*` identifier.
4. They select **Run demo check**.
5. The page displays an accessible, staged 700–1,000ms simulated check.
6. It renders a complete local report for that scenario.
7. They inspect identity, registration, 12 monthly filing events, simulated court-record candidates, evidence confidence, interpretation, and limitations.
8. They print/download the same report through the browser or choose **Run another scenario**.

Blank and unknown identifiers retain the entered value and produce different helpful inline errors. A test-only unavailable-fixture guard presents a recovery card instead of a misleading report.

## Fixtures and semantics

Five fictional profiles use unmistakably synthetic identifiers, fictional names, fictional addresses, fictional court entries, 12 chronological filing events each, and simulated source labels. There are exactly 60 local filing events and 8–12 synthetic court-record entries in total.

| Identifier | Scenario | Required observation |
| --- | --- | --- |
| `DEMO-ID-101` | Identity mismatch | Trade/legal name contrast; court evidence does not attribute a case to the entity. |
| `DEMO-FILING-202` | Filing gaps | Three named gaps in an otherwise active registration. |
| `DEMO-COURT-303` | Possible litigation | Candidate records with partial name/location alignment; always explicitly unconfirmed. |
| `DEMO-CLEAR-404` | Consistent record | No issue found in this synthetic check, paired with limitations—not a clearance. |
| `DEMO-STATUS-505` | Registration status | Suspended fictional registration that requires clarification, not a transaction decision. |

Report labels are constrained to `FLAG`, `CLEAR`, and `NOTE`. Court evidence confidence is constrained to `STRONG`, `POSSIBLE`, and `NO MATCH`. These labels describe a local record comparison only; they never aggregate into a score, rating, risk level, verdict, trust judgment, or creditworthiness conclusion.

Every report includes this statement verbatim:

> Parakh reports public-record observations. It does not determine whether a business is trustworthy, fraudulent, creditworthy, or safe to transact with.

## Presentation

The UI uses an independently implemented Modern Grad direction with Parakh-inspired—but not copied—visual cues: a light-first warm-neutral base, readable deep-plum accent, pale single-hue washes, Onest-style geometric sans, and Instrument Serif-style italic accents only in display headings. The page alternates rounded wash, plain, and restrained dark slabs; never two consecutive gradient slabs.

The report is deliberately utilitarian and readable: a masthead with synthetic ID and simulated source badges, an observation summary, identity card, 12-month filing grid, candidate-record table, clarification questions, limitations, methodology, and print controls. Controls meet a 44px minimum target, focus indicators are visible, headings form a sensible landmark structure, and mobile layout collapses to one column.

## Safety and production boundary

The prototype will not import, depend on, link to, or alter `/Users/keshavgupta/Documents/Projects anti gravity/Parakh.biz`. It will not use a live GST service, eCourts, Indian Kanoon, other government service, payment provider, messaging system, Clerk, Postgres, webhook, production report path, production API, real identifier, account, credential, or production asset.

The visible pre-interaction and report disclosure is:

> Independent hackathon prototype. This demo uses synthetic data and simulated public-record integrations. It is not an official government service, credit score, credit report, or legal advice.

The project documentation will distinguish the authenticated, paid production product from this new, fixture-only prototype. It will explain what is mocked, what works locally today, how a future live system would need authorised and privacy-safe integrations, and why those integrations are intentionally absent here.

## Testing and verification

TDD applies to all domain and interface behaviour. Tests first prove fixture invariants, known/unknown input resolution, every scenario, confidence-label rendering, required disclosures and limitations, local loading, empty/partial/error states, run-another focus recovery, print invocation, and a guard against external/production API use. A build-level source scan blocks production domains and live integration markers.

Verification requires fresh unit and integration test output, a production build, OpenSpec validation, Superspec-compatible verification artifacts, local browser smoke tests at desktop and mobile widths, an unauthenticated deployed-browser journey, and a final line-by-line compliance review against the official hackathon brief.

## Traceability and delivery

The repository will retain OpenSpec change artifacts named `brainstorm.md`, `proposal.md`, `design.md`, capability specifications, `tasks.md`, `plan.md`, `apply.md`, `verify.md`, and `finalize.md`, plus the requested public documentation. `opsx` is not installed on this host, so OpenSpec will be used directly with equivalent artifacts and validation.

The final repository is `parakh-hackathon-demo`, public when GitHub creation succeeds. Deployment uses a separate Vercel project. The target domain is `build.parakh.biz`; if its DNS or alias cannot be configured safely, the project will retain a public Vercel URL and document the one remaining domain step. `parakh.biz` is never reconfigured.
