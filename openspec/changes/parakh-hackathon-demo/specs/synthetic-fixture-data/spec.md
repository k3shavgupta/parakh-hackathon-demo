## ADDED Requirements

### Requirement: Synthetic scenario catalogue
The application SHALL provide exactly five locally stored fictional counterparty scenarios identified by `DEMO-ID-101`, `DEMO-FILING-202`, `DEMO-COURT-303`, `DEMO-CLEAR-404`, and `DEMO-STATUS-505`; each scenario MUST include a fictional legal name, trade name, constitution, state, address, registration date, registration status, filing history, court observations, explanation, and limitation text.

#### Scenario: Known scenario resolves
- **WHEN** a caller resolves one of the five curated identifiers
- **THEN** it receives the matching typed local scenario without a network request.

#### Scenario: Unknown identifier does not resolve
- **WHEN** a caller resolves a blank, malformed, or unknown identifier
- **THEN** it receives a typed invalid result with a helpful message and no report data.

### Requirement: Filing and court fixture integrity
Each scenario SHALL contain exactly 12 chronological local filing events, for a total of 60 events, and the full catalogue MUST contain 8–12 fictional simulated court-record entries. Court observations MUST use only `STRONG`, `POSSIBLE`, or `NO MATCH` confidence, and report findings MUST use only `FLAG`, `CLEAR`, or `NOTE`.

#### Scenario: Fixture validator accepts the catalogue
- **WHEN** the shipped scenario catalogue is validated
- **THEN** validation confirms five scenarios, 60 filing events, permitted labels, simulated source labels, and the required scenario archetypes.

#### Scenario: Fixture validator rejects an unsafe record
- **WHEN** a fixture omits a simulated source label or contains a score, rating, verdict, or prohibited confidence value
- **THEN** validation reports that fixture as invalid.

### Requirement: Required synthetic scenarios
The catalogue SHALL represent identity mismatch, filing gaps, possible litigation matches, consistent record with limited findings, and suspended or cancelled registration without using real-world identifiers or records.

#### Scenario: Scenario-specific evidence is present
- **WHEN** each curated scenario is rendered
- **THEN** the identity mismatch, filing gaps, possible candidate wording, limited-finding wording, or registration-status clarification is visible as applicable.
