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
  category: 'civil' | 'tax' | 'supplier-dispute' | 'registry';
  date: string;
  parties: string[];
  signal: SyntheticLabel;
  summary: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  caseReference?: string;
  courtName?: string;
  filingYear?: string;
  proceeding?: string;
  matchBasis?: string;
  recordStatus?: string;
};

export type SyntheticScenario = {
  synthetic: true;
  id: string;
  identifier: string;
  shortName: string;
  scenarioType: string;
  judgePrompt: string;
  business: {
    legalName: string;
    tradeName: string;
    constitution: string;
    registrationState: string;
    registrationStatus: string;
    syntheticRegistrationDate: string;
    syntheticBusinessActivity: string;
    syntheticAddress: string;
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
    synthetic: true,
    id: 'clear',
    identifier: 'DEMO-2026-0001',
    shortName: 'Clean trading partner',
    scenarioType: 'Mostly clear business',
    judgePrompt:
      'A regular components distributor with consistent synthetic filing history.',
    business: {
      legalName: 'Parakh Demo Entity Udaan Components LLP',
      tradeName: 'Udaan Components Demo',
      constitution: 'Private Limited Company',
      registrationState: 'Uttar Pradesh',
      registrationStatus: 'Active in synthetic registry',
      syntheticRegistrationDate: '2022-04-18',
      syntheticBusinessActivity: 'Distribution of industrial electrical components (synthetic)',
      syntheticAddress: 'Demo Plot 14, Cooperative Industrial Area, Kanpur',
      nameVariants: ['Udaan Components LLP', 'Udaan Components Demo'],
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
        id: 'DEMO-REG-0001-A',
        category: 'registry',
        date: '2026-08-10',
        parties: ['Parakh Demo Entity Udaan Components LLP'],
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
    synthetic: true,
    id: 'delayed',
    identifier: 'DEMO-2026-0002',
    shortName: 'Delayed filings',
    scenarioType: 'Delayed filing pattern',
    judgePrompt:
      'A supplier with repeated delayed synthetic filings across recent periods.',
    business: {
      legalName: 'Parakh Demo Entity Navkaar Metro Components Private Limited',
      tradeName: 'Navkaar Metro Demo',
      constitution: 'Private Limited Company',
      registrationState: 'Maharashtra',
      registrationStatus: 'Active in synthetic registry',
      syntheticRegistrationDate: '2021-07-15',
      syntheticBusinessActivity: 'Wholesale distribution of industrial components (synthetic)',
      syntheticAddress: 'Demo Unit 8, Western Supply Cluster, Pune',
      nameVariants: [
        'Navkaar Metro Components Pvt Ltd',
        'Navkaar Metro Demo',
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
    synthetic: true,
    id: 'mismatch',
    identifier: 'DEMO-2026-0003',
    shortName: 'Name mismatch',
    scenarioType: 'Identity/name mismatch',
    judgePrompt:
      'A buyer sees similar but non-identical names across invoices and fixture records.',
    business: {
      legalName: 'Parakh Demo Entity Dakshin Alloy Works Limited',
      tradeName: 'Dakshin Alloy Demo',
      constitution: 'Public Limited Company',
      registrationState: 'Tamil Nadu',
      registrationStatus: 'Active in synthetic registry',
      syntheticRegistrationDate: '2018-11-02',
      syntheticBusinessActivity: 'Alloy casting and fabricated metal goods (synthetic)',
      syntheticAddress: 'Demo Works Road, Foundry Extension, Coimbatore',
      nameVariants: [
        'Dakshin Alloy Works Ltd',
        'Dakshin Alloy Traders Demo',
        'Dakshin Alloy Demo',
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
      {
        period: '2026-07',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-08-11',
        source: fixtureSource,
      },
    ],
    publicRecords: [
      {
        id: 'DEMO-REG-0003-A',
        category: 'registry',
        date: '2026-07-20',
        parties: ['Dakshin Alloy Works Demo Limited', 'Dakshin Alloy Traders Demo'],
        signal: 'FLAG',
        summary:
          'Synthetic invoice alias resembles, but does not exactly match, the registry legal name.',
        source: fixtureSource,
        confidence: 'Medium',
      },
    ],
    unavailable: [
      'Beneficial ownership confirmation',
      'Live registry certificate',
      'Consent-backed document upload from the counterparty',
    ],
  },
  {
    synthetic: true,
    id: 'court',
    identifier: 'DEMO-2026-0004',
    shortName: 'Public-record signal',
    scenarioType: 'Public-record/court-signal example',
    judgePrompt:
      'A logistics vendor with a fictional supplier-dispute signal for review.',
    business: {
      legalName: 'Parakh Demo Entity Setu Freight Corridors Private Limited',
      tradeName: 'Setu Freight Demo',
      constitution: 'Private Limited Company',
      registrationState: 'Gujarat',
      registrationStatus: 'Active in synthetic registry',
      syntheticRegistrationDate: '2020-02-28',
      syntheticBusinessActivity: 'Road freight and warehousing coordination (synthetic)',
      syntheticAddress: 'Demo Warehouse 22, Inland Movement Park, Ahmedabad',
      nameVariants: ['Setu Freight Corridors Pvt Ltd', 'Setu Freight Demo'],
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
      {
        period: '2026-07',
        gstr1: 'filed',
        gstr3b: 'filed',
        filedOn: '2026-08-10',
        source: fixtureSource,
      },
    ],
    publicRecords: [
      {
        id: 'DEMO-CIV-0004-A',
        category: 'supplier-dispute',
        date: '2026-06-18',
        parties: [
          'Rudra Packaging Demo Works',
          'Parakh Demo Entity Setu Freight Corridors Private Limited',
        ],
        signal: 'FLAG',
        summary:
          'Synthetic supplier-dispute record carries the exact synthetic legal name and is shown for careful follow-up, not as an identity confirmation.',
        source: fixtureSource,
        confidence: 'Medium',
        caseReference: 'SYN-COMM-AHD-2026-041',
        courtName: 'Synthetic Commercial Court, Ahmedabad',
        filingYear: '2026',
        proceeding: 'Commercial supplier dispute',
        matchBasis: 'business legal name',
        recordStatus: 'Synthetic record returned for review',
      },
      {
        id: 'DEMO-CIV-0004-B',
        category: 'civil',
        date: '2025-11-04',
        parties: ['Setu Freight Demo', 'Harbor Link Demo Warehousing'],
        signal: 'NOTE',
        summary:
          'Older synthetic civil record uses the exact synthetic trade name. It may be relevant but would need human review before any conclusion.',
        source: fixtureSource,
        confidence: 'Low',
        caseReference: 'SYN-CIV-SRT-2025-118',
        courtName: 'Synthetic Civil Court, Surat',
        filingYear: '2025',
        proceeding: 'Civil contract proceeding',
        matchBasis: 'business trade name',
        recordStatus: 'Synthetic record returned for review',
      },
      {
        id: 'DEMO-CIV-0004-C',
        category: 'supplier-dispute',
        date: '2024-09-22',
        parties: [
          'Narmada Depot Demo LLP',
          'Setu Freight Corridors Pvt Ltd',
        ],
        signal: 'NOTE',
        summary:
          'An earlier synthetic commercial record uses a legal-form variant of the business name and is included with its source limits.',
        source: fixtureSource,
        confidence: 'Medium',
        caseReference: 'SYN-COMM-VAD-2024-066',
        courtName: 'Synthetic Commercial Court, Vadodara',
        filingYear: '2024',
        proceeding: 'Commercial recovery proceeding',
        matchBasis: 'business legal-form variant',
        recordStatus: 'Synthetic record returned for review',
      },
      {
        id: 'DEMO-CIV-0004-D',
        category: 'civil',
        date: '2023-03-11',
        parties: ['Setu Freight Route Demo', 'Coastal Yard Demo Services'],
        signal: 'NOTE',
        summary:
          'A historical synthetic result shares only part of the core name. It is retained as a possible alias, with intentionally restrained attribution.',
        source: fixtureSource,
        confidence: 'Low',
        caseReference: 'SYN-CIV-RJK-2023-207',
        courtName: 'Synthetic Civil Court, Rajkot',
        filingYear: '2023',
        proceeding: 'Civil freight-services proceeding',
        matchBasis: 'partial business-name token overlap',
        recordStatus: 'Synthetic possible-alias result',
      },
    ],
    unavailable: [
      'Certified copies of any case record',
      'Live court-status updates',
      'Whether parties reached settlement outside this synthetic snapshot',
    ],
  },
  {
    synthetic: true,
    id: 'partial',
    identifier: 'DEMO-2026-0005',
    shortName: 'Partial data',
    scenarioType: 'Partial or insufficient data',
    judgePrompt:
      'A new or thin-file business where Parakh should avoid overclaiming.',
    business: {
      legalName: 'Parakh Demo Entity Prism Rural Tools OPC Private Limited',
      tradeName: 'Prism Rural Tools Demo',
      constitution: 'One Person Company',
      registrationState: 'Karnataka',
      registrationStatus: 'Recently active in synthetic registry',
      syntheticRegistrationDate: '2025-12-03',
      syntheticBusinessActivity: 'Rural hand tools and equipment assembly (synthetic)',
      syntheticAddress: 'Demo Innovation Yard, Mysuru',
      nameVariants: ['Prism Rural Tools OPC', 'Prism Tools Demo'],
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
