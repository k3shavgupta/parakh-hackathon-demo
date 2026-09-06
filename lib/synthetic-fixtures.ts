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
      'A compliant industrial distributor with regular, on-time GST filings and zero adverse court signals.',
    business: {
      personName: 'Aarav Singhania (Demo Director)',
      registeredDate: '2026-01-12',
      context:
        'Established wholesale supplier of electrical hardware and industrial consumables. Demonstrates complete regulatory compliance across all monitored quarters with on-time GSTR-1 and GSTR-3B submissions. No adverse litigation, winding-up petitions, or statutory defaults are detected in public databases.',
      legalName: 'Aarav Cloudpetal Demo Supplies Private Limited',
      tradeName: 'Aarav Cloudpetal Demo Supplies',
      constitution: 'Private Limited Company',
      registrationState: 'Uttar Pradesh',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress:
        'Plot No. 48/B, Phase 1, Industrial Area Site 4, Sahibabad, Ghaziabad, Uttar Pradesh 201010 (Fictional commercial address)',
      syntheticPanPattern: 'AAACA4912M (Synthetic PAN)',
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
        proceedingType: 'Corporate Registry Verification',
        matchedEntity: 'Aarav Cloudpetal Demo Supplies Private Limited',
        identityEvidence:
          'Exact legal entity name, statutory charter documents, and active GSTIN linkage confirm verified business standing without discrepancies.',
        category: 'registry',
        caseReference: 'DEMO-RECORD-0011',
        courtName: 'Ministry of Corporate Affairs / Registry Ledger (Demo)',
        date: '2026-08-10',
        parties: ['Aarav Cloudpetal Demo Supplies Private Limited'],
        partySide: 'named-party',
        matchBasis: 'Exact synthetic legal-name match',
        signal: 'CLEAR',
        summary:
          'Statutory corporate registry records confirm active operational status, matching registered office, and clean director disclosures with zero adverse litigation filings.',
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
      'An automotive precision components vendor showing recurring return delays across recent quarters.',
    business: {
      personName: 'Nira Deshmukh (Demo Director)',
      registeredDate: '2026-01-12',
      context:
        'Tier-2 automotive precision components manufacturer. Active operational status with documented delays in statutory tax submissions (delayed GSTR-1 filings and pending GSTR-3B return for June 2026). Indicates potential short-term working capital strain. No public court proceedings or litigation signals are recorded.',
      legalName: 'Navkaar Moonloom Demo Components Private Limited',
      tradeName: 'Navkaar Moonloom Demo Components',
      constitution: 'Private Limited Company',
      registrationState: 'Maharashtra',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress:
        'Unit 302, Trade Link Corporate Hub, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013 (Fictional commercial address)',
      syntheticPanPattern: 'AABCN7814K (Synthetic PAN)',
      nameVariants: [
        'Navkar Moonloom Demo Components Pvt Ltd',
        'Navkaar Moonloom Demo Components',
        'Navkar Moonloom Demo',
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
      'A packaging manufacturer whose invoices display trade names that diverge from statutory corporate records.',
    business: {
      personName: 'Tara Natarajan (Demo Managing Director)',
      registeredDate: '2026-01-12',
      context:
        'Large-scale paper and corrugated board manufacturer. While tax return filings are consistently on time, billing records and commercial contracts frequently cite regional aliases like "Dakshin Papercloud Demo Traders". Counterparties must establish entity continuity and verify the PAN before issuing payments.',
      legalName: 'Dakshin Papercloud Demo Works Limited',
      tradeName: 'Dakshin Papercloud Demo Works',
      constitution: 'Public Limited Company',
      registrationState: 'Tamil Nadu',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress:
        'Works No. 54, SIDCO Industrial Complex, Ambattur, Chennai, Tamil Nadu 600058 (Fictional commercial address)',
      syntheticPanPattern: 'AAACD3819P (Synthetic PAN)',
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
        proceedingType: 'Trade Registry Alias Review',
        matchedEntity: 'Dakshin Papercloud Demo Traders',
        identityEvidence:
          'Commercial invoices cite "Dakshin Papercloud Demo Traders"; entity lacks independent corporate registration and operates as a trade alias.',
        category: 'registry',
        caseReference: 'DEMO-RECORD-0027',
        courtName: 'Registrar of Companies / Trade Registry (Demo Ledger)',
        date: '2026-07-20',
        parties: [
          'Dakshin Papercloud Demo Works Limited',
          'Dakshin Papercloud Demo Traders',
        ],
        partySide: 'alias-party',
        matchBasis: 'Similar synthetic alias; legal name is not exact',
        signal: 'FLAG',
        summary:
          'Commercial invoice alias "Dakshin Papercloud Demo Traders" closely resembles the registered legal name, but lacks formal corporate entity documentation.',
        source: fixtureSource,
        confidence: 'Medium',
      },
      {
        id: 'SYN-REG-MISMATCH-028',
        role: 'Not applicable',
        proceedingType: 'Independent Corporate Registration Review',
        matchedEntity: 'Dakshin Papercloud Demo Traders Private Limited',
        identityEvidence:
          'Distinct statutory registration and separate registered address confirm entity continuity belongs to an unrelated third party.',
        category: 'registry',
        caseReference: 'DEMO-RECORD-0028',
        courtName: 'Registrar of Companies / Trade Registry (Demo Ledger)',
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
      'An interstate logistics operator with active vendor claims and court records on public record.',
    business: {
      personName: 'Ishan Patel (Demo Director)',
      registeredDate: '2026-01-12',
      context:
        'Interstate fleet and multimodal logistics corridor operator. Counterparty intelligence surfaces two candidate court proceedings in public civil court records: an active commercial summary suit for vendor recovery (exact legal name match) and an older arbitration application citing a trade alias.',
      legalName: 'Setu Starling Demo Corridors Private Limited',
      tradeName: 'Setu Starling Demo Logistics',
      constitution: 'Private Limited Company',
      registrationState: 'Gujarat',
      registrationStatus: 'Active in synthetic registry',
      syntheticAddress:
        'Shed No. B-7, Transport Nagar Logistics Corridor, Narol Circle, Ahmedabad, Gujarat 382405 (Fictional commercial address)',
      syntheticPanPattern: 'AAGCS9124L (Synthetic PAN)',
      nameVariants: [
        'Setu Starling Demo Corridors Pvt Ltd',
        'Setu Starling Demo',
        'Setu Starling Logistics',
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
        proceedingType: 'Commercial Summary Suit (Recovery of Dues)',
        matchedEntity: 'Setu Starling Demo Corridors Private Limited',
        identityEvidence:
          'The candidate names the exact registered legal entity as primary respondent; commercial dispute arises from unpaid logistics subcontracts.',
        category: 'supplier-dispute',
        caseReference: 'DEMO-CASE-0014',
        courtName: 'Synthetic Civil Court, Demo Division',
        date: '2026-06-18',
        parties: [
          'Setu Starling Demo Corridors Private Limited',
          'Moonkite Industrial Packaging Private Limited',
        ],
        partySide: 'named-party',
        matchBasis: 'Exact synthetic legal-name match',
        signal: 'FLAG',
        summary:
          'Commercial recovery claim filed by vendor alleging unpaid freight dues. The exact synthetic legal name matches the respondent.',
        source: fixtureSource,
        confidence: 'High',
      },
      {
        id: 'SYN-CIV-2025-032',
        role: 'Petitioner',
        proceedingType: 'Commercial Arbitration Application (Section 9)',
        matchedEntity: 'Setu Starling Demo',
        identityEvidence:
          'Only a trade-name alias is supplied; legal identity remains unresolved.',
        category: 'civil',
        caseReference: 'DEMO-CASE-0032',
        courtName: 'Synthetic Civil Court, Demo Division',
        date: '2025-11-04',
        parties: ['Setu Starling Demo', 'Lanternbird Warehousing & Storage LLP'],
        partySide: 'alias-party',
        matchBasis: 'Synthetic trade-name alias; human review required',
        signal: 'NOTE',
        summary:
          'Interim relief application in warehouse lease dispute citing trade-name alias. Requires documentary review to confirm corporate attribution.',
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
      'A newly incorporated startup with limited filing history, requiring cautious non-evaluative reporting.',
    business: {
      personName: 'Mira Hegde (Demo Proprietor & Director)',
      registeredDate: '2026-06-01',
      context:
        'Specialized tooling design firm incorporated under One Person Company structure. Recently registered with a short two-month filing window. The report intentionally refrains from broad credit scoring or rating claims due to insufficient historical evidence.',
      legalName: 'Prism Meadowglass Demo Tools OPC Private Limited',
      tradeName: 'Prism Meadowglass Demo Tools',
      constitution: 'One Person Company',
      registrationState: 'Karnataka',
      registrationStatus: 'Recently active in synthetic registry',
      syntheticAddress:
        'Studio 104, Brigade Software Arcade, Banashankari 2nd Stage, Bengaluru, Karnataka 560070 (Fictional commercial address)',
      syntheticPanPattern: 'AAQPM6201R (Synthetic PAN)',
      nameVariants: [
        'Prism Meadowglass Demo Tools OPC',
        'Prism Demo Tools',
        'Prism Meadowglas Demo Tools',
      ],
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
