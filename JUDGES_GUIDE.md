# Judges Guide

## Fast Path

1. Open the public demo.
2. Confirm the synthetic-data disclosure is visible on the first screen.
3. Click any scenario card or type a listed synthetic GSTIN-style identifier.
4. The demo opens a dedicated report page.
5. Watch the visible AI Attribution Reasoning loading state.
6. Read the generated model justification, confidence, and decision—or the
   explicit fixture-grade fallback if no local API key is configured.
7. Switch to another scenario and compare the observations.
8. Try print or Download PDF.

For a local live-model demo, put `OPENAI_API_KEY` in `.env.local`. The key stays
server-side and the request is limited to the synthetic fixture metadata.

The transparent pipeline is documented at `/synthetic-data`.

## Suggested Scenarios

- Start with `SYN-GSTIN-CLEAR-001` to see a mostly clear report.
- Switch to `SYN-GSTIN-DELAY-002` to see repeated filing delay signals.
- Switch to `SYN-GSTIN-MISMATCH-003` to see name-mismatch handling.
- Switch to `SYN-GSTIN-COURT-004` to see fictional public-record signals.
- Switch to `SYN-GSTIN-PARTIAL-005` to see insufficient-data restraint.

## What To Look For

- The demo works without login.
- The report explains evidence instead of issuing a score.
- Each observation has a `FLAG`, `CLEAR`, or `NOTE` label.
- Confidence, attribution, provenance, limitations, and missing evidence are
  visible.
- The demo states what is synthetic and what production would require.
