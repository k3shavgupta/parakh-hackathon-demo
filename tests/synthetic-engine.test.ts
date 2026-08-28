import { describe, expect, it } from 'vitest';
import {
  SCENARIOS,
  buildSyntheticReport,
  isAllowedSyntheticIdentifier,
} from '../lib/synthetic-engine';

describe('synthetic v4 report engine', () => {
  it('rejects identifiers that are not clearly synthetic', () => {
    expect(isAllowedSyntheticIdentifier('SYN-PARAKH-CLEAR-001')).toBe(true);
    expect(isAllowedSyntheticIdentifier('27ABCDE1234F1Z5')).toBe(false);
    expect(isAllowedSyntheticIdentifier('ABCDE1234F')).toBe(false);
    expect(isAllowedSyntheticIdentifier('1234 5678 9012')).toBe(false);
  });

  it('generates a delayed-filing report with explainable allowed labels only', () => {
    const report = buildSyntheticReport('SYN-PARAKH-DELAY-002');

    expect(report.business.legalName).toBe(
      'Navkaar Metro Components Private Limited',
    );
    expect(report.observations.some((item) => item.label === 'FLAG')).toBe(
      true,
    );
    expect(
      report.observations.some(
        (item) => item.title === 'Repeated filing delay pattern',
      ),
    ).toBe(true);
    expect(new Set(report.observations.map((item) => item.label))).toEqual(
      new Set(['FLAG', 'CLEAR', 'NOTE']),
    );
    expect(report.syntheticDisclosure).toContain('synthetic data only');
    expect(report.cannotFind).toContain('Live GST portal confirmation');
  });

  it('returns a partial-data report without inventing a verdict', () => {
    const report = buildSyntheticReport('SYN-PARAKH-PARTIAL-005');

    expect(report.reportId).toMatch(/^PRK-SYN-/);
    expect(report.summary).toContain('limited synthetic evidence');
    expect('overallVerdict' in report).toBe(false);
    expect(report.observations.some((item) => item.label === 'NOTE')).toBe(
      true,
    );
  });

  it('exposes five scenario fixtures for instant judge testing', () => {
    expect(SCENARIOS).toHaveLength(5);
    expect(SCENARIOS.map((scenario) => scenario.identifier)).toEqual([
      'SYN-PARAKH-CLEAR-001',
      'SYN-PARAKH-DELAY-002',
      'SYN-PARAKH-MISMATCH-003',
      'SYN-PARAKH-COURT-004',
      'SYN-PARAKH-PARTIAL-005',
    ]);
  });
});
