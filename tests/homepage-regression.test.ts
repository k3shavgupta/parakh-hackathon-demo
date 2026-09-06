import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const homepage = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

describe('homepage regression copy', () => {
  it('keeps the standalone prototype footer copy without the production sentence', () => {
    expect(homepage).toContain('Standalone Build What Moves India prototype.');
    expect(homepage).not.toMatch(/Production parakh\.biz is\s+unchanged\./);
  });

  it('uses the live homepage composition and the supplied Parakh wordmark', () => {
    expect(homepage).toContain('<DemoProductHeader />');
    expect(homepage).toContain('One GSTIN.<br />The <em>whole record</em>.');
    expect(homepage).toContain('DEMO-2026-0002');
    expect(homepage).toContain('Synthetic report preview');
    expect(homepage).toContain('resolveSyntheticSearch');
  });

  it('features the new Round 2 AI Attribution Reasoning section with factors and visual confidence', () => {
    expect(homepage).toContain('Round 2 capability · AI Attribution Reasoning');
    expect(homepage).toContain('Every attribution shows its');
    expect(homepage).toContain('What it does');
    expect(homepage).toContain('Why it matters');
    expect(homepage).toContain('What you see');
    expect(homepage).toContain('Name similarity:');
    expect(homepage).toContain('PAN pattern:');
    expect(homepage).toContain('Filing overlap:');
    expect(homepage).toContain('Confidence High');
    expect(homepage).toContain('SPECIMEN PREVIEW');
    expect(homepage).toContain('AI attribution reasoning with factors & confidence gauge');
  });

  it('keeps synthetic disclosure and production boundary messaging intact', () => {
    expect(homepage).toContain('This hackathon demo uses synthetic data only.');
    expect(homepage).toContain('Honest about what is');
    expect(homepage).toContain('Head to parakh.biz');
  });
});
