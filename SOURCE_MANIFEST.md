# Source Manifest

## Purpose

This standalone Build What Moves India prototype is the only editable project
for this work. Production Parakh was opened read-only as a technical and visual
reference. It was not edited, built, deployed, or connected to this demo.

## Read-only V4 reference

- Repository: `/Users/keshavgupta/Documents/Projects anti gravity/Parakh.biz`
- Reference commit: `aab0a14c2570b232419436ed24a4b9f08212172b`
- Review date: 2026-08-29

## Adapted into this demo

`lib/v4-synthetic-adapter.ts` is a small, fixture-only adaptation of the
deterministic portions of the V4 engine:

| Production reference | SHA-256 at review | Adapted behavior |
| --- | --- | --- |
| `website/website/src/lib/engine/business-identity.ts` | `36ecf12cf0f881cd457dffe7ba24192427a752f3ec236419381b62eba4773d63` | Name cleanup, legal-form normalization, and core-name extraction |
| `website/website/src/lib/engine/court-candidates.ts` | `0577f5aaad094bdfbe5c1b4d3caaafa524b93a7693a1078d2fd49146f5545bf6` | Candidate-evidence shape, reduced to local fixture records |
| `website/website/src/lib/engine/court-resolution.ts` | `e444502f804e8d2f0012c2da1ae3ad11506d3cbca333d57dece828dde4819926` | Deterministic party matching and a reportable/non-match split |

## Explicitly excluded

The V4 orchestrator and every live integration were excluded:

- `website/website/src/lib/engine/index.ts`
- GST lookup/provider adapters
- court provider/API adapters
- browser automation, scraping, `fetch`, database, authentication, payments,
  analytics, secrets, and production report storage

The prototype accepts only local fixture records. It cannot perform a live
GSTIN, PAN, Aadhaar, payment, private-record, or public-system lookup.
