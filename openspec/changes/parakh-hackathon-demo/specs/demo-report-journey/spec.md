## ADDED Requirements

### Requirement: Curated scenario entry
The public homepage SHALL let a visitor select a curated scenario or enter a known synthetic identifier and MUST not require sign-in, payment, OTP, account, or credential.

#### Scenario: Scenario card populates the input
- **WHEN** a visitor selects a scenario card
- **THEN** the corresponding synthetic identifier appears in the input and can be run.

#### Scenario: Invalid input is explained
- **WHEN** a visitor submits blank input or an unknown identifier
- **THEN** the page shows a distinct inline helpful error, retains entered input, and does not show a report.

### Requirement: Simulated check progression
For a known identifier, the application SHALL display an accessible deterministic loading sequence before rendering the local report.

#### Scenario: Valid check enters and exits loading
- **WHEN** a visitor runs a known synthetic identifier
- **THEN** an `aria-live` staged simulated check is visible for 700–1,000ms and then the matching report appears without a fetch or XHR request.

### Requirement: Complete local report
The report SHALL present the synthetic identifier, identity and constitution, registration status, 12-month filing behaviour, simulated court observations, confidence text, plain-language interpretation, clarification questions, source labels, synthetic-data disclosure, and limitations.

#### Scenario: Possible candidate remains unconfirmed
- **WHEN** the visitor runs `DEMO-COURT-303`
- **THEN** each possible court candidate is visibly labelled `POSSIBLE` and described as not confirmed to be the fictional business.

#### Scenario: Limited finding is not clearance
- **WHEN** the visitor runs `DEMO-CLEAR-404`
- **THEN** the report says no issue was found in this specific synthetic check and does not call the entity safe, verified, trusted, or creditworthy.

### Requirement: Recovery and repeat journey
The application SHALL provide a recovery state for an unavailable local scenario and a Run another scenario control that restores the chooser and focus.

#### Scenario: Visitor runs another scenario
- **WHEN** a visitor selects Run another scenario from a report
- **THEN** the report clears, the chooser is focused, and another curated identifier can be checked.
