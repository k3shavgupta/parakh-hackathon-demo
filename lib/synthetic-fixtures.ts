export type SyntheticLabel = 'FLAG' | 'CLEAR' | 'NOTE';

export type RawFiling = {
  period: string;
  gstr1: 'filed' | 'delayed' | 'missing' | 'not_available';
  gstr3b: 'filed' | 'delayed' | 'missing' | 'not_available';
  filedOn: string | null;
  source: string;
};

export type RawPublicRecord = {
  id: string;
  role: 'Petitioner' | 'Respondent' | 'Not applicable';
  proceedingType: string;
  matchedEntity: string;
  identityEvidence: string;
  category: 'civil' | 'tax' | 'supplier-dispute' | 'registry';
  caseReference: string;
  courtName: string;
  date: string;
  parties: string[];
  partySide: 'named-party' | 'alias-party' | 'not-applicable';
  matchBasis: string;
  signal: SyntheticLabel;
  summary: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
};

export type SyntheticScenario = {
  id: string;
  identifier: string;
  shortName: string;
  scenarioType: string;
  judgePrompt: string;
  business: {
    personName: string;
    registeredDate: string;
    context: string;
    legalName: string;
    tradeName: string;
    constitution: string;
    registrationState: string;
    registrationStatus: string;
    syntheticAddress: string;
    syntheticPanPattern: string;
    nameVariants: string[];
    source: string;
  };
  filings: RawFiling[];
  publicRecords: RawPublicRecord[];
  unavailable: string[];
};

const fixtureSource =
  'Local synthetic fixture, generated for Build What Moves India demo';

export const RAW_SYNTHETIC_SCENARIOS: SyntheticScenario[] = [
  {
    id: 'clear',
    identifier: 'SYN-GSTIN-CLEAR-001',
    shortName: 'Clean trading partner',
    scenarioType: 'Mostly clear business',
    judgePrompt:
      'A regular components distributor with consistent synthetic filing history.',
    business: {
      personName: 'Demo Aarav Cloudpetal',
      registeredDate: '2026-01-12',
      context:
        'This fictional private limited company is presented through its legal name and trade-name aliases. The named person is a demo contact, not verified ownership evidence.',
      legalName: 'Aarav Cloudpetal Demo Supplies Private Limited',
      tradeName: 'Aarav Cloudpetal Demo',
      constitution: 'Private Limited Company',
      registrationState: 'Uttar Pradesh',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress: 'Demo Plot ALPHA, Cloudpetal Lane, Fictional Township',
      syntheticPanPattern: 'SYNTHETIC-PAN-PATTERN-ALPHA',
      nameVariants: [
        'Aarav Cloudpetal Demo Supplies Pvt Ltd',
        'Aarav Cloudpetal Demo',
      ],
      source: fixtureSource,
    },
    filings: [
      {
        period: '2026-03',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-04-09',
        source: fixtureSource,
      },
      {
        period: '2026-04',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-05-10',
        source: fixtureSource,
      },
      {
        period: '2026-05',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-06-08',
        source: fixtureSource,
      },
      {
        period: '2026-06',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-07-10',
        source: fixtureSource,
      },
      {
        period: '2026-07',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-08-09',
        source: fixtureSource,
      },
    ],
    publicRecords: [
      {
        id: 'SYN-REG-CLEAR-011',
        role: 'Not applicable',
        proceedingType: 'Registry entry',
        matchedEntity: 'Aarav Cloudpetal Demo Supplies Private Limited',
        identityEvidence:
          'Exact legal name and declared alias in the fictional registry entry.',
        category: 'registry',
        caseReference: 'DEMO-RECORD-0011',
        courtName: 'Synthetic Registry Ledger — Example Only',
        date: '2026-08-10',
        parties: ['Aarav Cloudpetal Demo Supplies Private Limited'],
        partySide: 'named-party',
        matchBasis: 'Exact synthetic legal-name match',
        signal: 'CLEAR',
        summary:
          'Synthetic registry name and trade-name aliases align with the searched identifier.',
        source: fixtureSource,
        confidence: 'High',
      },
    ],
    unavailable: [
      'Live GST portal confirmation',
      'Authorized bank-account verification',
      'Human review of original public-record documents',
    ],
  },
  {
    id: 'delayed',
    identifier: 'SYN-GSTIN-DELAY-002',
    shortName: 'Delayed filings',
    scenarioType: 'Delayed filing pattern',
    judgePrompt:
      'A supplier with repeated delayed synthetic filings across recent periods.',
    business: {
      personName: 'Demo Nira Moonloom',
      registeredDate: '2026-01-12',
      context:
        'This fictional private limited company uses several spelling variants in its demo records. Return activity is shown separately from entity identity.',
      legalName: 'Navkaar Moonloom Demo Components Private Limited',
      tradeName: 'Navkaar Moonloom Demo',
      constitution: 'Private Limited Company',
      registrationState: 'Maharashtra',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress: 'Demo Unit BRAVO, Moonloom Arcade, Fictional Township',
      syntheticPanPattern: 'SYNTHETIC-PAN-PATTERN-BRAVO',
      nameVariants: [
        'Navkar Moonloom Demo Components Pvt Ltd',
        'Navkaar Moonloom Demo Components',
      ],
      source: fixtureSource,
    },
    filings: [
      {
        period: '2026-03',
        gstr1: 'delayed',
        gstr3b: 'filed',
        filedOn: '2026-04-25',
        source: fixtureSource,
      },
      {
        period: '2026-04',
        gstr1: 'delayed',
        gstr3b: 'delayed',
        filedOn: '2026-05-29',
        source: fixtureSource,
      },
      {
        period: '2026-05',
        gstr1: 'filed',
        gstr3b: 'delayed',
        filedOn: '2026-06-27',
        source: fixtureSource,
      },
      {
        period: '2026-06',
        gstr1: 'delayed',
        gstr3b: 'missing',
        filedOn: null,
        source: fixtureSource,
      },
      {
        period: '2026-07',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-08-11',
        source: fixtureSource,
      },
    ],
    publicRecords: [],
    unavailable: [
      'Live GST portal confirmation',
      'Whether delays were cured after the synthetic data snapshot',
      'Underlying tax-office notices, if any',
    ],
  },
  {
    id: 'mismatch',
    identifier: 'SYN-GSTIN-MISMATCH-003',
    shortName: 'Name mismatch',
    scenarioType: 'Identity/name mismatch',
    judgePrompt:
      'A buyer sees similar but non-identical names across invoices and fixture records.',
    business: {
      personName: 'Demo Tara Papercloud',
      registeredDate: '2026-01-12',
      context:
        'This fictional public limited company has similar-name candidates. A shared word or alias alone does not establish that a record belongs to this entity.',
      legalName: 'Dakshin Papercloud Demo Works Limited',
      tradeName: 'Dakshin Papercloud Demo',
      constitution: 'Public Limited Company',
      registrationState: 'Tamil Nadu',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress:
        'Demo Works CHARLIE, Papercloud Avenue, Fictional Township',
      syntheticPanPattern: 'SYNTHETIC-PAN-PATTERN-CHARLIE',
      nameVariants: [
        'Dakshin Papercloud Demos Works Ltd',
        'Dakshin Papercloud Demo Traders',
        'Dakshin Papercloud Demo',
      ],
      source: fixtureSource,
    },
    filings: [
      {
        period: '2026-03',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-04-10',
        source: fixtureSource,
      },
      {
        period: '2026-04',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-05-09',
        source: fixtureSource,
      },
      {
        period: '2026-05',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-06-10',
        source: fixtureSource,
      },
      {
        period: '2026-06',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-07-11',
        source: fixtureSource,
      },
    ],
    publicRecords: [
      {
        id: 'SYN-REG-MISMATCH-027',
        role: 'Not applicable',
        proceedingType: 'Registry alias entry',
        matchedEntity: 'Dakshin Papercloud Demo Traders',
        identityEvidence:
          'Alias resembles the searched entity; independent identity evidence is absent.',
        category: 'registry',
        caseReference: 'DEMO-RECORD-0027',
        courtName: 'Synthetic Registry Ledger — Example Only',
        date: '2026-07-20',
        parties: [
          'Dakshin Papercloud Demo Works Limited',
          'Dakshin Papercloud Demo Traders',
        ],
        partySide: 'alias-party',
        matchBasis: 'Similar synthetic alias; legal name is not exact',
        signal: 'FLAG',
        summary:
          'Synthetic invoice alias resembles, but does not exactly match, the registry legal name.',
        source: fixtureSource,
        confidence: 'Medium',
      },
      {
        id: 'SYN-REG-MISMATCH-028',
        role: 'Not applicable',
        proceedingType: 'Registry entry',
        matchedEntity: 'Dakshin Papercloud Demo Traders Private Limited',
        identityEvidence:
          'This is a separately named fictional entity; shared words do not connect it.',
        category: 'registry',
        caseReference: 'DEMO-RECORD-0028',
        courtName: 'Synthetic Registry Ledger — Example Only',
        date: '2026-07-22',
        parties: ['Dakshin Papercloud Demo Traders Private Limited'],
        partySide: 'not-applicable',
        matchBasis: 'Similar words only; different synthetic legal entity',
        signal: 'NOTE',
        summary:
          'A separate fictional legal entity shares the words Dakshin Papercloud Demo, but the searched synthetic entity is not named in this record.',
        source: fixtureSource,
        confidence: 'High',
      },
    ],
    unavailable: [
      'Beneficial ownership confirmation',
      'Live registry certificate',
      'Consent-backed document upload from the counterparty',
    ],
  },
  {
    id: 'court',
    identifier: 'SYN-GSTIN-COURT-004',
    shortName: 'Public-record signal',
    scenarioType: 'Public-record/court-signal example',
    judgePrompt:
      'A logistics vendor with a fictional supplier-dispute signal for review.',
    business: {
      personName: 'Demo Ishan Starling',
      registeredDate: '2026-01-12',
      context:
        'This fictional private limited company has court candidates under its legal and trade names. Company identity and each record attribution need separate review.',
      legalName: 'Setu Starling Demo Corridors Private Limited',
      tradeName: 'Setu Starling Demo',
      constitution: 'Private Limited Company',
      registrationState: 'Gujarat',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress:
        'Demo Warehouse DELTA, Starling Yard, Fictional Township',
      syntheticPanPattern: 'SYNTHETIC-PAN-PATTERN-DELTA',
      nameVariants: [
        'Setu Starling Demo Corridors Pvt Ltd',
        'Setu Starling Demo',
      ],
      source: fixtureSource,
    },
    filings: [
      {
        period: '2026-03',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-04-08',
        source: fixtureSource,
      },
      {
        period: '2026-04',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-05-09',
        source: fixtureSource,
      },
      {
        period: '2026-05',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-06-10',
        source: fixtureSource,
      },
      {
        period: '2026-06',
        gstr1: 'delayed',
        gstr3b: 'filed',
        filedOn: '2026-07-18',
        source: fixtureSource,
      },
    ],
    publicRecords: [
      {
        id: 'SYN-CIV-2026-014',
        role: 'Respondent',
        proceedingType: 'Fictional supplier claim',
        matchedEntity: 'Setu Starling Demo Corridors Private Limited',
        identityEvidence:
          'The candidate names the exact fictional legal entity; no outcome is supplied.',
        category: 'supplier-dispute',
        caseReference: 'DEMO-CASE-0014',
        courtName: 'Synthetic Civil Court, Demo Division',
        date: '2026-06-18',
        parties: [
          'Setu Starling Demo Corridors Private Limited',
          'Demo Moonkite Packaging',
        ],
        partySide: 'named-party',
        matchBasis: 'Exact synthetic legal-name match',
        signal: 'FLAG',
        summary:
          'Fictional supplier-dispute record appears to involve the same synthetic legal name.',
        source: fixtureSource,
        confidence: 'Medium',
      },
      {
        id: 'SYN-CIV-2025-032',
        role: 'Petitioner',
        proceedingType: 'Fictional civil application',
        matchedEntity: 'Setu Starling Demo',
        identityEvidence:
          'Only a trade-name alias is supplied; legal identity remains unresolved.',
        category: 'civil',
        caseReference: 'DEMO-CASE-0032',
        courtName: 'Synthetic Civil Court, Demo Division',
        date: '2025-11-04',
        parties: ['Setu Starling Demo', 'Demo Lanternbird Warehousing'],
        partySide: 'alias-party',
        matchBasis: 'Synthetic trade-name alias; human review required',
        signal: 'NOTE',
        summary:
          'Older synthetic record uses a trade-name alias. It may be relevant but would need human review.',
        source: fixtureSource,
        confidence: 'Low',
      },
    ],
    unavailable: [
      'Certified copies of any case record',
      'Live court-status updates',
      'Whether parties reached settlement outside this synthetic snapshot',
    ],
  },
  {
    id: 'partial',
    identifier: 'SYN-GSTIN-PARTIAL-005',
    shortName: 'Partial data',
    scenarioType: 'Partial or insufficient data',
    judgePrompt:
      'A new or thin-file business where Parakh should avoid overclaiming.',
    business: {
      personName: 'Demo Mira Meadowglass',
      registeredDate: '2026-06-01',
      context:
        'This fictional one person company has a short filing window. The demo contact and registration marker do not establish a longer operating history.',
      legalName: 'Prism Meadowglass Demo Tools OPC Private Limited',
      tradeName: 'Prism Meadowglass Demo Tools',
      constitution: 'One Person Company',
      registrationState: 'Karnataka',
      registrationStatus: 'Recently active in synthetic registry',
      syntheticAddress:
        'Demo Studio ECHO, Meadowglass Lane, Fictional Township',
      syntheticPanPattern: 'SYNTHETIC-PAN-PATTERN-ECHO',
      nameVariants: ['Prism Meadowglass Demo Tools OPC', 'Prism Demo Tools'],
      source: fixtureSource,
    },
    filings: [
      {
        period: '2026-06',
        gstr1: 'not_available',
        gstr3b: 'not_available',
        filedOn: null,
        source: fixtureSource,
      },
      {
        period: '2026-07',
        gstr1: 'filed',
        gstr3b: 'not_available',
        filedOn: '2026-08-12',
        source: fixtureSource,
      },
    ],
    publicRecords: [],
    unavailable: [
      'Long-term filing pattern',
      'Court-signal history before the synthetic snapshot',
      'Independent address verification',
      'Consent-backed uploaded documents',
    ],
  },
];
