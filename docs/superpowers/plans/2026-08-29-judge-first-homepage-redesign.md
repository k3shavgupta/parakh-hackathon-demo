# Judge-First Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the standalone Parakh hackathon homepage into a judge-first, mobile-first explanation and working synthetic citizen journey while retaining the existing report routes and local v4-style fixture engine.

**Architecture:** Keep the existing `Home` client component responsible for search state and navigation. Extract only small presentational data and components into the page file unless repeated report concerns justify a shared primitive. The report engine and fixture contracts remain unchanged; the report document receives token-only visual alignment and no new data dependencies.

**Tech Stack:** Next-compatible Vinext, React 19, TypeScript, Tailwind CSS 4, lucide-react, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-29-judge-first-homepage-design.md`

## Global Constraints

- Keep this a separate synthetic-data demo; do not modify production Parakh systems, auth, payments, databases, APIs, secrets, or integrations.
- Use only local synthetic fixtures and only `FLAG`, `CLEAR`, and `NOTE` observations.
- Do not add ratings, scores, trust indicators, credit recommendations, traffic-light judgments, or live-record claims.
- Keep the exact mandatory disclosure visible in the first homepage viewport.
- Preserve direct `/report/[synthetic-identifier]` routing and block real-looking input values.
- Use Onest for interface copy, Instrument Serif italic only as display-word accents, and the established Parakh plum/off-white/ink palette.
- Maintain touch targets of at least 44px and responsive behavior at 560px, 760px, and 960px.

---

## File Structure

- Modify: `app/page.tsx` — judge-first homepage sections, search interaction, and fixture scenario presentation.
- Modify: `app/globals.css` — Parakh token cleanup, slab rhythm, focus styles, responsive helpers, and print-safe report rules.
- Modify: `components/parakh-report-document.tsx` — shared token alignment and accessible scenario-switcher affordances while retaining report content/actions.
- Modify: `tests/synthetic-engine.test.ts` — preserve engine boundary assertions and add one test for unknown synthetic-format identifiers.
- Create: `tests/homepage.spec.ts` — browser-level public journey regression coverage.
- Modify: `JUDGES_GUIDE.md` — update fast path to match the judge-first story and live demo placement.
- Modify: `SUBMISSION_SUMMARY.md` — align the under-250-word submission narrative with the live experience.

## Task 1: Lock the fixture and routing boundary

**Files:**
- Modify: `tests/synthetic-engine.test.ts`
- Modify: `lib/synthetic-engine.ts`

**Interfaces:**
- Consumes: `buildSyntheticReport(identifier: string): SyntheticReport` and `isAllowedSyntheticIdentifier(value: string): boolean`.
- Produces: a regression-protected rule that only existing local synthetic scenario identifiers produce a report.

- [ ] **Step 1: Write the failing test**

Add this case to `tests/synthetic-engine.test.ts`:

```ts
it('rejects synthetic-format identifiers without a local fixture', () => {
  expect(isAllowedSyntheticIdentifier('SYN-GSTIN-UNKNOWN-999')).toBe(true);
  expect(() => buildSyntheticReport('SYN-GSTIN-UNKNOWN-999')).toThrow(
    'No local synthetic fixture exists for this identifier.',
  );
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- tests/synthetic-engine.test.ts`

Expected: the new case fails only if the engine contract does not distinguish a safely formatted synthetic ID from a known local fixture.

- [ ] **Step 3: Implement the minimal boundary behavior**

Keep `isAllowedSyntheticIdentifier` responsible only for safe synthetic format validation and make `buildSyntheticReport` throw exactly `No local synthetic fixture exists for this identifier.` when no entry in `RAW_SYNTHETIC_SCENARIOS` matches. Do not add fixture fallbacks, live lookups, or generated data.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- tests/synthetic-engine.test.ts`

Expected: all engine tests pass, including the unknown-fixture case.

- [ ] **Step 5: Commit**

```bash
git add tests/synthetic-engine.test.ts lib/synthetic-engine.ts
git commit -m "test: protect synthetic fixture boundary"
```

## Task 2: Build the judge-first homepage

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `SCENARIOS`, `isAllowedSyntheticIdentifier`, `window.location.href`, and the required disclosure string.
- Produces: an interactive no-login homepage with `#journey`, `#demo`, `#works`, and `#boundary` anchors, plus report navigation via `/report/${encodeURIComponent(identifier)}`.

- [ ] **Step 1: Write the failing browser test**

Create `tests/homepage.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('shows the synthetic boundary and routes a listed scenario to its report', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'What we want to build' })).toBeVisible();
  await expect(page.getByText('This hackathon demo uses synthetic data only.')).toBeVisible();

  await page.getByRole('button', { name: /Try the synthetic demo/i }).click();
  await page.getByRole('button', { name: /SYN-GSTIN-DELAY-002/i }).click();

  await expect(page).toHaveURL(/\/report\/SYN-GSTIN-DELAY-002$/);
  await expect(page.getByText('Repeated filing delay pattern')).toBeVisible();
});

test('blocks a real-looking identifier', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Synthetic firm GSTIN').fill('27ABCDE1234F1Z5');
  await page.getByRole('button', { name: /Run synthetic check/i }).click();

  await expect(page.getByText('Real-looking IDs are blocked.')).toBeVisible();
});
```

- [ ] **Step 2: Run the browser test to verify it fails**

Run the local dev server in one terminal: `npm run dev -- --port 4173`

Run in a second terminal: `npx playwright test tests/homepage.spec.ts --base-url http://127.0.0.1:4173`

Expected: the test fails because the judge-first heading, CTA, and `Run synthetic check` label do not exist yet.

- [ ] **Step 3: Implement the homepage structure**

Replace the page body with these sections in this exact order:

```tsx
<section aria-labelledby="build-heading">{/* judge-first hero */}</section>
<section id="journey" aria-labelledby="journey-heading">{/* three citizen steps */}</section>
<section id="demo" aria-labelledby="demo-heading">{/* synthetic search and five scenarios */}</section>
<section aria-labelledby="clarity-heading">{/* fragmented-to-explainable comparison */}</section>
<section id="works" aria-labelledby="works-heading">{/* dark working-prototype inventory */}</section>
<section id="boundary" aria-labelledby="boundary-heading">{/* mocked and safe-scale boundary */}</section>
```

Implement `focusDemo()` as follows so the hero CTA both reveals and focuses the search field:

```ts
function focusDemo() {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => document.getElementById('synthetic-identifier')?.focus(), 350);
}
```

Keep the input ID `synthetic-identifier`, label it `Synthetic firm GSTIN`, and name the submit button `Run synthetic check`. Set `aria-live="polite"` on the search-error container. Scenario cards must be buttons with names containing both the scenario identifier and ordinary-language situation.

In `app/globals.css`, define Parakh-specific token variables (`--parakh-ink`, `--parakh-plum`, `--parakh-plum-dark`, `--parakh-wash`, `--parakh-blush`) and use them for a pale single-hue wash, white chapter, dark chapter, white chapter, pale wash sequence. Preserve all existing Tailwind base layers and print rules.

- [ ] **Step 4: Run the browser test to verify it passes**

Run: `npx playwright test tests/homepage.spec.ts --base-url http://127.0.0.1:4173`

Expected: both homepage journey cases pass and the report URL includes the chosen synthetic identifier.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/globals.css tests/homepage.spec.ts
git commit -m "feat: add judge-first Parakh demo journey"
```

## Task 3: Align report navigation and visual language

**Files:**
- Modify: `components/parakh-report-document.tsx`
- Modify: `tests/homepage.spec.ts`

**Interfaces:**
- Consumes: `SyntheticReport`, `SCENARIOS`, `reportToText(report)`, `window.print()`, and report routes.
- Produces: a report page that retains its evidence content and exposes accessible scenario switching, print, and download actions.

- [ ] **Step 1: Write the failing browser test**

Append this test to `tests/homepage.spec.ts`:

```ts
test('switches synthetic scenarios from the report without losing report controls', async ({ page }) => {
  await page.goto('/report/SYN-GSTIN-DELAY-002');

  await expect(page.getByRole('button', { name: 'Print' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download' })).toBeVisible();

  await page.getByRole('button', { name: /SYN-GSTIN-COURT-004/i }).click();

  await expect(page).toHaveURL(/\/report\/SYN-GSTIN-COURT-004$/);
  await expect(page.getByText('SYN-CIV-2026-014')).toBeVisible();
});
```

- [ ] **Step 2: Run the focused browser test to verify it fails**

Run: `npx playwright test tests/homepage.spec.ts -g "switches synthetic scenarios" --base-url http://127.0.0.1:4173`

Expected: it fails if an accessible report control or scenario navigation target is absent.

- [ ] **Step 3: Implement the minimal report alignment**

Keep the existing report sections and `reportToText` output. Update only the class names and helper copy necessary to consume the new Parakh CSS variables. Ensure every scenario button keeps its synthetic identifier in accessible text, the current scenario has `aria-current="page"`, the download link stays visible at mobile width, and `Print` calls `window.print()`.

- [ ] **Step 4: Run the focused browser test to verify it passes**

Run: `npx playwright test tests/homepage.spec.ts -g "switches synthetic scenarios" --base-url http://127.0.0.1:4173`

Expected: the report changes routes and preserves the print/download controls.

- [ ] **Step 5: Commit**

```bash
git add components/parakh-report-document.tsx tests/homepage.spec.ts
git commit -m "feat: refine report navigation for judge review"
```

## Task 4: Refresh judge-facing documentation

**Files:**
- Modify: `JUDGES_GUIDE.md`
- Modify: `SUBMISSION_SUMMARY.md`

**Interfaces:**
- Consumes: the final homepage sequence, five scenario identifiers, and the production-boundary statements in `PRODUCTION_BOUNDARY.md`.
- Produces: a guide that lets a reviewer complete the public journey and a submission summary of fewer than 250 words.

- [ ] **Step 1: Write the failing documentation check**

Run:

```bash
rg -n "What we want to build|Try the synthetic demo|SYN-GSTIN-COURT-004|synthetic data only" JUDGES_GUIDE.md SUBMISSION_SUMMARY.md
wc -w SUBMISSION_SUMMARY.md
```

Expected: at least one required judge-first phrase is missing from the old documentation or the guide does not explicitly match the redesigned landing journey.

- [ ] **Step 2: Update the guide and summary**

Revise `JUDGES_GUIDE.md` to lead with the homepage story, then show the one-minute journey: understand the problem, use the demo CTA, search/select a synthetic scenario, inspect the report, switch scenario, and use print/download. Keep the five identifiers and their ordinary-language situations.

Rewrite `SUBMISSION_SUMMARY.md` as one concise narrative under 250 words. It must name the user problem, what changes, why the journey is clearer, what functions now, what remains mocked, and how production would operate safely. It must explicitly state that production Parakh remains separate.

- [ ] **Step 3: Run the documentation check to verify it passes**

Run:

```bash
rg -n "What we want to build|Try the synthetic demo|SYN-GSTIN-COURT-004|synthetic data only" JUDGES_GUIDE.md SUBMISSION_SUMMARY.md
wc -w SUBMISSION_SUMMARY.md
```

Expected: the guide and summary contain the required journey terms and the summary has fewer than 250 words.

- [ ] **Step 4: Commit**

```bash
git add JUDGES_GUIDE.md SUBMISSION_SUMMARY.md
git commit -m "docs: align hackathon guide with judge-first demo"
```

## Task 5: Validate and publish the standalone demo

**Files:**
- Modify only if validation identifies a real defect: files from Tasks 1-4.

**Interfaces:**
- Consumes: the built Site source, `.openai/hosting.json`, existing separate Sites project, and public demo access.
- Produces: a deployed standalone demo version without any production Parakh deployment.

- [ ] **Step 1: Run the complete validation suite**

Run:

```bash
npm test
npm run lint
npm run build
npx playwright test tests/homepage.spec.ts --base-url http://127.0.0.1:4173
```

Expected: every command exits successfully. Address only failures that are caused by the redesign.

- [ ] **Step 2: Verify production separation before publish**

Run:

```bash
git status --short --branch
curl -s -o /dev/null -w '%{http_code}\n' https://parakh.biz/
curl -s -o /dev/null -w '%{http_code}\n' https://www.parakh.biz/
```

Expected: the current repository contains only intended standalone demo changes, and the production URLs are checked without modifying them.

- [ ] **Step 3: Publish the validated existing Sites project**

Use the existing separate Sites project from `.openai/hosting.json`. Save and deploy the validated source version through the Sites hosting workflow. Do not create a project with the production Parakh name and do not change production-domain infrastructure.

- [ ] **Step 4: Verify the deployed public journey**

Run the three browser flows against the deployed preview URL:

```text
1. Homepage -> "Try the synthetic demo" -> SYN-GSTIN-DELAY-002 -> delayed report.
2. Direct /report/SYN-GSTIN-COURT-004 -> switch to SYN-GSTIN-PARTIAL-005.
3. Homepage -> enter 27ABCDE1234F1Z5 -> visible blocked-ID message.
```

Expected: all flows work without login and the required disclosure is visible.

- [ ] **Step 5: Commit any validation repair**

```bash
git add app components lib tests JUDGES_GUIDE.md SUBMISSION_SUMMARY.md
git commit -m "fix: resolve judge journey validation issue"
```

Only run this step if a validation repair was necessary.

## Plan Self-Review

- Spec coverage: Task 2 covers the judge-first hero, citizen journey, live demo, clarity section, working-prototype inventory, and safe-scale boundary. Task 3 preserves the report experience. Task 4 covers judge-facing documentation. Task 5 covers validation and standalone publication.
- Placeholder scan: no deferred implementation markers are present; every task includes an explicit command or code target.
- Interface consistency: Tasks 1-3 preserve the established `SCENARIOS`, `isAllowedSyntheticIdentifier`, `buildSyntheticReport`, and `/report/[identifier]` contracts. Task 2 introduces only DOM-level anchor and input IDs used by its browser test.
