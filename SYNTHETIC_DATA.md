# Synthetic Data

This hackathon demo uses synthetic data only. It does not access live government
systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or
production Parakh data.

## Fixture Location

The local fixture data lives in `lib/synthetic-fixtures.ts`.

## Scenarios

- DEMO-2026-0001: routine available evidence; no returned court item is a clearance.
- DEMO-2026-0002: filing records requiring review.
- DEMO-2026-0003: identity/name variation requiring confirmation.
- DEMO-2026-0004: attributable fictional public-record signal.
- DEMO-2026-0005: incomplete evidence with restrained findings.

## What Is Fake

- Business names, trade names, addresses, identifiers, filing rows, record IDs,
  parties, dates, case-like references, source labels, and report IDs.
- Synthetic registry dates and business-activity context, included to make each
  fictional profile internally coherent without resembling a real registration.
- Synthetic court names, case references, proceeding labels, party sides,
  filing years, name-alignment bases, statuses, and match explanations.
- Filing and public-record availability.
- The generation animation, local evidence snapshot, and downloadable A4 PDF.

## Engine Rules

- Accept only the five visible Demo References.
- Reject real-looking GSTIN, PAN, and Aadhaar-like inputs.
- Normalize business names, dates, filing periods, and public-record parties.
- Produce observations with only `FLAG`, `CLEAR`, and `NOTE`.
- Show confidence, attribution, provenance, limitations, and missing evidence.
- Never produce scores, traffic-light judgments, trust ratings, creditworthiness
  verdicts, or clearance decisions.
- Generate the downloadable PDF from the selected local fixture only; no report
  content is requested from a network, government system, or production API.
- Present court records as name-based synthetic examples. A `STRONG` or
  `POSSIBLE` name match is never identity confirmation, and neither is a
  rating, score, recommendation, or verdict.
