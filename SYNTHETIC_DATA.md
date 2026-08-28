# Synthetic Data

This hackathon demo uses synthetic data only. It does not access live government
systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or
production Parakh data.

## Fixture Location

The local fixture data lives in `lib/synthetic-fixtures.ts`.

## Scenarios

- `SYN-PARAKH-CLEAR-001`: clean or mostly clear business.
- `SYN-PARAKH-DELAY-002`: delayed filing pattern.
- `SYN-PARAKH-MISMATCH-003`: identity/name mismatch.
- `SYN-PARAKH-COURT-004`: public-record/court-signal example.
- `SYN-PARAKH-PARTIAL-005`: partial or insufficient data.

## What Is Fake

- Business names, trade names, addresses, identifiers, filing rows, record IDs,
  parties, dates, case-like references, source labels, and report IDs.
- Filing and public-record availability.
- The generation animation and local evidence snapshot.

## Engine Rules

- Accept only obvious synthetic identifiers.
- Reject real-looking GSTIN, PAN, and Aadhaar-like inputs.
- Normalize business names, dates, filing periods, and public-record parties.
- Produce observations with only `FLAG`, `CLEAR`, and `NOTE`.
- Show confidence, attribution, provenance, limitations, and missing evidence.
- Never produce scores, traffic-light judgments, trust ratings, creditworthiness
  verdicts, or clearance decisions.
