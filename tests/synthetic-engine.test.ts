import { describe, expect, it } from 'vitest';
import {
  SCENARIOS,
  buildSyntheticReport,
  isAllowedSyntheticIdentifier,
} from '../lib/synthetic-engine';
import {
  buildSyntheticV4Evidence,
  normalizeBusinessName,
} from '../lib/v4-synthetic-adapter';

describe('synthetic v4 report engine', () => {
  it('adapts V4-style identity and court resolution from local fixture data', () => {
    const evidence = buildSyntheticV4Evidence(
      'DEMO-2026-0004',
      {
        legalName: 'Setu Freight Corridors Private Limited',
        tradeName: 'Setu Freight',
        nameVariants: ['Setu Freight Corridors Pvt Ltd'],
      },
      [
        {
          id: 'DEMO-COURT-004-A',
          category: 'supplier-dispute',
          date: '2026-07-16',
          parties: ['Riverview Packaging Demo LLP', 'Setu Freight Corridors Private Limited'],
          signal: 'FLAG',
          summary: 'Synthetic commercial recovery dispute example.',
          source: 'Local synthetic fixture',
          confidence: 'High',
        },
        {
          id: 'DEMO-COURT-004-B',
          category: 'civil',
          date: '2026-07-18',
          parties: ['Unrelated Demo Works Limited'],
          signal: 'NOTE',
          summary: 'Synthetic unrelated name result retained as a non-match.',
          source: 'Local synthetic fixture',
          confidence: 'Low',
        },
      ],
    );

    expect(normalizeBusinessName('Setu Freight Corridors Pvt. Ltd.')).toBe(
      'SETU FREIGHT CORRIDORS PRIVATE LIMITED',
    );
    expect(evidence.source).toBe('local-synthetic-fixtures');
    expect(evidence.identity.normalizedLegalName).toBe(
      'SETU FREIGHT CORRIDORS PRIVATE LIMITED',
    );
    expect(evidence.court.reportable).toHaveLength(1);
    expect(evidence.court.rejected).toHaveLength(1);
    expect(evidence.court.reportable[0]?.matchGrade).toBe('STRONG');
    expect(evidence.court.rejected[0]?.reason).toContain('weak identity');
  });

  it('rejects identifiers that are not clearly synthetic', () => {
    expect(isAllowedSyntheticIdentifier('SYN-GSTIN-CLEAR-001')).toBe(true);
    expect(isAllowedSyntheticIdentifier('27ABCDE1234F1Z5')).toBe(false);
    expect(isAllowedSyntheticIdentifier('ABCDE1234F')).toBe(false);
    expect(isAllowedSyntheticIdentifier('1234 5678 9012')).toBe(false);
  });

  it('generates a delayed-filing report with explainable allowed labels only', () => {
    const report = buildSyntheticReport('SYN-GSTIN-DELAY-002');

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
    expect(report.engine.source).toBe('local-synthetic-fixtures');
    expect(report.engine.identity.normalizedLegalName).toBe(
      'NAVKAAR METRO COMPONENTS PRIVATE LIMITED',
    );
  });

  it('attaches V4-style court resolution to the fictional court-signal scenario', () => {
    const report = buildSyntheticReport('SYN-GSTIN-COURT-004');

    expect(report.engine.court.reportable).toHaveLength(2);
    expect(
      report.engine.court.reportable.map((item) => item.matchGrade),
    ).toEqual(['STRONG', 'STRONG']);
  });

  it('returns a partial-data report without inventing a verdict', () => {
    const report = buildSyntheticReport('SYN-GSTIN-PARTIAL-005');

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
      'SYN-GSTIN-CLEAR-001',
      'SYN-GSTIN-DELAY-002',
      'SYN-GSTIN-MISMATCH-003',
      'SYN-GSTIN-COURT-004',
      'SYN-GSTIN-PARTIAL-005',
    ]);
  });
});
