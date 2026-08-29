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
- Filing and public-record availability.
- The generation animation and local evidence snapshot.

## Engine Rules

- Accept only the five visible Demo References.
- Reject real-looking GSTIN, PAN, and Aadhaar-like inputs.
- Normalize business names, dates, filing periods, and public-record parties.
- Produce observations with only `FLAG`, `CLEAR`, and `NOTE`.
- Show confidence, attribution, provenance, limitations, and missing evidence.
- Never produce scores, traffic-light judgments, trust ratings, creditworthiness
  verdicts, or clearance decisions.
