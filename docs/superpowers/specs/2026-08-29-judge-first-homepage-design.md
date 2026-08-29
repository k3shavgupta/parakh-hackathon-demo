# Parakh Hackathon Demo: Judge-First Homepage Redesign

## Purpose

Redesign the public standalone Parakh hackathon demo so a Build What Moves India judge understands the civic problem, the proposed change, the synthetic boundary, and the complete working journey before entering a report. The existing fixture-backed report route remains the product destination.

## Boundaries

- This project is separate from production Parakh.
- All profiles, filings, public-record examples, report IDs, confidence language, and provenance labels remain local synthetic fixtures.
- The build must not add authentication, payment handling, databases, live government access, private records, real identifiers, secrets, scraping, or production integrations.
- Existing direct report URLs remain valid: `/report/[synthetic-identifier]`.
- Observations use only `FLAG`, `CLEAR`, and `NOTE`. The UI must not present a score, rating, trust indicator, credit recommendation, or traffic-light judgment.

## User Journey

1. A judge opens the public no-login homepage.
2. The hero explains that the prototype helps an Indian business owner understand a counterparty before extending credit, and that the demo is synthetic.
3. The judge sees the problem, the intended improvement, and the three-step citizen journey.
4. The judge uses a visible synthetic GSTIN-style search field or chooses one of five scenario cards.
5. The app rejects real-looking identifiers and opens a dedicated synthetic report route for valid fixture identifiers.
6. The report presents normalized evidence, FLAG/CLEAR/NOTE observations, attribution, confidence, provenance, limitations, and what could not be found.
7. The judge can switch scenario, print, or download the synthetic report.

## Homepage Structure

### 1. Judge-first hero

The first viewport is an inset, pale-plum gradient slab. It contains a small Build What Moves India label, the headline "What we want to build", concise problem-and-change copy, the required synthetic disclosure, and a primary pill action that scrolls to the interactive demo. A secondary action points to the citizen journey section.

The hero does not bury the product behind a generic product pitch. It makes clear that Parakh is an evidence-first way to turn fragmented counterparty information into a readable report with stated limits.

### 2. Citizen journey

This plain white chapter uses a three-stage, touch-friendly stepper:

1. Enter a known synthetic identifier.
2. Normalize synthetic business, filing, and public-record fixtures.
3. Read a report that distinguishes evidence from limitations.

The stage tiles are interactive in presentation but do not imply a live government connection. The center is the citizen's task, not internal engine jargon.

### 3. Live synthetic demo

The interactive search remains prominent immediately after the journey. It accepts only existing fixture identifiers, supports selection from five clear cases, and routes to an individual report page. Each scenario card names the business situation in ordinary language and shows the synthetic ID without resembling a real GSTIN.

### 4. Why this is clearer

An airy light section contrasts fragmented manual checking with Parakh's structured evidence view. The copy is factual: source labels, normalized periods, confidence language, limitations, and no unsupported conclusion. It does not make claims about live data availability.

### 5. What works today

A dark plum-black slab provides a calm, high-contrast inventory of working prototype behavior: fixture lookup, normalized filing patterns, synthetic public-record examples, report generation, scenario switching, printing, and text download. This is a product capability section, not an admin dashboard.

### 6. Boundary and scale

A final pale-plum chapter separates mocked aspects from a safe production design. It reiterates the mandatory disclosure and names the necessary production controls: authorized APIs, consent-aware handling, provenance, audit logs, rate limits, retention limits, security controls, and human-readable limitations.

## Visual System

- Onest is the sole interface and body typeface. Instrument Serif italic appears only as one or two accent words in major headings.
- Colors follow the existing Parakh surface: off-white/blush foundation, near-black ink, deep plum accent, pale plum tints, and white report slabs.
- Major chapters are inset rounded slabs. The sequence alternates pale wash, white, dark, white, pale wash so no two gradient sections are consecutive.
- Buttons and inputs are pill-shaped. Touch targets are at least 44px.
- The hero, journey, and explanation chapters use calm centered typography; report-like content stays denser and left-aligned.
- Content is mobile-first: sections use 8-12px slab gutters on small screens, grids collapse to one column, navigation hides nonessential links, and display text uses bounded `clamp()` sizing.
- Decorative visuals are derived from actual product information: evidence rows, source markers, and report slabs. No unrelated stock imagery, decorative blobs, or generic SaaS dashboard chrome.

## Report Page

The report route retains the existing synthetic engine and fixture data. Its visual language is aligned with the updated home palette without reducing evidence density. It must retain:

- synthetic report ID and synthetic identifier;
- profile summary;
- filing-pattern evidence;
- public-record / court-signal examples;
- FLAG, CLEAR, and NOTE observations;
- confidence, attribution, provenance, limitations, and unavailable-source language;
- mandatory disclosure;
- print, download, and scenario-switch actions.

## Component Changes

- `app/page.tsx`: replace the existing search-first marketing layout with the judge-first chapter structure while retaining search validation and routing.
- `components/parakh-report-document.tsx`: align only shared visual tokens and report navigation where needed; preserve report content and actions.
- `app/globals.css`: establish scoped Parakh color tokens, responsive slab rhythm, and print-safe styles.
- `tests/`: add focused regression coverage for synthetic identifier validation, direct report routing, and blocked real-looking identifiers as needed.
- Documentation: revise the judges guide and submission summary so their product narrative matches the live journey. Retain truthful synthetic-data and production-boundary statements.

## Error Handling

- Unrecognized or real-looking values remain on the homepage and receive plain-language guidance to select or enter an explicitly listed synthetic ID.
- An invalid report route shows a clear unavailable-fixture state with a link back to the scenario picker.
- Report download remains a generated synthetic text file. Printing uses the browser's print dialog.

## Verification

Before deployment, verify:

1. Unit tests, linting, and production build pass.
2. The homepage displays the required synthetic disclosure without requiring interaction.
3. Search and each scenario open the expected report URL.
4. A real-looking identifier is rejected.
5. Report scenario switching, print invocation, and text download controls remain available.
6. The deployed demo home and a direct report route return successfully.
7. Production `parakh.biz` and `www.parakh.biz` are not modified or deployed by this work.
