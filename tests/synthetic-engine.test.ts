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
    expect(isAllowedSyntheticIdentifier('DEMO-2026-0001')).toBe(true);
    expect(isAllowedSyntheticIdentifier('DEMO-2026-0005')).toBe(true);
    expect(isAllowedSyntheticIdentifier('DEMO-2026-0006')).toBe(false);
    expect(isAllowedSyntheticIdentifier('27ABCDE1234F1Z5')).toBe(false);
    expect(isAllowedSyntheticIdentifier('ABCDE1234F')).toBe(false);
    expect(isAllowedSyntheticIdentifier('1234 5678 9012')).toBe(false);
  });

  it('generates a delayed-filing report with explainable allowed labels only', () => {
    const report = buildSyntheticReport('DEMO-2026-0002');

    expect(report.business.legalName).toBe(
      'Parakh Demo Entity Navkaar Metro Components Private Limited',
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
    expect(report.reportId).toBe('PRK-DEMO-2026-0002');
    expect(report.engine.source).toBe('local-synthetic-fixtures');
    expect(report.engine.identity.normalizedLegalName).toBe(
      'PARAKH DEMO ENTITY NAVKAAR METRO COMPONENTS PRIVATE LIMITED',
    );
  });

  it('attaches V4-style court resolution to the fictional court-signal scenario', () => {
    const report = buildSyntheticReport('DEMO-2026-0004');

    expect(report.engine.court.reportable).toHaveLength(2);
    expect(
      report.engine.court.reportable.map((item) => item.matchGrade),
    ).toEqual(['STRONG', 'STRONG']);
  });

  it('returns a partial-data report without inventing a verdict', () => {
    const report = buildSyntheticReport('DEMO-2026-0005');

    expect(report.reportId).toMatch(/^PRK-DEMO-/);
    expect(report.summary).toContain('limited synthetic evidence');
    expect('overallVerdict' in report).toBe(false);
    expect(report.observations.some((item) => item.label === 'NOTE')).toBe(
      true,
    );
  });

  it('exposes five scenario fixtures for instant judge testing', () => {
    expect(SCENARIOS).toHaveLength(5);
    expect(SCENARIOS.map((scenario) => scenario.identifier)).toEqual([
      'DEMO-2026-0001',
      'DEMO-2026-0002',
      'DEMO-2026-0003',
      'DEMO-2026-0004',
      'DEMO-2026-0005',
    ]);
  });
});
