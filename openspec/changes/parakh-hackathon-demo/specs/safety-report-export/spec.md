## ADDED Requirements

### Requirement: Prominent prototype safety disclosure
The homepage and every report SHALL prominently display: “Independent hackathon prototype. This demo uses synthetic data and simulated public-record integrations. It is not an official government service, credit score, credit report, or legal advice.”

#### Scenario: Disclosure precedes main interaction
- **WHEN** a visitor first opens the homepage
- **THEN** the disclosure is visible before the scenario input.

### Requirement: Non-decision report semantics
Every report MUST display: “Parakh reports public-record observations. It does not determine whether a business is trustworthy, fraudulent, creditworthy, or safe to transact with.” The interface MUST NOT expose a score, rating, verdict, trust judgment, creditworthiness decision, or official-government affiliation.

#### Scenario: Report limitations are visible
- **WHEN** any scenario report is rendered
- **THEN** the required sentence and limitations about payment behaviour, liabilities, beneficial ownership, goods quality, fraud, legal outcome, and creditworthiness are readable.

### Requirement: Local-only integration boundary
The application SHALL use only local fixture data and MUST NOT call or contain configured endpoints for production Parakh, government services, live GST, courts, payments, messaging, authentication, or analytics.

#### Scenario: Journey does not invoke fetch
- **WHEN** a visitor completes each scenario journey
- **THEN** the test instrumentation confirms that fetch was not invoked.

### Requirement: Print-compatible report export
The report SHALL provide a print/download action that invokes browser printing and MUST preserve the report title, synthetic disclosure, evidence, and limitations in print media.

#### Scenario: Print action is usable
- **WHEN** a visitor selects Print / Download report
- **THEN** the configured print handler is invoked once and the print-targeted report includes required safety content.
