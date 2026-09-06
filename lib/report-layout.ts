import type { SyntheticReport } from './synthetic-engine';
import type { SyntheticLabel } from './synthetic-fixtures';

export const REPORT_DISCLAIMER =
  'Not a credit report, not legal advice, not a rating or score.';
export const LABEL_GUIDE =
  'FLAG: a specific finding needs review. CLEAR: no discrepancy in the evidence shown. NOTE: context or limited evidence; further checks may be needed.';
export const FICTION_NOTICE =
  'Every person, business, address and record is fictional. Synthetic demo only.';
export const EVIDENCE_SOURCE = 'Synthetic Evidence Index';
export type FilingStatus = 'onTime' | 'late' | 'missing' | 'unavailable';
export const FILING_LABELS: Record<FilingStatus, string> = {
  onTime: 'On time',
  late: 'Late',
  missing: 'Not filed',
  unavailable: 'Unavailable',
};
export function filingStatus(value: string): FilingStatus {
  if (value === 'filed') return 'onTime';
  if (value === 'delayed') return 'late';
  if (value === 'missing') return 'missing';
  return 'unavailable';
}
export function filingCounts(report: SyntheticReport) {
  const count = (key: 'gstr1' | 'gstr3b') => {
    const result = { onTime: 0, late: 0, missing: 0, unavailable: 0 };
    for (const row of report.filingPattern.rows)
      result[filingStatus(row[key])]++;
    return result;
  };
  return {
    periods: report.filingPattern.rows.length,
    gstr1: count('gstr1'),
    gstr3b: count('gstr3b'),
  };
}
export function reportSections(report: SyntheticReport) {
  const counts = filingCounts(report);
  const identity =
    report.observations.find((item) => item.title.includes('Name')) ??
    report.observations[0];
  const courtRecords = report.publicRecords.filter(
    (record) => record.category !== 'registry',
  );
  const registryRecords = report.publicRecords.filter(
    (record) => record.category === 'registry',
  );
  const filingLabel: SyntheticLabel =
    counts.gstr1.late +
      counts.gstr3b.late +
      counts.gstr1.missing +
      counts.gstr3b.missing >
    0
      ? 'FLAG'
      : counts.gstr1.unavailable + counts.gstr3b.unavailable > 0 ||
          counts.periods === 0
        ? 'NOTE'
        : 'CLEAR';
  return {
    identity,
    counts,
    courtRecords,
    registryRecords,
    filingLabel,
    registrationLabel: (report.business.registrationStatus.startsWith('Active')
      ? 'CLEAR'
      : 'NOTE') as SyntheticLabel,
    courtLabel: (courtRecords.some((record) => record.signal === 'FLAG')
      ? 'FLAG'
      : 'NOTE') as SyntheticLabel,
    courtDetail: courtRecords.length
      ? `${courtRecords.length} fictional court candidates. Attribution is shown separately for each record; a candidate is not a finding of wrongdoing.`
      : 'No court candidates are supplied by this fixture. Live court coverage was not checked.',
  };
}
export function fixtureMatchGrade(
  record: SyntheticReport['publicRecords'][number],
) {
  if (record.partySide === 'not-applicable') return 'Different entity';
  if (record.partySide === 'alias-party') return 'Alias only';
  return 'Exact name candidate';
}

export function nextCheck(report: SyntheticReport) {
  const sections = reportSections(report);
  if (sections.identity.label === 'FLAG')
    return 'Compare the legal name and aliases with original entity documents before attributing any similar-name record.';
  if (sections.courtRecords.length)
    return 'Review original party details and case documents to resolve candidate identity and current case status.';
  if (sections.filingLabel === 'FLAG')
    return 'Ask for return acknowledgements for the late or explicitly unfiled periods and confirm the latest filing position.';
  if (sections.filingLabel === 'NOTE')
    return 'Obtain the unavailable return periods and confirm the registration details from original documents.';
  return 'Confirm the entity details and latest return acknowledgements from original documents.';
}
