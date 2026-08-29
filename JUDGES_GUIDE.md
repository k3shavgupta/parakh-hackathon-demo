# Judges Guide

## The One-Minute Journey

1. Open the public demo. The first screen, **What we want to build**, explains the counterparty-checking problem and shows the synthetic-data disclosure.
2. Select **Try the synthetic demo**. It moves to the working journey and focuses the synthetic firm GSTIN field.
3. Choose a synthetic situation or type one of the listed synthetic IDs, then select **Run synthetic check**.
4. Read the dedicated report: it presents the available evidence, source/provenance, confidence, limits, and what could not be found.
5. Select a different synthetic ID from the report to compare a different situation. Use Print or Download to take a synthetic-only copy.

## Suggested Scenarios

- `SYN-GSTIN-CLEAR-001`: mostly clear filing and identity example.
- `SYN-GSTIN-DELAY-002`: repeated filing-delay pattern.
- `SYN-GSTIN-MISMATCH-003`: identity/name-variant follow-up.
- `SYN-GSTIN-COURT-004`: fictional public-record signal.
- `SYN-GSTIN-PARTIAL-005`: insufficient-data restraint.

## What To Look For

- The entire flow works without login.
- The design begins with the citizen problem, then leads directly into a working synthetic journey.
- Reports use only `FLAG`, `CLEAR`, and `NOTE`; they do not issue a score, trust rating, or creditworthiness verdict.
- Each observation states confidence, attribution, provenance, limitations, and missing evidence.
- The site visibly says: “This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.”
- The site separates what works today from what remains mocked and explains the safeguards needed for production use.
