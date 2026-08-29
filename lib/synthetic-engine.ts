import {
  RAW_SYNTHETIC_SCENARIOS,
  type SyntheticLabel,
} from './synthetic-fixtures';
import {
  buildSyntheticV4Evidence,
  type SyntheticV4Evidence,
} from './v4-synthetic-adapter';

export type Observation = {
  label: SyntheticLabel;
  title: string;
  detail: string;
  confidence: 'High' | 'Medium' | 'Low';
  attribution: string;
  provenance: string;
};

export type NormalizedFiling = {
  period: string;
  month: string;
  gstr1: string;
  gstr3b: string;
  filedOn: string;
  provenance: string;
};

export type SyntheticReport = {
  reportId: string;
  generatedAt: string;
  searchedIdentifier: string;
  syntheticDisclosure: string;
  summary: string;
  business: {
    legalName: string;
    tradeName: string;
    constitution: string;
    registrationState: string;
    registrationStatus: string;
    syntheticRegistrationDate: string;
    syntheticBusinessActivity: string;
    syntheticAddress: string;
    normalizedNames: string[];
    provenance: string;
  };
  filingPattern: {
    rows: NormalizedFiling[];
    explanation: string;
    confidence: 'High' | 'Medium' | 'Low';
  };
  publicRecords: {
    id: string;
    date: string;
    signal: SyntheticLabel;
    summary: string;
    parties: string[];
    confidence: 'High' | 'Medium' | 'Low';
    provenance: string;
    caseReference: string;
    courtName: string;
    filingYear: string;
    proceeding: string;
    matchBasis: string;
    recordStatus: string;
    partySide: 'petitioner' | 'respondent' | 'unknown';
    matchGrade: 'STRONG' | 'POSSIBLE' | 'WEAK';
    matchedParty: string;
    resolutionReason: string;
  }[];
  engine: SyntheticV4Evidence;
  observations: Observation[];
  cannotFind: string[];
  generationSteps: string[];
};

export const SCENARIOS = RAW_SYNTHETIC_SCENARIOS.map((scenario) => ({
  id: scenario.id,
  identifier: scenario.identifier,
  shortName: scenario.shortName,
  scenarioType: scenario.scenarioType,
  judgePrompt: scenario.judgePrompt,
}));

const SYNTHETIC_IDENTIFIER = /^DEMO-2026-000[1-5]$/;
const GSTIN_LIKE = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;
const PAN_LIKE = /^[A-Z]{5}\d{4}[A-Z]$/;
const AADHAAR_LIKE = /^\d{4}\s?\d{4}\s?\d{4}$/;

export function isAllowedSyntheticIdentifier(value: string) {
  const normalized = value.trim().toUpperCase();
  return (
    SYNTHETIC_IDENTIFIER.test(normalized) &&
    !GSTIN_LIKE.test(normalized) &&
    !PAN_LIKE.test(normalized) &&
    !AADHAAR_LIKE.test(normalized)
  );
}

function normalizeName(value: string) {
  return value
    .toUpperCase()
    .replace(/\bPRIVATE\b/g, 'PVT')
    .replace(/\bLIMITED\b/g, 'LTD')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPeriod(period: string) {
  const date = new Date(`${period}-01T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatDate(value: string | null) {
  if (!value) return 'Not available in fixture';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function sentenceForStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function buildReportId(identifier: string) {
  return `PRK-${identifier}`;
}

function buildObservations(scenario: (typeof RAW_SYNTHETIC_SCENARIOS)[number]) {
  const delayedOrMissing = scenario.filings.filter(
    (filing) =>
      filing.gstr1 === 'delayed' ||
      filing.gstr1 === 'missing' ||
      filing.gstr3b === 'delayed' ||
      filing.gstr3b === 'missing',
  );
  const unavailable = scenario.filings.filter(
    (filing) =>
      filing.gstr1 === 'not_available' || filing.gstr3b === 'not_available',
  );
  const observations: Observation[] = [
    {
      label: 'CLEAR',
      title: 'Synthetic profile found',
      detail:
        'The searched identifier resolves to a local synthetic business profile with a legal name, trade name, state, and registration marker.',
      confidence: 'High',
      attribution: 'Synthetic business profile lookup',
      provenance: scenario.business.source,
    },
  ];

  if (delayedOrMissing.length >= 3) {
    observations.push({
      label: 'FLAG',
      title: 'Repeated filing delay pattern',
      detail: `${delayedOrMissing.length} recent synthetic periods include delayed or missing return markers. This is an operational follow-up signal, not a credit or trust verdict.`,
      confidence: 'High',
      attribution: 'Derived from synthetic GST filing fixture rows',
      provenance: delayedOrMissing[0]?.source ?? 'Local synthetic fixture',
    });
  } else if (delayedOrMissing.length > 0) {
    observations.push({
      label: 'NOTE',
      title: 'Isolated filing delay marker',
      detail:
        'One recent synthetic period includes a filing delay marker. The pattern is limited in this fixture.',
      confidence: 'Medium',
      attribution: 'Derived from synthetic GST filing fixture rows',
      provenance: delayedOrMissing[0]?.source ?? 'Local synthetic fixture',
    });
  } else if (unavailable.length === 0) {
    observations.push({
      label: 'CLEAR',
      title: 'Recent filing pattern is consistent',
      detail:
        'Available synthetic returns show regular filing markers across the recent periods included in this demo.',
      confidence: 'High',
      attribution: 'Derived from synthetic GST filing fixture rows',
      provenance: scenario.filings[0]?.source ?? 'Local synthetic fixture',
    });
  }

  if (unavailable.length > 0) {
    observations.push({
      label: 'NOTE',
      title: 'Insufficient filing history',
      detail:
        'The fixture contains too few complete periods to describe a durable filing pattern. A production report would say less, not guess more.',
      confidence: 'Low',
      attribution: 'Derived from synthetic GST filing fixture rows',
      provenance: unavailable[0]?.source ?? 'Local synthetic fixture',
    });
  }

  for (const record of scenario.publicRecords) {
    observations.push({
      label: record.signal,
      title:
        record.signal === 'FLAG'
          ? 'Public-record signal needs review'
          : record.signal === 'CLEAR'
            ? 'Name alignment found'
            : 'Possible alias record',
      detail: record.summary,
      confidence: record.confidence,
      attribution: `${record.category} record ${record.id}`,
      provenance: record.source,
    });
  }

  if (scenario.id === 'mismatch') {
    observations.push({
      label: 'FLAG',
      title: 'Name variants require confirmation',
      detail:
        'The synthetic fixture includes similar names that should be resolved before onboarding or payment release.',
      confidence: 'Medium',
      attribution: 'Normalized legal name and alias comparison',
      provenance: scenario.business.source,
    });
  }

  observations.push({
    label: 'NOTE',
    title: 'Read with demo limitations',
    detail:
      'This demo explains what the evidence says and what it cannot say. It does not score, rate, or clear a counterparty.',
    confidence: scenario.id === 'partial' ? 'Low' : 'Medium',
    attribution: 'Report methodology note',
    provenance: 'Parakh synthetic demo methodology',
  });

  return observations;
}

function summarizeScenario(id: string, observationLabels: SyntheticLabel[]) {
  if (id === 'partial') {
    return 'This report contains limited synthetic evidence and should be read as an insufficient-data example.';
  }
  if (observationLabels.includes('FLAG')) {
    return 'This report surfaces specific follow-up signals with evidence and confidence language, without issuing a verdict.';
  }
  return 'This report shows the available synthetic evidence as mostly clear while preserving limitations and provenance.';
}

export function buildSyntheticReport(identifier: string): SyntheticReport {
  const normalizedIdentifier = identifier.trim().toUpperCase();

  if (!isAllowedSyntheticIdentifier(normalizedIdentifier)) {
    throw new Error(
      'Only obvious synthetic identifiers are accepted in this demo.',
    );
  }

  const scenario = RAW_SYNTHETIC_SCENARIOS.find(
    (fixture) => fixture.identifier === normalizedIdentifier,
  );

  if (!scenario) {
    throw new Error('No local synthetic fixture exists for this identifier.');
  }

  const observations = buildObservations(scenario);
  const engine = buildSyntheticV4Evidence(
    normalizedIdentifier,
    {
      legalName: scenario.business.legalName,
      tradeName: scenario.business.tradeName,
      nameVariants: scenario.business.nameVariants,
    },
    scenario.publicRecords,
  );
  const rows = scenario.filings.map((filing) => ({
    period: filing.period,
    month: formatPeriod(filing.period),
    gstr1: sentenceForStatus(filing.gstr1),
    gstr3b: sentenceForStatus(filing.gstr3b),
    filedOn: formatDate(filing.filedOn),
    provenance: filing.source,
  }));

  return {
    reportId: buildReportId(normalizedIdentifier),
    generatedAt: formatDate('2026-08-29'),
    searchedIdentifier: normalizedIdentifier,
    syntheticDisclosure:
      'This hackathon demo uses synthetic data only. It does not access live government systems, private records, real GSTINs, PANs, Aadhaar numbers, OTPs, payments, or production Parakh data.',
    summary: summarizeScenario(
      scenario.id,
      observations.map((observation) => observation.label),
    ),
    business: {
      legalName: scenario.business.legalName,
      tradeName: scenario.business.tradeName,
      constitution: scenario.business.constitution,
      registrationState: scenario.business.registrationState,
      registrationStatus: scenario.business.registrationStatus,
      syntheticRegistrationDate: formatDate(scenario.business.syntheticRegistrationDate),
      syntheticBusinessActivity: scenario.business.syntheticBusinessActivity,
      syntheticAddress: scenario.business.syntheticAddress,
      normalizedNames: [
        scenario.business.legalName,
        ...scenario.business.nameVariants,
      ].map(normalizeName),
      provenance: scenario.business.source,
    },
    filingPattern: {
      rows,
      explanation:
        rows.length < 3
          ? 'Only a short synthetic filing window is available, so the report avoids a broad pattern claim.'
          : 'The v4-style flow normalizes periods and return markers before converting them into observations.',
      confidence: rows.length < 3 ? 'Low' : 'High',
    },
    publicRecords: scenario.publicRecords.map((record) => {
      const resolution = [
        ...engine.court.reportable,
        ...engine.court.rejected,
      ].find((item) => item.fixtureId === record.id);

      return {
        id: record.id,
        date: formatDate(record.date),
        signal: record.signal,
        summary: record.summary,
        parties: record.parties.map(normalizeName),
        confidence: record.confidence,
        provenance: record.source,
        caseReference: record.caseReference ?? record.id,
        courtName: record.courtName ?? 'Synthetic record source',
        filingYear: record.filingYear ?? new Date(record.date).getUTCFullYear().toString(),
        proceeding: record.proceeding ?? 'Synthetic record reference',
        matchBasis: record.matchBasis ?? 'synthetic party fields',
        recordStatus: record.recordStatus ?? 'Synthetic record included for context',
        partySide: resolution?.partySide ?? 'unknown',
        matchGrade: resolution?.matchGrade ?? 'WEAK',
        matchedParty: resolution?.matchedParty ?? 'No attributable synthetic party',
        resolutionReason:
          resolution?.reason ??
          'No synthetic identity resolution was available for this record.',
      };
    }),
    engine,
    observations,
    cannotFind: scenario.unavailable,
    generationSteps: [
      'Accept only an obvious synthetic identifier',
      'Load local synthetic profile, filing, and public-record fixtures',
      'Run fixture-only V4-style normalization and court-candidate resolution',
      'Create observations with FLAG, CLEAR, and NOTE labels only',
      'Attach confidence, attribution, provenance, limits, and synthetic disclosure',
    ],
  };
}
