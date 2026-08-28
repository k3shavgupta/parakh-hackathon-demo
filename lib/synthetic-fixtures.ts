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
};

export type SyntheticScenario = {
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
    id: 'clear',
    identifier: 'SYN-GSTIN-CLEAR-001',
    shortName: 'Clean trading partner',
    scenarioType: 'Mostly clear business',
    judgePrompt:
      'A regular components distributor with consistent synthetic filing history.',
    business: {
      legalName: 'Aarav Precision Supplies Private Limited',
      tradeName: 'Aarav Precision',
      constitution: 'Private Limited Company',
      registrationState: 'Uttar Pradesh',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress: 'Plot SYN-14, Cooperative Industrial Area, Kanpur',
      nameVariants: ['Aarav Precision Supplies Pvt Ltd', 'Aarav Precision'],
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
        category: 'registry',
        date: '2026-08-10',
        parties: ['Aarav Precision Supplies Private Limited'],
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
      legalName: 'Navkaar Metro Components Private Limited',
      tradeName: 'Navkaar Metro',
      constitution: 'Private Limited Company',
      registrationState: 'Maharashtra',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress: 'Unit SYN-8, Western Supply Cluster, Pune',
      nameVariants: [
        'Navkar Metro Components Pvt Ltd',
        'Navkaar Metro Components',
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
      legalName: 'Dakshin Alloy Works Limited',
      tradeName: 'Dakshin Alloy',
      constitution: 'Public Limited Company',
      registrationState: 'Tamil Nadu',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress: 'SYN Works Road, Foundry Extension, Coimbatore',
      nameVariants: [
        'Dakshin Alloys Works Ltd',
        'Dakshin Alloy Traders',
        'Dakshin Alloy',
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
        category: 'registry',
        date: '2026-07-20',
        parties: ['Dakshin Alloy Works Limited', 'Dakshin Alloy Traders'],
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
    id: 'court',
    identifier: 'SYN-GSTIN-COURT-004',
    shortName: 'Public-record signal',
    scenarioType: 'Public-record/court-signal example',
    judgePrompt:
      'A logistics vendor with a fictional supplier-dispute signal for review.',
    business: {
      legalName: 'Setu Freight Corridors Private Limited',
      tradeName: 'Setu Freight',
      constitution: 'Private Limited Company',
      registrationState: 'Gujarat',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress: 'Warehouse SYN-22, Inland Movement Park, Ahmedabad',
      nameVariants: ['Setu Freight Corridors Pvt Ltd', 'Setu Freight'],
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
        category: 'supplier-dispute',
        date: '2026-06-18',
        parties: [
          'Setu Freight Corridors Private Limited',
          'Rudra Packaging Works',
        ],
        signal: 'FLAG',
        summary:
          'Fictional supplier-dispute record appears to involve the same synthetic legal name.',
        source: fixtureSource,
        confidence: 'Medium',
      },
      {
        id: 'SYN-CIV-2025-032',
        category: 'civil',
        date: '2025-11-04',
        parties: ['Setu Freight', 'Harbor Link Warehousing'],
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
      legalName: 'Prism Rural Tools OPC Private Limited',
      tradeName: 'Prism Rural Tools',
      constitution: 'One Person Company',
      registrationState: 'Karnataka',
      registrationStatus: 'Recently active in synthetic registry',
      syntheticAddress: 'SYN Innovation Yard, Mysuru',
      nameVariants: ['Prism Rural Tools OPC', 'Prism Tools'],
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
