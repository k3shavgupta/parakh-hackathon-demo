import { describe, expect, it } from 'vitest';
import { buildSyntheticReport, SCENARIOS } from '../lib/synthetic-engine';
import {
  filingCounts,
  reportSections,
  fixtureMatchGrade,
} from '../lib/report-layout';

describe('report evidence presentation', () => {
  it('does not count registry rows as court records or zero records as clearance', () => {
    const clear = reportSections(buildSyntheticReport('SYN-GSTIN-CLEAR-001'));
    expect(clear.courtRecords).toHaveLength(0);
    expect(clear.registryRecords).toHaveLength(1);
    expect(clear.courtLabel).toBe('NOTE');
    expect(
      reportSections(buildSyntheticReport('SYN-GSTIN-COURT-004')).courtRecords,
    ).toHaveLength(2);
  });
  it('does not label a known different entity as a strong name match', () => {
    const report = buildSyntheticReport('SYN-GSTIN-MISMATCH-003');
    expect(fixtureMatchGrade(report.publicRecords[1])).toBe('Different entity');
    expect(fixtureMatchGrade(report.publicRecords[0])).toBe('Alias only');
  });
  it('counts individual returns independently and preserves confirmed missing versus unavailable', () => {
    expect(filingCounts(buildSyntheticReport('SYN-GSTIN-DELAY-002'))).toEqual({
      periods: 5,
      gstr1: { onTime: 2, late: 3, missing: 0, unavailable: 0 },
      gstr3b: { onTime: 2, late: 2, missing: 1, unavailable: 0 },
    });
    expect(
      reportSections(buildSyntheticReport('SYN-GSTIN-PARTIAL-005')).filingLabel,
    ).toBe('NOTE');
  });
  it('carries fictional subject and complete record metadata into every report', () => {
    for (const scenario of SCENARIOS) {
      const report = buildSyntheticReport(scenario.identifier);
      expect(report.business.personName).toMatch(/Demo/);
      expect(report.business.syntheticAddress).toMatch(/Fictional/);
      expect(report.business.registeredDate).toMatch(/2026/);
      for (const record of report.publicRecords) {
        expect(record.caseReference).toMatch(/^DEMO-(CASE|RECORD)-\d{4}$/);
        expect(record.matchedEntity).toBeTruthy();
        expect(record.identityEvidence).toBeTruthy();
        expect(record.filedYear).toMatch(/^20\d\d$/);
      }
    }
  });
});
