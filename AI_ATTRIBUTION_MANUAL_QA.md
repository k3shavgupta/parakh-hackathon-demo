# AI Attribution Manual QA

This checklist is for the local 'codex/ai-attribution-reasoning' branch only.
The demo uses synthetic fixtures; it does not touch production Parakh data.

## Setup

Create '.env.local' in the project root:

    OPENAI_API_KEY=your-real-local-key
    # Optional:
    OPENAI_MODEL=gpt-4o-mini

Use 'OPENAI_API_KEY' exactly. Do not rename it to 'VITE_OPENAI_API_KEY'
or 'NEXT_PUBLIC_OPENAI_API_KEY'; the key is read by the server route and is
not sent to the browser. Start the app with 'npm run dev'.

## Recommended demo lookups

| Story | Type this exactly | Report / record to watch | Expected model state |
| --- | --- | --- | --- |
| Clear attribution | 'DEMO-2026-0001' (or 'Aarav Precision') | 'SYN-REG-CLEAR-011' | 'ATTRIBUTED', High confidence. The exact synthetic legal name is the named party. |
| Do not attribute | 'DEMO-2026-0003' (or 'Dakshin Alloy') | 'SYN-REG-MISMATCH-028' | 'NOT ATTRIBUTED', High confidence. Similar words identify a different synthetic legal entity. |
| Natural ambiguity | 'DEMO-2026-0003' (or 'Dakshin Alloy Traders') | 'SYN-REG-MISMATCH-027' | 'UNCERTAIN', usually Medium/Low confidence. The alias is similar but not an exact legal-name match. |

The mismatch report intentionally contains both the explicit different-entity
negative record and the older alias record, making the contrast visible in one
take. The model is allowed to return a conservative decision if its response
does not follow the expected fixture story.

## Ordered manual QA

1. Open the local homepage and confirm the synthetic-data disclosure is visible.
2. Search 'DEMO-2026-0001'. Each public-record card should first show
   'THINKING', then the separate AI Attribution Reasoning block should show
   'ATTRIBUTED', High, and a record-specific explanation. Generic text such as
   “the data looks good” is a problem.
3. Search 'DEMO-2026-0003'. Confirm both record IDs are present:
   'SYN-REG-MISMATCH-028' should say 'NOT ATTRIBUTED' and explain that the
   entity is different; 'SYN-REG-MISMATCH-027' should be treated as the
   ambiguous alias case. A confident attribution for the different-entity row
   is a problem.
4. Repeat the same search from the homepage or reload the report. Confirm a
   fresh 'THINKING' state appears and the response can have different wording.
   More than 10 requests from one IP in one hour will correctly return the
   documented rate-limit fallback.
5. Download the PDF after the reasoning settles. It should include the AI
   Attribution Reasoning heading, each decision, confidence, justification, the
   synthetic court/record metadata, and the CICRA limitation note. Missing or
   clipped reasoning is a problem.
6. Temporarily remove or rename 'OPENAI_API_KEY', restart the local server, and
   open 'DEMO-2026-0004'. The report should remain usable and show
   'AI reasoning unavailable, showing fixture-based grade: FLAG/NOTE'. A
   permanent 'THINKING' state or invented AI conclusion is a problem.
7. Open '/synthetic-data' and confirm the fixture -> adapter -> engine -> AI
   reasoning -> report schema -> renderer pipeline and the server-only key note.

## Caching answer

The AI attribution result is not cached by this app. Every mounted report
fetches 'POST /api/ai-attribution'; the route returns 'Cache-Control:
no-store', and each provider request sets 'store: false'. Reopening the same
report or submitting the same search again therefore makes a fresh provider
call, so justification wording may vary between video takes.

The React effect does not repeat while the same report component remains mounted
without a dependency change. For a deliberate new take, repeat the search from
the homepage or reload the report. The per-IP limit is 10 calls per hour.

No deployment, push, production-repo, Clerk, or Cashfree changes are part of
this QA flow.
