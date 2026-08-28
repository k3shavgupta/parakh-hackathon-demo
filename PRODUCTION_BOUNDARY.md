# Production Boundary

This repository is a separate hackathon build for `build.parakh.biz`. It must
not be treated as production Parakh and must not be connected to production
Parakh services.

## Not Used

- Production Parakh code or data.
- Clerk authentication.
- Payments, invoices, checkout, entitlements, or webhooks.
- Databases, queues, storage buckets, or production secrets.
- Live GST, MCA, court, government, private-record, or scraping systems.
- Real GSTINs, PANs, Aadhaar numbers, OTPs, bank details, or personal records.

## What Production Would Require

Production use would require authorized APIs, consent-aware handling, purpose
limits, audit logs, rate limits, data provenance, retention limits, security
controls, human-readable limitations, and review paths for ambiguous records.

## Safety Position

Parakh should present evidence, confidence, provenance, and limitations. It
should not present a score, trust rating, creditworthiness verdict, or automated
clearance decision.
