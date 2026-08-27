## Context

The project root is a newly initialized repository. Production Parakh is a separate authenticated and paid application with live integrations, persistence, billing, and report generation; it is not a dependency or source tree for this work. The hackathon demo must be testable in a fresh browser, visibly honest about simulated data, useful to a low-friction citizen journey, and ready for a public URL.

## Goals / Non-Goals

**Goals:**
- Deliver a polished local-data journey from synthetic ID to a cautious report.
- Make all five required scenario types demonstrably work without sign-in.
- Make synthetic status and limitations prominent before interaction, in the report, and in print.
- Make requirements, TDD results, deployment, and compliance auditable in the repository.

**Non-Goals:**
- Live GST, eCourts, Indian Kanoon, payment, messaging, OTP, authentication, account, database, analytics, API, or PDF-service work.
- A credit score, rating, risk verdict, trust determination, official-government presentation, or production replacement.

## Decisions

1. **Static Vite application**: React state and typed local modules are enough for a deterministic demo, remove backend failure modes, and make a no-network guarantee testable.
2. **Domain-first fixture validation**: `src/data/demo-scenarios.ts` is data only; `src/domain/demo.ts` resolves and validates it. Components consume typed results rather than duplicate legal/safety logic.
3. **Explicit local journey states**: `ready`, `loading`, `report`, and `error` keep invalid input, unavailable data, and simulated progress understandable and testable.
4. **Print rather than server PDF**: `window.print()` exports the visible report safely. CSS print rules preserve disclosures and limitations; it avoids rendering infrastructure that judges do not need.
5. **Independent visual language**: CSS token variables implement soft warm-plum washes, rounded slabs, readable type, and responsive cards without copying production assets or Aave branding.
6. **Documentation as product surface**: README and judge guide tell reviewers exactly what they can test, what is mocked, and why no live integrations exist.

## Risks / Trade-offs

- **A static demo could look like a mockup** → a visible staged interaction, complete local reports, invalid/error states, print action, and automated tests prove behaviour.
- **Court candidates could be read as conclusions** → label candidates as synthetic observations, show confidence text, explain attribution, and state they are not confirmed.
- **A clean scenario could imply clearance** → use `CLEAR` only for the specific synthetic check and repeat the limitations sentence.
- **Custom-domain setup may not finish in time** → deploy a public Vercel URL first and attempt the new-project alias only after verifying the target.
- **Fast development could erode safety claims** → use fixture validators, source scans, scenario tests, and a final compliance checklist.

## Migration Plan

1. Create and validate the independent repository and static application.
2. Deploy it to a new Vercel project and test it in a fresh, unauthenticated browser.
3. Add `build.parakh.biz` to that new project only if it is safe and available; otherwise retain the public deployment URL.
4. Roll back by removing only the alias or Vercel project; no production system requires rollback.

## Open Questions

None. Custom-domain availability is explicitly non-blocking.
