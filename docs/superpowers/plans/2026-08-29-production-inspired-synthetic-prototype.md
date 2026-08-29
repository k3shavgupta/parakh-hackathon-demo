# Production-Inspired Synthetic Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a public, no-login Parakh hackathon journey that routes five numeric demo references through local synthetic V4-style evidence into an evidence-first report.

**Architecture:** Local fixtures are the only data boundary. `synthetic-engine.ts` validates a demo reference, invokes the fixture-only V4 adapter, and returns a report model used by both the report UI and download output. The homepage and Evidence Lab only read the same model; they never call a provider.

**Tech Stack:** Vinext, React 19, TypeScript, Tailwind CSS, Vitest, Playwright, lucide-react.

**Spec:** `docs/superpowers/specs/2026-08-29-production-inspired-synthetic-demo-design.md`

## Global Constraints

- Use only `DEMO-2026-0001` through `DEMO-2026-0005` as public references.
- No real or real-looking identifiers, `fetch`, databases, auth, payments, external services, or production code.
- Use `FLAG`, `CLEAR`, and `NOTE` only; no scores, ratings, verdicts, or credit decisions.
- Keep the exact synthetic-data disclosure beside search and on report output.
- Production Parakh is read-only; deploy only the separate Sites project.

---

### Task 1: Migrate the public fixture contract

**Files:**
- Modify: `lib/synthetic-fixtures.ts`
- Modify: `lib/synthetic-engine.ts`
- Modify: `tests/synthetic-engine.test.ts`

**Interfaces:**
- `isAllowedSyntheticIdentifier(value: string): boolean` accepts `DEMO-2026-0001` through `DEMO-2026-0005` only.
- `buildSyntheticReport(reference: string): SyntheticReport` produces `PRK-DEMO-2026-xxxx` and includes `synthetic: true` provenance.

- [ ] **Step 1: Write failing tests** for allowed demo references, blocked GSTIN/PAN/Aadhaar-like values, and deterministic report IDs.
- [ ] **Step 2: Run** `npm test -- tests/synthetic-engine.test.ts` and confirm the new identifier assertions fail.
- [ ] **Step 3: Implement** fixture/reference migration, report IDs, visible synthetic registration marking, and local-only engine metadata.
- [ ] **Step 4: Run** `npm test -- tests/synthetic-engine.test.ts` and confirm it passes.
- [ ] **Step 5: Commit** the fixture-contract change.

### Task 2: Make search and report a complete journey

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/report/[identifier]/page.tsx`
- Modify: `components/parakh-report-document.tsx`
- Modify: `tests/homepage.spec.ts`

**Interfaces:**
- Homepage input label: `Demo reference`.
- Valid submit: `/report/DEMO-2026-000x` after an honest five-step local generation transition.
- Report actions: `Print`, `Download report`, scenario switching, and an accessible back link.

- [ ] **Step 1: Write failing browser tests** for a valid numeric demo route, visible disclosure, blocked real-looking input, and report controls.
- [ ] **Step 2: Run** `npx playwright test tests/homepage.spec.ts --base-url http://127.0.0.1:4173` and confirm failures match absent public behavior.
- [ ] **Step 3: Implement** production-inspired search-first hero, no-network generation transition, report header/footer disclosure, scenario switcher, and text report download.
- [ ] **Step 4: Run** focused Playwright tests and confirm the route and controls work on desktop and mobile widths.
- [ ] **Step 5: Commit** the journey change.

### Task 3: Add the Synthetic Evidence Lab and handoff

**Files:**
- Create: `app/synthetic-data/page.tsx`
- Modify: `app/page.tsx`
- Modify: `tests/homepage.spec.ts`
- Modify: `README.md`, `SYNTHETIC_DATA.md`, `PRODUCTION_BOUNDARY.md`, `JUDGES_GUIDE.md`, `SUBMISSION_SUMMARY.md`

**Interfaces:**
- `/synthetic-data` renders raw fixture evidence, V4 normalization, mapping, label rationale, and a report link for all five scenarios.
- The production handoff links to `https://parakh.biz` and does not embed a real lookup.

- [ ] **Step 1: Write failing tests** for the Evidence Lab link and a report generation link for `DEMO-2026-0004`.
- [ ] **Step 2: Run** the focused browser test and confirm it fails before the route exists.
- [ ] **Step 3: Implement** the local model explainer, compact JSON disclosure, production handoff, and documentation refresh.
- [ ] **Step 4: Run** tests, lint, build, disclosure/identifier leakage scan, and mobile browser checks.
- [ ] **Step 5: Commit** the lab, docs, and verification updates.

### Task 4: Publish and verify the isolated build

**Files:**
- Modify: no source files unless deployment configuration requires it.

- [ ] **Step 1: Confirm** the public deployment approval and inspect the existing Sites project configuration.
- [ ] **Step 2: Deploy** only the separate hackathon Sites project.
- [ ] **Step 3: Run** deployed homepage, valid reference, blocked input, report, scenario-switch, and disclosure checks.
- [ ] **Step 4: Confirm** production domain responses without altering either production deployment.
- [ ] **Step 5: Record** the final URL, custom-domain status, mock boundary, and test results.
