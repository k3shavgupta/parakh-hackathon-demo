# Synthetic Data

This hackathon demo uses synthetic data only. It does not access live government
systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or
production Parakh data.

## Fixture Location

The local fixture data lives in `lib/synthetic-fixtures.ts`.

## Scenarios

- `SYN-GSTIN-CLEAR-001`: clean or mostly clear business.
- `SYN-GSTIN-DELAY-002`: delayed filing pattern.
- `SYN-GSTIN-MISMATCH-003`: identity/name mismatch.
- `SYN-GSTIN-COURT-004`: public-record/court-signal example.
- `SYN-GSTIN-PARTIAL-005`: partial or insufficient data.

## What Is Fake

- Business names, trade names, addresses, identifiers, filing rows, record IDs,
  parties, dates, case-like references, source labels, and report IDs.
- Filing and public-record availability.
- The generation animation and local evidence snapshot.

## Engine Rules

- Accept only obvious synthetic GSTIN-style identifiers.
- Reject real-looking GSTIN, PAN, and Aadhaar-like inputs.
- Normalize business names, dates, filing periods, and public-record parties.
- Use obviously fictional `SYNTHETIC-*` case/record references and court labels.
- Send only server-resolved synthetic entity and record metadata to the runtime
  AI attribution step.
- Produce observations with only `FLAG`, `CLEAR`, and `NOTE`.
- Show confidence, attribution, provenance, limitations, and missing evidence.
- If AI is unavailable, show the existing fixture-based grade explicitly.
- Never produce scores, traffic-light judgments, trust ratings, creditworthiness
  verdicts, or clearance decisions.

## Runtime AI boundary

The browser submits only a known synthetic identifier and record ID to
`/api/ai-attribution`. The server resolves both values against the local
fixtures, applies a basic 10-calls-per-IP-per-hour limit, and calls OpenAI only
when `OPENAI_API_KEY` is configured locally. The API key never enters the
browser bundle.
