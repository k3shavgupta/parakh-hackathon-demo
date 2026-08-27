## ADDED Requirements

### Requirement: Traceable project documentation
The repository SHALL include a README, MIT license, hackathon summary, two-minute demo script, synthetic-data methodology, methodology, Codex contribution record, judges guide, production-versus-hackathon boundary, and compliance checklist.

#### Scenario: Reviewer reads the repository root
- **WHEN** a reviewer opens the README
- **THEN** it explains the problem, target user, journey, public-service relevance, simulation boundary, safety limitations, setup, tests, deployment, Codex contribution, and difference from production Parakh.

### Requirement: Judge-ready instructions
`docs/judges-guide.md` SHALL list the recommended scenario, all synthetic identifiers, expected outcomes, exact testing steps, and mocked functionality. `docs/hackathon-summary.md` MUST remain under 250 words and `docs/demo-script.md` MUST fit a maximum two-minute presentation.

#### Scenario: Judge follows the guide
- **WHEN** a judge follows the guide in a fresh browser
- **THEN** they can complete the demo without credentials and understand what each simulated result means.

### Requirement: Production boundary documentation
`docs/production-vs-hackathon.md` SHALL describe production Parakh as a separate authenticated, paid, live public-record product and MUST state that this project is a separate synthetic, unauthenticated prototype with no production integrations or copied assets.

#### Scenario: Boundary is explicit
- **WHEN** a reviewer reads the boundary document
- **THEN** it can identify what the demo intentionally does not rebuild or contact.
