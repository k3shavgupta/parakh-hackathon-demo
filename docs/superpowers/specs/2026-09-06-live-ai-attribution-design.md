# Live AI Attribution Reasoning Design

## Goal

Add a visible, runtime OpenAI attribution step on top of the existing local synthetic Parakh fixtures while keeping all synthetic-data, safety, and production-isolation boundaries intact.

## Scope and priority

1. Fuzzy business-name or synthetic-identifier resolver.
2. Server-only AI attribution API with rate limiting, timeout handling, and report/PDF display.
3. Footer regression fix.
4. Automated tests and local verification.
5. `/synthetic-data` Evidence Lab route if the prioritized work is complete.

## Current-state constraints

- The five synthetic fixtures remain the only searchable data source.
- Real-looking GSTIN, PAN, and Aadhaar-like values remain rejected.
- Current fixture grades remain the fallback when AI is unavailable.
- No authentication, payment, production Parakh repository, deployment, or push is in scope.
- The current repository has no PDF-lib implementation or Evidence Lab route, so both are added locally only.

## Architecture

The browser resolves a free-text query to one of the five fixture identifiers using a conservative local resolver, then navigates to the existing report route. The report page remains fixture-rendered on the server, while the client report component calls a new server-only API once per returned public record. The API re-resolves the identifier and record on the server, constructs a bounded prompt from synthetic metadata, calls OpenAI with `OPENAI_API_KEY`, validates the structured result, and returns only the attribution decision, confidence, and justification.

The API never accepts arbitrary record metadata from the browser and never exposes the API key. An in-memory IP/hour bucket provides basic abuse protection for local and single-process deployments; the UI falls back to the fixture signal with an explicit unavailable message on rate-limit, timeout, provider, or validation errors.

The client report displays loading, success, and fallback states in a distinct “AI Attribution Reasoning” section. The same resolved reasoning is included in the generated A4 PDF and text representation. Fixture court metadata uses unmistakably fictional `SYN-CASE-*` references, `Synthetic District Court` labels, and synthetic party/match-basis wording.

## Verification

- Unit tests cover resolver ranking, safe rejection, fixture metadata, API request validation/rate limiting, structured response parsing, and fallback text.
- Existing engine tests remain green.
- `npm run lint`, `npm run build`, and a local browser journey verify the report flow.
- PDF output is checked with `pdfinfo`, `pdftotext -layout`, and `qpdf --check` when available.
- No deploy, Vercel command, production-domain action, or GitHub push is performed.
