# Parakh Hackathon Demo Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Ship a separate, static, fixture-only public Parakh Hackathon Demo that lets a judge complete a safe synthetic counterparty-record journey without sign-in.

**Architecture:** A Vite React TypeScript client loads a typed local fixture catalogue through a pure resolver/validator. A small UI state machine drives scenario entry, deterministic local loading, report rendering, print, and recovery. CSS tokens implement the independent Modern Grad-inspired visual system and print layout; no server or third-party integration exists.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, user-event, jsdom, axe accessibility checks, plain CSS, Vercel static deployment.

**Spec:** `openspec/changes/parakh-hackathon-demo/{design.md,tasks.md,specs/**/spec.md}`

## Global Constraints

- Use only fictional local fixtures and exactly the five approved `DEMO-*` identifiers.
- No fetch/XHR, production URLs, government/court endpoints, authentication, payments, databases, environment variables, analytics, or copied production assets.
- Every report must contain the exact synthetic-data disclosure and non-decision statement in the safety spec.
- Labels must remain limited to `FLAG`, `CLEAR`, `NOTE`, `STRONG`, `POSSIBLE`, and `NO MATCH`; no score, rating, verdict, clearance, or trust decision.
- Write every behaviour test first, observe its expected failure, then write minimal implementation and re-run it.
- Preserve requested OpenSpec/Superspec artifacts and documentation; do not alter production Parakh.

---

### Task 1: Project foundation and safe test harness

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/test/setup.ts`, `.gitignore`, `LICENSE`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `App` as the public page root and `npm run test`, `npm run build`, `npm run lint` commands.

- [ ] **Step 1: Write the failing shell-level and UI smoke test.**

```tsx
import { render, screen } from '@testing-library/react'
import { App } from './App'

test('shows the independent synthetic prototype warning before the demo input', () => {
  render(<App />)
  expect(screen.getByText(/Independent hackathon prototype/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/synthetic demo identifier/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run `npm test -- App.test.tsx` and confirm it fails because the application/test harness does not exist.**
- [ ] **Step 3: Scaffold Vite React TypeScript and add the smallest `App` and test setup that make the smoke test pass.**
- [ ] **Step 4: Add `src/styles.css` token variables for warm ink, deep plum, pale plum, rounded slabs, focus rings, 44px controls, and print media.**
- [ ] **Step 5: Run `npm run test -- App.test.tsx`, `npm run lint`, and `npm run build`; confirm each exits 0.**
- [ ] **Step 6: Commit with `feat: scaffold independent hackathon demo`.**

### Task 2: Synthetic fixture domain

**Files:**
- Create: `src/data/demo-scenarios.ts`, `src/domain/demo.ts`, `src/domain/demo.test.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Produces: `DemoScenario`, `FindingLabel`, `ConfidenceLabel`, `validateScenarioCatalogue(scenarios)`, and `resolveDemoIdentifier(input)`.
- Consumes: only `demo-scenarios.ts`; components must not access unvalidated raw records.

- [ ] **Step 1: Write failing resolver tests.**

```ts
expect(resolveDemoIdentifier('DEMO-CLEAR-404')).toMatchObject({ kind: 'valid' })
expect(resolveDemoIdentifier('')).toEqual({ kind: 'invalid', message: 'Enter a curated synthetic demo identifier.' })
expect(resolveDemoIdentifier('DEMO-UNKNOWN-999')).toMatchObject({ kind: 'invalid' })
```

- [ ] **Step 2: Run `npm run test -- src/domain/demo.test.ts` and confirm the resolver import fails.**
- [ ] **Step 3: Add the smallest typed resolver and five fixtures. Each fixture has a fictional address, 12 chronological filing events, source labels, limitations, and the required scenario-specific language.**
- [ ] **Step 4: Expand the failing test with fixture invariants: five scenarios, 60 filings, 8–12 court entries, required IDs/archetypes, permitted labels, and rejection of a score field.**
- [ ] **Step 5: Run the domain tests; implement only the validator logic needed for green.**
- [ ] **Step 6: Commit with `feat: add validated synthetic scenario catalogue`.**

### Task 3: Scenario chooser and deterministic check state machine

**Files:**
- Create: `src/components/ScenarioChooser.tsx`, `src/components/ScenarioChooser.test.tsx`, `src/hooks/useDemoCheck.ts`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: `DemoScenario[]`, `resolveDemoIdentifier`, and an injected delay function for test control.
- Produces: `DemoCheckState` with `ready | loading | report | error`, `run(identifier)`, and `reset()`.

- [ ] **Step 1: Write failing chooser tests for card-to-input selection, blank error, unknown error, and correct default ID.**
- [ ] **Step 2: Run `npm run test -- src/components/ScenarioChooser.test.tsx` and confirm failure because the chooser is missing.**
- [ ] **Step 3: Implement card selection, labelled input, submit validation, and distinct inline errors.**
- [ ] **Step 4: Add a failing fake-timer test asserting loading exposes an `aria-live` sequence and only reports after 700–1,000ms.**
- [ ] **Step 5: Implement local staged progress without calling fetch; rerun chooser tests green.**
- [ ] **Step 6: Commit with `feat: add curated synthetic check journey`.**

### Task 4: Report evidence and repeat journey

**Files:**
- Create: `src/components/DemoReport.tsx`, `src/components/DemoReport.test.tsx`, `src/components/Findings.tsx`, `src/components/FilingHistory.tsx`, `src/components/CourtObservations.tsx`
- Modify: `src/App.tsx`, `src/styles.css`

**Interfaces:**
- Consumes: a validated `DemoScenario` only.
- Produces: an `<article aria-labelledby="report-title">` including identity, filings, observations, confidence, interpretation, questions, and limitations.

- [ ] **Step 1: Write failing tests parameterised over all five IDs, asserting their identifier, both names, status, all 12 months, source labels, confidence, interpretation, and required non-decision sentence.**
- [ ] **Step 2: Run `npm run test -- src/components/DemoReport.test.tsx` and confirm failure because the report is missing.**
- [ ] **Step 3: Implement the report masthead, identity card, filing grid, candidate table, and limitations using text labels rather than colour alone.**
- [ ] **Step 4: Add failing tests for the empty court state, possible-candidate wording, no-match wording, suspended status flag, and unavailable-fixture recovery.**
- [ ] **Step 5: Implement only the missing evidence/recovery components; rerun all report tests green.**
- [ ] **Step 6: Add a failing focus test for Run another scenario, implement `reset()` focus restoration, and rerun green.**
- [ ] **Step 7: Commit with `feat: render complete synthetic public-record reports`.**

### Task 5: Safety, print, accessibility, and boundary guards

**Files:**
- Create: `src/components/PrototypeNotice.tsx`, `src/components/PrintReportButton.tsx`, `src/components/PrintReportButton.test.tsx`, `src/safety/no-external-integrations.test.ts`
- Modify: `src/App.tsx`, `src/styles.css`, `src/test/setup.ts`

**Interfaces:**
- `PrintReportButton` accepts `{ onPrint?: () => void }` and defaults to `window.print`.
- Tests wrap/spyon only the browser boundary; they must exercise real report output and fixture resolver logic.

- [ ] **Step 1: Write failing tests for the exact disclosure before input, exact report limitation, one print call, and print-targeted report safety text.**
- [ ] **Step 2: Run `npm run test -- src/components/PrintReportButton.test.tsx` and confirm failure because the control is missing.**
- [ ] **Step 3: Implement the notice, print control, `@media print` styles, error reporting for unavailable print, visible focus styling, and responsive report grids.**
- [ ] **Step 4: Add a failing test that completes all five journeys while a fetch spy must have zero calls; add a source scan rejecting `parakh.biz`, `gst.gov`, `ecourts`, `indiankanoon`, `cashfree`, `dodo`, `clerk`, `whatsapp`, `axios`, and `fetch(` in shipped integration code.**
- [ ] **Step 5: Implement only changes required to make the guard green; run all tests, lint, build, and an axe scan.**
- [ ] **Step 6: Commit with `feat: add safe print export and compliance guards`.**

### Task 6: Documentation, release, and evidence

**Files:**
- Create: `README.md`, `docs/hackathon-summary.md`, `docs/demo-script.md`, `docs/synthetic-data.md`, `docs/methodology.md`, `docs/codex-contribution.md`, `docs/judges-guide.md`, `docs/production-vs-hackathon.md`, `docs/compliance-checklist.md`
- Modify: `openspec/changes/parakh-hackathon-demo/tasks.md`, `openspec/changes/parakh-hackathon-demo/apply.md`, `openspec/changes/parakh-hackathon-demo/verify.md`, `openspec/changes/parakh-hackathon-demo/finalize.md`

**Interfaces:**
- `README.md` is the public entry point; `docs/judges-guide.md` is the fresh-browser test script; `docs/hackathon-summary.md` has fewer than 250 words.

- [ ] **Step 1: Write documentation tests/scripts that assert the required docs exist, the summary word count is under 250, and the README contains required safety/setup/deployment sections.**
- [ ] **Step 2: Run the docs check and confirm it fails because required documents are absent.**
- [ ] **Step 3: Write the requested documents, only claiming verified behaviour and clearly marking the deployment URL when known.**
- [ ] **Step 4: Run fresh unit/integration/accessibility tests, lint, production build, `openspec validate --all`, and local desktop/mobile browser smoke checks. Record evidence.**
- [ ] **Step 5: Create `parakh-hackathon-demo` on GitHub, push the validated repository, create a new Vercel project, deploy it, attempt only the separate `build.parakh.biz` alias, and test the public journey unauthenticated.**
- [ ] **Step 6: Update checkboxes and produce Superspec apply/verify/finalize receipts from fresh evidence; commit release docs and artifacts.**
