import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const evidenceLab = readFileSync(
  new URL('../app/synthetic-data/page.tsx', import.meta.url),
  'utf8',
);

describe('Evidence Lab pipeline copy', () => {
  it('documents the fixture to AI reasoning pipeline and synthetic boundary', () => {
    expect(evidenceLab).toContain('fixture');
    expect(evidenceLab).toContain('adapter');
    expect(evidenceLab).toContain('engine');
    expect(evidenceLab).toContain('AI reasoning');
    expect(evidenceLab).toContain('report schema');
    expect(evidenceLab).toContain('renderer');
    expect(evidenceLab).toContain('synthetic data only');
    expect(evidenceLab).toContain('does not access live government systems');
  });

  it('renders interactive fixture inspection cards, JSON panels, and labels', () => {
    expect(evidenceLab).toContain('Fixture -> adapter -> engine -> report schema -> renderer');
    expect(evidenceLab).toContain('Local fixture JSON');
    expect(evidenceLab).toContain('Copy JSON');
    expect(evidenceLab).toContain('Normalized input');
    expect(evidenceLab).toContain('Derived report fields');
    expect(evidenceLab).toContain('Why these labels');
    expect(evidenceLab).toContain('Unavailable data');
    expect(evidenceLab).toContain('DEMO-2026-000');
  });
});
