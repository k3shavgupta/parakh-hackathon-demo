import { describe, expect, it } from 'vitest';
import {
  SCENARIOS,
  buildSyntheticReport,
  getSyntheticScenario,
  isAllowedSyntheticIdentifier,
  resolveSyntheticSearch,
} from '../lib/synthetic-engine';

describe('synthetic v4 report engine', () => {
  it('rejects identifiers that are not clearly synthetic', () => {
    expect(isAllowedSyntheticIdentifier('SYN-GSTIN-CLEAR-001')).toBe(true);
    expect(isAllowedSyntheticIdentifier('27ABCDE1234F1Z5')).toBe(false);
    expect(isAllowedSyntheticIdentifier('ABCDE1234F')).toBe(false);
    expect(isAllowedSyntheticIdentifier('1234 5678 9012')).toBe(false);
  });

  it('generates a delayed-filing report with explainable allowed labels only', () => {
    const report = buildSyntheticReport('SYN-GSTIN-DELAY-002');

    expect(report.business.legalName).toBe(
      'Navkaar Moonloom Demo Components Private Limited',
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

  it('resolves legal names, aliases, and small search typos to known fixtures', () => {
    expect(resolveSyntheticSearch('DEMO-2026-0001')?.identifier).toBe(
      'SYN-GSTIN-CLEAR-001',
    );
    expect(
      resolveSyntheticSearch('Setu Starling Demo Corridors Private Limited')
        ?.identifier,
    ).toBe('SYN-GSTIN-COURT-004');
    expect(resolveSyntheticSearch('Navkar Moonloom Demo')?.identifier).toBe(
      'SYN-GSTIN-DELAY-002',
    );
    expect(resolveSyntheticSearch('Dakshin Papercloud Demo Traders')?.identifier).toBe(
      'SYN-GSTIN-MISMATCH-003',
    );
    expect(resolveSyntheticSearch('Prism Meadowglas Demo Tools')?.identifier).toBe(
      'SYN-GSTIN-PARTIAL-005',
    );
  });

  it('generates a report when the homepage demo reference is used directly', () => {
    const report = buildSyntheticReport('DEMO-2026-0001');

    expect(report.searchedIdentifier).toBe('SYN-GSTIN-CLEAR-001');
    expect(report.reportId).toMatch(/^PRK-SYN-CLEAR-001$/);
  });

  it('does not resolve unrelated or real-looking search input', () => {
    expect(resolveSyntheticSearch('')).toBeNull();
    expect(resolveSyntheticSearch('Unknown Demo Industries')).toBeNull();
    expect(resolveSyntheticSearch('27ABCDE1234F1Z5')).toBeNull();
    expect(resolveSyntheticSearch('Metro')).toBeNull();
    expect(resolveSyntheticSearch('Ltd')).toBeNull();
  });

  it('exposes unmistakably synthetic public-record metadata for AI prompts', () => {
    const scenario = getSyntheticScenario('SYN-GSTIN-COURT-004');
    expect(scenario?.publicRecords).toHaveLength(2);
    expect(scenario?.publicRecords[0]).toMatchObject({
      caseReference: 'DEMO-CASE-0014',
      courtName: 'Synthetic Civil Court, Demo Division',
      partySide: 'named-party',
      matchBasis: 'Exact synthetic legal-name match',
    });
  });

  it('includes an explicit similar-name different-entity fixture for non-attribution demos', () => {
    const scenario = getSyntheticScenario('SYN-GSTIN-MISMATCH-003');
    expect(scenario?.publicRecords).toContainEqual(
      expect.objectContaining({
        id: 'SYN-REG-MISMATCH-028',
        partySide: 'not-applicable',
        matchBasis: 'Similar words only; different synthetic legal entity',
      }),
    );
  });
});
