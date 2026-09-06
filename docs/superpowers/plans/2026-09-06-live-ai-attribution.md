# Live AI Attribution Reasoning Implementation Plan

> **For agentic workers:** Execute this plan task-by-task with test-first development and verification checkpoints.

**Goal:** Add a local-only fuzzy search, live server-side OpenAI attribution reasoning, native report/PDF presentation, and truthful synthetic-pipeline documentation.

**Architecture:** Resolve browser input only to a known synthetic fixture, then have a server route re-resolve the fixture and call OpenAI without exposing credentials. Keep fixture `signal` as the conservative fallback and render AI output as a separate report block.

**Tech Stack:** React 19, Vinext/Vite, TypeScript, Vitest, direct OpenAI HTTP API, `pdf-lib`, Tailwind/shadcn styling.

**Spec:** `docs/superpowers/specs/2026-09-06-live-ai-attribution-design.md`

## Global Constraints

- Use only the existing five local synthetic fixtures.
- Keep real-looking GSTIN/PAN/Aadhaar rejection unchanged.
- Keep the API key server-side in ignored `.env.local` as `OPENAI_API_KEY`.
- Default to 10 AI calls per IP per hour with a bounded request timeout.
- Fall back visibly to the fixture-based grade when AI fails.
- Preserve synthetic disclosure, provenance, limitations, and no-verdict language.
- Do not deploy, push, or touch production Parakh systems.

### Task 1: Fixture resolver and fictional court metadata

**Files:**
- Modify: `lib/synthetic-fixtures.ts`
- Modify: `lib/synthetic-engine.ts`
- Test: `tests/synthetic-engine.test.ts`

**Interfaces:**
- Produce `resolveSyntheticSearch(value: string): { scenario: SyntheticScenarioSummary; score: number } | null`.
- Produce `getSyntheticScenario(identifier: string): SyntheticScenario | undefined`.
- Preserve `buildSyntheticReport(identifier: string)` and existing identifier safety behavior.

- [ ] Write failing tests for exact identifier, legal-name, trade-name, alias, fuzzy typo, unmatched suggestions, and real-looking identifier rejection.
- [ ] Run `npm test -- tests/synthetic-engine.test.ts` and confirm the new resolver assertions fail for missing exports/behavior.
- [ ] Add obviously fictional public-record fields such as `caseReference: SYN-CASE-014`, `courtName: Synthetic District Court — Demo Bench`, `partySide`, and `matchBasis` to the typed fixtures.
- [ ] Implement normalized token matching plus bounded edit-distance scoring, requiring a conservative minimum score and returning no match for unrelated input.
- [ ] Export the resolver and scenario lookup, and pass the new metadata through the normalized report.
- [ ] Run the focused tests and then the full `npm test`.

### Task 2: Server-side AI attribution API

**Files:**
- Create: `app/api/ai-attribution/route.ts`
- Create: `lib/ai-attribution.ts`
- Test: `tests/ai-attribution.test.ts`

**Interfaces:**
- `AiAttributionResult = { decision: 'ATTRIBUTED' | 'NOT_ATTRIBUTED' | 'UNCERTAIN'; confidence: 'High' | 'Medium' | 'Low'; justification: string }`.
- `POST /api/ai-attribution` accepts `{ identifier: string; recordId: string }` and returns validated `AiAttributionResult` or a safe error status.
- `buildAttributionPrompt(entity, record)` contains only server-resolved synthetic metadata.

- [ ] Write failing tests for request validation, unknown fixture/record rejection, valid structured output parsing, malformed provider output, timeout/provider fallback status, and the 10-per-IP-hour limit.
- [ ] Run the focused tests and confirm they fail before implementation.
- [ ] Implement server-side fixture lookup, IP extraction, in-memory rolling-hour buckets, `AbortController` timeout, direct OpenAI request using `OPENAI_API_KEY`, and strict response normalization.
- [ ] Ensure no client bundle imports the API key or server route helper.
- [ ] Run focused API tests, full tests, and type-aware lint.

### Task 3: Report loading/success/fallback display and PDF

**Files:**
- Modify: `components/parakh-report-document.tsx`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `lib/report-pdf.ts`
- Test: `tests/report-presentation.test.ts`

**Interfaces:**
- `createSyntheticReportPdf(report, reasoning): Promise<Uint8Array>` includes report metadata, evidence, AI state, disclosures, and limitations on A4 pages.
- Client reasoning state supports `loading`, `success`, and `fallback` for every public record.

- [ ] Add `pdf-lib` and write failing tests for AI reasoning text and fallback copy being represented in report/PDF text inputs.
- [ ] Implement one client fetch per record, with visible “AI Attribution Reasoning” loading state, confidence/decision, and explicit “AI reasoning unavailable, showing fixture-based grade” fallback.
- [ ] Replace the text download action with an A4 `pdf-lib` download while retaining print and existing report layout.
- [ ] Run focused presentation tests and inspect a generated PDF structurally.

### Task 4: Footer regression and homepage search UI

**Files:**
- Modify: `app/page.tsx`
- Test: `tests/homepage-regression.test.ts`

- [ ] Write a failing regression assertion that the footer contains only `Standalone Build What Moves India prototype.`.
- [ ] Replace the homepage identifier-only validation with the resolver, preserving safe rejection and showing sample-business suggestions for no match.
- [ ] Remove only the extra production footer sentence.
- [ ] Run the focused test and full test suite.

### Task 5: Evidence Lab last

**Files:**
- Create: `app/synthetic-data/page.tsx`
- Modify: `README.md`
- Modify: `SYNTHETIC_DATA.md`
- Modify: `JUDGES_GUIDE.md`

- [ ] Add the truthful fixture → adapter → engine → AI reasoning → report schema → renderer diagram and retain all synthetic/production-boundary copy.
- [ ] Add navigation from the homepage/report only if it does not disturb the prioritized flow.
- [ ] Add route/content assertions and run the full verification commands.

### Final verification

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Start only a local dev server and exercise a known business name, the court fixture, an unmatched query, and the AI-unavailable fallback.
- [ ] Verify branch/status and confirm no deployment or push commands were run.
