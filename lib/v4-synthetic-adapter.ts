import type { RawPublicRecord, SyntheticLabel } from './synthetic-fixtures';

/**
 * Fixture-only adaptation of V4's deterministic identity and court-evidence
 * helpers. There are intentionally no provider clients or network calls here.
 */
export type SyntheticCourtClass =
  | 'civil_commercial'
  | 'tax'
  | 'registry'
  | 'unknown';

export type SyntheticMatchGrade = 'STRONG' | 'POSSIBLE' | 'WEAK';

export type SyntheticCourtResolution = {
  fixtureId: string;
  label: SyntheticLabel;
  matchGrade: SyntheticMatchGrade;
  courtClass: SyntheticCourtClass;
  matchedParty?: string;
  partySide: 'petitioner' | 'respondent' | 'unknown';
  reason: string;
  provenance: string;
};

export type SyntheticV4Evidence = {
  source: 'local-synthetic-fixtures';
  identity: {
    demoReference: string;
    legalName: string;
    normalizedLegalName: string;
    coreName: string;
    aliases: string[];
  };
  court: {
    reportable: SyntheticCourtResolution[];
    rejected: SyntheticCourtResolution[];
  };
};

function cleanDisplayValue(value: string | null | undefined): string {
  return String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

/** Adapted from production V4 business-identity.ts; deterministic and local. */
export function normalizeBusinessName(value: string | null | undefined): string {
  let normalized = cleanDisplayValue(value).toUpperCase();
  if (!normalized) return '';

  normalized = normalized
    .replace(/^\s*(?:M\s*\/\s*S|MESSRS?|MESSERS)\.?\s+/i, '')
    .replace(/&/g, ' AND ')
    .replace(/[\u2010-\u2015.,'’"()[\]{}:;\\/]+/g, ' ')
    .replace(/\bP\s*LTD\b/g, 'PRIVATE LIMITED')
    .replace(/\bPVT\s*LTD\b/g, 'PRIVATE LIMITED')
    .replace(/\bPVT\b/g, 'PRIVATE')
    .replace(/\bLTD\b/g, 'LIMITED')
    .replace(/\bL\s*L\s*P\b/g, 'LLP')
    .replace(/\s+/g, ' ')
    .trim();

  return normalized;
}

/** Adapted from production V4 business-identity.ts; no spelling is invented. */
export function businessCoreName(value: string | null | undefined): string {
  const normalized = normalizeBusinessName(value);
  if (!normalized) return '';

  return normalized
    .replace(/\s+(?:PRIVATE LIMITED|LIMITED|LLP|INCORPORATED|CORPORATION)$/u, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function meaningfulTokens(value: string): string[] {
  const ignored = new Set([
    'AND',
    'COMPANY',
    'LIMITED',
    'LLP',
    'PRIVATE',
    'PVT',
    'THE',
  ]);
  return normalizeBusinessName(value)
    .split(' ')
    .filter((token) => token.length > 1 && !ignored.has(token));
}

function bestPartyMatch(
  identity: SyntheticV4Evidence['identity'],
  parties: string[],
): { grade: SyntheticMatchGrade; party?: string } {
  const aliases = [identity.legalName, ...identity.aliases].map(
    normalizeBusinessName,
  );
  const queryTokens = meaningfulTokens(identity.coreName);
  let best: { grade: SyntheticMatchGrade; party?: string; score: number } = {
    grade: 'WEAK',
    score: 0,
  };

  for (const party of parties) {
    const normalizedParty = normalizeBusinessName(party);
    if (aliases.some((alias) => alias && normalizedParty.includes(alias))) {
      return { grade: 'STRONG', party };
    }

    const partyTokens = new Set(meaningfulTokens(party));
    const score = queryTokens.filter((token) => partyTokens.has(token)).length;
    if (score > best.score) {
      best = {
        grade: score >= 2 ? 'POSSIBLE' : 'WEAK',
        party,
        score,
      };
    }
  }

  return { grade: best.grade, party: best.party };
}

function classify(record: RawPublicRecord): SyntheticCourtClass {
  if (record.category === 'supplier-dispute' || record.category === 'civil') {
    return 'civil_commercial';
  }
  if (record.category === 'tax') return 'tax';
  if (record.category === 'registry') return 'registry';
  return 'unknown';
}

function resolveRecord(
  record: RawPublicRecord,
  identity: SyntheticV4Evidence['identity'],
): SyntheticCourtResolution {
  const party = bestPartyMatch(identity, record.parties);
  const isReportable = party.grade !== 'WEAK';
  const partySide =
    record.parties[1] === party.party
      ? 'respondent'
      : record.parties[0] === party.party
        ? 'petitioner'
        : 'unknown';

  return {
    fixtureId: record.id,
    label: record.signal,
    matchGrade: party.grade,
    courtClass: classify(record),
    matchedParty: party.party,
    partySide,
    reason: isReportable
      ? `${party.grade.toLowerCase()} identity evidence from local synthetic party fields.`
      : 'weak identity evidence: the local synthetic party fields do not support attribution.',
    provenance: record.source,
  };
}

export function buildSyntheticV4Evidence(
  demoReference: string,
  business: {
    legalName: string;
    tradeName: string;
    nameVariants: string[];
  },
  publicRecords: RawPublicRecord[],
): SyntheticV4Evidence {
  const identity = {
    demoReference,
    legalName: cleanDisplayValue(business.legalName),
    normalizedLegalName: normalizeBusinessName(business.legalName),
    coreName: businessCoreName(business.legalName),
    aliases: [business.tradeName, ...business.nameVariants]
      .map(cleanDisplayValue)
      .filter(Boolean),
  };
  const resolved = publicRecords.map((record) => resolveRecord(record, identity));

  return {
    source: 'local-synthetic-fixtures',
    identity,
    court: {
      reportable: resolved.filter((record) => record.matchGrade !== 'WEAK'),
      rejected: resolved.filter((record) => record.matchGrade === 'WEAK'),
    },
  };
}
